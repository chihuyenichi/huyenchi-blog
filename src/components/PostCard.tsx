import Link from 'next/link'
import { PostMeta } from '@/lib/posts'

export default function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="border border-border rounded-lg p-5 bg-surface hover:border-accent/40 transition-colors">
      <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
        <span>{post.date}</span>
        <span>·</span>
        <Link
          href={`/${post.category.toLowerCase().replace(/\s+/g, '-')}`}
          className="text-accent hover:text-accent-hover"
        >
          {post.category}
        </Link>
      </div>
      <Link href={`/post/${encodeURIComponent(post.slug)}`}>
        <h2 className="text-lg font-semibold text-text hover:text-accent transition-colors mb-2">
          {post.title}
        </h2>
      </Link>
      <p className="text-sm text-text-secondary leading-relaxed mb-3 line-clamp-2">
        {post.excerpt}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {post.tags.map((tag) => (
          <Link
            key={tag}
            href={`/tags/${tag.toLowerCase()}`}
            className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          >
            {tag}
          </Link>
        ))}
      </div>
    </article>
  )
}
