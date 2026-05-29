# How to Post a Writeup

## Quick Steps

1. **Create a `.md` file** anywhere inside `posts/`
2. **Add frontmatter** at the top of the file
3. **Place images** in `public/images/`
4. **Commit and push** to GitHub — site auto-deploys

---

## Frontmatter Format

Every post needs this at the top of the `.md` file:

```yaml
---
title: "Challenge Name"
date: "2025-01-01"
category: "TryHackMe"
tags: ["PWN", "ROP"]
excerpt: "Short description shown on the homepage."
---
```

## Images

- Place images in `public/images/`
- Reference them in markdown as:

```markdown
![alt text](/images/your-file.png)
```

## Folder Organization

```
posts/
├── tryhackme/
│   ├── pwn109.md
│   └── return-oriented-programming.md
└── your-new-post.md

public/images/
├── your-image.png
└── ...
```

## Admin Page (Alternative)

Go to `https://chihuyenichi.github.io/huyenchi-blog/admin` to upload `.md` + images directly through the browser using your GitHub token.

---

> **Note**: Only the repo owner can push changes. No external contributors can modify the site.
