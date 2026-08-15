import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content", "posts");

export const categories = ["web", "crypto", "pwn", "reverse", "forensics", "osint", "misc", "blockchain", "hardware", "ai-ml"] as const;
export type Category = (typeof categories)[number];

export type QuickLink = { label: string; url: string };
export type Post = {
  slug: string;
  title: string;
  date: string;
  description: string;
  category: Category;
  event: string;
  year: number;
  difficulty: "easy" | "medium" | "hard" | "insane";
  author: string;
  tags: string[];
  status: "draft" | "published";
  coverImage?: string;
  sourceUrl?: string;
  quickLinks?: QuickLink[];
  content: string;
};

function readPost(slug: string): Post | null {
  const source = path.join(postsDirectory, slug, "index.md");
  if (!fs.existsSync(source)) return null;
  const parsed = matter(fs.readFileSync(source, "utf8"));
  const data = parsed.data as Omit<Post, "content">;
  return { ...data, slug, tags: data.tags ?? [], quickLinks: data.quickLinks ?? [], content: parsed.content };
}

export function getAllPosts(includeDrafts = false): Post[] {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => readPost(entry.name))
    .filter((post): post is Post => post !== null && (includeDrafts || post.status === "published"))
    .sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf());
}

export function getPost(slug: string): Post | null {
  const post = readPost(slug);
  return post?.status === "published" ? post : null;
}

export function displayCategory(category: string) {
  return category === "ai-ml" ? "AI / ML" : category.toUpperCase();
}

export function getRelatedPosts(post: Post) {
  return getAllPosts().filter((item) => item.slug !== post.slug && (item.category === post.category || item.event === post.event || item.tags.some((tag) => post.tags.includes(tag)))).slice(0, 3);
}

export function getImageUrl(post: Post, image?: string) {
  if (!image) return undefined;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return image.startsWith("./images/") ? `${basePath}/images/posts/${post.slug}/${image.slice("./images/".length)}` : image;
}

const siteBackgrounds = [
  "0e94da5ee293a34f573cbe1ce46ce524.jpg",
  "242c731e1f4e7c4962f6c027593cc311.jpg",
  "816dfcb5351715765bb4d8a8d8836196.jpg",
  "db57438697d6e2cf9b1ce37d6917962a.jpg",
  "f4a540fcfe18d227a075f6287c56be06.jpg",
];

export function getSiteBackground(seed: string) {
  const index = [...seed].reduce((total, character) => total + character.charCodeAt(0), 0) % siteBackgrounds.length;
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images-2/${siteBackgrounds[index]}`;
}

export function getRenderedMarkdown(post: Post) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return post.content
    .replace(/\]\(\.\/images\//g, `](${basePath}/images/posts/${post.slug}/`)
    .replace(/\]\(\/(?!\/)/g, `](${basePath}/`)
    .replace(/^(\[[^\]]+\]:\s*)\/(?!\/)/gm, `$1${basePath}/`);
}
