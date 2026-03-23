import React, { useState, useEffect, useRef } from 'react';
import FactionIcon from './FactionIcon';

const CBG  = '#06080e';
const B1   = '#7a7aaa';
const B2   = '#555578';
const B3   = '#9090b8';
const ACC  = '#FF6B35';
const COLE = '#00FFD0';
const VELA = '#cc88ff';
const RED  = '#FF2060';
const YEL  = '#FFD166';
const MONO = "'Share Tech Mono', monospace";
const ORB  = "'Orbitron', sans-serif";
const RAJ  = "'Rajdhani', sans-serif";

const ENEMY_DB = {
  'Space Pirate':     { faction:'CORSAIR', hp:15, armor:1, vig:2, gra:2, min:1, tec:1, actions:1, difficulty:'Easy',   reward:20 },
  'Corsair Captain':  { faction:'CORSAIR', hp:25, armor:2, vig:3, gra:2, min:1, tec:2, actions:2, difficulty:'Medium', reward:40 },
  'Corsair Sniper':   { faction:'CORSAIR', hp:18, armor:1, vig:1, gra:3, min:1, tec:2, actions:1, difficulty:'Medium', reward:35 },
  'Corsair Bomber':   { faction:'CORSAIR', hp:20, armor:2, vig:3, gra:1, min:1, tec:1, actions:1, difficulty:'Easy',   reward:25 },
  'ISF Trooper':      { faction:'ISF',     hp:20, armor:2, vig:2, gra:2, min:2, tec:2, actions:1, difficulty:'Easy',   reward:25 },
  'ISF Commander':    { faction:'ISF',     hp:35, armor:3, vig:3, gra:2, min:3, tec:2, actions:2, difficulty:'Hard',   reward:60 },
  'ISF Hacker':       { faction:'ISF',     hp:15, armor:1, vig:1, gra:2, min:4, tec:3, actions:1, difficulty:'Medium', reward:40 },
  'ISF Mech':         { faction:'ISF',     hp:45, armor:4, vig:4, gra:1, min:1, tec:3, actions:2, difficulty:'Hard',   reward:80, isBoss:true },
  'Warg Soldier':     { faction:'WARG',    hp:22, armor:2, vig:3, gra:2, min:1, tec:1, actions:1, difficulty:'Easy',   reward:25 },
  'Warg Elite':       { faction:'WARG',    hp:30, armor:3, vig:4, gra:2, min:1, tec:2, actions:2, difficulty:'Medium', reward:45 },
  'Warg Berserker':   { faction:'WARG',    hp:28, armor:1, vig:4, gra:3, min:1, tec:1, actions:2, difficulty:'Medium', reward:40 },
  'Warg Commander':   { faction:'WARG',    hp:50, armor:4, vig:5, gra:2, min:2, tec:2, actions:3, difficulty:'Boss',   reward:100, isBoss:true },
  'Medusa Drone':     { faction:'MEDUSA',  hp:12, armor:0, vig:1, gra:3, min:2, tec:3, actions:1, difficulty:'Easy',   reward:20 },
  'Medusa Agent':     { faction:'MEDUSA',  hp:20, armor:1, vig:2, gra:3, min:3, tec:3, actions:1, difficulty:'Medium', reward:45 },
  'Medusa Handler':   { faction:'MEDUSA',  hp:30, armor:2, vig:2, gra:2, min:4, tec:4, actions:2, difficulty:'Hard',   reward:70 },
  'Medusa Prime':     { faction:'MEDUSA',  hp:55, armor:3, vig:3, gra:3, min:5, tec:4, actions:3, difficulty:'Boss',   reward:120, isBoss:true },
  'Synth Unit':       { faction:'SYNTH',   hp:18, armor:2, vig:2, gra:2, min:2, tec:3, actions:1, difficulty:'Easy',   reward:25 },
  'Synth Overseer':   { faction:'SYNTH',   hp:28, armor:3, vig:2, gra:2, min:3, tec:4, actions:2, difficulty:'Medium', reward:50 },
  'Synth Juggernaut': { faction:'SYNTH',   hp:40, armor:4, vig:3, gra:1, min:2, tec:5, actions:2, difficulty:'Hard',   reward:85 },
  'Synth God':        { faction:'SYNTH',   hp:60, armor:4, vig:4, gra:2, min:5, tec:5, actions:3, difficulty:'Boss',   reward:150, isBoss:true },
  'Looter':           { faction:'NONE',    hp:12, armor:0, vig:1, gra:2, min:1, tec:1, actions:1, difficulty:'Easy',   reward:15 },
  'Mercenary':        { faction:'NONE',    hp:20, armor:2, vig:2, gra:2, min:2, tec:2, actions:1, difficulty:'Medium', reward:35 },
  'Assassin':         { faction:'NONE',    hp:22, armor:1, vig:2, gra:4, min:2, tec:2, actions:2, difficulty:'Medium', reward:50 },
  'Crime Boss':       { faction:'NONE',    hp:40, armor:3, vig:3, gra:3, min:3, tec:2, actions:2, difficulty:'Boss',   reward:90, isBoss:true },
};

const FACTION_COLORS = { MEDUSA:'#cc88ff', ISF:'#00BFFF', WARG:'#FF2060', CORSAIR:'#FFD166', SYNTH:'#00FFD0', NONE:'#9090b8' };
const DIFFICULTY_COLORS = { Easy:'#00FFD0', Medium:'#FFD166', Hard:'#FF6B35', Boss:'#FF2060' };
const COND_META = {
  overheat:{ label:'OVERHEAT', icon:'🔥', color:'#FF6B35' },
  shock:   { label:'SHOCK',    icon:'⚡', color:'#FFD166' },
  silence: { label:'SILENCE',  icon:'🔇', color:'#9090b8' },
  breach:  { label:'BREACH',   icon:'💀', color:'#cc2222' },
  stun:    { label:'STUN',     icon:'😵', color:'#cc88ff' },
};
const HACKS = [
  { id:'trojan',    name:'HACK_Trojan',    cost:2, dmg:null,  stat:null,  effect:'Next attack ignores armor. MIN vs MIN.' },
  { id:'javelin',   name:'HACK_Javelin',   cost:3, dmg:'d6',  stat:'min', effect:'d6+MIN shock dmg. Applies Shock 2 turns.' },
  { id:'blackout',  name:'HACK_Blackout',  cost:3, dmg:null,  stat:null,  effect:'Target Silenced 3 turns, −1 action/turn.' },
  { id:'frostbyte', name:'HACK_Frostbyte', cost:4, dmg:null,  stat:null,  effect:'Stun 1 turn. Armor set to 0 while stunned.' },
  { id:'overload',  name:'HACK_Overload',  cost:4, dmg:'d8',  stat:'min', effect:'d8+MIN fire dmg. Overheat 2 turns.' },
  { id:'phantom',   name:'HACK_Phantom',   cost:2, dmg:null,  stat:null,  effect:'Vela untargetable next turn. Self only.' },
  { id:'leech',     name:'HACK_Leech',     cost:3, dmg:null,  stat:null,  effect:'Drain 2 EN from target, heal 2 EN self.' },
  { id:'shatter',   name:'HACK_Shatter',   cost:5, dmg:'d10', stat:'min', effect:'d10+MIN mind dmg. Target loses side action.' },
  { id:'cascade',   name:'HACK_Cascade',   cost:6, dmg:'d6',  stat:'min', effect:'Chain to 2 enemies: d6 each, Shock 1 turn.' },
  { id:'godmode',   name:'HACK_GodMode',   cost:8, dmg:null,  stat:null,  effect:'1/combat. All hacks free cost next turn.' },
];
const CONSUMABLES = [
  { id:'health_pack', name:'Health Pack',      effect:'+8 HP',               hp:8, en:0, clears:false },
  { id:'energy_cell', name:'Energy Cell',       effect:'+8 EN',               hp:0, en:8, clears:false },
  { id:'narc_alpha',  name:'Narcobiotic Alpha', effect:'+4 HP +2 EN',         hp:4, en:2, clears:false },
  { id:'tricillin',   name:'Tricillin',         effect:'Clear all conditions', hp:0, en:0, clears:true  },
  { id:'stim',        name:'Stim Pack',         effect:'+5 HP +3 EN',         hp:5, en:3, clears:false },
];
const COLE_DEFAULT = {
  id:'cole', name:'Cole Remington Vayne', type:'player', color:COLE,
  hp:20, maxHp:20, en:20, maxEn:20, armor:0,
  vig:3, gra:3, min:1, tec:1, actions:1, actionsUsed:0, sideUsed:false,
  weapon:'Laser Blaster', wDmg:'d8', wStat:'vig',
  conditions:[], isDefeated:false, initiative:0,
};
const VELA_DEFAULT = {
  id:'vela', name:'Vela // Séance', type:'player', color:VELA,
  hp:18, maxHp:18, en:20, maxEn:20, armor:0,
  vig:1, gra:2, min:4, tec:3, actions:1, actionsUsed:0, sideUsed:false,
  weapon:'Hack Array', wDmg:'d6', wStat:'min',
  ghostEn:0, maxGhostEn:10,
  conditions:[], isDefeated:false, initiative:0,
};
const roll  = n => Math.floor(Math.random() * n) + 1;
const rollF = f => { const m = f && f.match(/d(\d+)/); return m ? roll(parseInt(m[1])) : 0; };

function Corner({ pos, color }) {
  color = color || ACC;
  const s = { position:'absolute', width:14, height:14, borderStyle:'solid', borderColor:color, borderWidth:0 };
  if (pos==='tl') { s.top=6; s.left=6;   s.borderTopWidth=2; s.borderLeftWidth=2; }
  if (pos==='tr') { s.top=6; s.right=6;  s.borderTopWidth=2; s.borderRightWidth=2; }
  if (pos==='bl') { s.bottom=6; s.left=6;  s.borderBottomWidth=2; s.borderLeftWidth=2; }
  if (pos==='br') { s.bottom=6; s.right=6; s.borderBottomWidth=2; s.borderRightWidth=2; }
  return <div style={s} />;
}

function HpBar({ cur, max, color }) {
  const pct = Math.max(0, Math.min(1, cur / max));
  const c = pct > 0.5 ? (color || '#00FF88') : pct > 0.25 ? YEL : RED;
  return (
    <div style={{ background:'#1a1a2e', borderRadius:2, height:6, overflow:'hidden' }}>
      <div style={{ width:(pct*100)+'%', height:'100%', background:c, transition:'width 0.3s', borderRadius:2 }} />
    </div>
  );
}

function CondPill({ cond }) {
  const m = COND_META[cond.type] || {};
  return (
    <span style={{ fontSize:8, fontFamily:MONO, color:m.color, background:m.color+'22',
      border:'1px solid '+m.color+'55', borderRadius:3, padding:'1px 5px', marginRight:3 }}>
      {m.icon} {m.label} {cond.duration}
    </span>
  );
}

function ActionDots({ used, total, color }) {
  return (
    <div style={{ display:'flex', gap:3, alignItems:'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width:8, height:8, borderRadius:'50%',
          background: i < (total - used) ? color : B2+'44',
          border:'1px solid '+color+'66',
          transition:'background 0.2s',
        }} />
      ))}
    </div>
  );
}

export default function CombatTracker() {
  const [phase,       setPhase]       = useState('setup');
  const [selected,    setSelected]    = useState([]);
  const [search,      setSearch]      = useState('');
  const [cmbs,        setCmbs]        = useState([]);
  const [tidx,        setTidx]        = useState(0);
  const [round,       setRound]       = useState(1);
  const [log,         setLog]         = useState([]);
  const [showHacks,   setShowHacks]   = useState(false);
  const [showItems,   setShowItems]   = useState(false);
  const [hackTgt,     setHackTgt]     = useState(null);
  const [itemUser,    setItemUser]    = useState(null);
  const [loot,        setLoot]        = useState(null);
  const [manualDmg,   setManualDmg]   = useState('');
  const [manualTgt,   setManualTgt]   = useState(null);
  const [showManual,  setShowManual]  = useState(false);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const addLog = (msg, color) => setLog(p => [...p, { msg, color: color || B1, id: Date.now() + Math.random() }]);

  const toggleEnemy = name => setSelected(p =>
    p.includes(name) ? p.filter(e => e !== name) : p.length < 6 ? [...p, name] : p
  );

  const startCombat = () => {
    if (!selected.length) return;
    const cole = { ...COLE_DEFAULT, initiative: roll(10) + COLE_DEFAULT.gra };
    const vela = { ...VELA_DEFAULT, initiative: roll(10) + VELA_DEFAULT.gra };
    const enemies = selected.map((name, i) => {
      const b = ENEMY_DB[name];
      return {
        id:'e'+i+'_'+name.replace(/\s/g,'_'), name, type:'enemy',
        color: FACTION_COLORS[b.faction] || B1,
        hp: b.hp+5, maxHp: b.hp+5, en:10, maxEn:10,
        armor:b.armor, vig:b.vig||1, gra:b.gra||1, min:b.min||1, tec:b.tec||1,
        actions: b.isBoss ? b.actions+1 : b.actions,
        actionsUsed:0, sideUsed:false,
        weapon:'Attack', wDmg:'d6', wStat:'vig',
        faction:b.faction, difficulty:b.difficulty, isBoss:!!b.isBoss, reward:b.reward,
        conditions:[], isDefeated:false, initiative: roll(10)+(b.gra||1),
      };
    });
    const all = [cole, vela, ...enemies].sort((a, b) => {
      if (b.initiative !== a.initiative) return b.initiative - a.initiative;
      if (a.type==='player' && b.type!=='player') return -1;
      if (b.type==='player' && a.type!=='player') return 1;
      return b.vig - a.vig;
    });
    addLog('━━━ COMBAT START · '+enemies.length+' HOSTILE'+(enemies.length>1?'S':'')+' · ROUND 1 ━━━', ACC);
    all.forEach(c => addLog('  '+c.name+' — initiative '+c.initiative, c.color));
    setCmbs(all); setRound(1); setTidx(0); setPhase('active');
    doStartOfTurn(all, 0, 1);
  };

  const applyDmg = (arr, targetId, amount, source) => {
    return arr.map(c => {
      if (c.id !== targetId) return c;
      const stunned = c.conditions.some(x => x.type==='stun');
      const eff = stunned ? 0 : c.armor;
      const actual = Math.max(0, amount - eff);
      const hp = Math.max(0, c.hp - actual);
      const dead = hp === 0;
      addLog('[R'+round+'] '+( source||'?' )+' → '+c.name+': '+actual+' dmg'+(eff?' (arm '+eff+'(':'')+' · '+hp+'/'+c.maxHp+' HP'+(dead?' 💀':''), dead?RED:B1);
      return { ...c, hp, isDefeated: dead };
    });
  };

  const applyHeal = (arr, targetId, hp, en) => {
    return arr.map(c => {
      if (c.id !== targetId) return c;
      const newHp = Math.min(c.maxHp, c.hp + (hp||0));
      const newEn = Math.min(c.maxEn, c.en + (en||0));
      if (hp) addLog('[R'+round+'] '+c.name+': +'+hp+' HP → '+newHp+'/'+c.maxHp, COLE);
      if (en) addLog('[R'+round+'] '+c.name+': +'+en+' EN → '+newEn+'/'+c.maxEn, VELA);
      return { ...c, hp:newHp, en:newEn };
    });
  };

  const applyCondition = (arr, targetId, type, duration) => {
    const m = COND_META[type];
    const tgt = arr.find(c=>c.id===targetId);
    addLog('  '+(tgt?.name||targetId)+': '+m.icon+' '+type.toUpperCase()+' ('+duration+' turns)', m.color);
    return arr.map(c => c.id!==targetId ? c : {
      ...c, conditions:[...c.conditions.filter(x=>x.type!==type), { type, duration }]
    });
  };

  const doStartOfTurn = (arr, idx, rnd) => {
    const c = arr[idx];
    if (!c || c.isDefeated) return arr;
    let next = [...arr];
    let tgt = { ...c };
    c.conditions.forEach(cond => {
      if (cond.type==='overheat') {
        const d = roll(6);
        tgt.hp = Math.max(0, tgt.hp - d);
        if (tgt.hp===0) tgt.isDefeated = true;
        addLog('[R'+rnd+' '+c.name+'] 🔥 OVERHEAT: '+d+' dmg (ignores armor)', '#FF6B35');
      }
      if (cond.type==='shock') {
        const r = roll(6);
        if (r===1) { tgt.actionsUsed = tgt.actions; addLog('[R'+rnd+' '+c.name+'] ⚡ SHOCK: turn skipped (rolled 1)', YEL); }
        else addLog('[R'+rnd+' '+c.name+'] ⚡ SHOCK: resisted (rolled '+r+')', YEL);
      }
    });
    next[idx] = tgt;
    return next;
  };

  const checkEnd = arr => {
    if (arr.filter(c=>c.type==='enemy').every(e=>e.isDefeated)) {
      const base = arr.filter(c=>c.type==='enemy').reduce((s,e)=>s+(ENEMY_DB[e.name]?.reward||20),0);
      const bonus = roll(10)*5;
      setLoot({ base, bonus, total: base+bonus });
      addLog('🏆 VICTORY! All hostiles eliminated.', ACC);
      setTimeout(()=>setPhase('victory'), 700);
    }
    if (arr.filter(c=>c.type==='player').every(p=>p.isDefeated)) {
      addLog('💀 DEFEAT. Both operatives down.', RED);
      setTimeout(()=>setPhase('defeat'), 700);
    }
  };

  const doAttack = (atkId, tgtId) => {
    setCmbs(prev => {
      const atk = prev.find(c=>c.id===atkId);
      if (!atk || atk.actionsUsed>=atk.actions) return prev;
      const stat = atk.wStat==='min' ? atk.min : atk.vig;
      const dmgRoll = rollF(atk.wDmg);
      const dmg = dmgRoll + stat;
      addLog('[R'+round+'] '+atk.name+' ('+atk.weapon+'): rolled '+dmgRoll+'+'+stat+'='+dmg, atk.color);
      let next = applyDmg(prev, tgtId, dmg, atk.name);
      next = next.map(c=>c.id===atkId?{...c, actionsUsed:c.actionsUsed+1}:c);
      checkEnd(next);
      return next;
    });
  };

  // Enemy attacks a player — called from enemy action panel
  const doEnemyAttack = (enemyId, playerId) => {
    setCmbs(prev => {
      const enemy = prev.find(c=>c.id===enemyId);
      if (!enemy || enemy.actionsUsed >= enemy.actions) return prev;
      const dmgRoll = rollF(enemy.wDmg||'d6');
      const dmg = dmgRoll + (enemy.vig||1);
      addLog('[R'+round+'] '+enemy.name+' ATTACKS: rolled '+dmgRoll+'+'+(enemy.vig||1)+'='+dmg, enemy.color);
      let next = applyDmg(prev, playerId, dmg, enemy.name);
      next = next.map(c=>c.id===enemyId?{...c, actionsUsed:c.actionsUsed+1}:c);
      checkEnd(next);
      return next;
    });
  };

  const doManualDmg = (targetId, amount) => {
    const parsed = parseInt(amount);
    if (isNaN(parsed) || parsed <= 0) return;
    setCmbs(prev => {
      const next = applyDmg(prev, targetId, parsed, 'Manual');
      checkEnd(next);
      return next;
    });
    setManualDmg(''); setManualTgt(null); setShowManual(false);
  };

  const doHack = (hackId, tgtId) => {
    const hack = HACKS.find(h=>h.id===hackId);
    setCmbs(prev => {
      const vela = prev.find(c=>c.id==='vela');
      if (!vela||vela.en<hack.cost) { addLog('Vela: not enough EN for '+hack.name, RED); return prev; }
      let next = prev.map(c=>c.id==='vela'?{...c,en:c.en-hack.cost,actionsUsed:c.actionsUsed+1}:c);
      addLog('[R'+round+'] Vela: '+hack.name+' (−'+hack.cost+' EN)', VELA);
      const atkRoll = roll(10)+vela.min;
      const tgt = next.find(c=>c.id===tgtId);
      const defRoll = tgt ? roll(10)+(tgt.min||1) : 0;
      const hit = !tgtId || atkRoll >= defRoll;
      addLog('  Roll: '+atkRoll+' vs '+defRoll+' — '+(hit?'HIT':'MISS'), hit?VELA:RED);
      if (hit) {
        if (hack.dmg&&tgtId) {
          const d = rollF(hack.dmg)+(hack.stat==='min'?vela.min:vela.vig);
          next = applyDmg(next, tgtId, d, hack.name);
        }
        if (hack.id==='javelin'&&tgtId)   next = applyCondition(next,tgtId,'shock',2);
        if (hack.id==='blackout'&&tgtId)  next = applyCondition(next,tgtId,'silence',3);
        if (hack.id==='frostbyte'&&tgtId) next = applyCondition(next,tgtId,'stun',1);
        if (hack.id==='overload'&&tgtId)  next = applyCondition(next,tgtId,'overheat',2);
        if (hack.id==='leech'&&tgtId) {
          next = next.map(c=>c.id===tgtId?{...c,en:Math.max(0,c.en-2)}:c);
          next = next.map(c=>c.id==='vela'?{...c,en:Math.min(c.maxEn,c.en+2)}:c);
        }
      } else {
        const mal = roll(10);
        const sev = mal<=3?'BREACH — d4 dmg':mal<=6?'DATA LOSS — −2 EN':'contained';
        addLog('  Malware: '+mal+' — '+sev, RED);
        if (mal<=3) next = applyDmg(next,'vela',roll(4),'Malware');
        else if (mal<=6) next = next.map(c=>c.id==='vela'?{...c,en:Math.max(0,c.en-2)}:c);
      }
      checkEnd(next);
      return next;
    });
    setShowHacks(false); setHackTgt(null);
  };

  const doItem = (cons, uid) => {
    setCmbs(prev => {
      let next = applyHeal(prev, uid, cons.hp, cons.en);
      if (cons.clears) {
        next = next.map(c=>c.id===uid?{...c,conditions:[]}:c);
        addLog('[R'+round+'] '+prev.find(c=>c.id===uid)?.name+': conditions cleared', COLE);
      }
      addLog('[R'+round+'] '+prev.find(c=>c.id===uid)?.name+': used '+cons.name, YEL);
      return next.map(c=>c.id===uid?{...c,sideUsed:true}:c);
    });
    setShowItems(false); setItemUser(null);
  };

  const endTurn = () => {
    const active = cmbs[tidx];
    if (!active) return;
    addLog('[R'+round+'] '+active.name+': END TURN ──', B2);
    let next = cmbs.map((c,i)=>i===tidx?{...c,actionsUsed:0,sideUsed:false}:c);
    let nidx = (tidx+1)%next.length;
    let laps = 0;
    while (next[nidx]?.isDefeated && laps < next.length) { nidx=(nidx+1)%next.length; laps++; }
    let nr = round;
    if (nidx <= tidx) {
      nr = round+1; setRound(nr);
      addLog('━━━━━━━━━━ ROUND '+nr+' BEGIN ━━━━━━━━━━', ACC);
      next = next.map(c=>({
        ...c, conditions: c.conditions.map(x=>({...x,duration:x.duration-1})).filter(x=>x.duration>0)
      }));
    }
    next = doStartOfTurn(next, nidx, nr);
    checkEnd(next);
    setCmbs(next); setTidx(nidx);
  };

  const resetCombat = () => {
    setPhase('setup'); setSelected([]); setCmbs([]); setRound(1); setTidx(0);
    setLog([]); setLoot(null); setManualDmg(''); setManualTgt(null); setShowManual(false);
  };

  const Btn = (color, sm, disabled) => ({
    fontFamily:MONO, fontSize:sm?9:10, padding:sm?'3px 8px':'6px 14px',
    background:'transparent', color:disabled?B2:color,
    border:'1px solid '+(disabled?B2+'33':color+'66'), borderRadius:2,
    cursor:disabled?'default':'pointer', letterSpacing:1, whiteSpace:'nowrap',
  });

  const wrapStyle = {
    position:'relative', background:CBG, minHeight:'100%', fontFamily:MONO, color:B1,
    backgroundImage:
      'repeating-linear-gradient(0deg,transparent,transparent 39px,'+ACC+'0d 39px,'+ACC+'0d 40px),'+
      'repeating-linear-gradient(90deg,transparent,transparent 39px,'+ACC+'0d 39px,'+ACC+'0d 40px)',
  };

  // ══════════════════════════════════════════════════════
  // SETUP
  // ══════════════════════════════════════════════════════
  if (phase==='setup') {
    const filtered = Object.entries(ENEMY_DB).filter(([n])=>n.toLowerCase().includes(search.toLowerCase()));
    const byFaction = {};
    filtered.forEach(([name,data])=>{ const f=data.faction; if(!byFaction[f])byFaction[f]=[]; byFaction[f].push({name,data}); });
    return (
      <div style={wrapStyle}>
        <div style={{ position:'relative', zIndex:2, padding:16 }}>
          <Corner pos="tl"/><Corner pos="tr"/><Corner pos="bl"/><Corner pos="br"/>
          <div style={{ textAlign:'center', marginBottom:20 }}>
            <div style={{ fontFamily:ORB, fontSize:18, color:ACC, letterSpacing:5 }}>⚔ COMBAT SETUP</div>
            <div style={{ fontSize:10, color:B2, marginTop:4 }}>SELECT ENEMIES (MAX 6) · CO-OP +5 HP AUTO-APPLIED · BOSSES +1 ACTION</div>
          </div>

          {selected.length > 0 && (
            <div style={{ background:ACC+'0f', border:'1px solid '+ACC+'44', borderRadius:3, padding:10, marginBottom:14 }}>
              <div style={{ fontFamily:ORB, fontSize:9, color:ACC, letterSpacing:2, marginBottom:6 }}>
                SELECTED ({selected.length}/6)
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                {selected.map(n => (
                  <span key={n} onClick={()=>toggleEnemy(n)} style={{
                    cursor:'pointer', fontSize:10, color:CBG, background:ACC, borderRadius:2, padding:'3px 8px',
                  }}>{n} ✕</span>
                ))}
              </div>
            </div>
          )}

          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="FILTER ENEMIES..."
            style={{ width:'100%', background:'#0d0d1a', border:'1px solid '+B3+'33', color:B1,
              fontFamily:MONO, fontSize:10, padding:'8px 12px', borderRadius:2, marginBottom:16, boxSizing:'border-box' }}/>

          {Object.entries(byFaction).map(([faction, entries]) => (
            <div key={faction} style={{ marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8,
                borderBottom:'1px solid '+(FACTION_COLORS[faction]||B2)+'33', paddingBottom:5 }}>
                {faction !== 'NONE' && <FactionIcon faction={faction} size={18} />}
                <span style={{ fontFamily:ORB, fontSize:8, letterSpacing:4, color:FACTION_COLORS[faction]||B2 }}>
                  {faction==='NONE'?'INDEPENDENT':faction}
                </span>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {entries.map(({name,data}) => {
                  const sel = selected.includes(name);
                  return (
                    <button key={name} onClick={()=>toggleEnemy(name)} style={{
                      fontFamily:MONO, fontSize:10, padding:'6px 12px', cursor:'pointer', borderRadius:2,
                      background:sel?ACC+'1a':'#0d0d1a', color:sel?ACC:B1,
                      border:'1px solid '+(sel?ACC:B3+'22'),
                    }}>
                      <span style={{ color:DIFFICULTY_COLORS[data.difficulty]||B2, marginRight:5 }}>●</span>
                      {name}
                      <span style={{ color:B2, fontSize:9, marginLeft:6 }}>HP {data.hp+5}</span>
                      {data.isBoss && <span style={{ color:RED, fontSize:8, marginLeft:4 }}>BOSS</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <button onClick={startCombat} disabled={!selected.length} style={{
            width:'100%', marginTop:16, padding:'13px 0', fontFamily:ORB, fontSize:14, letterSpacing:5,
            background:selected.length?ACC:B2+'22', color:selected.length?CBG:B2, border:'none', borderRadius:2,
            cursor:selected.length?'pointer':'default',
          }}>⚔ INITIATE COMBAT</button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // VICTORY / DEFEAT
  // ══════════════════════════════════════════════════════
  if (phase==='victory') return (
    <div style={{ ...wrapStyle, display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div style={{ textAlign:'center', padding:40, position:'relative' }}>
        <Corner pos="tl" color={ACC}/><Corner pos="tr" color={ACC}/>
        <Corner pos="bl" color={ACC}/><Corner pos="br" color={ACC}/>
        <div style={{ fontFamily:ORB, fontSize:28, color:ACC, letterSpacing:7, marginBottom:8 }}>VICTORY</div>
        <div style={{ color:B1, fontFamily:MONO, marginBottom:20 }}>ALL HOSTILES ELIMINATED · ROUND {round}</div>
        {loot && (
          <div style={{ background:ACC+'11', border:'1px solid '+ACC+'44', borderRadius:4, padding:20, marginBottom:24 }}>
            <div style={{ fontFamily:ORB, fontSize:10, color:ACC, letterSpacing:2, marginBottom:8 }}>LOOT ROLL</div>
            <div style={{ color:YEL, fontSize:26, fontFamily:ORB }}>+{loot.total}〒</div>
            <div style={{ color:B2, fontSize:9, marginTop:4 }}>{loot.base}〒 base · {loot.bonus}〒 bonus</div>
          </div>
        )}
        <button onClick={resetCombat} style={Btn(ACC,false,false)}>DEBRIEF</button>
      </div>
    </div>
  );

  if (phase==='defeat') return (
    <div style={{ ...wrapStyle, display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div style={{ textAlign:'center', padding:40, position:'relative' }}>
        <Corner pos="tl" color={RED}/><Corner pos="tr" color={RED}/>
        <Corner pos="bl" color={RED}/><Corner pos="br" color={RED}/>
        <div style={{ fontFamily:ORB, fontSize:28, color:RED, letterSpacing:7, marginBottom:8 }}>DEFEATED</div>
        <div style={{ color:B1, fontFamily:MONO, marginBottom:20 }}>OPERATIVES DOWN · ROUND {round}</div>
        <div style={{ background:RED+'11', border:'1px solid '+RED+'44', borderRadius:4, padding:16, marginBottom:24, textAlign:'left' }}>
          <div style={{ fontFamily:ORB, fontSize:10, color:RED, letterSpacing:2, marginBottom:6 }}>⚠ ABYSSAL SCAR</div>
          <div style={{ fontSize:10, color:B1 }}>Roll d10 for each operative who hit 0 HP.</div>
          <div style={{ fontSize:9, color:B2, marginTop:6, lineHeight:1.6 }}>
            <span style={{ color:'#FF6B35' }}>1–3</span> Permanent scar &nbsp;
            <span style={{ color:YEL }}>4–7</span> Trauma &nbsp;
            <span style={{ color:COLE }}>8–10</span> Survived
          </div>
        </div>
        <button onClick={resetCombat} style={Btn(RED,false,false)}>RETREAT</button>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════
  // ACTIVE COMBAT
  // ══════════════════════════════════════════════════════
  const players     = cmbs.filter(c => c.type==='player');
  const liveEnemies = cmbs.filter(c => c.type==='enemy' && !c.isDefeated);
  const deadEnemies = cmbs.filter(c => c.type==='enemy' && c.isDefeated);
  const activeCmb   = cmbs[tidx];
  const vela        = cmbs.find(c => c.id==='vela');
  const isEnemyTurn = activeCmb?.type === 'enemy';
  const isActive    = id => cmbs[tidx]?.id===id && !cmbs[tidx]?.isDefeated;
  const actsLeft    = c => (c.actions||1) - (c.actionsUsed||0);

  const cardStyle = (c, isActiveCard) => ({
    position:'relative', background: isActiveCard ? '#0d0d1a' : '#08090f',
    borderRadius:4, padding:10, marginBottom:8,
    border:'1px solid '+(isActiveCard ? c.color : B3+'18'),
    boxShadow: isActiveCard ? '0 0 18px '+c.color+'2a, inset 0 0 8px '+c.color+'08' : 'none',
    opacity: c.isDefeated ? 0.25 : 1,
    transition:'border-color 0.25s, box-shadow 0.25s, opacity 0.25s',
  });

  return (
    <div style={wrapStyle}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
        @keyframes scanline{from{transform:translateY(-100%)}to{transform:translateY(100vh)}}
        @keyframes enemyGlow{0%,100%{box-shadow:0 0 18px ${RED}33}50%{box-shadow:0 0 30px ${RED}55}}
      `}</style>

      {/* Scanline */}
      <div style={{ position:'fixed', top:0, left:0, right:0, height:'2px', pointerEvents:'none', zIndex:10,
        background:'linear-gradient(transparent,'+ACC+'44,transparent)', animation:'scanline 5s linear infinite' }}/>

      <div style={{ position:'relative', zIndex:2, padding:14 }}>
        <Corner pos="tl"/><Corner pos="tr"/>

        {/* ── HEADER ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontFamily:ORB, fontSize:14, color:ACC, letterSpacing:3 }}>⚔</span>
            <span style={{ fontFamily:ORB, fontSize:11, color:ACC, letterSpacing:3 }}>COMBAT</span>
            <span style={{ fontFamily:MONO, fontSize:10, color:B2, borderLeft:'1px solid '+B2+'44', paddingLeft:10 }}>
              ROUND {round}
            </span>
            {activeCmb && (
              <span style={{ fontFamily:MONO, fontSize:10, color:activeCmb.color, animation:'pulse 1.2s infinite', marginLeft:4 }}>
                ◆ {activeCmb.name.split(' ')[0].toUpperCase()}
              </span>
            )}
          </div>
          <div style={{ display:'flex', gap:6 }}>
            <button onClick={endTurn} style={Btn(ACC,false,false)}>END TURN →</button>
            <button onClick={()=>setShowManual(true)} style={Btn(B3,true,false)}>± DMG</button>
            <button onClick={resetCombat} style={Btn(B2,true,false)}>ABORT</button>
          </div>
        </div>

        {/* ── INITIATIVE STRIP ── */}
        <div style={{ display:'flex', gap:4, overflowX:'auto', marginBottom:12,
          padding:'8px 6px', background:'#08090f', borderRadius:3,
          border:'1px solid '+B3+'18', scrollbarWidth:'thin' }}>
          {cmbs.map((c,i) => (
            <div key={c.id} style={{
              minWidth:52, flexShrink:0, padding:'5px 4px', borderRadius:2, textAlign:'center',
              background: i===tidx ? c.color+'18' : 'transparent',
              border:'1px solid '+(i===tidx ? c.color : B3+'18'),
              opacity: c.isDefeated ? 0.15 : 1,
              transition:'all 0.2s',
            }}>
              <div style={{ fontSize:8, fontFamily:MONO, color:i===tidx?c.color:B2,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {c.name.split(' ')[0].slice(0,7)}
              </div>
              <div style={{ fontSize:11, fontFamily:ORB, color:i===tidx?c.color:B3, fontWeight:700 }}>
                {c.initiative}
              </div>
              <div style={{ display:'flex', justifyContent:'center', gap:2, marginTop:2 }}>
                {Array.from({length:c.actions}).map((_,j)=>(
                  <div key={j} style={{ width:4, height:4, borderRadius:'50%',
                    background: j < actsLeft(c) ? c.color : B2+'44' }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── ENEMY ACTING PANEL ── */}
        {isEnemyTurn && activeCmb && !activeCmb.isDefeated && (
          <div style={{ background:RED+'0a', border:'1px solid '+RED+'66', borderRadius:4,
            padding:12, marginBottom:12, position:'relative', animation:'enemyGlow 2s ease-in-out infinite' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <FactionIcon faction={activeCmb.faction||'NONE'} size={28} />
              <div>
                <div style={{ fontFamily:ORB, fontSize:11, color:RED, letterSpacing:3 }}>⚠ HOSTILE ACTING</div>
                <div style={{ fontFamily:RAJ, fontSize:14, color:activeCmb.color, fontWeight:700 }}>
                  {activeCmb.name}
                </div>
              </div>
              <div style={{ marginLeft:'auto', textAlign:'right' }}>
                <div style={{ fontSize:9, color:B2 }}>ACTIONS</div>
                <ActionDots used={activeCmb.actionsUsed} total={activeCmb.actions} color={RED} />
              </div>
            </div>
            <div style={{ fontSize:9, color:B2, marginBottom:8 }}>
              Weapon: d{activeCmb.wDmg?.match(/\d+/)?.[0]||6}+VIG({activeCmb.vig}) · Armor: {activeCmb.armor}
            </div>
            {activeCmb.conditions.length > 0 && (
              <div style={{ marginBottom:8 }}>
                {activeCmb.conditions.map((x,i)=><CondPill key={i} cond={x}/>)}
              </div>
            )}
            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
              {players.filter(p=>!p.isDefeated).map(p => (
                <button key={p.id} onClick={()=>doEnemyAttack(activeCmb.id,p.id)}
                  disabled={actsLeft(activeCmb)===0}
                  style={{ ...Btn(actsLeft(activeCmb)===0?B2:RED,false,actsLeft(activeCmb)===0), fontSize:11 }}>
                  ⚔ ATK {p.name.split(' ')[0]}
                </button>
              ))}
              {['overheat','shock','stun'].map(t=>(
                <button key={t} onClick={()=>setCmbs(p=>applyCondition(p,activeCmb.id,t,2))}
                  style={Btn(COND_META[t].color,true,false)}>
                  {COND_META[t].icon} {t.slice(0,3).toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── MAIN GRID ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>

          {/* LEFT: OPERATIVES */}
          <div>
            <div style={{ fontFamily:ORB, fontSize:9, color:COLE, letterSpacing:3, marginBottom:8 }}>OPERATIVES</div>

            {players.map(c => {
              const active = isActive(c.id);
              return (
                <div key={c.id} style={cardStyle(c, active)}>
                  {active && <Corner pos="tl" color={c.color}/>}

                  {/* Header */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:7 }}>
                    <span style={{ fontFamily:RAJ, fontSize:13, color:c.color, fontWeight:700 }}>{c.name}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <ActionDots used={c.actionsUsed} total={c.actions} color={c.color}/>
                      {!c.sideUsed && <span style={{ fontSize:8, color:YEL }}>⊕</span>}
                      {active && <span style={{ fontSize:8, fontFamily:MONO, color:c.color, animation:'pulse 1.2s infinite', letterSpacing:2 }}>◆ ACTIVE</span>}
                    </div>
                  </div>

                  {/* HP / EN bars */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:6 }}>
                    <div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:8, color:B2, marginBottom:2 }}>
                        <span>HP</span><span style={{ color:B1 }}>{c.hp}/{c.maxHp}</span>
                      </div>
                      <HpBar cur={c.hp} max={c.maxHp} color={c.color}/>
                    </div>
                    <div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:8, color:B2, marginBottom:2 }}>
                        <span>EN</span><span style={{ color:B1 }}>{c.en}/{c.maxEn}</span>
                      </div>
                      <HpBar cur={c.en} max={c.maxEn} color="#4477ff"/>
                    </div>
                  </div>

                  {/* Vela ghost energy */}
                  {c.id==='vela' && (
                    <div style={{ marginBottom:6 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:8, color:B2, marginBottom:2 }}>
                        <span>GHOST</span><span style={{ color:VELA }}>{c.ghostEn||0}/{c.maxGhostEn||10}</span>
                      </div>
                      <HpBar cur={c.ghostEn||0} max={c.maxGhostEn||10} color={VELA}/>
                    </div>
                  )}

                  {/* Stats row */}
                  <div style={{ display:'flex', gap:8, fontSize:8, color:B2, marginBottom:5 }}>
                    {['vig','gra','min','tec'].map(s=>(
                      <span key={s}><span style={{ color:B3 }}>{s.toUpperCase()} </span>{c[s]}</span>
                    ))}
                    <span><span style={{ color:B3 }}>ARM </span>{c.armor}</span>
                  </div>

                  {/* Conditions */}
                  {c.conditions.length > 0 && (
                    <div style={{ marginBottom:6 }}>
                      {c.conditions.map((x,i) => <CondPill key={i} cond={x}/>)}
                    </div>
                  )}

                  {/* Action buttons — only when active */}
                  {active && !c.isDefeated && (
                    <div style={{ borderTop:'1px solid '+c.color+'22', paddingTop:8, marginTop:4 }}>
                      <div style={{ fontSize:8, color:B2, marginBottom:5 }}>
                        WEAPON: {c.weapon} · {c.wDmg}+{c.wStat==='min'?c.min:c.vig}
                      </div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                        {liveEnemies.map(e => (
                          <button key={e.id} onClick={()=>doAttack(c.id,e.id)}
                            disabled={actsLeft(c)===0}
                            style={Btn(actsLeft(c)===0?B2:RED,true,actsLeft(c)===0)}>
                            ⚔ {e.name.split(' ')[0]}
                          </button>
                        ))}
                        {c.id==='vela' && (
                          <button onClick={()=>setShowHacks(true)} style={Btn(VELA,true,false)}>
                            ◈ HACK
                          </button>
                        )}
                        {!c.sideUsed && (
                          <button onClick={()=>{setItemUser(c.id);setShowItems(true);}} style={Btn(YEL,true,false)}>
                            ⊕ ITEM
                          </button>
                        )}
                        <button onClick={()=>{const d=roll(6)+c.vig;addLog('[R'+round+'] '+c.name+' ESCAPE: d6+'+c.vig+'='+d,YEL);}} style={Btn(YEL,true,false)}>
                          ESC
                        </button>
                      </div>
                    </div>
                  )}

                  {c.isDefeated && (
                    <div style={{ textAlign:'center', fontSize:9, color:RED+'88', fontFamily:MONO, marginTop:4 }}>
                      💀 OPERATIVE DOWN
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT: HOSTILES + LOG */}
          <div>
            <div style={{ fontFamily:ORB, fontSize:9, color:RED, letterSpacing:3, marginBottom:8 }}>
              HOSTILES ({liveEnemies.length})
            </div>

            {liveEnemies.map(c => {
              const active = isActive(c.id);
              return (
                <div key={c.id} style={cardStyle(c, active)}>
                  {/* Header */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <FactionIcon faction={c.faction||'NONE'} size={22} />
                      <span style={{ fontFamily:RAJ, fontSize:12, color:c.color, fontWeight:700 }}>{c.name}</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <span style={{ fontSize:8, fontFamily:MONO, color:DIFFICULTY_COLORS[c.difficulty]||B2 }}>
                        {c.difficulty}
                      </span>
                      {c.isBoss && <span style={{ fontSize:8, color:RED }}>★</span>}
                      {active && <span style={{ fontSize:8, color:RED, animation:'pulse 1.2s infinite' }}>◆</span>}
                    </div>
                  </div>

                  {/* HP bar */}
                  <div style={{ marginBottom:5 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:8, color:B2, marginBottom:2 }}>
                      <span>HP</span><span style={{ color:B1 }}>{c.hp}/{c.maxHp}</span>
                    </div>
                    <HpBar cur={c.hp} max={c.maxHp} color={RED}/>
                  </div>

                  {/* Stats */}
                  <div style={{ display:'flex', gap:6, fontSize:8, color:B2, marginBottom:4 }}>
                    <span><span style={{ color:B3 }}>ARM </span>{c.armor}</span>
                    <span><span style={{ color:B3 }}>VIG </span>{c.vig}</span>
                    <span><span style={{ color:B3 }}>GRA </span>{c.gra}</span>
                    <ActionDots used={c.actionsUsed} total={c.actions} color={c.color}/>
                  </div>

                  {/* Conditions */}
                  {c.conditions.length > 0 && (
                    <div style={{ marginBottom:5 }}>
                      {c.conditions.map((x,i) => <CondPill key={i} cond={x}/>)}
                    </div>
                  )}

                  {/* Quick condition buttons — always available for manual play */}
                  <div style={{ display:'flex', flexWrap:'wrap', gap:3 }}>
                    <button onClick={()=>setCmbs(p=>{const n=applyDmg(p,c.id,rollF(c.wDmg||'d6')+c.vig,c.name);checkEnd(n);return n;})}
                      style={Btn(RED,true,false)}>ROLL ATK</button>
                    {['overheat','shock','stun','silence'].map(t=>(
                      <button key={t} onClick={()=>setCmbs(p=>applyCondition(p,c.id,t,2))}
                        style={Btn(COND_META[t].color,true,false)}>{COND_META[t].icon}</button>
                    ))}
                  </div>
                </div>
              );
            })}

            {deadEnemies.length > 0 && (
              <div style={{ fontSize:8, color:B2+'55', fontFamily:MONO, marginBottom:10, lineHeight:1.7 }}>
                💀 {deadEnemies.map(e=>e.name).join(' · ')}
              </div>
            )}

            {/* COMBAT LOG */}
            <div style={{ fontFamily:ORB, fontSize:9, color:B2, letterSpacing:2, marginBottom:5 }}>
              COMBAT LOG
            </div>
            <div ref={logRef} style={{
              background:'#05060b', border:'1px solid '+B3+'18', borderRadius:3,
              padding:'8px 10px', height:220, overflowY:'auto',
              fontSize:9, fontFamily:MONO, lineHeight:1.8, scrollbarWidth:'thin',
              scrollbarColor: B2+'44 transparent',
            }}>
              {log.length === 0 && (
                <div style={{ color:B2+'55', fontStyle:'italic' }}>Combat log will appear here...</div>
              )}
              {log.map(e => <div key={e.id} style={{ color:e.color }}>{e.msg}</div>)}
            </div>
          </div>
        </div>
      </div>

      {/* ── HACK MODAL ── */}
      {showHacks && (
        <div style={{ position:'fixed', inset:0, background:'#000d', zIndex:100,
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:CBG, border:'1px solid '+VELA, borderRadius:4, padding:20,
            width:'min(500px,94vw)', maxHeight:'85vh', overflowY:'auto', position:'relative' }}>
            <Corner pos="tl" color={VELA}/><Corner pos="tr" color={VELA}/>
            <div style={{ fontFamily:ORB, fontSize:14, color:VELA, letterSpacing:3, marginBottom:4 }}>◈ HACK PANEL</div>
            <div style={{ fontSize:10, color:B2, marginBottom:14 }}>
              EN: {vela?.en||0}/{vela?.maxEn||20} · MIN {vela?.min||4}
            </div>

            {/* Target selection */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:9, color:B2, letterSpacing:2, marginBottom:5 }}>SELECT TARGET</div>
              <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                <button onClick={()=>setHackTgt(null)} style={Btn(!hackTgt?VELA:B2,true,false)}>NONE</button>
                {liveEnemies.map(e=>(
                  <button key={e.id} onClick={()=>setHackTgt(e.id)}
                    style={Btn(hackTgt===e.id?RED:B2,true,false)}>{e.name.split(' ')[0]}</button>
                ))}
              </div>
            </div>

            <div style={{ display:'grid', gap:6 }}>
              {HACKS.map(h => {
                const ok = (vela?.en||0) >= h.cost;
                return (
                  <div key={h.id} style={{ background:'#0d0d1a', border:'1px solid '+VELA+'22',
                    borderRadius:3, padding:10, opacity:ok?1:0.4 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                      <span style={{ fontFamily:MONO, fontSize:11, color:VELA }}>{h.name}</span>
                      <span style={{ fontSize:9, color:YEL }}>{h.cost} EN</span>
                    </div>
                    <div style={{ fontSize:9, color:B2, marginBottom:7 }}>{h.effect}</div>
                    <button onClick={()=>doHack(h.id,hackTgt)} disabled={!ok}
                      style={Btn(ok?VELA:B2,true,!ok)}>CAST</button>
                  </div>
                );
              })}
            </div>
            <button onClick={()=>{setShowHacks(false);setHackTgt(null);}}
              style={{ ...Btn(B2,false,false), width:'100%', marginTop:14 }}>CLOSE</button>
          </div>
        </div>
      )}

      {/* ── ITEMS MODAL ── */}
      {showItems && (
        <div style={{ position:'fixed', inset:0, background:'#000d', zIndex:100,
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:CBG, border:'1px solid '+YEL, borderRadius:4, padding:20,
            width:'min(400px,94vw)', position:'relative' }}>
            <Corner pos="tl" color={YEL}/><Corner pos="tr" color={YEL}/>
            <div style={{ fontFamily:ORB, fontSize:14, color:YEL, letterSpacing:3, marginBottom:14 }}>⊕ CONSUMABLES</div>
            {players.filter(p=>!p.isDefeated).map(p=>(
              <div key={p.id} style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, color:p.color, fontFamily:RAJ, fontWeight:700, marginBottom:8, display:'flex', alignItems:'center', gap:8 }}>
                  {p.name}
                  {p.sideUsed && <span style={{ fontSize:8, color:RED, fontFamily:MONO }}>[SIDE USED]</span>}
                </div>
                {CONSUMABLES.map(cons=>(
                  <div key={cons.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                    background:'#0d0d1a', border:'1px solid '+B3+'18', borderRadius:2, padding:'7px 10px', marginBottom:4 }}>
                    <div>
                      <div style={{ fontSize:10, color:B1 }}>{cons.name}</div>
                      <div style={{ fontSize:9, color:B2 }}>{cons.effect}</div>
                    </div>
                    <button onClick={()=>doItem(cons,p.id)}
                      disabled={p.sideUsed || itemUser!==p.id}
                      style={Btn((p.sideUsed||itemUser!==p.id)?B2:YEL,true,p.sideUsed||itemUser!==p.id)}>USE</button>
                  </div>
                ))}
              </div>
            ))}
            <button onClick={()=>{setShowItems(false);setItemUser(null);}}
              style={{ ...Btn(B2,false,false), width:'100%', marginTop:4 }}>CLOSE</button>
          </div>
        </div>
      )}

      {/* ── MANUAL DAMAGE MODAL ── */}
      {showManual && (
        <div style={{ position:'fixed', inset:0, background:'#000d', zIndex:100,
          display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:CBG, border:'1px solid '+B3, borderRadius:4, padding:24,
            width:'min(340px,94vw)', position:'relative' }}>
            <Corner pos="tl"/><Corner pos="tr"/>
            <div style={{ fontFamily:ORB, fontSize:13, color:B1, letterSpacing:2, marginBottom:14 }}>± MANUAL DAMAGE</div>
            <div style={{ marginBottom:10 }}>
              <div style={{ fontSize:9, color:B2, letterSpacing:2, marginBottom:6 }}>TARGET</div>
              <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                {cmbs.filter(c=>!c.isDefeated).map(c=>(
                  <button key={c.id} onClick={()=>setManualTgt(c.id)}
                    style={Btn(manualTgt===c.id?c.color:B2,true,false)}>{c.name.split(' ')[0]}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:9, color:B2, letterSpacing:2, marginBottom:6 }}>AMOUNT</div>
              <input value={manualDmg} onChange={e=>setManualDmg(e.target.value)} placeholder="e.g. 12"
                type="number" min="1"
                style={{ width:'100%', background:'#0d0d1a', border:'1px solid '+B3+'44', color:B1,
                  fontFamily:ORB, fontSize:16, padding:'8px 12px', borderRadius:2, boxSizing:'border-box', textAlign:'center' }}/>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>manualTgt&&doManualDmg(manualTgt,manualDmg)}
                disabled={!manualTgt||!manualDmg}
                style={{ ...Btn((!manualTgt||!manualDmg)?B2:RED,false,!manualTgt||!manualDmg), flex:1 }}>
                APPLY DMG
              </button>
              <button onClick={()=>manualTgt&&manualDmg&&setCmbs(p=>applyHeal(p,manualTgt,parseInt(manualDmg)||0,0))}
                disabled={!manualTgt||!manualDmg}
                style={{ ...Btn((!manualTgt||!manualDmg)?B2:COLE,false,!manualTgt||!manualDmg), flex:1 }}>
                APPLY HEAL
              </button>
            </div>
            <button onClick={()=>{setShowManual(false);setManualDmg('');setManualTgt(null);}}
              style={{ ...Btn(B2,false,false), width:'100%', marginTop:10 }}>CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
}
