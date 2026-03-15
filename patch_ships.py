path = "/Users/jorgevorg/ghost-signal/src/App.jsx"

with open(path, "r") as f:
    code = f.read()

results = []

def patch(old, new, label, replace_all=False):
    global code
    count = code.count(old)
    if count == 0:
        results.append(f"FAILED  [{label}] — not found")
        return
    code = code.replace(old, new) if replace_all else code.replace(old, new, 1)
    results.append(f"OK ({count}x) [{label}]" if replace_all else f"OK      [{label}]" + (f" (WARNING: {count} matches, replaced first)" if count > 1 else ""))

# ── GOAL 1: ship boolean → ships[] array ──────────────────────────────────

patch('isShip=!!d.ship',
      'isShip=!!(d.ships&&d.ships.length)',
      'isShip definition')

patch('d.type||d.ship||d.name',
      'd.type||(d.ships&&d.ships.length)||d.name',
      'hover check')

patch('{name:"",type:"",notes:"",ship:false}',
      '{name:"",type:"",notes:"",ships:[]}',
      'form init state')

patch('ship:d.ship||false',
      'ships:d.ships||[]',
      'form populate', replace_all=True)

patch('React.createElement("input",{type:"checkbox",checked:form.ship,onChange:function(e){setForm(function(p){return Object.assign({},p,{ship:e.target.checked});})},style:{accentColor:"#FF2060",width:14,height:14}})',
      'React.createElement("select",{value:(form.ships&&form.ships[0])||"",onChange:function(e){var v=e.target.value;setForm(function(p){return Object.assign({},p,{ships:v?[v]:[]});})},style:{background:"#080810",border:"1px solid #FF206055",color:"#FF2060",fontFamily:MONO,fontSize:9,borderRadius:3,padding:"2px 6px",outline:"none"}},React.createElement("option",{value:""},"— NO SHIP TOKEN —"),React.createElement("option",{value:"seance"},"THE INDESTRUCTIBLE II"),React.createElement("option",{value:"twinrotor"},"TWINROTOR HAULER"),React.createElement("option",{value:"snowstorm"},"SNOWSTORM DELTA"),React.createElement("option",{value:"epsilon"},"EPSILON INTERCEPTOR"),React.createElement("option",{value:"voyager"},"A-1 VOYAGER"),React.createElement("option",{value:"orionmoth"},"ORION MOTH"),React.createElement("option",{value:"eclipsewarden"},"ECLIPSE WARDEN"))',
      'form checkbox → ship selector')

patch('token:(mode==="tile")?false:(d.ship||false)',
      'token:(mode==="tile")?[]:(d.ships||[])',
      'clipboard copy token', replace_all=True)

patch('h.ship=false',
      'h.ships=[]',
      'cut/clear hex token', replace_all=True)

patch('!h.type&&!h.ship&&!h.',
      '!h.type&&!(h.ships&&h.ships.length)&&!h.',
      'cut hex cleanup check')

patch('h3.ship=cb.token',
      'h3.ships=cb.token',
      'paste token (keyboard)')

patch('h.ship=cb.token',
      'h.ships=cb.token',
      'paste token (ctx menu)')

patch('if(!cb||(!cb.tile&&!cb.token))return null;',
      'if(!cb||(!cb.tile&&(!cb.token||!cb.token.length)))return null;',
      'clipboard null check')

patch('cb.token&&React.createElement("div",{style:{fontFamily:MONO,fontSize:8,color:"#aaa"}},"> TOKEN: "',
      'cb.token&&cb.token.length&&React.createElement("div",{style:{fontFamily:MONO,fontSize:8,color:"#aaa"}},"> TOKEN: "',
      'clipboard token section visibility')

patch('{color:SHIP_COLORS[cb.token.ship]||"#fff"}},(cb.token.ship||"—").toUpperCase()',
      '{color:SHIP_COLORS[(cb.token&&cb.token[0])||""]||"#fff"}},((cb.token&&cb.token[0])||"—").toUpperCase()',
      'clipboard token ship display', replace_all=True)

patch('(cb.token?"SHIP":"—")',
      '((cb.token&&cb.token.length)?"SHIP":"—")',
      'clipboard bottom bar')

# ── GOAL 2: tile icon scaled + ship icons overlaid ─────────────────────────

patch('d.type&&React.createElement(HexIcon,{t:d.type,x:hex.x,y:hex.y,hexId:hex.id}),',
      'd.type&&React.createElement("g",{transform:isShip&&!isBarrier&&!isBase?("translate("+hex.x+","+hex.y+") scale(0.58) translate("+(0-hex.x)+","+(0-hex.y)+")"):""},React.createElement(HexIcon,{t:d.type,x:hex.x,y:hex.y,hexId:hex.id})),\n            isShip&&!isBarrier&&!isBase&&(d.ships||[]).map(function(sn,si){var xOff=d.ships.length===1?0:si===0?-11:si===1?11:0;var yOff=si>1?12:4;return React.createElement(HexIcon,{key:sn+"-"+si,t:sn,x:hex.x+xOff,y:hex.y+yOff,hexId:hex.id});}),',
      'tile icon scale + ship icons overlay (goal 2)')

patch('isShip&&!isBarrier&&!isBase&&React.createElement("text",',
      'false&&!isBarrier&&!isBase&&React.createElement("text",',
      'disable old ship text label')

for r in results:
    print(r)

with open(path, "w") as f:
    f.write(code)

print("\nDone!")
