import { getAllPosts } from '@/lib/posts'
import PostCard from '@/components/PostCard'
import Sidebar from '@/components/Sidebar'

export default function Home() {
  const posts = getAllPosts()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <section className="mb-10">
        <h1 className="text-3xl font-bold text-text mb-2">~/writeups</h1>
        <p className="text-text-secondary">CTF writeups and security research notes.</p>
      </section>

      <div className="flex gap-8">
        <div className="flex-1 space-y-4">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
          {posts.length === 0 && (
            <p className="text-text-muted text-center py-12">No posts yet.</p>
          )}
        </div>
        <aside className="hidden lg:block w-72 shrink-0">
          <Sidebar />
        </aside>
      </div>
    </div>
  )
}
