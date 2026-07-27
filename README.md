# Cipher Notes

A static CTF writeup blog deployed to GitHub Pages.

## Live Site

https://chihuyenichi.github.io/huyenchi-blog/

## Repository Layout

```text
app/                         # Next.js static pages
components/                  # Public UI components
content/posts/<slug>/
  index.md                   # Markdown writeup with YAML front matter
  images/                    # Post image source files
public/images/posts/<slug>/  # Images served by GitHub Pages
.github/workflows/           # Static deployment workflow
```

## Local Development

```sh
npm install
npm run dev
```

Build the production-equivalent GitHub Pages artifact:

```sh
npm run build:pages
```

The static output is generated in `out/`.

## Publishing Content

Add each writeup to `content/posts/<slug>/index.md` and place matching assets in both:

```text
content/posts/<slug>/images/
public/images/posts/<slug>/
```

Images in Markdown should use relative paths:

```md
![IDA output](./images/ida-main.png)
```

Push the change to `main`. The GitHub Actions workflow builds and deploys the site automatically.

## GitHub Pages

In repository **Settings > Pages**, set **Source** to **GitHub Actions**. The workflow deploys every push to `main` at:

```text
https://chihuyenichi.github.io/huyenchi-blog/
```

## Migrated Content

The legacy repository content is retained as four normalized posts:

- `them-ctf-2026-warm-up`
- `tryhackme-pwn109`
- `return-oriented-programming`
- `cpp-exception-unwinding-exploitation`
