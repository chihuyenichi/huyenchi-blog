import { createHmac, timingSafeEqual } from "node:crypto";

const name = "cipher_notes_admin";
export const sessionName = () => name;

export function createSession(login: string) {
  const payload = Buffer.from(JSON.stringify({ login, expires: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url");
  return `${payload}.${createHmac("sha256", process.env.ADMIN_SESSION_SECRET ?? "").update(payload).digest("base64url")}`;
}

export function getSession(value?: string) {
  if (!value || !process.env.ADMIN_SESSION_SECRET) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = createHmac("sha256", process.env.ADMIN_SESSION_SECRET).update(payload).digest("base64url");
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { login: string; expires: number };
    const allowed = (process.env.ADMIN_GITHUB_LOGINS ?? "").split(",").map((item) => item.trim().toLowerCase());
    return data.expires > Date.now() && allowed.includes(data.login.toLowerCase()) ? data : null;
  } catch { return null; }
}
