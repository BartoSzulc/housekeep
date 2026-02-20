"""Generate HouseKeep app icons."""
from PIL import Image, ImageDraw
import os

ASSETS = os.path.join(os.path.dirname(__file__), '..', 'assets')

# Colors
BG_COLOR = (34, 139, 134)       # Teal #228B86
WHITE = (255, 255, 255)
CHECK_GREEN = (72, 199, 142)    # Bright green for checkmark


def draw_house(draw, cx, cy, size, color=WHITE, door_color=BG_COLOR):
    """Draw a house shape centered at (cx, cy)."""
    s = size
    # Roof (triangle)
    roof_top = (cx, cy - s * 0.42)
    roof_left = (cx - s * 0.45, cy - s * 0.02)
    roof_right = (cx + s * 0.45, cy - s * 0.02)
    draw.polygon([roof_top, roof_left, roof_right], fill=color)

    # Body (rectangle)
    body_left = cx - s * 0.34
    body_top = cy - s * 0.05
    body_right = cx + s * 0.34
    body_bottom = cy + s * 0.38
    draw.rectangle([body_left, body_top, body_right, body_bottom], fill=color)

    # Door (small rectangle)
    door_left = cx - s * 0.09
    door_top = cy + s * 0.15
    door_right = cx + s * 0.09
    door_bottom = cy + s * 0.38
    draw.rectangle([door_left, door_top, door_right, door_bottom], fill=door_color)


def draw_checkmark(draw, cx, cy, size, color=CHECK_GREEN, width=None):
    """Draw a checkmark centered at (cx, cy)."""
    w = width or max(int(size * 0.08), 3)
    p1 = (cx - size * 0.14, cy + size * 0.02)
    p2 = (cx - size * 0.02, cy + size * 0.13)
    p3 = (cx + size * 0.17, cy - size * 0.11)
    draw.line([p1, p2], fill=color, width=w, joint="curve")
    draw.line([p2, p3], fill=color, width=w, joint="curve")


def draw_rounded_rect(draw, bbox, radius, fill):
    """Draw a rounded rectangle."""
    x1, y1, x2, y2 = bbox
    draw.rectangle([x1 + radius, y1, x2 - radius, y2], fill=fill)
    draw.rectangle([x1, y1 + radius, x2, y2 - radius], fill=fill)
    draw.pieslice([x1, y1, x1 + 2*radius, y1 + 2*radius], 180, 270, fill=fill)
    draw.pieslice([x2 - 2*radius, y1, x2, y1 + 2*radius], 270, 360, fill=fill)
    draw.pieslice([x1, y2 - 2*radius, x1 + 2*radius, y2], 90, 180, fill=fill)
    draw.pieslice([x2 - 2*radius, y2 - 2*radius, x2, y2], 0, 90, fill=fill)


def generate_icon(size, filename):
    """Generate main app icon."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    radius = int(size * 0.18)
    draw_rounded_rect(draw, [0, 0, size - 1, size - 1], radius, BG_COLOR)

    padding = int(size * 0.18)
    icon_size = size - 2 * padding
    cx = size // 2
    cy = size // 2

    draw_house(draw, cx, cy, icon_size)
    draw_checkmark(draw, cx, cy - int(icon_size * 0.06), icon_size,
                   width=max(int(icon_size * 0.065), 3))

    img.save(os.path.join(ASSETS, filename), 'PNG')
    print(f"  {filename} ({size}x{size})")


def generate_favicon(size, filename):
    """Generate a small favicon."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    radius = int(size * 0.18)
    draw_rounded_rect(draw, [0, 0, size - 1, size - 1], radius, BG_COLOR)

    padding = int(size * 0.15)
    icon_size = size - 2 * padding
    cx = size // 2
    cy = size // 2

    draw_house(draw, cx, cy, icon_size)
    draw_checkmark(draw, cx, cy - int(icon_size * 0.06), icon_size,
                   width=max(int(icon_size * 0.09), 2))

    img.save(os.path.join(ASSETS, filename), 'PNG')
    print(f"  {filename} ({size}x{size})")


def generate_adaptive_icon(size, filename):
    """Generate Android adaptive icon (full bleed bg, centered foreground)."""
    img = Image.new('RGBA', (size, size), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Adaptive icon safe zone is inner 66%, so use more padding
    padding = int(size * 0.22)
    icon_size = size - 2 * padding
    cx = size // 2
    cy = size // 2

    draw_house(draw, cx, cy, icon_size)
    draw_checkmark(draw, cx, cy - int(icon_size * 0.06), icon_size,
                   width=max(int(icon_size * 0.065), 3))

    img.save(os.path.join(ASSETS, filename), 'PNG')
    print(f"  {filename} ({size}x{size})")


def generate_splash(size, filename):
    """Generate splash screen icon (teal house on transparent bg)."""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    icon_size = int(size * 0.45)
    cx = size // 2
    cy = size // 2

    draw_house(draw, cx, cy, icon_size, color=BG_COLOR, door_color=WHITE)
    draw_checkmark(draw, cx, cy - int(icon_size * 0.06), icon_size,
                   color=CHECK_GREEN, width=max(int(icon_size * 0.065), 3))

    img.save(os.path.join(ASSETS, filename), 'PNG')
    print(f"  {filename} ({size}x{size})")


if __name__ == '__main__':
    os.makedirs(ASSETS, exist_ok=True)
    print("Generating HouseKeep icons...")
    generate_favicon(48, 'favicon.png')
    generate_icon(1024, 'icon.png')
    generate_adaptive_icon(1024, 'adaptive-icon.png')
    generate_splash(1024, 'splash-icon.png')
    print("Done!")
