# Hướng Dẫn Sử Dụng Post Queue

`post-queue/` là nơi chuẩn bị bài viết mới trước khi publish vào website.

Mỗi bài viết là một folder con. Tên folder chính là `slug` của bài viết.

Ví dụ:

```text
post-queue/tree-walk-coloring-dp/
  index.md
  images/
  resources/
```

## Cấu Trúc

### Bắt buộc

Mỗi queue folder bắt buộc có:

```text
post-queue/<slug>/index.md
```

`index.md` là nội dung bài post, gồm front matter và Markdown.

### Tùy chọn

Có thể có thêm:

```text
post-queue/<slug>/images/
post-queue/<slug>/resources/
```

Hai folder này có thể để trống.

Không đặt file hoặc folder tên khác trong `post-queue/<slug>/`. Script chỉ chấp nhận:

```text
index.md
images
resources
```

## Mapping Khi Publish

Khi chạy script:

```bash
npm run publish:post -- <slug>
```

File sẽ được copy như sau:

```text
post-queue/<slug>/index.md
-> content/posts/<slug>/index.md

post-queue/<slug>/images/*
-> content/posts/<slug>/images/*
-> public/images/posts/<slug>/*

post-queue/<slug>/resources/*
-> public/<slug>/*
```

Nếu `images/` không có file nào, script sẽ tạo:

```text
content/posts/<slug>/images/.gitkeep
```

## Link Trong Markdown

### Ảnh

Đặt ảnh trong:

```text
post-queue/<slug>/images/diagram.png
```

Dùng link trong `index.md`:

```md
![Diagram](./images/diagram.png)
```

### Resources

Đặt file trong:

```text
post-queue/<slug>/resources/solve.cpp
```

Dùng link trong `index.md`:

```md
- [Source code](/<slug>/solve.cpp)
```

Sau khi deploy, URL sẽ có dạng:

```text
https://chihuyenichi.github.io/huyenchi-blog/<slug>/solve.cpp
```

## Front Matter Mẫu

```md
---
title: "Tiêu đề bài viết"
slug: "<slug>"
date: "2026-08-15"
description: "Mô tả ngắn của bài viết."
category: "misc"
event: "Competitive Programming Notes"
year: 2026
difficulty: "medium"
author: "Huyen Chi"
tags:
  - cp
  - dp
  - tree
status: "published"
---
```

`slug` trong front matter nên trùng với tên folder:

```text
post-queue/<slug>/
```

## Lệnh Thường Dùng

### Kiểm tra trước khi publish

Chỉ xem script sẽ làm gì, không ghi file:

```bash
npm run publish:post -- <slug> --dry-run
```

### Publish vào local

```bash
npm run publish:post -- <slug>
```

Lệnh này chỉ copy file từ `post-queue/<slug>/` sang đúng vị trí trong `content/` và `public/`. Lệnh này không commit, không push.

### Publish và build local

```bash
npm run publish:post -- <slug> --build
```

Lệnh này copy file rồi chạy:

```bash
npm run build:pages
```

Dùng khi muốn kiểm tra web có build được trên máy trước khi commit/push.

### Publish và commit

```bash
npm run publish:post -- <slug> --commit
```

Lệnh này copy file rồi tạo commit:

```bash
git commit -m "content: publish <slug>"
```

Lệnh này không build local.

### Publish, commit và push lên GitHub

```bash
npm run publish:post -- <slug> --push
```

Lệnh này copy file, tạo commit, rồi push lên GitHub bằng SSH:

```bash
git push git@github.com:chihuyenichi/huyenchi-blog.git HEAD:main
```

Lệnh này không build local. Sau khi push, GitHub Actions sẽ tự chạy `npm run build:pages` và deploy GitHub Pages.

### Publish, build, commit và push

Nếu muốn kiểm tra build local trước khi commit/push:

```bash
npm run publish:post -- <slug> --build --push
```

### Ghi đè post đã tồn tại

Nếu target đã tồn tại, script sẽ báo lỗi để tránh ghi đè nhầm:

```text
Target already exists: content/posts/<slug>, public/<slug>. Use --overwrite to replace.
```

Muốn thay thế nội dung cũ:

```bash
npm run publish:post -- <slug> --overwrite
```

Các lệnh overwrite thường dùng:

```bash
npm run publish:post -- <slug> --overwrite --push
npm run publish:post -- <slug> --overwrite --build
npm run publish:post -- <slug> --overwrite --build --push
```

## Quy Trình Khuyến Nghị

1. Tạo folder:

```text
post-queue/<slug>/
```

2. Thêm `index.md`.

3. Nếu có ảnh, đặt vào `images/`.

4. Nếu có source code, statement, testcase, zip challenge, đặt vào `resources/`.

5. Chạy dry-run:

```bash
npm run publish:post -- <slug> --dry-run
```

6. Nếu chỉ muốn publish local để xem trước:

```bash
npm run publish:post -- <slug>
```

7. Nếu muốn kiểm tra build local:

```bash
npm run publish:post -- <slug> --overwrite --build
```

8. Khi muốn đưa lên GitHub:

```bash
npm run publish:post -- <slug> --overwrite --push
```

Nếu đây là lần publish đầu tiên và target chưa tồn tại, có thể bỏ `--overwrite`:

```bash
npm run publish:post -- <slug> --push
```

Lưu ý: `--push` không tự chạy build local. GitHub Actions sẽ build và deploy sau khi commit được push lên `main`. Nếu muốn build trên máy trước khi push, dùng thêm `--build`.
