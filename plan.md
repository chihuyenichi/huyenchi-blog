# 📋 Blog Website Plan

> Inspired by \[phamcongit.wordpress.com](https://phamcongit.wordpress.com/) — a technical/security blog with categorized posts, tags, and markdown-based content.

\---

## 1\. 🗂️ Project Overview

|Item|Detail|
|-|-|
|**Type**|Static Site (JAMstack)|
|**Tech Stack**|Next.js + Tailwind CSS + MDX|
|**Hosting**|Vercel (free tier)|
|**Content**|Markdown/MDX files in `/posts` folder (like GitHub README)|
|**Repo**|GitHub (source of truth for posts)|

\---

## 2\. 🏗️ Site Structure

```
my-blog/
├── posts/                        ← ✍️ YOUR POSTS LIVE HERE (Markdown)
│   ├── ctf/
│   │   ├── secathon-2018.md
│   │   └── easy-ctf-2018.md
│   ├── reversing/
│   │   └── challenge-1-easy-crack.md
│   └── writeups/
│       └── bsides-sf-ctf.md
│
├── public/                       ← Images, favicon, avatar
│   └── images/
│
├── src/
│   ├── app/                      ← Next.js App Router
│   │   ├── page.tsx              ← Home (post list)
│   │   ├── \[category]/
│   │   │   └── page.tsx          ← Category page
│   │   ├── post/\[slug]/
│   │   │   └── page.tsx          ← Single post page
│   │   ├── tags/\[tag]/
│   │   │   └── page.tsx          ← Tag filter page
│   │   ├── about/
│   │   │   └── page.tsx          ← About me
│   │   └── search/
│   │       └── page.tsx          ← Search page
│   │
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx           ← Categories + Tags + Recent posts
│   │   ├── PostCard.tsx          ← Post preview card
│   │   ├── PostBody.tsx          ← Rendered markdown content
│   │   ├── Pagination.tsx
│   │   └── SearchBar.tsx
│   │
│   └── lib/
│       ├── posts.ts              ← Read \& parse markdown files
│       └── mdx.ts                ← MDX rendering config
│
├── tailwind.config.js
├── next.config.js
└── package.json
```

\---

## 3\. 📄 Pages \& Features

### 3.1 Home Page (`/`)

* Hero section with blog name + short description
* List of **latest posts** (paginated, 5–10 per page)
* Each post card shows: title, date, category, tags, short excerpt
* Sidebar: Categories tree, Tag cloud, Recent posts

### 3.2 Category Page (`/ctf`, `/reversing`, etc.)

* All posts filtered by category
* Same sidebar as Home
* Breadcrumb: Home > CTF

### 3.3 Single Post Page (`/post/\[slug]`)

* Full post rendered from Markdown (with syntax highlighting)
* Post metadata: title, date, author, category, tags
* Images support (inline in markdown)
* **Previous / Next post** navigation
* Comment section (via [giscus](https://giscus.app/) — GitHub Discussions, free)
* Copy-code button on code blocks

### 3.4 Tag Page (`/tags/\[tag]`)

* All posts with a specific tag (e.g. `RE`, `CTF`, `PWN`)

### 3.5 About Page (`/about`)

* Author info, avatar, skills, links (GitHub, LinkedIn, etc.)
* Written in Markdown too

### 3.6 Search Page (`/search`)

* Client-side search with [Fuse.js](https://fusejs.io/) (no server needed)
* Search by title, tags, content excerpt

\---

## 4\. ✍️ How to Write \& Publish a Post

This is the key workflow — **no CMS needed**, just like GitHub README.

### Step 1: Create a new `.md` file

```
posts/ctf/my-new-writeup.md
```

### Step 2: Add frontmatter at the top

```markdown
---
title: "SECATHON 2018 – DecryptFile"
date: "2024-01-15"
category: "CTF"
tags: \["CTF", "RE", "Forensics"]
excerpt: "A short description shown on the post list..."
---

## Introduction

Your \*\*markdown\*\* content goes here, same as GitHub README.

## Solution

```python
# Python code with syntax highlighting
key = \[0x4a, 0x46, 0x70]
flag = ''.join(chr(b ^ 0x10) for b in key)
print(flag)
```

## Result

Flag: `L1NUX`

```

### Step 3: Commit \& push to GitHub
```bash
git add posts/ctf/my-new-writeup.md
git commit -m "add: SECATHON 2018 writeup"
git push
```

### Step 4: Vercel auto-deploys

Vercel detects the push → builds → live in \~1 minute. Done ✅

\---

## 5\. 🎨 Design \& UI

|Element|Choice|
|-|-|
|**Theme**|Dark mode default (like security blogs)|
|**Font**|`JetBrains Mono` (code) + `Inter` or `Geist` (body)|
|**Colors**|Dark background `#0d1117`, accent `#58a6ff` (GitHub dark palette)|
|**Code highlight**|[Shiki](https://shiki.matsu.io/) or `rehype-pretty-code`|
|**Markdown images**|Rendered inline, click to zoom|
|**Mobile**|Fully responsive|

### Key UI Components

* **Header**: Logo/blog name + nav links (Home, Categories, Tags, About, Search)
* **Sidebar** (desktop only):

  * Categories with post count
  * Tag cloud
  * Recent posts (last 5)
* **Footer**: Copyright, GitHub link, RSS feed link
* **Post body**: Prose-styled markdown, wide code blocks, image captions

\---

## 6\. 📦 Dependencies

```json
{
  "next": "^14",
  "react": "^18",
  "tailwindcss": "^3",
  "@tailwindcss/typography": "^0.5",
  "next-mdx-remote": "^4",
  "gray-matter": "^4",          
  "rehype-pretty-code": "^0.13", 
  "remark-gfm": "^4",           
  "fuse.js": "^7",              
  "date-fns": "^3"              
}
```

\---

## 7\. 🚀 Deployment

### Option A: Vercel (Recommended — Free)

1. Push code to GitHub
2. Connect repo on [vercel.com](https://vercel.com)
3. Vercel auto-detects Next.js, sets up CI/CD
4. Every `git push` = automatic deploy

### Option B: GitHub Pages (Free, static only)

1. Use `next export` to generate static HTML
2. Deploy via `gh-pages` branch or GitHub Actions

### Custom Domain (Optional)

* Buy a domain (e.g. `yourblog.dev` \~$10/year)
* Point DNS to Vercel
* Free HTTPS auto-configured

\---

## 8\. 🔧 Extra Features (Nice to Have)

|Feature|How|
|-|-|
|**RSS Feed**|Generate `/rss.xml` from posts at build time|
|**Sitemap**|`next-sitemap` package|
|**Reading time**|`reading-time` npm package|
|**OG images**|`@vercel/og` for social share previews|
|**Dark/Light toggle**|`next-themes`|
|**View counter**|[Supabase](https://supabase.com) free tier|
|**Comments**|[Giscus](https://giscus.app/) (GitHub Discussions)|

\---

## 9\. 📅 Build Timeline

|Phase|Tasks|Est. Time|
|-|-|-|
|**Phase 1**|Setup Next.js, Tailwind, MDX pipeline|1–2 days|
|**Phase 2**|Build core pages (Home, Post, Category)|2–3 days|
|**Phase 3**|Build Sidebar, Pagination, Search|1–2 days|
|**Phase 4**|Design polish (dark theme, typography, code highlight)|1–2 days|
|**Phase 5**|Deploy to Vercel + migrate old posts|1 day|
|**Total**||\~1–2 weeks|

\---

## 10\. 📁 Sample Post File

`posts/reversing/challenge-1-easy-crack.md`

```markdown
---
title: "Challenge 1 – Easy\_Crack"
date: "2017-06-01"
category: "Reversing.kr"
tags: \["RE"]
excerpt: "Solve the Easy\_CrackMe challenge from reversing.kr using IDA Pro."
---

## Overview

Download: http://reversing.kr/download.php?n=1

Goal: Find the correct password.

## Analysis

Using IDA Pro to decompile the binary...

!\[screenshot](/images/easy-crack-1.png)

## Solution

```python
flag = "Ea5yR3versing"
print(flag)
```

Flag: `Ea5yR3versing`

```

---

> \*\*TL;DR\*\*: Write posts as `.md` files → commit to GitHub → Vercel auto-deploys. Same flow as editing a GitHub README. No database, no CMS, no admin panel needed.

