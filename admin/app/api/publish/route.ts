import matter from "gray-matter";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSession, sessionName } from "@/lib/auth";

export const runtime = "nodejs";

const categories = new Set(["web", "crypto", "pwn", "reverse", "forensics", "osint", "misc", "blockchain", "hardware", "ai-ml"]);
const difficulties = new Set(["easy", "medium", "hard", "insane"]);
const imageTypes = new Set(["image/png", "image/jpeg", "image/gif", "image/webp", "image/svg+xml"]);
const safeName = (value: string) => value.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/^\.+/, "");
const failure = (error: string, status = 400) => NextResponse.json({ error }, { status });

type Metadata = { title: string; slug: string; date: string; description: string; category: string; event: string; year: string; difficulty: string; author: string; tags: string[]; sourceUrl?: string };

export async function POST(request: Request) {
  if (!getSession((await cookies()).get(sessionName())?.value)) return failure("Unauthorized.", 401);
  const owner = process.env.GITHUB_OWNER; const repo = process.env.GITHUB_REPO; const token = process.env.GITHUB_TOKEN; const branch = process.env.GITHUB_BRANCH ?? "main";
  if (!owner || !repo || !token) return failure("GitHub publishing variables are not configured.", 503);
  const form = await request.formData(); const markdown = form.get("markdown"); const raw = form.get("metadata");
  if (!(markdown instanceof File) || typeof raw !== "string") return failure("Markdown and metadata are required.");
  let metadata: Metadata; try { metadata = JSON.parse(raw); } catch { return failure("Invalid metadata."); }
  if (![metadata.title, metadata.slug, metadata.date, metadata.description, metadata.category, metadata.event, metadata.year, metadata.difficulty, metadata.author].every((item) => String(item).trim()) || !metadata.tags?.length) return failure("Complete all required metadata.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.slug) || !categories.has(metadata.category) || !difficulties.has(metadata.difficulty)) return failure("Invalid slug, category, or difficulty.");
  const assets = form.getAll("assets").filter((item): item is File => item instanceof File);
  if (markdown.size > 2_000_000 || assets.some((file) => !imageTypes.has(file.type) || file.size > 8_000_000 || !safeName(file.name))) return failure("Invalid upload. Markdown max: 2 MB; images max: 8 MB.");
  const api = `https://api.github.com/repos/${owner}/${repo}`;
  const headers = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json" };
  const base = `content/posts/${metadata.slug}`;
  const existing = await fetch(`${api}/contents/${base}/index.md?ref=${encodeURIComponent(branch)}`, { headers });
  if (existing.ok) return failure("That slug already exists.", 409);
  if (existing.status !== 404) return failure("Could not verify the target repository.", 502);
  const imageNames = assets.map((asset) => safeName(asset.name));
  const original = matter(await markdown.text()).content.trimEnd();
  const gallery = imageNames.length && !original.includes("./images/") ? `\n\n## Uploaded evidence\n\n${imageNames.map((name) => `![${name}](./images/${name})`).join("\n\n")}` : "";
  const document = matter.stringify(`${original}${gallery}\n`, { title: metadata.title, slug: metadata.slug, date: metadata.date, description: metadata.description, category: metadata.category, event: metadata.event, year: Number(metadata.year), difficulty: metadata.difficulty, author: metadata.author, tags: metadata.tags, status: "published", ...(imageNames[0] ? { coverImage: `./images/${imageNames[0]}` } : {}), ...(metadata.sourceUrl ? { sourceUrl: metadata.sourceUrl } : {}) });
  const files: Array<{ path: string; bytes: Uint8Array }> = [{ path: `${base}/index.md`, bytes: new TextEncoder().encode(document) }];
  for (const asset of assets) { const bytes = new Uint8Array(await asset.arrayBuffer()); const name = safeName(asset.name); files.push({ path: `${base}/images/${name}`, bytes }, { path: `public/images/posts/${metadata.slug}/${name}`, bytes }); }
  const ref = await fetch(`${api}/git/ref/heads/${encodeURIComponent(branch)}`, { headers }); if (!ref.ok) return failure("Could not read the target branch.", 502);
  const parent = ((await ref.json()) as { object: { sha: string } }).object.sha;
  const parentCommit = await fetch(`${api}/git/commits/${parent}`, { headers }); if (!parentCommit.ok) return failure("Could not read the branch tree.", 502);
  const baseTree = ((await parentCommit.json()) as { tree: { sha: string } }).tree.sha;
  const tree = [];
  for (const file of files) { const blob = await fetch(`${api}/git/blobs`, { method: "POST", headers, body: JSON.stringify({ content: Buffer.from(file.bytes).toString("base64"), encoding: "base64" }) }); if (!blob.ok) return failure("GitHub rejected an uploaded file.", 502); tree.push({ path: file.path, mode: "100644", type: "blob", sha: ((await blob.json()) as { sha: string }).sha }); }
  const treeResponse = await fetch(`${api}/git/trees`, { method: "POST", headers, body: JSON.stringify({ base_tree: baseTree, tree }) }); if (!treeResponse.ok) return failure("GitHub could not create the content tree.", 502);
  const treeSha = ((await treeResponse.json()) as { sha: string }).sha;
  const commitResponse = await fetch(`${api}/git/commits`, { method: "POST", headers, body: JSON.stringify({ message: `content: publish ${metadata.slug}`, tree: treeSha, parents: [parent] }) }); if (!commitResponse.ok) return failure("GitHub could not create the commit.", 502);
  const commit = ((await commitResponse.json()) as { sha: string }).sha;
  const update = await fetch(`${api}/git/refs/heads/${encodeURIComponent(branch)}`, { method: "PATCH", headers, body: JSON.stringify({ sha: commit, force: false }) });
  return update.ok ? NextResponse.json({ commit }) : failure("The branch changed; refresh and publish again.", 409);
}
