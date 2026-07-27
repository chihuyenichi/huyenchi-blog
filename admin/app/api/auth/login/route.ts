import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!process.env.GITHUB_OAUTH_CLIENT_ID) return new NextResponse("GitHub OAuth is not configured.", { status: 503 });
  const state = randomBytes(24).toString("base64url");
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", process.env.GITHUB_OAUTH_CLIENT_ID);
  url.searchParams.set("redirect_uri", new URL("/api/auth/callback", request.url).toString());
  url.searchParams.set("scope", "read:user"); url.searchParams.set("state", state);
  const response = NextResponse.redirect(url);
  response.cookies.set("cipher_notes_oauth_state", state, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 600, path: "/" });
  return response;
}
