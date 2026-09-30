import Link from "next/link";
import type { Post } from "@/lib/content";
import { displayCategory, getSticker } from "@/lib/stickers";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="post-card">
      <Link className="card-image" data-category={post.category} href={`/writeups/${post.slug}`} aria-label={post.title}>
        <span className="card-image-label">{post.category}</span>
        <img className="card-sticker" src={getSticker(post)} alt="" aria-hidden="true" loading="lazy" />
        <span className="card-image-title">{post.title}</span>
      </Link>
      <div className="post-card-body">
        <p className="eyebrow">{new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(post.date))}</p>
        <p>{post.description}</p>
        <div className="tag-row"><Link href={`/categories/${post.category}`}>{displayCategory(post.category)}</Link>{post.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div>
      </div>
    </article>
  );
}

export function WriteupRow({ post }: { post: Post }) {
  const formattedDate = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(post.date));

  return (
    <article className="writeup-row">
      <Link className="writeup-row-link" href={`/writeups/${post.slug}`}>
        <time className="writeup-row-date" dateTime={post.date}>{formattedDate}</time>
        <span className="writeup-row-main">
          <span className="writeup-row-title">{post.title}</span>
          <span className="writeup-row-description">{post.description}</span>
        </span>
        <span className="writeup-row-labels">
          <span>{displayCategory(post.category)}</span>
          <span>{post.difficulty}</span>
          {post.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}
        </span>
        <span className="writeup-row-arrow" aria-hidden>→</span>
      </Link>
    </article>
  );
}
