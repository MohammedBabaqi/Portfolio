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
        raw_data.append(0) # filter type 0 (None)
        for x in range(width):
            raw_data.extend(pixels[y][x])
    idat = chunk(b'IDAT', zlib.compress(bytes(raw_data), 9))
    iend = chunk(b'IEND', b'')
    return header + ihdr + idat + iend

def make_ico(png_data, width, height):
    # ICO header: reserved (2), type 1 (2), image count 1 (2)
    ico_header = struct.pack('<HHH', 0, 1, 1)
    # Directory entry: width, height, colors (0), reserved (0), planes (1), bpp (32), size (4), offset (4)
    w = 0 if width >= 256 else width
    h = 0 if height >= 256 else height
    ico_dir = struct.pack('<BBBBHHII', w, h, 0, 0, 1, 32, len(png_data), 6 + 16)
    return ico_header + ico_dir + png_data

# Create 64x64 image
W, H = 64, 64
pixels = [[[0, 0, 0, 0] for _ in range(W)] for _ in range(H)]

# Colors
C_DARK = (15, 36, 48, 255)       # #0f2430
C_BORDER = (255, 255, 255, 36)   # subtle border
C_WHITE = (255, 255, 255, 255)   # #ffffff
C_ORANGE = (255, 91, 53, 255)    # #ff5b35
C_GREEN = (94, 214, 162, 255)    # #5ed6a2

def blend(c_bottom, c_top):
    # c_top over c_bottom
    a_top = c_top[3] / 255.0
    a_bot = c_bottom[3] / 255.0
    a_out = a_top + a_bot * (1 - a_top)
    if a_out <= 0:
        return [0, 0, 0, 0]
    r = int((c_top[0] * a_top + c_bottom[0] * a_bot * (1 - a_top)) / a_out)
    g = int((c_top[1] * a_top + c_bottom[1] * a_bot * (1 - a_top)) / a_out)
    b = int((c_top[2] * a_top + c_bottom[2] * a_bot * (1 - a_top)) / a_out)
    return [r, g, b, int(a_out * 255)]

# 1. Dark Blue squircle (r=16)
for y in range(H):
    for x in range(W):
        # Distance to corner
        dx = max(0, abs(x - 31.5) - (31.5 - 16))
        dy = max(0, abs(y - 31.5) - (31.5 - 16))
        d = math.sqrt(dx*dx + dy*dy)
        if d <= 16:
            alpha = min(1.0, max(0.0, 16.5 - d))
            pixels[y][x] = [C_DARK[0], C_DARK[1], C_DARK[2], int(C_DARK[3] * alpha)]

# 2. White vertical backbone (x=16..23, y=14..50)
for y in range(H):
    for x in range(W):
        dx = max(0, abs(x - 19.5) - 0.5)
        dy = max(0, abs(y - 32) - 14.5)
        d = math.sqrt(dx*dx + dy*dy)
        if d <= 3.5:
            alpha = min(1.0, max(0.0, 4.0 - d))
            pixels[y][x] = blend(pixels[y][x], [C_WHITE[0], C_WHITE[1], C_WHITE[2], int(255 * alpha)])

# Distance from point to line segment
def dist_seg(px, py, x1, y1, x2, y2):
    dx, dy = x2 - x1, y2 - y1
    l2 = dx*dx + dy*dy
    if l2 == 0:
        return math.hypot(px - x1, py - y1)
    t = max(0, min(1, ((px - x1)*dx + (py - y1)*dy) / l2))
    return math.hypot(px - (x1 + t*dx), py - (y1 + t*dy))

# 3. Orange upper loop (M20 18 H32.5 C42.5 18..34 H20)
# Approximate with center arc and segments
for y in range(H):
    for x in range(W):
        # Top straight: (20, 18) to (32.5, 18)
        d1 = dist_seg(x, y, 20, 18, 32.5, 18)
        # Bottom straight: (32.5, 34) to (20, 34)
        d2 = dist_seg(x, y, 32.5, 34, 20, 34)
        # Right arc: center at (32.5, 26), radius 8, for x >= 32.5
        d_arc = float('inf')
        if x >= 32.0:
            d_to_center = math.hypot(x - 32.5, y - 26)
            d_arc = abs(d_to_center - 8.0)
        
        min_d = min(d1, d2, d_arc)
        if min_d <= 3.0:
            alpha = min(1.0, max(0.0, 3.5 - min_d))
            pixels[y][x] = blend(pixels[y][x], [C_ORANGE[0], C_ORANGE[1], C_ORANGE[2], int(255 * alpha)])

# 4. Green lower loop (M20 34 H34.5 C45 34..51 H20)
for y in range(H):
    for x in range(W):
        # Top straight: (20, 34) to (34.5, 34)
        d1 = dist_seg(x, y, 20, 34, 34.5, 34)
        # Bottom straight: (34.5, 50.5) to (20, 50.5)
        d2 = dist_seg(x, y, 34.5, 50.5, 20, 50.5)
        # Right arc: center at (34.5, 42.25), radius 8.25, for x >= 34.0
        d_arc = float('inf')
        if x >= 34.0:
            d_to_center = math.hypot(x - 34.5, y - 42.25)
            d_arc = abs(d_to_center - 8.25)
        
        min_d = min(d1, d2, d_arc)
        if min_d <= 3.0:
            alpha = min(1.0, max(0.0, 3.5 - min_d))
            pixels[y][x] = blend(pixels[y][x], [C_GREEN[0], C_GREEN[1], C_GREEN[2], int(255 * alpha)])

png_data = make_png(W, H, pixels)
with open('favicon.png', 'wb') as f:
    f.write(png_data)

ico_data = make_ico(png_data, W, H)
with open('favicon.ico', 'wb') as f:
    f.write(ico_data)

print("Generated favicon.png and favicon.ico successfully! PNG size:", len(png_data), "ICO size:", len(ico_data))
