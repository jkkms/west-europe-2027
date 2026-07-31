#!/usr/bin/env python3
"""서유럽 2027 앱 아이콘 생성 — 외부 라이브러리 없이 PNG 직접 인코딩."""
import struct, zlib, sys, os

BG    = (0x1d, 0x4f, 0x68)
BACK  = (0x8f, 0xc3, 0xda)
FRONT = (0xee, 0xf1, 0xf4)
SUN   = (0xd9, 0x7a, 0x52)

SS = 3  # 슈퍼샘플링 배수


def tri(px, py, a, b, c):
    """점이 삼각형 안인지."""
    def s(p, q, r):
        return (p[0]-r[0])*(q[1]-r[1]) - (q[0]-r[0])*(p[1]-r[1])
    p = (px, py)
    d1, d2, d3 = s(p, a, b), s(p, b, c), s(p, c, a)
    neg = (d1 < 0) or (d2 < 0) or (d3 < 0)
    pos = (d1 > 0) or (d2 > 0) or (d3 > 0)
    return not (neg and pos)


def color_at(x, y):
    """단위 좌표(0~1)에서의 색. 마스커블 안전영역(0.12~0.88) 안에만 그린다."""
    # 해
    if (x - 0.71) ** 2 + (y - 0.27) ** 2 <= 0.086 ** 2:
        return SUN
    # 뒤쪽 능선
    if tri(x, y, (0.40, 0.225), (0.11, 0.775), (0.69, 0.775)):
        return BACK
    # 앞쪽 능선
    if tri(x, y, (0.665, 0.435), (0.44, 0.775), (0.89, 0.775)):
        return FRONT
    return BG


def render(size):
    rows = []
    for py in range(size):
        row = bytearray()
        for px in range(size):
            r = g = b = 0
            for sy in range(SS):
                for sx in range(SS):
                    u = (px + (sx + 0.5) / SS) / size
                    v = (py + (sy + 0.5) / SS) / size
                    c = color_at(u, v)
                    r += c[0]; g += c[1]; b += c[2]
            n = SS * SS
            row += bytes((r // n, g // n, b // n))
        rows.append(row)
    return rows


def png(path, size):
    raw = b''.join(b'\x00' + bytes(r) for r in render(size))

    def chunk(tag, data):
        c = tag + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

    out = b'\x89PNG\r\n\x1a\n'
    out += chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0))
    out += chunk(b'IDAT', zlib.compress(raw, 9))
    out += chunk(b'IEND', b'')
    with open(path, 'wb') as f:
        f.write(out)
    print(path, size, os.path.getsize(path), 'bytes')


if __name__ == '__main__':
    outdir = sys.argv[1]
    os.makedirs(outdir, exist_ok=True)
    for s in (192, 512):
        png(os.path.join(outdir, 'icon-%d.png' % s), s)
