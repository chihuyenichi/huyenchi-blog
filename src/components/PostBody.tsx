'use client'

import { useEffect, useState } from 'react'
import { renderMarkdown } from '@/lib/mdx'

export default function PostBody({ content }: { content: string }) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    renderMarkdown(content).then((h) => {
      const base = process.env.NODE_ENV === 'production' ? '/huyenchi-blog' : ''
      h = h.replace(/<img src="\/(?!\/)/g, `<img src="${base}/`)
      setHtml(h)
    })
  }, [content])

  return (
    <div
      className="prose prose-invert max-w-none prose-pre:relative prose-code:before:content-none prose-code:after:content-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
