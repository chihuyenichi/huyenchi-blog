import Link from "next/link";
import type { Post } from "@/lib/content";
import { displayCategory, getImageUrl } from "@/lib/content";

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="post-card">
      <Link className="card-image" href={`/writeups/${post.slug}`} aria-label={post.title}>
        {post.coverImage ? <img src={getImageUrl(post, post.coverImage)} alt="" /> : <span className="card-image-fallback">{post.category}</span>}
      </Link>
      <div className="post-card-body">
        <p className="eyebrow">{new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(post.date))}</p>
        <h2><Link href={`/writeups/${post.slug}`}>{post.title}</Link></h2>
        <p>{post.description}</p>
        <div className="tag-row"><Link href={`/categories/${post.category}`}>{displayCategory(post.category)}</Link>{post.tags.slice(0, 2).map((tag) => <span key={tag}>{tag}</span>)}</div>
      </div>
    </article>
  );
}
