"""
Image optimization pipeline for MS Digital NET Plus website.
Converts source images to WebP at multiple sizes, generates favicons and OG image.
"""
from PIL import Image
import os
import struct
import zlib

SRC = r"c:\Users\Softzone\Desktop\MS_Digital_Plus\assets\Images"
OUT = SRC  # output alongside originals

def save_webp(img, path, quality=82):
    """Save image as WebP with specified quality."""
    img.save(path, 'WEBP', quality=quality, method=4)
    size_kb = os.path.getsize(path) / 1024
    print(f"  -> {os.path.basename(path)} ({img.width}x{img.height}, {size_kb:.1f} KB)")

def resize_and_save(src_path, base_name, sizes, quality=82):
    """Resize image to multiple widths and save as WebP."""
    img = Image.open(src_path)
    if img.mode == 'RGBA':
        pass  # keep alpha
    elif img.mode != 'RGB':
        img = img.convert('RGB')
    
    for w in sizes:
        if w >= img.width:
            # Don't upscale, just save at original size
            out_path = os.path.join(OUT, f"{base_name}-{w}w.webp")
            save_webp(img if img.mode == 'RGB' else img.convert('RGB'), out_path, quality)
        else:
            ratio = w / img.width
            h = int(img.height * ratio)
            resized = img.resize((w, h), Image.LANCZOS)
            out_path = os.path.join(OUT, f"{base_name}-{w}w.webp")
            if resized.mode == 'RGBA':
                save_webp(resized, out_path, quality)
            else:
                save_webp(resized.convert('RGB'), out_path, quality)

def create_ico(src_path, out_path, sizes=[16, 32, 48]):
    """Create a multi-size ICO file."""
    img = Image.open(src_path)
    icons = []
    for s in sizes:
        resized = img.resize((s, s), Image.LANCZOS)
        icons.append(resized)
    icons[0].save(out_path, format='ICO', sizes=[(s, s) for s in sizes])
    print(f"  -> {os.path.basename(out_path)} (sizes: {sizes})")

def create_png_icon(src_path, out_path, size):
    """Create a square PNG icon at specified size."""
    img = Image.open(src_path)
    resized = img.resize((size, size), Image.LANCZOS)
    resized.save(out_path, 'PNG', optimize=True)
    size_kb = os.path.getsize(out_path) / 1024
    print(f"  -> {os.path.basename(out_path)} ({size}x{size}, {size_kb:.1f} KB)")

def create_og_image(src_path, out_path):
    """Create 1200x630 Open Graph image with purple background and centered logo."""
    # Create purple gradient background
    bg = Image.new('RGB', (1200, 630), (59, 26, 122))  # Deep Purple
    
    # Create a simple gradient effect
    from PIL import ImageDraw
    draw = ImageDraw.Draw(bg)
    for y in range(630):
        r = int(59 + (109 - 59) * (y / 630))   # 59 -> 109
        g = int(26 + (40 - 26) * (y / 630))     # 26 -> 40
        b = int(122 + (214 - 122) * (y / 630))  # 122 -> 214
        draw.line([(0, y), (1200, y)], fill=(r, g, b))
    
    # Place logo centered
    logo = Image.open(src_path)
    logo_size = 300
    logo = logo.resize((logo_size, logo_size), Image.LANCZOS)
    
    # Center the logo
    x = (1200 - logo_size) // 2
    y = (630 - logo_size) // 2
    
    # Handle transparency
    if logo.mode == 'RGBA':
        bg.paste(logo, (x, y), logo)
    else:
        bg.paste(logo, (x, y))
    
    bg.save(out_path, 'PNG', optimize=True)
    size_kb = os.path.getsize(out_path) / 1024
    print(f"  -> {os.path.basename(out_path)} (1200x630, {size_kb:.1f} KB)")


print("=" * 50)
print("MS Digital NET Plus — Image Pipeline")
print("=" * 50)

# 1. Owner portrait (PNG, 1254x1254, 2MB)
print("\n[1/5] Owner portrait...")
resize_and_save(
    os.path.join(SRC, "owner-portrait.png"),
    "owner-portrait",
    [400, 600, 800],
    quality=80
)

# 2. Logo icon circle (JPEG, 1040x1040)
print("\n[2/5] Logo icon circle...")
resize_and_save(
    os.path.join(SRC, "logo-icon-circle.jpeg"),
    "logo-icon",
    [64, 128, 256],
    quality=85
)

# 3. Horizontal white logo (JPEG, 1600x568)
print("\n[3/5] Horizontal white logo...")
resize_and_save(
    os.path.join(SRC, "logo-horizontal-white.jpeg"),
    "logo-horizontal",
    [300, 600],
    quality=85
)

# 4. Favicons from logo-icon-circle
print("\n[4/5] Favicons...")
logo_src = os.path.join(SRC, "logo-icon-circle.jpeg")
create_ico(logo_src, os.path.join(OUT, "favicon.ico"))
create_png_icon(logo_src, os.path.join(OUT, "favicon-32x32.png"), 32)
create_png_icon(logo_src, os.path.join(OUT, "favicon-16x16.png"), 16)
create_png_icon(logo_src, os.path.join(OUT, "apple-touch-icon.png"), 180)

# 5. Open Graph image from app-icon
print("\n[5/5] Open Graph image...")
create_og_image(
    os.path.join(SRC, "app-icon.jpeg"),
    os.path.join(OUT, "og-image.png")
)

print("\n✅ All images processed successfully!")
print("\nFinal output files:")
for f in sorted(os.listdir(OUT)):
    if f.endswith(('.webp', '.ico', '.png')) and f != 'owner-portrait.png':
        size_kb = os.path.getsize(os.path.join(OUT, f)) / 1024
        print(f"  {f} ({size_kb:.1f} KB)")

