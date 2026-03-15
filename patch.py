path = "/Users/jorgevorg/ghost-signal/src/App.jsx"

with open(path, "r") as f:
    code = f.read()

old1 = '@keyframes dangerPulse{0%,100%{box-shadow:0 0 8px #FF206066,0 0 16px #FF206022;opacity:1}50%{box-shadow:0 0 22px #FF2060cc,0 0 44px #FF206055;opacity:.85}}'
new1 = '@keyframes dangerPulse{0%,100%{box-shadow:inset 0 0 8px #FF206066,inset 0 0 16px #FF206022;opacity:1}50%{box-shadow:inset 0 0 22px #FF2060cc,inset 0 0 44px #FF206055;opacity:.85}}'

if old1 in code:
    code = code.replace(old1, new1, 1)
    print("PATCH applied: dangerPulse glow is now inset")
else:
    print("PATCH FAILED: string not found")

with open(path, "w") as f:
    f.write(code)
