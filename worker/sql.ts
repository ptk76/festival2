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
    // convert password to a hash
    const password = params.get("password");
    const nick = params.get("nick");
    if (login === undefined || password === undefined || nick === undefined)
      return null;
    return `INSERT INTO users (login, password, nick) VALUES ("${login}", "${password}", "${nick}") RETURNING id`;
  }

  return `SELECT * FROM users`;
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

async function login(params: URLSearchParams) {
  const user = params.get("login");
  const password = params.get("password");
  if (!user || !password) return null;

  return `SELECT id, nick FROM users WHERE login = "${user}" AND password = "${await hashPassword(password)}"`;
}

async function create(params: URLSearchParams) {
  const nick = params.get("nick");
  const user = params.get("login");
  const password = params.get("password");
  if (!nick || !user || !password) return null;

  return `INSERT INTO users (nick, login, password) VALUES ("${nick}", "${user}", "${await hashPassword(password)}")`;
}

function votes(params: URLSearchParams) {
  const userId = getNumber(params, "id");
  const cmd = params.get("cmd");
  if (cmd === "add") {
    const band = params.get("band");
    const score = getNumber(params, "score");
    if (band === undefined || score === undefined || userId === undefined)
      return null;
    if (score === 2)
      return `DELETE FROM votes WHERE band="${band}" AND user_id=${userId};`;

    return `INSERT INTO votes (band, score, user_id) VALUES ("${band}", ${score}, ${userId}) ON CONFLICT(band, user_id) DO UPDATE SET score=${score}`;
  }
  if (userId === undefined) return null;

  return `SELECT band, score FROM votes WHERE user_id=${userId}`;
}

export async function prepareSqlQuery(url: URL) {
  console.log(url.searchParams);
  if (url.pathname.startsWith("/login")) return await login(url.searchParams);
  if (url.pathname.startsWith("/create")) return await create(url.searchParams);
  if (url.pathname.startsWith("/users")) return users(url.searchParams);
  if (url.pathname.startsWith("/votes")) return votes(url.searchParams);
  return null;
}
