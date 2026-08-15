---
title: "Đèn trang trí - DP trên cây với một cạnh bổ sung"
slug: "knapsack-tree-2025"
date: "2026-08-15"
description: "Mô hình hóa thao tác đổi màu bằng XOR, tách cạnh bổ sung khỏi cây và giải bằng DP trên cây."
category: "misc"
event: "Competitive Programming Notes"
year: 2025
difficulty: "hard"
author: "Huyen Chi"
tags:
  - cp
  - dp on tree
  - tree
  - xor
status: "published"
---

## Tài liệu tham chiếu

- [Đề bài `statement.md`](/knapsack-tree-2025/statement.md)

## Hướng dẫn giải

## 1. Mô hình hóa thao tác bằng XOR

Gọi:

$$
press_u\in\{0,1\}
$$

cho biết có thực hiện thao tác tại đỉnh $u$ hay không.

Ta chỉ cần thực hiện thao tác tại mỗi đỉnh nhiều nhất một lần. Nếu thực hiện hai lần tại cùng một đỉnh thì mọi ảnh hưởng bị triệt tiêu.

Với trạng thái ban đầu `color[u]`, đặt:

$$
need_u=1\oplus color_u.
$$

- Nếu $u$ đang xanh thì $need_u=0$: đèn phải bị đảo màu số lần chẵn.
- Nếu $u$ đang đỏ thì $need_u=1$: đèn phải bị đảo màu số lần lẻ.

Điều kiện cuối cùng tại mỗi đỉnh $u$ là:

$$
press_u\oplus\bigoplus_{v\text{ kề }u}press_v=need_u.
$$

Các thao tác chỉ là phép XOR nên thứ tự thực hiện không quan trọng. Sau khi tìm được các đỉnh có `press[u] = 1`, ta có thể in chúng theo thứ tự bất kỳ.

## 2. Tách cạnh bổ sung khỏi cây

Gọi hai đầu mút của cạnh bổ sung là $A,B$.

Ta chỉ root cây bằng $n-1$ cạnh ban đầu. Không đưa cạnh $(A,B)$ vào danh sách cha-con.

Ảnh hưởng của cạnh bổ sung chỉ xuất hiện tại hai đỉnh:

- Nếu $u=A$, màu của $u$ còn bị ảnh hưởng bởi $press_B$.
- Nếu $u=B$, màu của $u$ còn bị ảnh hưởng bởi $press_A$.

Ta lưu hai lựa chọn toàn cục:

$$
aUsed=press_A,\qquad bUsed=press_B.
$$

Chỉ có bốn cặp `(aUsed, bUsed)` cần xét.

## 3. Vì sao cần cả `parentUsed` và `uUsed`?

Khi xử lý cây con $T_u$:

- `parentUsed` ảnh hưởng trực tiếp đến màu của $u$.
- `uUsed` ảnh hưởng đến màu của cha và trở thành `parentUsed` khi xử lý các con của $u$.

Với một đỉnh lá không thuộc cạnh bổ sung, điều kiện là:

$$
parentUsed\oplus uUsed=need_u.
$$

Vì vậy, nếu chỉ biết `uUsed` mà không biết `parentUsed`, ta không thể quyết định đèn $u$ đã xanh hay chưa.

## 4. Định nghĩa DP

Root cây ban đầu tại một đỉnh tùy ý, chẳng hạn đỉnh $1$.

Định nghĩa:

```cpp
dp[u][parentUsed][uUsed][aUsed][bUsed]
```

là giá trị boolean, cho biết có tồn tại cách chọn các thao tác trong cây con $T_u$ sao cho:

- Cha của $u$ được sử dụng đúng theo `parentUsed`.
- Chính $u$ được sử dụng đúng theo `uUsed`.
- Hai đầu mút $A,B$ được sử dụng đúng theo `aUsed,bUsed`.
- Tất cả các đèn trong $T_u$, bao gồm $u$, trở thành màu xanh.

Mỗi đỉnh có:

$$
2^4=16
$$

trạng thái.

Tại hai đầu mút của cạnh bổ sung, phải khóa lựa chọn:

```cpp
if (u == A && uUsed != aUsed) state = false;
if (u == B && uUsed != bUsed) state = false;
```

## 5. Điều kiện tại một đỉnh

Ảnh hưởng của cạnh bổ sung tại $u$ là:

```cpp
extra = 0;
if (u == A) extra ^= bUsed;
if (u == B) extra ^= aUsed;
```

Gọi $v$ chạy qua các con của $u$. Điều kiện để $u$ trở thành xanh là:

$$
parentUsed\oplus uUsed
\oplus\bigoplus_{v\text{ là con của }u}press_v
\oplus extra
=need_u.
$$

Do đó XOR cần tạo ra từ các con là:

$$
want=need_u\oplus parentUsed\oplus uUsed\oplus extra.
$$

Ta cần chọn `vUsed` cho mỗi con $v$ sao cho:

$$
\bigoplus_v vUsed=want.
$$

## 6. Gộp các cây con

Với một trạng thái cố định của $u$, dùng mảng hai phần tử:

```cpp
can[parity]
```

cho biết các cây con đã xử lý có thể tạo XOR bằng `parity` hay không.

Khởi tạo:

```cpp
can[0] = true;
can[1] = false;
```

Khi xét con $v$, thử `vUsed` bằng `0` hoặc `1`. Vì cha của $v$ là $u$, trạng thái của $v$ phải được truy cập bằng:

```cpp
dp[v][uUsed][vUsed][aUsed][bUsed]
```

Chuyển trạng thái:

```cpp
nxt[0] = nxt[1] = false;

for (int parity = 0; parity < 2; ++parity) {
    for (int vUsed = 0; vUsed < 2; ++vUsed) {
        if (can[parity] &&
            dp[v][uUsed][vUsed][aUsed][bUsed]) {
            nxt[parity ^ vUsed] = true;
        }
    }
}

can[0] = nxt[0];
can[1] = nxt[1];
```

Sau khi gộp tất cả các con:

```cpp
dp[u][parentUsed][uUsed][aUsed][bUsed] = can[want];
```

## 7. Trạng thái tại gốc

Gốc không có cha nên:

```cpp
parentUsed = 0;
```

Ta thử mọi lựa chọn:

```cpp
aUsed    = 0..1
bUsed    = 0..1
rootUsed = 0..1
```

Một nghiệm tồn tại nếu có trạng thái:

```cpp
dp[root][0][rootUsed][aUsed][bUsed] == true
```

Nếu không có trạng thái nào như vậy thì in `-1`.

## 8. Truy vết phương án

DP boolean chỉ cho biết nghiệm có tồn tại. Đề bài còn yêu cầu in các đỉnh cần thao tác, nên phải truy vết giá trị `vUsed` của từng con.

Giả sử đang truy vết trạng thái:

```cpp
(u, parentUsed, uUsed, aUsed, bUsed)
```

Ta tính lại `want`, sau đó xây dựng suffix DP trên danh sách các con của $u$.

Định nghĩa:

```cpp
suf[i][parity]
```

cho biết các con từ vị trí $i$ trở đi có thể tạo XOR bằng `parity` hay không.

Khởi tạo:

```cpp
suf[m][0] = true;
suf[m][1] = false;
```

với $m$ là số con của $u$.

Chuyển suffix:

```cpp
for (int i = m - 1; i >= 0; --i) {
    int v = children[u][i];

    for (int parity = 0; parity < 2; ++parity) {
        suf[i][parity] = false;

        for (int vUsed = 0; vUsed < 2; ++vUsed) {
            if (dp[v][uUsed][vUsed][aUsed][bUsed] &&
                suf[i + 1][parity ^ vUsed]) {
                suf[i][parity] = true;
            }
        }
    }
}
```

Sau đó chọn lần lượt trạng thái cho từng con, luôn bảo đảm phần suffix còn lại vẫn tạo được XOR cần thiết.

Nếu `uUsed = 1`, thêm $u$ vào danh sách đáp án.

## 9. Chứng minh tính đúng đắn

### Bổ đề 1

Với một trạng thái cố định của $u$, mảng `can` sau khi xử lý một số con biểu diễn chính xác các giá trị XOR có thể tạo ra từ `press` của những con đó.

**Chứng minh.** Ban đầu chưa có con nào nên chỉ tạo được XOR bằng $0$. Khi thêm con $v$, ta thử cả hai giá trị `vUsed` khả thi và XOR nó vào parity cũ. Vì vậy phép chuyển sinh ra đúng và đủ mọi parity có thể có. $\square$

### Bổ đề 2

`dp[u][parentUsed][uUsed][aUsed][bUsed]` đúng khi và chỉ khi tồn tại cách làm toàn bộ đèn trong $T_u$ thành xanh với các lựa chọn biên đã cho.

**Chứng minh.** Các trạng thái của từng con bảo đảm toàn bộ cây con tương ứng đã xanh. Theo Bổ đề 1, `can[want]` đúng khi và chỉ khi có thể chọn các `vUsed` tạo đúng parity cần thiết tại $u$. Do đó mọi cây con và chính $u$ đều xanh. Chiều ngược lại, mọi phương án hợp lệ cũng tạo ra một chuỗi lựa chọn `vUsed` được phép chuyển DP xét tới. $\square$

### Định lý

Thuật toán in `-1` khi và chỉ khi không tồn tại phương án; ngược lại, danh sách truy vết đưa toàn bộ đèn về màu xanh.

**Chứng minh.** Mọi lựa chọn sử dụng $A,B$ và gốc đều được thử. Gốc có `parentUsed = 0`, nên theo Bổ đề 2, một trạng thái đúng tại gốc tương đương với một phương án hợp lệ cho toàn bộ cây. Truy vết chỉ chọn các trạng thái con đã được DP xác nhận, do đó danh sách thu được là hợp lệ. $\square$

## 10. Độ phức tạp

Mỗi đỉnh có $16$ trạng thái. Mỗi lần gộp một cạnh chỉ xét một số lượng lựa chọn hằng số.

Với mỗi truy vấn:

$$
O(n)
$$

thời gian và:

$$
O(n)
$$

bộ nhớ.

Với toàn bộ $T$ truy vấn:

$$
O(nT).
$$

Với $n\le3000$ và $T\le500$, độ phức tạp này phù hợp.

## 11. Code giả tham khảo

```cpp
read n, T
read the n - 1 original tree edges
read A, B

root = 1
build parent[], children[], and postorder once

for each query {
    read color[1..n]

    for (u in postorder) {
        for (int parentUsed = 0; parentUsed < 2; ++parentUsed) {
            for (int uUsed = 0; uUsed < 2; ++uUsed) {
                for (int aUsed = 0; aUsed < 2; ++aUsed) {
                    for (int bUsed = 0; bUsed < 2; ++bUsed) {
                        dp[u][parentUsed][uUsed][aUsed][bUsed] = false;

                        if (u == A && uUsed != aUsed) continue;
                        if (u == B && uUsed != bUsed) continue;

                        int extra = 0;
                        if (u == A) extra ^= bUsed;
                        if (u == B) extra ^= aUsed;

                        int need = 1 ^ color[u];
                        int want = need ^ parentUsed ^ uUsed ^ extra;

                        bool can[2] = {true, false};

                        for (int v : children[u]) {
                            bool nxt[2] = {false, false};

                            for (int parity = 0; parity < 2; ++parity) {
                                for (int vUsed = 0; vUsed < 2; ++vUsed) {
                                    if (can[parity] &&
                                        dp[v][uUsed][vUsed]
                                          [aUsed][bUsed]) {
                                        nxt[parity ^ vUsed] = true;
                                    }
                                }
                            }

                            can[0] = nxt[0];
                            can[1] = nxt[1];
                        }

                        dp[u][parentUsed][uUsed]
                          [aUsed][bUsed] = can[want];
                    }
                }
            }
        }
    }

    bool found = false;

    for (int aUsed = 0; aUsed < 2 && !found; ++aUsed) {
        for (int bUsed = 0; bUsed < 2 && !found; ++bUsed) {
            for (int rootUsed = 0; rootUsed < 2; ++rootUsed) {
                if (dp[root][0][rootUsed][aUsed][bUsed]) {
                    found = true;
                    reconstruct(root, 0, rootUsed, aUsed, bUsed);
                    break;
                }
            }
        }
    }

    if (!found) {
        print -1
    } else {
        print answer.size() and all vertices in answer
    }
}
```

Code giả cho truy vết:

```cpp
reconstruct(u, parentUsed, uUsed, aUsed, bUsed) {
    if (uUsed) answer.push_back(u);

    int extra = 0;
    if (u == A) extra ^= bUsed;
    if (u == B) extra ^= aUsed;

    int need = 1 ^ color[u];
    int want = need ^ parentUsed ^ uUsed ^ extra;

    int m = children[u].size();
    bool suf[m + 1][2];

    suf[m][0] = true;
    suf[m][1] = false;

    for (int i = m - 1; i >= 0; --i) {
        int v = children[u][i];

        for (int parity = 0; parity < 2; ++parity) {
            suf[i][parity] = false;

            for (int vUsed = 0; vUsed < 2; ++vUsed) {
                if (dp[v][uUsed][vUsed][aUsed][bUsed] &&
                    suf[i + 1][parity ^ vUsed]) {
                    suf[i][parity] = true;
                }
            }
        }
    }

    int remaining = want;

    for (int i = 0; i < m; ++i) {
        int v = children[u][i];

        for (int vUsed = 0; vUsed < 2; ++vUsed) {
            if (dp[v][uUsed][vUsed][aUsed][bUsed] &&
                suf[i + 1][remaining ^ vUsed]) {
                reconstruct(v, uUsed, vUsed, aUsed, bUsed);
                remaining ^= vUsed;
                break;
            }
        }
    }
}
```
