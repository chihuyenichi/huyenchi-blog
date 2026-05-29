import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllPosts, getCategories } from '@/lib/posts'
import PostCard from '@/components/PostCard'
import Sidebar from '@/components/Sidebar'

export async function generateStaticParams() {
  const categories = getCategories()
  return categories.map((cat) => ({
    category: cat.name.toLowerCase().replace(/\s+/g, '-'),
  }))
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const posts = getAllPosts()
  const categoryName = posts.find(
    (p) => p.category.toLowerCase().replace(/\s+/g, '-') === params.category
  )?.category

  if (!categoryName) notFound()

  const filteredPosts = posts.filter(
    (p) => p.category.toLowerCase().replace(/\s+/g, '-') === params.category
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-accent transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-text-secondary">{categoryName}</span>
      </nav>

      <h1 className="text-2xl font-bold text-text mb-8">{categoryName}</h1>

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
