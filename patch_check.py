path = "/Users/jorgevorg/ghost-signal/src/App.jsx"

with open(path, "r") as f:
    code = f.read()

probes = [
    'isShip=!!d.ship',
    'isShip',
    'd.ship',
    'form.ship',
    'ship:false',
    'ship:d.ship',
    'cb.token',
    'HexIcon',
    'dangerPulse',
]

print(f"File size: {len(code)} chars")
print(f"Newlines: {code.count(chr(10))}")
print()
for p in probes:
    print(f"  '{p}': {code.count(p)} occurrences")

# Show raw chars around 'ship' in hex context
idx = code.find('isShip')
if idx != -1:
    print(f"\nRaw chars around first 'isShip' (idx {idx}):")
    print(repr(code[idx-10:idx+40]))
else:
    print("\n'isShip' not found at all!")
