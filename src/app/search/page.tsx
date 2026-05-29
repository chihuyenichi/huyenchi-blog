import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import SearchBar from '@/components/SearchBar'

export default function SearchPage() {
  const posts = getAllPosts()

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <nav className="text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-accent transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-text-secondary">Search</span>
      </nav>

      <h1 className="text-2xl font-bold text-text mb-6">Search Posts</h1>

      <SearchBar posts={posts} />
    </div>
  )
}
