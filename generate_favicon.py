import zlib
import struct
import math

def make_png(width, height, pixels):
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
    
    header = b'\x89PNG\r\n\x1a\n'
    ihdr = chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)
        for x in range(width):
            raw_data.extend(pixels[y][x])
    idat = chunk(b'IDAT', zlib.compress(bytes(raw_data), 9))
    iend = chunk(b'IEND', b'')
    return header + ihdr + idat + iend

def make_ico(png_data, width, height):
    ico_header = struct.pack('<HHH', 0, 1, 1)
    w = 0 if width >= 256 else width
    h = 0 if height >= 256 else height
    ico_dir = struct.pack('<BBBBHHII', w, h, 0, 0, 1, 32, len(png_data), 6 + 16)
    return ico_header + ico_dir + png_data

# Generate 64x64 icon
W, H = 64, 64
pixels = [[[0, 0, 0, 0] for _ in range(W)] for _ in range(H)]

# Chassis color & Stroke color
C_DARK = (15, 36, 48, 255)       # #0f2430
C_WHITE = (255, 255, 255, 255)   # #ffffff

def blend(c_bottom, c_top):
    a_top = c_top[3] / 255.0
    a_bot = c_bottom[3] / 255.0
    a_out = a_top + a_bot * (1 - a_top)
    if a_out <= 0:
        return [0, 0, 0, 0]
    r = int((c_top[0] * a_top + c_bottom[0] * a_bot * (1 - a_top)) / a_out)
    g = int((c_top[1] * a_top + c_bottom[1] * a_bot * (1 - a_top)) / a_out)
    b = int((c_top[2] * a_top + c_bottom[2] * a_bot * (1 - a_top)) / a_out)
    return [r, g, b, int(a_out * 255)]

# 1. Dark squircle (rx=16 on 64x64)
for y in range(H):
    for x in range(W):
        dx = max(0, abs(x - 31.5) - (31.5 - 16))
        dy = max(0, abs(y - 31.5) - (31.5 - 16))
        d = math.sqrt(dx*dx + dy*dy)
        if d <= 16:
            alpha = min(1.0, max(0.0, 16.5 - d))
            pixels[y][x] = [C_DARK[0], C_DARK[1], C_DARK[2], int(C_DARK[3] * alpha)]

# 2. Cubic bezier curves for Option 1:
# Path commands:
# Start: (18, 54)
# C 18 40, 24 35, 29 35
# C 33 35, 34 46, 36 50
# C 38 44, 40 32, 47 23
# C 57 14, 65 21, 61 33
# C 58 40, 48 44, 44 45
# C 53 47, 68 52, 68 63
# C 68 73, 53 78, 42 77
# C 32 76, 35 66, 45 62
# C 55 58, 66 62, 73 70

beziers = [
    ((18, 54), (18, 40), (24, 35), (29, 35)),
    ((29, 35), (33, 35), (34, 46), (36, 50)),
    ((36, 50), (38, 44), (40, 32), (47, 23)),
    ((47, 23), (57, 14), (65, 21), (61, 33)),
    ((61, 33), (58, 40), (48, 44), (44, 45)),
    ((44, 45), (53, 47), (68, 52), (68, 63)),
    ((68, 63), (68, 73), (53, 78), (42, 77)),
    ((42, 77), (32, 76), (35, 66), (45, 62)),
    ((45, 62), (55, 58), (66, 62), (73, 70))
]

def eval_cubic(p0, p1, p2, p3, t):
    it = 1 - t
    x = it**3 * p0[0] + 3 * it**2 * t * p1[0] + 3 * it * t**2 * p2[0] + t**3 * p3[0]
    y = it**3 * p0[1] + 3 * it**2 * t * p1[1] + 3 * it * t**2 * p2[1] + t**3 * p3[1]
    return x, y

# Sample points along the curves and map from 100x100 to 64x64
# Scale: map 10..90 in 100x100 to 6..58 in 64x64
points = []
for p0, p1, p2, p3 in beziers:
    steps = 80
    for s in range(steps + 1):
        t = s / float(steps)
        bx, by = eval_cubic(p0, p1, p2, p3, t)
        # Center and scale:
        sx = 32.0 + (bx - 45.5) * 0.76
        sy = 32.0 + (by - 46.5) * 0.76
        points.append((sx, sy))

# Distance to segments
def dist_seg(px, py, x1, y1, x2, y2):
    dx, dy = x2 - x1, y2 - y1
    l2 = dx*dx + dy*dy
    if l2 == 0:
        return math.hypot(px - x1, py - y1)
    t = max(0, min(1, ((px - x1)*dx + (py - y1)*dy) / l2))
    return math.hypot(px - (x1 + t*dx), py - (y1 + t*dy))

# Render stroke onto pixels (stroke width = 4.8 in 64x64 space, radius = 2.4)
RADIUS = 2.4
for y in range(H):
    for x in range(W):
        min_d = float('inf')
        for i in range(len(points) - 1):
            p_a = points[i]
            p_b = points[i+1]
            # Quick bounding box check
            if abs(x - p_a[0]) > 6 and abs(x - p_b[0]) > 6:
                continue
            if abs(y - p_a[1]) > 6 and abs(y - p_b[1]) > 6:
                continue
            d = dist_seg(x, y, p_a[0], p_a[1], p_b[0], p_b[1])
            if d < min_d:
                min_d = d
        if min_d <= RADIUS + 0.6:
            alpha = min(1.0, max(0.0, (RADIUS + 0.6) - min_d))
            pixels[y][x] = blend(pixels[y][x], [C_WHITE[0], C_WHITE[1], C_WHITE[2], int(255 * alpha)])

png_data = make_png(W, H, pixels)
with open('favicon.png', 'wb') as f:
    f.write(png_data)

ico_data = make_ico(png_data, W, H)
with open('favicon.ico', 'wb') as f:
    f.write(ico_data)

print("Generated Option 1 MB monogram favicon.png and favicon.ico successfully!")
