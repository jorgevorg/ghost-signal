path = "/Users/jorgevorg/ghost-signal/src/App.jsx"

with open(path, "r") as f:
    code = f.read()

old1 = 'showIds?"HIDE IDs":"SHOW IDs"),'
new1 = 'showIds?"HIDE IDs":"SHOW IDs"),React.createElement("button",{onClick:function(){setConfirmClear(true);},style:{padding:"5px 12px",background:"#FF206018",border:"1px solid #FF206055",color:"#FF2060",borderRadius:4,cursor:"pointer",fontFamily:MONO,fontSize:9,letterSpacing:1,animation:"dangerPulse 1.8s ease-in-out infinite"}},"\u26a0 CLEAR MAP"),'

if old1 in code:
    code = code.replace(old1, new1, 1)
    print("PATCH 1 applied")
else:
    print("PATCH 1 FAILED")

old2 = 'React.createElement("svg",{ref:svgRef'
new2 = 'confirmClear&&React.createElement("div",{style:{position:"fixed",inset:0,background:"#00000088",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}},React.createElement("div",{style:{background:"#0d0d1a",border:"2px solid #FF206077",borderRadius:8,padding:"28px 36px",textAlign:"center",boxShadow:"0 0 40px #FF206033"}},React.createElement("div",{style:{fontFamily:ORB,fontSize:14,color:"#FF2060",letterSpacing:3,marginBottom:8}},"\u26a0 CLEAR MAP"),React.createElement("div",{style:{fontFamily:MONO,fontSize:10,color:"#aaa",marginBottom:20,letterSpacing:1}},"This will wipe all hex data. Are you sure?"),React.createElement("div",{style:{display:"flex",gap:12,justifyContent:"center"}},React.createElement("button",{onClick:function(){onUpdate({});setConfirmClear(false);},style:{padding:"8px 20px",background:"#FF206033",border:"1px solid #FF2060",color:"#FF2060",borderRadius:4,cursor:"pointer",fontFamily:MONO,fontSize:10,letterSpacing:1}},"YES, WIPE IT"),React.createElement("button",{onClick:function(){setConfirmClear(false);},style:{padding:"8px 20px",background:"transparent",border:"1px solid "+B1,color:"#aaa",borderRadius:4,cursor:"pointer",fontFamily:MONO,fontSize:10,letterSpacing:1}},"CANCEL")))),React.createElement("svg",{ref:svgRef'

if old2 in code:
    code = code.replace(old2, new2, 1)
    print("PATCH 2 applied")
else:
    print("PATCH 2 FAILED")

with open(path, "w") as f:
    f.write(code)

print("Done! CLEAR MAP count:", code.count("CLEAR MAP"))
