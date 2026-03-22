with open('/Users/jorgevorg/ghost-signal/src/App.jsx', 'r') as f:
    src = f.read()

# ══════════════════════════════════════════════════════════════
# 1. MOVE SidePanelDual inside the maxWidth:1100 container
#    It currently lives AFTER the container closes (child of outer div)
#    Need it as the last child of the inner container
# ══════════════════════════════════════════════════════════════

OLD_TAIL = '''    )
   ),
   !boot&&React.createElement(DiceRoller,{gameState:gs}),
   !boot&&React.createElement(SidePanelDual,{gs:gs,tab:tab,ctBrief:ctBrief,onCharChange:upC})
  );'''

NEW_TAIL = '''    ),
   !boot&&React.createElement(SidePanelDual,{gs:gs,tab:tab,ctBrief:ctBrief,onCharChange:upC})
   ),
   !boot&&React.createElement(DiceRoller,{gameState:gs})
  );'''

if OLD_TAIL in src:
    src = src.replace(OLD_TAIL, NEW_TAIL, 1)
    print("✓ SidePanelDual moved inside maxWidth:1100 container")
else:
    print("✗ Anchor move MISSED — dumping context")
    idx = src.find('!boot&&React.createElement(SidePanelDual')
    if idx > 0:
        print(repr(src[idx-200:idx+200]))

# ══════════════════════════════════════════════════════════════
# 2. FIXED PANEL HEIGHT — both panes same size, no resize on tab switch
#    Find the expanded panel div and add fixed height + flexDirection:column
#    Then ensure both pane contents have flex:1 overflowY:auto
# ══════════════════════════════════════════════════════════════

# Fix expanded panel wrapper: add height:430px, display:flex, flexDirection:column
OLD_PANEL_WRAP = 'open&&React.createElement("div",{style:{width:214,background:"#03070cfa",border:"1px solid "+panelAcc+"cc",borderLeft:"none",display:"flex",flexDirection:"column",boxShadow:"inset 0 0 50px "+panelAcc+"0d, -4px 0 20px "+panelAcc+"22",transition:"border-color .3s"}},'
NEW_PANEL_WRAP = 'open&&React.createElement("div",{style:{width:214,height:430,background:"#03070cfa",border:"1px solid "+panelAcc+"cc",borderLeft:"none",display:"flex",flexDirection:"column",boxShadow:"inset 0 0 50px "+panelAcc+"0d, -4px 0 20px "+panelAcc+"22",transition:"border-color .3s",overflow:"hidden"}},'

if OLD_PANEL_WRAP in src:
    src = src.replace(OLD_PANEL_WRAP, NEW_PANEL_WRAP, 1)
    print("✓ Panel fixed height 430px set")
else:
    print("✗ Panel height fix MISSED")

# Fix NETRUNNER pane: add flex:1 overflowY:auto
OLD_NET_PANE = '(activeTab==="netrunner"&&showNetrunner)&&React.createElement("div",{style:{padding:"10px 12px",flex:1,overflowY:"auto"}},'
NEW_NET_PANE = '(activeTab==="netrunner"&&showNetrunner)&&React.createElement("div",{style:{padding:"10px 12px",flex:1,overflowY:"auto",minHeight:0}},'

if OLD_NET_PANE in src:
    src = src.replace(OLD_NET_PANE, NEW_NET_PANE, 1)
    print("✓ Netrunner pane flex:1 confirmed")
else:
    print("✗ Netrunner pane MISSED — may already be set")

# Fix TACTICAL pane — same flex:1 treatment
OLD_TACT_PANE = '(activeTab==="tactical"||(activeTab==="netrunner"&&!showNetrunner)||(!showNetrunner))&&React.createElement("div",{style:{padding:"10px 12px",flex:1,overflowY:"auto"}},'
NEW_TACT_PANE = '(activeTab==="tactical"||(activeTab==="netrunner"&&!showNetrunner)||(!showNetrunner))&&React.createElement("div",{style:{padding:"10px 12px",flex:1,overflowY:"auto",minHeight:0}},'

if OLD_TACT_PANE in src:
    src = src.replace(OLD_TACT_PANE, NEW_TACT_PANE, 1)
    print("✓ Tactical pane flex:1 confirmed")
else:
    print("✗ Tactical pane MISSED — may already be set")

# Also fix the collapse bar — match height to panel so they don't resize
# The collapse bar should also be fixed height 430px
OLD_COLLAPSE = 'React.createElement("div",{onClick:()=>setOpen(!open),style:{writingMode:"vertical-rl",background:panelAcc+"22",border:"1px solid "+panelAcc+(combatActive?"cc":"88"),borderRight:open?"none":"1px solid "+panelAcc+(combatActive?"cc":"88"),color:panelAcc,fontFamily:ORB,fontSize:7,letterSpacing:3,padding:"14px 7px",cursor:"pointer",userSelect:"none",display:"flex",alignItems:"center",textShadow:"0 0 8px "+panelAcc+(combatActive?"cc":"88"),boxShadow:combatActive?"-2px 0 12px "+panelAcc+"44":"none",transition:"all .3s"}},labelTxt)'
NEW_COLLAPSE = 'React.createElement("div",{onClick:()=>setOpen(!open),style:{writingMode:"vertical-rl",background:panelAcc+"22",border:"1px solid "+panelAcc+(combatActive?"cc":"88"),borderRight:open?"none":"1px solid "+panelAcc+(combatActive?"cc":"88"),color:panelAcc,fontFamily:ORB,fontSize:7,letterSpacing:3,padding:"14px 7px",cursor:"pointer",userSelect:"none",display:"flex",alignItems:"center",justifyContent:"center",height:430,boxSizing:"border-box",textShadow:"0 0 8px "+panelAcc+(combatActive?"cc":"88"),boxShadow:combatActive?"-2px 0 12px "+panelAcc+"44":"none",transition:"all .3s"}},labelTxt)'

if OLD_COLLAPSE in src:
    src = src.replace(OLD_COLLAPSE, NEW_COLLAPSE, 1)
    print("✓ Collapse bar fixed height 430px")
else:
    print("✗ Collapse bar height fix MISSED")

with open('/Users/jorgevorg/ghost-signal/src/App.jsx', 'w') as f:
    f.write(src)

print("Done. Lines:", src.count('\n'))
