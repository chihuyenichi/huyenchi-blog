# Post Format Guide

Guide nay la format chuan cho moi CTF writeup trong repository nay.

## 1. Cau Truc Bat Buoc

Moi post la mot folder trong `content/posts/` va phai co dung mot file Markdown ten `index.md`.

```text
content/posts/<slug>/
  index.md
  images/
    <image-file-1>.png
    <image-file-2>.jpg
```

Vi du:

```text
content/posts/google-ctf-2026-rsa-warmup/
  index.md
  images/
    challenge.png
    exploit-flow.png
```

Neu post chua co anh, van tao folder `images/` va them file rong `images/.gitkeep` de Git luu cau truc folder.

`<slug>` phai dung chu thuong, so va dau gach ngang. Slug folder phai trung voi truong `slug` trong front matter.

Dung:

```text
google-ctf-2026-rsa-warmup
```

Khong dung:

```text
Google_CTF_2026
google ctf writeup
```

## 2. Front Matter

Dat YAML front matter o dau `index.md`.

```md
---
title: "RSA Warmup - Google CTF 2026"
slug: "google-ctf-2026-rsa-warmup"
date: "2026-07-27"
description: "Recovering the private key from a weak RSA setup."
category: "crypto"
event: "Google CTF 2026"
year: 2026
difficulty: "medium"
author: "Huyen Chi"
tags:
  - RSA
  - Crypto
  - Coppersmith
status: "published"
sourceUrl: "https://example.com/challenge"
quickLinks:
  - label: "Challenge files"
    url: "https://example.com/files"
  - label: "Solver source"
    url: "https://github.com/example/solver"
---
```

### Truong bat buoc

| Field | Format | Ghi chu |
| --- | --- | --- |
| `title` | string | Tieu de hien thi tren card va trang writeup. |
| `slug` | lowercase kebab-case | Trung voi ten folder post. |
| `date` | `YYYY-MM-DD` | Ngay dang bai. |
| `description` | string | Tom tat hien thi tren homepage va article header. |
| `category` | category hop le | Xem danh sach ben duoi. |
| `event` | string | Ten CTF, platform, hoac `Research Notes`. |
| `year` | number | Nam cua event/challenge. |
| `difficulty` | difficulty hop le | `easy`, `medium`, `hard`, hoac `insane`. |
| `author` | string | Tac gia bai viet. |
| `tags` | YAML list | Ky thuat va chu de lien quan. |
| `status` | `published` hoac `draft` | Chi `published` duoc hien thi tren website. |

### Category hop le

```text
web
crypto
pwn
reverse
forensics
osint
misc
blockchain
hardware
ai-ml
```

### Truong tuy chon

- `sourceUrl`: URL cua challenge, room, hoac event.
- `quickLinks`: danh sach link co `label` va `url`; hien thi trong khu Quick links cua article.
- `coverImage`: co the luu `./images/<file>` de giu metadata tuong thich, nhung giao dien hien tai dung anh tu `public/images-2/` lam background cho card va article hero.

## 3. Noi Dung Markdown

Sau front matter, viet noi dung bang Markdown va dung heading theo thu tu.

```md
## Challenge Overview

Mo ta de bai, muc tieu va cac file duoc cung cap.

## Analysis

### Finding the bug

Giai thich quan sat va bang chung.

```python
payload = b"A" * 72
```

## Exploit

Trinh bay exploit chain tung buoc.

## Flag

Mo ta ket qua, khong can cong khai flag neu challenge yeu cau giu kin.
```

Trang article da tu render `title` tu front matter, vi vay nen bat dau noi dung bang `##`, khong can lap lai title bang `#`.

Dung fenced code block co ten ngon ngu khi co the:

````md
```python
from pwn import *
```
````

## 4. Anh Trong Bai Viet

Luu anh goc trong folder cua post:

```text
content/posts/<slug>/images/<file-name>
```

Tham chieu bang duong dan tuong doi trong `index.md`:

```md
![IDA decompilation](./images/ida-main.png)
```

Khong dung duong dan tuyet doi cua may, duong dan `../`, hoac URL `/images/...` cu:

```md
![Wrong](/images/old-folder/image.png)
![Wrong](../images/image.png)
```

GitHub Pages phuc vu anh tu `public/`, nen copy moi anh tuong ung sang:

```text
public/images/posts/<slug>/<file-name>
```

Vi du day du:

```text
content/posts/google-ctf-2026-rsa-warmup/images/challenge.png
public/images/posts/google-ctf-2026-rsa-warmup/challenge.png
```

Luu y: hien tai build chua tu dong copy anh. Khi them, sua, hoac xoa anh trong `content/posts/<slug>/images/`, phai cap nhat ban sao trong `public/images/posts/<slug>/` cung luc.

## 5. Background Artwork

Khong dat anh phong nen cua website trong folder post. Website tu chon background dua tren slug tu:

```text
public/images-2/
```

Anh trong `images/` cua post chi dung trong noi dung Markdown. Post moi tu dong nhan background khi static site duoc build.

## 6. Checklist Truoc Khi Push

1. Folder post dung ten slug va chua duy nhat `index.md`.
2. Front matter co du cac truong bat buoc va `category`/`difficulty` hop le.
3. `status` la `published` neu muon hien thi cong khai.
4. Tat ca link anh trong Markdown dung `./images/<file-name>`.
5. Moi anh trong `content/posts/<slug>/images/` co ban sao trong `public/images/posts/<slug>/`.
6. Chay static build:

```sh
npm run build:pages
```

7. Push thay doi len `main`. GitHub Actions se tu deploy tai:

```text
https://chihuyenichi.github.io/huyenchi-blog/
```
