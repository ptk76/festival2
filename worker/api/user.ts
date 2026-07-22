import { isLogInType, LogInType, TokenType } from "../db-types";
import { v4 as uuidv4 } from "uuid";
import { setTokenData } from "../utils";

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

export async function loginUser(
  db: D1Database,
  url: URL,
): Promise<{ nick: string; token: string } | null> {
  const login = url.searchParams.get("login");
  const password = url.searchParams.get("password");
  if (!login || !password) return null;

  const sqlQuery = `SELECT id, nick FROM users WHERE login = "${login}" AND password = "${await hashPassword(password)}"`;

  try {
    const stmt = db.prepare(sqlQuery);
    const { results } = await stmt.all();

    if (!isLogInType(results[0])) return null;
    const result = results[0] as LogInType;
    const body = { nick: result.nick, token: uuidv4() };

    await setTokenData(
      db,
      body.token,
      Number(results[0].id),
      Number(Date.now()),
      Number(TokenType.LOGIN),
    );

    return body;
  } catch (error) {
    console.warn("LOGIN ERROR:", error);
  }

  return null;
}

export async function createUser(db: D1Database, url: URL) {
  const login = url.searchParams.get("login");
  const password = url.searchParams.get("password");
  const nick = url.searchParams.get("nick");
  if (!login || !password || !nick) return null;

  const sqlQuery = `INSERT INTO users (login, password, nick) VALUES ("${login}", "${await hashPassword(password)}", "${nick}")`;

  try {
    const stmt = db.prepare(sqlQuery);
    await stmt.all();
    return true;
  } catch (error) {
    console.warn("CREATE ERROR:", error);
  }

  return false;
}

export async function isAuthorized(db: D1Database, url: URL) {
  const token = url.searchParams.get("token");
  if (!token) return false;

  const sqlQuery = `SELECT user_id FROM tokens WHERE token = "${token}" AND token_type = ${TokenType.LOGIN}`;

  try {
    const stmt = db.prepare(sqlQuery);
    const { results } = await stmt.all();

    if (results.length === 1 && typeof results[0].user_id === "number")
      return true;
  } catch (error) {
    console.warn("AUTORIZATION ERROR:", error);
  }

  return false;
}

export async function getNick(db: D1Database, url: URL) {
  const token = url.searchParams.get("token");
  if (!token) return null;

  const sqlQuery = `
SELECT u.nick
FROM users u
JOIN tokens t ON u.id = t.user_id
WHERE t.token = "${token}" 
  `;

  try {
    const stmt = db.prepare(sqlQuery);
    const { results } = await stmt.all();
    if (results.length === 1) return results;
  } catch (error) {
    console.warn("AUTORIZATION ERROR:", error);
  }

  return null;
}
