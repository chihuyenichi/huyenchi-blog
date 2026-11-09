---
title: "Marionette - CSCV 2026"
slug: "marionette-cscv-2026"
date: "2026-11-09"
description: "Exploiting a SHUFFLE mode-1 signed-index underwrite in a custom PuppetScript VM to enlarge an owned buffer past its capacity clamp and decrypt the flag via a hidden opcode."
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
---

## Summary

*[Bản tiếng Việt](/writeups/marionette-cscv-2026-vi)*

The Marionette challenge is a TCP forking server implementing a custom PuppetScript VM. The flag is obtained by exploiting a **SHUFFLE mode-1 signed-index underwrite** to enlarge a legitimate owned buffer beyond the `NEWBUF` capacity clamp (`0x200`), then invoking hidden opcode `0x66` with a computed stage key to decrypt the flag page into the enlarged buffer, and finally printing it via `PRINTS`.

**Flag**: `CSCV2026{37ca8dffdf75512ac8c07a3e070e9f64}`

At connection time, the program spins up a fresh VM session and encrypts the flag into the VM's `stage_page` region. The client interacts with that VM entirely through framed input messages, which is where the exploitable vulnerability chain begins.

## Challenge Overview

| Property | Value |
|---|---|
| Binary | `marionette` |
| Architecture | ELF 64-bit LSB pie executable, x86-64, dynamically linked, stripped |
| SHA-256 | `d33e26c10a0bf05c1c4c3d6006d8e0fe3f684335575333dd2bbb0bdd8d789248` |
| Mitigations | Full RELRO, Stack Canary, NX, PIE, FORTIFY, Seccomp |
| Local test | `PUPPET_PORT=31337 PUPPET_FLAG=/tmp/flag PUPPET_TIMEOUT=120 ./marionette` |

## Protocol Framing

The server accepts framed messages, big-endian:

```text
[u8 type][u32 seq][u64 mac][u16 len][payload]
```

**`type`** selects how the server interprets the payload:

| Value | Mode | Meaning |
|---|---|---|
| `1` | RUN | Load and execute the bytecode in `payload` on the VM |
| `2` | POOLINFO | Report the current state of the pool (a VM data structure) |
| `3` | QUIT | Close the connection |
| `0x50` | ADMIN | Requires a valid token before it can be used (hidden — not advertised in the banner) |

- **`seq`** keeps frame ordering, must increase from `1`.
- **`mac`** is a `u64` **FNV1a64 chain hash** over `[seq LE32 \| prev_mac LE64 \| payload]`, offset basis `0xcbf29ce484223325`, checked on every frame.
- **`len`** is the payload length (`u16`).
- **`payload`** depends on `type`: RUN carries `[u16 proglen BE][bytecode]`; POOLINFO/QUIT are empty; ADMIN carries an 8-byte token.

## VM Architecture

Each session is split across 4 separate heap blocks: the **VM state** (`0xbe8`, holding the stack, pool, metadata, PRNG and stage-decrypt fields), the **decode table** (`0x2c0`, an XOR table used to decode opcodes and encoded handler pointers), the **pool container** (holds `pool_count` + `slots_ptr`, the objects the client can manipulate), and the **output buffer**.

Fields relevant to the exploit, verified against the disassembly:

| Offset | Field | Note |
|---|---|---|
| `+0x90c` | `stage_count` | number of slots currently registered in the pool |
| `+0x910` | `container_ptr` | the exact field SHUFFLE corrupts via `*(container+0x08)` |
| `+0xab0` | PRNG state (xorshift64\*) | feeds the stage key |
| `+0xba8`/`+0xbb0`/`+0xbb8` | `stage_page` / `stage_hash` / `stage_key_material` | encrypted flag page and its validation/decryption material |
| `+0xbc8` | `stage_door_ready` | gates hidden opcode `0x66` |

### Pool Array Structure

| Offset | Field | Description |
|---|---|---|
| `+0x00` | `pool_count` | Number of slots (prelude = 6) |
| `+0x08` | `pool_pointer` | Pointer to the slot array — **target of SHUFFLE index=-2** |
| `+0x18` | `pool[0]` | Slot 0: owned buffer (cap = `0x200`) |
| `+0x20` | `pool[1]` | Slot 1: owned buffer (cap = `0x200`) |

## Vulnerability: SHUFFLE Mode-1 Negative-Index Underwrite

SHUFFLE is a stack-based VM operation that reads or writes a slot in the pool:

```c
void shuffle(VM *vm) {
    int64_t mode = pop();      // 0 = read, 1 = write
    int64_t val  = pop();      // value to write (mode=1)
    int64_t idx  = pop();      // signed index

    if (mode == 0) {  // READ path - SAFE
        idx = (idx % stage_count + stage_count) % stage_count;  // normalizes negative
        push(vm->pool[idx]);
    } else {  // WRITE path - VULNERABLE
        idx = idx % stage_count;  // C semantics: -2 % 6 = -2 (no normalization!)
        vm->pool[idx] = val;      // pool starts at container+0x18
    }
}
```

The read path normalizes a negative index into `[0, stage_count)`, but the **write path does not**. With `stage_count >= 2` (the prelude registers 6 slots), a write with `idx = -2` lands on `container+8`, i.e. `pool_pointer` itself — not on an element inside the pool array.

In the write path the assignment is effectively `*(pool_pointer + idx * 8) = val`, so:

1. `SHUFFLE mode=1, idx=-2, val=&owned_buffer->capacity` repoints `pool_pointer` to the address of the target object's `capacity` field.
2. `SHUFFLE mode=1, idx=0, val=520` then writes `520` (> `0x200`) through that hijacked pointer, setting the target object's `capacity` to `520`.

The object stays otherwise valid (magic `PPTS`, cookie match, owned-list membership) but now reports `capacity = 520 > 0x200`, which is exactly the gate checked by the hidden decrypt opcode.

**Note:** `stage_count` tracks how many objects have been registered, so at least **2 objects** must exist before the first SHUFFLE write — one of them becomes the target object later passed to hidden opcode `0x66`.

## Hidden Opcode `0x66` — Stage Decrypt

```c
bool hidden_0x66(VM *vm) {
    uint64_t key = pop();
    Object *dst = pop_object();  // validates owned, kind 0/1, data != NULL

    if (dst->capacity <= 0x200) return false;        // gate bypassed by the underwrite
    if (!stage_door_ready(vm)) return false;          // state+0xba8/0xbc8

    mprotect(vm->stage_page, 0x1000, PROT_READ|PROT_WRITE);
    if (mix(key) != vm->stage_hash) {                 // state+0xbb0
        mprotect(vm->stage_page, 0x1000, PROT_READ);
        return false;
    }
    decrypt_copy(vm->stage_page, dst->data, key, vm->stage_key_material);
    dst->used_len = 0x100;  // flag length
    mprotect(vm->stage_page, 0x1000, PROT_READ);
    clear_stage_scratch(vm);
    return true;
}
```

Reaching this opcode requires both the capacity bypass above and the `stage_door_ready` flag, which is only set by a successful hidden `ADMIN` (type `0x50`) frame.

### Admin Token & Stage Key

The `0x50` frame handler derives an 8-byte token deterministically from the per-session nonce printed in the banner:

```python
D = 0x7c4a9e1d3b5f2068
G = 0x9fcefcacc5ea5bfb

ab0 = D ^ nonce
for _ in range(14):
    ab0 = xorshift64(ab0)

token = fmix64(G ^ fmix64(ab0))   # fmix64 = MurmurHash3 finalizer
```

Sending type `0x50` with this token returns `#OK` and opens the stage door. The same PRNG state (`ab0`) then feeds the stage key required by `0x66`:

```python
stage_key = vm_ab0 ^ fmix64(vm_ab0 ^ fnv1a64(admin_payload)) ^ G ^ flag_prefix_word
# flag_prefix_word = u64_le("CSCV2026"), zero-padded
```

## Exploit Chain

```text
1. CONNECT
   └─ Receive banner → parse SESSION NONCE (16 hex digits)

2. COMPUTE ADMIN TOKEN (offline, deterministic from nonce)
   ├─ ab0 = D ^ nonce, 14x xorshift64, token = fmix64(G ^ fmix64(ab0))
   └─ Send TYPE 0x50 frame with token → #OK, stage door opens

3. SHUFFLE UNDERWRITE (create oversized buffer)
   ├─ GETSLOT 0 → push owned_buffer (slot 0, cap=0x200)
   ├─ SHUFFLE mode=1, idx=-2, val=owned_buffer+12   (overwrite pool_pointer)
   └─ SHUFFLE mode=1, idx=0,  val=520                (set capacity=520)

4. COMPUTE STAGE KEY from the PRNG state captured in step 2 + token + G + flag prefix

5. INVOKE HIDDEN OPCODE 0x66
   ├─ GETSLOT 0 (push enlarged buffer)
   ├─ PUSH stage_key
   └─ RAW_OPCODE_0x66  → decrypts flag page into buffer, sets used_len=0x100

6. PRINTS → FLAG
```

Raw opcode byte-to-internal mappings are session-dependent (XOR-encoded per session), so the exploit resolves them at runtime instead of hardcoding raw bytes.

## Root Cause

| Vulnerability | Location | Root Cause | Primitive |
|---|---|---|---|
| SHUFFLE mode-1 negative-index underwrite | SHUFFLE handler | Write path uses C's signed `%` without normalizing a negative index, while the read path does. Validation allows `idx ∈ [-stage_count, stage_count)` but only the read path maps that range into bounds. | Arbitrary qword write to `container+8` via `idx=-2`, then an arbitrary write through that hijacked pointer |

## Solver Script

The full exploit implements the framed client (correct FNV1a64 MAC), nonce parsing, admin token derivation, the SHUFFLE underwrite, stage key derivation, and the final `0x66` + `PRINTS` call. See [`solve.py`](/marionette-cscv-2026/solve.py).

```bash
# Local
python3 solve.py 127.0.0.1 31337

# Remote
python3 solve.py <host> <port> CSCV2026
```

**Remote output**:

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
