# Post Queue Guide

`post-queue/` la noi chuan bi bai viet moi truoc khi publish vao website.

Moi bai viet la mot folder con, ten folder chinh la `slug` cua bai.

Vi du:

```text
post-queue/tree-walk-coloring-dp/
  index.md
  images/
  resources/
```

## Cau Truc

### Bat buoc

Moi queue folder bat buoc co:

```text
post-queue/<slug>/index.md
```

`index.md` la noi dung bai post, gom front matter va Markdown.

### Tuy chon

Co the co them:

```text
post-queue/<slug>/images/
post-queue/<slug>/resources/
```

Hai folder nay co the rong.

Khong dat file hoac folder ten khac trong `post-queue/<slug>/`. Script chi chap nhan:

```text
index.md
images
resources
```

## Mapping Khi Publish

Khi chay script:

```bash
npm run publish:post -- <slug>
```

File se duoc copy nhu sau:

```text
post-queue/<slug>/index.md
-> content/posts/<slug>/index.md

post-queue/<slug>/images/*
-> content/posts/<slug>/images/*
-> public/images/posts/<slug>/*

post-queue/<slug>/resources/*
-> public/<slug>/*
```

Neu `images/` khong co file nao, script se tao:

```text
content/posts/<slug>/images/.gitkeep
```

## Link Trong Markdown

### Anh

Dat anh trong:

```text
post-queue/<slug>/images/diagram.png
```

Dung link trong `index.md`:

```md
![Diagram](./images/diagram.png)
```

### Resources

Dat file trong:

```text
post-queue/<slug>/resources/solve.cpp
```

Dung link trong `index.md`:

```md
- [Source code](/<slug>/solve.cpp)
```

Sau deploy, URL se co dang:

```text
https://chihuyenichi.github.io/huyenchi-blog/<slug>/solve.cpp
```

## Front Matter Mau

```md
---
title: "Tieu de bai viet"
slug: "<slug>"
date: "2026-08-15"
description: "Mo ta ngan cua bai viet."
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

`slug` trong front matter nen trung voi ten folder:

```text
post-queue/<slug>/
```

## Lenh Thuong Dung

Kiem tra script se lam gi, khong ghi file:

```bash
npm run publish:post -- <slug> --dry-run
```

Publish vao local:

```bash
npm run publish:post -- <slug>
```

Publish va build:

```bash
npm run publish:post -- <slug> --build
```

Publish, build, commit:

```bash
npm run publish:post -- <slug> --commit
```

Publish, build, commit, push len GitHub:

```bash
npm run publish:post -- <slug> --push
```

Neu post da ton tai va muon thay the:

```bash
npm run publish:post -- <slug> --overwrite
```

Co the ket hop:

```bash
npm run publish:post -- <slug> --overwrite --build
```

## Quy Trinh Khuyen Dung

1. Tao folder:

```text
post-queue/<slug>/
```

2. Them `index.md`.

3. Neu co anh, dat vao `images/`.

4. Neu co source code, statement, testcase, zip challenge, dat vao `resources/`.

5. Chay dry-run:

```bash
npm run publish:post -- <slug> --dry-run
```

6. Publish va build:

```bash
npm run publish:post -- <slug> --build
```

7. Neu build pass, commit va push:

```bash
git add content/posts/<slug> public/images/posts/<slug> public/<slug>
git commit -m "content: publish <slug>"
git push
```

Hoac dung script lam het:

```bash
npm run publish:post -- <slug> --push
```
