import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostBySlug, getAllPosts, getAdjacentPosts } from '@/lib/posts'
import PostBody from '@/components/PostBody'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const { prev, next } = getAdjacentPosts(params.slug)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <nav className="text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-accent transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <Link
          href={`/${post.category.toLowerCase().replace(/\s+/g, '-')}`}
          className="hover:text-accent transition-colors"
        >
          {post.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text-secondary">{post.title}</span>
      </nav>

      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-3">{post.title}</h1>
          <div className="flex items-center gap-3 text-sm text-text-muted">
            <span>{post.date}</span>
            <span>·</span>
            <Link
              href={`/${post.category.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-accent hover:text-accent-hover"
            >
              {post.category}
            </Link>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
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
        </header>

        <PostBody content={post.content} />
      </article>

      <nav className="flex items-center justify-between mt-12 pt-8 border-t border-border">
        {prev ? (
          <Link href={`/post/${encodeURIComponent(prev.slug)}`} className="group max-w-[45%]">
            <span className="text-xs text-text-muted">← Previous</span>
            <p className="text-sm text-text-secondary group-hover:text-accent transition-colors line-clamp-1">{prev.title}</p>
          </Link>
        ) : <div />}
        {next ? (
          <Link href={`/post/${encodeURIComponent(next.slug)}`} className="group max-w-[45%] text-right">
            <span className="text-xs text-text-muted">Next →</span>
            <p className="text-sm text-text-secondary group-hover:text-accent transition-colors line-clamp-1">{next.title}</p>
          </Link>
        ) : <div />}
      </nav>
    </div>
  )
}
