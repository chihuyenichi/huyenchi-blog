---
title: "Dịch phải - sqrt decomposition kết hợp linked list theo block"
slug: "dich-phai-sqrt-decomposition"
date: "2026-08-09"
description: "Phân tích lời giải bài Dịch phải bằng sqrt decomposition, tần suất theo block và linked list để xử lý xoay đoạn online."
category: "misc"
event: "Competitive Programming Notes"
year: 2026
difficulty: "hard"
author: "Huyen Chi"
tags:
  - cp
  - sqrt-decomposition
status: "published"
---

## Bài toán

Ta có mảng `a` gồm `n` phần tử, cần xử lý `q` truy vấn online:

- Loại `1 l r`: xoay phải đoạn `[l, r]`, tức là đưa `a[r]` lên đầu đoạn.
- Loại `2 l r k`: đếm số phần tử bằng `k` trong đoạn `[l, r]`.

Điểm khó nằm ở hai chỗ:

- `n, q` đều lên tới `10^5`, nên mô phỏng trực tiếp từng truy vấn sẽ quá chậm.
- Dữ liệu vào được mã hóa bằng `lastans`, nên không thể xử lý offline.

Source code tham chiếu:

- [Xem file `3.cpp`](/dich-phai-sqrt-decomposition/3.cpp)

## Ý tưởng chính từ code

File [3.cpp](/run/media/taing21/HuyenChi/daohuyenchi_server/Programming/c-linux/3/3.cpp) giải bài này bằng cách kết hợp hai lớp dữ liệu:

- `sqrt decomposition`: chia mảng theo block cỡ khoảng `500`.
- `linked list`: lưu thứ tự hiện tại của các phần tử để xoay đoạn mà không phải dời cả mảng.

Thay vì cập nhật trực tiếp giá trị trong mảng theo vị trí mới, code giữ nguyên `a[i]` là giá trị ở vị trí gốc, còn thứ tự hiện tại được biểu diễn bằng danh sách liên kết đôi `a_link`.

Mỗi node trong list chứa:

```cpp
struct single_list {
    int id;
    int next, prev;
};
```

Ở đây `id` là chỉ số gốc của phần tử trong mảng `a`. Vì thế, nếu đang đứng ở một node nào đó thì giá trị thật của nó là `a[a_link[node].id]`.

## Thông tin mỗi block

Mỗi block lưu hai loại thông tin:

```cpp
struct block_struct {
    int freq[nmax];
    int pointer[2];
} block[nmax / block_size + 1];
```

- `freq[x]`: số lần giá trị `x` xuất hiện trong block đó.
- `pointer[0]`, `pointer[1]`: node đầu và node cuối của block trong linked list hiện tại.

Nhờ `freq`, khi truy vấn đếm đi qua một block trọn vẹn, ta chỉ cần cộng ngay `freq[k]` mà không duyệt từng phần tử.

## Tìm node tại một vị trí

Hàm `iterator_from_pos(l)` là cầu nối giữa "vị trí logic" trong mảng hiện tại và "node thật" trong linked list.

```cpp
int iterator_from_pos(int l) {
    int id = block_getid(l);
    int begin = block[id].pointer[0];
    for (int i = block_idStart(id) + 1; i <= l; ++i) {
        begin = a_link[begin].next;
    }
    return begin;
}
```

Ta không đi từ đầu mảng tới `l`, mà chỉ đi từ đầu block chứa `l`. Vì block nhỏ, chi phí này chỉ khoảng `O(sqrt(n))`.

## Xử lý truy vấn xoay phải

### 1. Nếu `l` và `r` cùng một block

Khi đó chỉ cần lấy node ở vị trí `r`, cắt nó ra, rồi chèn lên trước node ở vị trí `l`.

Phần việc này được làm trong `rot_segment_inside(l, r)`. Toàn bộ thao tác chỉ là sửa con trỏ `next/prev`, không hề copy dữ liệu.

Ý tưởng là biến:

```text
[x1, x2, ..., xr-1, xr]
```

thành:

```text
[xr, x1, x2, ..., xr-1]
```

### 2. Nếu đoạn đi qua nhiều block

Đây là phần hay nhất của lời giải.

Ta tách đoạn `[l, r]` thành:

- phần lẻ ở block trái,
- các block trọn vẹn ở giữa,
- phần lẻ ở block phải.

Với các block trọn vẹn ở giữa, code không xoay từng phần tử bên trong block. Thay vào đó, nó cập nhật block như thể block bị "dịch vòng" một bước:

- node cuối của block cũ trở thành node đầu mới,
- node cuối mới là node đứng trước node cuối cũ,
- `freq` được cập nhật bằng cách trừ giá trị rời block và cộng giá trị mới đi vào block.

Đoạn này nằm trong vòng lặp:

```cpp
for (int b_id = l_blockid + 1; b_id < r_blockid; ++b_id) {
    ...
}
```

Với hai block biên, ta vẫn phải xác định chính xác node ở `l` và `r`, sau đó:

- đưa node tại `r` lên trước node tại `l`,
- cập nhật lại `freq` cho block trái và block phải,
- sửa `pointer[0]`, `pointer[1]` của các block biên.

Nhờ vậy, một phép xoay dài không còn là `O(r - l)`, mà chỉ còn cỡ số block bị đi qua.

## Xử lý truy vấn đếm

Hàm `count_segment(l, r, x)` cũng chia làm hai trường hợp:

- Nếu cùng block: duyệt trực tiếp từ `l` tới `r`.
- Nếu khác block:
  - duyệt phần lẻ ở block trái,
  - duyệt phần lẻ ở block phải,
  - với các block nằm trọn bên trong thì cộng luôn `block[i].freq[x]`.

Vì vậy, truy vấn đếm có chi phí xấp xỉ:

```text
O(số block đi qua + 2 * block_size)
```

thay vì `O(r - l)`.

## Giải mã truy vấn online

Do đề yêu cầu online, mỗi truy vấn phải được giải mã bằng `lastans` trước khi xử lý:

```cpp
l = (l + lastans - 1) % n + 1;
r = (r + lastans - 1) % n + 1;
if (l > r) swap(l, r);
```

Với truy vấn loại `2`, tham số `k` cũng phải giải mã tương tự. Sau khi đếm xong thì gán:

```cpp
lastans = ans;
```

Phần này bắt buộc phải làm đúng thứ tự, nếu không toàn bộ truy vấn phía sau sẽ sai.

## Vì sao cách này đủ nhanh

Gọi `B` là kích thước block, ở đây code chọn:

```cpp
#define block_size ((int) 5e2)
```

Khi đó:

- tìm một vị trí trong block mất `O(B)`,
- đếm một đoạn mất khoảng `O(n / B + B)`,
- xoay một đoạn cũng chủ yếu theo số block cộng với chi phí xử lý hai block biên.

Với `B ≈ 500` và `n ≤ 10^5`, nghiệm này đủ để chạy trong giới hạn thời gian `4s`.

## Nhận xét về cài đặt

Điểm mạnh của lời giải là:

- không dời cả đoạn khi xoay,
- không phải giữ một cấu trúc phức tạp như balanced BST,
- truy vấn đếm trên block đầy đủ chỉ còn `O(1)`.

Đổi lại, code khá khó viết vì phải đồng bộ chính xác ba thứ cùng lúc:

- linked list toàn cục,
- đầu/cuối của từng block,
- bảng tần suất `freq` của mỗi block.

Chỉ cần sai một cập nhật con trỏ hoặc sai một lần cộng/trừ tần suất là dữ liệu sẽ hỏng ngay ở các truy vấn sau.

## Kết luận

Đây là một lời giải rất đáng học cho nhóm bài:

- có thao tác thay đổi thứ tự phần tử,
- vẫn cần truy vấn thống kê trên đoạn,
- và giới hạn đủ lớn để cách làm tuyến tính bị loại.

Ý tưởng cốt lõi là:

1. Tách "giá trị" và "thứ tự hiện tại" ra khỏi nhau.
2. Dùng linked list để biểu diễn thứ tự.
3. Dùng sqrt decomposition để gom thống kê theo block.

Nếu chỉ nhìn đề, bài này dễ gợi tới cấu trúc dữ liệu rất nặng. Nhưng từ `3.cpp` có thể thấy một hướng thực dụng hơn: kết hợp block decomposition với thao tác con trỏ để đạt đúng độ phức tạp cần thiết.
