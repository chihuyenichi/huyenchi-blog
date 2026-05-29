import Link from 'next/link'
import { getCategories, getTags, getRecentPosts } from '@/lib/posts'

export default function Sidebar() {
  const categories = getCategories()
  const tags = getTags()
  const recentPosts = getRecentPosts(5)

  return (
    <aside className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-text mb-3 uppercase tracking-wider">Categories</h3>
        <ul className="space-y-1.5">
          {categories.map((cat) => (
            <li key={cat.name}>
              <Link
                href={`/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center justify-between text-sm text-text-secondary hover:text-accent transition-colors"
              >
                <span>{cat.name}</span>
                <span className="text-xs text-text-muted">({cat.count})</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text mb-3 uppercase tracking-wider">Tags</h3>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Link
              key={tag.name}
              href={`/tags/${tag.name.toLowerCase()}`}
              className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
            >
              {tag.name} ({tag.count})
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-text mb-3 uppercase tracking-wider">Recent Posts</h3>
        <ul className="space-y-2">
          {recentPosts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/post/${post.slug}`}
                className="text-sm text-text-secondary hover:text-accent transition-colors line-clamp-1"
              >
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
