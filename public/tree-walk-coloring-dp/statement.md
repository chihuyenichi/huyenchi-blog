Cho một đồ thị dạng cây có $n$ đỉnh, $n - 1$ cạnh, các đỉnh được đánh số từ $1$ đến $n$, mỗi đỉnh đều đã được tô màu đen hoặc trắng.

Một đường đi $P$ gọi là tốt nếu ta thu được cây chỉ gồm đỉnh trắng sau khi áp dụng quy trình tô màu trên đồ thị ban đầu: Đi dọc theo $P$, mỗi lần đi qua một đỉnh $u$ thì màu của $u$ sẽ bị thay đổi (đen thành trắng, trắng thành đen).

**Yêu cầu:** Hãy xác định số đỉnh ít nhất có thể của một đường đi tốt. Chú ý một đỉnh có thể đi lại nhiều lần và ban đầu luôn có ít nhất một đỉnh màu đen.

### Input
* Dòng đầu tiên chứa số nguyên $n$ ($2 \le n \le 5 \cdot 10^5$) là số đỉnh của đồ thị;
* Dòng thứ hai chứa một xâu gồm $n$ ký tự '0' hoặc '1'. Nếu ký tự thứ $i$ bằng '0', thì ban đầu đỉnh $i$ có màu đen, nếu bằng '1' thì nó màu trắng;
* Dòng thứ $i$ trong $n - 1$ dòng tiếp theo chứa hai số nguyên $u_i$ và $v_i$ ($1 \le u_i, v_i \le n$) mô tả cạnh nối hai đỉnh $u_i, v_i$.

### Output
* Gồm một số nguyên là số đỉnh tối thiểu của một đường đi tốt.

### Scoring
* $27\%$ số điểm: $2 \le n \le 100$;
* $20\%$ số điểm: Mỗi đỉnh có bậc không quá $2$;
* $28\%$ số điểm: Tất cả đỉnh đều tô màu đen từ đầu;
* $25\%$ số điểm: Không có ràng buộc thêm.