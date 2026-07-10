import { prepareSqlQuery } from "./sql";
import { v4 as uuidv4 } from "uuid";
import { ErrorResponse, ERROR_TYPE } from "./errors";

type TokenData = {
  id: number;
  date: number;
};
const tokens = new Map<string, TokenData>();

function isAuthorisationRequired(url: URL) {
  console.log("URL", url.pathname);
  if (url.pathname === "/login" || url.pathname === "/create") return false;
  console.log("AUTHO REQ");
  return true;
}

function isUserAuthorised(url: URL) {
  const token = url.searchParams.get("token");
  if (!token) return false;
  const tokenData = tokens.get(token);
  if (!tokenData) return false;
  if (Date.now() - tokenData.date > 60 * 60 * 1000) return false;
  return true;
}

function getUserId(url: URL) {
  const token = url.searchParams.get("token");
  if (!token) return null;
  const tokenData = tokens.get(token);
  if (!tokenData) return null;
  return tokenData.id;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    console.log("START");
    if (isAuthorisationRequired(url) && !isUserAuthorised(url)) {
      return ErrorResponse(ERROR_TYPE.UNAUTHORIZED);
    }

    const userId = getUserId(url);
    if (userId) url.searchParams.append("id", String(userId));
    const sqlQuery = await prepareSqlQuery(url);
    console.log("QUERY", sqlQuery);

    if (!sqlQuery) return ErrorResponse(ERROR_TYPE.INVALID_SQL);

    try {
      const stmt = env.DB.prepare(sqlQuery);
      const { results } = await stmt.all();

      if (request.url.includes("login?")) {
        console.log("LOG RESULT", results.length);
        const body =
          results.length === 1
            ? { nick: results[0].nick, token: uuidv4() }
            : { nick: null, token: null };
        if (body.token && results.length === 1) {
          tokens.set(body.token, {
            id: results[0].id as number,
            date: Date.now(),
          });
        }
        console.log("TOKESN", tokens);
        return new Response(JSON.stringify(body), {
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      return new Response(JSON.stringify(results), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error.message.includes("UNIQUE constraint failed: users.login")
      ) {
        console.log("ERROR", error.message);
        return ErrorResponse(ERROR_TYPE.BUSY_LOGIN);
      }
      return ErrorResponse(ERROR_TYPE.UNKNOWN);
    }
  },
} satisfies ExportedHandler<Env>;
