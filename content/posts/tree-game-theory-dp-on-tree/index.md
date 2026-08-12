---
title: "Trò chơi trên cây - game theory kết hợp DP on tree"
slug: "tree-game-theory-dp-on-tree"
date: "2026-08-11"
description: "Phân tích bài toán trò chơi trên cây bằng minimax, hai trạng thái DP và DFS hậu tự theo đúng hướng cài đặt trong 2.cpp."
category: "misc"
event: "Competitive Programming Notes"
year: 2026
difficulty: "hard"
author: "Huyen Chi"
tags:
  - game theory
  - dp on tree
  - tree
  - minimax
status: "published"
---

## Bài toán

Ta có một cây gồm `N` đỉnh, đồng xu ban đầu nằm ở đỉnh `1`.

Mỗi lượt:

- Daniel chọn một đỉnh để đánh dấu.
- Stjepan di chuyển đồng xu sang một đỉnh kề chưa bị đánh dấu.
- Đỉnh mà Stjepan vừa rời đi cũng bị đánh dấu.

Daniel không nhìn thấy vị trí hiện tại của đồng xu, nhưng biết toàn bộ cấu trúc cây và biết trạng thái đánh dấu của các đỉnh. Câu hỏi là: Daniel có thể đảm bảo trò chơi kết thúc trong nhiều nhất `K` bước di chuyển hay không.

Source code tham chiếu:

- [Xem file `solve.cpp`](../../tree-game-theory-dp-on-tree/solve.cpp)

## Nhận xét quan trọng

Sau mỗi lần Stjepan đi từ `u` sang `v`, đỉnh `u` bị đánh dấu ngay. Vì chỉ được đi sang đỉnh chưa bị đánh dấu, đồng xu không thể quay lại `u`.

Hệ quả:

- đường đi của đồng xu luôn là một đường đơn,
- nếu root cây tại `1`, đồng xu chỉ đi từ cha xuống con,
- trạng thái trò chơi thực chất co lại thành một bài toán trên các nhánh con của từng đỉnh.

Đây là ý tưởng then chốt giúp bài toán trở thành `DP on tree` thay vì phải xử lý một trò chơi với không gian trạng thái rất lớn.

## Góc nhìn game theory

Bài này là một trò chơi đối kháng:

- Daniel muốn kết thúc càng sớm càng tốt, nên là người chơi `min`,
- Stjepan muốn kéo dài trò chơi, nên là người chơi `max`.

Vì vậy bản chất của lời giải là `minimax` trên cây.

Ta không lưu toàn bộ tập các vị trí khả dĩ của đồng xu. Thay vào đó, từ cấu trúc đặc biệt của trò chơi, code chỉ cần hai loại trạng thái.

## Hai trạng thái DP trong `2.cpp`

Code tham chiếu trong bài là file `2.cpp`, với hai mảng:

```cpp
int f[nmax], g[nmax];
```

### `f[u]`

`f[u]` là số bước còn lại trong trường hợp xấu nhất nếu Daniel biết chắc đồng xu đang ở đúng đỉnh `u`.

Đây là trạng thái "biết chính xác vị trí".

### `g[u]`

`g[u]` là số bước còn lại trong trường hợp xấu nhất nếu Daniel chỉ biết đồng xu đang nằm trong một trong các con của `u`, nhưng chưa biết chính xác là con nào.

Đây là trạng thái "biết tập ứng viên".

Toàn bộ lời giải xoay quanh việc chuyển qua lại giữa hai trạng thái này.

## Hàm `bestOP`

Phần quan trọng nhất trong code là:

```cpp
int bestOP(int u, int p, vector<int> not_in)
```

Hàm này xét các con hợp lệ của `u`, bỏ qua:

- cha `p`,
- các đỉnh nằm trong `not_in`.

Sau đó nó tính nước đi tối ưu của Daniel trên tập các nhánh còn lại.

Ý tưởng minimax là:

- Daniel chọn một nhánh `x` để "ưu tiên xử lý",
- nếu đồng xu thật sự nằm trong nhánh `x` thì chi phí tương ứng là `f[x]`,
- nếu đồng xu nằm trong nhánh khác thì Stjepan đi thêm `1` bước và đưa trò chơi về kiểu `g[y]`.

Vì vậy công thức mà code hiện thực là:

```text
min_x max(f[x], 1 + max(g[y] với y != x))
```

Trong `2.cpp`, phần `max(g[y])` được duy trì bằng `multiset`, nên mỗi lần thử một nhánh `x` không phải duyệt lại toàn bộ từ đầu.

## Công thức chuyển trạng thái

### 1. Đỉnh lá

Nếu `u` không có con:

```cpp
f[u] = g[u] = 0;
```

Không còn nước đi nào nữa, nên trò chơi kết thúc ngay.

### 2. Đỉnh có đúng một con

Nếu `u` chỉ có một con `v`, code xử lý:

```cpp
f[u] = 1;
g[u] = 1 + bestOP(v, u, tmp);
```

Ý tưởng là:

- ở trạng thái biết chắc đang ở `u`, Stjepan chỉ có một hướng đi xuống, nên chắc chắn tiêu tốn `1` bước,
- ở trạng thái mơ hồ giữa các nhánh con của `u`, vì chỉ còn một nhánh, bài toán được đẩy tiếp xuống sâu hơn.

### 3. Đỉnh có từ hai con trở lên

Khi `u` có nhiều con, Daniel có quyền chọn đỉnh để chặn sao cho giảm tối đa trường hợp xấu nhất.

Code hiện thực:

```cpp
f[u] = 1 + min over children v of bestOP(u, p, {v});
g[u] = 1 + bestOP(u, p, {});
```

Ý nghĩa:

- `f[u]`: Daniel biết chính xác đồng xu ở `u`, nên anh ấy có thể chặn trước một nhánh để làm Stjepan bớt lựa chọn.
- `g[u]`: Daniel chỉ biết đồng xu đang ở một trong các con của `u`, nên phải xử lý trên toàn bộ tập các con khả dĩ.

## DFS hậu tự

Vì `f[u]` và `g[u]` chỉ phụ thuộc vào các đỉnh con, ta tính bằng DFS từ dưới lên:

```cpp
void dfs(int u, int p)
```

Thứ tự là:

1. duyệt toàn bộ con của `u`,
2. tính xong `f[v]`, `g[v]` cho từng con `v`,
3. từ đó suy ra `f[u]`, `g[u]`.

Đáp án cuối cùng là:

```cpp
f[1]
```

Nếu `f[1] <= K` thì in `DA`, ngược lại in `NE`.

## Vì sao hướng này đúng

Có ba ý chính:

1. Đồng xu không bao giờ quay lại đỉnh cũ, nên đường đi luôn đi xuống theo cây đã root.
2. Thông tin mà Daniel có sau mỗi bước luôn quy về một trong hai dạng: biết chính xác một đỉnh, hoặc biết đồng xu thuộc một tập con cùng cha.
3. Trong mỗi trạng thái, Daniel tối ưu theo `min`, còn Stjepan phản công theo `max`, nên bài toán đúng bản chất minimax.

Nhờ đó, `f[u]` và `g[u]` là đủ để mô tả toàn bộ trò chơi.

## Độ phức tạp

Code hiện tại dùng `multiset` trong `bestOP` để lấy nhanh giá trị lớn nhất của `g` trên các nhánh còn lại.

Với `N <= 400`, lời giải này đủ an toàn. Trên thực tế, chi phí chủ yếu đến từ:

- DFS qua toàn bộ cây,
- với mỗi đỉnh thử các nhánh con,
- mỗi lần thao tác thêm/bớt trên `multiset`.

Do giới hạn nhỏ, đây là một cài đặt hợp lý và khá gọn.

## Kết luận

Đây là một bài rất đẹp vì nó kết hợp ba lớp ý tưởng:

- `tree`,
- `game theory`,
- `dp on tree`.

Điểm đáng học nhất không nằm ở công thức DP riêng lẻ, mà ở bước rút gọn trạng thái:

- từ một trò chơi thông tin không đầy đủ,
- đưa về hai trạng thái minimax đủ nhỏ để DFS trên cây.

Đó cũng chính là tinh thần của `2.cpp`: không mô phỏng toàn bộ lịch sử của ván chơi, mà chỉ giữ lại phần thông tin thật sự ảnh hưởng đến quyết định tối ưu về sau.
