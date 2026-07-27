import Link from "next/link";
import type { Post } from "@/lib/content";
import { displayCategory, getSiteBackground } from "@/lib/content";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="post-card">
      <Link className="card-image site-image-bg" href={`/writeups/${post.slug}`} aria-label={post.title} style={{ backgroundImage: `url(${getSiteBackground(post.slug)})` }}>
        <span className="card-image-label">{post.category}</span>
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
