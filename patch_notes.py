f=open('src/App.jsx','r',encoding='utf-8')
s=f.read()
f.close()
orig=s

# Fix 1: Pass acquired array into runStats
t1='exitReason:reason,hackerName:hacker.label});'
r1='exitReason:reason,hackerName:hacker.label,acquired:cyberSess.acquired||[]});'
if t1 in s: s=s.replace(t1,r1,1); print('Fix1 OK')
else: print('Fix1 FAIL')

# Fix 2: Record acquisitions on cyberSess
t2='if(onNetrunMemory)onNetrunMemory(_aMsg);}});}'
r2='if(onNetrunMemory)onNetrunMemory(_aMsg);if(setCyberSess)setCyberSess(function(prev){return prev?Object.assign({},prev,{acquired:(prev.acquired||[]).concat([{name:item.trim(),type:(_aInfo&&_aInfo.type)||"ITEM"}])}):prev;});}});}'
if t2 in s: s=s.replace(t2,r2,1); print('Fix2 OK')
else: print('Fix2 FAIL')

# Fix 3: Scroll height
t3='calc(100vh / 1.3225 - 640px)'
r3='calc(100vh / 1.3225 - 680px)'
if t3 in s: s=s.replace(t3,r3,1); print('Fix3 OK')
else: print('Fix3 FAIL')

# Fix 4: Clock maxed KICK sequence in CyberTerminal useEffect
t4="React.useEffect(function(){if(cyberSess&&cyberSess.active&&typeof cyberSess.clock===\"number\"&&cyberSess.clock>=12&&!runFailed){setRunFailed(true);}},[cyberSess]);"
r4="""React.useEffect(function(){
  if(cyberSess&&cyberSess.active&&typeof cyberSess.clock==="number"&&cyberSess.clock>=12&&!runFailed){
    setRunFailed(true);
    var kickLines=[
      {t:"err",s:""},
      {t:"err",s:"!! MEMORY CLOCK OVERFLOW"},
      {t:"err",s:"!! TRACE COMPLETE — SIGNAL LOCKED"},
      {t:"err",s:"!! NEUROVEIL COLLAPSE IMMINENT"},
      {t:"err",s:""},
      {t:"breach",s:"NEXUS: INTRUDER IDENTIFIED. INITIATING FORCED DISCONNECT."},
      {t:"breach",s:"KICK // BAN // PURGE"},
      {t:"err",s:""},
      {t:"oracle",s:"MABEL: pulling you out. now. don't fight it."},
    ];
    kickLines.forEach(function(ln,i){setTimeout(function(){setLogs(function(p){return p.concat([Object.assign({},ln,{id:Date.now()+i})]);});},i*180);});
  }
},[cyberSess,runFailed]);"""
if t4 in s: s=s.replace(t4,r4,1); print('Fix4 OK')
else: print('Fix4 FAIL')

if s!=orig:
    open('src/App.jsx','w',encoding='utf-8').write(s)
    print('Written.')
else: print('No changes.')
