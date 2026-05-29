---
title: "Return-Oriented Programming – Ret2Win (ROP Emporium)"
date: "2026-05-28"
category: "TryHackMe"
tags: ["PWN", "ROP", "Binary Exploitation", "TryHackMe"]
excerpt: "Solving the split challenge from ROP Emporium using Return-Oriented Programming technique to overwrite the stack and execute call_system with /bin/cat flag.txt."
---

## Challenge Overview

Description: That useful string "/bin/cat flag.txt" is still present in this binary, as is a call to system(). So we need to overwrite the stack with some ret address to make this call.

## Exploitation

- First we need to unzip the `.zip` file:

![unzip result](/images/return-oriented-programming-materials/checksec-info.png)

- Determining the type of `split`:

> split: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=98755e64e1d0c1bff48fccae1dca9ee9e3c609e2, not stripped

![checksec](/images/return-oriented-programming-materials/checksec-info.png)

- We saw `NO PIE`, so all the addresses in this binary are particular

- Execute this binary and press something like `AAAAAA` to it:

![short test input](/images/return-oriented-programming-materials/short-test-input.png)

- If I pass a longer input, it will be that:

![longer input](/images/return-oriented-programming-materials/longer-input.png)

-> This is the vulnerability and we can use buffer overflow (BOF) to exploit it

- Using IDA to see the disassembly of the binary:

![disassembly main](/images/return-oriented-programming-materials/disassembly-main.png)

This is the `main` function and the `pwnme` function is called in it.

- `pwnme` includes a `read` function with the size_max of input is 0x60 bytes, while `s` (the buffer of our input) is only 0x20 bytes:

![pwnme function](/images/return-oriented-programming-materials/pwnme-function.png)

-> It's the vulnerability that we can overwrite the data on the stack

- Moreover, there is a function that has the command `call _system`:

![call system address](/images/return-oriented-programming-materials/call-sys-address.png)

It's a useful command that helps us to do something related to its system, so we should save the address of this command.

- Go to strings which are listed in IDA:

![str bin sh](/images/return-oriented-programming-materials/str_bin_sh.png)

> .data:0000000000601060 00000012 C /bin/cat flag.txt

If it's the parameter of `call _system`, this challenge will be done.

## ROP (Return-Oriented Programming) Processing

- Our purpose is executing `call _system` with parameter `/bin/cat flag.txt`

- To do this, first we need to make `rdi/edi`'s value to `/bin/cat flag.txt` (because in Linux, the first parameter passed into a function is `rdi`)

- From here, we suppose we are in `pwnme` function, value of `rsp` and `rbp` are used at this time

- We will find a ROP gadget that can affect `rdi`, it is something like `pop rdi; ret`  
  To do it we will use a tool called `ROPgadget Tool`:

> (pwn_env) $ ROPgadget --binary ./split > gadgets.txt

And we see it (note this bolded address):

![pop rdi ret](/images/return-oriented-programming-materials/pop_rdi_ret.png)

- We have some definitions:
  - `pop_rdi_address` is the address of start of `pop rdi; ret` that we found above
  - `cat_flag_address` is the address of the string `/bin/cat flag.txt` in the binary
  - `sys_call_address` is the address of `call _system`

- The process will take place as follows:
  1. Fill the buffer (with length 0x20) of our input with the current `rbp`
  2. We will overwrite the stack like this:

![stack layout](/images/return-oriented-programming-materials/pop_rdi_ret.png)

### Explanation

- The value above `rbp` is the return address of a function. When this function finishes, `rip` will jump to the return address which is now `pop_rdi_address`, and `rsp` will be increased by 0x8 (it now points to `cat_flag_address`).

- `rip` starts from command `pop rdi`. When it is executed, it will pop the value on top of stack which is `cat_flag_address` -> so `rdi` will have the value of `cat_flag_address`. `rsp` will be increased by 8 and point to `call_sys_address`.

- The next instruction is `ret`, so `rip` will jump to the address on top of stack which is `call_sys_address`. The command `call _system` is executed, with `rdi` as its parameter — it means we are executing `/bin/cat flag.txt`.

## Code

The full exploit code is available [here](https://github.com/chihuyenichi/tryhackme-PWN101/blob/main/return-oriented-programming/exploit.py).
