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

W, H = 64, 64
pixels = [[[0, 0, 0, 0] for _ in range(W)] for _ in range(H)]

C_DARK = (15, 36, 48, 255)       # #0f2430
C_WHITE = (255, 255, 255, 255)   # #ffffff
C_ORANGE = (255, 91, 53, 255)    # #ff5b35
C_GREEN = (94, 214, 162, 255)    # #5ed6a2

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

def dist_seg(px, py, x1, y1, x2, y2):
    dx, dy = x2 - x1, y2 - y1
    l2 = dx*dx + dy*dy
    if l2 == 0:
        return math.hypot(px - x1, py - y1)
    t = max(0, min(1, ((px - x1)*dx + (py - y1)*dy) / l2))
    return math.hypot(px - (x1 + t*dx), py - (y1 + t*dy))

# 1. Background dark squircle
for y in range(H):
    for x in range(W):
        dx = max(0, abs(x - 31.5) - (31.5 - 16))
        dy = max(0, abs(y - 31.5) - (31.5 - 16))
        d = math.sqrt(dx*dx + dy*dy)
        if d <= 16:
            alpha = min(1.0, max(0.0, 16.5 - d))
            pixels[y][x] = [C_DARK[0], C_DARK[1], C_DARK[2], int(C_DARK[3] * alpha)]

# 2. Orange Route Slash: (16, 47) to (25, 17), thickness 5 (radius 2.5)
for y in range(H):
    for x in range(W):
        d = dist_seg(x, y, 16, 47, 25, 17)
        if d <= 2.5:
            alpha = min(1.0, max(0.0, 3.0 - d))
            pixels[y][x] = blend(pixels[y][x], [C_ORANGE[0], C_ORANGE[1], C_ORANGE[2], int(255 * alpha)])

# 3. White B Monogram:
# Backbone: x in 28..34, y in 17..49
# Top loop: outer arc r_out=7 centered at (36, 25.5), inner cutout r_in=3
# Bottom loop: outer arc r_out=8 centered at (36.5, 39.5), inner cutout r_in=3.5
for y in range(H):
    for x in range(W):
        is_b = False
        # Spine
        if 28 <= x <= 34 and 17 <= y <= 49:
            is_b = True
        # Top outer rect / arc
        if 34 < x <= 45 and 17 <= y <= 31:
            if x <= 38 or math.hypot(x - 38, y - 24) <= 7:
                is_b = True
        # Bottom outer rect / arc
        if 34 < x <= 47 and 31 < y <= 49:
            if x <= 39 or math.hypot(x - 39, y - 40) <= 8.5:
                is_b = True
        
        # Cutouts
        if 34 <= x <= 39 and 22 <= y <= 28.5:
            if x <= 36.5 or math.hypot(x - 36.5, y - 25.25) <= 3.25:
                is_b = False
        if 34 <= x <= 40 and 35 <= y <= 43.5:
            if x <= 37 or math.hypot(x - 37, y - 39.25) <= 4.25:
                is_b = False
        
        if is_b:
            pixels[y][x] = blend(pixels[y][x], [C_WHITE[0], C_WHITE[1], C_WHITE[2], 255])

# 4. Green Status Tick: (46.5, 19) -> (49, 22) -> (53, 16.5), thickness 2.5 (r=1.25)
for y in range(H):
    for x in range(W):
        d1 = dist_seg(x, y, 46.5, 19, 49, 22)
        d2 = dist_seg(x, y, 49, 22, 53, 16.5)
        d = min(d1, d2)
        if d <= 1.5:
            alpha = min(1.0, max(0.0, 2.0 - d))
            pixels[y][x] = blend(pixels[y][x], [C_GREEN[0], C_GREEN[1], C_GREEN[2], int(255 * alpha)])

png_data = make_png(W, H, pixels)
with open('favicon.png', 'wb') as f:
    f.write(png_data)

ico_data = make_ico(png_data, W, H)
with open('favicon.ico', 'wb') as f:
    f.write(ico_data)

print("Generated Concept 5 favicon.png and favicon.ico successfully!")
