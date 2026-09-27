import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { getPost } from "@/lib/content";

const publicDirectory = path.join(process.cwd(), "public");

function getMarkdownResources() {
  if (!fs.existsSync(publicDirectory)) return [];

  return fs.readdirSync(publicDirectory, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isDirectory()) return [];
    const directory = path.join(publicDirectory, entry.name);
    return fs.readdirSync(directory, { withFileTypes: true })
      .filter((file) => file.isFile() && file.name.endsWith(".md"))
      .map((file) => ({ slug: entry.name, resource: file.name.slice(0, -3) }));
  });
}

function readMarkdownResource(slug: string, resource: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !/^[a-z0-9][a-z0-9_-]*$/.test(resource)) return null;
  const source = path.join(publicDirectory, slug, `${resource}.md`);
  return fs.existsSync(source) ? fs.readFileSync(source, "utf8") : null;
}

function getDocumentTitle(markdown: string, resource: string) {
  return markdown.match(/^#\s+(.+)$/m)?.[1] ?? resource.replaceAll("-", " ");
}

function renderResourceMarkdown(markdown: string, slug: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return markdown
    .replace(/\]\(\/(?!\/)/g, `](${basePath}/`)
    .replace(/\]\(\.\//g, `](${basePath}/${slug}/`);
}

export function generateStaticParams() {
  return getMarkdownResources();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; resource: string }>;
}): Promise<Metadata> {
  const { slug, resource } = await params;
  const markdown = readMarkdownResource(slug, resource);
  return markdown ? { title: getDocumentTitle(markdown, resource) } : {};
}

export default async function MarkdownResourcePage({
  params,
}: {
  params: Promise<{ slug: string; resource: string }>;
}) {
  const { slug, resource } = await params;
  const markdown = readMarkdownResource(slug, resource);
  const post = getPost(slug);
  if (!markdown || !post) notFound();

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const rawUrl = `${basePath}/${slug}/${resource}.md`;
  const documentTitle = getDocumentTitle(markdown, resource);

  return (
    <article className="resource-document">
      <div className="shell article-shell">
        <p className="crumb">
          <Link href="/">Home</Link> / <Link href="/writeups">Writeups</Link> /{" "}
          <Link href={`/writeups/${slug}`}>{post.title}</Link> / {documentTitle}
        </p>
        <header className="resource-document-header">
          <p className="kicker">MARKDOWN DOCUMENT</p>
          <div>
            <Link href={`/writeups/${slug}`}>← Quay lại bài giải</Link>
            <a href={rawUrl} download>Markdown gốc ↓</a>
          </div>
        </header>
        <main className="prose resource-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
            {renderResourceMarkdown(markdown, slug)}
          </ReactMarkdown>
        </main>
      </div>
    </article>
  );
}
