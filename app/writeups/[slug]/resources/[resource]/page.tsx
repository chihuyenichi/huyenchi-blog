import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { codeToHtml } from "shiki";
import { CopyCodeButton } from "@/components/copy-code";
import { getPost } from "@/lib/content";
import { getAllRenderableResources, getRenderableResource } from "@/lib/resources";

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
  return getAllRenderableResources();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; resource: string }>;
}): Promise<Metadata> {
  const { slug, resource } = await params;
  const file = getRenderableResource(slug, resource);
  if (!file) return {};
  return { title: file.kind === "markdown" ? getDocumentTitle(file.content, resource) : file.fileName };
}

export default async function MarkdownResourcePage({
  params,
}: {
  params: Promise<{ slug: string; resource: string }>;
}) {
  const { slug, resource } = await params;
  const file = getRenderableResource(slug, resource);
  const post = getPost(slug);
  if (!file || !post) notFound();

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const rawUrl = `${basePath}/${slug}/${file.fileName}`;
  const documentTitle = file.kind === "markdown" ? getDocumentTitle(file.content, resource) : file.fileName;
  const highlightedCode = file.kind === "code"
    ? await codeToHtml(file.content, { lang: file.language, theme: "github-dark" })
    : null;

  return (
    <article className="resource-document">
      <div className="shell article-shell">
        <p className="crumb">
          <Link href="/">Home</Link> / <Link href="/writeups">Writeups</Link> /{" "}
          <Link href={`/writeups/${slug}`}>{post.title}</Link> / {documentTitle}
        </p>
        <header className="resource-document-header">
          <p className="kicker">{file.kind === "markdown" ? "MARKDOWN DOCUMENT" : `${file.label} SOURCE CODE`}</p>
          <div>
            <Link href={`/writeups/${slug}`}>← Quay lại bài giải</Link>
            {file.kind === "code" && <CopyCodeButton />}
            <a href={rawUrl} download>{file.kind === "markdown" ? "Markdown gốc" : "Tải source"} ↓</a>
          </div>
        </header>
        {file.kind === "markdown" ? (
          <main className="prose resource-prose">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
              {renderResourceMarkdown(file.content, slug)}
            </ReactMarkdown>
          </main>
        ) : (
          <main className="source-code-viewer">
            <div className="source-code-toolbar">
              <strong>{file.fileName}</strong>
              <span>{file.label} · UTF-8</span>
            </div>
            <div
              className="source-code-frame"
              data-source-code
              dangerouslySetInnerHTML={{ __html: highlightedCode ?? "" }}
            />
          </main>
        )}
      </div>
    </article>
  );
}
