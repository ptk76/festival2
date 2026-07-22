export enum TokenType {
  LOGIN = 0,
  SHARE = 1,
}

export type TokenDataType = {
  token: string;
  user_id: number;
  timestamp: number;
  token_type: TokenType;
};

export function isTokenDataType(data: unknown) {
  return (
    data !== null &&
    typeof data === "object" &&
    "token" in data &&
    "userId" in data &&
    "timestamp" in data &&
    "token_type" in data
  );
}

export type LogInType = {
  id: number;
  nick: string;
};

export function isLogInType(data: unknown) {
  return (
    data !== null && typeof data === "object" && "id" in data && "nick" in data
  );
}
