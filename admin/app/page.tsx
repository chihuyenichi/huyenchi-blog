import Link from "next/link";
import { cookies } from "next/headers";
import { UploadWorkspace } from "@/components/upload-workspace";
import { getSession, sessionName } from "@/lib/auth";

export default async function AdminPage() {
  const session = getSession((await cookies()).get(sessionName())?.value);
  if (!session) return <main className="shell page"><p className="crumb">Cipher Notes / Admin</p><p className="kicker">RESTRICTED AREA</p><h1>Sign in to publish.</h1><p className="intro">Only GitHub accounts on the administrator allowlist can upload CTF writeups.</p><Link className="button" href="/api/auth/login">Continue with GitHub →</Link></main>;
  return <main className="shell page"><p className="crumb">Cipher Notes / Admin / {session.login}</p><p className="kicker">PUBLISH WORKSPACE</p><h1>Stage a new writeup.</h1><p className="intro">Upload a Markdown folder and its images, inspect the rendered writeup, then publish one commit to the public repository.</p><UploadWorkspace /></main>;
}
