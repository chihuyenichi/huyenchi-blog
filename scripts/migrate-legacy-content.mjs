import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const sourceRoot = process.argv[2];
if (!sourceRoot) throw new Error("Usage: node scripts/migrate-legacy-content.mjs <legacy-repository-path>");

const root = process.cwd();
const entries = [
  { file: "posts/THEM-CTF-2026/pwn/solution.md", slug: "them-ctf-2026-warm-up", category: "pwn", event: "THEM CTF 2026", difficulty: "easy", imageDir: "public/images/them-ctf-2026/warm-up" },
  { file: "posts/tryhackme/pwn109.md", slug: "tryhackme-pwn109", category: "pwn", event: "TryHackMe", difficulty: "medium", imageDir: "public/images/PWN101-pwn09" },
  { file: "posts/tryhackme/return-oriented-programming.md", slug: "return-oriented-programming", category: "pwn", event: "TryHackMe", difficulty: "easy", imageDir: "public/images/return-oriented-programming-materials" },
  { file: "posts/PWN/cpp-exception-unwinding-exploitation.md", slug: "cpp-exception-unwinding-exploitation", category: "pwn", event: "Research Notes", difficulty: "hard" },
];

for (const entry of entries) {
  const raw = await fs.readFile(path.join(sourceRoot, entry.file), "utf8");
  const parsed = matter(raw);
  const images = entry.imageDir ? await fs.readdir(path.join(sourceRoot, entry.imageDir)) : [];
  const content = parsed.content.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").replace(/]\(\/images\/[^)\/]+(?:\/[^)\/]+)*\/([^)/]+)\)/g, "](./images/$1)");
  const target = path.join(root, "content", "posts", entry.slug);
  const staticTarget = path.join(root, "public", "images", "posts", entry.slug);
  await fs.mkdir(path.join(target, "images"), { recursive: true });
  await fs.mkdir(staticTarget, { recursive: true });
  if (entry.imageDir) {
    for (const image of images) {
      await fs.copyFile(path.join(sourceRoot, entry.imageDir, image), path.join(target, "images", image));
      await fs.copyFile(path.join(sourceRoot, entry.imageDir, image), path.join(staticTarget, image));
    }
  }
  const frontmatter = {
    title: parsed.data.title,
    slug: entry.slug,
    date: new Date(parsed.data.date).toISOString().slice(0, 10),
    description: parsed.data.description ?? parsed.data.excerpt,
    category: entry.category,
    event: entry.event,
    year: new Date(parsed.data.date).getUTCFullYear(),
    difficulty: entry.difficulty,
    author: "Huyen Chi",
    tags: parsed.data.tags ?? [],
    status: "published",
    ...(images[0] ? { coverImage: `./images/${images[0]}` } : {}),
  };
  await fs.writeFile(path.join(target, "index.md"), matter.stringify(content.trimStart(), frontmatter));
  console.log(`Migrated ${entry.slug}`);
}
