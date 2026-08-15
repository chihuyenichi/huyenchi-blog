# Lời giải

## 1. Đổi góc nhìn của bài toán

Đề bài yêu cầu tìm một dãy đỉnh của một đường đi, nhưng đỉnh được phép lặp lại. Vì vậy, về bản chất đây không phải là một simple path, mà là một **walk** trên cây.

Nếu xử lý trực tiếp dãy đỉnh của walk, trạng thái sẽ rất khó kiểm soát:

- cần biết walk bắt đầu và kết thúc ở đâu,
- cần biết khi ghép hai đoạn walk thì đỉnh nối bị tính bao nhiêu lần,
- cần đảm bảo số lần đi qua từng đỉnh tạo đúng parity màu.

Ta đổi góc nhìn: thay vì lưu dãy đỉnh, ta lưu **mỗi cạnh được walk sử dụng bao nhiêu lần**.

Với mỗi cạnh `e`, gọi:

$$
c_e
$$

là số lần walk đi qua cạnh đó. Nếu thay cạnh `e` bằng `c_e` cạnh song song, ta thu được một đa đồ thị. Một walk trên cây ban đầu tương ứng với một đường đi Euler trên đa đồ thị này.

Nếu tổng số lần sử dụng cạnh là:

$$
E=\sum_e c_e,
$$

thì dãy đỉnh của walk có đúng:

$$
E+1
$$

đỉnh. Vì vậy bài toán chuyển thành:

> Tối thiểu hóa tổng số cạnh của đa đồ thị được sử dụng, rồi cộng thêm `1`.

Đây là bước chuyển quan trọng nhất của lời giải.

## 2. Điều kiện tại mỗi đỉnh

Giả sử walk bắt đầu tại `s` và kết thúc tại `t`. Với mỗi đỉnh `u`, đặt:

$$
h_u=[u=s]+[u=t].
$$

Trong đó:

- `h_u = 0`: `u` không phải đầu mút,
- `h_u = 1`: `u` là một trong hai đầu mút khác nhau,
- `h_u = 2`: walk bắt đầu và kết thúc cùng tại `u`.

Luôn có:

$$
\sum_u h_u=2.
$$

Gọi:

$$
D_u=\sum_{e\ni u}c_e
$$

là bậc của `u` trong đa đồ thị.

Mỗi lần `u` xuất hiện ở giữa walk thì đóng góp một cạnh đi vào và một cạnh đi ra. Riêng đầu và cuối walk thiếu một phía. Do đó nếu `visit_u` là số lần walk đi qua đỉnh `u`, ta có:

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

Trong input, ký tự `0` nghĩa là đỉnh đen, nên trong code:

```cpp
a[i] = (c - '0') ^ 1;
```

tức là `a[i] = b_i`.

Để cuối cùng tất cả đỉnh thành trắng:

- đỉnh đen ban đầu phải bị đổi màu số lần lẻ,
- đỉnh trắng ban đầu phải bị đổi màu số lần chẵn.

Nói cách khác:

$$
visit_u\equiv b_u\pmod 2.
$$

Kết hợp với `2visit_u = D_u + h_u`, ta được điều kiện cục bộ tại mỗi đỉnh:

$$
\boxed{D_u+h_u\equiv 2b_u\pmod 4.}
$$

Toàn bộ DP bên dưới chỉ nhằm chọn các `c_e` và các `h_u` sao cho mọi đỉnh đều thỏa phương trình này.

## 3. Vì sao chỉ cần dùng mỗi cạnh tối đa 4 lần

Nếu một cạnh được dùng ít nhất `5` lần, ta có thể giảm số lần dùng cạnh đó đi `4`.

Việc giảm `4` lần:

- không đổi điều kiện modulo `4` tại hai đầu cạnh,
- làm tổng số cạnh sử dụng nhỏ hơn,
- không phá tính liên thông của phần được dùng nếu cạnh đó vẫn còn được dùng.

Vì vậy trong nghiệm tối ưu, mỗi cạnh chỉ cần xét:

$$
c_e\in\{0,1,2,3,4\}.
$$

Khi một cây con được nối với cha, số lần dùng cạnh nối chỉ cần thử:

$$
c\in\{1,2,3,4\}.
$$

## 4. Gốc cây và tính liên thông

Chọn một đỉnh đen bất kỳ làm gốc `R`. Mọi walk hợp lệ đều phải đi qua tất cả đỉnh đen, nên chắc chắn phải đi qua `R`.

Root cây tại `R`. Gọi `T_u` là cây con của `u`.

Ta tính:

```cpp
hasBlack[u]
```

cho biết trong `T_u` có đỉnh đen hay không.

Khi xét một con `v` của `u`:

- Nếu `hasBlack[v] = true`, cạnh `(u, v)` bắt buộc phải được dùng ít nhất một lần.
- Nếu `hasBlack[v] = false`, ta có thể bỏ qua toàn bộ `T_v`, hoặc vẫn nối `T_v` vào walk để chỉnh parity hay đặt đầu mút.

Cách này đảm bảo mọi cạnh được chọn luôn tạo thành một phần liên thông chứa gốc `R`.

## 5. Định nghĩa trạng thái DP

Khi xử lý `T_u`, tất cả điều kiện ở các đỉnh bên dưới `u` có thể được giải quyết hoàn toàn. Riêng điều kiện tại `u` còn phụ thuộc vào cạnh nối `u` với cha.

Vì điều kiện tại đỉnh chỉ dùng modulo `4`, cạnh cha chỉ cần truyền lên phần dư modulo `4`.

Ngoài ra, toàn bộ walk luôn có đúng hai vai trò đầu mút. Trong một cây con, ta chỉ cần biết đã đặt bao nhiêu vai trò đầu mút: `0`, `1`, hoặc `2`.

Định nghĩa:

$$
dp[u][x][y]
$$

là tổng số lần sử dụng cạnh nhỏ nhất của các cạnh nằm hoàn toàn trong `T_u`, **không tính cạnh nối `u` với cha**, thỏa mãn:

- cạnh nối `u` với cha được dùng số lần có phần dư `x` modulo `4`,
- `y` là số vai trò đầu mút được đặt trong `T_u`,
- các đỉnh trong `T_u` đều thỏa điều kiện màu,
- phần cạnh được chọn trong `T_u` liên thông với `u`,
- mọi đỉnh đen trong `T_u` đều thuộc phần được chọn.

Miền trạng thái:

$$
x\in\{0,1,2,3\},\qquad y\in\{0,1,2\}.
$$

Chi phí của cạnh nối với cha không nằm trong `dp[u]`; cạnh đó sẽ được cộng khi cha quyết định nối cây con `T_u`.

## 6. Gộp các cây con

Để tính `dp[u]`, ta lần lượt gộp từng con `v` của `u`.

Dùng bảng tạm:

$$
dp\_pre[r][k]
$$

với ý nghĩa:

- đã xử lý một số con của `u`,
- tổng số lần dùng các cạnh từ `u` xuống những con đã chọn có phần dư `r` modulo `4`,
- đã đặt `k` vai trò đầu mút trong các cây con đó,
- giá trị là chi phí nhỏ nhất.

Khởi tạo:

$$
dp\_pre[0][0]=0.
$$

Các trạng thái khác là vô cực.

## 7. Chuyển khi xét một con `v`

Khi xử lý con `v`, có hai lựa chọn.

### 7.1. Bỏ qua cây con `T_v`

Chỉ được bỏ qua nếu:

```cpp
hasBlack[v] == false
```

Khi đó không thêm cạnh, không thêm đầu mút, chi phí không đổi.

### 7.2. Nối cây con `T_v`

Chọn số lần dùng cạnh `(u, v)`:

$$
c\in\{1,2,3,4\}.
$$

Chọn số vai trò đầu mút trong `T_v`:

$$
y_2\in\{0,1,2\}.
$$

Phần bên trong `T_v` có chi phí:

$$
dp[v][c\bmod 4][y_2].
$$

Tổng chi phí tăng thêm là:

$$
c + dp[v][c\bmod 4][y_2].
$$

Với trạng thái hiện tại `dp_pre[x][y]`, chuyển sang:

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

Ngoài ra, qua lát cắt `(u, v)`, parity của số lần dùng cạnh phải khớp với parity số đầu mút nằm trong `T_v`:

$$
c\equiv y_2\pmod 2.
$$

Trong code:

```cpp
if ((c & 1) != (y2 & 1)) continue;
```

## 8. Hoàn thành trạng thái tại đỉnh `u`

Sau khi gộp hết các con, ta quyết định đặt bao nhiêu vai trò đầu mút ngay tại `u`.

Gọi:

$$
y_u\in\{0,1,2\}
$$

là số vai trò đầu mút đặt tại `u`.

Giả sử các cạnh xuống con đóng góp phần dư `x`, số endpoint trong các cây con là `y`, và cạnh cha cần có phần dư `x2`.

Điều kiện tại đỉnh `u` là:

$$
\boxed{x+x2+y_u\equiv 2b_u\pmod 4.}
$$

Vì vậy code tính trực tiếp `x2`:

```cpp
int x2 = (-(x + y_u - 2 * a[u]) % 4 + 4) % 4;
```

Nếu `y + y_u <= 2`, cập nhật:

$$
\boxed{
dp[u][x2][y+y_u]
=
\min(dp[u][x2][y+y_u], dp\_pre[x][y]).
}
$$

Đây là bước đảm bảo phương trình màu tại chính đỉnh `u`.

## 9. Trường hợp lá

Nếu `u` là lá, không có cạnh xuống con.

Khi đó chỉ cần xét cạnh cha và số endpoint đặt tại `u`:

$$
x+y\equiv 2b_u\pmod 4.
$$

Nếu đúng:

$$
dp[u][x][y]=0.
$$

Chi phí bằng `0` vì cạnh cha chưa được tính trong `dp[u]`.

## 10. Lấy đáp án

Tại gốc `R`:

- không có cạnh cha, nên phần dư cạnh cha là `0`,
- một walk luôn có đúng `2` vai trò đầu mút.

Do đó tổng số lần dùng cạnh nhỏ nhất là:

$$
dp[R][0][2].
$$

Số đỉnh trong walk bằng số cạnh được dùng cộng `1`, nên đáp án là:

$$
\boxed{dp[R][0][2]+1.}
$$

Trong code:

```cpp
cout << dp[tr_root][0][2] + 1 << '\n';
```

## 11. Cách triển khai

Các bước chính:

1. Đọc màu đỉnh, đổi `0` thành đỉnh đen:

```cpp
a[i] = (c - '0') ^ 1;
```

2. Chọn một đỉnh đen làm gốc `tr_root`.
3. DFS hậu tự để tính `hasBlack[u]` và `dp[u]`.
4. Với mỗi đỉnh, gộp lần lượt các con bằng hai bảng nhỏ `dp_pre` và `dp_cur`.
5. Với mỗi cạnh con, thử `c = 1..4`.
6. Sau khi gộp con, đặt `y_u = 0..2` tại đỉnh `u` để hoàn tất điều kiện:

$$
D_u+h_u\equiv 2b_u\pmod 4.
$$

Vì mỗi bảng chỉ có `4 * 3 = 12` trạng thái và mỗi cạnh chỉ thử hằng số lựa chọn, thuật toán chạy tuyến tính theo số đỉnh.

## 12. Chứng minh đúng đắn

### 12.1. Từ walk sang DP

Với một walk hợp lệ, đặt `c_e` là số lần walk dùng cạnh `e`, và đặt `h_u` theo hai đầu mút.

Ta luôn có:

$$
D_u+h_u\equiv 2b_u\pmod 4.
$$

Các cạnh được dùng tạo thành một phần liên thông chứa mọi đỉnh đen. Khi root cây tại một đỉnh đen, mỗi cây con hoặc bị bỏ qua hoàn toàn, hoặc được nối với cha bằng một cạnh dùng `1..4` lần.

Đây chính là các lựa chọn mà DP xét.

### 12.2. Từ DP sang walk

Xét nghiệm tối ưu tại `dp[R][0][2]`. Thay mỗi cạnh được dùng `c_e` lần bằng `c_e` cạnh song song.

Theo cách chuyển DP:

- đa đồ thị thu được liên thông,
- tổng số endpoint role bằng `2`,
- mọi đỉnh thỏa `D_u+h_u ≡ 2b_u (mod 4)`.

Từ đó:

$$
D_u\equiv h_u\pmod 2.
$$

Nên đa đồ thị có đúng dạng cho phép tồn tại đường đi Euler:

- nếu có hai đỉnh mang `h_u = 1`, đó là hai đỉnh bậc lẻ,
- nếu một đỉnh mang `h_u = 2`, mọi bậc đều chẵn và tồn tại chu trình Euler.

Đường đi Euler này tương ứng với một walk trên cây ban đầu. Từ:

$$
2visit_u=D_u+h_u
$$

suy ra:

$$
visit_u\equiv b_u\pmod 2.
$$

Vì vậy các đỉnh đen bị đổi màu số lần lẻ, các đỉnh trắng bị đổi màu số lần chẵn. Sau walk, toàn bộ cây thành trắng.

## 13. Độ phức tạp

Mỗi đỉnh có:

$$
4\cdot3=12
$$

trạng thái.

Mỗi cạnh được gộp với số lựa chọn hằng số, nên:

$$
\text{Thời gian }O(n),
$$

$$
\text{Bộ nhớ }O(n).
$$

Với `n <= 5 * 10^5`, nếu môi trường stack nhỏ thì nên triển khai DFS lặp. Code hiện tại dùng DFS đệ quy, nên khi nộp ở môi trường stack thấp cần chú ý giới hạn stack.
