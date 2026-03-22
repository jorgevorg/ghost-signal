import sys
FILE = "src/App.jsx"
with open(FILE, "r", encoding="utf-8") as f:
    src = f.read()
original = src

OLD1 = '  var hackerSelS=React.useState("vela"),setHackerSel=hackerSelS[1];var hackerSel=hackerSelS[0];\n  var hackerData={'
NEW1 = '  var hackerSelS=React.useState("vela"),setHackerSel=hackerSelS[1];var hackerSel=hackerSelS[0];\n  var runFailedS=React.useState(false),setRunFailed=runFailedS[1];var runFailed=runFailedS[0];\n  var wipeActiveS=React.useState(false),setWipeActive=wipeActiveS[1];var wipeActive=wipeActiveS[0];\n  var displayClockS=React.useState(0),setDisplayClock=displayClockS[1];var displayClock=displayClockS[0];\n  var prevActiveRef2=React.useRef(false);\n  var hackerData={'
if OLD1 in src:
    src = src.replace(OLD1, NEW1, 1)
    print("Fix 1 applied")
else:
    print("Fix 1 NOT FOUND")

OLD2 = 'function handleRunFail(){setRunFailed(false);if(typeof gs==="function"){gs(prev=>{if(!prev||!prev.cyberSess)return prev;return {...prev,cyberSess:{...prev.cyberSess,active:false}};});}}'
NEW2 = 'function handleRunFail(){setRunFailed(false);setCyberSess(null);}'
if OLD2 in src:
    src = src.replace(OLD2, NEW2, 1)
    print("Fix 2 applied")
else:
    print("Fix 2 NOT FOUND")

if src != original:
    with open(FILE, "w", encoding="utf-8") as f:
        f.write(src)
    print("Done. Now run: git add src/App.jsx && git commit -m 'fix: cybersphere crash' && git push")
else:
    print("No changes made.")
