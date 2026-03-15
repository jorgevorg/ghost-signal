path = "/Users/jorgevorg/ghost-signal/src/App.jsx"

with open(path, "r") as f:
    code = f.read()

import re

# Find HexIcon createElement calls
matches = [(m.start(), m.group()) for m in re.finditer(r'createElement\(HexIcon', code)]
print(f"Found {len(matches)} HexIcon createElement calls\n")
for i, (idx, _) in enumerate(matches):
    start = max(0, idx - 60)
    end = min(len(code), idx + 200)
    print(f"--- [HexIcon {i+1}] at char {idx} ---")
    print(repr(code[start:end]))
    print()

# Also show the paste logic (where clipboard token gets applied to hexMap)
matches2 = [(m.start(), m.group()) for m in re.finditer(r'cb\.token', code)]
print(f"\nFound {len(matches2)} references to 'cb.token'\n")
for i, (idx2, _) in enumerate(matches2):
    start = max(0, idx2 - 60)
    end = min(len(code), idx2 + 200)
    print(f"--- [cb.token {i+1}] at char {idx2} ---")
    print(repr(code[start:end]))
    print()
