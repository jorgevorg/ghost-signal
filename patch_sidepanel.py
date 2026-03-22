with open('/Users/jorgevorg/ghost-signal/src/App.jsx', 'r') as f:
    src = f.read()

# ══════════════════════════════════════════════════════════════
# 1. REMOVE old CombatSidebar component definition
# ══════════════════════════════════════════════════════════════
import re

# Find and remove the CombatSidebar function block
start_marker = 'function CombatSidebar({'
end_marker = 'const STATUS_C_CT={'

idx_start = src.find(start_marker)
idx_end = src.find(end_marker)
if idx_start > 0 and idx_end > idx_start:
    src = src[:idx_start] + src[idx_end:]
    print("✓ Old CombatSidebar removed")
else:
    print("✗ CombatSidebar removal MISSED")

# ══════════════════════════════════════════════════════════════
# 2. INSERT new SidePanelDual before STATUS_C_CT
# ══════════════════════════════════════════════════════════════
DUAL_PANEL = r"""function SidePanelDual({gs,tab,ctBrief,onCharChange}){
  const [open,setOpen]=React.useState(true);
  const [activeTab,setActiveTab]=React.useState("netrunner");
  const [hackerSel,setHackerSel]=React.useState("vela");
  const showOn=["MAP","CYBER","COMMS"];
  if(!showOn.includes(tab))return null;

  const showNetrunner=tab==="CYBER";
  const combatActive=ctBrief&&ctBrief.active;
  const round=(ctBrief&&ctBrief.round)||1;
  const mode=(ctBrief&&ctBrief.mode)||"ground";
  const enemies=(ctBrief&&ctBrief.enemies)||[];
  const coleHP=ctBrief&&ctBrief.coleHP!=null?ctBrief.coleHP:gs.cole.hp;
  const velaHP=ctBrief&&ctBrief.velaHP!=null?ctBrief.velaHP:gs.vela.hp;
  const coleEN=ctBrief&&ctBrief.coleEN!=null?ctBrief.coleEN:gs.cole.en;
  const velaEN=ctBrief&&ctBrief.velaEN!=null?ctBrief.velaEN:gs.vela.en;

  const hackerData={
    vela:{name:(gs.vela&&gs.vela.name)||"VELA",en:gs.vela.en||0,enMax:gs.vela.enMax||20,hp:gs.vela.hp||0,hpMax:gs.vela.hpMax||20,color:CB_NODE,label:"VELA // NETRUNNER"},
    cole:{name:(gs.cole&&gs.cole.name)||"COLE",en:gs.cole.en||0,enMax:gs.cole.enMax||20,hp:gs.cole.hp||0,hpMax:gs.cole.hpMax||20,color:CB_ACC,label:"COLE // MUSCLE"}
  };
  const hacker=hackerData[hackerSel]||hackerData.vela;
  const charData=gs[hackerSel]||gs.vela;
  const adj=(key,d)=>{if(!onCharChange)return;const cur=charData[key]||0;const max=charData[key+"Max"]||20;onCharChange(hackerSel,key,Math.max(0,Math.min(max,cur+d)));};
  const memItems=(charData.memory||[]).filter(m=>m);
  const cyberItems=(charData.cybertech||[]).filter(c=>c);

  const CT_ACC="#FF6B35";
  const NET_ACC=hacker.color;
  const panelAcc=activeTab==="netrunner"?NET_ACC:CT_ACC;

  // Collapsed label bar
  const labelTxt = showNetrunner
    ? (open ? (activeTab==="netrunner"?hacker.label:"⚔ TACTICAL") + " ▸" : "⊕ ◂")
    : (open ? (combatActive ? ("⚔ R"+round) : "⚔ TACTICAL") + " ▸" : "⚔ ◂");

  return React.createElement("div",{style:{position:"absolute",right:0,top:"50%",transform:"translateY(-50%)",zIndex:20,display:"flex",alignItems:"stretch",pointerEvents:"auto"}},

    // ── collapse toggle bar ────────────────────────────────────
    React.createElement("div",{
      onClick:()=>setOpen(!open),
      style:{writingMode:"vertical-rl",background:panelAcc+"22",border:"1px solid "+panelAcc+(combatActive?"cc":"88"),borderRight:open?"none":"1px solid "+panelAcc+(combatActive?"cc":"88"),color:panelAcc,fontFamily:ORB,fontSize:7,letterSpacing:3,padding:"14px 7px",cursor:"pointer",userSelect:"none",display:"flex",alignItems:"center",textShadow:"0 0 8px "+panelAcc+(combatActive?"cc":"88"),boxShadow:combatActive?"-2px 0 12px "+panelAcc+"44":"none",transition:"all .3s"}
    },labelTxt),

    // ── expanded panel ────────────────────────────────────────
    open&&React.createElement("div",{style:{width:214,background:"#03070cfa",border:"1px solid "+panelAcc+"cc",borderLeft:"none",display:"flex",flexDirection:"column",boxShadow:"inset 0 0 50px "+panelAcc+"0d, -4px 0 20px "+panelAcc+"22",transition:"border-color .3s"}},

      // ── tab selector (CYBER only) ──────────────────────────
      showNetrunner&&React.createElement("div",{style:{display:"flex",borderBottom:"1px solid "+panelAcc+"44",flexShrink:0}},
        [["netrunner","NETRUNNER"],["tactical","TACTICAL"]].map(([id,label])=>{
          const a=activeTab===id;
          const acc=id==="netrunner"?NET_ACC:CT_ACC;
          return React.createElement("button",{key:id,onClick:()=>setActiveTab(id),style:{flex:1,padding:"6px 0",background:a?acc+"1a":"transparent",border:"none",borderBottom:a?"2px solid "+acc:"2px solid transparent",color:a?acc:"#445",fontFamily:MONO,fontSize:8,letterSpacing:2,cursor:"pointer",transition:"all .2s"}},label);
        })
      ),

      // ── NETRUNNER pane ────────────────────────────────────
      (activeTab==="netrunner"&&showNetrunner)&&React.createElement("div",{style:{padding:"10px 12px",flex:1,overflowY:"auto"}},
        // hacker selector
        React.createElement("div",{style:{display:"flex",gap:4,marginBottom:10}},
          ["vela","cole"].map(k=>{
            const hd=hackerData[k],a=hackerSel===k;
            return React.createElement("button",{key:k,onClick:()=>setHackerSel(k),style:{flex:1,padding:"3px 0",background:a?hd.color+"22":"transparent",border:"1px solid "+(a?hd.color:hd.color+"44"),color:a?hd.color:hd.color+"55",fontFamily:ORB,fontSize:7,letterSpacing:2,cursor:"pointer",textShadow:a?"0 0 6px "+hd.color+"88":"none",transition:"all .2s"}},hd.name);
          })
        ),
        // label
        React.createElement("div",{style:{fontFamily:MONO,fontSize:7,letterSpacing:2,color:NET_ACC,textShadow:"0 0 10px "+NET_ACC+",0 0 22px "+NET_ACC+"55",paddingBottom:8,marginBottom:8,borderBottom:"1px solid "+NET_ACC+"55"}},hacker.label),
        // HP / EN bars
        ["hp","en"].map(key=>{
          const label=key==="hp"?"HEALTH":"ENERGY";
          const val=charData[key]||0,max=charData[key+"Max"]||20;
          const pct=Math.min(100,Math.round(100*val/max));
          const c=key==="hp"?CB_NORM:CB_ACC;
          return React.createElement("div",{key:key,style:{marginBottom:9}},
            React.createElement("div",{style:{display:"flex",justifyContent:"space-between",fontFamily:MONO,fontSize:7,color:c,marginBottom:3,letterSpacing:2,textShadow:"0 0 6px "+c+"99"}},
              React.createElement("span",null,label),React.createElement("span",null,val+"/"+max)
            ),
            React.createElement("div",{style:{height:3,background:NET_ACC+"1a",borderRadius:2,overflow:"hidden",marginBottom:5}},
              React.createElement("div",{style:{height:"100%",width:pct+"%",background:c,boxShadow:"0 0 8px "+c+",0 0 18px "+c+"55",borderRadius:2,transition:"width .3s"}})
            ),
            React.createElement("div",{style:{display:"flex",gap:3}},
              [-5,-1,1,5].map(d=>React.createElement("button",{key:d,onClick:()=>adj(key,d),style:{flex:1,padding:"3px 0",background:"transparent",border:"1px solid "+NET_ACC+"66",color:NET_ACC,fontFamily:MONO,fontSize:9,cursor:"pointer",borderRadius:2,textShadow:"0 0 5px "+NET_ACC+"99",transition:"all .15s"}},d>0?"+"+d:d))
            )
          );
        }),
        // memory
        memItems.length>0&&React.createElement("div",{style:{borderTop:"1px solid "+CB_NORM+"44",paddingTop:8,marginTop:4}},
          React.createElement("div",{style:{fontFamily:MONO,fontSize:7,letterSpacing:2,color:NET_ACC,marginBottom:5}},"MEMORY"),
          React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:2}},memItems.map((m,i)=>{const s=m.indexOf(" — ")>-1?m.split(" — ")[0]:m;return React.createElement("div",{key:i,style:{fontFamily:MONO,fontSize:8,color:NET_ACC+"99",lineHeight:1.5}},s);}))
        ),
        // cybertech
        cyberItems.length>0&&React.createElement("div",{style:{borderTop:"1px solid "+CB_NORM+"44",paddingTop:8,marginTop:4}},
          React.createElement("div",{style:{fontFamily:MONO,fontSize:7,letterSpacing:2,color:"#cc88ff",marginBottom:5}},"CYBERTECH"),
          React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:2}},cyberItems.map((c,i)=>{const s=c.indexOf(" — ")>-1?c.split(" — ")[0]:c;return React.createElement("div",{key:i,style:{fontFamily:MONO,fontSize:8,color:"#cc88ff99",lineHeight:1.5}},s);}))
        )
      ),

      // ── TACTICAL pane ────────────────────────────────────
      (activeTab==="tactical"||(activeTab==="netrunner"&&!showNetrunner)||(!showNetrunner))&&React.createElement("div",{style:{padding:"10px 12px",flex:1,overflowY:"auto"}},
        // header
        React.createElement("div",{style:{fontFamily:MONO,fontSize:7,letterSpacing:2,color:CT_ACC,textShadow:combatActive?"0 0 10px "+CT_ACC+",0 0 22px "+CT_ACC+"55":"none",paddingBottom:8,marginBottom:8,borderBottom:"1px solid "+CT_ACC+"55",display:"flex",justifyContent:"space-between",alignItems:"center"}},
          React.createElement("span",null,combatActive?("⚔ ROUND "+round):"⚔ TACTICAL"),
          React.createElement("span",{style:{fontSize:9,color:combatActive?"#FF2060":"#334",animation:combatActive?"tactPulse 1.5s ease-in-out infinite":"none",letterSpacing:1}},combatActive?"LIVE":"IDLE")
        ),

        !combatActive&&React.createElement("div",{style:{fontFamily:MONO,fontSize:8,color:"#334",textAlign:"center",padding:"20px 0",letterSpacing:1,lineHeight:2.2}},"NO ACTIVE\nCOMBAT\n\nGO TO COMBAT\nTAB TO BEGIN"),

        combatActive&&React.createElement(React.Fragment,null,
          // mode badge
          React.createElement("div",{style:{fontFamily:MONO,fontSize:7,color:CT_ACC+"aa",marginBottom:8,letterSpacing:1}},mode==="ship"?"⟁ SHIP COMBAT":"⚔ GROUND COMBAT"),
          // player HP bars
          [["COLE",coleHP,gs.cole.hpMax||20,coleEN,gs.cole.enMax||20,"#FFD166"],
           ["VELA",velaHP,gs.vela.hpMax||20,velaEN,gs.vela.enMax||20,"#FF2060"]].map(([n,hp,hpMax,en,enMax,c])=>{
            const hpPct=Math.max(0,Math.min(100,(hp||0)/hpMax*100));
            const enPct=Math.max(0,Math.min(100,(en||0)/enMax*100));
            const crit=hpPct<=25;
            return React.createElement("div",{key:n,style:{marginBottom:10,padding:"7px 8px",background:c+"0a",border:"1px solid "+c+(crit?"88":"44"),borderRadius:3}},
              React.createElement("div",{style:{display:"flex",justifyContent:"space-between",fontFamily:MONO,fontSize:7,color:crit?"#FF2060":c,marginBottom:4,letterSpacing:1}},
                React.createElement("span",{style:{textShadow:"0 0 6px "+c+"88"}},n),
                React.createElement("span",null,(hp||0)+"/"+hpMax)
              ),
              React.createElement("div",{style:{height:3,background:"#1a1a2e",borderRadius:2,overflow:"hidden",marginBottom:3}},
                React.createElement("div",{style:{width:hpPct+"%",height:"100%",background:crit?"#FF2060":c,boxShadow:"0 0 6px "+(crit?"#FF2060":c),transition:"width .3s"}})
              ),
              React.createElement("div",{style:{height:2,background:"#1a1a2e",borderRadius:1,overflow:"hidden"}},
                React.createElement("div",{style:{width:enPct+"%",height:"100%",background:"#aaaaff55",transition:"width .3s"}})
              )
            );
          }),
          // enemies
          enemies.length>0&&React.createElement("div",{style:{borderTop:"1px solid "+CT_ACC+"33",paddingTop:8,marginTop:4}},
            React.createElement("div",{style:{fontFamily:MONO,fontSize:7,letterSpacing:2,color:"#FF6080",marginBottom:6}},
              "ENEMIES ["+enemies.filter(e=>e.hp>0).length+"/"+enemies.length+"]"
            ),
            enemies.slice(0,5).map((e,i)=>{
              const pct=Math.max(0,Math.min(100,(e.hp||0)/(e.hpMax||10)*100));
              const dead=(e.hp||0)<=0;
              return React.createElement("div",{key:i,style:{marginBottom:5,opacity:dead?0.35:1}},
                React.createElement("div",{style:{fontFamily:MONO,fontSize:7,color:dead?"#FF2060":"#FF8080",marginBottom:2,letterSpacing:1}},
                  (e.name||"ENEMY")+(dead?" ✕":"")
                ),
                !dead&&React.createElement("div",{style:{height:3,background:"#1a1a2e",borderRadius:2,overflow:"hidden",boxShadow:pct<=25?"0 0 4px #FF206044":"none"}},
                  React.createElement("div",{style:{width:pct+"%",height:"100%",background:pct<=25?"#FF2060":"#FF4060",transition:"width .3s"}})
                )
              );
            })
          )
        )
      )
    )
  );
}

"""

src = src.replace('const STATUS_C_CT={', DUAL_PANEL + 'const STATUS_C_CT={', 1)
print("✓ SidePanelDual inserted" if 'SidePanelDual' in src else "✗ SidePanelDual MISSED")

# ══════════════════════════════════════════════════════════════
# 3. REMOVE CyberRunnerPanel render from CybersphereTab
# ══════════════════════════════════════════════════════════════
OLD_RUNNER = 'React.createElement(CyberRunnerPanel,{hacker:hacker,charData:gs[hackerSel]||gs.vela,onChange:function(k,v){if(onCharChange)onCharChange(hackerSel,k,v);},accent:hacker.color}),'
if OLD_RUNNER in src:
    src = src.replace(OLD_RUNNER, '', 1)
    print("✓ CyberRunnerPanel render removed from CYBER tab")
else:
    print("✗ CyberRunnerPanel render removal MISSED")

# ══════════════════════════════════════════════════════════════
# 4. REMOVE old CombatSidebar global render from App
# ══════════════════════════════════════════════════════════════
OLD_CS_RENDER = '\n  !boot&&React.createElement(CombatSidebar,{gs:gs,ctBrief:ctBrief,tab:tab}),'
if OLD_CS_RENDER in src:
    src = src.replace(OLD_CS_RENDER, '', 1)
    print("✓ Old CombatSidebar global render removed")
else:
    print("✗ Old CombatSidebar render removal MISSED")

# ══════════════════════════════════════════════════════════════
# 5. ADD SidePanelDual INSIDE the main container div (position:absolute)
# Find the inner content div and append panel as sibling
# ══════════════════════════════════════════════════════════════
OLD_DICE = '   !boot&&React.createElement(DiceRoller,{gameState:gs})\n  );'
NEW_DICE = '   !boot&&React.createElement(DiceRoller,{gameState:gs}),\n   !boot&&React.createElement(SidePanelDual,{gs:gs,tab:tab,ctBrief:ctBrief,onCharChange:upC})\n  );'
if OLD_DICE in src:
    src = src.replace(OLD_DICE, NEW_DICE, 1)
    print("✓ SidePanelDual placed inside main container")
else:
    print("✗ SidePanelDual placement MISSED")

with open('/Users/jorgevorg/ghost-signal/src/App.jsx', 'w') as f:
    f.write(src)

print("Done. Lines:", src.count('\n'))
