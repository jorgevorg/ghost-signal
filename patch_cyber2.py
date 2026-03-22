with open('/Users/jorgevorg/ghost-signal/src/App.jsx', 'r') as f:
    src = f.read()
fixes = 0

# ══════════════════════════════════════════════════════════════
# 1. UNAUTHORIZED ACCESS header strip — add background + brighten border
# ══════════════════════════════════════════════════════════════
OLD_HDR = 'React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 14px",borderBottom:"1px solid "+CB_GREEN+"44",flexShrink:0}},'
NEW_HDR = 'React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 14px",background:"#031203",borderBottom:"1px solid "+CB_GREEN+"77",flexShrink:0}},'
if OLD_HDR in src:
    src = src.replace(OLD_HDR, NEW_HDR, 1); fixes+=1; print("✓ Terminal header strip brightened")
else:
    print("✗ Terminal header strip MISSED")

# ══════════════════════════════════════════════════════════════
# 2. GREEN STRUCTURAL LINES in CYBER — hacker status bar
# ══════════════════════════════════════════════════════════════

# Hacker status bar outer border: "33" → "88"
OLD_SB = 'background:hacker.color+"0d",border:"1px solid "+hacker.color+"33",borderRadius:2,padding:"7px 12px",marginBottom:10,transition:"background .3s,border-color .3s"'
NEW_SB = 'background:hacker.color+"14",border:"1px solid "+hacker.color+"99",borderRadius:2,padding:"7px 12px",marginBottom:10,transition:"background .3s,border-color .3s"'
if OLD_SB in src:
    src = src.replace(OLD_SB, NEW_SB, 1); fixes+=1; print("✓ Hacker status bar border brightened")
else:
    print("✗ Hacker status bar MISSED")

# Hacker vertical divider: "33" → "88"
OLD_DIV = 'width:1,height:16,background:hacker.color+"33",flexShrink:0'
NEW_DIV = 'width:1,height:16,background:hacker.color+"99",flexShrink:0'
if OLD_DIV in src:
    src = src.replace(OLD_DIV, NEW_DIV, 1); fixes+=1; print("✓ Hacker vertical divider brightened")
else:
    print("✗ Hacker vertical divider MISSED")

# EN/HP track background: "1a" → "33"
OLD_TRK = 'height:4,background:hacker.color+"1a",borderRadius:2,overflow:"hidden"'
NEW_TRK = 'height:4,background:hacker.color+"33",borderRadius:2,overflow:"hidden"'
if OLD_TRK in src:
    src = src.replace(OLD_TRK, NEW_TRK, 1); fixes+=1; print("✓ HP/EN track background brightened")
else:
    print("✗ HP/EN track MISSED")

# Inactive hacker button color: "88" → "cc"
OLD_HB = 'color:active?hd.color:hd.color+"88",fontFamily:ORB,fontSize:8,letterSpacing:2,padding:"3px 9px"'
NEW_HB = 'color:active?hd.color:hd.color+"cc",fontFamily:ORB,fontSize:8,letterSpacing:2,padding:"3px 9px"'
if OLD_HB in src:
    src = src.replace(OLD_HB, NEW_HB, 1); fixes+=1; print("✓ Inactive hacker button text brightened")
else:
    print("✗ Inactive hacker button MISSED")

# Stat label color: hacker.color+"99" → hacker.color+"cc"
OLD_STAT = 'fontFamily:MONO,fontSize:8,color:hacker.color+"99",marginBottom:3,letterSpacing:1'
NEW_STAT = 'fontFamily:MONO,fontSize:8,color:hacker.color+"cc",marginBottom:3,letterSpacing:1'
if OLD_STAT in src:
    src = src.replace(OLD_STAT, NEW_STAT, 1); fixes+=1; print("✓ Stat label color brightened")
else:
    print("✗ Stat label MISSED")

# ══════════════════════════════════════════════════════════════
# 3. SidePanelDual — fix positioning to always hug container edge
#    position:absolute → position:fixed with right: max(0px, calc((100vw - 1100px)/2))
#    alignItems:flex-start → stretch, remove height from label bar
# ══════════════════════════════════════════════════════════════

# Outer wrapper: flex-start → stretch, absolute → fixed, right:0 stays
OLD_WRAP = 'position:"absolute",right:0,top:"50%",transform:"translateY(-50%)",zIndex:20,display:"flex",alignItems:"flex-start",pointerEvents:"auto"'
NEW_WRAP = 'position:"fixed",right:"max(0px, calc((100vw - 1100px) / 2))",top:"50%",transform:"translateY(-50%)",zIndex:20,display:"flex",alignItems:"stretch",pointerEvents:"auto"'
if OLD_WRAP in src:
    src = src.replace(OLD_WRAP, NEW_WRAP, 1); fixes+=1; print("✓ SidePanelDual: fixed position + stretch alignment")
else:
    print("✗ SidePanelDual wrapper MISSED")

# Remove explicit height from label bar (let it stretch naturally)
OLD_LBL = 'display:"flex",alignItems:"center",justifyContent:"center",height:430,boxSizing:"border-box"'
NEW_LBL = 'display:"flex",alignItems:"center",justifyContent:"center"'
if OLD_LBL in src:
    src = src.replace(OLD_LBL, NEW_LBL, 1); fixes+=1; print("✓ Label bar: removed explicit height, will stretch")
else:
    print("✗ Label bar height MISSED")

with open('/Users/jorgevorg/ghost-signal/src/App.jsx', 'w') as f:
    f.write(src)

print(f"\nTotal: {fixes}/8")
