# Cipher Notes

CTF writeup blog with a static public site on GitHub Pages and an authenticated publishing workspace on Vercel.

## Deployment architecture

- **Public site:** `https://chihuyenichi.github.io/huyenchi-blog/`
  - Built from the repository root and deployed by `.github/workflows/deploy-pages.yml`.
  - Uses only static HTML, CSS, JavaScript, Markdown, and images.
- **Admin workspace:** deploy the `admin/` directory as a separate Vercel project.
  - Handles GitHub OAuth, allowlist verification, preview, folder upload, and commits.
  - Does not expose GitHub credentials to visitors of the public site.
- **Shared content:** posts and assets are committed to this repository. A publish action creates one commit; GitHub Actions then rebuilds the Pages site.

## Repository layout

```text
app/                         # Static Next.js public site
admin/                       # Vercel Next.js admin service
content/posts/<slug>/
  index.md                   # Markdown with YAML front matter
  images/                    # Original post images
public/images/posts/<slug>/  # Static copies served by GitHub Pages
.github/workflows/           # GitHub Pages deployment
```

## Local public site

```sh
npm install
npm run dev
```

Create a production-equivalent static export:

```sh
npm run build:pages
```

The generated GitHub Pages artifact is `out/`.

## Vercel admin setup

1. Create a Vercel project from `chihuyenichi/huyenchi-blog` with **Root Directory** set to `admin`.
2. Create a GitHub OAuth App. Set its callback URL to `https://<your-vercel-admin-domain>/api/auth/callback`.
3. In Vercel, configure the variables listed in `admin/.env.example`.
4. Create a fine-grained GitHub personal access token with **Contents: Read and write** for this repository and set it as `GITHUB_TOKEN` in Vercel only.
5. Create the repository Actions variable `ADMIN_URL` with the deployed Vercel admin URL. The GitHub Pages workflow injects it as `NEXT_PUBLIC_ADMIN_URL` at build time.

The admin GitHub allowlist is `ADMIN_GITHUB_LOGINS`; only these accounts can publish.

## GitHub Pages setup

In repository **Settings > Pages**, set **Source** to **GitHub Actions**. Every push to `main` then builds and deploys `out/` to:

```text
https://chihuyenichi.github.io/huyenchi-blog/
```

## Migrated content

The legacy repository content is normalized into four posts:

- `them-ctf-2026-warm-up`
- `tryhackme-pwn109`
- `return-oriented-programming`
- `cpp-exception-unwinding-exploitation`

All legacy images are retained in the matching post's `content/posts/<slug>/images/` folder and copied to `public/images/posts/<slug>/` for static delivery.
