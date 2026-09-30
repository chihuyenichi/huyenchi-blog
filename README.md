# Tech Notes

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
post-queue/<slug>/           # Staging area for posts before publishing
scripts/publish_post.py      # Post queue publisher
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

New posts are staged in `post-queue/<slug>/` with an `index.md` (plus optional `images/` and `resources/` folders), then published with:

```sh
npm run publish:post -- <slug> --push
```

This copies the post into `content/posts/<slug>/`, copies images into `public/images/posts/<slug>/`, copies resources into `public/<slug>/`, then commits and pushes to `main`. The GitHub Actions workflow builds and deploys the site automatically.

See [post-queue/README.md](post-queue/README.md) for the full guide, including `--dry-run`, `--overwrite`, `--build`, and `--commit`.

Alternatively, place the writeup at `content/posts/<slug>/index.md` and matching assets in both:

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

## Content

Writeups live as Markdown in `content/posts/<slug>/` (staged first in `post-queue/<slug>/`, see Publishing Content above). Each post carries YAML front matter — title, date, category, event, difficulty, tags — and renders at `/writeups/<slug>` with math (KaTeX), GFM tables, and highlighted code. The homepage deck surfaces the latest posts; `/writeups` is the full archive.
