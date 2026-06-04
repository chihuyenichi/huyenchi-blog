# HuyenChi-WU

**A personal cybersecurity blog featuring CTF writeups, binary exploitation walkthroughs, and security research notes.**

> **Live site:** [https://chihuyenichi.github.io/huyenchi-blog](https://chihuyenichi.github.io/huyenchi-blog)

Built with Next.js 14 and deployed as a fully static site to GitHub Pages via automated CI/CD — markdown-driven content with zero server dependencies.

---

## Features

- **Markdown-based posts** — Write in plain Markdown with YAML frontmatter; commit and deploy instantly
- **Category & tag organization** — Browse posts by category or filter by tag
- **Client-side full-text search** — Powered by Fuse.js for instant search across titles, tags, and excerpts
- **Syntax-highlighted code blocks** — Using rehype-highlight with a dark theme
- **Responsive dark theme** — GitHub-dark inspired palette, optimized for reading technical content
- **Browser-based admin panel** — Upload posts and images directly through the GitHub Contents API
- **Fully static export** — Deployed to GitHub Pages with no backend or database required

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + `@tailwindcss/typography` |
| Content | Markdown + YAML frontmatter |
| Markdown Rendering | remark, remark-gfm, remark-html |
| Syntax Highlighting | rehype-highlight |
| Search | Fuse.js |
| Deployment | GitHub Pages |
| CI/CD | GitHub Actions |

The static output is written to the `out/` directory.

## Project Structure

```
src/
├── app/             # Next.js App Router pages
│   ├── page.tsx               # Home — post listing
│   ├── [category]/            # Category-filtered posts
│   ├── post/[slug]/           # Individual post page
│   ├── tags/[tag]/            # Tag-filtered posts
│   ├── search/                # Search page
│   ├── about/                 # About page
│   └── admin/                 # Browser-based post editor
├── components/      # Reusable UI components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Sidebar.tsx
│   ├── PostCard.tsx
│   ├── PostBody.tsx
│   └── SearchBar.tsx
└── lib/             # Utility modules
    ├── posts.ts     # Post parsing and querying
    ├── mdx.ts       # Markdown rendering pipeline
    └── constants.ts # Site-wide configuration

posts/               # All blog content (Markdown)
public/images/       # Post images and assets
```

## Writing a Post

1. Create a `.md` file inside `posts/<category>/`
2. Add YAML frontmatter:

```yaml
---
title: "Challenge Name"
date: "2026-01-01"
category: "TryHackMe"
tags: ["PWN", "ROP"]
excerpt: "Short description shown on the homepage."
---
```

3. Place images in `public/images/` and reference them as `![alt](/images/file.png)`
4. Commit and push — the site rebuilds automatically via GitHub Actions

## Deployment

Every push to `main` triggers the [GitHub Actions workflow](.github/workflows/deploy.yml), which:

1. Installs dependencies with `npm ci`
2. Builds the static site with `npm run build`
3. Uploads the `out/` directory as a Pages artifact
4. Deploys to GitHub Pages

## Live Site

[https://chihuyenichi.github.io/huyenchi-blog](https://chihuyenichi.github.io/huyenchi-blog)

## License

This project is for personal use. Posts and content are original work unless otherwise attributed.
