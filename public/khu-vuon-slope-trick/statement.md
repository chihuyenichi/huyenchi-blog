**Câu 3** (6 điểm). **Khu vườn**

Alice đang thiết kế một khu vườn gồm $N$ bồn hoa xếp thành một hàng ngang, đánh số từ 1 đến $N$ từ trái sang phải. Ban đầu, bồn hoa thứ $i$ ($1 \le i \le N$) đang chứa $A_i$ đơn vị đất. Để trồng được loại hoa vào bồn hoa thứ $i$, bồn hoa thứ $i$ cần chính xác $B_i$ đơn vị đất. Alice có thể thực hiện ba loại thao tác sau với số lần tùy ý:

*   Mua 1 đơn vị đất từ bên ngoài đổ vào một bồn hoa bất kỳ với chi phí: $X$ đồng.
*   Xúc bỏ 1 đơn vị đất từ một bồn hoa bất kỳ mang đi nơi khác với chi phí: $Y$ đồng.
*   Chuyển 1 đơn vị đất từ bồn hoa thứ $i$ sang bồn hoa thứ $j$ với chi phí: $Z \times |i - j|$ đồng.

**Yêu cầu:** Hãy giúp Alice tính tổng chi phí nhỏ nhất để tất cả các bồn hoa có số lượng đơn vị đất mong muốn.

**Dữ liệu:** Vào từ file văn bản `GARDEN.INP`:

*   Dòng đầu tiên chứa bốn số nguyên không âm $N, X, Y, Z$ ($N \le 10^5; X, Y, Z \le 10^6$).
*   $N$ dòng tiếp theo, dòng thứ $i$ ($1 \le i \le N$) chứa hai số nguyên không âm $A_i, B_i$ ($A_i, B_i \le 10$).

**Kết quả:** Ghi ra file văn bản `GARDEN.OUT` gồm một số nguyên duy nhất là tổng chi phí nhỏ nhất tìm được.

**Ràng buộc:**

*   Có 25% số test thỏa mãn: $N = 2$;
*   25% số test khác thỏa mãn: $N \le 100$;
*   25% số test khác thỏa mãn: $N \le 5000$;
*   25% số test còn lại không có ràng buộc nào thêm.