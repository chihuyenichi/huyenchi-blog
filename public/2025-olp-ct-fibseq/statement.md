# Bài 3 — DÂY NGẮN NHẤT

## Tóm tắt / mô tả lại đề

Ban chuyên tin và không chuyên tin của Olympic Tin học Siêu Nhân có hai bài
toán với khung dữ liệu vào giống nhau. Đầu là một dãy số nguyên dương
$a = (a_1, a_2, \dots, a_k)$ gồm các giá trị nằm trong dãy Fibonacci (hai phần
tử trong dãy $a$ có thể bằng nhau), tuy nhiên:

- **Bài toán 1** có ràng buộc: tổng các phần tử của dãy $a$ phải bằng $m$:
  $$a_1 + a_2 + \dots + a_k = m$$
- **Bài toán 2** lại có ràng buộc: phép toán BITWISE-XOR trên tất cả các phần
  tử của $a$ phải bằng $n$:
  $$a_1 \oplus a_2 \oplus \dots \oplus a_k = n$$

Trước giờ thì, Ban Giám khảo phải tạo input cho các testcase. Vì muốn tiết kiệm
dung lượng lưu trữ, người ta tìm cách để hệ thống chấm hai bài toán này dùng
chung input.

**Yêu cầu:** Nhiệm vụ của bạn là tìm một dãy $a = (a_1, a_2, \dots, a_k)$ gồm
các giá trị nguyên dương nằm trong dãy Fibonacci mà thỏa mãn ràng buộc của cả
hai bài toán để vừa có thể làm input cho bài toán 1, vừa có thể làm input cho
bài toán 2. Nếu có nhiều dãy $a$ như vậy, tìm dãy $a$ **ngắn nhất** có thể và cho
biết **số phần tử của dãy** ($k$).

**Định nghĩa ❶ — Dãy số Fibonacci:** $f_0, f_1, \dots$ là một dãy vô hạn các
số nguyên dương định nghĩa như sau:

$$f_0 = 0, \quad f_1 = 1, \quad f_i = f_{i-1} + f_{i-2}, \text{ với } i \ge 2$$

$$(0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, \dots)$$

**Định nghĩa ❷ — Phép toán BITWISE-XOR ($\oplus$):** Trong các ngôn ngữ lập
trình C, C++, Java, Python, phép toán BITWISE-XOR ($\oplus$) được viết bằng
toán tử `^`.

> **Lưu ý:** vì các phần tử của dãy $a$ phải là *số nguyên dương*, nên giá trị
> $f_0 = 0$ không thể dùng được. Đồng thời, $f_1 = f_2 = 1$ là **cùng một giá
> trị** $1$, nên tập giá trị Fibonacci dùng được là $1, 2, 3, 5, 8, 13, \dots$

## Dữ liệu

- Dòng 1 chứa số nguyên $T \le 10$ là số test.
- $T$ dòng tiếp theo, mỗi dòng chứa hai số nguyên $m, n$ tương ứng với một
  test ($1 \le m \le 10^{12}$; $0 \le n \le 10^{12}$).

## Kết quả

Ứng với mỗi test, ghi ra trên một dòng **số phần tử của dãy $a$ tìm được**, hoặc
ghi số `-1` nếu không tồn tại dãy $a$ thỏa mãn yêu cầu đặt ra.

## Các subtask

| Subtask | Điểm | Điều kiện |
|---|---|---|
| 1 | 20% | $m, n < 10^{4}$ |
| 2 | 20% | $T \le 2$, $m, n < 10^{7}$ |
| 3 | 30% | $T \le 2$, $m, n < 10^{9}$ |
| 4 | 30% | Không ràng buộc bổ sung |

## Ví dụ

```text
Sample Input
6
19 13
17 7
100 82
1000 744
701408731 15431301
15 8
```

```text
Sample Output
3
4
3
5
27
-1
```

**Giải thích:**

- $m = 19$, $n = 13$: chọn dãy $a = (3, 13, 3)$ — tổng $19$, XOR $13$, $k = 3$.
- $m = 17$, $n = 7$: chọn dãy $a = (2, 5, 5, 5)$ — tổng $17$, XOR $7$, $k = 4$.
- $m = 100$, $n = 82$: chọn dãy $a = (3, 8, 89)$ — tổng $100$, XOR $82$, $k = 3$.
- $m = 1000$, $n = 744$: chọn dãy $a = (13, 55, 89, 233, 610)$ — tổng $1000$,
  XOR $744$, $k = 5$.
- $m = 701408731$, $n = 15431301$: dãy ngắn nhất có $27$ phần tử.
- $m = 15$, $n = 8$: không tồn tại dãy $a$ thỏa mãn, in `-1`.

---
