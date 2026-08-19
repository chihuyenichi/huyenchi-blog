---
title: '"Reverse" bài toán, greedy'
slug: "reverse-statement-greedy"
date: "2026-08-20"
description: "Chuyển quá trình phép toán về mô hình phân chia 'đồng xu', kết hợp binary search và tham lam để tìm số giây tối thiểu đưa mọi số về 0."
category: "misc"
event: "Competitive Programming Notes"
year: 2026
difficulty: "medium"
author: "Huyen Chi"
tags:
  - cp
  - greedy
  - binary search
status: "published"
---

## Tài liệu tham chiếu

- [Source code `solve.cpp`](/reverse-statement-greedy/solve.cpp)

## 1. Tóm tắt đề bài

Cho $n$ số nguyên dương $a_1, \dots, a_n$. Mỗi phép toán (1 giây) chọn một chỉ số $p$ rồi **đồng thời**:

- $a_p \leftarrow \lfloor a_p / 2 \rfloor$ (phần tử được chọn bị "làm tròn xuống"),
- mọi $i \neq p$: $a_i \leftarrow \lceil a_i / 2 \rceil$ (phần tử còn lại bị "làm tròn lên").

Hỏi số giây tối thiểu để mọi số đều thành $0$.

Ràng buộc: $t \le 10^4$ test, $\sum n \le 2\cdot 10^5$, $a_i \le 10^9$.

## 2. Phân tích

### 2.1. Quan sát cơ bản

- Một phần tử chỉ có thể về $0$ khi **nó được chọn** ở thời điểm nó đang bằng $1$ (vì $\lfloor 1/2 \rfloor = 0$, còn $\lceil 1/2 \rceil = 1$).
- Mỗi phép toán chỉ chọn **đúng 1** phần tử, nên **mỗi phần tử cần được chọn ít nhất 1 lần** $\Rightarrow$ đáp án $\ge n$.
- Khi đã về $0$, phần tử đó đứng yên (floor/ceil của $0$ đều là $0$).

### 2.2. Nhìn ngược quá trình (reverse process) — mô hình "đồng xu"

Xét ngược từ trạng thái toàn $0$, sau $T$ phép toán ngược phải đạt đúng mảng $a$:

- Phép ngược của "được chọn" (floor): giá trị $v \to 2v$ hoặc $2v+1$.
- Phép ngược của "không được chọn" (ceil): giá trị $v \to 2v$ hoặc $2v-1$ (không âm).

Từ $0$ mà không được chọn thì vẫn $0$ (vì $2\cdot 0 - 1 < 0$, $2 \cdot 0 = 0$). Vì vậy:

Mỗi phần tử $i$ muốn lớn lên phải được chọn ở **ít nhất 1** bước ngược. Nếu nó được chọn tại các bước $s_1 < s_2 < \dots < s_c$ thì giá trị cuối tối đa đạt được là:

$$
\sum_{j} 2^{\,T - s_j}
$$

(mỗi bước chọn tối đa cộng $1$ rồi bị nhân đôi ở các bước sau).

Tại bước $s_j - 1$, giả sử giá trị của phần tử $i$ là $x$. Nếu ở bước $k$, giá trị $x$ **được chọn**, thì $x$ sẽ chuyển sang giá trị tối đa là $x \cdot 2 + 1$. Từ bước $k + 1$ trở về sau, giá trị luôn được ít nhất nhân $2$, nên đóng góp của số $1$ tại bước $k$ là $2^{T - k}$.

**Lưu ý:** Tại bước đầu mà giá trị (cho phần tử thứ $i$ chẳng hạn) **được chọn**, thì tức là $0 \to 0 \cdot 2 + 1 = 1$.

Như vậy, **bài toán quy về**: ta có $T$ "đồng xu" có giá trị $2^{T-1}, 2^{T-2}, \dots, 1$ (mỗi loại đúng 1 cái), cần chia cho $n$ phần tử (mỗi phần tử $\ge 1$ đồng xu) sao cho tổng giá trị đồng xu nhận được của phần tử $i$ **$\ge a_i$**. Tìm $T$ nhỏ nhất.

## 3. Thuật toán

Do việc minimize giá trị của $T$ (được đề cập bên trên) có tính chất tuyến tính:

- Nếu `T` tồn tại cách chia cho `n` phần tử thì với `T' > T` cũng tồn tại cách chia cho `n` phần tử.

> Ta sẽ sử dụng binary search để tìm `T` nhỏ nhất.

Giả sử với mỗi $i$, ta gọi thứ tự "đồng xu" (trong dãy $2^{T - j}, \forall j \in [1, T]$) được gán nhãn với $i$ là tập $S_i$.

Với mỗi $T$ (được xét khi sử dụng binary search), ta sẽ cố gắng làm biểu thức sau nhỏ nhất có thể:

$$
\sum_{i = 1}^{n}\left(\sum_{j \in S_i} 2^{T - j} - a_i\right)
$$

- Ta nhận xét thấy với những giá trị $2^{T - j} \ge \max(a_i)$, ta chọn nhãn ($\in [1, n]$) cho $j$ như nào cũng được.
- Do đó, ta xét các giá trị $2^{T - j} < a_i$, việc ta suy nghĩ bây giờ là gán nhãn nào cho $j$. Với những giá trị $2^{T - j}$ càng lớn, ta sẽ gán nhãn cho $i$ với phần còn thiếu lớn nhất: $a_i - \sum_{j_0 \in S_i} 2^{T - j_0}$, với $j_0$ là những "đồng xu" được gán nhãn cho $i$.

> Duy trì multiset lưu giá trị của những "phần còn thiếu", duyệt lần lượt các giá trị $2^{T - j}$ theo thứ tự giảm dần.