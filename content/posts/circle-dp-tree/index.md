---
title: "Đèn trang trí - Knapsack on Tree trên chu trình"
slug: "circle-dp-tree"
date: "2026-08-28"
description: "Tách đồ thị một chu trình thành các cây treo, nén mỗi cây bằng DP nhỏ rồi ghép các trạng thái bằng DP tuyến tính trên chu trình."
category: "misc"
event: "Competitive Programming Notes"
year: 2026
difficulty: "hard"
author: "Huyen Chi"
tags:
  - cp
  - dp on tree
  - knapsack on tree
  - graph theory
status: "published"
---

# Knapsack on Tree

## Tài liệu tham chiếu

- [Đề bài `statement.md`](/circle-dp-tree/statement.md)
- [Source code `solve.cpp`](/circle-dp-tree/solve.cpp)

Lõi của lời giải là `knapsack on tree` trên các cây treo của chu trình duy nhất. Sau khi nén mỗi cây treo thành một state rất nhỏ, ta chỉ còn ghép các state đó bằng một DP tuyến tính trên chu trình.

## Mục lục

1. [Tóm tắt bài toán](#1-tom-tat-bai-toan)
2. [Quan sát nền tảng](#2-quan-sat-nen-tang)
3. [Tách Chu Trình và Cây Treo](#3-tach-chu-trinh-va-cay-treo)
4. [State DP của Cây Treo](#4-state-dp-cua-cay-treo)
5. [Knapsack on Tree](#5-knapsack-on-tree)
6. [Ghép Các Gốc Trên Chu Trình](#6-ghep-cac-goc-tren-chu-trinh)
7. [Xử lý Đỉnh Đầu Chu Trình](#7-xu-ly-dinh-dau-chu-trinh)
8. [Truy Vết Nghiệm](#8-truy-vet-nghiem)
9. [Vì Sao Lời Giải Đúng](#9-vi-sao-loi-giai-dung)
10. [Độ Phức Tạp](#10-do-phuc-tap)

## 1. Tóm tắt bài toán

Ta có một cây gồm `n` đỉnh. Sau đó thêm đúng một cạnh mới `(x, y)`, nên toàn bộ đồ thị thu được có đúng một chu trình đơn.

Mỗi đỉnh có một màu:

- `1` là xanh;
- `0` là đỏ.

Một thao tác "bấm đỉnh `u`" sẽ đảo màu:

- chính đỉnh `u`;
- mọi đỉnh kề với `u`.

Với mỗi cấu hình màu ban đầu, cần tìm một tập các đỉnh để bấm sao cho cuối cùng mọi đỉnh đều xanh, hoặc kết luận vô nghiệm.

## 2. Quan sát nền tảng

### 2.1. Mỗi đỉnh chỉ cần xét bấm `0/1` lần

Nếu bấm một đỉnh hai lần thì mọi đỉnh bị ảnh hưởng bởi nó cũng bị đảo hai lần, tức là quay về trạng thái cũ.

Do đó:

- bấm `2` lần tương đương không bấm;
- bấm `3` lần tương đương bấm `1` lần;
- nói chung chỉ cần quan tâm parity.

Vì vậy bài toán hoàn toàn làm việc trên `GF(2)`, tức là mọi biến chỉ là `0` hoặc `1`.

### 2.2. Thứ tự bấm không quan trọng

Mỗi thao tác chỉ là XOR thêm `1` vào một tập đỉnh cố định. XOR thì giao hoán và kết hợp được, nên:

- ta chỉ cần biết đỉnh nào được bấm;
- không cần biết thứ tự bấm.

Điều này cho phép chuyển bài toán từ "mô phỏng thao tác" sang "chọn tập đỉnh".

### 2.3. Sau khi thêm một cạnh, đồ thị có đúng một chu trình

Đồ thị ban đầu là cây có `n - 1` cạnh. Thêm một cạnh mới vào cây thì tạo đúng một chu trình đơn.

Đây là cấu trúc cực kỳ quan trọng:

- phần nằm trên chu trình cần xử lý vòng phụ thuộc;
- mọi phần còn lại chỉ là các cây treo gắn vào các đỉnh của chu trình.

Vì vậy ta tách bài toán thành hai lớp:

1. giải các cây treo;
2. ghép kết quả lại trên chu trình.

## 3. Tách Chu Trình và Cây Treo

Gọi chu trình duy nhất là:

```text
v0, v1, v2, ..., v(m-1)
```

theo thứ tự vòng tròn.

Sau khi bỏ các cạnh của chu trình, với mỗi `vi` ta thu được một cây treo gốc tại `vi`.

Khi đó:

- trong cây treo của `vi`, mọi đỉnh chỉ còn phụ thuộc vào cha-con như một cây bình thường;
- giữa các cây treo, tương tác duy nhất đi qua các đỉnh `vi` trên chu trình.

Ý tưởng lớn là:

- với mỗi gốc chu trình `vi`, gom toàn bộ thông tin từ cây treo của nó thành một vài trạng thái rất nhỏ;
- sau đó chạy DP trên dãy đỉnh của chu trình.

## 4. State DP của Cây Treo

### 4.1. Định nghĩa state

Với một đỉnh `u`, xét cây treo gốc `u` sau khi bỏ toàn bộ cạnh thuộc chu trình.

Định nghĩa:

```text
dp[u][press_u][base_color_u] = 1
```

nếu tồn tại cách chọn các đỉnh được bấm trong toàn bộ cây con của `u` sao cho:

- mọi đỉnh con đúng nghĩa của `u` đều đã xanh hoàn toàn;
- `press_u` là `0/1`, cho biết có bấm `u` hay không;
- `base_color_u` là màu hiện tại của `u` sau khi:
  - bắt đầu từ màu ban đầu `a[u]`,
  - bấm `u` nếu `press_u = 1`,
  - nhận toàn bộ ảnh hưởng từ các đỉnh con của `u` được bấm,
  - nhưng chưa nhận tác động từ cha của `u`.

Đây là định nghĩa then chốt.

`base_color_u` chưa phải màu cuối cùng của `u`, vì sau này cha của `u` còn có thể bấm và làm `u` đổi màu thêm một lần nữa.

### 4.2. Công thức màu của `u`

Nếu XOR của tất cả các con của `u` được bấm là `child_xor`, thì:

```text
base_color_u = a[u] xor press_u xor child_xor
```

Lý do:

- tự bấm `u` làm `u` bị đảo `press_u` lần;
- mỗi đứa con được bấm sẽ tác động lên cha `u` đúng 1 lần;
- tất cả tính theo parity.

### 4.3. Điều kiện để một đứa con `v` đã "xử lý xong"

Trong `dp[v][press_v][base_color_v]`, màu `base_color_v` là màu của `v` trước khi nhận tác động từ cha `u`.

Nếu `u` được bấm, `v` sẽ bị đảo thêm 1 lần. Nếu `u` không bấm, `v` không đổi thêm.

Vì ta cần `v` cuối cùng là xanh, điều kiện là:

```text
base_color_v xor press_u = 1
```

hay viết ngắn:

```text
color_v xor press_u = 1
```

Đây là chỗ kết nối giữa state của con và quyết định bấm ở cha.

## 5. Knapsack on Tree

### 5.1. Vì sao gọi là knapsack trên cây

Khi xử lý một đỉnh `u`, giả sử `press_u` đã cố định.

Mỗi đứa con `v` có thể đóng góp một vài trạng thái hợp lệ:

- chọn `press_v = 0` hoặc `1`;
- chọn `base_color_v = 0` hoặc `1`;
- nhưng chỉ những trạng thái thỏa `base_color_v xor press_u = 1` mới được phép.

Khi ghép nhiều con lại, thứ ta cần nhớ không phải toàn bộ chi tiết từng con, mà chỉ là:

```text
xor_press_children
```

tức XOR của các con được bấm.

Vậy khi đi qua từng con, ta đang làm đúng kiểu:

- có một "trọng lượng trạng thái" hiện tại là `child_xor`;
- ghép thêm một món đồ là đứa con `v`;
- trạng thái mới là `child_xor xor press_v`.

Đó chính là một dạng knapsack trên cây, nhưng "trọng lượng" ở đây không phải tổng số học mà là XOR parity.

### 5.2. State merge trung gian

Ta dùng state trung gian:

```text
merge_ok[child_xor][press_u]
```

ý nghĩa:

- đã xử lý xong một số con của `u`;
- `child_xor` là XOR của các con đã chọn bấm;
- `press_u` là quyết định cố định của `u`.

Base case:

```text
merge_ok[0][0] = 1
merge_ok[0][1] = 1
```

vì khi chưa ghép đứa con nào thì XOR số con được bấm bằng `0`.

### 5.3. Công thức chuyển khi ghép thêm một con

Giả sử đang ở trạng thái:

```text
merge_ok[cur_xor][press_u] = 1
```

và xét một trạng thái hợp lệ của con:

```text
dp[v][press_v][color_v] = 1
```

nếu:

```text
color_v xor press_u = 1
```

thì có thể chuyển sang:

```text
merge_ok[cur_xor xor press_v][press_u] = 1
```

Đây chính là phần knapsack cốt lõi của cây.

### 5.4. Chốt state cho `dp[u]`

Sau khi ghép xong toàn bộ con, với mỗi trạng thái:

```text
merge_ok[child_xor][press_u] = 1
```

ta suy ra:

```text
base_color_u = a[u] xor press_u xor child_xor
```

và gán:

```text
dp[u][press_u][base_color_u] = 1
```

Vì `child_xor`, `press_u`, `base_color_u` đều chỉ có 2 giá trị, state của mỗi đỉnh là hằng số rất nhỏ.

## 6. Ghép Các Gốc Trên Chu Trình

Sau khi đã nén mỗi cây treo thành `dp[vi][press_i][base_color_i]`, ta chỉ còn bài toán trên chu trình.

### 6.1. Công thức màu cuối cùng trên chu trình

Với đỉnh `vi` trên chu trình:

```text
final_color_i = base_color_i xor press_{i-1} xor press_{i+1}
```

vì `base_color_i` chưa tính tác động từ 2 hàng xóm trên chu trình, còn mỗi hàng xóm nếu được bấm sẽ đảo `vi` một lần.

Điều kiện cần là:

```text
final_color_i = 1
```

### 6.2. Cách duyệt tuần tự trên chu trình

Nếu mở chu trình thành dãy:

```text
v0, v1, v2, ..., v(m-1)
```

thì khi đang xử lý từ trái sang phải, ta muốn "chốt" từng đỉnh một.

Định nghĩa:

```text
current_color_i = base_color_i xor press_{i-1}
```

nghĩa là:

- `vi` đã nhận tác động từ đỉnh trước `v(i-1)`;
- nhưng chưa nhận tác động từ đỉnh sau `v(i+1)`.

Khi thử chọn `press_{i+1}`, ta chốt được `vi` bằng điều kiện:

```text
current_color_i xor press_{i+1} = 1
```

Sau đó trạng thái mang sang đỉnh tiếp theo là:

```text
current_color_{i+1} = base_color_{i+1} xor press_i
```

Đây là xương sống của DP trên chu trình.

## 7. Xử lý Đỉnh Đầu Chu Trình

Đây là chỗ dễ sai nhất.

Nếu ta xử lý `v0` giống hệt các đỉnh giữa, thì ngay sau khi xét `v1` ta sẽ muốn chốt `v0`.

Nhưng điều đó sai, vì `v0` còn phụ thuộc vào `v(m-1)`.

Thật vậy:

```text
final_color_0 = base_color_0 xor press_1 xor press_{m-1}
```

Sau khi mới biết `press_1`, ta vẫn chưa biết `press_{m-1}`.

### 7.1. Biến `pending_color_0`

Ta xử lý riêng cặp đầu tiên `(v0, v1)` và lưu:

```text
pending_color_0 = base_color_0 xor press_1
```

Ý nghĩa:

- `v0` đã ăn tác động từ `v1`;
- nhưng vẫn đang chờ tác động từ đỉnh cuối `v(m-1)`.

Đồng thời với `v1`, ta lưu:

```text
current_color_1 = base_color_1 xor press_0
```

### 7.2. State của DP chu trình

State mà code mang theo là:

- `current_mask`: chứa `(press_i, current_color_i)` của đỉnh đang đứng cuối đoạn đã xử lý;
- `start_info`: chứa `(press_0, pending_color_0)`.

Nói cách khác, toàn bộ ảnh hưởng của đoạn đầu chu trình được nén vào đúng 2 bit của `v0`.

### 7.3. Chuyển trạng thái trên chu trình

Giả sử ta đang ở đỉnh trước `v(i-1)` với:

- `prev_press = press_{i-1}`;
- `prev_color = current_color_{i-1}`.

Xét một lựa chọn của đỉnh hiện tại `vi`:

```text
dp[vi][press_i][base_color_i] = 1
```

Trước hết, để chốt đỉnh trước:

```text
prev_color xor press_i = 1
```

Nếu điều này đúng, ta sinh:

```text
current_color_i = base_color_i xor prev_press
```

và chuyển sang state mới:

```text
(press_i, current_color_i)
```

### 7.4. Khép chu trình ở đỉnh cuối

Khi `i = m - 1`, ngoài việc chốt các đỉnh ở giữa, còn phải thỏa đồng thời:

```text
current_color_{m-1} xor press_0 = 1
pending_color_0 xor press_{m-1} = 1
```

Hai điều kiện này lần lượt có nghĩa:

- đỉnh cuối nhận tác động từ đỉnh đầu và phải thành xanh;
- đỉnh đầu nhận tác động từ đỉnh cuối và phải thành xanh.

Đây là bước đóng vòng.

## 8. Truy Vết Nghiệm

### 8.1. Truy vết trên chu trình

Trong DP chu trình, mỗi state lưu đỉnh trước nó đến từ state nào.

Sau khi tìm được một state cuối hợp lệ, ta lần ngược lại để khôi phục:

- `press_i` cho mọi đỉnh trên chu trình;
- `base_color_i` tương ứng của từng gốc chu trình.

Với `i >= 1`, từ công thức:

```text
current_color_i = base_color_i xor press_{i-1}
```

ta suy ra:

```text
base_color_i = current_color_i xor press_{i-1}
```

Riêng đỉnh đầu:

```text
pending_color_0 = base_color_0 xor press_1
```

nên:

```text
base_color_0 = pending_color_0 xor press_1
```

### 8.2. Truy vết trong cây treo

Khi đã biết với mỗi gốc `u` trên chu trình:

- `press_u`;
- `base_color_u`;

ta cần phục hồi các lựa chọn của toàn bộ con cháu.

Từ công thức:

```text
base_color_u = a[u] xor press_u xor child_xor
```

ta suy ra XOR của các con cần đạt là:

```text
child_xor = a[u] xor press_u xor base_color_u
```

Sau đó ta chạy lại đúng knapsack trên danh sách con của `u`, nhưng lần này lưu truy vết để biết:

- ở mỗi con `v`, chọn `press_v` nào;
- chọn `color_v` nào.

Rồi đệ quy xuống tiếp các con đó.

Cuối cùng, nếu `press_u = 1` thì đưa `u` vào đáp án.

## 9. Vì sao lời giải đúng

### 9.1. Đúng cho cây treo

`dp[u][press_u][base_color_u]` lưu đúng toàn bộ thông tin mà phần bên ngoài cần biết về cây treo tại `u`:

- mọi đỉnh dưới `u` đã xanh hết;
- ảnh hưởng còn "lòi ra ngoài" chỉ còn là trạng thái của chính `u`;
- trạng thái đó được mô tả đầy đủ bởi:
  - `u` có bấm hay không;
  - màu hiện tại của `u` trước khi cha tác động.

Vì các con độc lập với nhau ngoài việc cùng ảnh hưởng lên `u`, nên ghép các con bằng knapsack theo `child_xor` là đầy đủ và không mất thông tin.

### 9.2. Đúng cho chu trình

Sau khi nén mỗi cây treo, sự phụ thuộc còn lại chỉ nằm trên chu trình.

Khi duyệt tuần tự, để quyết định hợp lệ ở bước kế tiếp, ta chỉ cần biết:

- đỉnh trước có bấm hay không;
- màu hiện tại của đỉnh trước trước khi nhận tác động từ đỉnh kế tiếp;
- riêng đỉnh đầu cần thêm thông tin `pending_color_0`.

Đó chính là các state đang lưu. Mọi điều kiện để một đỉnh cuối cùng xanh đều được kiểm tra đúng một lần:

- đỉnh giữa được kiểm tra khi xử lý đỉnh ngay sau nó;
- đỉnh đầu và đỉnh cuối được kiểm tra ở bước khép vòng.

### 9.3. Truy vết là hợp lệ

Phần truy vết chỉ đi ngược lại các transition đã được xác nhận là hợp lệ trong DP:

- trên chu trình: lần theo `pre_mask`;
- trong cây: lần theo knapsack của các con.

Vì vậy tập đỉnh được in ra luôn tương ứng với một trạng thái đã được DP chứng minh là hợp lệ.

## 10. Độ Phức Tạp

Với mỗi truy vấn:

- mỗi cạnh ngoài chu trình được duyệt trong DP cây và truy vết cây với số state hằng số;
- DP trên chu trình có `4 x 4` state cho mỗi đỉnh chu trình;
- truy vết chu trình là tuyến tính theo độ dài chu trình.

Do đó tổng độ phức tạp mỗi truy vấn là:

```text
O(n)
```

với hằng số nhỏ.

Tổng cộng:

```text
O(n * T)
```

phù hợp với `n <= 3000`, `T <= 500`.

Bộ nhớ:

```text
O(n)
```

không tính danh sách cạnh.
