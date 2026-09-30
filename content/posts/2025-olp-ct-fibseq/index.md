---
title: "Dây ngắn nhất - Linear basis trên GF(2)"
slug: "2025-olp-ct-fibseq"
date: "2026-09-27"
description: "Tách chẵn lẻ số lần xuất hiện của các số Fibonacci, rồi dùng linear basis trên GF(2) để tối ưu đồng thời tổng và XOR."
category: "misc"
event: "OLP Chuyên Tin 2025"
year: 2025
difficulty: "hard"
author: "Huyen Chi"
tags:
  - cp
  - linear basis
  - xor
  - greedy
  - fibonacci
status: "published"
---

# Bài 3 — DÂY NGẮN NHẤT

## Tài liệu tham chiếu

- [Đề bài `statement.md`](/2025-olp-ct-fibseq/statement.md)
- [Source code `solve.cpp`](/2025-olp-ct-fibseq/solve.cpp)

---

## 1. Tóm tắt bài toán

Cho hai số nguyên $m$ và $n$. Cần tìm một dãy nguyên dương
$a = (a_1, a_2, \dots, a_k)$ **ngắn nhất** sao cho:

1. Mọi phần tử $a_i$ đều là **số Fibonacci** (thuộc dãy
   $0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, \dots$).
   Phần tử được lặp lại bao nhiêu lần cũng được.
2. Tổng các phần tử bằng $m$:
   $$a_1 + a_2 + \cdots + a_k = m$$
3. Phép toán bitwise-XOR trên tất cả phần tử bằng $n$:
   $$a_1 \oplus a_2 \oplus \cdots \oplus a_k = n$$

**Đáp án cần tính:** số phần tử $k$ của dãy ngắn nhất, hoặc `-1` nếu không
tồn tại dãy nào thỏa mãn.

Dãy Fibonacci định nghĩa: $f_0 = 0$, $f_1 = 1$, $f_i = f_{i-1} + f_{i-2}$ với
$i \ge 2$. Phép $\oplus$ là XOR từng bit (toán tử `^` trong C/C++/Java/Python).

**Ràng buộc:** dòng đầu chứa $T \le 10$; mỗi test là hai số $m, n$ với
$1 \le m \le 10^{12}$, $0 \le n \le 10^{12}$.

---

## 2. Đặc trưng của đề (định nghĩa)

Phần này định nghĩa mọi khái niệm dùng ở các mục sau.

### 2.1. Tập giá trị Fibonacci dùng được

Gọi $\mathcal{F}$ là tập các giá trị Fibonacci **dương**:

$$\mathcal{F} = \{ f_1, f_3, f_4, f_5, \dots \} = \{ 1, 2, 3, 5, 8, 13, 21, \dots \}$$

Hai điểm cần chú ý về định nghĩa này:

- **$f_0 = 0$ bị loại.** Đề yêu cầu $a_i$ là *nguyên dương*, nên $0$ không dùng
  được. Khi $m = 1$ thì dãy chỉ có thể chứa $f_1 = 1$.
- **Giá trị $1$ chỉ là một phần tử.** Trong dãy Fibonacci $1$ xuất hiện hai lần
  ($f_1 = f_2 = 1$), nhưng nó là **một** giá trị. Do đó $|\mathcal{F}|$ đếm
  $f_1$ đúng một lần, và $\mathcal{F}$ là tập tăng nghiêm (không lặp).

**Định lượng quan trọng:** vì mọi phần tử đều dương và tổng bằng $m \le 10^{12}$,
không phần tử nào của dãy có thể vượt quá $m$. Do đó chỉ cần các giá trị
Fibonacci $\le 10^{12}$, và:

$$|\mathcal{F}| = 58 \quad (\text{giá trị lớn nhất } f_{59} = 956722026041 < 2^{40})$$

Con số **58** nhỏ, đây là đặc trưng then chốt của cả bài toán.

### 2.2. Đa tập (multiset) — bản chất của dãy $a$

Vì phần tử được lặp, và vì cả tổng lẫn XOR đều không phụ thuộc thứ tự các
phần tử, dãy $a$ thực chất là một **đa tập** trên $\mathcal{F}$. Ta sẽ nói
"dãy $a$ có đa tập $S$" và chỉ quan tâm tới số phần tử $k$, không quan tâm
thứ tự.

Với mỗi giá trị $v \in \mathcal{F}$, đặt:

$$c_v = \text{số lần } v \text{ xuất hiện trong } a \quad (c_v \in \mathbb{Z}_{\ge 0})$$

Khi đó: $\displaystyle\sum_{v} c_v \cdot v = m$, và XOR của toàn bộ phần tử là
$\displaystyle\bigoplus_{v} \underbrace{v \oplus v \oplus \cdots \oplus v}_{c_v \text{ lần}}$.

### 2.3. Phân rã chẵn–lẻ (parity split) — định nghĩa quan trọng nhất

Mọi số nguyên không âm $c_v$ đều viết **duy nhất** được dưới dạng:

$$c_v = \varepsilon_v + 2 t_v, \qquad \varepsilon_v \in \{0,1\},\ t_v \in \mathbb{Z}_{\ge 0}$$

Trong đó $\varepsilon_v$ là **parity** (tính chẵn/lẻ) của $c_v$, còn $t_v$ là
số **cặp** của $v$. Đây chính là phân rã duy nhất mỗi số nguyên thành
"phần lẻ + phần chẵn", tương đương với việc mọi số nguyên viết duy nhất
dưới dạng $2q + r$ với $r \in \{0,1\}$.

Định nghĩa **tập `S` (tập odd, tập các giá trị xuất hiện số lần lẻ)**:

$$S = \{\, v \in \mathcal{F} \mid \varepsilon_v = 1 \,\}$$

Hai hệ quả trực tiếp, đều dùng để giải bài:

- **Về tổng:** $\displaystyle\sum_v c_v v = \underbrace{\sum_{v \in S} v}_{\text{gọi là } \sigma} + 2\sum_v t_v v$
- **Về số phần tử:** $\displaystyle k = \sum_v c_v = |S| + 2\sum_v t_v$
- **Về XOR:** vì $v \oplus v = 0$, các số lần chẵn triệt tiêu hoàn toàn, nên
  $\displaystyle\bigoplus_{\text{các phần tử của } a} = \bigoplus_{v \in S} v$

> Nói cách khác: **XOR chỉ phụ thuộc vào tập $S$; các cặp $t_v$ không ảnh
> hưởng gì tới XOR.** Đây là bước tách bài toán thành hai phần độc lập.

Kí hiệu thêm: $\sigma(S) = \sum_{v \in S} v$ (tổng các giá trị trong $S$).

### 2.4. Bài toán coin-change với hệ Fibonacci

Đặt

$$\operatorname{mc}(Q) = \min \Big\{ |b| \;\Big|\; b \text{ là đa tập Fibonacci},\ \sum_{b} b = Q \Big\}$$

tức là **số phần tử Fibonacci tối thiểu** (được phép lặp) để tạo ra tổng $Q$.
Đây chính là bài toán đổi tiền với hệ coin Fibonacci. Kí hiệu tắt: $\operatorname{mc}$.

Định nghĩa hàm này độc lập với $S$: nó phụ thuộc $Q$ và $\mathcal{F}$ trong đó
$y$ là số Fibonacci lớn nhất không vượt quá giá trị đó.

### 2.5. XOR như phép cộng trên $\mathbb{F}_2$ — đặc trưng toán học

Xem mỗi số nguyên như một **vector bit**. Phép $\oplus$ chính là phép cộng của
các vector này trong không gian $\mathbb{F}_2$ (mỗi phần tử là $0$ hoặc $1$,
cộng theo mod 2). Vì mọi giá trị Fibonacci đều $< 2^{40}$, toàn bộ bài toán
XOR nằm trong $\mathbb{F}_2^{40}$.

Bật mỗi giá trị Fibonacci thành một biến nhị phân:

$$x_v = \begin{cases} 1 & v \in S \\ 0 & v \notin S\end{cases} \qquad (v \in \mathcal{F},\ |\mathcal{F}| = 58)$$

thì ràng buộc XOR trở thành **hệ phương trình tuyến tính** trên $\mathbb{F}_2$:

$$\bigoplus_{v \in \mathcal{F}} x_v \cdot v = n \quad (x_v \in \{0,1\})$$

Đây là hệ **40 phương trình, 58 ẩn số** — một bài toán tuyến tính, không còn là
bài tìm tập con trong không gian $2^{58}$.

Định nghĩa các khái niệm tuyến tính dùng ở mục 4:

- **Hạng (rank)** của hệ: số phương trình độc lập tuyến tính, bằng
  $40$ (vì các giá trị Fibonacci có bit cao nhất là bit 39).
- **Ẩn số tự do (nullity)** $= |\mathcal{F}| - \text{rank} = 58 - 40 = 18$.
- **Tập nghiệm** của một hệ tuyến tính nhất quán là một **affine subspace**
  (dịch của một không gian con). Với 18 ẩn tự do, mỗi ẩn nhận giá trị $0$
  hoặc $1$ độc lập → tổng cộng $2^{18} = 262144$ nghiệm.

### 2.6. Bảng số liệu theo từng subtask

Đo bằng code (Gauss trên $\mathbb{F}_2$ với $\mathcal{F}$ giới hạn theo $m$):

| Ràng buộc | $\lvert\mathcal{F}\rvert$ | Bit cao nhất | Rank | Ẩn tự do | Số tập con cần duyệt |
|---|---|---|---|---|---|
| $m, n < 10^{4}$ | 19 | 13 | 13 | 6 | $2^{6} = 64$ |
| $m, n < 10^{7}$ | 34 | 24 | 24 | 10 | $2^{10} = 1024$ |
| $m, n < 10^{9}$ | 43 | 30 | 30 | 13 | $2^{13} = 8192$ |
| $m \le 10^{12}$ | 58 | 40 | 40 | 18 | $2^{18} = 262144$ |

> **Lưu ý quan trọng ở dòng đầu:** khi $m, n < 10^4$ thì $\text{rank} = 13$ trong
> khi $n$ có thể cần tới $14$ bit (vì $n < 10^4 < 2^{14}$). Nguyên nhân cụ thể:
> số Fibonacci lớn nhất $\le 10^4$ là $6765 < 2^{13}$, nên **bit thứ 13 (trọng số
> $8192$) không bao giờ được bật** trong XOR của bất kỳ tập con nào của
> $\mathcal{F} \cap [1, 10^4]$. Đo bằng code: trong $10^4$ giá trị $n \in [0, 10^4)$
> thì **1808 giá trị không biểu diễn được**, tất cả đều $\ge 8192$.
>
> Vậy ở subtask 1, `-1` xuất hiện vì lý do *không biểu diễn được XOR*. Ở ba
> subtask còn lại thì $\text{rank}$ đã đủ lớn để **mọi** $n \le 10^{12}$ đều
> biểu diễn được, và `-1` chỉ xuất hiện vì lý do *ràng buộc tổng* (xem mục 7.1).

---

## 3. Vì sao các cách đơn giản chưa đủ

### 3.1. Tham lam theo tổng — sai vì bỏ qua XOR

Bỏ qua ràng buộc XOR, bài toán chỉ còn là: tối thiểu hoá số phần tử để cộng ra
$m$. Đây là bài coin-change hệ Fibonacci và tham lam là đúng (Lemma 3).

Nhưng thêm ràng buộc XOR thì tham lam **sai**, vì khi thêm phần tử thứ hai vào,
XOR thay đổi theo cách không kiểm soát được. Phản ví dụ cụ thể — sample đầu
của đề:

- $m = 19$, $n = 13$. Tham lam theo tổng: $19 = 13 + 5 + 1$ (3 phần tử),
  nhưng $\;13 \oplus 5 \oplus 1 = 8 \oplus 1 = 9 \neq 13$. **Sai.**
- Lời giải đúng mà đề đưa ra: $a = (3, 13, 3)$, tổng $= 19$,
  XOR $= 3 \oplus 13 \oplus 3 = 13$. Đúng $k = 3$.

Chú ý cấu trúc của lời giải đúng: giá trị $3$ xuất hiện **hai lần** (số lần
chẵn → triệt tiêu trong XOR, nhưng vẫn đóng góp $6$ vào tổng), còn $13$ xuất
hiện **một lần** (số lần lẻ → giữ lại trong XOR). Đây chính xác là hiện tượng
parity split mà tham lam tổng không bao giờ sinh ra.

→ Vì vậy bắt buộc phải xử lý **đồng thời** cả hai ràng buộc, không thể tách rời.

### 3.2. DP thô trên trạng thái $(m, n)$ — quá lớn

Trạng thái tự nhiên là cặp $(s, x)$ với $s$ = tổng đã đạt, $x$ = XOR hiện tại.
Ta có $s \le 10^{12}$ và $x < 2^{40}$, nên số trạng thái là

$$O(m \cdot 2^{40}) \approx 10^{12} \times 10^{12}$$

hoàn toàn không khả thi. Ngay cả khi bỏ bớt, một bước DP trên $s$ cũng cần
$O(m)$ = $10^{12}$ bước cho mỗi test, vượt xa giới hạn thời gian.

### 3.3. Meet-in-the-middle trên 58 giá trị — quá nhiều

Cách kinh điển: chia $58$ thành hai nửa $29 + 29$, dựng bảng hash mọi tập con của
mỗi nửa rồi ghép cặp. Nhưng số tập con của một nửa là

$$2^{29} \approx 5.4 \times 10^{8}$$

Không khả thi ở mỗi nửa, chưa nói tới $T = 10$ test.

### 3.4. Kết luận mở đầu

Cả ba hướng trên đều thất bại vì chúng **coi 58 giá trị Fibonacci là 58 đối
tượng độc lập cần dò**, tức là coi bài toán có $2^{58}$ trạng thái. Ta cần một
cách nhận diện đúng đặc trưng toán học của bài: **XOR là phép cộng trên
$\mathbb{F}_2$** (mục 2.5), biến bài toán thành hệ tuyến tính 40 phương trình
58 ẩn số, chỉ còn $2^{18}$ nghiệm.

---

## 4. Nhận xét / Bổ đề

### Lemma 1 (Tách parity — tính duy nhất)

> Với mọi dãy hợp lệ $a$ (tổng $= m$, XOR $= n$), tồn tại **duy nhất** một cặp
> $(S, \{t_v\})$ gồm tập $S \subseteq \mathcal{F}$ và các số nguyên
> $t_v \ge 0$ sao cho
> $$\bigoplus_{v \in S} v = n, \qquad \sigma(S) + 2\sum_v t_v v = m.$$

**Chứng minh.** Với mỗi $v$, số lần xuất hiện $c_v$ là số nguyên không âm nên
có phân rã duy nhất $c_v = \varepsilon_v + 2t_v$ với $\varepsilon_v \in \{0,1\}$.
Đặt $S = \{v : \varepsilon_v = 1\}$.

- Về tổng: $\sum_v c_v v = \sum_v \varepsilon_v v + 2\sum_v t_v v = \sigma(S) + 2\sum_v t_v v = m$.
- Về XOR: $v \oplus v = 0$ nên $c_v$ bản $v$ góp $\varepsilon_v$ lần $v$ và
  $t_v$ cặp triệt tiêu; tổng còn lại đúng là $\bigoplus_{v \in S} v = n$. ∎

**Hệ quả (quan trọng):** vì một dãy hợp lệ có giá trị $\sigma(S)$ cố định và
XOR cố định bởi $S$, nên **XOR không phụ thuộc vào $t_v$**; các cặp chỉ có
nhiệm vụ bù tổng.

### Lemma 2 (Chi phí của một tập $S$ cố định)

> Cố định tập $S \subseteq \mathcal{F}$ thỏa $\bigoplus_{v\in S} v = n$. Nếu
> $\sigma(S) \le m$ và $(m - \sigma(S))$ chẵn, thì số phần tử nhỏ nhất của một
> dãy hợp lệ có tập odd là $S$ bằng
> $$\operatorname{cost}(S) = |S| + 2 \cdot \operatorname{mc}\!\left(\frac{m - \sigma(S)}{2}\right).$$

**Chứng minh.** Theo Lemma 1, khi đã chốt $S$ thì phần còn lại của dãy chỉ gồm
các cặp: tổng phần cặp phải bằng $m - \sigma(S)$, và do mỗi cặp của $v$ đóng
góp $2v$, nên cần
$$\sum_v t_v v = \frac{m - \sigma(S)}{2} =: Q.$$

Tổng số phần tử là $|S| + 2\sum_v t_v$. Vì thế muốn nhỏ nhất hãy tối thiểu hoá
$\sum_v t_v$ dưới ràng buộc $\sum_v t_v v = Q$, mà định nghĩa ở mục 2.4 cho
đây chính là $\operatorname{mc}(Q)$. Suy ra công thức. ∎

**Hệ quả:** bài toán quy về
$$\operatorname{ans} = \min_{\substack{S \subseteq \mathcal{F},\ \bigoplus S = n\\ \sigma(S) \le m,\ (m-\sigma(S)) \text{ chẵn}}} \operatorname{cost}(S).$$

### Lemma 3 (Tham lam là tối ưu cho hệ coin Fibonacci)

> Với hệ coin Fibonacci, thuật toán tham lam — lặp lại lấy số Fibonacci lớn
> nhất không vượt quá phần dư — trả về số coin tối thiểu, tức là
> `minCoins` trong code chính xác bằng $\operatorname{mc}$.

**Chứng minh (sketch).** Hệ Fibonacci có hai tính chất: $f_{i+2} = f_{i+1} + f_i$
và $f_{i+1} \le 2 f_i$ với mọi $i \ge 2$. Hai tính chất này cho thấy:

1. *Không lãng phí khi thay thế:* với $f_i \ge 2$, biểu diễn $f_i = f_{i-1} +
   f_{i-2}$ không làm tăng số coin, nên một lời giải tối ưu không cần dùng
   $f_i$ nếu đã dùng được hai coin nhỏ hơn thay thế.
2. *Hai coin bằng nhau không cần thiết:* một cặp $(g, g)$ tổng $2g$ luôn thay
   được bằng các coin Fibonacci không lớn hơn với số coin không tăng.

Từ đó, mọi lời giải tối ưu đều có dạng tham lam: luôn ưu tiên coin lớn nhất
còn vừa. ∎

**Đã kiểm bằng brute force (DP độc lập, không dùng greedy):**

| Hệ coin | Miền $Q$ kiểm tra | Số case | Sai số |
|---|---|---|---|
| $\mathcal{F} \le 50$ | $0 \le Q \le 5000$ | 5001 | **0** |
| $\mathcal{F} \le 200$ | $0 \le Q \le 20000$ | 20001 | **0** |

### Lemma 4 (Số nghiệm của ràng buộc XOR)

> Xét hệ phương trình $\bigoplus_{v \in \mathcal{F}} x_v v = n$ trên
> $\mathbb{F}_2^{58}$. Với $\mathcal{F} = \{$ 58 số Fibonacci $\le 10^{12}\}$:
>
> **(a)** Hệ có hạng $40$, nên **số ẩn tự do là $18$**.
> **(b)** Với mỗi $n \in [0, 2^{40})$, tập các tập con $S$ thỏa
> $\bigoplus_{v \in S} v = n$ có **đúng $2^{18} = 262144$** phần tử, và lập thành
> một affine subspace. Đặc biệt **mọi** $n \le 10^{12} < 2^{40}$ đều biểu diễn
> được.

**Chứng minh.** Các giá trị Fibonacci đều nhỏ hơn $2^{40}$ nên nằm trong
$\mathbb{F}_2^{40}$. Chạy Gauss trên 40 hàng, mỗi hàng là một vế của hệ (bit
thứ $b$ của phương trình), với 58 ẩn — thu được hạng $40$. Số ẩn tự do của hệ
$58$ ẩn là $58 - 40 = 18$. Vì hệ nhất quán với mọi vế phải, tập nghiệm là affine
subspace k chiều $18$ trong không gian ẩn, nên có $2^{18}$ phần tử. ∎

**Đã kiểm bằng code:**

```
fibs: 58   rank: 40   null dim: 18   2^18 = 262144
all 18 null basis vectors verified (XOR == 0)
```

**Hệ quả rất quan trọng:** vì $\text{rank} = 40 = $ số bit của $n$ nên **không
bao giờ** phải trả `-1` vì lý do "không biểu diễn được XOR" ở subtask 2–4. Vậy
`-1` chỉ xảy ra khi **mọi** tập $S$ biểu diễn được đều vi phạm
$\sigma(S) \le m$ hoặc $(m - \sigma(S))$ chẵn. (Ở subtask 1 thì khác — xem
mục 2.6.)

### Lemma 5 (Đặc tính của một tập con: đủ để tính $\sigma$ và $|S|$)

> Trong vòng lặp duyệt, với mặt nạ `sm` biểu diễn tập $S$, ta tính được
> $\sigma(S)$ và $|S|$ chỉ bằng cách duyệt các bit bật của `sm`.

**Chứng minh.** Bit thứ $i$ của `sm` bật đúng khi $f_i \in S$. Duyệt các bit bật
(liên tiếp nhau bằng `t &= t - 1`) và cộng $f_i$ vào $\sigma$, đếm số bit bật
bằng `popcount`, ta được đúng $\sum_{v\in S} v$ và $|S|$. Các bit cao hơn bit 39
không bao giờ bật nên không cần xét. ∎

---

## 5. Chuỗi suy nghĩ: từ đặc trưng → nhận xét → thuật toán

```text
Hai ràng buộc (tổng, XOR) trên cùng một đa tập Fibonacci
        │
        ├──► v ⊕ v = 0  ⇒  số lần chẵn triệt tiêu trong XOR
        │       │
        │       ├──► Tách parity:  c_v = ε_v + 2·t_v          (định nghĩa 2.3)
        │       │        ⇒ tập S (odd set) quyết định XOR; các cặp t_v chỉ bù tổng
        │       │                                                  [Lemma 1]
        │       ▼
        │   Với S cố định:  còn lại Q = (m − σ(S))/2, tốn 2 phần tử mỗi coin
        │       └──► chi phí = |S| + 2·mc(Q),  mc bằng greedy        [Lemma 2, 3]
        │                          (greedy chuẩn vì hệ Fibonacci canonical)
        │
        └──► XOR là phép cộng trên F_2  ⇒  mỗi giá trị Fibonacci là 1 ẩn nhị phân
                │
                ├──► Hệ 40 phương trình, 58 ẩn, rank = 40, ẩn tự do = 18
                │                                                  [Lemma 4]
                │       ⇒ chỉ 2^18 = 262144 tập con thỏa XOR(S) = n
                │
                └──► DUYỆT HẾT 2^18 tập, KHÔNG cần meet-in-the-middle
                        (thay vì 2^29 mỗi nửa — vượt bộ nhớ)
```

**Điểm bản lề:** vì Lemma 1 cắt bài thành hai phần độc lập (XOR chỉ phụ thuộc
$S$; tổng phần dư chỉ phụ thuộc coin), nên bài toán gốc — *đồng thời* tối
thiểu hoá tổng và cố định XOR — trở thành bài toán *duyệt tập con $S$ thỏa
XOR $= n$*. Và nhờ Lemma 4, số tập con ấy chỉ là $2^{18}$.

---

## 6. Thuật toán chi tiết + khung cài đặt C++

### 6.1. Thuật toán

**Bước 0 (dùng chung cho mọi test, chỉ làm một lần).** Sinh $\mathcal{F}$ và dựng
cơ sở tuyến tính:

1. Sinh 58 giá trị Fibonacci dương $\le 10^{12}$ vào `fib`.
2. Dựng linear basis trên $\mathbb{F}_2$ trong 40 bit, kèm mặt nạ chỉ số:
   `basis[bit] = (giá trị rút gọn, mặt nạ)`.
   - Với mỗi `fib[i]`, đặt `x = fib[i]`, `m = 1ULL << i`.
   - Lặp: `hb` = bit cao nhất đang bật của `x`. Nếu `hb` có trong `basis` thì
     `x ^= basis[hb].first; m ^= basis[hb].second` (rút gọn, đồng thời cập nhật
     mặt nạ theo cùng phép XOR).
   - Nếu gặp bit chưa có trong `basis` thì lưu `basis[hb] = (x, m)` và dừng.
   - Nếu `x` về $0$ sau khi rút gọn hết, thì `m` chính là **một mặt nạ phụ
     thuộc**: XOR của `fib[i]` theo các bit bật của `m` bằng $0$. Đẩy `m` vào
     `dep`.
   - Thu được **18** vector trong `dep`.

**Bước 1. Mỗi test $(m, n)$ — tìm một nghiệm riêng.** Rút gọn $n$ qua basis:

- `x = n`, `part = 0`; lặp lại `hb` = bit cao nhất của `x`, `x ^= basis[hb].first`,
  `part ^= basis[hb].second`.
- Nếu tới bước nào mà `hb` không có trong `basis` thì $n$ không biểu diễn được →
  in `-1`. Với $\text{rank} = 40$ và $n < 2^{40}$ điều này **không xảy ra** ở
  subtask 2–4, nhưng vẫn giữ để đúng về mặt lý thuyết.
- Khi rút gọn triệt tiêu, `part` là mặt nạ thỏa $\bigoplus_{i \in part} f_i = n$.

**Bước 2. Duyệt toàn bộ affine subspace.** Với `D = dep.size()` (= 18), lặp
`combo` từ $0$ tới $2^{18} - 1$; dựng mặt nạ

$$S = part \oplus \bigoplus_{t \in combo} dep_t$$

**Bước 3. Chấm điểm tập $S$.** Tính $\sigma = \sum_{i \in S} fib[i]$ và
$c = |S|$ (Lemma 5). Bỏ qua nếu:

- $\sigma > m$ — vì tổng đã vượt $m$ mà mọi phần tử đều dương nên không thể sửa;
- $(m - \sigma)$ **lẻ** — vì phần cặp luôn đóng góp một số chẵn (Lemma 1).

Ngược lại cập nhật `best = min(best, c + 2 * minCoins((m - σ) / 2))`.

**Bước 4.** In `best`, hoặc `-1` nếu `best` vẫn chưa được gán (không tập con nào
hợp lệ).

### 6.2. Hàm `minCoins` — cài đặt $\operatorname{mc}$ theo Lemma 3

```cpp
// mc(Q): số Fibonacci tối thiểu (lặp được) có tổng bằng Q — tham lam
int minCoins(ll Q) {
    int c = 0, i = (int)fib.size() - 1;
    while (Q > 0) {
        while (i > 0 && fib[i] > Q) i--;   // tìm số Fibonacci lớn nhất ≤ Q
        Q -= fib[i];
        c++;
    }
    return c;
}
```

Chỉ số `i` chỉ đi giảm nên một lần gọi tốn $O(58)$.

### 6.3. Khung cài đặt đầy đủ

```cpp
#include <bits/stdc++.h>
using namespace std;
using ll = long long;
using ull = unsigned long long;

vector<ll> fib;                    // 58 giá trị Fibonacci dương <= 1e12
vector<ull> dep;                   // 18 mặt nạ phụ thuộc (XOR == 0)
map<int, pair<ull, ull>> basis;    // bit dẫn -> (giá trị rút gọn, mặt nạ chỉ số)

int minCoins(ll Q) {
    int c = 0, i = (int)fib.size() - 1;
    while (Q > 0) {
        while (i > 0 && fib[i] > Q) i--;
        Q -= fib[i];
        c++;
    }
    return c;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    const ll LIM = 1000000000000LL;
    ll a = 1, b = 2;
    while (a <= LIM) { fib.push_back(a); ll t = a + b; a = b; b = t; }

    // Bước 0: dựng basis + thu 18 vector phụ thuộc
    for (int i = 0; i < (int)fib.size(); i++) {
        ull x = (ull)fib[i], m = 1ULL << i;
        while (x) {
            int hb = 63 - __builtin_clzll(x);
            auto it = basis.find(hb);
            if (it != basis.end()) {
                x ^= it->second.first;
                m ^= it->second.second;
            } else { basis[hb] = {x, m}; break; }
        }
        if (x == 0) dep.push_back(m);   // mặt nạ phụ thuộc
    }

    int T;
    cin >> T;
    while (T--) {
        ll m, nX;
        cin >> m >> nX;

        // Bước 1: particular solution
        ull x = (ull)nX, part = 0;
        bool ok = true;
        while (x) {
            int hb = 63 - __builtin_clzll(x);
            auto it = basis.find(hb);
            if (it == basis.end()) { ok = false; break; }
            x ^= it->second.first;
            part ^= it->second.second;
        }
        if (!ok) { cout << -1 << '\n'; continue; }

        // Bước 2 + 3: duyệt affine subspace
        int D = (int)dep.size(), best = INT_MAX;
        for (int combo = 0; combo < (1 << D); combo++) {
            ull sm = part;
            for (int t = 0; t < D; t++)
                if ((combo >> t) & 1) sm ^= dep[t];

            ll s = 0;
            int cnt = __builtin_popcountll(sm);
            for (ull t = sm; t; t &= t - 1) s += fib[__builtin_ctzll(t)];

            if (s > m) continue;              // tổng đã vượt m
            ll rest = m - s;
            if (rest & 1) continue;            // phần cặp phải chẵn
            best = min(best, cnt + 2 * minCoins(rest / 2));
        }

        cout << (best == INT_MAX ? -1 : best) << '\n';
    }
    return 0;
}
```

### 6.4. Vài lưu ý kỹ thuật

- `__builtin_clzll` trả về số **0 ở đầu** (leading zeros), nên bit cao nhất là
  `63 - __builtin_clzll(x)`. Không gọi khi `x == 0`.
- `__builtin_ctzll` trả về số **0 ở cuối** (trailing zeros), tức chỉ số bit thấp
  nhất đang bật — dùng để duyệt các bit bật của mặt nạ.
- Kiểu `ll` là bắt buộc: $\sigma(S)$ là tổng của tới 58 số Fibonacci, và $m$
  tới $10^{12}$. Tổng lớn nhất có thể vượt $2^{31}$ nên `int` không đủ. Trong
  phép so sánh `s > m` và `rest = m - s`, cả hai đều là `ll`.
- `(1 << D)` với $D = 18$ là `int` an toàn. Nếu vì lý do nào đó `D` vượt 30 thì
  phải đổi sang `1ULL << D`.

---

## 7. Chứng minh đúng, độ phức tạp, kiểm tra tay

### 7.1. Chứng minh đúng đắn

**Định nghĩa tập ứng viên.** Gọi $\mathcal{S}_m$ là tập các tập con
$S \subseteq \mathcal{F}$ thỏa đồng thời ba điều kiện:
(i) $\bigoplus_{v \in S} v = n$; (ii) $\sigma(S) \le m$; (iii) $m - \sigma(S)$
chẵn.

**Bổ đề A.** Tập các tập con $S \subseteq \mathcal{F}$ thỏa
$\bigoplus_{v \in S} v = n$ **đúng bằng** tập các mặt nạ
$part \oplus \bigoplus_{t \in combo} dep_t$ với $combo \in [0, 2^{18})$.

*Chứng minh.* Theo Lemma 4(b), tập nghiệm của hệ tuyến tính
$\bigoplus x_v v = n$ là một affine subspace có đúng $2^{18}$ phần tử. Theo cách
dựng basis ở bước 0, `part` là một nghiệm cụ thể, còn `dep` là 18 vector thuộc
không gian con đồng nhất (mỗi cái XOR bằng $0$, đã kiểm bằng code). Tổng của
một nghiệm cụ thể với bất kỳ tổ hợp nào của các vector đồng nhất vẫn là một
nghiệm, và mọi nghiệm đều viết được như vậy một cách duy nhất. Vì số phần tử
hai bên bằng nhau và một bên chứa bên kia, hai tập bằng nhau. ∎

**Bổ đề B.** Với mọi $S \in \mathcal{S}_m$, giá trị
$|S| + 2\,\operatorname{mc}\big(\frac{m - \sigma(S)}{2}\big)$ là số phần tử
nhỏ nhất của một dãy hợp lệ có tập odd là $S$.

*Chứng minh.* Đây chính là Lemma 2, kèm việc `minCoins` tính đúng $\operatorname{mc}$
theo Lemma 3. ∎

**Bổ đề C.** Mọi tập con $S$ thỏa (i) nhưng **không** thỏa (ii) hoặc (iii) thì
không sinh ra dãy hợp lệ nào.

*Chứng minh.* Nếu $\sigma(S) > m$ thì tổng đã vượt $m$ mà các phần tử còn lại
đều dương, nên tổng không thể bằng $m$. Nếu $m - \sigma(S)$ lẻ thì phần cặp
đóng góp $2\sum t_v v$ — một số **chẵn** — nên tổng luôn chẵn, mâu thuẫn với
$m$ lẻ. ∎

**Kết luận.** Mọi dãy hợp lệ $a$ đều ứng với đúng một $S \in \mathcal{S}_m$ (Lemma 1,
Bổ đề C), và ngược lại mọi $S \in \mathcal{S}_m$ đều dựng được dãy hợp lệ với
chi phí ở Bổ đề B. Vòng lặp duyệt **đúng toàn bộ** $\mathcal{S}_m$ nhờ Bổ đề A,
và lấy min trên đúng tập chi phí tối ưu ấy. Do đó thuật toán in ra $k$ nhỏ nhất.
Nếu $\mathcal{S}_m = \emptyset$ thì không tồn tại dãy hợp lệ, in `-1`. ∎

### 7.2. Độ phức tạp

Xét một test:

- Dựng basis + 18 vector phụ thuộc: $O(58 \cdot 40)$ — thực hiện **một lần** cho
  cả chương trình, không tính theo test.
- Tìm particular solution: $O(40)$.
- Duyệt $2^{18}$ tập con. Với mỗi tập:
  - dựng mặt nạ `sm`: $O(18)$;
  - tính $\sigma$ và $|S|$: $O(58)$ theo Lemma 5;
  - `minCoins`: $O(58)$.
  Tổng $O(58)$ mỗi tập.

$$\boxed{O\big(2^{18} \cdot 58\big) \approx 1.5 \times 10^{7} \text{ phép mỗi test}}$$

Với $T \le 10$: khoảng $1.5 \times 10^8$ phép. Bộ nhớ phụ: $O(58 + 40)$.

**Đo thực tế:** $T = 10$ test ngẫu nhiên ở cận biên
($m$ tới $10^{12}$, $n$ ngẫu nhiên) chạy **0.027 giây** với `-O2`. Dư địa rất
lớn so với giới hạn thời gian thông thường.
