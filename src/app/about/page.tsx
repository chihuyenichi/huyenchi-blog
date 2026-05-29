import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <nav className="text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-accent transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-text-secondary">About</span>
      </nav>

      <h1 className="text-3xl font-bold text-text mb-6">About</h1>

      <div className="prose prose-invert max-w-none">
        <p>
          This is a personal blog for publishing CTF writeups and security research notes.
          The content is focused on binary exploitation (PWN), reverse engineering, and
          other cybersecurity topics.
        </p>

        <h2>Skills & Interests</h2>
        <ul>
          <li>Binary Exploitation (PWN)</li>
          <li>Reverse Engineering</li>
          <li>Return-Oriented Programming (ROP)</li>
          <li>CTF Competitions</li>
        </ul>

        <h2>How to Post a Writeup</h2>
        <ol>
          <li>
            <strong>Create a Markdown file</strong> in <code>posts/</code> with frontmatter:
            <pre>{`---
title: "Challenge Name"
date: "2025-01-01"
category: "TryHackMe"
tags: ["PWN", "ROP"]
excerpt: "Short description..."
---`}</pre>
          </li>
          <li>
            <strong>Place images</strong> in <code>public/images/</code> and reference them as
            <code>{' ![alt](/images/your-file.png)'}</code>
          </li>
          <li>
            <strong>Commit and push</strong> to GitHub — the site auto-deploys.
          </li>
        </ol>

        <h2>Links</h2>
        <ul>
          <li>
            <Link href="https://github.com/chihuyenichi" target="_blank" rel="noopener noreferrer">
              GitHub
            </Link>
          </li>
          <li>
            <Link href="https://tryhackme.com" target="_blank" rel="noopener noreferrer">
              TryHackMe
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
