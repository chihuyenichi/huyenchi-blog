#!/usr/bin/env python3
import argparse
import concurrent.futures
import json
import socket
import string
import time


HOST = "66.228.50.16"
PORT = 48271

BASE_NAMES = [
    "_",
    "__",
    "a",
    "ans",
    "answer",
    "archive",
    "archives",
    "bdsec",
    "BDSEC",
    "cache",
    "ctx",
    "context",
    "data",
    "db",
    "debug",
    "door",
    "env",
    "expr",
    "expression",
    "f",
    "file",
    "flag",
    "FLAG",
    "Flag",
    "flagtxt",
    "flag_txt",
    "flagfile",
    "flag_file",
    "gate",
    "globals",
    "hidden",
    "input",
    "key",
    "locals",
    "memory",
    "namespace",
    "obj",
    "object",
    "obsidian",
    "oracle",
    "output",
    "prompt",
    "result",
    "root",
    "sandbox",
    "scope",
    "seal",
    "sealed",
    "secret",
    "secrets",
    "state",
    "storage",
    "token",
    "user",
    "value",
    "vault",
    "win",
]

PREFIXES = [
    "flag",
    "secret",
    "archive",
    "sealed",
    "gate",
    "obsidian",
    "vault",
    "key",
    "debug",
    "oracle",
]

SUFFIXES = [
    "",
    "_",
    "s",
    "_data",
    "_file",
    "_flag",
    "_key",
    "_secret",
    "_text",
    "_txt",
    "_value",
    "Data",
    "File",
    "Flag",
    "Key",
    "Secret",
    "Text",
    "Txt",
    "Value",
]

FORMS = [
    ("bare", "{name}"),
    ("type", "type({name})"),
    ("repr", "repr({name})"),
    ("len", "len({name})"),
    ("dir", "dir({name})"),
]


def candidate_names():
    seen = set()
    for name in BASE_NAMES:
        if name not in seen:
            seen.add(name)
            yield name
    for prefix in PREFIXES:
        for suffix in SUFFIXES:
            for name in {
                prefix + suffix,
                prefix.upper() + suffix,
                prefix.capitalize() + suffix,
            }:
                if name and name not in seen:
                    seen.add(name)
                    yield name
    for ch in string.ascii_letters:
        if ch not in seen:
            seen.add(ch)
            yield ch
    for a in string.ascii_lowercase:
        for b in string.ascii_lowercase:
            name = a + b
            if name not in seen:
                seen.add(name)
                yield name


def recv_until_prompt(sock, timeout):
    sock.setblocking(False)
    end = time.time() + timeout
    data = b""
    while time.time() < end:
        try:
            chunk = sock.recv(4096)
        except BlockingIOError:
            time.sleep(0.01)
            continue
        if not chunk:
            break
        data += chunk
        if data.endswith(b"> ") or b"\n> " in data:
            break
    return data


def recv_for(sock, timeout):
    sock.setblocking(False)
    end = time.time() + timeout
    data = b""
    while time.time() < end:
        try:
            chunk = sock.recv(4096)
        except BlockingIOError:
            time.sleep(0.01)
            continue
        if not chunk:
            break
        data += chunk
    return data


def body_from(raw):
    text = raw.decode("utf-8", "replace")
    if "> " in text:
        return text.rsplit("> ", 1)[1].strip()
    return text.strip()


def classify(raw):
    body = body_from(raw)
    lines = [line.strip() for line in body.splitlines() if line.strip()]
    for line in reversed(lines):
        if line.startswith("GateError:"):
            return line, body
    if any("BDSEC{" in line for line in lines):
        return "flag", body
    if lines:
        return "pass", lines[-1]
    return "no response", body


def test_expr(expr, host, port, prompt_timeout, response_timeout, attempts):
    last = None
    for attempt in range(attempts):
        try:
            with socket.create_connection((host, port), timeout=prompt_timeout) as sock:
                banner = recv_until_prompt(sock, prompt_timeout)
                if b"> " not in banner:
                    last = ("no prompt", banner.decode("utf-8", "replace").strip())
                    time.sleep(0.1 + attempt * 0.1)
                    continue
                sock.sendall(expr.encode() + b"\n")
                raw = banner + recv_for(sock, response_timeout)
        except Exception as exc:
            last = (f"client error: {exc.__class__.__name__}", str(exc))
            time.sleep(0.1 + attempt * 0.1)
            continue
        outcome, body = classify(raw)
        if outcome not in {"no response", "no prompt"}:
            return outcome, body
        last = (outcome, body)
        time.sleep(0.1 + attempt * 0.1)
    return last


def interesting(outcome):
    return outcome not in {
        "GateError: unknown name",
        "no response",
        "no prompt",
    } and not outcome.startswith("client error:")


def esc(value):
    return str(value).replace("|", "\\|").replace("\n", "\\n")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default=HOST)
    parser.add_argument("--port", type=int, default=PORT)
    parser.add_argument("--workers", type=int, default=5)
    parser.add_argument("--attempts", type=int, default=2)
    parser.add_argument("--prompt-timeout", type=float, default=4)
    parser.add_argument("--response-timeout", type=float, default=1.5)
    parser.add_argument("--markdown", default="obsidian-gate/name_oracle_results.md")
    parser.add_argument("--names", nargs="*", default=None)
    args = parser.parse_args()

    names = args.names if args.names else list(candidate_names())
    tests = []
    for name in names:
        for label, form in FORMS:
            tests.append((name, label, form.format(name=name)))

    print(f"[*] probing {len(names)} names / {len(tests)} expressions")
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:
        future_map = {
            pool.submit(
                test_expr,
                expr,
                args.host,
                args.port,
                args.prompt_timeout,
                args.response_timeout,
                args.attempts,
            ): (name, label, expr)
            for name, label, expr in tests
        }
        for future in concurrent.futures.as_completed(future_map):
            name, label, expr = future_map[future]
            outcome, body = future.result()
            row = {
                "name": name,
                "label": label,
                "input": expr,
                "outcome": outcome,
                "body": body,
            }
            results.append(row)
            if interesting(outcome):
                print(f"[+] {expr!r} -> {outcome}: {body}", flush=True)

    results.sort(key=lambda r: (r["name"], r["label"]))
    hits = [r for r in results if interesting(r["outcome"])]
    lines = [
        "# Obsidian Gate Name Oracle Probe",
        "",
        f"Target: `{args.host}:{args.port}`",
        "",
        "## Hits",
        "",
        "| name | form | input | outcome | body |",
        "|---|---|---|---|---|",
    ]
    for row in hits:
        lines.append(
            f"| `{esc(row['name'])}` | {esc(row['label'])} | `{esc(json.dumps(row['input']))}` | {esc(row['outcome'])} | `{esc(row['body'])}` |"
        )
    lines += [
        "",
        "## All Results",
        "",
        "| name | form | input | outcome | body |",
        "|---|---|---|---|---|",
    ]
    for row in results:
        lines.append(
            f"| `{esc(row['name'])}` | {esc(row['label'])} | `{esc(json.dumps(row['input']))}` | {esc(row['outcome'])} | `{esc(row['body'])}` |"
        )
    with open(args.markdown, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print(f"[*] wrote {args.markdown} with {len(hits)} hits")


if __name__ == "__main__":
    main()
