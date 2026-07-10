export enum ERROR_TYPE {
  UNKNOWN,
  BUSY_LOGIN,
  INVALID_PASSWORD,
  INVALID_SQL,
  UNAUTHORIZED,
}

export function ErrorResponse(type: ERROR_TYPE): Response {
  switch (type) {
    case ERROR_TYPE.BUSY_LOGIN:
      return new Response(
        JSON.stringify({
          msg: "Login already exists",
          type: ERROR_TYPE.BUSY_LOGIN,
        }),
        {
          status: 400,
        },
      );
    case ERROR_TYPE.INVALID_PASSWORD:
      return new Response(
        JSON.stringify({
          msg: "Invalid password",
          type: ERROR_TYPE.INVALID_PASSWORD,
        }),
        {
          status: 400,
        },
      );
    case ERROR_TYPE.INVALID_SQL:
      return new Response(
        JSON.stringify({ msg: "Invalid URL", type: ERROR_TYPE.INVALID_SQL }),
        { status: 404 },
      );
    case ERROR_TYPE.UNAUTHORIZED:
      return new Response(
        JSON.stringify({
          msg: "Not authorised",
          type: ERROR_TYPE.UNAUTHORIZED,
        }),
        {
          status: 400,
        },
      );
    default:
      return new Response(
        JSON.stringify({ msg: "Unknown error", type: ERROR_TYPE.UNKNOWN }),
        { status: 400 },
      );
  }
}
