import re

with open('/Users/jorgevorg/ghost-signal/src/App.jsx', 'r') as f:
    src = f.read()

# ── 1. Insert component before "function App(){" ──────────────────────────

COMPONENT = r"""
const STATUS_C_CT={BREACHED:"#00FFD0",SHOCKED:"#FFD166",STUNNED:"#cc88ff",OVERHEAT:"#FF6B35",BLINDED:"#aaaaaa"};
const CT_STATUSES=["BREACHED","SHOCKED","STUNNED","OVERHEAT","BLINDED"];
const mkEnemy=()=>({id:Date.now()+Math.random(),name:"",hp:10,hpMax:10,armor:0,shield:false,statuses:[]});

function CombatTracker({gs,onCharChange,onShipChange}){
  const [active,setActive]=React.useState(false);
  const [mode,setMode]=React.useState("ground");
  const [round,setRound]=React.useState(1);
  const [enemies,setEnemies]=React.useState([mkEnemy()]);
  const [combatLog,setCombatLog]=React.useState([]);
  const [shipShields,setShipShields]=React.useState(0);
  const [actionDice,setActionDice]=React.useState([]);
  const [coleHP,setColeHP]=React.useState(null);
  const [coleEN,setColeEN]=React.useState(null);
  const [velaHP,setVelaHP]=React.useState(null);
  const [velaEN,setVelaEN]=React.useState(null);
  const [coleSt,setColeSt]=React.useState([]);
  const [velaSt,setVelaSt]=React.useState([]);
  const [rollRes,setRollRes]=React.useState(null);
  const [rollChar,setRollChar]=React.useState("cole");
  const [rollWpnIdx,setRollWpnIdx]=React.useState(0);

  const addLog=(txt,c)=>setCombatLog(p=>p.concat([{id:Date.now()+Math.random(),txt,c:c||"#aaaacc"}]));

  const startCombat=()=>{
    setActive(true);setRound(1);
    setColeHP(gs.cole.hp);setColeEN(gs.cole.en);
    setVelaHP(gs.vela.hp);setVelaEN(gs.vela.en);
    setColeSt([]);setVelaSt([]);
    setCombatLog([{id:Date.now(),txt:"\u25b6 COMBAT INITIATED \u2014 ROUND 1",c:"#FF2060"}]);
    if(mode==="ship"){
      const eng=gs.ship.engines||"";
      const isOxy=eng.toLowerCase().includes("2d6");
      const hasShield=gs.ship.control&&gs.ship.control.toLowerCase().includes("1 shield");
      setShipShields(hasShield?1:0);
      const cnt=isOxy?3:2;
      const dice=Array.from({length:cnt},()=>({val:Math.ceil(Math.random()*6),used:false,id:Math.random()}));
      setActionDice(dice);
      addLog("\u2381 Ship engines: "+eng,"#00FFD0");
    }
  };

  const endCombat=()=>{
    if(onCharChange){
      if(coleHP!==null){onCharChange("cole","hp",coleHP);onCharChange("cole","en",coleEN);}
      if(velaHP!==null){onCharChange("vela","hp",velaHP);onCharChange("vela","en",velaEN);}
    }
    setActive(false);setRound(1);setEnemies([mkEnemy()]);
    setCombatLog([]);setShipShields(0);setActionDice([]);
    setRollRes(null);setColeSt([]);setVelaSt([]);
  };

  const nextRound=()=>{
    const nr=round+1;setRound(nr);
    addLog("\u2500\u2500 ROUND "+nr+" \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500",mode==="ship"?"#FFD166":"#00FFD0");
    if(mode==="ship"){
      const eng=gs.ship.engines||"";
      const cnt=eng.toLowerCase().includes("2d6")?2:1;
      const dice=Array.from({length:cnt},()=>({val:Math.ceil(Math.random()*6),used:false,id:Math.random()}));
      setActionDice(dice);
      addLog("\u2381 New action dice: "+dice.map(d=>d.val).join(", "),"#00FFD0");
    }
  };

  const adjHP=(who,delta)=>{
    if(who==="cole")setColeHP(p=>Math.max(0,Math.min(gs.cole.hpMax||20,p+delta)));
    else setVelaHP(p=>Math.max(0,Math.min(gs.vela.hpMax||20,p+delta)));
  };
  const adjEN=(who,delta)=>{
    if(who==="cole")setColeEN(p=>Math.max(0,Math.min(gs.cole.enMax||20,p+delta)));
    else setVelaEN(p=>Math.max(0,Math.min(gs.vela.enMax||20,p+delta)));
  };

  const adjEHP=(eid,delta)=>setEnemies(p=>p.map(e=>e.id===eid?Object.assign({},e,{hp:Math.max(0,e.hp+delta)}):e));
  const toggleESt=(eid,st)=>setEnemies(p=>p.map(e=>{
    if(e.id!==eid)return e;
    const ss=e.statuses||[];
    return Object.assign({},e,{statuses:ss.includes(st)?ss.filter(s=>s!==st):ss.concat([st])});
  }));
  const setEField=(eid,key,val)=>setEnemies(p=>p.map(e=>e.id===eid?Object.assign({},e,{[key]:val}):e));

  const rollAttack=()=>{
    const char=rollChar==="cole"?gs.cole:gs.vela;
    const wpn=char.weapons&&char.weapons[rollWpnIdx];
    if(!wpn||!wpn.name){setRollRes({txt:"No weapon in slot "+(rollWpnIdx+1),c:"#FF2060"});return;}
    const wData=WEAPON_DB[wpn.name.toLowerCase()];
    if(!wData){setRollRes({txt:"'"+wpn.name+"' not in DB",c:"#FF2060"});return;}
    const stat=char[wData.stat]||0;
    const rolls=Array.from({length:wData.cnt||1},()=>Math.ceil(Math.random()*wData.die));
    const best=Math.max(...rolls);
    const total=best+stat;
    const charName=rollChar==="cole"?"COLE":"VELA";
    const txt=charName+" \u25b8 "+wpn.name+" ["+rolls.join(", ")+"] \u2192 best "+best+"+"+wData.stat.slice(0,3).toUpperCase()+"("+stat+") = "+total;
    setRollRes({txt,c:"#FFD166"});
    addLog(txt,"#FFD166");
  };

  const rollShipDice=()=>{
    const eng=gs.ship.engines||"";
    const cnt=eng.toLowerCase().includes("2d6")?2:1;
    const dice=Array.from({length:cnt},()=>({val:Math.ceil(Math.random()*6),used:false,id:Math.random()}));
    setActionDice(dice);
    addLog("\u2381 Action dice: "+dice.map(d=>d.val).join(", "),"#00FFD0");
  };
  const toggleDie=(did)=>setActionDice(p=>p.map(d=>d.id===did?Object.assign({},d,{used:!d.used}):d));

  const CC="#FF6B35";
  const btnBase={fontFamily:MONO,fontSize:10,letterSpacing:1,cursor:"pointer",border:"1px solid",borderRadius:3,padding:"5px 12px"};

  // ── SETUP SCREEN ──────────────────────────────────────────────────────────
  if(!active){
    return React.createElement("div",{style:{maxWidth:720}},
      React.createElement("div",{style:{fontFamily:ORB,fontSize:14,fontWeight:700,color:CC,letterSpacing:3,marginBottom:18}},"\u2694  COMBAT TRACKER"),
      React.createElement("div",{style:{display:"flex",gap:8,marginBottom:20}},
        ["ground","ship"].map(m=>React.createElement("button",{key:m,onClick:()=>setMode(m),style:Object.assign({},btnBase,{flex:1,padding:"10px 0",background:mode===m?CC+"22":"transparent",borderColor:mode===m?CC:B1,color:mode===m?CC:"#778",letterSpacing:2,fontSize:11})},m==="ground"?"\u2694  GROUND COMBAT":"\u2381  SHIP COMBAT"))
      ),
      React.createElement("div",{style:{marginBottom:20}},
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
      ),
      React.createElement("button",{onClick:startCombat,style:Object.assign({},btnBase,{width:"100%",padding:"14px 0",background:CC+"22",borderColor:CC,color:CC,fontSize:12,letterSpacing:3,textAlign:"center",display:"block"})},"\u25b6  INITIATE COMBAT")
    );
  }

  // ── CHAR PANEL ────────────────────────────────────────────────────────────
  const charPanel=(who,hp,en,sts)=>{
    const char=gs[who];
    const hpMax=char.hpMax||20;
    const enMax=char.enMax||20;
    const accent=who==="cole"?"#FFD166":"#FF2060";
    const hpPct=Math.max(0,Math.min(100,hp/hpMax*100));
    const enPct=Math.max(0,Math.min(100,en/enMax*100));
    const crit=hpPct<=25;
    return React.createElement("div",{style:{background:BG,border:"1px solid "+(crit?"#FF206066":accent+"44"),borderRadius:8,padding:14,flex:1,minWidth:180,animation:crit?"dangerPulse 2s ease-in-out infinite":undefined}},
      React.createElement("div",{style:{fontFamily:ORB,fontSize:11,color:accent,letterSpacing:2,marginBottom:10}},char.name||(who==="cole"?"COLE":"VELA")),
      React.createElement("div",{style:{marginBottom:8}},
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:3}},
          React.createElement("span",{style:{fontFamily:MONO,fontSize:10,color:"#778"}},"HP"),
          React.createElement("span",{style:{fontFamily:MONO,fontSize:11,color:crit?"#FF2060":accent}},hp+"/"+hpMax)
        ),
        React.createElement("div",{style:{height:6,background:"#1a1a2e",borderRadius:3,overflow:"hidden"}},
          React.createElement("div",{style:{width:hpPct+"%",height:"100%",background:crit?"#FF2060":accent,transition:"width .3s"}})
        ),
        React.createElement("div",{style:{display:"flex",gap:4,marginTop:5}},
          [-5,-1,1,5].map(d=>React.createElement("button",{key:d,onClick:()=>adjHP(who,d),style:{flex:1,padding:"3px 0",background:"transparent",border:"1px solid "+B1,color:"#bbb",borderRadius:2,cursor:"pointer",fontFamily:MONO,fontSize:10}},d>0?"+"+d:d))
        )
      ),
      React.createElement("div",{style:{marginBottom:10}},
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:3}},
          React.createElement("span",{style:{fontFamily:MONO,fontSize:10,color:"#778"}},"EN"),
          React.createElement("span",{style:{fontFamily:MONO,fontSize:11,color:"#aaaaff"}},en+"/"+enMax)
        ),
        React.createElement("div",{style:{height:4,background:"#1a1a2e",borderRadius:3,overflow:"hidden"}},
          React.createElement("div",{style:{width:enPct+"%",height:"100%",background:"#aaaaff",transition:"width .3s"}})
        ),
        React.createElement("div",{style:{display:"flex",gap:4,marginTop:4}},
          [-3,-1,1,3].map(d=>React.createElement("button",{key:d,onClick:()=>adjEN(who,d),style:{flex:1,padding:"3px 0",background:"transparent",border:"1px solid "+B1,color:"#bbb",borderRadius:2,cursor:"pointer",fontFamily:MONO,fontSize:10}},d>0?"+"+d:d))
        )
      ),
      React.createElement("div",{style:{display:"flex",gap:3,flexWrap:"wrap"}},
        CT_STATUSES.map(st=>{
          const act=sts.includes(st);
          const sc=STATUS_C_CT[st]||"#aaa";
          const set=who==="cole"?setColeSt:setVelaSt;
          return React.createElement("button",{key:st,onClick:()=>set(p=>p.includes(st)?p.filter(s=>s!==st):p.concat([st])),style:{padding:"2px 5px",background:act?sc+"22":"transparent",border:"1px solid "+(act?sc:B1),color:act?sc:"#334",borderRadius:2,fontFamily:MONO,fontSize:8,cursor:"pointer",letterSpacing:1}},st);
        })
      )
    );
  };

  // ── ENEMY PANEL ───────────────────────────────────────────────────────────
  const enemyPanel=(e)=>{
    const hpPct=Math.max(0,Math.min(100,e.hp/(e.hpMax||10)*100));
    const dead=e.hp<=0;
    const crit=hpPct<=25&&!dead;
    return React.createElement("div",{key:e.id,style:{background:dead?"#110008":BG,border:"1px solid "+(dead?"#FF206033":crit?"#FF206066":"#FF204044"),borderRadius:8,padding:14,flex:"0 0 auto",minWidth:160,maxWidth:200,opacity:dead?0.55:1}},
      React.createElement("div",{style:{fontFamily:ORB,fontSize:10,color:dead?"#FF2060":"#FF6080",letterSpacing:1,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}},
        React.createElement("span",null,e.name||"ENEMY"),
        dead&&React.createElement("span",{style:{fontSize:8,color:"#FF2060",letterSpacing:2}},"DOWN")
      ),
      !dead&&React.createElement("div",null,
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:3}},
          React.createElement("span",{style:{fontFamily:MONO,fontSize:10,color:"#778"}},"HP"),
          React.createElement("span",{style:{fontFamily:MONO,fontSize:11,color:crit?"#FF2060":"#FF8080"}},e.hp+"/"+(e.hpMax||10))
        ),
        React.createElement("div",{style:{height:5,background:"#1a1a2e",borderRadius:3,overflow:"hidden",marginBottom:6}},
          React.createElement("div",{style:{width:hpPct+"%",height:"100%",background:crit?"#FF2060":"#FF4060",transition:"width .3s"}})
        ),
        e.armor>0&&React.createElement("div",{style:{fontFamily:MONO,fontSize:9,color:"#778",marginBottom:4}},"ARM: "+e.armor),
        e.shield&&React.createElement("div",{style:{fontFamily:MONO,fontSize:9,color:"#00FFD0",marginBottom:4}},"\u2295 SHIELD"),
        React.createElement("div",{style:{display:"flex",gap:3,marginBottom:6}},
          [-5,-2,-1,1].map(d=>React.createElement("button",{key:d,onClick:()=>adjEHP(e.id,d),style:{flex:1,padding:"3px 0",background:d<0?"#FF206011":"transparent",border:"1px solid "+(d<0?"#FF206044":B1),color:d<0?"#FF6080":"#bbb",borderRadius:2,cursor:"pointer",fontFamily:MONO,fontSize:9}},d>0?"+"+d:d))
        ),
        React.createElement("div",{style:{display:"flex",gap:3,flexWrap:"wrap"}},
          CT_STATUSES.map(st=>{
            const act=e.statuses&&e.statuses.includes(st);
            const sc=STATUS_C_CT[st]||"#aaa";
            return React.createElement("button",{key:st,onClick:()=>toggleESt(e.id,st),style:{padding:"2px 4px",background:act?sc+"22":"transparent",border:"1px solid "+(act?sc:B1),color:act?sc:"#334",borderRadius:2,fontFamily:MONO,fontSize:7,cursor:"pointer"}},st.slice(0,3));
          })
        )
      ),
      dead&&React.createElement("button",{onClick:()=>setEnemies(p=>p.filter(x=>x.id!==e.id)),style:Object.assign({},btnBase,{width:"100%",padding:"4px 0",background:"transparent",borderColor:"#FF206033",color:"#FF206066",fontSize:9,marginTop:4,display:"block"}),"textAlign":"center"},"REMOVE")
    );
  };

  // ── SHIP PANEL ────────────────────────────────────────────────────────────
  const shipPanel=React.createElement("div",{style:{background:BG,border:"1px solid #00FFD044",borderRadius:8,padding:14,marginBottom:16}},
    React.createElement("div",{style:{fontFamily:ORB,fontSize:11,color:"#00FFD0",letterSpacing:2,marginBottom:10}},gs.ship.name||"THE INCONCEIVABLE"),
    React.createElement("div",{style:{display:"flex",gap:14,flexWrap:"wrap",marginBottom:12}},
      React.createElement("div",{style:{flex:1,minWidth:140}},
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:3}},
          React.createElement("span",{style:{fontFamily:MONO,fontSize:10,color:"#778"}},"HULL"),
          React.createElement("span",{style:{fontFamily:MONO,fontSize:11,color:"#00FFD0"}},gs.ship.hull+"/"+gs.ship.hullMax)
        ),
        React.createElement("div",{style:{height:6,background:"#1a1a2e",borderRadius:3,overflow:"hidden"}},
          React.createElement("div",{style:{width:(gs.ship.hull/gs.ship.hullMax*100)+"%",height:"100%",background:"#00FFD0"}})
        ),
        React.createElement("div",{style:{fontFamily:MONO,fontSize:9,color:"#445",marginTop:5}},gs.ship.control||"")
      ),
      React.createElement("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:5}},
        React.createElement("div",{style:{fontFamily:MONO,fontSize:10,color:"#778"}},"SHIELDS"),
        React.createElement("div",{style:{fontFamily:ORB,fontSize:20,color:shipShields>0?"#00FFD0":"#334",lineHeight:1}},shipShields),
        React.createElement("div",{style:{display:"flex",gap:4,marginTop:2}},
          React.createElement("button",{onClick:()=>setShipShields(p=>Math.max(0,p-1)),style:Object.assign({},btnBase,{padding:"3px 10px",background:"transparent",borderColor:B1,color:"#bbb",fontSize:13})},"-"),
          React.createElement("button",{onClick:()=>setShipShields(p=>p+1),style:Object.assign({},btnBase,{padding:"3px 10px",background:"transparent",borderColor:B1,color:"#bbb",fontSize:13})},"+" )
        )
      ),
      React.createElement("div",{style:{flex:1}},
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}},
          React.createElement("span",{style:{fontFamily:MONO,fontSize:10,color:"#778"}},"ACTION DICE"),
          React.createElement("button",{onClick:rollShipDice,style:Object.assign({},btnBase,{padding:"3px 8px",background:"transparent",borderColor:B1,color:"#778",fontSize:9})},"\u21ba ROLL")
        ),
        React.createElement("div",{style:{display:"flex",gap:6,flexWrap:"wrap"}},
          actionDice.map(d=>React.createElement("div",{key:d.id,onClick:()=>toggleDie(d.id),style:{width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ORB,fontSize:15,fontWeight:700,color:d.used?"#2a2a2a":"#FFD166",background:d.used?"#0a0a0a":"#FFD16614",border:"2px solid "+(d.used?"#222":"#FFD166"),borderRadius:4,cursor:"pointer",textDecoration:d.used?"line-through":"none",transition:"all .2s"}},d.val))
        ),
        React.createElement("div",{style:{fontFamily:MONO,fontSize:8,color:"#334",marginTop:5}},"tap to spend")
      )
    ),
    React.createElement("div",null,
      React.createElement("div",{style:{fontFamily:MONO,fontSize:9,color:"#445",letterSpacing:1,marginBottom:5}},"MODULES"),
      React.createElement("div",{style:{display:"flex",gap:6,flexWrap:"wrap"}},
        (gs.ship.modules||[]).filter(m=>m).map((m,i)=>React.createElement("div",{key:i,style:{fontFamily:MONO,fontSize:9,color:"#00FFD0",background:"#00FFD011",border:"1px solid #00FFD033",borderRadius:3,padding:"3px 8px"}},m))
      )
    )
  );

  // ── ROLL PANEL ────────────────────────────────────────────────────────────
  const rollPanel=React.createElement("div",{style:{background:BG,border:"1px solid "+B2,borderRadius:8,padding:14,marginBottom:16}},
    React.createElement("div",{style:{fontFamily:MONO,fontSize:10,color:"#778",letterSpacing:2,marginBottom:10}},"QUICK ROLL"),
    React.createElement("div",{style:{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}},
      React.createElement("div",{style:{display:"flex",gap:4}},
        ["cole","vela"].map(c=>React.createElement("button",{key:c,onClick:()=>setRollChar(c),style:Object.assign({},btnBase,{padding:"5px 12px",background:rollChar===c?"#FFD16622":"transparent",borderColor:rollChar===c?"#FFD166":B1,color:rollChar===c?"#FFD166":"#778",fontSize:10})},c==="cole"?"COLE":"VELA"))
      ),
      React.createElement("div",{style:{display:"flex",gap:4}},
        [0,1].map(i=>{
          const char=gs[rollChar];
          const wpn=char.weapons&&char.weapons[i];
          const label=wpn&&wpn.name?wpn.name:"WPN "+(i+1);
          return React.createElement("button",{key:i,onClick:()=>setRollWpnIdx(i),style:Object.assign({},btnBase,{padding:"5px 10px",background:rollWpnIdx===i?CC+"22":"transparent",borderColor:rollWpnIdx===i?CC:B1,color:rollWpnIdx===i?CC:"#778",fontSize:9})},label);
        })
      ),
      React.createElement("button",{onClick:rollAttack,style:Object.assign({},btnBase,{padding:"7px 18px",background:CC+"22",borderColor:CC,color:CC,fontSize:11,letterSpacing:2})},"\u25b6 ROLL")
    ),
    rollRes&&React.createElement("div",{style:{fontFamily:MONO,fontSize:11,color:rollRes.c,marginTop:10,padding:"7px 12px",background:rollRes.c+"11",borderRadius:4,border:"1px solid "+rollRes.c+"44"}},rollRes.txt)
  );

  // ── COMBAT LOG ────────────────────────────────────────────────────────────
  const logPanel=React.createElement("div",{style:{background:"#05050f",border:"1px solid "+B2,borderRadius:8,padding:12,maxHeight:160,overflowY:"auto"}},
    React.createElement("div",{style:{fontFamily:MONO,fontSize:9,color:"#334",letterSpacing:2,marginBottom:6}},"// COMBAT LOG"),
    combatLog.length===0?React.createElement("div",{style:{fontFamily:MONO,fontSize:9,color:"#223"}},"// no entries"):
    combatLog.slice().reverse().map(l=>React.createElement("div",{key:l.id,style:{fontFamily:MONO,fontSize:9,color:l.c,marginBottom:3,lineHeight:1.6}},l.txt))
  );

  // ── ACTIVE COMBAT LAYOUT ──────────────────────────────────────────────────
  return React.createElement("div",{style:{maxWidth:900}},
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}},
      React.createElement("div",{style:{display:"flex",gap:10,alignItems:"center"}},
        React.createElement("div",{style:{fontFamily:ORB,fontSize:13,fontWeight:700,color:CC,letterSpacing:3}},"\u2694  COMBAT"),
        React.createElement("div",{style:{fontFamily:MONO,fontSize:10,color:"#778",background:B2+"55",padding:"4px 10px",borderRadius:3,letterSpacing:2}},"ROUND "+round),
        React.createElement("div",{style:{fontFamily:MONO,fontSize:9,color:mode==="ship"?"#00FFD0":CC,background:(mode==="ship"?"#00FFD0":CC)+"11",padding:"3px 8px",borderRadius:3,border:"1px solid "+(mode==="ship"?"#00FFD033":CC+"33"),letterSpacing:2}},mode==="ship"?"\u2381 SHIP":"\u2694 GROUND")
      ),
      React.createElement("div",{style:{display:"flex",gap:6}},
        React.createElement("button",{onClick:nextRound,style:Object.assign({},btnBase,{background:"#00FFD022",borderColor:"#00FFD0",color:"#00FFD0",fontSize:10})},"\u25b6 NEXT ROUND"),
        React.createElement("button",{onClick:endCombat,style:Object.assign({},btnBase,{background:"#FF206011",borderColor:"#FF2060",color:"#FF2060",fontSize:10})},"\u2b1b END")
      )
    ),
    React.createElement("div",{style:{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}},
      charPanel("cole",coleHP,coleEN,coleSt),
      charPanel("vela",velaHP,velaEN,velaSt)
    ),
    enemies.length>0&&React.createElement("div",{style:{marginBottom:16}},
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}},
        React.createElement("div",{style:{fontFamily:MONO,fontSize:10,color:"#778",letterSpacing:2}},"ENEMIES"),
        React.createElement("button",{onClick:()=>setEnemies(p=>p.concat([mkEnemy()])),style:Object.assign({},btnBase,{background:"transparent",borderColor:B1,color:"#556",fontSize:9,padding:"4px 10px"})},"+")
      ),
      React.createElement("div",{style:{display:"flex",gap:12,flexWrap:"wrap"}},
        enemies.map(e=>enemyPanel(e))
      )
    ),
    mode==="ship"&&shipPanel,
    rollPanel,
    logPanel
  );
}

"""

# Insert before "function App(){"
TARGET = "function App(){"
if TARGET in src:
    src = src.replace(TARGET, COMPONENT + TARGET, 1)
    print("✓ Component inserted")
else:
    print("✗ Could not find insertion point for component")

# ── 2. Update TABS array ───────────────────────────────────────────────────
OLD_TABS = 'var TABS=["MAP","CREW","SHIP","LOGS","COMMS","CYBER"];'
NEW_TABS = 'var TABS=["MAP","CREW","SHIP","LOGS","COMMS","CYBER","COMBAT"];'
if OLD_TABS in src:
    src = src.replace(OLD_TABS, NEW_TABS, 1)
    print("✓ TABS updated")
else:
    print("✗ Could not find TABS array")

# ── 3. Update TAB_C ────────────────────────────────────────────────────────
OLD_TABC = 'var TAB_C={MAP:"#cc88ff",CREW:"#FFD166",SHIP:"#00FFD0",LOGS:"#FF6EC7",COMMS:"#88BBFF",CYBER:"#FF2060"};'
NEW_TABC = 'var TAB_C={MAP:"#cc88ff",CREW:"#FFD166",SHIP:"#00FFD0",LOGS:"#FF6EC7",COMMS:"#88BBFF",CYBER:"#FF2060",COMBAT:"#FF6B35"};'
if OLD_TABC in src:
    src = src.replace(OLD_TABC, NEW_TABC, 1)
    print("✓ TAB_C updated")
else:
    print("✗ Could not find TAB_C")

# ── 4. Add COMBAT tab render case ─────────────────────────────────────────
OLD_CYBER_TAB = 'tab==="CYBER"&&React.createElement(CybersphereTab,{gs:gs,cyberSess:cyberSess,setCyberSess:setCyberSess,onCharChange:upC,onStatBoost:upCStat,onMabelSend:sendToMabel,onNetrunMemory:appendNetrunMemory})'
NEW_CYBER_TAB = 'tab==="CYBER"&&React.createElement(CybersphereTab,{gs:gs,cyberSess:cyberSess,setCyberSess:setCyberSess,onCharChange:upC,onStatBoost:upCStat,onMabelSend:sendToMabel,onNetrunMemory:appendNetrunMemory}),\n    tab==="COMBAT"&&React.createElement(CombatTracker,{gs:gs,onCharChange:upC,onShipChange:upS})'
if OLD_CYBER_TAB in src:
    src = src.replace(OLD_CYBER_TAB, NEW_CYBER_TAB, 1)
    print("✓ COMBAT tab render added")
else:
    print("✗ Could not find CYBER tab render")

with open('/Users/jorgevorg/ghost-signal/src/App.jsx', 'w') as f:
    f.write(src)

print("Done. Lines:", src.count('\n'))
