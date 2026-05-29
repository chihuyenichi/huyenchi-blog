import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import PostCard from '@/components/PostCard'
import Sidebar from '@/components/Sidebar'

export async function generateStaticParams() {
  const posts = getAllPosts()
  const tags = new Set(posts.flatMap((p) => p.tags.map((t) => t.toLowerCase())))
  return Array.from(tags).map((tag) => ({ tag }))
}

export default function TagPage({ params }: { params: { tag: string } }) {
  const posts = getAllPosts()
  const filteredPosts = posts.filter((p) =>
    p.tags.some((t) => t.toLowerCase() === params.tag.toLowerCase())
  )

  if (filteredPosts.length === 0) notFound()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-accent transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/" className="hover:text-accent transition-colors">Tags</Link>
        <span className="mx-2">/</span>
        <span className="text-text-secondary">{params.tag}</span>
      </nav>

      <h1 className="text-2xl font-bold text-text mb-2">Tag: #{params.tag}</h1>
      <p className="text-text-secondary text-sm mb-8">{filteredPosts.length} post(s)</p>

      <div className="flex gap-8">
        <div className="flex-1 space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
        <aside className="hidden lg:block w-72 shrink-0">
          <Sidebar />
        </aside>
      </div>
    </div>
  )
}
