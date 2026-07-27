# CTF Writeup Blog Plan

## 1. Muc tieu

Xay dung blog CTF writeup lay cam hung tu Google Research Blog:

- Trang chu hien thi bai viet moi nhat theo card: cover image, ngay dang, title, summary, category, tags.
- Co thanh dieu huong, tim kiem, filter va archive.
- Trang Categories theo phong cach `pcotret.github.io/categories/`: moi category hien thi danh sach bai viet gan nhat va lien ket xem toan bo.
- Chi admin duoc tao bai viet.
- Admin upload truc tiep folder bai viet tu website, preview noi dung truoc, sau do publish vao GitHub source repository.
- Moi post trong repository gom file Markdown va thu muc `images/`.

## 2. Kien truc

Dung **Next.js + TypeScript + Tailwind CSS**, deploy bang **Vercel**.

- Next.js cung cap website public, trang admin va API upload trong mot codebase.
- Markdown la nguon noi dung duy nhat, khong can database.
- Anh va Markdown duoc luu trong chinh GitHub source repository.
- GitHub App duoc dung de tao commit an toan tu server, khong dua GitHub token xuong browser.
- GitHub Actions kiem tra noi dung va build; Vercel tu deploy sau commit hop le.
- Trang public duoc static-generate tu Markdown de toi uu SEO va toc do.

## 3. Luong dang bai

1. Admin dang nhap bang GitHub OAuth.
2. He thong kiem tra GitHub username thuoc allowlist admin.
3. Admin truy cap `/admin/posts/new`.
4. Admin chon folder bai viet tu may:
   - Chap nhan folder qua file picker co `webkitdirectory`.
   - Ho tro keo tha file `.zip` nhu phuong an thay the.
5. He thong kiem tra cau truc folder, Markdown, front matter, anh va link noi bo.
6. He thong render preview giong trang public.
7. Admin dieu chinh metadata neu can va bam `Publish`.
8. Server tao GitHub commit gom Markdown va anh.
9. GitHub Actions chay validate/build.
10. Vercel deploy phien ban moi; post xuat hien cong khai.

Preview chi chay truoc khi publish, khong luu draft tren server. Neu can draft lau dai sau nay, draft se duoc commit vao GitHub voi `status: draft`.

## 4. Cau truc noi dung

```text
content/
  posts/
    <slug>/
      index.md
      images/
        cover.png
        exploit-flow.png
        terminal-output.jpg
```

Vi du:

```text
content/posts/htb-machine-writeup/
  index.md
  images/
    cover.png
    initial-access.png
```

`index.md`:

```md
---
title: "HTB Machine Writeup"
slug: "htb-machine-writeup"
date: "2026-07-27"
description: "Phan tich lo hong va huong khai thac."
category: "web"
event: "Hack The Box"
year: 2026
difficulty: "medium"
author: "admin"
tags: ["sqli", "rce", "php"]
status: "published"
coverImage: "./images/cover.png"
sourceUrl: "https://example.com/challenge"
quickLinks:
  - label: "Challenge"
    url: "https://example.com/challenge"
  - label: "Solver source"
    url: "https://github.com/example/solver"
---

## Challenge

Noi dung writeup...

![So do khai thac](./images/exploit-flow.png)
```

## 5. Quy tac upload va validation

- Folder phai chua dung mot file `.md`; khi publish se duoc chuan hoa thanh `index.md`.
- Thu muc `images/` la tuy chon, nhung moi anh Markdown phai nam trong thu muc nay.
- Chi chap nhan `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, `.svg`.
- Tu choi file thuc thi, hidden files, symbolic links va file vuot gioi han kich thuoc.
- Tu choi duong dan chua `..` de tranh path traversal.
- Bat buoc: `title`, `date`, `description`, `category`, `event`, `year`, `difficulty`, `tags`.
- Tu sinh slug tu title neu admin chua nhap; kiem tra slug khong trung.
- Kiem tra cac image reference trong Markdown ton tai truoc khi preview/publish.
- Sanitize Markdown/HTML de chan XSS.

## 6. Category va taxonomy

Primary categories:

- `web`
- `crypto`
- `pwn`
- `reverse`
- `forensics`
- `osint`
- `misc`
- `blockchain`
- `hardware`
- `ai-ml`

Metadata bo sung:

- `event`: ten CTF hoac nen tang, vi du `picoCTF`, `HTB`, `Google CTF`.
- `year`: nam challenge hoac nam giai.
- `difficulty`: `easy`, `medium`, `hard`, `insane`.
- `tags`: ky thuat cu the, vi du `sqli`, `heap`, `rsa`, `steganography`.
- `author`: tac gia writeup.
- `status`: `draft` hoac `published`.
- `sourceUrl`: URL challenge neu co.
- `quickLinks`: danh sach link bo sung, vi du challenge, source code, attachment, exploit repository hoac video.

## 7. Cac trang public

- `/`: hero "Latest CTF Writeups", bai noi bat va danh sach bai moi.
- `/writeups`: danh sach tat ca writeup, phan trang va filter.
- `/writeups/[slug]`: trang doc Markdown, table of contents, syntax highlighting, image lightbox, quick links, share va metadata.
- `/categories`: directory tat ca categories, moi section hien thi toi da 5 bai moi nhat.
- `/categories/[category]`: archive theo category.
- `/events`: danh sach CTF event.
- `/events/[event]`: archive theo event.
- `/archive`: filter theo nam va do kho.
- `/search`: full-text search client-side tu generated search index.
- `/about`: gioi thieu blog/tac gia.
- `/rss.xml`, `/sitemap.xml`, `robots.txt`, trang `404`.

## 8. Giao dien

- Giu tinh than Google Research Blog: nhieu khoang trang, typography ro rang, card lon co cover image, metadata gon va tag chip.
- Khong sao chep branding hoac thiet ke Google.
- Header gom logo, Writeups, Categories, Events, Archive, About, Search va theme switcher.
- Su dung grid, typography, mau sac, logo va icon rieng cua blog CTF; chi tham chieu cau truc thong tin va nhip dieu layout cua cac trang Google Research.
- Responsive:
  - Desktop: grid 3 card.
  - Tablet: 2 card.
  - Mobile: 1 card, filter mo bang drawer.
- Dark mode theo system preference va cho phep chuyen thu cong.
- Code blocks co syntax highlighting, nut copy va ho tro dong dai tren mobile.

### 8.1. Format trang category

Trang `/categories/[category]` tham chieu format trang label Google Research:

- Breadcrumb o dau trang: `Home / Categories / <Category>`.
- Heading lon ten category, vi du `Web` hoac `Cryptography`.
- Khu vuc filter ro rang ngay sau heading:
  - Years: cac nam co bai viet, kem so luong bai.
  - Categories: tat ca primary categories; category hien tai duoc danh dau.
  - Bo loc bo sung theo Event, Difficulty va Tags.
  - Tren desktop, filter hien thi dang sidebar hoac panel; tren mobile, dong trong drawer qua nut `Filters`.
- Danh sach bai sap xep moi nhat truoc, moi card gom cover image ty le dong nhat, ngay dang, title, description ngan va danh sach category/tags link duoc.
- Filter phai dong bo vao query string de co the bookmark/chia se, vi du `/categories/web?year=2026&difficulty=medium`.
- Phan trang co trang hien tai, previous/next va dieu huong bang ban phim; khong dung infinite scroll.
- Empty state huong nguoi dung xoa filter khi khong co ket qua.

### 8.2. Format trang writeup

Trang `/writeups/[slug]` tham chieu format bai viet Google Research:

- Hero/cover image full-width o phan tren trang; anh co alt text bat buoc.
- Breadcrumb: `Home / Writeups / <Title>`.
- Article header rong va de doc: title, date, description (dek), byline, event, difficulty va categories.
- Khu `Quick links` ngay sau header, render tu `quickLinks` va `sourceUrl`; cac lien ket mo ngoai trong tab moi voi `rel="noreferrer"`.
- Nut Share bao gom copy link va chia se X/LinkedIn; phai co fallback copy link khi Web Share API khong kha dung.
- Noi dung Markdown trong mot cot doc toi uu, gioi han chieu rong, heading hierarchy, anchor links va table of contents sticky tren desktop.
- Hinh trong bai co caption khi Markdown cung cap; click mo lightbox va co the dong bang Escape.
- Code block co ten ngon ngu, syntax highlight, copy button va scroll ngang an toan tren man hinh nho.
- Sau bai viet: khu Labels/Tags co lien ket, Quick links lap lai, va `Other writeups of interest` gom 3 card lien quan theo category, tags va event.
- Footer co navigation toi category, event archive, RSS va social links cua blog.

## 9. Admin

- `/admin`: dashboard so bai viet, bai theo category va shortcut tao post.
- `/admin/posts/new`: upload folder, nhap/chinh metadata, validation va preview.
- `/admin/posts/[slug]/edit`: tai noi dung tu GitHub, chinh metadata/Markdown, preview, commit thay doi.
- Khong co tinh nang xoa truc tiep o giai doan dau; dung unpublish bang doi `status: draft` de giam rui ro mat du lieu.
- Moi publish tao Git commit voi message chuan: `content: publish <slug>`.

## 10. Xac thuc va bao mat

- GitHub OAuth xac thuc admin.
- Allowlist GitHub usernames o bien moi truong.
- GitHub App private key chi duoc dung o server-side API route.
- Kiem tra CSRF, rate limit upload va gioi han dung luong request.
- Khong render raw HTML Markdown neu khong qua sanitizer.
- Chi branch production duoc phep publish.
- GitHub Actions dung quyen toi thieu can thiet.

## 11. GitHub Actions va deploy

GitHub Actions se chay khi co pull request hoac commit:

1. Validate front matter va taxonomy.
2. Kiem tra slug trung, Markdown links va image paths.
3. Lint, typecheck va test.
4. Build Next.js.
5. Vercel deploy production khi merge/commit vao branch chinh.

## 12. Kiem thu

- Unit test parser Markdown/front matter.
- Unit test slug, validation folder va image path safety.
- Integration test API upload voi mocked GitHub API.
- E2E test:
  - Admin khong thuoc allowlist bi chan.
  - Upload folder hop le render duoc preview.
  - Upload folder thieu anh/thong tin bi bao loi.
  - Publish tao commit chinh xac.
  - Post public xuat hien sau build.
- Kiem tra responsive, keyboard navigation va accessibility co ban.

## 13. Thu tu trien khai

1. Khoi tao Next.js, TypeScript, Tailwind va cau truc content.
2. Xay parser Markdown, schema front matter va static content loader.
3. Xay layout public, home, post detail, category va archive.
4. Them search index, RSS, sitemap va SEO metadata.
5. Cau hinh GitHub OAuth, allowlist admin va GitHub App.
6. Xay API doc/validate/upload folder vao GitHub.
7. Xay trang admin upload, metadata form va live preview.
8. Them GitHub Actions, Vercel deploy va environment secrets.
9. Viet test, kiem tra bao mat upload va toi uu mobile.
10. Them sample writeup de xac nhan end-to-end flow.
