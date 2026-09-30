---
title: "Electronic Toll Collection - Min Cut"
slug: "2025-icpc-regional-e"
date: "2026-10-01"
description: "Tách nhóm quận {1,3} khỏi {2,4} bằng ít đường nhất: quy về min s-t cut với super source/sink, giải bằng Dinic."
category: "misc"
event: "ICPC Asia Regional 2025"
year: 2025
difficulty: "medium"
author: "Huyen Chi"
tags:
  - cp
  - graph
  - max-flow
  - min-cut
status: "published"
---

# Problem E — ELECTRONIC TOLL COLLECTION

## Tài liệu tham chiếu

- [Đề bài `statement.md`](/2025-icpc-regional-e/statement.md)
- [Source code `solution.cpp`](/2025-icpc-regional-e/solution.cpp)

---

## 1. Tóm tắt bài toán

Cần xóa ít nhất số cạnh sao cho không còn đường đi giữa các cặp quận
`(1,2)`, `(2,3)`, `(3,4)`, `(4,1)`.

Nhận xét quan trọng:

$$
\{(1,2),(2,3),(3,4),(4,1)\}
= \{ \text{mọi cặp giữa } \{1,3\} \text{ và } \{2,4\} \}.
$$

Vì vậy cần tách toàn bộ các phường quận `1,3` khỏi toàn bộ các phường quận
`2,4`.

## 2. Đặc trưng

- Đường không có trọng số, mỗi đường lắp ETC tốn `1`.
- Có multiedge nên mỗi cạnh song song là một đơn vị capacity riêng.
- Self-loop không ảnh hưởng đến cut vì nó luôn ở cùng một phía.

## 3. Cách đơn giản chưa đủ

Chọn mọi cạnh nối trực tiếp giữa nhóm `{1,3}` và `{2,4}` có thể chưa tối ưu:
có thể rẻ hơn khi cắt ở một “cổ chai” xa hơn. Đây chính xác là min cut, không
phải chỉ đếm cạnh khác nhóm ban đầu.

## 4. Nhận xét / Bổ đề

**Lemma 1.** Một tập cạnh ETC hợp lệ khi và chỉ khi sau khi bỏ các cạnh đó,
không còn đường đi từ bất kỳ đỉnh thuộc quận `1` hoặc `3` tới bất kỳ đỉnh thuộc
quận `2` hoặc `4`.

Các cặp bị cấm là toàn bộ bốn tổ hợp giữa hai nhóm này, nên hai điều kiện tương
đương.

**Lemma 2.** Số cạnh ETC tối thiểu bằng min `s-t` cut sau khi thêm super source
nối vô hạn capacity tới mọi đỉnh quận `1,3`, và super sink nối vô hạn capacity
tới mọi đỉnh quận `2,4`; mỗi đường hai chiều có capacity `1`.

Theo định lý max-flow min-cut, cut hữu hạn nhỏ nhất chính là số đường gốc ít
nhất phải cắt để tách hai nhóm.

## 5. Thuật toán

Với mỗi test:

1. Tạo mạng flow có `n + 2` đỉnh: source `S`, sink `T`.
2. Với mỗi đường `u-v`, nếu `u != v`, thêm cạnh hai chiều capacity `1`.
3. Với mỗi phường:
   - nếu thuộc quận `1` hoặc `3`, thêm `S -> v` capacity `INF`;
   - nếu thuộc quận `2` hoặc `4`, thêm `v -> T` capacity `INF`.
4. Chạy max flow từ `S` đến `T`; giá trị flow là đáp án.

## 6. Khung cài đặt C++

Dùng Dinic với capacity kiểu `int`. Chọn `INF = m + 5` là đủ vì đáp án không
thể vượt số đường gốc `m`.

## 7. Chứng minh đúng và độ phức tạp

Lemma 1 quy bài toán ETC về bài toán tách hai tập đỉnh. Lemma 2 cho biết giá
trị tối ưu đúng bằng min cut của mạng dựng được; max-flow min-cut đảm bảo Dinic
trả về đúng giá trị này.

Với tổng `n,m <= 10^5`, Dinic trên mạng unit-capacity/nhỏ này đủ tốt trong thực
tế. Bộ nhớ `O(n+m)`.

## 8. Checker

Output là một số nguyên duy nhất cho mỗi test, dùng checker chuẩn.
