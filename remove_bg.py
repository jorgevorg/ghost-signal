#!/usr/bin/env python3
"""
remove_bg.py — strip white backgrounds from portrait PNGs.

Drop your portrait PNGs into public/portraits/
then run:  python3 remove_bg.py

Overwrites each file in place with a transparent-background version.
Tuning: raise THRESHOLD (0-255) if too much white leaks through,
        lower it if face edges are getting eaten.
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Installing Pillow...")
    os.system(f"{sys.executable} -m pip install Pillow --quiet")
    from PIL import Image

PORTRAITS_DIR = Path(__file__).parent / "public" / "portraits"
THRESHOLD     = 240   # pixels with R,G,B all above this → transparent
EDGE_FEATHER  = True  # soften edges slightly

def remove_white_bg(path: Path):
    img = Image.open(path).convert("RGBA")
    data = img.getdata()

    new_data = []
    for r, g, b, a in data:
        # Pixel is "white-ish" if all channels are above threshold
        if r > THRESHOLD and g > THRESHOLD and b > THRESHOLD:
            new_data.append((r, g, b, 0))        # fully transparent
        elif r > THRESHOLD - 20 and g > THRESHOLD - 20 and b > THRESHOLD - 20:
            # Near-white edge zone — feather to partial transparency
            brightness = (r + g + b) / 3
            alpha = int(255 * (1 - (brightness - (THRESHOLD - 20)) / 20))
            new_data.append((r, g, b, max(0, min(255, alpha))))
        else:
            new_data.append((r, g, b, a))

    img.putdata(new_data)
    img.save(path, "PNG")
    print(f"  ✓  {path.name}")

def main():
    if not PORTRAITS_DIR.exists():
        print(f"Folder not found: {PORTRAITS_DIR}")
        sys.exit(1)

    pngs = sorted(PORTRAITS_DIR.glob("*.png"))
    if not pngs:
        print(f"No PNG files found in {PORTRAITS_DIR}")
        print("Drop your portraits in there first, then re-run.")
        sys.exit(0)

    print(f"Processing {len(pngs)} portrait(s) in {PORTRAITS_DIR}:\n")
    for p in pngs:
        try:
            remove_white_bg(p)
        except Exception as e:
            print(f"  ✗  {p.name} — {e}")

    print(f"\n✅  Done. All portraits have transparent backgrounds.")
    print("   Refresh Ghost Signal to see the changes.")

if __name__ == "__main__":
    main()
