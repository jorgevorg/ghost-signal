with open('/Users/jorgevorg/ghost-signal/src/App.jsx', 'r') as f:
    src = f.read()

# ── 1. Update mkEnemy to accept DB entry ────────────────────
OLD_MK = 'const mkEnemy=()=>({id:Date.now()+Math.random(),name:"",hp:10,hpMax:10,armor:0,shield:false,statuses:[]});'
NEW_MK = r"""const mkEnemy=(dbEntry)=>{
  if(!dbEntry)return {id:Date.now()+Math.random(),name:"",hp:10,hpMax:10,armor:0,baseArmor:0,vig:0,gra:0,min:0,tec:0,actions:1,actionsUsed:0,shield:false,statuses:[],difficulty:"easy",exp:1,isBoss:false,moves:[],faction:"",skill:""};
  const coop_hp=dbEntry.hp+5;
  const coop_act=dbEntry.isBoss?(dbEntry.actions+1):dbEntry.actions;
  return {id:Date.now()+Math.random(),name:dbEntry.name||"Enemy",hp:coop_hp,hpMax:coop_hp,armor:dbEntry.armor||0,baseArmor:dbEntry.armor||0,vig:dbEntry.vig||0,gra:dbEntry.gra||0,min:dbEntry.min||0,tec:dbEntry.tec||0,actions:coop_act,actionsUsed:0,shield:false,statuses:[],difficulty:dbEntry.difficulty||"easy",exp:dbEntry.exp||1,isBoss:dbEntry.isBoss||false,moves:dbEntry.moves||[],faction:dbEntry.faction||"",skill:dbEntry.skill||""};
};"""
if OLD_MK in src:
    src = src.replace(OLD_MK, NEW_MK, 1)
    print("✓ mkEnemy updated")
else:
    print("✗ mkEnemy MISSED")

# ── 2. Add search state inside CombatTracker ────────────────
OLD_STATES = '  const [rollWpnIdx,setRollWpnIdx]=React.useState(0);\n  React.useEffect'
NEW_STATES = '  const [rollWpnIdx,setRollWpnIdx]=React.useState(0);\n  const [enemySearch,setEnemySearch]=React.useState("");\n  const [showPicker,setShowPicker]=React.useState(false);\n  React.useEffect'
if OLD_STATES in src:
    src = src.replace(OLD_STATES, NEW_STATES, 1)
    print("✓ Search state added")
else:
    print("✗ Search state MISSED")

# ── 3. Replace the setup screen enemy section ───────────────
OLD_SETUP = '''      React.createElement("div",{style:{marginBottom:20}},
        React.createElement("div",{style:{fontFamily:MONO,fontSize:10,color:"#778",letterSpacing:2,marginBottom:10}},"ENEMIES"),
        enemies.map((e)=>React.createElement("div",{key:e.id,style:{display:"flex",gap:8,marginBottom:8,alignItems:"center"}},
          React.createElement("input",{placeholder:"Enemy name...",value:e.name,onChange:ev=>setEField(e.id,"name",ev.target.value),style:{flex:2,background:"transparent",border:"1px solid "+B1,borderRadius:3,color:"#ddd",fontFamily:MONO,fontSize:11,padding:"6px 8px",outline:"none"}}),
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:4,flex:1}},
            React.createElement("span",{style:{fontFamily:MONO,fontSize:10,color:"#778"}},"HP"),
            React.createElement("input",{type:"number",value:e.hpMax,min:1,onChange:ev=>{const v=parseInt(ev.target.value)||10;setEField(e.id,"hpMax",v);setEField(e.id,"hp",v);},style:{width:54,background:"transparent",border:"1px solid "+B1,borderRadius:3,color:"#ddd",fontFamily:MONO,fontSize:11,padding:"5px 6px",outline:"none",textAlign:"center"}})
          ),
          React.createElement("div",{style:{display:"flex",alignItems:"center",gap:4}},
            React.createElement("span",{style:{fontFamily:MONO,fontSize:10,color:"#778"}},"ARM"),
            React.createElement("input",{type:"number",value:e.armor,min:0,max:9,onChange:ev=>setEField(e.id,"armor",parseInt(ev.target.value)||0),style:{width:40,background:"transparent",border:"1px solid "+B1,borderRadius:3,color:"#ddd",fontFamily:MONO,fontSize:11,padding:"5px 6px",outline:"none",textAlign:"center"}})
          ),
          React.createElement("button",{onClick:()=>setEnemies(p=>p.filter(x=>x.id!==e.id)),style:Object.assign({},btnBase,{padding:"5px 8px",background:"transparent",borderColor:"#FF206066",color:"#FF206099",fontSize:12})},"X")
        )),
        React.createElement("button",{onClick:()=>setEnemies(p=>p.concat([mkEnemy()])),style:Object.assign({},btnBase,{background:"transparent",borderColor:B1,color:"#778",marginTop:4})},"+  ADD ENEMY")
      ),'''

NEW_SETUP = r"""      React.createElement("div",{style:{marginBottom:20}},
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}},
          React.createElement("span",{style:{fontFamily:MONO,fontSize:10,color:"#778",letterSpacing:2}},"ENEMIES"),
          React.createElement("button",{onClick:()=>setShowPicker(!showPicker),style:Object.assign({},btnBase,{padding:"4px 12px",background:showPicker?CC+"22":"transparent",borderColor:showPicker?CC:B1,color:showPicker?CC:"#778",fontSize:9})},showPicker?"CLOSE PICKER":"+ ADD FROM DATABASE")
        ),
        showPicker&&React.createElement("div",{style:{background:"#02040a",border:"1px solid "+CC+"44",borderRadius:4,padding:"10px",marginBottom:10}},
          React.createElement("input",{placeholder:"Search enemies...",value:enemySearch,onChange:e=>setEnemySearch(e.target.value),autoFocus:true,style:{width:"100%",background:"transparent",border:"1px solid "+B1,borderRadius:3,color:"#ddd",fontFamily:MONO,fontSize:11,padding:"6px 10px",outline:"none",boxSizing:"border-box",marginBottom:8}}),
          React.createElement("div",{style:{maxHeight:200,overflowY:"auto",display:"flex",flexDirection:"column",gap:3}},
            Object.entries(ENEMY_DB).filter(([k])=>!enemySearch||k.toLowerCase().includes(enemySearch.toLowerCase())).map(([k,e])=>{
              const fc=FACTION_COLORS[e.faction]||"#aaa";
              const dc=DIFFICULTY_C[e.difficulty]||"#aaa";
              return React.createElement("div",{key:k,onClick:()=>{setEnemies(p=>p.concat([Object.assign({},mkEnemy(e),{name:k})]));},style:{display:"flex",gap:8,alignItems:"center",padding:"5px 8px",cursor:"pointer",borderRadius:3,background:"#0a0a16",border:"1px solid #ffffff08"},
                onMouseEnter:e2=>{e2.currentTarget.style.background="#ffffff0d";},
                onMouseLeave:e2=>{e2.currentTarget.style.background="#0a0a16";}},
                React.createElement("span",{style:{fontFamily:MONO,fontSize:10,color:"#ddd",flex:1}},k),
                React.createElement("span",{style:{fontFamily:MONO,fontSize:8,color:fc,background:fc+"18",padding:"1px 5px",borderRadius:2}},e.faction.toUpperCase()),
                React.createElement("span",{style:{fontFamily:MONO,fontSize:8,color:dc,background:dc+"18",padding:"1px 5px",borderRadius:2}},e.difficulty),
                React.createElement("span",{style:{fontFamily:MONO,fontSize:8,color:"#778"}},"HP "+(e.hp+5)),
                e.isBoss&&React.createElement("span",{style:{color:"#FF2060",fontSize:10}},"👑")
              );
            })
          )
        ),
        enemies.length>0&&React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:5,marginBottom:8}},
          enemies.map((e)=>{
            const fc=FACTION_COLORS[e.faction]||"#445";
            const dc=DIFFICULTY_C[e.difficulty]||"#445";
            return React.createElement("div",{key:e.id,style:{display:"flex",gap:8,alignItems:"center",padding:"6px 10px",background:"#04060e",border:"1px solid "+(e.isBoss?"#FF206044":dc+"33"),borderRadius:4}},
              React.createElement("div",{style:{flex:1}},
                React.createElement("div",{style:{display:"flex",gap:6,alignItems:"center"}},
                  React.createElement("span",{style:{fontFamily:MONO,fontSize:10,color:e.isBoss?"#FF2060":"#ddd"}},(e.isBoss?"👑 ":"")+e.name),
                  e.faction&&React.createElement("span",{style:{fontFamily:MONO,fontSize:7,color:fc,background:fc+"18",padding:"1px 4px",borderRadius:2}},e.faction.toUpperCase()),
                  React.createElement("span",{style:{fontFamily:MONO,fontSize:7,color:"#445"}},"\u25b8 HP "+e.hpMax+" \u00b7 ARM "+e.armor)
                )
              ),
              React.createElement("button",{onClick:()=>setEnemies(p=>p.filter(x=>x.id!==e.id)),style:{background:"transparent",border:"none",color:"#FF206066",cursor:"pointer",fontFamily:MONO,fontSize:12,padding:"0 4px"}},"✕")
            );
          })
        ),
        enemies.length===0&&!showPicker&&React.createElement("div",{style:{fontFamily:MONO,fontSize:9,color:"#334",textAlign:"center",padding:"14px 0",letterSpacing:1}},"// NO ENEMIES — USE DATABASE PICKER ABOVE")
      ),"""

if OLD_SETUP in src:
    src = src.replace(OLD_SETUP, NEW_SETUP, 1)
    print("✓ Setup screen enemy picker replaced")
else:
    print("✗ Setup screen MISSED")

with open('/Users/jorgevorg/ghost-signal/src/App.jsx', 'w') as f:
    f.write(src)
print("Done. Lines:", src.count('\n'))
