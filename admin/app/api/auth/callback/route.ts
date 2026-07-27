import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSession, sessionName } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url); const code = url.searchParams.get("code"); const state = url.searchParams.get("state");
  const store = await cookies();
  if (!code || !state || state !== store.get("cipher_notes_oauth_state")?.value) return new NextResponse("Invalid OAuth state.", { status: 400 });
  if (!process.env.GITHUB_OAUTH_CLIENT_ID || !process.env.GITHUB_OAUTH_CLIENT_SECRET) return new NextResponse("GitHub OAuth is not configured.", { status: 503 });
  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ client_id: process.env.GITHUB_OAUTH_CLIENT_ID, client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET, code }) });
  const token = (await tokenResponse.json()) as { access_token?: string };
  const userResponse = token.access_token ? await fetch("https://api.github.com/user", { headers: { Authorization: `Bearer ${token.access_token}`, Accept: "application/vnd.github+json" } }) : null;
  const user = userResponse ? (await userResponse.json()) as { login?: string } : {};
  const allowed = (process.env.ADMIN_GITHUB_LOGINS ?? "").split(",").map((item) => item.trim().toLowerCase());
  if (!user.login || !allowed.includes(user.login.toLowerCase())) return new NextResponse("This GitHub account is not an administrator.", { status: 403 });
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(sessionName(), createSession(user.login), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 8 * 60 * 60, path: "/" });
  response.cookies.delete("cipher_notes_oauth_state");
  return response;
}
