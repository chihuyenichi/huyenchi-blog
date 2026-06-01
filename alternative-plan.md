# 🔄 Alternative Plan — HuyenChi Blog (As-Built Analysis)

> An alternative architectural perspective on the existing blog, with refactoring proposals and next-phase improvements.

---

## 1. 🏗️ Current Architecture (Reflected)

| Aspect | Implementation |
|---|---|
| **Framework** | Next.js 14 App Router (`output: 'export'` — fully static) |
| **Styling** | Tailwind CSS 3 with `@tailwindcss/typography` (dark GitHub theme) |
| **Content** | Markdown files in `posts/` with YAML frontmatter |
| **Markdown Engine** | `remark` + `remark-gfm` + `remark-html` (no MDX) |
| **Syntax Highlighting** | `rehype-highlight` (not Shiki, not `rehype-pretty-code`) |
| **Search** | Client-side `fuse.js` fuzzy search |
| **Build Output** | Static HTML export -> GitHub Pages |
| **CI/CD** | GitHub Actions (`deploy.yml`) |
| **Image Handling** | Static images in `public/images/`, path-rewritten in `PostBody` |
| **Admin** | Client-side GitHub Contents API uploader (`/admin`) |

---

## 2. 📂 Alternative Directory Layout (Proposed Refactor)

Instead of the flat `posts/` + `src/` layout, an alternative organization:

```
huyenchi-blog/
├── content/                          ← All content lives here (separated from code)
│   ├── posts/                        ← Markdown posts (same as current posts/)
│   │   ├── tryhackme/
│   │   ├── THEM-CTF-2026/
│   │   └── ...
│   └── assets/                       ← Images + media organized by post
│       ├── tryhackme/
│       │   └── pwn109/
│       │       ├── checksec.png
│       │       └── exploit.png
│       └── THEM-CTF-2026/
│           └── pwn/
│               └── solution/
│                   └── check-sec.png
│
├── src/                              ← Application code (Next.js)
│   ├── app/                          ← App Router pages
│   │   ├── page.tsx
│   │   ├── (category)/[category]/    ← Route group for category pages
│   │   │   └── page.tsx
│   │   ├── post/[slug]/
│   │   │   └── page.tsx
│   │   ├── tags/[tag]/
│   │   │   └── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── search/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── post/
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostBody.tsx
│   │   │   └── Pagination.tsx
│   │   └── search/
│   │       └── SearchBar.tsx
│   │
│   ├── lib/
│   │   ├── posts.ts                  ← Read posts from content/posts/
│   │   ├── mdx.ts                    ← Markdown rendering
│   │   └── constants.ts              ← Site config, basePath, social links
│   │
│   └── types/
│       └── post.ts                   ← Extracted PostMeta type
│
├── public/
│   └── favicon.ico                   ← Only truly static assets
│
├── scripts/                          ← Build/copy scripts
│   └── copy-assets.sh                ← Copy images from content/assets/ to public/
│
├── config/
│   ├── metadata.ts                   ← Site metadata (title, desc, author)
│   └── navigation.ts                 ← Nav links definition
│
├── data/
│   └── authors.ts                    ← Multi-author support (future)
│
├── tests/                            ← Test infrastructure
│   ├── lib/
│   │   ├── posts.test.ts
│   │   └── mdx.test.ts
│   └── components/
│       └── PostCard.test.tsx
│
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── plan.md
```

### Key Changes from Current Layout:

| Current | Alternative | Rationale |
|---|---|---|
| `images/` + `public/images/` (duplicated) | `content/assets/` (single source of truth) | Eliminates duplication; one copy, copied at build time |
| Flat `components/` | `components/layout/`, `components/post/`, `components/search/` | Better scalability as component count grows |
| `posts/` at root | `content/posts/` | Separates content from code cleanly |
| No `types/` dir | `src/types/post.ts` | Shared TypeScript interfaces extracted from `posts.ts` |
| No `tests/` | `tests/` | Missing test infrastructure |
| No `scripts/` | `scripts/` | Build automation scripts |
| No `config/` | `config/` | Centralized site configuration |

---

## 3. 🧱 Component Tree (Current vs. Alternative)

### Current Component Dependency Graph:

```
layout.tsx
├── Header.tsx
├── page.tsx (home)
│   ├── PostCard.tsx (×N)
│   │   └── Tag pills (inline)
│   └── Sidebar.tsx
│       ├── Category list
│       ├── Tag cloud
│       └── Recent posts
├── [category]/page.tsx
│   ├── Breadcrumb (inline)
│   ├── PostCard.tsx (×N)
│   └── Sidebar.tsx
├── post/[slug]/page.tsx
│   ├── Breadcrumb (inline)
│   ├── PostBody.tsx (client)
│   │   └── rehype-highlight
│   ├── Tag pills (inline)
│   └── Adjacent posts nav (inline)
├── tags/[tag]/page.tsx
│   ├── PostCard.tsx (×N)
│   └── Sidebar.tsx
├── search/page.tsx
│   └── SearchBar.tsx (client, fuse.js)
├── about/page.tsx
└── Footer.tsx
```

### Alternative Component Architecture:

```
src/components/
├── layout/
│   ├── Header.tsx
│   │   └── NavLink.tsx (extracted link component)
│   ├── Footer.tsx
│   │   └── SocialLinks.tsx (extracted)
│   └── Sidebar.tsx
│       ├── CategoryList.tsx
│       ├── TagCloud.tsx
│       └── RecentPosts.tsx
│
├── post/
│   ├── PostCard.tsx
│   │   ├── PostMeta.tsx (date + category)
│   │   ├── PostExcerpt.tsx
│   │   └── TagPills.tsx (shared)
│   ├── PostBody.tsx (client)
│   │   └── CopyButton.tsx (code block copy)
│   ├── PostNavigation.tsx (prev/next)
│   ├── PostHeader.tsx (title + meta + breadcrumb)
│   └── Pagination.tsx
│
├── shared/
│   ├── Breadcrumb.tsx
│   ├── TagPills.tsx
│   └── EmptyState.tsx ("No posts yet.")
│
└── search/
    └── SearchBar.tsx
```

---

## 4. 🔧 Technical Debt & Improvements

### 4.1 Duplicate Image Directories

**Problem**: `images/` and `public/images/` are identical copies. Manual sync risk.

**Fix**: Remove root `images/`, use `public/images/` as source of truth, or move to `content/assets/` with build-time copy.

### 4.2 Empty Root `lib/` Directory

**Problem**: Root-level `D:\website-for-writeup\lib\` is empty and unused.

**Fix**: Delete it.

### 4.3 `rehype-highlight` vs. `rehype-pretty-code`

**Current**: `rehype-highlight` (uses highlight.js, heavier CSS).

**Alternative**: Switch to `rehype-pretty-code` (uses Shiki, VS Code themes, lighter, more modern). Requires theme CSS import.

### 4.4 No Tests

**Problem**: Zero test coverage.

**Alternative**:
- Unit tests for `posts.ts` (parse, sort, filter, edge cases)
- Component tests for `PostBody.tsx` (renders markdown correctly)
- Integration test for static build (all pages render without error)

### 4.5 No Error Handling for Missing Posts

**Current**: `getPostBySlug()` returns `undefined` only if no matching slug is found. No explicit 404 handling.

**Alternative**: Add `notFound()` from `next/navigation` in `post/[slug]/page.tsx` for missing slugs.

### 4.6 Hardcoded Base Path

**Current**: `'/huyenchi-blog'` hardcoded in `next.config.js` and `PostBody.tsx`.

**Alternative**: Move to `src/lib/constants.ts` and reference from one place.

### 4.7 Admin Page Client-Side PAT

**Current**: Admin page asks user to paste a GitHub PAT in the browser.

**Risk**: PAT exposed in browser memory, no HTTPS enforcement on the input.

**Alternative**: Use GitHub OAuth flow or deploy a lightweight serverless function to proxy the write action.

---

## 5. 🚀 Performance Optimization Plan

| Area | Current | Alternative |
|---|---|---|
| **Images** | Full-size PNG screenshots | Convert to WebP, lazy-load with `<Image>` component |
| **Bundle** | Single JS bundle for all pages | Code-split by route (Next.js auto, but verify) |
| **Font** | `Inter` + `JetBrains Mono` via Google Fonts | Self-host with `next/font` (already supports it) |
| **Search Index** | All posts loaded client-side for search | Pre-build search index JSON, load async |
| **Highlighting** | `rehype-highlight` CSS bundled | Dynamic import of highlight theme, or Shiki-based |

---

## 6. 📦 Package.json — Dependency Audit

| Dependency | Current | Suggestion |
|---|---|---|
| `next` | ^14.2.0 | Upgrade to Next.js 15 (stable, better performance) |
| `react` / `react-dom` | ^18.3.0 | Upgrade to React 19 (compatible with Next 15) |
| `remark` + `remark-html` + `remark-gfm` | Present | Consider `unified` + `remark-parse` + `remark-rehype` + `rehype-stringify` for more flexibility |
| `rehype-highlight` | Present | Replace with `rehype-pretty-code` (Shiki-based, lighter) |
| `fuse.js` | ^7.0.0 | Keep — excellent choice |
| `gray-matter` | ^4.0.3 | Keep |
| `date-fns` | ^3.6.0 | Keep |
| Tailwind ecosystem | ^3.4.0 | Upgrade to Tailwind v4 when stable |
| **Missing** | — | `reading-time`, `next-sitemap`, `@vercel/og` |

---

## 7. 📄 Content Strategy Enhancement

### Current State:
- 3 posts across 2 categories (TryHackMe, THEM-CTF-2026)
- All posts are PWN/binary exploitation
- Single author

### Alternative Content Plan:

```
Phase 1 — Expand Categories (Next 5 posts)
├── Reverse Engineering (2 posts)
│   ├── reversing.kr Easy_Crack
│   └── Basic malware analysis
├── CTF Writeups (2 posts)
│   ├── picoCTF 2026
│   └── HTB CTF 2026
└── Tutorials (1 post)
    └── Setting up a pwn environment

Phase 2 — Features (After 10+ posts)
├── RSS feed (/rss.xml)
├── Reading time estimates
├── Sitemap for SEO
└── OG images for social sharing

Phase 3 — Community (After 20+ posts)
├── Giscus comments (GitHub Discussions)
├── Dark/Light mode toggle
└── Related posts recommendation
```

---

## 8. 🧪 Testing Strategy

```typescript
// tests/lib/posts.test.ts — Example test structure
describe('getAllPosts()', () => {
  it('returns posts sorted by date descending', () => { /* ... */ });
  it('parses frontmatter correctly for all required fields', () => { /* ... */ });
  it('returns empty array when no posts directory exists', () => { /* ... */ });
});

describe('getPostBySlug()', () => {
  it('returns the correct post by slug', () => { /* ... */ });
  it('returns undefined for non-existent slug', () => { /* ... */ });
});

describe('getCategories()', () => {
  it('returns unique categories with correct post counts', () => { /* ... */ });
});

describe('getTags()', () => {
  it('returns unique tags with correct post counts', () => { /* ... */ });
});
```

---

## 9. 🔀 Multi-Page Layout Alternative

**Current**: Each page renders sidebar independently. Sidebar content is re-computed per page.

**Alternative**: Move sidebar data fetching to `layout.tsx` using `Parallel Routes` or a shared loader:

```typescript
// src/app/layout.tsx (alternative)
export default async function RootLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <Header />
        <main>{children}</main>
        <aside>{sidebar}</aside>
        <Footer />
      </body>
    </html>
  );
}
```

This way, category/tag data is fetched once for the sidebar instead of in every page.

---

## 10. 🖊️ Post Creation Feature (Facebook-style)

A rich, in-browser post creation experience — similar to Facebook's composer — that lets the author draft writeups, attach a solution `.md` file, and upload a folder of images/assets, all without leaving the site.

---

### 10.1 Feature Overview

| Capability | Description |
|---|---|
| **Rich text composer** | Write post content in a live-preview editor (like a Facebook status box) |
| **Frontmatter fields** | Title, category, tags, date — filled via form inputs, not raw YAML |
| **Solution `.md` upload** | Drag-and-drop or browse to attach a Markdown solution file |
| **Image folder upload** | Upload a full folder of images/assets tied to the post |
| **Live preview** | See rendered markdown alongside the editor in real time |
| **GitHub publish** | One-click commit — pushes post + assets to the repo via GitHub Contents API |

---

### 10.2 UI Layout (Composer Component)

```
┌─────────────────────────────────────────────────────────────────┐
│  📝  New Post                                          [Draft]  │
├──────────────────────────────┬──────────────────────────────────┤
│  EDITOR                      │  PREVIEW                        │
│  ┌────────────────────────┐  │  ┌────────────────────────────┐ │
│  │ Title ________________ │  │  │ # Post Title               │ │
│  │ Category [dropdown ▼]  │  │  │                            │ │
│  │ Tags  [tag1] [tag2] +  │  │  │  rendered markdown here... │ │
│  ├────────────────────────┤  │  │                            │ │
│  │                        │  │  │  ![img](images/check.png)  │ │
│  │  Write your post...    │  │  │                            │ │
│  │  (markdown textarea)   │  │  └────────────────────────────┘ │
│  │                        │  │                                  │
│  └────────────────────────┘  │                                  │
│                               │                                  │
│  ┌─ Attachments ───────────────────────────────────────────┐   │
│  │  📄 Solution .md    [ Drop file or Browse ]             │   │
│  │     └─ solution.md  ✓  (parsed & merged on publish)     │   │
│  │                                                          │   │
│  │  🖼️  Image Folder   [ Drop folder or Browse ]           │   │
│  │     └─ /images/                                          │   │
│  │          ├─ checksec.png  ✓                              │   │
│  │          ├─ exploit.png   ✓                              │   │
│  │          └─ heap.png      ✓                              │   │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [💾 Save Draft]                          [🚀 Publish Post]    │
└─────────────────────────────────────────────────────────────────┘
```

---

### 10.3 Route & Component Structure

```
src/app/
└── admin/
    ├── page.tsx                  ← Admin dashboard (existing, unchanged)
    └── new-post/
        └── page.tsx              ← NEW: Post composer page

src/components/
└── admin/
    ├── PostComposer.tsx          ← Main Facebook-style composer shell
    ├── PostMetaForm.tsx          ← Title, category, tags, date inputs
    ├── MarkdownEditor.tsx        ← Textarea with live preview split view
    ├── SolutionUploader.tsx      ← .md file drop zone
    ├── ImageFolderUploader.tsx   ← Folder upload drop zone + file list
    └── PublishButton.tsx         ← Handles GitHub API commit logic

src/lib/
└── admin/
    ├── github-api.ts             ← GitHub Contents API helpers (create/update file)
    ├── build-post.ts             ← Assemble frontmatter + body into final .md
    └── upload-assets.ts          ← Base64-encode images, batch-commit to repo
```

---

### 10.4 Solution `.md` File Upload

**Behaviour:**
- Author uploads a pre-written solution `.md` file (e.g. `solution.md`)
- The file is parsed and its content is loaded into the editor textarea
- Author can edit it further before publishing
- On publish, it is committed to `content/posts/<category>/<slug>/index.md`

**Implementation — `SolutionUploader.tsx`:**

```tsx
// Drag-and-drop .md file → populate editor
const SolutionUploader = ({ onLoad }: { onLoad: (content: string) => void }) => {
  const handleDrop = (e: React.DragEvent) => {
    const file = e.dataTransfer.files[0];
    if (!file?.name.endsWith('.md')) return;
    const reader = new FileReader();
    reader.onload = (ev) => onLoad(ev.target?.result as string);
    reader.readAsText(file);
  };

  return (
    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-gray-400 rounded p-4 text-center cursor-pointer">
      <p>📄 Drop your solution <code>.md</code> file here, or <label>
        <input type="file" accept=".md" className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) { const r = new FileReader(); r.onload = (ev) => onLoad(ev.target?.result as string); r.readAsText(file); }
          }} />
        <span className="underline text-blue-500">browse</span>
      </label></p>
    </div>
  );
};
```

---

### 10.5 Image Folder Upload

**Behaviour:**
- Author drops an entire folder (e.g. `images/`) onto the drop zone
- All image files inside are listed with thumbnails and file names
- On publish, each image is base64-encoded and committed to `content/assets/<category>/<slug>/` via the GitHub API
- The composer auto-rewrites image paths in the markdown body to match the deployed asset path

**Supported via `webkitdirectory` attribute:**

```tsx
// ImageFolderUploader.tsx
const ImageFolderUploader = ({ onFilesLoaded }: { onFilesLoaded: (files: File[]) => void }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
      .filter(f => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(f.name));
    onFilesLoaded(files);
  };

  return (
    <div className="border-2 border-dashed border-gray-400 rounded p-4">
      <p>🖼️ Upload image folder:</p>
      <input type="file"
        // @ts-ignore — webkitdirectory is non-standard but widely supported
        webkitdirectory=""
        multiple
        onChange={handleChange}
        className="mt-2"
      />
    </div>
  );
};
```

**Path rewriting on publish (`upload-assets.ts`):**

```typescript
// Replace relative image paths in markdown with deployed CDN/repo paths
export function rewriteImagePaths(
  markdown: string,
  slug: string,
  category: string,
  basePath: string
): string {
  // Matches ![alt](images/foo.png) or ![alt](./images/foo.png)
  return markdown.replace(
    /!\[([^\]]*)\]\((?:\.\/)?images\/([^)]+)\)/g,
    (_, alt, filename) =>
      `![${alt}](${basePath}/content/assets/${category}/${slug}/${filename})`
  );
}
```

---

### 10.6 Publish Flow (GitHub Contents API)

```
Author clicks [🚀 Publish]
        │
        ▼
1. build-post.ts
   └─ Merge frontmatter fields + editor body → final index.md string
        │
        ▼
2. upload-assets.ts
   └─ For each image file:
        ├─ FileReader → base64
        └─ PUT /repos/{owner}/{repo}/contents/content/assets/{cat}/{slug}/{filename}
                │
                ▼
3. github-api.ts
   └─ PUT /repos/{owner}/{repo}/contents/content/posts/{cat}/{slug}/index.md
        (with base64-encoded final markdown)
                │
                ▼
4. GitHub Actions CI/CD kicks off → site rebuilds & deploys 🎉
```

**`github-api.ts` helper:**

```typescript
export async function commitFile(
  pat: string,
  owner: string,
  repo: string,
  path: string,
  content: string,          // base64-encoded
  message: string,
  sha?: string              // required when updating existing file
) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${pat}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, content, ...(sha ? { sha } : {}) }),
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}
```

---

### 10.7 Frontmatter Auto-generation

The composer generates frontmatter automatically from the form fields — the author never writes raw YAML:

```typescript
// build-post.ts
export function buildPost(meta: PostMeta, body: string): string {
  const frontmatter = [
    '---',
    `title: "${meta.title}"`,
    `date: "${new Date(meta.date).toISOString().split('T')[0]}"`,
    `category: "${meta.category}"`,
    `tags: [${meta.tags.map(t => `"${t}"`).join(', ')}]`,
    `excerpt: "${meta.excerpt}"`,
    '---',
    '',
  ].join('\n');

  return frontmatter + body;
}
```

---

### 10.8 Draft Auto-save (localStorage)

```typescript
// PostComposer.tsx — persist draft on every keystroke
useEffect(() => {
  const draft = { meta, body, images: imageNames };
  localStorage.setItem('post-draft', JSON.stringify(draft));
}, [meta, body, imageNames]);

// Restore on mount
useEffect(() => {
  const saved = localStorage.getItem('post-draft');
  if (saved) {
    const draft = JSON.parse(saved);
    setMeta(draft.meta);
    setBody(draft.body);
  }
}, []);
```

---

### 10.9 Security Notes

| Risk | Mitigation |
|---|---|
| PAT in browser memory | Prompt for PAT on each session; never persist to localStorage or cookies |
| Folder upload MIME spoofing | Validate file extensions server-side or filter by extension before commit |
| XSS in live preview | Sanitize HTML output with `DOMPurify` before injecting into preview pane |
| Large image uploads | Warn if any single file exceeds 5 MB (GitHub Contents API limit per file) |

---

### 10.10 Dependencies to Add

| Package | Purpose |
|---|---|
| `dompurify` | Sanitize rendered HTML in live preview |
| `@uiw/react-md-editor` *(optional)* | Drop-in rich markdown editor with preview (replaces custom split-view) |
| `jszip` *(optional)* | If batch-download of post + assets as a `.zip` is desired |

---

## 11. 📝 Architectural Decisions Record

| Decision | Context | Consequence |
|---|---|---|
| Static export vs. SSR | No server runtime needed (GitHub Pages) | No dynamic features (comments, views) without external service |
| `remark-html` instead of MDX | Simpler pipeline, no React components in markdown | Cannot embed interactive components in posts |
| GitHub Pages over Vercel | Free, no account needed beyond GitHub | Requires `.nojekyll`, `basePath` workaround |
| Flat category structure | `tryhackme/`, `THEM-CTF-2026/` are top-level folders | No nested categories possible |
| Client-side search | No backend needed | All post data shipped to browser, slower on large datasets |

---

> **TL;DR**: The current implementation is solid for a small blog. The alternative plan proposes separating content from code (content-first architecture), extracting reusable components, adding tests, upgrading the highlighting engine, and preparing for multi-category growth with a clear content roadmap.