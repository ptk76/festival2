function getNumber(params: URLSearchParams, name: string) {
  if (params.has(name)) {
    const int = parseFloat(params.get(name)!);
    if (!isNaN(int)) return int;
  }
  return undefined;
}

function users(params: URLSearchParams) {
  const cmd = params.get("cmd");
  if (cmd === "del") {
    const id = getNumber(params, "id");
    if (id === undefined) return null;
    return `DELETE FROM users WHERE users.id = ${id};`;
  }
  if (cmd === "upd") {
    const id = getNumber(params, "id");
    const password = getNumber(params, "id");
    if (id === undefined || password == undefined) return null;
    return `UPDATE users SET password=${password} WHERE id = ${id};`;
  }

  if (cmd === "add") {
    const login = params.get("login");
    const password = params.get("password");
    const nick = params.get("nick");
    if (login === undefined || password === undefined || nick === undefined)
      return null;
    return `INSERT INTO users (login, passwoard, nick) VALUES ("${login}", "${password}", "${nick}")`;
  }

  return `SELECT * FROM users`;
}

function votes(params: URLSearchParams) {
  return `SELECT * FROM votes`;
}

export function prepareSqlQuery(urlStr: string) {
  const url = new URL(urlStr);
  if (url.pathname.startsWith("/users")) return users(url.searchParams);
  if (url.pathname.startsWith("/votes")) return votes(url.searchParams);
  return null;
}
