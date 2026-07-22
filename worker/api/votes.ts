import { TokenType } from "../db-types";
import { getNumber, setTokenData } from "../utils";
import { v4 as uuidv4 } from "uuid";

export async function votes(db: D1Database, url: URL) {
  const token = url.searchParams.get("token");
  if (!token) return null;

  const sqlQuery = `SELECT v.band, v.score
FROM votes v
JOIN tokens t ON v.user_id = t.user_id
WHERE t.token = "${token}" AND t.token_type = ${TokenType.LOGIN} AND (${Date.now()} - t.timestamp ) < (7 * 24 * 60 * 60 * 1000);`;

  try {
    const stmt = db.prepare(sqlQuery);
    const { results } = await stmt.all();
    return results;
  } catch (error) {
    console.warn("VOTES ERROR:", error);
  }

  return null;
}

export async function setVote(db: D1Database, url: URL) {
  const token = url.searchParams.get("token");
  const band = url.searchParams.get("band");
  const score = getNumber(url.searchParams, "score");
  if (!token || !band || score === undefined) return;

  let sqlQuery = "";
  if (score === 2)
    sqlQuery = `
      DELETE FROM votes
      WHERE band="${band}" AND 
      user_id = (
        SELECT user_id 
        FROM tokens 
        WHERE token = "${token}" AND (${Date.now()} - tokens.timestamp ) < (7 * 24 * 60 * 60 * 1000)
      );
    `;
  else
    sqlQuery = `
      INSERT INTO votes (band, score, user_id) 
      SELECT "${band}", ${score}, user_id
      FROM tokens
      WHERE token = "${token}" AND (${Date.now()} - tokens.timestamp ) < (7 * 24 * 60 * 60 * 1000)  
      ON CONFLICT(band, user_id)
      DO UPDATE SET score = ${score}
    `;

  try {
    const stmt = db.prepare(sqlQuery);
    await stmt.all();
  } catch (error) {
    console.warn("SET VOTES ERROR:", error);
  }
  return [];
}

export async function shareVotes(db: D1Database, url: URL) {
  const token = url.searchParams.get("token");
  if (!token) return null;

  const sqlQuery = `SELECT user_id FROM tokens WHERE token = "${token}";`;

  try {
    const stmt = db.prepare(sqlQuery);
    const { results } = await stmt.all();

    if (!(results.length === 1 && typeof results[0].user_id === "number"))
      return null;

    const shareToken = uuidv4();
    await setTokenData(
      db,
      shareToken,
      Number(results[0].user_id),
      Number(Date.now()),
      Number(TokenType.SHARE),
    );
    return shareToken;
  } catch (error) {
    console.warn("SHARE VOTES ERROR:", error);
  }

  return null;
}

export async function sharedVotes(db: D1Database, url: URL) {
  const token = url.searchParams.get("token");
  if (!token) return null;

  const sqlQuery = `SELECT v.band, v.score
FROM votes v
JOIN tokens t ON v.user_id = t.user_id
WHERE t.token = "${token}" AND t.token_type = ${TokenType.SHARE} AND (${Date.now()} - t.timestamp ) < (7 * 24 * 60 * 60 * 1000);`;

  try {
    const stmt = db.prepare(sqlQuery);
    const { results } = await stmt.all();
    return results;
  } catch (error) {
    console.warn("SHARED VOTES ERROR:", error);
  }

  return null;
}
