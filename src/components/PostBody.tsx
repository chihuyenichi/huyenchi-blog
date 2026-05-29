'use client'

import { useEffect, useState } from 'react'
import { renderMarkdown } from '@/lib/mdx'

export default function PostBody({ content }: { content: string }) {
  const [html, setHtml] = useState('')

  useEffect(() => {
    renderMarkdown(content).then(setHtml)
  }, [content])

  return (
    <div
      className="prose prose-invert max-w-none prose-pre:relative prose-code:before:content-none prose-code:after:content-none"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
