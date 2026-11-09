#!/usr/bin/env python3
import argparse
import socket
import struct

FNV_OFFSET = 0xCBF29CE484223325
FNV_PRIME = 0x100000001B3


def fnv1a64(seed, data):
    h = seed
    for b in data:
        h ^= b
        h = (h * FNV_PRIME) & 0xffffffffffffffff
    return h


class PuppetClient:
    def __init__(
        self,
        host,
        port,
        timeout=3.0,
        initial_prev=0,
        include_type=False,
        little_mac=False,
    ):
        self.host = host
        self.port = port
        self.timeout = timeout
        self.seq = 1
        self.chain = FNV_OFFSET
        self.prev_mac = initial_prev
        self.include_type = include_type
        self.little_mac = little_mac
        self.sock = None

    def connect(self):
        self.sock = socket.create_connection((self.host, self.port), timeout=self.timeout)
        self.sock.settimeout(self.timeout)
        return self.recv_available()

    def recv_available(self):
        out = bytearray()
        while True:
            try:
                chunk = self.sock.recv(4096)
            except TimeoutError:
                break
            except socket.timeout:
                break
            if not chunk:
                break
            out += chunk
        return bytes(out)

    def frame(self, typ, payload=b""):
        body = struct.pack("<I", self.seq) + struct.pack("<Q", self.prev_mac) + payload
        if self.include_type:
            body = bytes([typ]) + body
        mac = fnv1a64(self.chain, body)
        mac_bytes = struct.pack("<Q" if self.little_mac else ">Q", mac)
        hdr = struct.pack(">BI", typ, self.seq) + mac_bytes + struct.pack(">H", len(payload))
        self.sock.sendall(hdr + payload)
        self.chain = mac
        self.prev_mac = mac
        self.seq += 1
        return self.recv_available()


def run(
    host,
    port,
    program,
    initial_prev=0,
    include_type=False,
    little_mac=False,
    poolinfo=True,
    quit_after=True,
):
    c = PuppetClient(
        host,
        port,
        initial_prev=initial_prev,
        include_type=include_type,
        little_mac=little_mac,
    )
    banner = c.connect()
    print(banner.decode("latin-1", "replace"), end="")
    if poolinfo:
        print(repr(c.frame(2)))
    if program is not None:
        payload = struct.pack(">H", len(program)) + program
        print(repr(c.frame(1, payload)))
    if quit_after:
        print(repr(c.frame(3)))


def parse_program(text):
    if text is None:
        return None
    return bytes.fromhex(text)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("host")
    ap.add_argument("port", type=int)
    ap.add_argument("--program-hex")
    ap.add_argument("--initial-prev", type=lambda x: int(x, 0), default=0)
    ap.add_argument("--include-type", action="store_true")
    ap.add_argument("--little-mac", action="store_true")
    ap.add_argument("--no-poolinfo", action="store_true")
    ap.add_argument("--no-quit", action="store_true")
    args = ap.parse_args()
    run(
        args.host,
        args.port,
        parse_program(args.program_hex),
        args.initial_prev,
        args.include_type,
        args.little_mac,
        not args.no_poolinfo,
        not args.no_quit,
    )


if __name__ == "__main__":
    main()
