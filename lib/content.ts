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
  "28154fba3177d061236df077ddc2b5bb.jpg",
  "3d9ee049570adee9294162068af3231c.jpg",
  "55a40a9f575653805b6023272a68f5a2.jpg",
  "84041ad53096cb4b4be10ab0694717a5.jpg",
  "b183b20cef2492d9cb216770b62cc3c7.jpg",
  "c8bf695468ac459bb21e2e7f95d9ddd4.jpg",
];

export function getSiteBackground(seed: string) {
  const index = [...seed].reduce((total, character) => total + character.charCodeAt(0), 0) % siteBackgrounds.length;
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images-2/${siteBackgrounds[index]}`;
}

export function getRenderedMarkdown(post: Post) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return post.content.replace(/\]\(\.\/images\//g, `](${basePath}/images/posts/${post.slug}/`);
}
