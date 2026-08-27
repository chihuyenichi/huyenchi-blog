Một dàn đèn trang trí gồm $n$ đèn được đánh số từ $1$ đến $n$ và $n - 1$ đoạn dây nối điều khiển, mỗi đoạn nối một cặp hai đèn khác nhau. Hệ thống dây nối điều khiển thoả mãn tính chất sau: Không có hai đoạn dây nào nối cùng một cặp đèn và hơn nữa không tồn tại các đèn $v_1, v_2, ..., v_k$ phân biệt ($k > 2$) trong đó hai đèn liên tiếp có đoạn dây nối và đèn $v_k$ có đoạn dây nối với đèn $v_1$.

Tại mỗi thời điểm, từng đèn sẽ sáng màu xanh hoặc đỏ. Bộ điều khiển hệ thống đèn có thể thực hiện tác động nhiều lần việc thay đổi trạng thái các đèn, mỗi lần tác động là thay đổi màu của một đèn nào đó và tất cả các đèn có dây nối với nó, cụ thể nếu đèn đang sáng màu xanh sẽ chuyển sang sáng màu đỏ, ngược lại nếu đèn đang sáng màu đỏ sẽ chuyển sang sáng màu xanh. Vì một vài lí do kĩ thuật, hệ thống đã bổ sung thêm một đoạn dây nối giữa hai đèn khác nhau $x, y$ (giữa hai đèn này chưa có dây nối trước đó).

**Yêu cầu:** Cho biết trạng thái ban đầu màu của $n$ đèn và thông tin về các dây nối điều khiển ban đầu và dây nối bổ sung, hãy tìm cách điều khiển để tất cả các đèn sáng màu xanh.

### Input
* Dòng đầu chứa hai số nguyên dương $n, T$ là số lượng đèn và số trường hợp thử nghiệm;
* Dòng thứ $k$ trong $n - 1$ dòng tiếp theo chứa thông tin về đoạn dây nối điều khiển thứ $k$ bao gồm hai số nguyên $u_k, v_k$ trong đó $u_k, v_k$ là chỉ số của hai đèn là các đầu mút của đoạn dây nối điều khiển thứ $k$ ($1 \le k \le n - 1$);
* Tiếp theo là một dòng chứa hai số nguyên $x, y$;
* Dòng thứ $i$ ($1 \le i \le T$) trong $T$ dòng cuối chứa $n$ số $c_{i1}, c_{i2}, ..., c_{in}$, trong đó $c_{ij}$ là màu của đèn thứ $j$ trong trường hợp thử nghiệm thứ $i$ ($c_{ij} = 1$ nếu đèn $j$ sáng màu xanh và $c_{ij} = 0$ nếu đèn $j$ sáng màu đỏ).

### Output
* Gồm $T$ dòng, mỗi dòng là phương án điều khiển cho trường hợp thử nghiệm tương ứng trong dữ liệu vào, theo khuôn dạng sau:
    * Ghi $-1$ nếu không tồn tại cách điều khiển thoả mãn.
    * Ngược lại số đầu tiên của dòng là số $s$; tiếp theo là $s$ số $l_1, l_2, ..., l_s$ mô tả cách điều khiển, trong đó tác động thứ $h$ ($1 \le h \le s$) làm đảo màu của đèn $l_h$ và các đèn có dây nối với $l_h$.

### Scoring
* Có 30% số test của bài có $n \le 20; T \le 5$;
* Có 40% số test khác của bài có $n \le 300; T \le 50$;
* Có 30% số test còn lại của bài có $n \le 3000; T \le 500$.