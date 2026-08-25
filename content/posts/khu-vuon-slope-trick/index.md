---
title: "Khu vườn - Slope trick cho DP lồi"
slug: "khu-vuon-slope-trick"
date: "2026-08-26"
description: "Phân tích bài Khu vườn bằng quy hoạch động trên đường thẳng, biểu diễn hàm chi phí lồi bằng slope trick và hai tập breakpoint."
category: "misc"
event: "Competitive Programming Notes"
year: 2026
difficulty: "hard"
author: "Huyen Chi"
tags:
  - cp
  - slope trick
  - convex dp
  - data structures
status: "published"
---

## Tài liệu tham chiếu

- [Source code `solve.cpp`](/khu-vuon-slope-trick/solve.cpp)
- [Đề bài `statement.md`](/khu-vuon-slope-trick/statement.md)

# Lời giải bài toán cân bằng đất trên một dãy bồn hoa

## Tóm tắt đề bài

Có `N` bồn hoa xếp trên một hàng. Bồn `i` ban đầu có `A[i]` đơn vị đất và cần đúng `B[i]` đơn vị đất.

Ta được phép thực hiện ba loại thao tác:

- mua thêm 1 đơn vị đất cho một bồn bất kỳ với chi phí `X`;
- bỏ đi 1 đơn vị đất từ một bồn bất kỳ với chi phí `Y`;
- chuyển 1 đơn vị đất từ bồn `i` sang bồn `j` với chi phí `Z * |i - j|`.

Mục tiêu là tìm tổng chi phí nhỏ nhất để mọi bồn đều đạt đúng lượng đất yêu cầu.

## Mục lục

1. [Mô hình hóa bài toán](#1-mo-hinh-hoa-bai-toan)
2. [DP cơ bản](#2-dp-co-ban)
3. [Nhận xét hình học về `F[i]`](#3-nhan-xet-hinh-hoc-ve-fi)
4. [Định nghĩa các breakpoint và cấu trúc lưu](#4-dinh-nghia-cac-breakpoint-va-cau-truc-luu)
5. [Ba thao tác khi xử lý mỗi bồn](#5-ba-thao-tac-khi-xu-ly-moi-bon)
6. [Khởi tạo](#6-khoi-tao)
7. [Lấy giá trị hàm tại một điểm](#7-lay-gia-tri-ham-tai-mot-diem)
8. [Độ phức tạp](#8-do-phuc-tap)
9. [Tóm tắt ngắn](#9-tom-tat-ngan)

## 1. Mô hình hóa bài toán

Đặt:

```text
d[i] = A[i] - B[i]
```

- `d[i] > 0`: bồn `i` dư đất.
- `d[i] < 0`: bồn `i` thiếu đất.

Gọi `f[i]` là lượng đất đi qua cạnh giữa `i` và `i + 1`:

- `f[i] > 0`: chuyển từ trái sang phải.
- `f[i] < 0`: chuyển từ phải sang trái.

Khi đó ở bồn `i`, sau khi nhận/gửi đất qua hai cạnh kề, lượng đất còn dư là:

```text
q[i] = d[i] + f[i - 1] - f[i]
```

- Nếu `q[i] > 0` thì phải bỏ đi `q[i]` đơn vị, tốn `Y * q[i]`.
- Nếu `q[i] < 0` thì phải mua thêm `-q[i]` đơn vị, tốn `X * (-q[i])`.
- Dòng qua cạnh `i` tốn `Z * |f[i]|`.

Vì thế bài toán trở thành tối ưu:

```text
sum(
    Z * abs(f[i])
  + Y * max(q[i], 0)
  + X * max(-q[i], 0)
)
```

Đây là một bài toán quy hoạch động trên đường thẳng với hàm chi phí lồi.

## 2. DP cơ bản

Đặt `F[i](x)` là chi phí nhỏ nhất sau khi xử lý xong các bồn `1..i`, và đang gửi `x` đơn vị đất từ bồn `i` sang `i + 1`.

Khi đó:

```text
F[0](0) = 0
F[0](x) = +inf với x != 0
```

và

```text
F[i](x) =
    Z * abs(x)
    + min_y {
        F[i - 1](y)
        + Y * max(d[i] + y - x, 0)
        + X * max(x - d[i] - y, 0)
    }
```

`F[N](0)` là đáp án.

Nếu làm trực tiếp theo mọi giá trị `x, y` thì quá chậm. Điểm quan trọng là mọi `F[i]` đều là hàm lồi, khúc tuyến tính theo `x`, nên ta không cần lưu toàn bộ bảng DP, chỉ cần lưu "hình dạng" của hàm.

## 3. Nhận xét hình học về `F[i]`

### 3.1. `F[i]` là hàm lồi, khúc tuyến tính

Vì chi phí của mỗi bước đều được tạo từ `abs`, `max(., 0)` và phép `min` của các hàm lồi, nên `F[i](x)` là hàm lồi, khúc tuyến tính.

Đồ thị của `F[i]` gồm nhiều đoạn thẳng ghép lại, và chỉ thay đổi độ dốc tại một số hoành độ hữu hạn.

### 3.2. “Điểm gãy” là gì?

“Điểm gãy” là các hoành độ mà tại đó độ dốc của hàm thay đổi.

Ví dụ:

```text
|x|
```

- với `x < 0`, độ dốc là `-1`;
- với `x > 0`, độ dốc là `+1`;
- tại `x = 0`, độ dốc đổi, nên `0` là một điểm gãy.

Trong bài này, ta không lưu từng đoạn thẳng, mà lưu danh sách các điểm gãy cùng với độ lớn thay đổi của độ dốc tại mỗi điểm.

Một phần tử `(p, w)` nghĩa là:

- có một điểm gãy tại vị trí `p`;
- khi đi qua điểm đó, độ dốc đổi thêm `w` đơn vị ở phía tương ứng.

Nói ngắn gọn: heap không lưu "một lượng đất", mà lưu cấu trúc hình học của hàm `F[i]`.

## 4. Định nghĩa các breakpoint và cấu trúc lưu

Ta biểu diễn một hàm lồi bằng:

- `min_value`: giá trị nhỏ nhất hiện tại của hàm;
- `shift`: độ tịnh tiến ngang của toàn bộ hàm;
- `L`: các điểm gãy nằm về phía trái vùng đáy;
- `R`: các điểm gãy nằm về phía phải vùng đáy.

Ở đây "vùng đáy" là đoạn mà hàm đạt giá trị nhỏ nhất. Nếu đáy co lại thành một điểm thì đó là nghiệm tối ưu hiện tại.

Trong code hiện tại, `L` và `R` được cài bằng `map` để:

- lấy được breakpoint ngoài cùng ở mỗi phía;
- gộp nhiều breakpoint trùng vị trí thành một phần tử duy nhất.

Nhưng về mặt ý tưởng, chúng vẫn đóng vai trò như hai heap hai phía của vùng đáy.

### 4.1. Heap trái `L`

`L` lưu các điểm gãy ở bên trái đáy.

Mỗi cặp `(p, w)` trong `L` có nghĩa:

- điểm gãy thật nằm tại `p + shift`;
- nếu đi từ đáy sang bên trái và vượt qua điểm này, độ dốc giảm thêm `w`.

Ta dùng `min-heap` để luôn lấy được điểm xa đáy nhất bên trái trước.

### 4.2. Heap phải `R`

`R` lưu các điểm gãy ở bên phải đáy.

Mỗi cặp `(p, w)` trong `R` có nghĩa:

- điểm gãy thật nằm tại `p + shift`;
- nếu đi từ đáy sang bên phải và vượt qua điểm này, độ dốc tăng thêm `w`.

Ta dùng `max-heap` để luôn lấy được điểm xa đáy nhất bên phải trước.

### 4.3. Góc nhìn “mảng hiệu của slope”

Một cách nhìn rất quan trọng là `L` và `R` không lưu trực tiếp giá trị hàm, mà lưu các "event đổi slope".

- `L` là mảng hiệu cho phần bên trái: tại breakpoint `p`, slope bị giảm thêm `w` nếu đi từ đáy sang trái qua điểm đó.
- `R` là mảng hiệu cho phần bên phải: tại breakpoint `p`, slope bị tăng thêm `w` nếu đi từ đáy sang phải qua điểm đó.

Vì vậy từ mỗi phần tử `(p, w)` ta có thể khôi phục lại một mảnh hàm cơ bản:

- event trái tạo ra mảnh `w * max(p - x, 0)`;
- event phải tạo ra mảnh `w * max(x - p, 0)`.

Toàn bộ hàm chính là:

```text
giá trị ở đáy
+ tổng các mảnh do L sinh ra
+ tổng các mảnh do R sinh ra
```

Đây là lý do `value_at()` chỉ cần cộng đóng góp của từng event vào một giá trị đáy đã biết.

Nếu thích liên hệ với "cập nhật đoạn", có thể nhìn như sau:

- thêm `w * max(x - a, 0)` làm slope tăng thêm `w` trên cả nửa trục phải `(a, +inf)`;
- thêm `w * max(a - x, 0)` làm slope giảm thêm `w` trên cả nửa trục trái `(-inf, a)`.

Vì ta đang lưu **mảng hiệu của slope**, một "cập nhật nửa trục" như thế không cần sửa mọi điểm trên đoạn. Ta chỉ cần thêm một event tại điểm bắt đầu thay đổi độ dốc:

- event phải tại `a` cho `w * max(x - a, 0)`;
- event trái tại `a` cho `w * max(a - x, 0)`.

Đây là cầu nối trực tiếp từ công thức toán học sang hai hàm `add_x_minus_a()` và `add_a_minus_x()` trong code.

### 4.4. Vì sao cần trọng số `w`?

Độ dốc không chỉ thay đổi `1` đơn vị mỗi lần. Nó có thể nhảy một lượng lớn như `X`, `Y`, `Z`.

Vì vậy thay vì đẩy cùng một vị trí vào heap nhiều lần, ta gộp lại thành một cặp `(vị trí, trọng số)`.

Ví dụ:

- `Z * |x|` tạo một điểm gãy tại `0`;
- bên trái độ dốc giảm `Z`;
- bên phải độ dốc tăng `Z`.

Nên ta thêm trọng số `Z` vào cả `L` lẫn `R` tại vị trí `0`.

## 5. Ba thao tác khi xử lý mỗi bồn

Từ công thức DP, khi xử lý bồn `i`, ta làm 3 việc:

1. dịch hàm theo `d[i]`;
2. kẹp độ dốc vào đoạn `[-Y, X]`;
3. cộng thêm `Z * |x|`.

### 5.1. Dịch theo `d[i]`

Đặt:

```text
K_i(x) =
    min_y {
        F[i - 1](y)
        + Y * max(d[i] + y - x, 0)
        + X * max(x - d[i] - y, 0)
    }
```

thì:

```text
F[i](x) = K_i(x) + Z * |x|
```

Phần `d[i]` chỉ xuất hiện trong tổ hợp `x - d[i]`. Nói cách khác, `K_i` có cùng hình dạng với hàm thu được khi `d[i] = 0`, chỉ bị dời ngang thêm `d[i]`.

Viết chặt hơn, nếu đặt:

```text
H_i(t) =
    min_y {
        F[i - 1](y)
        + Y * max(y - t, 0)
        + X * max(t - y, 0)
    }
```

thì chỉ cần thay:

```text
t = x - d[i]
```

là được:

```text
K_i(x) = H_i(x - d[i])
```

Nghĩa là đồ thị của `K_i` chính là đồ thị của `H_i` bị tịnh tiến sang phải `d[i]` đơn vị.

Trực giác:

- `d[i] > 0`: bồn `i` đang dư đất, nên trạng thái tối ưu có xu hướng đẩy dòng sang phải nhiều hơn;
- `d[i] < 0`: bồn `i` đang thiếu đất, nên đáy bị kéo sang trái.

Vì vậy toàn bộ breakpoint của hàm chỉ bị tịnh tiến ngang.

Ta không sửa từng phần tử trong heap, chỉ cần:

```text
shift += d[i]
```

Nếu sau khi xử lý xong các bồn `1..i` ta đang có biến `shift`, thì thực chất:

```text
shift = d[1] + d[2] + ... + d[i]
```

theo đúng nghĩa "tổng độ dời ngang" đã cộng dồn qua từng bước.

Điểm mấu chốt là `shift` không phải một hằng số xuất hiện ngẫu nhiên trong code, mà đến trực tiếp từ công thức:

```text
K_i(x) = H_i(x - d[i])
```

Mỗi lần có thêm một bồn mới, biến đầu vào của hàm trước đó bị thay từ `x` thành `x - d[i]`, tức toàn bộ breakpoint phải dời ngang thêm `d[i]`. Vì code không muốn sửa từng breakpoint một, nên nó giữ nguyên các khóa thô trong `map` và chỉ cập nhật hệ quy chiếu qua biến `shift`.

Do đó các khóa đang lưu trong `L`, `R` chỉ là tọa độ thô. Nếu một breakpoint được lưu với khóa `p`, thì vị trí thật của nó trên trục `x` là:

```text
p + shift
```

Ngược lại, khi muốn thêm một breakpoint thật ở vị trí `a`, ta chỉ cần lưu:

```text
a - shift
```

vào `L` hoặc `R`, nên toàn bộ thao tác dịch ngang chỉ tốn `O(1)`.

### 5.2. Kẹp độ dốc vào đoạn `[-Y, X]`

Đặt gọn:

```text
G(y) = F[i - 1](y)
```

và nhắc lại:

```text
H_i(t) =
    min_y {
        G(y)
        + Y * max(y - t, 0)
        + X * max(t - y, 0)
    }
```

Khi đó:

```text
K_i(x) = H_i(x - d[i])
```

nên chỉ cần hiểu `H_i` được tạo từ `F[i-1]` như thế nào.

### 5.2.1. Tách theo hai nhánh `y >= t` và `y <= t`

Nếu xét nhánh `y >= t` thì:

```text
G(y) + Y * max(y - t, 0) + X * max(t - y, 0)
= G(y) + Y * (y - t)
= G(y) + Y * y + (-Y) * t
```

Từ đó ta có thể viết nhánh phải dưới dạng:

```text
H_R(t) = min_{y >= t} {G(y) + Y * y} + (-Y) * t
```

Nếu xét nhánh `y <= t` thì tương tự:

```text
G(y) + Y * max(y - t, 0) + X * max(t - y, 0)
= G(y) + X * (t - y)
= G(y) - X * y + X * t
```

và nhánh trái có dạng:

```text
H_L(t) = min_{y <= t} {G(y) - X * y} + X * t
```

Nói cách khác:

- `H_R` được ghép từ các đường thẳng slope `-Y`;
- `H_L` được ghép từ các đường thẳng slope `X`;
- `H_i(t)` là bao dưới của hai loại nhánh đó.

### 5.2.2. Nhận xét về hai hàm nghiêng `G(y) + Y * y` và `G(y) - X * y`

Dễ thấy `G(y) + Y * y` cũng là một hàm slope-trick-able, và phần cộng thêm `Y * y` sẽ làm tăng slope của toàn bộ hàm `G`.

Tương tự, `G(y) - X * y` sẽ làm giảm slope của toàn bộ hàm `G`.

Chính từ hai phép nghiêng này mà đáy của hàm thay đổi, và đây là trực giác của thao tác "kẹp slope".

### 5.2.3. Giải thích nhánh phải `H_R`

Xét ví dụ:

```text
Y = 2, X = 1
```

và

```text
G(t) = F[i-1](t) =

    -3t - 2    nếu t <= -1
    -t         nếu -1 <= t <= 1
    -1         nếu 1 <= t <= 3
    2t - 7     nếu t >= 3
```

Khi đó:

```text
H_R(t) =

    -2t - 1    nếu t <= -1
    -t         nếu -1 <= t <= 1
    -1         nếu 1 <= t <= 3
    2t - 7     nếu t >= 3
```

![Min-plus convolution tạo hàm H_R từ hàm G](./images/H_R.png)

```text
G(y) + Y * max(y - t, 0) + X * max(t - y, 0)
= G(y) + Y * (y - t)
= G(y) + Y * y + (-Y) * t

H_R(t) = min_{y >= t} {G(y) + Y * y} + (-Y) * t
```

Có thể hiểu biểu thức này theo hai bước:

1. Trước hết, xét hàm:

```text
G(y) + Y * y
```

Phần cộng thêm `Y * y` làm tăng slope của toàn bộ hàm `G`, nên điểm đáy của hàm này cũng thay đổi.

2. Sau đó, với mỗi `t`, ta lấy:

```text
min_{y >= t} {G(y) + Y * y}
```

rồi cộng thêm phần tuyến tính:

```text
(-Y) * t
```

Từ đây có hai tình huống.

#### Trường hợp 1. `t` đang nằm ở phía trái đáy của `G(y) + Y * y`

Giả sử tại vùng đang xét, hàm có slope dạng `-S` với `S < Y`, hay tương đương:

```text
-S + Y < 0
```

Khi đó ta vẫn còn đang ở bên trái đáy của hàm `G(y) + Y * y`, nên:

```text
min_{y >= t} {G(y) + Y * y}
```

sẽ lấy đúng giá trị nhỏ nhất của hàm này, giả sử đạt tại `y_0`.

Do đó:

```text
H_R(t) = (-Y) * t + C
```

với:

```text
C = G(y_0) + Y * y_0
```

Nói cách khác, trong vùng này `H_R(t)` là một đường thẳng có slope đúng bằng `-Y`.

Đây chính là ý nghĩa hình học của bước kẹp ở phía trái: các slope quá âm của `G` sẽ bị "thu" về đúng biên `-Y`.

#### Trường hợp 2. `t` đã nằm ở phía phải đáy của `G(y) + Y * y`

Nếu tại `t`, hàm có slope dạng `-S` nhưng:

```text
-S + Y >= 0
```

thì lúc này ta đã đi sang bên phải đáy của hàm `G(y) + Y * y`.

Vì ở bên phải đáy nên hàm tăng dần theo `y`, do đó với ràng buộc `y >= t` thì giá trị nhỏ nhất sẽ đạt ngay tại:

```text
y = t
```

Khi đó:

```text
H_R(t) = G(t)
```

tức là ở vùng này nhánh phải không còn chỉnh sửa gì thêm: hàm được giữ nguyên.

#### Kết luận

Từ hai trường hợp trên, ta có thể hiểu `H_R` như sau:

- ở những nơi slope của `G` quá âm, `H_R` thay phần đó bằng một đoạn thẳng slope `-Y`;
- ở những nơi slope của `G` đã đủ lớn, `H_R` giữ nguyên `G(t)`.

Vì thế, `H_R` chính là nhánh dùng để "thu" các slope nhỏ hơn `-Y` về đúng biên `-Y`.

### 5.2.4. Giải thích nhánh trái `H_L`

Lập luận cho `H_L` hoàn toàn đối xứng với `H_R`.

Ta có:

```text
H_L(t) = min_{y <= t} {G(y) - X * y} + X * t
```

Có thể hiểu theo hai bước:

1. Trước hết, xét hàm:

```text
G(y) - X * y
```

Phần trừ đi `X * y` làm giảm slope của toàn bộ hàm `G`, nên vị trí đáy của hàm này cũng thay đổi.

2. Sau đó, với mỗi `t`, ta lấy:

```text
min_{y <= t} {G(y) - X * y}
```

rồi cộng thêm:

```text
X * t
```

Từ đây cũng có hai tình huống.

#### Trường hợp 1. `t` đang nằm ở phía phải đáy của `G(y) - X * y`

Nếu tại vùng đang xét, hàm `G(y) - X * y` còn đang ở bên phải đáy, thì:

```text
H_L(t) = X * t + C
```

với `C` là một hằng số phù hợp. Khi đó `H_L(t)` trở thành một đường thẳng slope `X`.

Hiểu hình học: các slope quá dương của `G` sẽ bị "thu" về đúng biên `X`.

#### Trường hợp 2. `t` đã nằm ở phía trái đáy của `G(y) - X * y`

Ngược lại, nếu điều kiện `y <= t` làm nghiệm tối ưu rơi ngay tại `y = t`, thì:

```text
H_L(t) = G(t)
```

và ở vùng đó nhánh trái không chỉnh sửa gì thêm: hàm được giữ nguyên.

#### Kết luận

Tóm lại:

- ở những nơi slope của `G` quá dương, `H_L` thay phần đó bằng một đoạn thẳng slope `X`;
- ở những nơi slope của `G` đã đủ nhỏ, `H_L` giữ nguyên `G(t)`.

Vì thế, `H_L` chính là nhánh dùng để "thu" các slope lớn hơn `X` về đúng biên `X`.

### 5.2.5. Kết luận của bước kẹp

Sau hai nhánh trên:

- các slope nhỏ hơn `-Y` bị kéo lên thành `-Y`;
- các slope lớn hơn `X` bị kéo xuống thành `X`;
- những đoạn đã có slope nằm sẵn trong `[-Y, X]` thì được giữ nguyên.

Đó chính là ý nghĩa của bước "kẹp độ dốc".

Do đó trong cấu trúc dữ liệu:

- nếu tổng trọng số trong `L` vượt `Y`, ta bỏ bớt các breakpoint xa nhất bên trái;
- nếu tổng trọng số trong `R` vượt `X`, ta bỏ bớt các breakpoint xa nhất bên phải.

### 5.3. Cộng `Z * |x|`

Hàm này thêm đúng một điểm gãy tại `x = 0`:

- bên trái giảm thêm `Z`;
- bên phải tăng thêm `Z`.

Vì đang dùng tọa độ thô, điểm `0` thật được lưu thành:

```text
(-shift, Z)
```

trong cả `L` và `R`.

### 5.4. Ghi chú về thao tác rebalance

Trước hết, hãy viết hai phép thêm theo đúng ngôn ngữ "update đoạn trên mảng hiệu của slope".

#### `add_x_minus_a(a, w)` là update gì?

Ta thêm:

```text
w * max(x - a, 0)
```

Hàm này có slope:

- bằng `0` khi `x < a`;
- bằng `w` khi `x > a`.

Vậy nó làm **slope của toàn hàm tăng thêm `w` trên đoạn `(a, +inf)`**.

Nếu chỉ nhìn dưới dạng mảng hiệu, đây là một cập nhật rất đơn giản:

```text
thêm một event phải trọng số w tại a
```

Tức là trong code, nếu không vướng vùng đáy, ta chỉ cần thực hiện:

```text
right_breaks[a] += w
```

#### `add_a_minus_x(a, w)` là update gì?

Tương tự, ta thêm:

```text
w * max(a - x, 0)
```

Hàm này có slope:

- bằng `-w` khi `x < a`;
- bằng `0` khi `x > a`.

Vậy nó làm **slope của toàn hàm giảm thêm `w` trên đoạn `(-inf, a)`**.

Nếu chỉ nhìn như mảng hiệu, đây là:

```text
thêm một event trái trọng số w tại a
```

tức là trong code, nếu không vướng vùng đáy, ta chỉ cần:

```text
left_breaks[a] += w
```

#### Vì sao không phải lúc nào cũng chỉ việc cộng event?

Nếu `a` nằm sai phía so với đáy hiện tại, thì "cập nhật nửa trục" ở trên sẽ làm đáy của hàm dịch chuyển. Khi đó, ngoài việc thêm event mới, ta còn phải:

- lấy bớt một phần trọng số ở breakpoint sát đáy phía đối diện;
- chuyển phần trọng số đó sang phía còn lại;
- cộng phần tăng bắt buộc của giá trị nhỏ nhất vào `min_value`.

Đó chính là phần `while` trong `add_x_minus_a()` và `add_a_minus_x()`: nó không phải cập nhật giá trị hàm theo từng `x`, mà đang thực hiện **rebalance sau một cập nhật đoạn trên mảng hiệu slope**.

Khi cài đặt bằng slope trick, hai phép thêm cơ bản không cập nhật từng đoạn thẳng của đồ thị, mà chỉ thêm một event đổi slope rồi rebalance ở biên đáy.

Ví dụ với mảnh phải `max(x - a, 0)`, nếu `a` nằm bên trái breakpoint gần đáy nhất ở phía trái là `l`, ta dùng đẳng thức:

```text
max(l - x, 0) + max(x - a, 0)
= (l - a) + max(x - l, 0) + max(a - x, 0)
```

Ý nghĩa:

- `l - a` là phần tăng bắt buộc của giá trị nhỏ nhất, nên ta cộng ngay vào `min_value`;
- breakpoint ở `l` được chuyển sang phía phải;
- đồng thời thêm một breakpoint mới ở `a` cho phía trái.

Điều quan trọng là: breakpoint được chuyển cuối cùng trong quá trình này chỉ là một biên của đoạn đáy mới do phần trọng số vừa rebalance tạo ra. Nó không nhất thiết luôn là toàn bộ biên của đáy của cả hàm, vì các breakpoint khác vẫn có thể đang giữ đáy rộng hơn.

Phép `add_a_minus_x` hoàn toàn đối xứng:

```text
max(x - r, 0) + max(a - x, 0)
= (a - r) + max(r - x, 0) + max(x - a, 0)
```

với `r` là breakpoint gần đáy nhất ở phía phải.

Nếu đối chiếu trực tiếp với code:

- ở `add_x_minus_a()`, câu lệnh thêm vào `right_breaks` là phần "cập nhật đoạn `(a, +inf)`" dưới dạng mảng hiệu;
- ở `add_a_minus_x()`, câu lệnh thêm vào `left_breaks` là phần "cập nhật đoạn `(-inf, a)`" dưới dạng mảng hiệu;
- toàn bộ phần còn lại trong vòng `while` là logic rebalance để bảo toàn việc `left_breaks`, `right_breaks` vẫn đang mô tả đúng một hàm lồi với vùng đáy hợp lệ.

## 6. Khởi tạo

Hàm cơ sở sau bước đầu tiên tương ứng với:

```text
g(x) = Y * max(-x, 0) + X * max(x, 0)
```

Nó có một điểm gãy tại `0`:

- phía trái có độ dốc `-Y`;
- phía phải có độ dốc `X`.

Vì vậy trạng thái ban đầu có thể hiểu là:

```text
min_value = 0
shift = 0
L = {(0, Y)}
R = {(0, X)}
```

## 7. Lấy giá trị hàm tại một điểm

Sau khi xử lý hết `N` bồn, ta cần giá trị `F[N](0)`.

Lúc này `min_value` mới chỉ là giá trị nhỏ nhất của hàm, chưa chắc nằm ở `x = 0`.

Điều quan trọng là `L` và `R` đang lưu "mảng hiệu của slope", nên để tính giá trị tại một điểm `x` ta chỉ cần cộng tất cả các đóng góp của các event đổi slope vào `min_value`.

Hiểu theo ngôn ngữ "tích phân lại mảng hiệu":

- `L`, `R` cho ta biết slope đổi ở đâu và đổi bao nhiêu;
- `min_value` cho ta biết mốc giá trị tại đáy;
- từ đó, muốn biết giá trị tại `x`, ta chỉ cần cộng tất cả phần diện tích do các lần đổi slope tạo ra trên đường đi từ đáy tới `x`.

Vì trong cấu trúc dữ liệu ta lưu tọa độ thô, trước hết đổi:

```text
raw_x = x - shift
```

Khi đó:

- mỗi phần tử `(p, w)` trong `L` đóng góp:

```text
w * max(p - raw_x, 0)
```

vì nếu `raw_x < p` thì ta đang đứng về bên trái breakpoint đó, nên event này kéo giá trị hàm tăng thêm đúng `w` nhân với khoảng cách `p - raw_x`;

- mỗi phần tử `(p, w)` trong `R` đóng góp:

```text
w * max(raw_x - p, 0)
```

vì nếu `raw_x > p` thì ta đang đứng về bên phải breakpoint đó, nên event này kéo giá trị hàm tăng thêm đúng `w` nhân với khoảng cách `raw_x - p`.

Vì thế:

```text
F[N](x)
= min_value
+ sum_{(p,w) in L} w * max(p - raw_x, 0)
+ sum_{(p,w) in R} w * max(raw_x - p, 0)
```

Đây chính là điều `value_at()` làm.

Có thể hiểu trực giác hơn như sau:

- `min_value` là giá trị ở đáy;
- mỗi event trong `L`, `R` là một phần tử của "mảng hiệu slope", tức nói rằng khi ta đi qua một breakpoint thì slope đổi thêm `w`;
- cộng các biểu thức `max(...)` ở trên chính là "tích phân lại" các thay đổi slope đó để thu được chênh lệch giá trị từ đáy tới điểm `x`.

## 8. Độ phức tạp

- mỗi lần thêm/xóa trên heap là `O(log N)`;
- tổng số phần tử được thêm là `O(N)`;
- nên toàn bộ thuật toán là `O(N log N)`;
- bộ nhớ `O(N)`.

## 9. Tóm tắt ngắn

- `F[i](x)` là chi phí tốt nhất nếu sau bồn `i` còn gửi `x` đất sang phải.
- `F[i]` là hàm lồi, khúc tuyến tính.
- Ta không lưu cả hàm theo từng `x`, mà lưu các điểm gãy của nó.
- `L` chứa các điểm gãy bên trái đáy, `R` chứa các điểm gãy bên phải đáy.
- Mỗi phần tử trong `L`, `R` là một event đổi slope kèm trọng số.
- Mỗi bồn mới chỉ làm 3 việc: dịch hàm, kẹp độ dốc, thêm `Z * |x|`.
