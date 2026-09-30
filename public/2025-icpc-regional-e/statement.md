# Problem E: Electronic Toll Collection

Thành phố Nogias có `n` phường, mỗi phường thuộc một trong bốn quận `1..4`.
Mạng đường gồm `m` đường hai chiều, có thể có nhiều đường giữa cùng một cặp
phường và có thể có đường nối một phường với chính nó. Đồ thị liên thông.

Các cặp quận gây tải giao thông là:

- quận `1` và quận `2`;
- quận `2` và quận `3`;
- quận `3` và quận `4`;
- quận `4` và quận `1`.

Cần lắp ETC trên một số đường sao cho với mỗi cặp quận gây tải, mọi đường đi
từ một phường thuộc quận này tới một phường thuộc quận kia đều đi qua ít nhất
một đường có ETC. Hãy tối thiểu hóa số đường được lắp ETC.

## Input

- Dòng đầu chứa số test `t` (`1 <= t <= 10^5`).
- Mỗi test gồm:
  - Dòng đầu chứa `n, m` (`4 <= n <= 10^5`, `n - 1 <= m <= 10^5`).
  - Dòng thứ hai chứa `n` số `a_1, ..., a_n` (`1 <= a_i <= 4`), là quận của
    từng phường.
  - `m` dòng tiếp theo, mỗi dòng chứa `u, v` (`1 <= u, v <= n`) mô tả một
    đường hai chiều.
- Mỗi quận có ít nhất một phường, đồ thị liên thông.
- Tổng `n` và tổng `m` trên mọi test không vượt quá `10^5`.

## Output

Với mỗi test, in số đường ETC tối thiểu.

## Sample Input 1

```text
1
16 16
1 1 1 1 2 2 2 2 3 3 3 3 4 4 4 4
1 4
2 4
3 4
4 8
5 8
6 8
7 8
8 12
9 12
10 12
11 12
12 16
13 16
14 16
15 16
16 4
```

## Sample Output 1

```text
4
```

## LaTeX (Polygon)

```latex
% ===== Polygon: Legend =====
% Paste vào ô Legend
Thành phố Nogias có $n$ phường, mỗi phường thuộc một trong bốn quận $1..4$.
Mạng đường gồm $m$ đường hai chiều, có thể có nhiều đường giữa cùng một cặp
phường và có thể có đường nối một phường với chính nó. Đồ thị liên thông.

Các cặp quận gây tải giao thông là $(1,2)$, $(2,3)$, $(3,4)$, $(4,1)$.
Cần lắp ETC trên một số đường sao cho với mỗi cặp trên, mọi đường đi giữa hai
quận phải đi qua ít nhất một đường có ETC. Hãy tối thiểu hóa số đường được lắp.

% ===== Polygon: Input =====
% Paste vào ô Input
\begin{itemize}
\item Dòng đầu chứa số test $t$ ($1 \le t \le 10^5$).
\item Mỗi test gồm $n,m$ ($4 \le n \le 10^5$, $n-1 \le m \le 10^5$),
sau đó là $n$ số $a_i$ ($1 \le a_i \le 4$), rồi $m$ dòng đường $u,v$.
\item Mỗi quận có ít nhất một phường, đồ thị liên thông.
\item Tổng $n$ và tổng $m$ trên mọi test không vượt quá $10^5$.
\end{itemize}

% ===== Polygon: Output =====
% Paste vào ô Output
Với mỗi test, in số đường ETC tối thiểu.

% ===== Polygon: Notes =====
% Paste vào ô Notes
Trong ví dụ, có thể chọn $4$ đường để tách mọi phường quận $1,3$ khỏi mọi
phường quận $2,4$; không thể làm ít hơn.

% ===== Polygon: Example (override, optional) =====
\exmp{1\newline 16 16\newline 1 1 1 1 2 2 2 2 3 3 3 3 4 4 4 4\newline 1 4\newline 2 4\newline 3 4\newline 4 8\newline 5 8\newline 6 8\newline 7 8\newline 8 12\newline 9 12\newline 10 12\newline 11 12\newline 12 16\newline 13 16\newline 14 16\newline 15 16\newline 16 4\newline}{4\newline}%
```
