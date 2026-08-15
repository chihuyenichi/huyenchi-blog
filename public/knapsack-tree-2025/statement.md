# Đèn trang trí

## Đề bài

Một dàn đèn trang trí gồm $n$ bóng đèn, được đánh số từ $1$ đến $n$. Ban đầu có $n-1$ dây điều khiển nối các cặp đèn. Các dây này tạo thành một cây:

- Không có hai dây nào nối cùng một cặp đèn.
- Giữa hai đèn bất kỳ luôn có đúng một đường đi đơn.

Mỗi đèn có một trong hai màu:

- `1`: màu xanh.
- `0`: màu đỏ.

Một thao tác chọn một đèn $u$ và đảo màu:

- Chính đèn $u$.
- Tất cả các đèn được nối trực tiếp với $u$ bằng dây điều khiển.

Đảo màu nghĩa là xanh thành đỏ và đỏ thành xanh.

Hệ thống được bổ sung thêm một dây nối hai đèn khác nhau $x$ và $y$. Trước đó, giữa $x$ và $y$ chưa có dây nối trực tiếp. Sau khi thêm dây này, đồ thị có đúng một chu trình.

Với mỗi trạng thái ban đầu, hãy tìm một dãy thao tác để đưa tất cả các đèn về màu xanh.

## Input

- Dòng đầu chứa hai số nguyên $n,T$:
  - $n$ là số lượng đèn.
  - $T$ là số trường hợp thử nghiệm.
- $n-1$ dòng tiếp theo, mỗi dòng chứa hai số nguyên $u_k,v_k$, mô tả một dây ban đầu nối $u_k$ và $v_k$.
- Dòng tiếp theo chứa hai số nguyên $x,y$, là hai đầu mút của dây được bổ sung.
- $T$ dòng cuối, mỗi dòng chứa $n$ số nguyên:

$$
c_{i,1},c_{i,2},\ldots,c_{i,n}.
$$

Trong đó:

- $c_{i,j}=1$ nếu đèn $j$ ban đầu màu xanh trong trường hợp thứ $i$.
- $c_{i,j}=0$ nếu đèn $j$ ban đầu màu đỏ trong trường hợp thứ $i$.

## Output

Với mỗi trường hợp thử nghiệm:

- In `-1` nếu không tồn tại cách đưa tất cả các đèn về màu xanh.
- Ngược lại, in số nguyên $s$, sau đó là $s$ số nguyên

$$
l_1,l_2,\ldots,l_s,
$$

trong đó thao tác thứ $h$ chọn đèn $l_h$.

Nếu có nhiều phương án, có thể in bất kỳ phương án nào.

## Giới hạn

| Nhóm | Giới hạn |
|---|---|
| $30\%$ | $n\le 20$, $T\le 5$ |
| $40\%$ | $n\le 300$, $T\le 50$ |
| $30\%$ | $n\le 3000$, $T\le 500$ |
