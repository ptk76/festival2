import { prepareSqlQuery } from "./sql";
import { v4 as uuidv4 } from "uuid";
import { ErrorResponse, MESSAGE_TYPE } from "./errors";

type TokenData = {
  id: number;
  date: number;
};
const tokens = new Map<string, TokenData>();
const shares = new Map<string, TokenData>();

function isAuthorisationRequired(url: URL) {
  if (
    url.pathname === "/login" ||
    url.pathname === "/create" ||
    url.pathname === "/share"
  )
    return false;
  return true;
}

function isUserAuthorised(url: URL) {
  const token = url.searchParams.get("token");
  if (!token) return false;
  const tokenData = tokens.get(token);
  if (!tokenData) return false;
  if (Date.now() - tokenData.date > 7 * 24 * 60 * 60 * 1000) return false;
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
    if (isAuthorisationRequired(url) && !isUserAuthorised(url)) {
      return ErrorResponse(MESSAGE_TYPE.UNAUTHORIZED);
    }

    const userId = getUserId(url);

    if (url.pathname.startsWith("/newshare")) {
      const token = url.searchParams.get("token");
      const user = tokens.get(token ?? "");
      if (user) {
        const body = { token: uuidv4() };
        shares.set(body.token, {
          id: user.id,
          date: Date.now(),
        });
        return new Response(JSON.stringify(body), {
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        return ErrorResponse(MESSAGE_TYPE.UNKNOWN);
      }
    }

    if (url.pathname.startsWith("/share")) {
      const token = url.searchParams.get("id");
      url.searchParams.delete("id");
      const user = shares.get(token ?? "");
      if (user && Date.now() - user.date < 7 * 24 * 60 * 60 * 1000)
        url.searchParams.append("id", String(user.id));
      else return ErrorResponse(MESSAGE_TYPE.INVALID_SHARE);
    } else if (userId) {
      url.searchParams.append("id", String(userId));
    }

    const sqlQuery = await prepareSqlQuery(url);

    if (!sqlQuery) return ErrorResponse(MESSAGE_TYPE.INVALID_SQL);

    try {
      const stmt = env.DB.prepare(sqlQuery);
      const { results } = await stmt.all();

      if (request.url.includes("login?")) {
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
        return ErrorResponse(MESSAGE_TYPE.BUSY_LOGIN);
      }
      return ErrorResponse(MESSAGE_TYPE.UNKNOWN);
    }
  },
} satisfies ExportedHandler<Env>;
