path = "/Users/jorgevorg/ghost-signal/src/App.jsx"

with open(path, "r") as f:
    code = f.read()

# Find every occurrence of .ship and ship: in the file with context
import re
matches = [(m.start(), m.group()) for m in re.finditer(r'["\s\{,\(]ship[\s"\:\.\[]', code)]

print(f"Found {len(matches)} references to 'ship'\n")
for i, (idx, match) in enumerate(matches):
    start = max(0, idx - 60)
    end = min(len(code), idx + 120)
    print(f"--- [{i+1}] at char {idx} ---")
    print(repr(code[start:end]))
    print()
