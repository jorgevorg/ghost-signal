path = "/Users/jorgevorg/ghost-signal/src/App.jsx"

with open(path, "r") as f:
    code = f.read()

# Show the full hex render block around isShip
idx = 101778
print("=== SVG RENDER BLOCK ===")
print(repr(code[idx:idx+800]))

# Show the form save (where form gets written to hexMap)
import re
matches = [(m.start(), m.group()) for m in re.finditer(r'form\.name', code)]
for i, (idx2, _) in enumerate(matches):
    start = max(0, idx2 - 40)
    end = min(len(code), idx2 + 400)
    print(f"\n=== FORM SAVE [{i+1}] at char {idx2} ===")
    print(repr(code[start:end]))

# Show the cut hex token deletion
matches2 = [(m.start(), m.group()) for m in re.finditer(r'delete h\.', code)]
for i, (idx3, _) in enumerate(matches2):
    start = max(0, idx3 - 60)
    end = min(len(code), idx3 + 100)
    print(f"\n=== DELETE H [{i+1}] ===")
    print(repr(code[start:end]))
