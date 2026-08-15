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

Kiểm tra script sẽ làm gì, không ghi file:

```bash
npm run publish:post -- <slug> --dry-run
```

Publish vào local:

```bash
npm run publish:post -- <slug>
```

Publish và build:

```bash
npm run publish:post -- <slug> --build
```

Publish và commit:

```bash
npm run publish:post -- <slug> --commit
```

Publish, commit, push lên GitHub:

```bash
npm run publish:post -- <slug> --push
```

Nếu post đã tồn tại và muốn thay thế:

```bash
npm run publish:post -- <slug> --overwrite
```

Có thể kết hợp:

```bash
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

6. Nếu muốn kiểm tra build local trước khi commit:

```bash
npm run publish:post -- <slug> --build
```

7. Commit và push:

```bash
git add content/posts/<slug> public/images/posts/<slug> public/<slug>
git commit -m "content: publish <slug>"
git push
```

Hoặc dùng script làm hết:

```bash
npm run publish:post -- <slug> --push
```

Lưu ý: `--push` không tự chạy build local. GitHub Actions sẽ build và deploy sau khi commit được push lên `main`. Nếu muốn build trên máy trước khi push, dùng thêm `--build`.
