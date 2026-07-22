export enum MESSAGE_TYPE {
  SUCCESS,
  BUSY_LOGIN,
  INVALID_PASSWORD,
  INVALID_SQL,
  UNAUTHORIZED,
  INVALID_SHARE,
  TOKEN_ERROR,
  UNKNOWN,
}

export type ResponseMessage = {
  msg: string;
  type: MESSAGE_TYPE;
};

export function isResponseMessage(msg: unknown) {
  return msg && typeof msg === "object" && "msg" in msg && "type" in msg;
}

export function ErrorResponse(type: MESSAGE_TYPE): Response {
  switch (type) {
    case MESSAGE_TYPE.BUSY_LOGIN:
      return new Response(
        JSON.stringify({
          msg: "The user already exists",
          type: MESSAGE_TYPE.BUSY_LOGIN,
        }),
        {
          status: 400,
        },
      );
    case MESSAGE_TYPE.INVALID_PASSWORD:
      return new Response(
        JSON.stringify({
          msg: "Invalid password",
          type: MESSAGE_TYPE.INVALID_PASSWORD,
        }),
        {
          status: 400,
        },
      );
    case MESSAGE_TYPE.INVALID_SQL:
      return new Response(
        JSON.stringify({ msg: "Invalid URL", type: MESSAGE_TYPE.INVALID_SQL }),
        { status: 404 },
      );
    case MESSAGE_TYPE.UNAUTHORIZED:
      return new Response(
        JSON.stringify({
          msg: "Not authorised",
          type: MESSAGE_TYPE.UNAUTHORIZED,
        }),
        {
          status: 401,
        },
      );
    case MESSAGE_TYPE.INVALID_SHARE:
      return new Response(
        JSON.stringify({
          msg: "This share link is invalid",
          type: MESSAGE_TYPE.INVALID_SHARE,
        }),
        {
          status: 401,
        },
      );
    default:
      return new Response(
        JSON.stringify({ msg: "Unknown error", type: MESSAGE_TYPE.UNKNOWN }),
        { status: 400 },
      );
  }
}
