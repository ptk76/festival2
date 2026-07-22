import { ErrorResponse, MESSAGE_TYPE } from "./errors";

import { loginUser, createUser, isAuthorized, getNick } from "./api/user";
import { setVote, sharedVotes, shareVotes, votes } from "./api/votes";

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    // No Authorisation Required

    if (url.pathname.startsWith("/login")) {
      const body = await loginUser(env.DB, url);
      if (body === null) return ErrorResponse(MESSAGE_TYPE.UNAUTHORIZED);
      return new Response(JSON.stringify(body), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (url.pathname.startsWith("/create")) {
      const result = await createUser(env.DB, url);
      if (!result) return ErrorResponse(MESSAGE_TYPE.BUSY_LOGIN);
      return new Response(JSON.stringify({}), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (url.pathname.startsWith("/share")) {
      const result = await sharedVotes(env.DB, url);
      if (!result) return ErrorResponse(MESSAGE_TYPE.INVALID_SHARE);
      return new Response(JSON.stringify(result), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (url.pathname.startsWith("/nick")) {
      const result = await getNick(env.DB, url);
      if (!result) return ErrorResponse(MESSAGE_TYPE.INVALID_SHARE);
      return new Response(JSON.stringify(result), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Authorisation Required
    if (!(await isAuthorized(env.DB, url)))
      return ErrorResponse(MESSAGE_TYPE.UNAUTHORIZED);

    if (url.pathname.startsWith("/votes")) {
      const result = await votes(env.DB, url);
      if (!result) return ErrorResponse(MESSAGE_TYPE.UNAUTHORIZED);
      return new Response(JSON.stringify(result), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (url.pathname.startsWith("/setvote")) {
      const result = await setVote(env.DB, url);
      if (!result) return ErrorResponse(MESSAGE_TYPE.UNAUTHORIZED);
      return new Response(JSON.stringify(result), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (url.pathname.startsWith("/newshare")) {
      const shareToken = await shareVotes(env.DB, url);
      if (!shareToken) return ErrorResponse(MESSAGE_TYPE.TOKEN_ERROR);

      const body = { token: shareToken };
      return new Response(JSON.stringify(body), {
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // if (!sqlQuery) return ErrorResponse(MESSAGE_TYPE.INVALID_SQL);
  },
} satisfies ExportedHandler<Env>;
