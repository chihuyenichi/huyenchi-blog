import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CopyLinkScript } from "@/components/copy-link";
import { PostCard } from "@/components/post-card";
import { displayCategory, getAllPosts, getPost, getRelatedPosts, getRenderedMarkdown, getSiteBackground } from "@/lib/content";

export async function generateStaticParams() { return getAllPosts().map((post) => ({ slug: post.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  return post ? { title: post.title, description: post.description } : {};
}

export default async function WriteupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const related = getRelatedPosts(post);
  const links = [...(post.sourceUrl ? [{ label: "Challenge", url: post.sourceUrl }] : []), ...(post.quickLinks ?? [])];
  return <article className="writeup"><CopyLinkScript />
    <div className="article-hero site-image-bg" style={{ backgroundImage: `url(${getSiteBackground(post.slug)})` }} aria-hidden="true" />
    <div className="shell article-shell">
      <p className="crumb">Home / Writeups / {post.title}</p>
      <header className="article-header"><div className="tag-row"><Link href={`/categories/${post.category}`}>{displayCategory(post.category)}</Link><span>{post.difficulty}</span></div><h1>{post.title}</h1><p className="dek">{post.description}</p><div className="byline"><time dateTime={post.date}>{new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(post.date))}</time><span>{post.author}</span><span>{post.event}</span></div></header>
      <div className="article-tools">{links.length > 0 && <div><h2>Quick links</h2>{links.map((link) => <a href={link.url} target="_blank" rel="noreferrer" key={`${link.label}-${link.url}`}>{link.label} ↗</a>)}</div>}<div><h2>Share</h2><button type="button" className="copy-link" data-copy-link>Copy link</button></div></div>
      <div className="article-layout"><aside className="article-aside"><p>ON THIS PAGE</p><a href="#writeup">Writeup</a><a href="#labels">Labels</a></aside><div className="prose" id="writeup"><ReactMarkdown remarkPlugins={[remarkGfm]}>{getRenderedMarkdown(post)}</ReactMarkdown></div></div>
      <section className="article-labels" id="labels"><p className="kicker">LABELS</p><div className="tag-row"><Link href={`/categories/${post.category}`}>{displayCategory(post.category)}</Link>{post.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></section>
      {related.length > 0 && <section className="related"><div className="section-heading"><div><p className="kicker">KEEP READING</p><h2>Other writeups of interest</h2></div></div><div className="post-grid">{related.map((item) => <PostCard post={item} key={item.slug} />)}</div></section>}
    </div>
  </article>;
}
