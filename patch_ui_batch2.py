#!/usr/bin/env python3
"""
patch_ui_batch2.py — UI polish batch:
  1. TalkWave layout shift fix (reserved height, opacity toggle)
  2. HAIL button always visible
  3. COMMS overlay — bigger framed MABEL advisory text
  4. Database picker — split left/right layout
"""

import re, sys

def patch_file(path, patches):
    with open(path) as f:
        code = f.read()
    ok = True
    for name, old, new in patches:
        if old not in code:
            print(f"  ✗ MISSING anchor: {name}")
            ok = False
        else:
            code = code.replace(old, new, 1)
            print(f"  ✓ {name}")
    if ok:
        with open(path, 'w') as f:
            f.write(code)
    return ok

# ─────────────────────────────────────────────────────────────────────────────
# PORTRAIT PANEL — fix TalkWave layout shift + processing indicator
# ─────────────────────────────────────────────────────────────────────────────
PP = '/Users/jorgevorg/ghost-signal/src/PortraitPanel.jsx'

pp_patches = [
    (
        "TalkWave reserved height",
        # old — conditional return null
        """function TalkWave({ color, visible }) {
  if (!visible) return null;
  return (
    <div style={{ display:'flex', gap:2, alignItems:'center', justifyContent:'center', height:10 }}>
      {[0,1,2,3,4].map(i => (
        <div key={i} style={{ width:2, borderRadius:1, background:color,
          animation:`talkWave 0.6s ease-in-out ${i*0.1}s infinite`, opacity:0.85 }}/>
      ))}
    </div>
  );
}""",
        # new — always render, opacity 0 when hidden, space reserved
        """function TalkWave({ color, visible, loading }) {
  return (
    <div style={{ display:'flex', gap:2, alignItems:'center', justifyContent:'center',
      height:10, opacity: visible || loading ? 1 : 0, transition:'opacity 0.25s' }}>
      {[0,1,2,3,4].map(i => (
        <div key={i} style={{ width:2, borderRadius:1, background:color,
          animation: loading
            ? `talkWave 0.25s ease-in-out ${i*0.05}s infinite`
            : `talkWave 0.6s ease-in-out ${i*0.1}s infinite`,
          minHeight: loading ? '100%' : undefined,
          opacity:0.85 }}/>
      ))}
    </div>
  );
}"""
    ),
]

print("\nPortraitPanel.jsx:")
pp_ok = patch_file(PP, pp_patches)

# Also update TalkWave calls to pass loading prop
if pp_ok:
    with open(PP) as f:
        code = f.read()

    # MABEL TalkWave — pass loading
    code = code.replace(
        "<TalkWave color={TEAL} visible={mabelTalking}/>",
        "<TalkWave color={TEAL} visible={mabelTalking} loading={mabelLoading}/>",
        1
    )
    # Enemy TalkWaves — no change needed (loading is commsLoading handled separately)
    with open(PP, 'w') as f:
        f.write(code)
    print("  ✓ TalkWave loading prop wired to MABEL")

# ─────────────────────────────────────────────────────────────────────────────
# COMBAT BATTLE SCREEN — HAIL button + COMMS overlay text
# ─────────────────────────────────────────────────────────────────────────────
CBS = '/Users/jorgevorg/ghost-signal/src/CombatBattleScreen.jsx'

cbs_patches = [
    (
        "HAIL button always visible teal",
        """        {!commsOpen && selectedEnemy && selectedEnemy.hp > 0 && (
          <button onClick={()=>setCommsOpen(true)}
            style={{ fontFamily:MONO,fontSize:7,letterSpacing:2,padding:'4px 11px',
              background: hailAvailable ? 'rgba(0,255,208,0.06)' : active ? 'transparent' : 'rgba(0,255,208,0.04)',
              border:'1px solid '+(hailAvailable||!active ? TEAL : 'rgba(255,255,255,0.08)'),
              color: hailAvailable||!active ? TEAL : 'rgba(255,255,255,0.35)',
              cursor:'pointer', borderRadius:2,
              animation: hailAvailable ? 'hailPulse 1.8s ease-in-out infinite' : !active ? 'hailPulse 2.4s ease-in-out infinite' : 'none',
              transition:'all 0.2s' }}>
            {active ? 'HAIL' : '⬡ OPEN COMMS'}
          </button>
        )}""",
        """        {!commsOpen && selectedEnemy && selectedEnemy.hp > 0 && (
          <button onClick={()=>setCommsOpen(true)}
            style={{ fontFamily:MONO,fontSize:7,letterSpacing:2,padding:'5px 14px',
              background: hailAvailable ? 'rgba(0,255,208,0.1)' : 'rgba(0,255,208,0.05)',
              border:`1px solid ${TEAL}${hailAvailable ? 'cc' : '66'}`,
              color: `${TEAL}${hailAvailable ? 'ff' : 'bb'}`,
              cursor:'pointer', borderRadius:2,
              boxShadow: hailAvailable ? `0 0 10px ${TEAL}44` : 'none',
              animation: hailAvailable ? 'hailPulse 1.8s ease-in-out infinite' : 'none',
              transition:'all 0.2s', fontWeight: 600 }}>
            {active ? '⬡ HAIL' : '⬡ OPEN COMMS'}
          </button>
        )}"""
    ),
    (
        "COMMS overlay MABEL advisory text block",
        """              <div style={{ display:'flex',gap:6,marginTop:8,justifyContent:'center',flexWrap:'wrap' }}>
                {['NEGOTIATE','DEMAND','BLUFF','REJECT'].map(opt=>(
                  <button key={opt} onClick={()=>setCommsOpen(false)}""",
        """              {/* MABEL advisory text — framed terminal block */}
              <div style={{ margin:'8px 0 4px', padding:'8px 10px',
                background:'rgba(0,255,208,0.03)',
                border:'1px solid rgba(0,255,208,0.18)',
                borderRadius:3, minHeight:38 }}>
                <div style={{ fontFamily:MONO,fontSize:6,color:TEAL+'55',letterSpacing:2,marginBottom:5 }}>
                  M.A.B.E.L // ADVISORY
                </div>
                {commsLoading2
                  ? <div style={{ display:'flex',gap:4,alignItems:'center' }}>
                      {[0,1,2].map(i=>(
                        <div key={i} style={{ width:4,height:4,borderRadius:'50%',
                          background:TEAL,
                          animation:`hailPulse 1s ease-in-out ${i*0.18}s infinite` }}/>
                      ))}
                      <span style={{ fontFamily:MONO,fontSize:7,color:TEAL+'77',marginLeft:4,letterSpacing:1 }}>
                        PROCESSING...
                      </span>
                    </div>
                  : <div style={{ fontFamily:MONO,fontSize:9,color:TEAL+'dd',
                      lineHeight:1.7,letterSpacing:0.5,textAlign:'left',wordBreak:'break-word' }}>
                      {commsLine || '// Establishing channel...'}
                    </div>
                }
              </div>

              <div style={{ display:'flex',gap:6,marginTop:4,justifyContent:'center',flexWrap:'wrap' }}>
                {['NEGOTIATE','DEMAND','BLUFF','REJECT'].map(opt=>(
                  <button key={opt} onClick={()=>setCommsOpen(false)}"""
    ),
]

print("\nCombatBattleScreen.jsx:")
patch_file(CBS, cbs_patches)

# ─────────────────────────────────────────────────────────────────────────────
# APP.JSX — Database picker split layout
# ─────────────────────────────────────────────────────────────────────────────
APP = '/Users/jorgevorg/ghost-signal/src/App.jsx'

with open(APP) as f:
    app_code = f.read()

# The full picker block to replace
OLD_PICKER = '''        showPicker&&React.createElement("div",{style:{background:"#020408",border:"1px solid "+CC+"33",borderRadius:4,padding:"10px",marginBottom:10}},
          React.createElement("input",{placeholder:"// SEARCH ENEMY DATABASE...",value:enemySearch,onChange:ev=>setEnemySearch(ev.target.value),autoFocus:true,style:{width:"100%",background:"transparent",border:"1px solid "+B1+"44",borderRadius:3,color:"#ddd",fontFamily:MONO,fontSize:10,padding:"7px 10px",outline:"none",boxSizing:"border-box",marginBottom:8,caretColor:CC}}),
          React.createElement("div",{style:{maxHeight:200,overflowY:"auto",display:"flex",flexDirection:"column",gap:3}},
            Object.entries(ENEMY_DB).filter(([k])=>!enemySearch||k.toLowerCase().includes(enemySearch.toLowerCase())).map(([k,en])=>{
              const fc=FACTION_COLORS[en.faction]||"#99aacc";
              const dc=DIFFICULTY_C[en.difficulty]||"#99aacc";
              return React.createElement("div",{key:k,onClick:()=>{if(enemies.length<MAX_ENEMIES){setEnemies(p=>{const sameName=p.filter(x=>x.baseName===k||x.name===k||x.name.startsWith(k+" "));const num=sameName.length+1;const displayName=sameName.length===0?k:k+" "+String(num).padStart(2,"0");const updated=sameName.length===1?p.map(x=>(x.baseName===k||x.name===k)?Object.assign({},x,{name:k+" 01"}):x):p;return updated.concat([Object.assign({},mkEnemy(en),{name:displayName,baseName:k})]);});if(enemies.length+1>=MAX_ENEMIES)setShowPicker(false);}},style:{display:"flex",gap:8,alignItems:"center",padding:"6px 10px",cursor:"pointer",borderRadius:3,background:"#0a0a16",border:"1px solid #ffffff08"},
                onMouseEnter:ev2=>{ev2.currentTarget.style.background="#ffffff0d";ev2.currentTarget.style.borderColor=CC+"33";},
                onMouseLeave:ev2=>{ev2.currentTarget.style.background="#0a0a16";ev2.currentTarget.style.borderColor="#ffffff08";}},
                React.createElement("span",{style:{fontFamily:MONO,fontSize:10,color:"#ddd",flex:1}},k),
                React.createElement("span",{style:{display:"inline-flex",alignItems:"center",gap:3,color:fc,background:fc+"18",padding:"1px 5px",borderRadius:2}},FACTION_ICONS[en.faction]&&FACTION_ICONS[en.faction](10),React.createElement("span",{style:{fontFamily:MONO,fontSize:7}},en.faction.toUpperCase())),
                React.createElement("span",{style:{fontFamily:MONO,fontSize:8,color:dc,background:dc+"18",padding:"1px 5px",borderRadius:2}},en.difficulty),
                React.createElement("span",{style:{fontFamily:MONO,fontSize:8,color:"#99aacc"}},"HP "+(en.hp+5)),
                en.isBoss&&React.createElement("span",{style:{color:"#FF2060",fontSize:10}},"\ud83d\udc51")
              );
            })
          )
        ),'''

NEW_PICKER = '''        showPicker&&React.createElement("div",{style:{background:"#020408",border:"1px solid "+CC+"33",borderRadius:4,padding:"10px",marginBottom:10}},
          /* Search bar */
          React.createElement("input",{placeholder:"// SEARCH ENEMY DATABASE...",value:enemySearch,onChange:ev=>setEnemySearch(ev.target.value),autoFocus:true,style:{width:"100%",background:"transparent",border:"1px solid "+B1+"44",borderRadius:3,color:"#ddd",fontFamily:MONO,fontSize:10,padding:"6px 10px",outline:"none",boxSizing:"border-box",marginBottom:8,caretColor:CC}}),
          /* Split: left = database list, right = selected manifest */
          React.createElement("div",{style:{display:"flex",gap:8,minHeight:180}},
            /* LEFT — compact enemy database */
            React.createElement("div",{style:{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:2,maxHeight:220}},
              Object.entries(ENEMY_DB).filter(([k])=>!enemySearch||k.toLowerCase().includes(enemySearch.toLowerCase())).map(([k,en])=>{
                const fc=FACTION_COLORS[en.faction]||"#99aacc";
                const dc=DIFFICULTY_C[en.difficulty]||"#99aacc";
                const atMax=enemies.length>=MAX_ENEMIES;
                return React.createElement("div",{key:k,onClick:()=>{if(!atMax){setEnemies(p=>{const sameName=p.filter(x=>x.baseName===k||x.name===k||x.name.startsWith(k+" "));const displayName=sameName.length===0?k:k+" "+String(sameName.length+1).padStart(2,"0");const updated=sameName.length===1?p.map(x=>(x.baseName===k||x.name===k)?Object.assign({},x,{name:k+" 01"}):x):p;return updated.concat([Object.assign({},mkEnemy(en),{name:displayName,baseName:k})]);});if(enemies.length+1>=MAX_ENEMIES)setShowPicker(false);}},
                  style:{display:"flex",gap:6,alignItems:"center",padding:"4px 8px",cursor:atMax?"not-allowed":"pointer",borderRadius:2,background:"#0a0a16",border:"1px solid #ffffff06",opacity:atMax?0.4:1},
                  onMouseEnter:ev2=>{if(!atMax){ev2.currentTarget.style.background="#ffffff0d";ev2.currentTarget.style.borderColor=CC+"33";}},
                  onMouseLeave:ev2=>{ev2.currentTarget.style.background="#0a0a16";ev2.currentTarget.style.borderColor="#ffffff06";}},
                  React.createElement("span",{style:{width:6,height:6,borderRadius:"50%",background:fc,flexShrink:0}}),
                  React.createElement("span",{style:{fontFamily:MONO,fontSize:9,color:"#ddd",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},en.isBoss?"👑 "+k:k),
                  React.createElement("span",{style:{fontFamily:MONO,fontSize:7,color:dc,flexShrink:0}},"HP "+(en.hp+5)),
                  React.createElement("span",{style:{fontFamily:MONO,fontSize:7,color:CC+"55",flexShrink:0}},"+")
                );
              })
            ),
            /* DIVIDER */
            React.createElement("div",{style:{width:1,background:CC+"18",flexShrink:0}}),
            /* RIGHT — selected manifest mini counters */
            React.createElement("div",{style:{width:170,flexShrink:0,display:"flex",flexDirection:"column",gap:4,overflowY:"auto",maxHeight:220}},
              React.createElement("div",{style:{fontFamily:MONO,fontSize:6,color:CC+"44",letterSpacing:2,marginBottom:2,paddingBottom:3,borderBottom:"1px solid "+CC+"18"}},
                "MANIFEST  "+enemies.length+"/"+MAX_ENEMIES
              ),
              enemies.length===0
                ? React.createElement("div",{style:{fontFamily:MONO,fontSize:8,color:"#7788bb",textAlign:"center",padding:"24px 0",opacity:0.5}},"// EMPTY")
                : enemies.map((en,idx)=>{
                    const fc=FACTION_COLORS[en.faction]||"#8899cc";
                    return React.createElement("div",{key:en.id,style:{display:"flex",gap:5,alignItems:"center",padding:"4px 6px",background:fc+"0a",border:"1px solid "+fc+"22",borderRadius:3}},
                      React.createElement("span",{style:{fontFamily:MONO,fontSize:7,color:CC+"44",flexShrink:0,minWidth:12}},String(idx+1).padStart(2,"0")),
                      React.createElement("span",{style:{width:5,height:5,borderRadius:"50%",background:fc,flexShrink:0}}),
                      React.createElement("span",{style:{fontFamily:MONO,fontSize:8,color:"#ccc",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},en.name),
                      React.createElement("button",{onClick:(ev)=>{ev.stopPropagation();setEnemies(p=>p.filter(x=>x.id!==en.id));},style:{background:"transparent",border:"none",color:"#FF206066",cursor:"pointer",fontFamily:MONO,fontSize:10,padding:"0 2px",lineHeight:1,flexShrink:0}},"✕")
                    );
                  })
            )
          )
        ),'''

if OLD_PICKER in app_code:
    app_code = app_code.replace(OLD_PICKER, NEW_PICKER, 1)
    with open(APP, 'w') as f:
        f.write(app_code)
    print("\nApp.jsx:")
    print("  ✓ Database picker split layout")
else:
    print("\nApp.jsx:")
    print("  ✗ Picker anchor NOT FOUND — skipping")
    sys.exit(1)

print("\n✅ All patches applied.")
