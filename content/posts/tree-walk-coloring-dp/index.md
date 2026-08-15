---
title: "Đổi màu trên cây - DP trên số lần dùng cạnh"
slug: "tree-walk-coloring-dp"
date: "2026-08-15"
description: "Chuyển bài toán tìm walk đổi màu trên cây thành tối ưu số cạnh của đa đồ thị được sử dụng, rồi giải bằng DP on tree modulo 4."
category: "misc"
event: "Competitive Programming Notes"
year: 2026
difficulty: "hard"
author: "Huyen Chi"
tags:
  - cp
  - dp on tree
  - tree
  - graph theory
  - euler trail
status: "published"
---

## Tài liệu tham chiếu

- [Đề bài `statement.md`](/tree-walk-coloring-dp/statement.md)
- [Editorial đầy đủ `editorial.md`](/tree-walk-coloring-dp/editorial.md)
- [Source code `solve.cpp`](/tree-walk-coloring-dp/solve.cpp)

## Đổi góc nhìn

Đề yêu cầu tìm một dãy đỉnh của một đường đi, nhưng đỉnh được phép lặp lại. Vì vậy, đối tượng thật sự cần xét là một **walk** trên cây, không phải simple path.

Nếu lưu trực tiếp dãy đỉnh của walk, trạng thái sẽ khó kiểm soát vì phải biết hai đầu mút, cách ghép các đoạn walk, và số lần mỗi đỉnh bị tính khi nối các đoạn lại với nhau.

Ta đổi cách nhìn: thay vì lưu dãy đỉnh, lưu **mỗi cạnh được walk sử dụng bao nhiêu lần**.

Với mỗi cạnh `e`, gọi:

$$
c_e
$$

là số lần walk đi qua cạnh đó. Nếu thay cạnh `e` bằng `c_e` cạnh song song, ta thu được một đa đồ thị. Walk cần tìm tương ứng với một đường đi Euler trên đa đồ thị này.

Nếu:

$$
E=\sum_e c_e
$$

là tổng số lần dùng cạnh, thì số đỉnh trong walk bằng:

$$
E+1.
$$

Vì vậy bài toán chuyển thành tối thiểu hóa tổng số cạnh của đa đồ thị được sử dụng, sau đó cộng thêm `1`.

## Phương trình tại mỗi đỉnh

Giả sử walk bắt đầu tại `s` và kết thúc tại `t`. Với mỗi đỉnh `u`, đặt:

$$
h_u=[u=s]+[u=t].
$$

Trong đó `h_u` là số vai trò đầu mút đặt tại `u`. Tổng tất cả `h_u` luôn bằng `2`.

Gọi:

$$
D_u=\sum_{e\ni u}c_e
$$

là bậc của `u` trong đa đồ thị.

Nếu `visit_u` là số lần walk đi qua `u`, thì:

$$
2visit_u=D_u+h_u.
$$

Đặt:

$$
b_u=
\begin{cases}
1 & \text{nếu }u\text{ ban đầu màu đen},\\
0 & \text{nếu }u\text{ ban đầu màu trắng}.
\end{cases}
$$

Để sau cùng toàn bộ cây trắng, cần:

$$
visit_u\equiv b_u\pmod 2.
$$

Kết hợp hai công thức, ta thu được điều kiện cục bộ tại mỗi đỉnh:

$$
\boxed{D_u+h_u\equiv 2b_u\pmod 4.}
$$

Đây là phương trình mà DP phải đảm bảo cho từng đỉnh.

## Giới hạn số lần dùng cạnh

Nếu một cạnh được dùng ít nhất `5` lần, ta có thể giảm số lần dùng cạnh đó đi `4`.

Điều này không làm đổi điều kiện modulo `4` tại hai đầu cạnh, nhưng làm tổng số cạnh sử dụng nhỏ hơn. Do đó trong nghiệm tối ưu, mỗi cạnh chỉ cần xét:

$$
c_e\in\{0,1,2,3,4\}.
$$

Khi nối một cây con với cha, chỉ cần thử số lần dùng cạnh:

$$
c\in\{1,2,3,4\}.
$$

## Root cây

Chọn một đỉnh đen bất kỳ làm gốc `R`. Mọi walk hợp lệ đều phải đi qua các đỉnh đen, nên chắc chắn đi qua `R`.

Root cây tại `R`. Với mỗi cây con `T_u`, tính:

```cpp
hasBlack[u]
```

cho biết trong `T_u` có đỉnh đen hay không.

Khi xét con `v` của `u`:

- Nếu `hasBlack[v] = true`, cạnh `(u, v)` bắt buộc phải được dùng.
- Nếu `hasBlack[v] = false`, có thể bỏ qua toàn bộ `T_v`, hoặc vẫn nối nó vào walk để chỉnh parity hay đặt đầu mút.

Cách này giữ cho phần cạnh được chọn luôn liên thông quanh gốc `R`.

## Trạng thái DP

Định nghĩa:

$$
dp[u][x][y]
$$

là tổng số lần dùng cạnh nhỏ nhất của các cạnh nằm hoàn toàn trong `T_u`, **không tính cạnh nối `u` với cha**, thỏa mãn:

- cạnh nối `u` với cha được dùng số lần có phần dư `x` modulo `4`,
- `y` là số vai trò đầu mút đã đặt trong `T_u`,
- mọi đỉnh trong `T_u` đều thỏa điều kiện màu,
- phần cạnh được chọn trong `T_u` liên thông với `u`,
- mọi đỉnh đen trong `T_u` đều thuộc phần được chọn.

Miền trạng thái:

$$
x\in\{0,1,2,3\},\qquad y\in\{0,1,2\}.
$$

Chi phí của cạnh nối với cha chưa được cộng trong `dp[u]`; cạnh đó sẽ được cộng khi cha quyết định nối `T_u`.

## Gộp các con

Để tính `dp[u]`, lần lượt gộp từng con `v` của `u` bằng bảng tạm:

$$
dp\_pre[r][k].
$$

Ý nghĩa:

- đã xử lý một số con của `u`,
- tổng số lần dùng các cạnh từ `u` xuống các con đã chọn có phần dư `r` modulo `4`,
- đã đặt `k` vai trò đầu mút trong các cây con đó,
- giá trị là chi phí nhỏ nhất.

Khởi tạo:

$$
dp\_pre[0][0]=0.
$$

Khi xét con `v`, có hai lựa chọn.

Nếu `hasBlack[v] = false`, có thể bỏ qua `T_v`.

Nếu nối `T_v`, chọn:

$$
c\in\{1,2,3,4\}
$$

là số lần dùng cạnh `(u, v)`, và chọn:

$$
y_2\in\{0,1,2\}
$$

là số endpoint role trong `T_v`.

Chuyển trạng thái:

$$
\boxed{
dp\_cur[(x+c)\bmod 4][y+y_2]
=
\min\left(
dp\_cur[(x+c)\bmod 4][y+y_2],
dp\_pre[x][y]+c+dp[v][c\bmod 4][y_2]
\right).
}
$$

Điều kiện:

$$
y+y_2\le 2.
$$

Ngoài ra, qua lát cắt `(u, v)`, parity của số lần dùng cạnh phải khớp với parity số endpoint role trong `T_v`:

$$
c\equiv y_2\pmod 2.
$$

Trong code:

```cpp
if ((c & 1) != (y2 & 1)) continue;
```

## Hoàn thành tại đỉnh `u`

Sau khi gộp hết các con, chọn số endpoint role đặt ngay tại `u`:

$$
y_u\in\{0,1,2\}.
$$

Giả sử các cạnh xuống con đóng góp phần dư `x`, cạnh cha cần phần dư `x2`, thì điều kiện tại `u` là:

$$
\boxed{x+x2+y_u\equiv 2b_u\pmod 4.}
$$

Code tính trực tiếp:

```cpp
int x2 = (-(x + y_u - 2 * a[u]) % 4 + 4) % 4;
```

Sau đó cập nhật:

$$
dp[u][x2][y+y_u]
=
\min(dp[u][x2][y+y_u], dp\_pre[x][y]).
$$

với điều kiện `y + y_u <= 2`.

## Đáp án

Tại gốc `R`:

- không có cạnh cha, nên phần dư cạnh cha là `0`,
- một walk luôn có đúng `2` endpoint role.

Tổng số lần dùng cạnh nhỏ nhất là:

$$
dp[R][0][2].
$$

Số đỉnh của walk bằng số cạnh được dùng cộng `1`, nên đáp án là:

$$
\boxed{dp[R][0][2]+1.}
$$

## Độ phức tạp

Mỗi đỉnh có `4 * 3 = 12` trạng thái. Mỗi cạnh chỉ thử số lựa chọn hằng số.

Do đó:

$$
\text{Thời gian }O(n),\qquad \text{Bộ nhớ }O(n).
$$

Với `n <= 5 * 10^5`, code đệ quy có thể cần chú ý giới hạn stack trên một số môi trường.
