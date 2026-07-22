export function getNumber(params: URLSearchParams, name: string) {
  if (params.has(name)) {
    const int = parseFloat(params.get(name)!);
    if (!isNaN(int)) return int;
  }
  return undefined;
}

export async function setTokenData(
  db: D1Database,
  token: string,
  user_id: number,
  timestamp: number,
  token_type: number,
) {
  try {
    const sqlQuery = `INSERT INTO tokens (token, user_id, timestamp, token_type) VALUES ("${token}", ${user_id}, ${timestamp}, ${token_type})`;
    const stmt = db.prepare(sqlQuery);
    await stmt.all();
  } catch (error) {
    console.warn("SET TOKEN ERROR", error);
  }
}
