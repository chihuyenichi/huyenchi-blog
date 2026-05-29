'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

export default function AdminPage() {
  const [token, setToken] = useState('')
  const [mdFile, setMdFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [category, setCategory] = useState('tryhackme')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const imgRef = useRef<HTMLInputElement>(null)

  const handlePublish = async () => {
    if (!token) { setStatus('Enter a GitHub token'); return }
    if (!mdFile) { setStatus('Select a .md file'); return }

    setLoading(true)
    setStatus('Reading markdown file...')

    const mdContent = await mdFile.text()

    const slug = mdFile.name.replace(/\.md$/i, '').toLowerCase().replace(/\s+/g, '-')
    const mdPath = `posts/${category}/${slug}.md`

    try {
      const owner = 'chihuyenichi'
      const repo = 'huyenchi-blog'

      const headers = {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      }

      const sha = await getFileSha(owner, repo, mdPath, headers)

      setStatus('Committing markdown file...')

      let mdPayload: Record<string, unknown> = {
        message: `add: ${slug}`,
        content: btoa(unescape(encodeURIComponent(mdContent))),
        branch: 'main',
      }
      if (sha) mdPayload.sha = sha

      const mdRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${mdPath}`,
        { method: 'PUT', headers, body: JSON.stringify(mdPayload) }
      )

      if (!mdRes.ok) {
        const err = await mdRes.json()
        setStatus(`Error committing markdown: ${err.message}`)
        setLoading(false)
        return
      }

      for (const img of imageFiles) {
        setStatus(`Uploading ${img.name}...`)
        const imgPath = `public/images/${img.name}`
        const imgSha = await getFileSha(owner, repo, imgPath, headers)
        const imgBuffer = await img.arrayBuffer()
        const imgBase64 = arrayBufferToBase64(imgBuffer)

        let imgPayload: Record<string, unknown> = {
          message: `add: ${img.name}`,
          content: imgBase64,
          branch: 'main',
        }
        if (imgSha) imgPayload.sha = imgSha

        const imgRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/${imgPath}`,
          { method: 'PUT', headers, body: JSON.stringify(imgPayload) }
        )

        if (!imgRes.ok) {
          const err = await imgRes.json()
          setStatus(`Error uploading ${img.name}: ${err.message}`)
          setLoading(false)
          return
        }
      }

      setStatus(`Published! Site will auto-deploy in ~1-2 min.`)
      setMdFile(null)
      setImageFiles([])
      if (imgRef.current) imgRef.current.value = ''
    } catch (e: unknown) {
      setStatus(`Error: ${e instanceof Error ? e.message : 'unknown error'}`)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <nav className="text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-accent transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-text-secondary">DaoHuyenChi</span>
      </nav>

      <h1 className="text-2xl font-bold text-text mb-6">Admin — Publish Writeup</h1>

      <div className="space-y-5">
        <div>
          <label className="block text-sm text-text-secondary mb-1">GitHub Token</label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_..."
            className="w-full px-4 py-2 bg-surface border border-border rounded text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
          <p className="text-xs text-text-muted mt-1">
            PAT with <code>repo</code> scope. Generate at GitHub Settings → Developer settings → Personal access tokens.
          </p>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Category</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="tryhackme"
            className="w-full px-4 py-2 bg-surface border border-border rounded text-text placeholder:text-text-muted focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Markdown File (.md)</label>
          <input
            type="file"
            accept=".md"
            onChange={(e) => setMdFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-text file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-accent file:text-bg file:text-sm file:font-medium hover:file:bg-accent-hover"
          />
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1">Images (optional)</label>
          <input
            ref={imgRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
            className="w-full text-sm text-text file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-accent file:text-bg file:text-sm file:font-medium hover:file:bg-accent-hover"
          />
        </div>

        <button
          onClick={handlePublish}
          disabled={loading}
          className="px-6 py-2 bg-accent text-bg rounded font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
        >
          {loading ? 'Publishing...' : 'Publish'}
        </button>

        {status && (
          <div className="p-4 border border-border rounded bg-surface text-sm text-text-secondary whitespace-pre-wrap">
            {status}
          </div>
        )}
      </div>
    </div>
  )
}

async function getFileSha(
  owner: string, repo: string, path: string, headers: Record<string, string>
): Promise<string | null> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    { headers }
  )
  if (res.status === 200) {
    const data = await res.json()
    return data.sha
  }
  return null
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
