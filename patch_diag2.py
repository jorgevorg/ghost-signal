path = "/Users/jorgevorg/ghost-signal/src/App.jsx"

with open(path, "r") as f:
    code = f.read()

import re

# Find d.ship references (missed by first diag)
matches = [(m.start(), m.group()) for m in re.finditer(r'd\.ship', code)]
print(f"Found {len(matches)} references to 'd.ship'\n")
for i, (idx, match) in enumerate(matches):
    start = max(0, idx - 80)
    end = min(len(code), idx + 160)
    print(f"--- [d.ship {i+1}] at char {idx} ---")
    print(repr(code[start:end]))
    print()

# Find where form is saved to hexMap (form.ship)
matches2 = [(m.start(), m.group()) for m in re.finditer(r'form\.ship', code)]
print(f"\nFound {len(matches2)} references to 'form.ship'\n")
for i, (idx, match) in enumerate(matches2):
    start = max(0, idx - 80)
    end = min(len(code), idx + 200)
    print(f"--- [form.ship {i+1}] at char {idx} ---")
    print(repr(code[start:end]))
    print()
