with open('/Users/jorgevorg/ghost-signal/src/App.jsx', 'r') as f:
    src = f.read()

# ══════════════════════════════════════════════════════════════
# 1. TAB BAR BORDER — brighter
# ══════════════════════════════════════════════════════════════
src = src.replace(
    'borderBottom:"1px solid #222230",marginBottom:0,position:"sticky"',
    'borderBottom:"1px solid #44445a",marginBottom:0,position:"sticky"',
    1
)
print("✓ Tab bar border brightened" if 'borderBottom:"1px solid #44445a"' in src else "✗ Tab bar border MISSED")

# ══════════════════════════════════════════════════════════════
# 2. COMBAT TAB STYLING — add CSS animations
# ══════════════════════════════════════════════════════════════
COMBAT_CSS = '''@keyframes tactScan{0%{background-position:0 0}100%{background-position:0 4px}}
@keyframes tactPulse{0%,100%{opacity:.7}50%{opacity:1}}
@keyframes ctIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes ctFlash{0%{border-color:#FF6B35cc;box-shadow:inset 0 0 16px #FF6B3566}50%{border-color:#FF2060cc;box-shadow:inset 0 0 30px #FF206066}100%{border-color:#FF6B35cc;box-shadow:inset 0 0 16px #FF6B3566}}
'''
src = src.replace(
    '@keyframes mabelTalk{',
    COMBAT_CSS + '@keyframes mabelTalk{',
    1
)
print("✓ Combat CSS added")

# ══════════════════════════════════════════════════════════════
# 3. ADD ctBrief STATE to App
# ══════════════════════════════════════════════════════════════
src = src.replace(
    'var cyberSessS=useState(null),setCyberSess=cyberSessS[1];var cyberSess=cyberSessS[0];',
    'var cyberSessS=useState(null),setCyberSess=cyberSessS[1];var cyberSess=cyberSessS[0];\nvar ctBriefS=useState({active:false,round:1,mode:"ground",enemies:[],coleHP:null,velaHP:null,coleEN:null,velaEN:null}),setCtBrief=ctBriefS[1];var ctBrief=ctBriefS[0];',
    1
)
print("✓ ctBrief state added" if 'setCtBrief' in src else "✗ ctBrief state MISSED")

# ══════════════════════════════════════════════════════════════
# 4. ADD CombatSidebar COMPONENT before STATUS_C_CT
# ══════════════════════════════════════════════════════════════
SIDEBAR = r"""function CombatSidebar({gs,ctBrief,tab}){
  const [open,setOpen]=React.useState(true);
  if(!["MAP","CYBER","COMMS"].includes(tab))return null;
  const CT_ACC="#FF6B35";
  const active=ctBrief&&ctBrief.active;
  const enemies=(ctBrief&&ctBrief.enemies)||[];
  const round=(ctBrief&&ctBrief.round)||1;
  const coleHP=ctBrief&&ctBrief.coleHP!=null?ctBrief.coleHP:gs.cole.hp;
  const velaHP=ctBrief&&ctBrief.velaHP!=null?ctBrief.velaHP:gs.vela.hp;
  const coleMax=gs.cole.hpMax||20;const velaMax=gs.vela.hpMax||20;
  const mode=(ctBrief&&ctBrief.mode)||"ground";
  return React.createElement("div",{style:{position:"fixed",right:0,top:"50%",transform:"translateY(-50%)",zIndex:20,display:"flex",alignItems:"stretch",pointerEvents:"auto"}},
    React.createElement("div",{onClick:()=>setOpen(!open),style:{writingMode:"vertical-rl",background:CT_ACC+(active?"22":"0d"),border:"1px solid "+CT_ACC+(active?"88":"33"),borderRight:open?"none":"1px solid "+CT_ACC+(active?"88":"33"),color:CT_ACC+(active?"ff":"66"),fontFamily:ORB,fontSize:7,letterSpacing:3,padding:"12px 6px",cursor:"pointer",userSelect:"none",display:"flex",alignItems:"center",textShadow:active?"0 0 6px "+CT_ACC+"88":"none",transition:"all .3s"}},
      active?("\u2694 COMBAT R"+round):"\u2694 STANDBY",
      React.createElement("span",{style:{fontSize:9,marginTop:6}},open?" \u25b8":" \u25c2")
    ),
    open&&React.createElement("div",{style:{width:178,background:"#04080cf8",border:"1px solid "+CT_ACC+(active?"99":"33"),padding:"12px 10px",display:"flex",flexDirection:"column",gap:0,boxShadow:"inset 0 0 40px "+CT_ACC+"09,-6px 0 24px "+CT_ACC+"11",transition:"border-color .3s"}},
      React.createElement("div",{style:{fontFamily:MONO,fontSize:6.5,letterSpacing:2,color:CT_ACC,textShadow:active?"0 0 10px "+CT_ACC+",0 0 22px "+CT_ACC+"55":"none",paddingBottom:6,marginBottom:6,borderBottom:"1px solid "+CT_ACC+"44",display:"flex",justifyContent:"space-between",alignItems:"center"}},
        React.createElement("span",null,active?("\u2694 ROUND "+round):"\u2694 TACTICAL"),
        React.createElement("span",{style:{fontSize:9,color:active?"#FF2060":"#334",animation:active?"tactPulse 1.5s ease-in-out infinite":"none"}},active?"LIVE":"IDLE")
      ),
      !active&&React.createElement("div",{style:{fontFamily:MONO,fontSize:8,color:"#334",textAlign:"center",padding:"18px 0",letterSpacing:1,lineHeight:1.8}},"NO ACTIVE\nCOMBAT"),
      active&&React.createElement(React.Fragment,null,
        React.createElement("div",{style:{fontFamily:MONO,fontSize:6,letterSpacing:2,color:CT_ACC+"88",marginBottom:6}},mode==="ship"?"\u2381 SHIP COMBAT":"\u2694 GROUND COMBAT"),
        [["COLE",coleHP,coleMax,"#FFD166"],["VELA",velaHP,velaMax,"#FF2060"]].map(([n,hp,mx,c])=>{
          const pct=Math.max(0,Math.min(100,(hp||0)/mx*100));
          const crit=pct<=25;
          return React.createElement("div",{key:n,style:{marginBottom:7}},
            React.createElement("div",{style:{display:"flex",justifyContent:"space-between",fontFamily:MONO,fontSize:6.5,color:crit?"#FF2060":c,marginBottom:2}},
              React.createElement("span",null,n),React.createElement("span",null,(hp||0)+"/"+mx)
            ),
            React.createElement("div",{style:{height:3,background:"#1a1a2e",borderRadius:2,overflow:"hidden"}},
              React.createElement("div",{style:{width:pct+"%",height:"100%",background:crit?"#FF2060":c,boxShadow:crit?"0 0 6px #FF2060":"none",transition:"width .3s"}})
            )
          );
        }),
        enemies.length>0&&React.createElement("div",{style:{borderTop:"1px solid "+CT_ACC+"33",paddingTop:6,marginTop:4}},
          React.createElement("div",{style:{fontFamily:MONO,fontSize:6,letterSpacing:2,color:"#FF6080",marginBottom:4}},"ENEMIES ["+enemies.length+"]"),
          enemies.slice(0,4).map((e,i)=>{
            const pct=Math.max(0,Math.min(100,(e.hp||0)/(e.hpMax||10)*100));
            const dead=(e.hp||0)<=0;
            return React.createElement("div",{key:i,style:{marginBottom:4,opacity:dead?0.4:1}},
              React.createElement("div",{style:{fontFamily:MONO,fontSize:7,color:dead?"#FF2060":"#FF8080",marginBottom:2}},(e.name||"ENEMY")+(dead?" \u2715":"")),
              !dead&&React.createElement("div",{style:{height:2,background:"#1a1a2e",borderRadius:1,overflow:"hidden"}},
                React.createElement("div",{style:{width:pct+"%",height:"100%",background:pct<=25?"#FF2060":"#FF4060"}})
              )
            );
          })
        )
      )
    )
  );
}
"""
src = src.replace(
    'const STATUS_C_CT={',
    SIDEBAR + 'const STATUS_C_CT={',
    1
)
print("✓ CombatSidebar inserted" if 'CombatSidebar' in src else "✗ CombatSidebar MISSED")

# ══════════════════════════════════════════════════════════════
# 5. ADD onCtUpdate PROP HANDLING + useEffect in CombatTracker
# ══════════════════════════════════════════════════════════════
OLD_CT_SIG = 'function CombatTracker({gs,onCharChange,onShipChange}){'
NEW_CT_SIG = 'function CombatTracker({gs,onCharChange,onShipChange,onCtUpdate}){'
src = src.replace(OLD_CT_SIG, NEW_CT_SIG, 1)

# Add useEffect after rollWpnIdx state
OLD_ROLL_STATE = '  const [rollWpnIdx,setRollWpnIdx]=React.useState(0);\n\n  const addLog='
NEW_ROLL_STATE = '  const [rollWpnIdx,setRollWpnIdx]=React.useState(0);\n  React.useEffect(()=>{if(onCtUpdate)onCtUpdate({active,round,mode,enemies,coleHP,velaHP,coleEN,velaEN});},[active,round,mode,enemies,coleHP,velaHP,coleEN,velaEN]);\n\n  const addLog='
src = src.replace(OLD_ROLL_STATE, NEW_ROLL_STATE, 1)
print("✓ onCtUpdate hooked" if 'onCtUpdate' in src else "✗ onCtUpdate MISSED")

# ══════════════════════════════════════════════════════════════
# 6. PASS ctBrief/setCtBrief to CombatTracker in render
# ══════════════════════════════════════════════════════════════
OLD_CT_RENDER = 'tab==="COMBAT"&&React.createElement(CombatTracker,{gs:gs,onCharChange:upC,onShipChange:upS})'
NEW_CT_RENDER = 'tab==="COMBAT"&&React.createElement("div",{style:{position:"relative",background:"#06080e",border:"1px solid #FF6B3555",minHeight:"calc(100vh / 1.15 - 120px)",overflow:"hidden",boxSizing:"border-box"}},React.createElement("div",{style:{pointerEvents:"none",position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(0deg,transparent 0,transparent 39px,#FF6B3508 39px,#FF6B3508 40px),repeating-linear-gradient(90deg,transparent 0,transparent 39px,#FF6B3508 39px,#FF6B3508 40px)",zIndex:0}}),React.createElement("div",{style:{pointerEvents:"none",position:"absolute",inset:0,background:"repeating-linear-gradient(0deg,transparent 0,transparent 3px,rgba(255,107,53,.012) 3px,rgba(255,107,53,.012) 4px)",animation:"tactScan .18s linear infinite",zIndex:1}}),React.createElement("div",{style:{pointerEvents:"none",position:"absolute",inset:0,background:"radial-gradient(ellipse at center,transparent 50%,#000 100%)",zIndex:2}}),React.createElement(CornerBracket,{pos:"tl",color:"#FF6B35"}),React.createElement(CornerBracket,{pos:"tr",color:"#FF6B35"}),React.createElement(CornerBracket,{pos:"bl",color:"#FF6B35"}),React.createElement(CornerBracket,{pos:"br",color:"#FF6B35"}),React.createElement("div",{style:{position:"relative",zIndex:3,padding:"16px 18px",overflowY:"auto",maxHeight:"calc(100vh / 1.15 - 120px)"}},React.createElement(CombatTracker,{gs:gs,onCharChange:upC,onShipChange:upS,onCtUpdate:setCtBrief})))'
src = src.replace(OLD_CT_RENDER, NEW_CT_RENDER, 1)
print("✓ COMBAT tab wrapped" if 'tactScan' in src else "✗ COMBAT tab wrap MISSED")

# ══════════════════════════════════════════════════════════════
# 7. RENDER CombatSidebar globally (after MabelMini)
# ══════════════════════════════════════════════════════════════
OLD_MABEL = '  // MABEL Mini — globally visible on all tabs\n  !boot&&tab!=="COMMS"&&React.createElement(MabelMini,{msgs:comms,onSend:sendToMabel,loading:commsLoading}),'
NEW_MABEL = '  // MABEL Mini — globally visible on all tabs\n  !boot&&tab!=="COMMS"&&React.createElement(MabelMini,{msgs:comms,onSend:sendToMabel,loading:commsLoading}),\n  !boot&&React.createElement(CombatSidebar,{gs:gs,ctBrief:ctBrief,tab:tab}),'
src = src.replace(OLD_MABEL, NEW_MABEL, 1)
print("✓ CombatSidebar rendered globally" if '!boot&&React.createElement(CombatSidebar' in src else "✗ CombatSidebar global render MISSED")

with open('/Users/jorgevorg/ghost-signal/src/App.jsx', 'w') as f:
    f.write(src)

print("Done. Lines:", src.count('\n'))
