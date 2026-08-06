---
title: "RSA Warmup - Google CTF 2026"
slug: "google-ctf-2026-rsa-warmup"
date: "2026-07-27"
description: "Recovering the private key from a weak RSA setup."
category: "crypto"
event: "Google CTF 2026"
year: 2026
difficulty: "medium"
author: "Huyen Chi"
tags:
  - RSA
  - Crypto
  - Coppersmith
status: "published"
sourceUrl: "https://example.com/challenge"
checksums:
  - {
      file: "challenge.bin",
      sha256: "TODO"
    }
  - {
      file: "source.py",
      sha256: "TODO"
    }
quickLinks:
  - label: "Challenge files"
    url: "https://example.com/files"
  - label: "Solver source"
    url: "https://github.com/example/solver"
---

# RSA Warmup - Google CTF 2026

## Contents 

- [Challenge Overview](#challenge-overview)
- [Directed Analysis](#directed-analysis)
- [Vulnerability Identification](#vulnerability-identification)
- [Exploitation](#exploitation)
- [Solver Script](#solver-script)
- [Flag](#flag)

---

## Challenge Overview

- Goal: recover private key / flag
- Provided: binary, source, remote endpoint
- Approach: high-level summary

## Directed Analysis

Direct observation from files. Key findings:

- Variables, loops, functions present
- Their behavior
- Impact on program flow

## Vulnerability Identification

- Suspicious patterns from analysis
- Root cause
- Why it leads to the bug

## Exploitation

- Step-by-step exploit chain
- Payload preparation
- Reasoning per step

## Solver Script

Solving script, brief comments per step.

```python
# TODO: solver goes here
```

## Flag

<details>
  <summary>Click to reveal</summary>

```
flag{...}
```

</details>

## Best Practices Checklist

Before finalizing the writeup, verify:

- [ ] **Metadata complete** — title, CTF, date, category, difficulty, points, author all filled
- [ ] **Flag handling matches request** — keep the real flag unless the user asked for redaction
- [ ] **Reproducible steps** — a reader can follow your writeup and reproduce the solution
- [ ] **Code is runnable** — exploit scripts include all imports, correct variable names, and comments
- [ ] **No sensitive data** — no real credentials, API keys, or private infrastructure details
- [ ] **Length stays concise** — the writeup is short enough for fast review
- [ ] **Tools and versions noted** — mention specific tool versions if behavior depends on them
- [ ] **Proper attribution** — credit teammates, referenced writeups, or tools that were essential
- [ ] **Grammar and formatting** — consistent heading levels, code blocks have language tags

## Quality Guidelines

**DO:**
- Explain just enough for fast verification
- Include one complete solving path, not multiple alternative routes
- Include one complete script that goes all the way to the final flag
- Show actual output (truncated if very long) to prove the approach worked
- Tag code blocks with language (`python`, `bash`, `sql`, etc.)
- Keep the main path front-loaded so a reader can validate it quickly

**DON'T:**
- Copy-paste raw terminal dumps without explanation
- Paste several partial snippets that force the reader to reconstruct the final solve
- Leave placeholder text in the final writeup
- Include irrelevant tangents that don't contribute to the solution
- Assume the reader knows the specific challenge setup
