'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Fuse from 'fuse.js'
import { PostMeta } from '@/lib/posts'

interface Props {
  posts: PostMeta[]
}

export default function SearchBar({ posts }: Props) {
  const [query, setQuery] = useState('')

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        keys: ['title', 'excerpt', 'tags', 'category'],
        threshold: 0.4,
      }),
    [posts]
  )

  const results = query ? fuse.search(query).map((r) => r.item) : posts

  return (
    <div>
      <input
        type="text"
        placeholder="Search posts..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-text placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
        autoFocus
      />
      <div className="mt-6 space-y-3">
        {results.map((post) => (
          <Link key={post.slug} href={`/post/${post.slug}`}>
            <article className="border border-border rounded-lg p-4 bg-surface hover:border-accent/40 transition-colors">
              <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
                <span>{post.date}</span>
                <span>·</span>
                <span className="text-accent">{post.category}</span>
              </div>
              <h3 className="text-text font-medium mb-1">{post.title}</h3>
              <p className="text-sm text-text-secondary line-clamp-1">{post.excerpt}</p>
            </article>
          </Link>
        ))}
        {query && results.length === 0 && (
          <p className="text-text-muted text-center py-8">No posts found for &quot;{query}&quot;</p>
        )}
      </div>
    </div>
  )
}
