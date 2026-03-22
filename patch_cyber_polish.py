with open('/Users/jorgevorg/ghost-signal/src/App.jsx', 'r') as f:
    src = f.read()

fixes = 0

# ══════════════════════════════════════════════════════════════
# 1. UNAUTHORIZED ACCESS — from #FF206055 to full bright red
# ══════════════════════════════════════════════════════════════
old = '"UNAUTHORIZED ACCESS"}},"UNAUTHORIZED ACCESS"'
# Find exact context
idx = src.find('"UNAUTHORIZED ACCESS"')
print("UNAUTH at line approx:", src[:idx].count('\n')+1)
print("Context:", repr(src[idx-80:idx+40]))

OLD1 = 'color:"#FF206055"}},"UNAUTHORIZED ACCESS"'
NEW1 = 'color:"#FF2060cc",textShadow:"0 0 6px #FF206088",letterSpacing:2}},"UNAUTHORIZED ACCESS"'
if OLD1 in src:
    src = src.replace(OLD1, NEW1, 1); fixes+=1; print("✓ UNAUTHORIZED ACCESS brightened")
else:
    print("✗ UNAUTHORIZED ACCESS — dumping context:")
    idx2 = src.find('UNAUTHORIZED ACCESS')
    print(repr(src[idx2-120:idx2+60]))

# ══════════════════════════════════════════════════════════════
# 2. CYBER TAB FRAME BRIGHTNESS
# ══════════════════════════════════════════════════════════════

# Main outer frame border — "33" → "99" (not danger/warn, which are already bright)
OLD2 = 'border:"1px solid "+frameColor+(danger?"99":"33")'
NEW2 = 'border:"1px solid "+frameColor+(danger?"ff":warn?"dd":"99")'
if OLD2 in src:
    src = src.replace(OLD2, NEW2, 1); fixes+=1; print("✓ Outer frame border brightened")
else:
    print("✗ Outer frame border MISSED")

# Header divider borderBottom CB_NORM+"33" → "66"
OLD3 = 'borderBottom:"1px solid "+CB_NORM+"33",paddingBottom:10,marginBottom:10'
NEW3 = 'borderBottom:"1px solid "+CB_NORM+"66",paddingBottom:10,marginBottom:10'
if OLD3 in src:
    src = src.replace(OLD3, NEW3, 1); fixes+=1; print("✓ Header divider brightened")
else:
    print("✗ Header divider MISSED")

# Map selector button inactive border CB_NORM+"55" → "88"
OLD4 = 'border:"1px solid "+(active?CB_NORM:CB_NORM+"55")'
NEW4 = 'border:"1px solid "+(active?CB_NORM:CB_NORM+"88")'
if OLD4 in src:
    src = src.replace(OLD4, NEW4, 1); fixes+=1; print("✓ Map selector button border brightened")
else:
    print("✗ Map selector button MISSED")

# Network rules panel border CB_NORM+"22" → "55"
OLD5 = 'border:"1px solid "+CB_NORM+"22",background:CB_NORM+"04"'
NEW5 = 'border:"1px solid "+CB_NORM+"55",background:CB_NORM+"08"'
if OLD5 in src:
    src = src.replace(OLD5, NEW5, 1); fixes+=1; print("✓ Network rules panel border brightened")
else:
    print("✗ Network rules panel MISSED")

# Network rules inner divider borderBottom CB_NORM+"22" → "44"
OLD6 = 'borderBottom:"1px solid "+CB_NORM+"22"}},"NETWORK RULES"'
NEW6 = 'borderBottom:"1px solid "+CB_NORM+"55"}},"NETWORK RULES"'
if OLD6 in src:
    src = src.replace(OLD6, NEW6, 1); fixes+=1; print("✓ NETWORK RULES divider brightened")
else:
    print("✗ NETWORK RULES divider MISSED")

# Terminal panel top border CB_GREEN+"2a" → "55"
OLD7 = 'borderTop:"1px solid "+CB_GREEN+"2a"'
NEW7 = 'borderTop:"1px solid "+CB_GREEN+"55"'
if OLD7 in src:
    src = src.replace(OLD7, NEW7, 1); fixes+=1; print("✓ Terminal top border brightened")
else:
    print("✗ Terminal top border MISSED")

# Terminal header bottom border CB_GREEN+"1a" → "44"
OLD8 = 'borderBottom:"1px solid "+CB_GREEN+"1a",flexShrink:0'
NEW8 = 'borderBottom:"1px solid "+CB_GREEN+"44",flexShrink:0'
if OLD8 in src:
    src = src.replace(OLD8, NEW8, 1); fixes+=1; print("✓ Terminal header bottom border brightened")
else:
    print("✗ Terminal header bottom border MISSED")

# Terminal input border CB_GREEN+"22" → "44"
OLD9 = 'borderTop:"1px solid "+CB_GREEN+"22",padding:"6px 12px",flexShrink:0'
NEW9 = 'borderTop:"1px solid "+CB_GREEN+"44",padding:"6px 12px",flexShrink:0'
if OLD9 in src:
    src = src.replace(OLD9, NEW9, 1); fixes+=1; print("✓ Terminal input border brightened")
else:
    print("✗ Terminal input border MISSED")

# ══════════════════════════════════════════════════════════════
# 3. COPY ICONS — only on mabel + user lines, not sys/breach/boot
# ══════════════════════════════════════════════════════════════
# Current: shows on any line where l.s.length > 10
# Fix: add type check — only show for t==="mabel" || t==="user" || t==="oracle"
OLD_COPY = 'typeof l.s==="string"&&l.s.length>10?React.createElement("span",{onClick:function(e){e.stopPropagation();try{navigator.clipboard.writeText(l.s);}catch(err){}}'
NEW_COPY = '(typeof l.s==="string"&&l.s.length>10&&(l.t==="mabel"||l.t==="user"||l.t==="oracle"))?React.createElement("span",{onClick:function(e){e.stopPropagation();try{navigator.clipboard.writeText(l.s);}catch(err){}}'

if OLD_COPY in src:
    src = src.replace(OLD_COPY, NEW_COPY, 1); fixes+=1; print("✓ Copy icons restricted to mabel/user/oracle only")
else:
    print("✗ Copy icon condition MISSED")

with open('/Users/jorgevorg/ghost-signal/src/App.jsx', 'w') as f:
    f.write(src)

print(f"\nTotal fixes applied: {fixes}/10")
