import React, { useState, useEffect, useRef, useMemo } from 'react';
import PortraitPanel from './PortraitPanel.jsx';

const ACC   = '#FF6B35';
const TEAL  = '#00FFD0';
const VELA  = '#cc88ff';
const RED   = '#FF2060';
const YEL   = '#FFD166';
const BLUE  = '#00BFFF';
const MONO  = "'Share Tech Mono', monospace";
const ORB   = "'Orbitron', sans-serif";

const FACTION_COLOR = {
  CORSAIR: YEL, ISF: BLUE, WARG: RED, MEDUSA: VELA, SYNTH: TEAL, NONE: '#9090b8',
};

const factionShipSrc = (faction, isBoss) => {
  if (faction === 'WARG')    return '/ships/flagship.webp';
  if (faction === 'ISF')     return '/ships/vector-ace.webp';
  if (faction === 'CORSAIR') return isBoss ? '/ships/smuggler-interceptor.webp' : '/ships/smuggler-speeder.webp';
  return null;
};

// ── Vector LCD-style exhaust flame ─────────────────────────────────────────
// dir: 'left' = flame extends left (player ship rear), 'right' = flame extends right (enemy rear)
function VectorFlame({ color, dir, size = 60 }) {
  const flip = dir === 'right' ? 'scaleX(-1)' : 'scaleX(1)';
  const w = size;
  const h = Math.round(size * 0.32);
  const hh = h / 2;

  return (
    <svg
      width={w} height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{
        display: 'block',
        transform: flip,
        overflow: 'visible',
      }}
    >
      <defs>
        <linearGradient id={`fg-${dir}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="transparent" />
          <stop offset="30%"  stopColor={color} stopOpacity="0.18" />
          <stop offset="65%"  stopColor={color} stopOpacity="0.65" />
          <stop offset="85%"  stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={`fc-${dir}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="transparent" />
          <stop offset="50%"  stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Outer flame — wide tapered shape */}
      <polygon
        points={`0,${hh}  ${w * 0.55},${hh - hh * 0.6}  ${w},${hh}  ${w * 0.55},${hh + hh * 0.6}`}
        fill={`url(#fg-${dir})`}
        style={{ animation: `flameMorph 0.18s ease-in-out infinite alternate` }}
      />
      {/* Mid flame */}
      <polygon
        points={`${w * 0.15},${hh}  ${w * 0.65},${hh - hh * 0.35}  ${w},${hh}  ${w * 0.65},${hh + hh * 0.35}`}
        fill={`url(#fc-${dir})`}
        style={{ animation: `flameMorph 0.14s ease-in-out 0.04s infinite alternate` }}
      />
      {/* Inner bright core — thin spike */}
      <polygon
        points={`${w * 0.5},${hh}  ${w * 0.82},${hh - 1.5}  ${w},${hh}  ${w * 0.82},${hh + 1.5}`}
        fill="#ffffff"
        opacity="0.9"
      />

    </svg>
  );
}

// ── Fallback ships for factions without images ─────────────────────────────
// ALL ships drawn NOSE-UP (y=0 is front) so rotation math matches real images
function FallbackShip({ faction, size = 64 }) {
  const c = FACTION_COLOR[faction] || '#9090b8';
  const s = size;

  if (faction === 'MEDUSA') return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{ display:'block', filter:`drop-shadow(0 0 8px ${c}99)` }}>
      {/* Nose spike pointing UP */}
      <polygon points="50,2 38,30 62,30" fill={c}/>
      {/* Main body ellipse — narrow top to wide middle */}
      <ellipse cx="50" cy="52" rx="16" ry="36" fill={c} opacity="0.9"/>
      {/* Swept side wings — rear */}
      <polygon points="34,55 10,90 28,80 38,65" fill={c} opacity="0.75"/>
      <polygon points="66,55 90,90 72,80 62,65" fill={c} opacity="0.75"/>
      {/* Antenna array at nose */}
      <line x1="50" y1="2" x2="42" y2="-8" stroke={c} strokeWidth="2"/>
      <line x1="50" y1="2" x2="50" y2="-10" stroke={c} strokeWidth="2"/>
      <line x1="50" y1="2" x2="58" y2="-8" stroke={c} strokeWidth="2"/>
      {/* Eye glow */}
      <ellipse cx="50" cy="38" rx="6" ry="4" fill="#000" opacity="0.6"/>
      <ellipse cx="50" cy="38" rx="3" ry="2" fill={c}/>
    </svg>
  );

  if (faction === 'SYNTH') return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{ display:'block', filter:`drop-shadow(0 0 8px ${c}99)` }}>
      {/* Angular geometric hull — nose up */}
      <polygon points="50,5 70,35 68,75 50,82 32,75 30,35" fill={c} opacity="0.9"/>
      {/* Wide mid wings */}
      <polygon points="30,40 5,55 5,65 30,60" fill={c} opacity="0.7"/>
      <polygon points="70,40 95,55 95,65 70,60" fill={c} opacity="0.7"/>
      {/* Core circuit diamond */}
      <polygon points="50,38 60,50 50,62 40,50" fill="#000" opacity="0.5"/>
      <polygon points="50,42 57,50 50,58 43,50" fill={c}/>
      {/* Rear vents */}
      <line x1="40" y1="80" x2="40" y2="92" stroke={c} strokeWidth="2" opacity="0.8"/>
      <line x1="50" y1="82" x2="50" y2="96" stroke={c} strokeWidth="2.5" opacity="0.9"/>
      <line x1="60" y1="80" x2="60" y2="92" stroke={c} strokeWidth="2" opacity="0.8"/>
    </svg>
  );

  // NONE — hand-drawn top-down sci-fi fighter. Nose UP. No Vostoks were harmed.
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{ display:'block', filter:`drop-shadow(0 0 10px ${c}99)` }}>
      <defs>
        <linearGradient id={`nf_hull_${c.slice(1)}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={c} stopOpacity="0.08"/>
          <stop offset="0.5" stopColor={c} stopOpacity="0.35"/>
          <stop offset="1" stopColor={c} stopOpacity="0.08"/>
        </linearGradient>
        <linearGradient id={`nf_eng_${c.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c} stopOpacity="0.6"/>
          <stop offset="1" stopColor={c} stopOpacity="0.05"/>
        </linearGradient>
        <radialGradient id={`nf_core_${c.slice(1)}`} cx="50%" cy="45%" r="18%">
          <stop offset="0" stopColor={c} stopOpacity="0.9"/>
          <stop offset="1" stopColor={c} stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* ── MAIN FUSELAGE — narrow spine, nose up ── */}
      {/* Nose tip */}
      <polygon points="50,4 46,18 54,18" fill={c} opacity="0.95"/>
      {/* Forward hull */}
      <polygon points="46,18 54,18 57,38 43,38" fill={c} opacity="0.8"/>
      {/* Mid hull — widest point */}
      <polygon points="43,38 57,38 60,58 40,58" fill={`url(#nf_hull_${c.slice(1)})`} stroke={c} strokeWidth="0.8" strokeOpacity="0.9"/>
      {/* Aft hull */}
      <polygon points="40,58 60,58 58,74 42,74" fill={c} opacity="0.5"/>
      {/* Tail */}
      <polygon points="42,74 58,74 55,88 45,88" fill={c} opacity="0.4"/>

      {/* ── SWEPT FORWARD WINGS ── */}
      {/* Left wing — sweeps forward and out */}
      <polygon points="43,38 20,25 14,35 38,50 40,58" fill={c} opacity="0.6"/>
      {/* Right wing */}
      <polygon points="57,38 80,25 86,35 62,50 60,58" fill={c} opacity="0.6"/>

      {/* ── WING DETAIL LINES ── */}
      <line x1="43" y1="38" x2="20" y2="25" stroke={c} strokeWidth="0.6" strokeOpacity="0.4"/>
      <line x1="38" y1="44" x2="16" y2="33" stroke={c} strokeWidth="0.4" strokeOpacity="0.3"/>
      <line x1="57" y1="38" x2="80" y2="25" stroke={c} strokeWidth="0.6" strokeOpacity="0.4"/>
      <line x1="62" y1="44" x2="84" y2="33" stroke={c} strokeWidth="0.4" strokeOpacity="0.3"/>

      {/* ── CANARDS — small forward stabilizers ── */}
      <polygon points="46,22 34,18 32,24 44,26" fill={c} opacity="0.65"/>
      <polygon points="54,22 66,18 68,24 56,26" fill={c} opacity="0.65"/>

      {/* ── WINGTIP HARDPOINTS ── */}
      <rect x="10" y="30" width="8" height="12" rx="2" fill={c} opacity="0.5"/>
      <rect x="82" y="30" width="8" height="12" rx="2" fill={c} opacity="0.5"/>
      {/* Hardpoint guns */}
      <rect x="12" y="24" width="2" height="8" rx="1" fill={c} opacity="0.8"/>
      <rect x="86" y="24" width="2" height="8" rx="1" fill={c} opacity="0.8"/>

      {/* ── AFT SPLIT FINS ── */}
      <polygon points="42,72 32,88 40,88 45,76" fill={c} opacity="0.55"/>
      <polygon points="58,72 68,88 60,88 55,76" fill={c} opacity="0.55"/>

      {/* ── ENGINE PODS — flanking the tail ── */}
      <rect x="37" y="76" width="8" height="16" rx="3" fill={c} opacity="0.45"/>
      <rect x="55" y="76" width="8" height="16" rx="3" fill={c} opacity="0.45"/>
      {/* Engine glow */}
      <ellipse cx="41" cy="92" rx="4" ry="2.5" fill={`url(#nf_eng_${c.slice(1)})`}/>
      <ellipse cx="59" cy="92" rx="4" ry="2.5" fill={`url(#nf_eng_${c.slice(1)})`}/>

      {/* ── COCKPIT ── */}
      <ellipse cx="50" cy="28" rx="4" ry="7" fill="#000" opacity="0.7"/>
      <ellipse cx="50" cy="27" rx="2.5" ry="5" fill={c} opacity="0.4"/>
      {/* Core sensor glow */}
      <circle cx="50" cy="46" r="5" fill={`url(#nf_core_${c.slice(1)})`}/>
      <circle cx="50" cy="46" r="2" fill={c} opacity="0.8"/>

      {/* ── HULL PANEL LINES ── */}
      <line x1="47" y1="18" x2="45" y2="58" stroke={c} strokeWidth="0.4" strokeOpacity="0.35"/>
      <line x1="53" y1="18" x2="55" y2="58" stroke={c} strokeWidth="0.4" strokeOpacity="0.35"/>
      <line x1="43" y1="38" x2="57" y2="38" stroke={c} strokeWidth="0.5" strokeOpacity="0.5"/>
      <line x1="40" y1="58" x2="60" y2="58" stroke={c} strokeWidth="0.5" strokeOpacity="0.4"/>
    </svg>
  );
}

// Maps faction color hex to approximate hue-rotate degrees for CSS filter tinting
function _hueFor(hex) {
  const map = {'#FF2060':330,'#FFD166':45,'#00FFD0':174,'#aaaaff':240,'#cc88ff':280,'#FF6B35':20,'#FF6EC7':320};
  return map[hex] || 0;
}

// ── Ship display with correct rotation + flame positioning ─────────────────
// facing: 'right' = player (nose right), 'left' = enemy (nose left)
function ShipDisplay({ faction, isBoss, size, facing = 'right', defeated, hit, isPlayer, isLeader, eColor }) {
  const imgSrc = isPlayer ? '/ships/duskwing.webp' : factionShipSrc(faction, isBoss);
  const color  = isPlayer ? TEAL : (FACTION_COLOR[faction] || '#9090b8');
  const w = size || (isBoss ? 88 : 68);

  // Ships are top-down with nose UP.
  // Player (facing right):  rotate +90deg → nose points right, rear points left
  // Enemy  (facing left):   rotate -90deg → nose points left,  rear points right
  const rotateDeg = facing === 'right' ? 90 : -90;

  // Flame comes from the REAR:
  // Player (facing right, rear=left):  flame div goes to the LEFT of the ship image
  // Enemy  (facing left,  rear=right): flame div goes to the RIGHT of the ship image
  const flameDir  = facing === 'right' ? 'left' : 'right';
  const flameSize = Math.round(w * 0.75);

  const leaderColor = eColor || color;
  const hitFilter = hit
    ? `drop-shadow(0 0 18px ${RED}ff) drop-shadow(0 0 6px ${RED}) brightness(2)`
    : isPlayer
    ? `drop-shadow(0 0 10px ${TEAL}88)`
    : `sepia(1) saturate(8) hue-rotate(${_hueFor(leaderColor)}deg) brightness(${isLeader ? 1.08 : 0.95}) drop-shadow(0 0 6px ${leaderColor}55)`;

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: facing === 'right' ? 'row' : 'row-reverse',
      alignItems: 'center',
      opacity: defeated ? 0.1 : 1,
      transition: 'opacity 1.4s',
      transform: defeated ? 'rotate(22deg) translateY(12px)' : 'none',
    }}>

      {/* Flame — on the REAR side */}
      {!defeated && (
        <div style={{ flexShrink: 0 }}>
          <VectorFlame color={isPlayer ? TEAL : color} dir={flameDir} size={flameSize} />
        </div>
      )}

      {/* Ship image or fallback — rotate the WHOLE wrapper so stripes rotate with the ship */}
      <div style={{
        position: 'relative', flexShrink: 0,
        width: w, height: w,
        transform: `rotate(${rotateDeg}deg)`,
        filter: hitFilter,
        transition: 'filter 0.15s',
      }}>
        {imgSrc ? (
          <>
            <img
              src={imgSrc}
              alt={faction || 'ship'}
              style={{
                width: w, height: w,
                objectFit: 'contain',
                display: 'block',
                imageRendering: 'crisp-edges',
              }}
            />

          </>
        ) : (
          <FallbackShip faction={faction} size={w} />
        )}
      </div>
    </div>
  );
}

// ── Missile swarm — tiny dashes, bell-curve arcs, cluster impact ──────────
function MissileSwarm({ x1pct, y1pct, x2pct, y2pct, color, onDone, screenW=1032, screenH=240 }) {
  const uid = React.useRef('ms'+Math.round(Math.random()*999999)).current;
  const N = 6;
  const ax = x1pct/100*screenW, ay = y1pct/100*screenH;
  const bx = x2pct/100*screenW, by = y2pct/100*screenH;
  const dist = Math.sqrt((bx-ax)**2+(by-ay)**2);
  const travelMs = Math.round(120 + dist * 1.1);  // slower
  const [tick, setTick] = React.useState(0);
  const [impacted, setImpacted] = React.useState(false);

  React.useEffect(() => {
    const iv = setInterval(() => setTick(t => t+1), 30);
    const impactT = setTimeout(() => { clearInterval(iv); setImpacted(true); }, travelMs);
    const doneT = setTimeout(() => onDone(), travelMs + 500);
    return () => { clearInterval(iv); clearTimeout(impactT); clearTimeout(doneT); };
  }, []);

  const elapsed = tick * 30;
  const rawProg = Math.min(1, elapsed / travelMs);
  // ease-in: slow start, faster finish
  const prog = rawProg * rawProg;

  // Each rocket follows a bell-curve arc (spread left/right then converge)
  const rockets = React.useMemo(() => Array.from({length:N}, (_,i) => {
    const side = i % 2 === 0 ? 1 : -1;
    const spreadAmt = 18 + (Math.floor(i/2)) * 10; // 18, 18, 28, 28, 38, 38
    const bodyAngle = Math.atan2(by-ay, bx-ax); // direction to target
    const perpX = -Math.sin(bodyAngle);
    const perpY =  Math.cos(bodyAngle);
    // Control point for bell curve: perpendicular to path, max spread at midpoint
    const cpX = (ax+bx)/2 + perpX * side * spreadAmt;
    const cpY = (ay+by)/2 + perpY * side * spreadAmt;
    // Final scatter near impact
    const scatterA = (i/N)*Math.PI*2;
    const ex = bx + Math.cos(scatterA)*2;
    const ey = by + Math.sin(scatterA)*2;
    // Rocket angle in deg (points toward travel direction)
    const dashAngle = Math.atan2(by-ay, bx-ax) * 180/Math.PI;
    return { cpX, cpY, ex, ey, dashAngle, side, spreadAmt };
  }), []);

  // Quadratic bezier: P = (1-t)^2*P0 + 2*(1-t)*t*P1 + t^2*P2
  const bezier = (p0x,p0y,p1x,p1y,p2x,p2y,t) => {
    const mt = 1-t;
    return [mt*mt*p0x + 2*mt*t*p1x + t*t*p2x, mt*mt*p0y + 2*mt*t*p1y + t*t*p2y];
  };

  // Impact pops — 10 tiny scattered flashes
  const pops = React.useMemo(() => Array.from({length:10}, (_,i) => ({
    cx: bx + (Math.random()-0.5)*20,
    cy: by + (Math.random()-0.5)*20,
    r:  1 + Math.random()*2.5,
    delay: i * 0.035,
    angle: Math.random()*Math.PI*2,
    rayLen: 4 + Math.random()*7,
  })), []);

  const PINK = '#FF2060';

  return (
    <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:22,overflow:'visible'}}
         viewBox={`0 0 ${screenW} ${screenH}`} preserveAspectRatio="none">
      <defs>
        <filter id={uid+'g'} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <style>{`
          @keyframes ${uid}pop{0%{opacity:1}80%{opacity:0.6}100%{opacity:0}}
        `}</style>
      </defs>

      {/* Flying rockets */}
      {!impacted && rockets.map((r, i) => {
        const [cx2, cy2] = bezier(ax, ay, r.cpX, r.cpY, r.ex, r.ey, prog);
        // Tail point slightly behind
        const tailT = Math.max(0, prog - 0.06);
        const [tx, ty] = bezier(ax, ay, r.cpX, r.cpY, r.ex, r.ey, tailT);
        // Rocket travel angle at current point
        const dx = cx2 - tx, dy = cy2 - ty;
        const angle = Math.atan2(dy, dx);
        // Rocket body: tiny dash 6px long
        const bodyLen = 6, tipLen = 2;
        const rx1 = cx2 - Math.cos(angle)*bodyLen;
        const ry1 = cy2 - Math.sin(angle)*bodyLen;
        const tipX = cx2 + Math.cos(angle)*tipLen;
        const tipY = cy2 + Math.sin(angle)*tipLen;
        return (
          <React.Fragment key={i}>
            {/* Fading tracer */}
            <line x1={tx} y1={ty} x2={cx2} y2={cy2}
              stroke={color} strokeWidth="0.8" strokeOpacity="0.3" strokeLinecap="round"/>
            {/* Rocket body — 3px wide dash */}
            <line x1={rx1} y1={ry1} x2={cx2} y2={cy2}
              stroke={color} strokeWidth="3" strokeLinecap="round"
              filter={`url(#${uid}g)`}/>
            {/* Hot pink neon tip — 2px dot */}
            <circle cx={tipX} cy={tipY} r="2" fill={PINK}
              filter={`url(#${uid}g)`}/>
          </React.Fragment>
        );
      })}

      {/* Cluster impact: tiny bright pops */}
      {impacted && pops.map((p,i) => (
        <React.Fragment key={i}>
          {/* Core flash dot */}
          <circle cx={p.cx} cy={p.cy} r={p.r} fill={PINK} opacity="0"
            filter={`url(#${uid}g)`}
            style={{animation:`${uid}pop 0.22s ease-out ${p.delay}s forwards`}}/>
          <circle cx={p.cx} cy={p.cy} r={p.r*0.5} fill="#fff" opacity="0"
            style={{animation:`${uid}pop 0.15s ease-out ${p.delay}s forwards`}}/>
          {/* 2-ray starburst per pop */}
          {[0,1].map(j => {
            const a = p.angle + j*Math.PI/2;
            return <line key={j}
              x1={p.cx} y1={p.cy}
              x2={p.cx+Math.cos(a)*p.rayLen} y2={p.cy+Math.sin(a)*p.rayLen}
              stroke={PINK} strokeWidth="1" strokeLinecap="round" opacity="0"
              style={{animation:`${uid}pop 0.2s ease-out ${p.delay+0.02}s forwards`}}/>;
          })}
        </React.Fragment>
      ))}
    </svg>
  );
}

// ── Beam weapon — SVG lightning arc from cannon to target ─────────────────
function BeamWeapon({ x1pct, y1pct, x2pct, y2pct, color, onDone, screenW=1032, screenH=240 }) {
  const uid = React.useRef('bw'+Math.round(Math.random()*999999)).current;
  const [tick, setTick] = React.useState(0);

  const ax = x1pct/100*screenW, ay = y1pct/100*screenH;
  const bx = x2pct/100*screenW, by = y2pct/100*screenH;
  const dist = Math.sqrt((bx-ax)**2+(by-ay)**2);
  const travelMs = Math.round(40 + dist * 0.5);

  // Jitter every 40ms for continuous wiggle
  React.useEffect(() => {
    const iv = setInterval(() => setTick(t => t+1), 40);
    const t = setTimeout(() => { clearInterval(iv); onDone(); }, travelMs + 280);
    return () => { clearInterval(iv); clearTimeout(t); };
  }, []);

  // Generate jagged lightning path
  const makePath = (jag, nSegs) => {
    const pts = [[ax,ay]];
    for (let i=1; i<nSegs; i++) {
      const t2 = i/nSegs;
      const mx = ax+(bx-ax)*t2, my = ay+(by-ay)*t2;
      const perp = (Math.random()-0.5)*jag*(1-Math.abs(t2-0.5)*1.2);
      const dx = -(by-ay), dy = (bx-ax);
      const len = Math.sqrt(dx*dx+dy*dy)||1;
      pts.push([mx+dx/len*perp, my+dy/len*perp]);
    }
    pts.push([bx,by]);
    return 'M'+pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' L');
  };

  // Three paths: outer glow, mid crackle, bright core — each re-randomized on tick
  const d1 = makePath(16, 9);   // outer — big jag
  const d2 = makePath(10, 9);   // mid
  const d3 = makePath(6,  7);   // core — tighter

  const sLen = dist * 1.4;
  const elapsed = tick * 40;
  const drawProg = Math.min(1, elapsed / travelMs);
  const offset = sLen * (1 - drawProg);

  return (
    <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:22,overflow:'visible'}}
         viewBox={`0 0 ${screenW} ${screenH}`} preserveAspectRatio="none">
      <defs>
        <filter id={uid+'g'} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Outer glow — wide, soft */}
      <path d={d1} fill="none" stroke={color} strokeWidth="4" strokeOpacity="0.18"
        filter={`url(#${uid}g)`} strokeLinecap="round"
        strokeDasharray={sLen} strokeDashoffset={offset}/>
      {/* Mid crackle */}
      <path d={d2} fill="none" stroke={color} strokeWidth="1.4" strokeOpacity={0.55+Math.random()*0.3}
        strokeLinecap="round"
        strokeDasharray={sLen} strokeDashoffset={offset}/>
      {/* Bright white core */}
      <path d={d3} fill="none" stroke="#ffffff" strokeWidth="0.7" strokeOpacity={0.7+Math.random()*0.3}
        strokeLinecap="round"
        strokeDasharray={sLen} strokeDashoffset={offset}/>
      {/* Origin burst */}
      {drawProg < 0.3 && <>
        <circle cx={ax} cy={ay} r={5+Math.random()*3} fill={color} opacity={0.6*(1-drawProg/0.3)}/>
        <circle cx={ax} cy={ay} r={9+Math.random()*4} fill={color} opacity={0.2*(1-drawProg/0.3)}/>
      </>}
    </svg>
  );
}


// ── Explosion — SVG starburst / radial sun ─────────────────────────────
function Explosion({ x, y, color, screenW=900, screenH=240 }) {
  const uid = React.useRef('ex'+Math.round(Math.random()*99999)).current;
  const cx = x/100*screenW, cy = y/100*screenH;
  const nRays = 12;
  const rays = Array.from({length:nRays},(_,i)=>{
    const angle = (i/nRays)*Math.PI*2;
    const len = 14 + Math.random()*22;
    const wid = 1.5 + Math.random()*2.5;
    return {angle, len, wid, delay: Math.random()*0.08};
  });
  return (
    <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:26,overflow:'visible'}}
         viewBox={`0 0 ${screenW} ${screenH}`} preserveAspectRatio="none">
      <defs>
        <filter id={uid+'glow'} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <style>{`
          @keyframes ${uid}ring{0%{r:3;opacity:1}100%{r:28;opacity:0}}
          @keyframes ${uid}ring2{0%{r:2;opacity:0.7}100%{r:18;opacity:0}}
          @keyframes ${uid}ray{0%{opacity:1;stroke-width:inherit}60%{opacity:0.8}100%{opacity:0;stroke-width:0}}
          @keyframes ${uid}core{0%{opacity:1;r:7}100%{opacity:0;r:2}}
        `}</style>
      </defs>
      {/* Expanding rings */}
      <circle cx={cx} cy={cy} r={3} fill="none" stroke={color} strokeWidth="2" opacity="1"
        style={{animation:`${uid}ring 0.45s ease-out forwards`}} filter={`url(#${uid}glow)`}/>
      <circle cx={cx} cy={cy} r={2} fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.8"
        style={{animation:`${uid}ring2 0.35s ease-out 0.05s forwards`}}/>
      {/* Radial rays */}
      {rays.map((r,i)=>{
        const x1=cx, y1=cy;
        const x2=cx+Math.cos(r.angle)*r.len, y2=cy+Math.sin(r.angle)*r.len;
        const xm=cx+Math.cos(r.angle)*(r.len*0.5), ym=cy+Math.sin(r.angle)*(r.len*0.5);
        return (
          <React.Fragment key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={r.wid} opacity="1"
              filter={`url(#${uid}glow)`} strokeLinecap="round"
              style={{animation:`${uid}ray 0.4s ease-out ${r.delay}s forwards`}}/>
            <line x1={x1} y1={y1} x2={xm} y2={ym} stroke="#ffffff" strokeWidth={r.wid*0.6} opacity="0.8"
              strokeLinecap="round"
              style={{animation:`${uid}ray 0.3s ease-out ${r.delay}s forwards`}}/>
          </React.Fragment>
        );
      })}
      {/* Hot core */}
      <circle cx={cx} cy={cy} r={7} fill="#ffffff" opacity="1"
        style={{animation:`${uid}core 0.3s ease-out forwards`}}/>
      <circle cx={cx} cy={cy} r={5} fill={color} opacity="1"
        filter={`url(#${uid}glow)`}
        style={{animation:`${uid}core 0.4s ease-out forwards`}}/>
    </svg>
  );
}

// ── Star ───────────────────────────────────────────────────────────────────
function Star({ x, y, size, speed, opacity, bright }) {
  return (
    <div style={{
      position: 'absolute', left: x+'%', top: y+'%',
      width: size, height: size, borderRadius: '50%',
      background: bright ? 'radial-gradient(circle,#fff,#88bbff88)' : '#fff',
      opacity,
      boxShadow: bright ? '0 0 4px 1px #88bbffaa' : 'none',
      animation: `starDrift ${speed}s linear infinite`,
    }}/>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function CombatBattleScreen({ ctBrief, gs, tab, onSelectEnemy }) {
  const { active, enemies = [], coleHP, velaHP, coleEN, velaEN, round, selectedEnemyId } = ctBrief || {};

  const prevColeHP  = useRef(coleHP);
  const prevVelaHP  = useRef(velaHP);
  const prevEnemyHP = useRef({});

  const [beams,           setBeams]           = useState([]);
  const [missiles,        setMissiles]        = useState([]);
  const [explosions,      setExplosions]       = useState([]);
  const [hitPlayer,       setHitPlayer]        = useState(false);
  const [hitEnemy,        setHitEnemy]         = useState({});
  const [playerShipState, setPlayerShipState]  = useState('hidden'); // 'hidden'|'warping'|'landed'

  // Per-enemy ship state: { [id]: 'hidden' | 'warping' | 'landed' }
  const [shipStates,  setShipStates]  = useState({});
  const [shieldFlash, setShieldFlash] = useState(null);     // enemyId
  const [destroyAnim, setDestroyAnim] = useState(new Set()); // Set of enemyIds
  const [combatResult,setCombatResult]= useState(null);      // {txt,color,key}
  const [commsOpen,    setCommsOpen]   = useState(false);
  const [mabelLine,    setMabelLine]   = useState('');
  const [commsLine,    setCommsLine]   = useState('');
  const [commsLoading2,setCommsLoading2] = useState(false);
  const prevActive   = useRef(false);
  const prevEnemyIds = useRef([]);
  const prevTab      = useRef(tab);
  const prevLastFire = useRef(null);

  const stars = useMemo(() => Array.from({ length: 70 }, (_, i) => ({
    id: i,
    x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() < 0.08 ? 3 : Math.random() < 0.25 ? 2 : 1,
    speed: 14 + Math.random() * 28,
    opacity: 0.12 + Math.random() * 0.65,
    bright: Math.random() < 0.1,
  })), []);

  // Combat start: stagger warp-in for all initial enemies
  useEffect(() => {
    if (active && !prevActive.current) {
      const initial = enemies.slice(0, 5);
      const init = {};
      initial.forEach(e => { init[e.id] = 'hidden'; });
      setShipStates(init);
      initial.forEach((e, i) => {
        setTimeout(() => {
          setShipStates(s => ({ ...s, [e.id]: 'warping' }));
          setTimeout(() => setShipStates(s => ({ ...s, [e.id]: 'landed' })), 1100);
        }, i * 300);
      });
      prevActive.current = true;
      prevEnemyIds.current = enemies.map(e => e.id);
    }
    if (!active) {
      setShipStates({});
      prevActive.current = false;
      prevEnemyIds.current = [];
    }
  }, [active]);

  // New enemy added during active combat
  useEffect(() => {
    if (!active) return;
    const currentIds = enemies.map(e => e.id);
    const newIds = currentIds.filter(id => !prevEnemyIds.current.includes(id));
    newIds.forEach(id => {
      setShipStates(s => ({ ...s, [id]: 'warping' }));
      setTimeout(() => setShipStates(s => ({ ...s, [id]: 'landed' })), 1100);
    });
    prevEnemyIds.current = currentIds;
  }, [enemies]);

  // lastFire event → trigger visuals
  useEffect(() => {
    const fire = ctBrief?.lastFire;
    if (!fire || fire === prevLastFire.current) return;
    prevLastFire.current = fire;

    const eid = fire.enemyId;
    const allEnemies = ctBrief?.enemies || [];
    const displayEnemies = allEnemies.slice(0, 5);
    const eCount = displayEnemies.length;

    // Formation positions — must match the render formations exactly
    const FORMATIONS = [
      [{dx:0,dy:0}],
      [{dx:-20,dy:-26},{dx:14,dy:26}],
      [{dx:-22,dy:0},{dx:14,dy:-70},{dx:14,dy:70}],
      [{dx:-24,dy:0},{dx:6,dy:-68},{dx:6,dy:68},{dx:44,dy:0}],
      [{dx:-24,dy:0},{dx:4,dy:-66},{dx:4,dy:66},{dx:26,dy:-32},{dx:26,dy:32}],
    ];
    const idx = displayEnemies.findIndex(e => e.id === eid);
    const pos = (FORMATIONS[Math.min(eCount,5)-1] || [{dx:0,dy:0}])[Math.max(0,idx)] || {dx:0,dy:0};

    // Enemy target position in % of screen
    // Enemy zone is right:'1%', width:'46%' → center of zone at ~77% from left
    // Formation dx offsets are in px within the zone; zone is ~420px wide in a ~900px container
    // Convert: each px ≈ 0.11% of screen width
    const targetX = 76 + (pos.dx * 0.111);
    const targetY = 50 + (pos.dy / 2.4);

    // Wing gun origins — corrected for actual container width (~1032px not 900px)
    // SVG screenW must match actual container width or positions shift right
    // Ship nose x = 17% of 1032px. Wing Y: ship centered ~45% from top when labels show
    const wingTop    = { x: 15.8, y: 40 };
    const wingBottom = { x: 15.8, y: 54 };
    const SCREEN_ACTUAL_W = 1032;

    // Random hit across ship body — center ± small scatter
    const aimX = targetX + (Math.random() - 0.5) * 14; // ±7% horizontal — full sprite body
    const aimY = targetY + (Math.random() - 0.5) * 16; // ±8% vertical — full sprite body

    // Travel time in px — MUST match BeamWeapon formula exactly
    const SCREEN_H = 240;
    const ax = wingTop.x/100*SCREEN_ACTUAL_W, ay = wingTop.y/100*SCREEN_H;
    const bx = aimX/100*SCREEN_ACTUAL_W,      by = aimY/100*SCREEN_H;
    const distPx = Math.sqrt((bx-ax)**2 + (by-ay)**2);
    // Weapon type determines travel time — must match the animation component formulas
    const isMissileWpn = fire.wpnName && (
      fire.wpnName.toLowerCase().includes('missile') ||
      fire.wpnName.toLowerCase().includes('rocket')
    );
    const travelMs = isMissileWpn
      ? Math.round(120 + distPx * 1.1)   // matches MissileSwarm formula
      : Math.round(40  + distPx * 0.5);  // matches BeamWeapon formula

    if (fire.type === 'shield') {
      // Two beams, delayed explosion on shield
      setShieldFlash(eid);
      setTimeout(() => setShieldFlash(null), 900 + travelMs);
      const bc=fire.wpnColor||TEAL;
      const wt=fire.wpnName&&(fire.wpnName.toLowerCase().includes('missile')||fire.wpnName.toLowerCase().includes('rocket'))?'missile':'laser';
      addBeam(wingTop.x, wingTop.y, aimX, aimY, bc, wt);
      addBeam(wingBottom.x, wingBottom.y, aimX, aimY, bc, wt);
      // Shield ripple fires on impact
      setTimeout(() => {
        setCombatResult({txt:'⊕ SHIELD ABSORBED', color: TEAL, key: Date.now()});
      }, travelMs);
    } else if (fire.type === 'hit') {
      const bc2=fire.wpnColor||TEAL;
      const wt2=fire.wpnName&&(fire.wpnName.toLowerCase().includes('missile')||fire.wpnName.toLowerCase().includes('rocket'))?'missile':'laser';
      addBeam(wingTop.x, wingTop.y, aimX, aimY, bc2, wt2);
      addBeam(wingBottom.x, wingBottom.y, aimX, aimY, bc2, wt2);
      // Explosion fires on impact
      addExplosion(aimX, aimY, RED, travelMs);
      setTimeout(() => {
        setHitEnemy(h => ({ ...h, [eid]: true }));
        setTimeout(() => setHitEnemy(h => ({ ...h, [eid]: false })), 320);
        setCombatResult({txt: '-' + fire.dmg + ' DMG', color: RED, key: Date.now()});
      }, travelMs);
    } else if (fire.type === 'destroy') {
      const bc3=fire.wpnColor||TEAL;
      const wt3=fire.wpnName&&(fire.wpnName.toLowerCase().includes('missile')||fire.wpnName.toLowerCase().includes('rocket'))?'missile':'laser';
      addBeam(wingTop.x, wingTop.y, aimX, aimY, bc3, wt3);
      addBeam(wingBottom.x, wingBottom.y, aimX, aimY, bc3, wt3);
      // Destruction sequence fires on impact
      setTimeout(() => {
        setDestroyAnim(s => new Set([...s, eid]));
        setCombatResult({txt: '💥 DESTROYED', color: RED, key: Date.now()});
        [0, 180, 360].forEach((delay, i) => {
          addExplosion(targetX + (i-1)*3, targetY + (i%2===0?-4:4), i===1?YEL:RED, delay);
        });
      }, travelMs);
    }
    setTimeout(() => setCombatResult(null), travelMs + 1800);

    // ── MABEL ship-computer reaction ────────────────────────────────────
    if (fire.type === 'hit' || fire.type === 'destroy' || fire.type === 'shield') {
      const tgt = displayEnemies.find(e => e.id === eid);
      const disposition = tgt ? (() => {
        const pct = tgt.hp / Math.max(1, tgt.hpMax || tgt.hp);
        if (pct > 0.6) return 'DEFIANT'; if (pct > 0.35) return 'ENGAGED';
        if (pct > 0.15) return 'RATTLED'; return 'DESPERATE';
      })() : 'UNKNOWN';
      const combatState = {
        round: ctBrief?.round || 1,
        active: true,
        mode: ctBrief?.mode || 'ship',
        playerHP: { cole: ctBrief?.coleHP ?? 20, vela: ctBrief?.velaHP ?? 20 },
        shipHull: ctBrief?.gs?.ship?.hull ?? 20,
        enemies: displayEnemies.map(e => ({ name: e.name, faction: e.faction, hp: e.hp, hpMax: e.hpMax || e.hp })),
        lastAction: fire.type === 'destroy'
          ? `Fired ${fire.wpnName || 'weapon'} at ${tgt?.name || 'target'} — DESTROYED`
          : fire.type === 'shield'
          ? `Fired ${fire.wpnName || 'weapon'} at ${tgt?.name || 'target'} — shield absorbed`
          : `Fired ${fire.wpnName || 'weapon'} at ${tgt?.name || 'target'} for ${fire.dmg} damage (${disposition})`,
        commsOpen: false,
      };
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 120,
          system: "You are MABEL, the AI ship computer aboard The Inconceivable. You are monitoring an active combat situation. Respond in 1-2 sharp sentences max. You are terse, dry, slightly sardonic, loyal. React specifically to what just happened — reference the actual enemy faction, HP numbers, or action taken. Never say 'I understand' or 'certainly'. No asterisk actions.",
          messages: [{ role: 'user', content: JSON.stringify(combatState) }],
        }),
      })
        .then(r => r.json())
        .then(d => {
          const t = d.content && d.content.find(b => b.type === 'text');
          if (t && t.text) setMabelLine(t.text.slice(0, 120));
        })
        .catch(() => {});
    }
  }, [ctBrief?.lastFire]);

  // Tab enter: warp in player ship from the left
  useEffect(() => {
    if (tab === 'COMBAT' && prevTab.current !== 'COMBAT') {
      setPlayerShipState('warping');
      setTimeout(() => setPlayerShipState('landed'), 1800);
    }
    if (tab !== 'COMBAT') {
      setPlayerShipState('hidden');
    }
    prevTab.current = tab;
  }, [tab]);

  // ── MABEL COMMS channel — fires when overlay opens ───────────────────────
  useEffect(() => {
    if (!commsOpen || !selectedEnemy) return;
    const faction = selectedEnemy.faction || 'UNKNOWN';
    const disposition = (() => {
      const pct = selectedEnemy.hp / Math.max(1, selectedEnemy.hpMax || selectedEnemy.hp);
      if (pct > 0.6) return 'DEFIANT'; if (pct > 0.35) return 'ENGAGED';
      if (pct > 0.15) return 'RATTLED'; return 'DESPERATE';
    })();
    setCommsLine('');
    setCommsLoading2(true);
    const systemPrompt = active
      ? `You are MABEL, advising your crew during an open communication channel with an enemy vessel. The enemy is ${faction}, currently ${disposition}. Speak in 2-3 sentences as a tactical advisor. Be specific about what you know about this faction. You can be suspicious, wry, or cautiously optimistic depending on disposition. Never be generic. No asterisk actions.`
      : `You are MABEL, the ship AI aboard The Inconceivable. Your crew is opening diplomatic comms with a ${faction} vessel BEFORE combat has started. This is a chance to resolve things without firing. Speak in 2-3 sentences — assess the situation, note any leverage or risk, and advise on approach. Be dry, specific, and characterful. No asterisk actions.`;
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 200,
        system: systemPrompt,
        messages: [{ role: 'user', content: `Opening comms with ${selectedEnemy.name} (${faction}${active ? ', '+disposition : ', no shots fired yet'}). HP: ${selectedEnemy.hp}/${selectedEnemy.hpMax || selectedEnemy.hp}. Advise.` }],
      }),
    })
      .then(r => r.json())
      .then(d => {
        const t = d.content && d.content.find(b => b.type === 'text');
        if (t && t.text) setCommsLine(t.text);
      })
      .catch(() => setCommsLine('[SIGNAL DEGRADED]'))
      .finally(() => setCommsLoading2(false));
  }, [commsOpen]);

  const addBeam = (x1pct, y1pct, x2pct, y2pct, color, weaponType='laser') => {
    const id = Date.now() + Math.random();
    if (weaponType === 'missile') {
      setMissiles(p => [...p, { id, x1pct, y1pct, x2pct, y2pct, color }]);
    } else {
      setBeams(p => [...p, { id, x1pct, y1pct, x2pct, y2pct, color, weaponType }]);
    }
  };
  const addExplosion = (x, y, color, delay=0) => {
    setTimeout(() => {
      const id = Date.now() + Math.random();
      setExplosions(p => [...p, { id, x, y, color }]);
      setTimeout(() => setExplosions(p => p.filter(e => e.id !== id)), 700);
    }, delay);
  };

  useEffect(() => {
    if (!active) return;
    const coleDmg = (prevColeHP.current ?? coleHP) > (coleHP ?? 0);
    const velaDmg = (prevVelaHP.current ?? velaHP) > (velaHP ?? 0);
    if (coleDmg || velaDmg) {
      addBeam(74, 50, 11, 50, RED, 'laser');
      setHitPlayer(true);
      addExplosion(11, 50, RED);
      setTimeout(() => setHitPlayer(false), 320);
    }
    prevColeHP.current = coleHP;
    prevVelaHP.current = velaHP;
  }, [coleHP, velaHP, active]);

  useEffect(() => {
    if (!active || !enemies.length) return;
    const displayEnemies = enemies.slice(0, 5);
    // Just track HP for reference — beams/explosions handled by lastFire system only
    enemies.forEach(e => { prevEnemyHP.current[e.id] = e.hp; });
  }, [enemies, active]);

  const displayEnemies = enemies.slice(0, 5);
  const eCount         = displayEnemies.length;
  const allDefeated    = enemies.length > 0 && enemies.every(e => e.hp <= 0);
  const playerDown     = coleHP === 0 && velaHP === 0;

  const selectedEnemy  = enemies.find(e => e.id === selectedEnemyId) || null;
  const enemyHpPct     = selectedEnemy ? selectedEnemy.hp / Math.max(1, selectedEnemy.hpMax || selectedEnemy.hp) : 1;
  const hailAvailable  = !!(active && selectedEnemy && !allDefeated && !playerDown && enemyHpPct < 0.5);

  const enemyDisposition = (enemy) => {
    if (!enemy || enemy.hp <= 0) return 'DESTROYED';
    const pct = enemy.hp / Math.max(1, enemy.hpMax || enemy.hp);
    if (pct > 0.6) return 'DEFIANT';
    if (pct > 0.35) return 'ENGAGED';
    if (pct > 0.15) return 'RATTLED';
    return 'DESPERATE';
  };
  const enemyDispositionColor = (enemy) => {
    const d = enemyDisposition(enemy);
    if (d === 'DEFIANT')   return RED;
    if (d === 'ENGAGED')   return YEL;
    if (d === 'RATTLED')   return ACC;
    if (d === 'DESPERATE') return TEAL;
    return '#ffffff33';
  };

  const coleHPDisp  = coleHP  != null ? coleHP  : (gs?.cole?.hp  ?? 20);
  const velaHPDisp  = velaHP  != null ? velaHP  : (gs?.vela?.hp  ?? 20);
  const coleMaxHP   = gs?.cole?.hpMax ?? 20;
  const velaMaxHP   = gs?.vela?.hpMax ?? 20;
  const shipHull    = gs?.ship?.hull    ?? 20;
  const shipHullMax = gs?.ship?.hullMax ?? 20;
  // Size locked: 4-enemy size (41px) is ideal. Cap there to prevent dead-enemy scale-up.
  const shipSize    = eCount >= 5 ? 35 : 41;

  const MiniBar = ({ val, max, color, h = 3 }) => (
    React.createElement('div', { style: { height: h, background: '#ffffff10', borderRadius: 1.5, overflow: 'hidden' } },
      React.createElement('div', { style: {
        height: '100%',
        width: `${Math.max(0, Math.min(100, (val / Math.max(1, max)) * 100))}%`,
        background: color, borderRadius: 1.5, transition: 'width 0.35s'
      } })
    )
  );

  return (
    <div style={{ position: 'relative', width: '100%', background: '#010208', display: 'flex', flexDirection: 'column', overflow: 'hidden', userSelect: 'none' }}>
      <style>{`
        @keyframes starDrift{from{transform:translateX(0)}to{transform:translateX(-60px)}}
        @keyframes explode{0%{transform:translate(-50%,-50%) scale(0.1);opacity:1}55%{transform:translate(-50%,-50%) scale(1.7);opacity:0.8}100%{transform:translate(-50%,-50%) scale(2.6);opacity:0}}
        @keyframes spark0{to{transform:translate(calc(-50% + 24px),calc(-50% - 20px));opacity:0}}
        @keyframes spark1{to{transform:translate(calc(-50% - 22px),calc(-50% - 14px));opacity:0}}
        @keyframes spark2{to{transform:translate(calc(-50% + 8px),calc(-50% + 24px));opacity:0}}
        @keyframes idleDrift{0%,100%{transform:translateY(0px)}50%{transform:translateY(-4px)}}
        @keyframes flameMorph{from{transform:scaleY(0.82) scaleX(0.95)}to{transform:scaleY(1.18) scaleX(1.05)}}
        @keyframes roundPulse{0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes hailPulse{0%,100%{opacity:0.7;box-shadow:0 0 6px rgba(0,255,208,0.27)}50%{opacity:1;box-shadow:0 0 16px rgba(0,255,208,0.6)}}
        @keyframes shieldGlow{0%,100%{opacity:0.55}50%{opacity:0.9}}
        @keyframes warpInLeft{0%{transform:translateX(-380px) scaleX(3.5) scaleY(0.3);opacity:0;filter:blur(28px) brightness(8) saturate(0);}8%{transform:translateX(-280px) scaleX(2.8) scaleY(0.4);opacity:0.15;filter:blur(22px) brightness(6) saturate(0.2);}22%{transform:translateX(-140px) scaleX(2.0) scaleY(0.65);opacity:0.45;filter:blur(14px) brightness(4) saturate(0.5);}40%{transform:translateX(-40px) scaleX(1.3) scaleY(0.85);opacity:0.75;filter:blur(6px) brightness(2.2) saturate(0.8);}58%{transform:translateX(18px) scaleX(0.96) scaleY(1.02);opacity:0.92;filter:blur(2px) brightness(1.5);}70%{transform:translateX(-10px) scaleX(1.01) scaleY(0.99);opacity:1;filter:blur(0) brightness(1.15);}80%{transform:translateX(5px);}88%{transform:translateX(-3px);}94%{transform:translateX(1.5px);}100%{transform:translateX(0) scaleX(1) scaleY(1);opacity:1;filter:blur(0) brightness(1);}}
        @keyframes warpTrailLeft1{0%{transform:translateX(-420px) scaleX(2.2);opacity:0;}12%{opacity:0.28;filter:blur(4px);}45%{transform:translateX(-50px);opacity:0.12;}100%{transform:translateX(0);opacity:0;}}
        @keyframes warpTrailLeft2{0%{transform:translateX(-500px) scaleX(2.8);opacity:0;}18%{opacity:0.18;filter:blur(8px);}55%{transform:translateX(-80px);opacity:0.06;}100%{transform:translateX(0);opacity:0;}}
        @keyframes warpTrailLeft3{0%{transform:translateX(-600px) scaleX(3.5);opacity:0;}22%{opacity:0.10;filter:blur(12px);}65%{transform:translateX(-120px);opacity:0.03;}100%{transform:translateX(0);opacity:0;}}
        @keyframes warpFlash{0%{opacity:0;}15%{opacity:0.55;}40%{opacity:0.2;}60%{opacity:0.08;}100%{opacity:0;}}
        @keyframes warpHorizStreak{0%{transform:translateX(-100%) scaleY(1);opacity:0;}10%{opacity:0.35;}50%{transform:translateX(100%) scaleY(0.3);opacity:0;}}
        @keyframes warpIn{0%{transform:translateX(280px) scaleX(1.7);opacity:0;filter:blur(20px) brightness(6);}18%{transform:translateX(90px) scaleX(1.25);opacity:0.5;filter:blur(9px) brightness(2.8);}52%{transform:translateX(-16px) scaleX(0.97);opacity:0.92;filter:blur(1px) brightness(1.4);}70%{transform:translateX(8px) scaleX(1.01);opacity:1;filter:blur(0) brightness(1.1);}84%{transform:translateX(-4px);}93%{transform:translateX(2px);}100%{transform:translateX(0) scaleX(1);opacity:1;filter:blur(0) brightness(1);}}
        @keyframes warpTrail1{0%{transform:translateX(340px) scaleX(1.8);opacity:0;}15%{opacity:0.22;}55%{transform:translateX(35px);opacity:0.08;}100%{transform:translateX(0);opacity:0;}}
        @keyframes warpTrail2{0%{transform:translateX(400px) scaleX(2.0);opacity:0;}20%{opacity:0.14;}60%{transform:translateX(65px);opacity:0.04;}100%{transform:translateX(0);opacity:0;}}
        @keyframes unknownPulse{0%,100%{opacity:0.35;box-shadow:0 0 12px rgba(255,32,96,0.2)}50%{opacity:0.6;box-shadow:0 0 24px rgba(255,32,96,0.4)}}
        @keyframes shieldRipple{0%{transform:translate(-50%,-50%) scale(0.7);opacity:1;border-width:4px}60%{opacity:0.6;border-width:2px}100%{transform:translate(-50%,-50%) scale(1.9);opacity:0;border-width:1px}}
        @keyframes shieldHex{0%{opacity:0.9;transform:translate(-50%,-50%) scale(0.85) rotate(0deg)}50%{opacity:0.5}100%{opacity:0;transform:translate(-50%,-50%) scale(1.6) rotate(15deg)}}
        @keyframes resultFloat{0%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}20%{opacity:1;transform:translateX(-50%) translateY(-6px) scale(1.08)}100%{opacity:0;transform:translateX(-50%) translateY(-38px) scale(0.9)}}
        @keyframes reticlePulse{0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes destroyFlash{0%{filter:brightness(1)}15%{filter:brightness(4) saturate(0)}35%{filter:brightness(0.3) saturate(0)}60%{filter:brightness(2) saturate(0)}100%{filter:brightness(0) saturate(0);opacity:0}}
        @keyframes commsSlideIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}
        @keyframes reticleScan{0%,100%{opacity:0.12}50%{opacity:0.35}}
      `}</style>

      {/* ── TOP BAR ── */}
      <div style={{ height:34, background:'#04070b', borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', alignItems:'center', padding:'0 10px', gap:8, zIndex:50, flexShrink:0 }}>
        <div style={{ width:5, height:5, borderRadius:'50%', background: active ? TEAL : 'rgba(255,255,255,0.1)', boxShadow: active ? '0 0 6px ' + TEAL : 'none', flexShrink:0, transition:'all 0.5s' }} />
        <span style={{ fontFamily:MONO, fontSize:7, color: active ? TEAL+'cc' : 'rgba(255,255,255,0.13)', letterSpacing:2,
          flex:1, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', maxWidth:420 }}>
          {mabelLine && active ? mabelLine : active ? 'MABEL // COMBAT ACTIVE' : 'MABEL // GHOST SIGNAL // STANDBY'}
        </span>
        <div style={{ flex:1 }}/>
        {allDefeated   && <span style={{ fontFamily:ORB, fontSize:9, color:ACC, letterSpacing:4, textShadow:'0 0 14px '+ACC }}>★ VICTORY ★</span>}
        {playerDown && !allDefeated && <span style={{ fontFamily:ORB, fontSize:9, color:RED, letterSpacing:4, textShadow:'0 0 14px '+RED }}>✕ DEFEAT ✕</span>}
      </div>

      {/* ── MAIN ROW ── */}
      <div style={{ display:'flex', flexDirection:'row', height:272, overflow:'hidden' }}>

        {/* LEFT PANEL: Crew */}
        <div style={{ width:100, flexShrink:0, background:'#06090e', border:'1px solid rgba(255,107,53,0.14)', borderRight:'1px solid rgba(255,107,53,0.14)', padding:'7px 6px', display:'flex', flexDirection:'column', gap:6, zIndex:45, overflow:'hidden' }}>
          <div style={{ fontFamily:MONO, fontSize:6, color:'rgba(255,255,255,0.1)', letterSpacing:2 }}>CREW</div>

          <div style={{ display:'flex', flexDirection:'column', gap:3, padding:'5px', background:'rgba(255,255,255,0.01)', borderRadius:2, border:'1px solid rgba(255,209,102,0.12)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:3 }}>
              <div style={{ width:4, height:4, borderRadius:'50%', background: coleHPDisp > 0 ? YEL : 'rgba(255,255,255,0.13)', flexShrink:0 }} />
              <span style={{ fontFamily:ORB, fontSize:7, color: coleHPDisp > 0 ? YEL : 'rgba(255,255,255,0.2)', letterSpacing:1, flex:1 }}>COLE</span>
              <span style={{ fontFamily:MONO, fontSize:7, color: coleHPDisp > 0 ? YEL+'99' : 'rgba(255,255,255,0.13)' }}>{coleHPDisp}</span>
            </div>
            <MiniBar val={coleHPDisp} max={coleMaxHP} color={YEL} h={3} />
            <div style={{ fontFamily:MONO, fontSize:5, color:'rgba(255,255,255,0.1)', letterSpacing:1 }}>HP</div>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:3, padding:'5px', background:'rgba(255,255,255,0.01)', borderRadius:2, border:'1px solid rgba(204,136,255,0.08)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:3 }}>
              <div style={{ width:4, height:4, borderRadius:'50%', background: velaHPDisp > 0 ? VELA : 'rgba(255,255,255,0.13)', flexShrink:0 }} />
              <span style={{ fontFamily:ORB, fontSize:7, color: velaHPDisp > 0 ? VELA : 'rgba(255,255,255,0.2)', letterSpacing:1, flex:1 }}>VELA</span>
              <span style={{ fontFamily:MONO, fontSize:7, color: velaHPDisp > 0 ? VELA+'99' : 'rgba(255,255,255,0.13)' }}>{velaHPDisp}</span>
            </div>
            <MiniBar val={velaHPDisp} max={velaMaxHP} color={VELA} h={3} />
            <div style={{ fontFamily:MONO, fontSize:5, color:'rgba(255,255,255,0.1)', letterSpacing:1 }}>HP</div>
          </div>

          <div style={{ marginTop:'auto', borderTop:'1px solid rgba(255,255,255,0.03)', paddingTop:5, display:'flex', flexDirection:'column', gap:3 }}>
            <div style={{ fontFamily:MONO, fontSize:5, color:'rgba(255,255,255,0.1)', letterSpacing:2 }}>SHIP</div>
            <div style={{ fontFamily:ORB, fontSize:6, color:TEAL, letterSpacing:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              {(gs?.ship?.name||'INCONCEIVABLE').toUpperCase()}
            </div>
            <MiniBar val={shipHull} max={shipHullMax} color={TEAL} h={3} />
            <div style={{ fontFamily:MONO, fontSize:5, color:'rgba(255,255,255,0.1)', letterSpacing:1 }}>HULL {shipHull}/{shipHullMax}</div>
          </div>
        </div>

        {/* CENTER: Battlefield */}
        <div style={{ flex:1, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, overflow:'hidden', zIndex:1 }}>{stars.map(s => <Star key={s.id} {...s} />)}</div>
          <div style={{ position:'absolute',inset:0,pointerEvents:'none',zIndex:40,background:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.18) 2px,rgba(0,0,0,0.18) 4px)' }}/>
          <div style={{ position:'absolute',inset:0,pointerEvents:'none',zIndex:39,background:'radial-gradient(ellipse at 50% 50%,rgba(0,255,180,0.018) 0%,transparent 68%)' }}/>
          <div style={{ position:'absolute',inset:0,pointerEvents:'none',zIndex:41,background:'radial-gradient(ellipse at 50% 50%,transparent 48%,rgba(0,0,0,0.82) 100%)' }}/>

          {combatResult && (
            <div key={combatResult.key} style={{ position:'absolute',left:'50%',top:'32%',
              fontFamily:ORB, fontSize:20, fontWeight:900,
              color:combatResult.color,
              textShadow:`0 0 28px ${combatResult.color}, 0 0 8px ${combatResult.color}88`,
              letterSpacing:5, whiteSpace:'nowrap',
              animation:'resultFloat 1.8s ease-out forwards',
              pointerEvents:'none', zIndex:50,
              transform:'translateX(-50%)' }}>
              {combatResult.txt}
            </div>
          )}

          {/* PLAYER SHIP */}
          <div style={{ position:'absolute',left:'5%',top:0,bottom:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,zIndex:10 }}>
            {shipHull > 0 && active && (
              <div style={{ position:'absolute', width:76, height:76, borderRadius:'50%', border:'1px solid rgba(0,255,208,0.27)', boxShadow:'0 0 14px rgba(0,255,208,0.13)', animation:'shieldGlow 3s ease-in-out infinite', pointerEvents:'none', zIndex:5 }} />
            )}
            {playerShipState==='warping' && (
              <>
                <div style={{ position:'absolute',top:'42%',left:'-20%',width:'140%',height:3,background:'linear-gradient(90deg,transparent,'+TEAL+'88,'+TEAL+'cc,transparent)',animation:'warpHorizStreak 1.4s ease-out forwards',pointerEvents:'none',zIndex:8 }}/>
                <div style={{ position:'absolute',top:'50%',left:'-20%',width:'140%',height:2,background:'linear-gradient(90deg,transparent,'+TEAL+'44,'+TEAL+'88,transparent)',animation:'warpHorizStreak 1.4s ease-out 0.06s forwards',pointerEvents:'none',zIndex:8 }}/>
                <div style={{ position:'absolute',top:'58%',left:'-20%',width:'140%',height:2,background:'linear-gradient(90deg,transparent,'+TEAL+'33,'+TEAL+'66,transparent)',animation:'warpHorizStreak 1.4s ease-out 0.12s forwards',pointerEvents:'none',zIndex:8 }}/>
                <div style={{ position:'absolute',inset:-30,background:'radial-gradient(ellipse,'+TEAL+'55 0%,transparent 70%)',animation:'warpFlash 1.6s ease-out forwards',pointerEvents:'none',zIndex:7 }}/>
                <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',animation:'warpTrailLeft3 1.6s cubic-bezier(0.22,1,0.36,1) forwards',pointerEvents:'none',filter:'blur(14px) hue-rotate(40deg)',opacity:0 }}><ShipDisplay isPlayer={true} size={active?66:54} facing="right"/></div>
                <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',animation:'warpTrailLeft2 1.4s cubic-bezier(0.22,1,0.36,1) forwards',pointerEvents:'none',filter:'blur(8px) hue-rotate(20deg)',opacity:0 }}><ShipDisplay isPlayer={true} size={active?66:54} facing="right"/></div>
                <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',animation:'warpTrailLeft1 1.2s cubic-bezier(0.22,1,0.36,1) forwards',pointerEvents:'none',filter:'blur(4px)',opacity:0 }}><ShipDisplay isPlayer={true} size={active?66:54} facing="right"/></div>
              </>
            )}
            <div style={{ animation: playerShipState==='warping' ? 'warpInLeft 1.6s cubic-bezier(0.16,1,0.3,1) forwards' : hitPlayer ? 'none' : 'idleDrift 4.2s ease-in-out infinite', position:'relative', zIndex:10 }}>
              <ShipDisplay isPlayer={true} size={active?66:54} facing="right" hit={hitPlayer} defeated={playerDown&&!allDefeated}/>
            </div>
          </div>

          {/* ENEMY SHIPS */}
          <div style={{ position:'absolute',right:'1%',top:0,bottom:0,width:'46%',zIndex:10 }}>
            {eCount===0 && !active && (
              <div style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:8 }}>
                <svg width="44" height="44" viewBox="0 0 56 56" style={{opacity:0.2,animation:'idleDrift 5s ease-in-out infinite'}}>
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#FF6B35" strokeWidth="1" strokeDasharray="4 4"/>
                  <circle cx="28" cy="28" r="14" fill="none" stroke="#FF6B35" strokeWidth="1" opacity="0.6"/>
                  <circle cx="28" cy="28" r="3" fill="#FF6B35" opacity="0.5"/>
                  <line x1="28" y1="2" x2="28" y2="12" stroke="#FF6B35" strokeWidth="1"/>
                  <line x1="28" y1="44" x2="28" y2="54" stroke="#FF6B35" strokeWidth="1"/>
                  <line x1="2" y1="28" x2="12" y2="28" stroke="#FF6B35" strokeWidth="1"/>
                  <line x1="44" y1="28" x2="54" y2="28" stroke="#FF6B35" strokeWidth="1"/>
                </svg>
                <div style={{ fontFamily:MONO,fontSize:6,color:'rgba(255,107,53,0.19)',letterSpacing:3 }}>NO TARGETS</div>
              </div>
            )}
            {eCount===0 && active && (
              <div style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:6 }}>
                <div style={{ width:60,height:60,border:'2px solid rgba(255,32,96,0.4)',borderRadius:4,background:'#0a0005',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:4,animation:'unknownPulse 2.2s ease-in-out infinite' }}>
                  <div style={{ fontFamily:MONO,fontSize:18,color:'rgba(255,32,96,0.53)' }}>?</div>
                  <div style={{ fontFamily:MONO,fontSize:5,color:'rgba(255,32,96,0.33)',letterSpacing:2 }}>UNKNOWN</div>
                </div>
              </div>
            )}

            {(()=>{
              const FMTS=[
                [{x:50,y:50}],
                [{x:38,y:26},{x:62,y:74}],
                [{x:36,y:50},{x:60,y:18},{x:60,y:82}],
                [{x:34,y:50},{x:56,y:18},{x:56,y:82},{x:80,y:50}],
                [{x:32,y:50},{x:52,y:16},{x:52,y:84},{x:72,y:28},{x:72,y:72}],
              ];
              const fmt = eCount > 0 ? (FMTS[Math.min(eCount,5)-1]||FMTS[0]) : [];
              return displayEnemies.map((enemy,idx)=>{
                const pos       = fmt[idx] || {x:50,y:50};
                const eColor    = FACTION_COLOR[enemy.faction] || FACTION_COLOR.NONE;
                const isDefeated= enemy.hp <= 0;
                const isSelected= enemy.id === selectedEnemyId;
                const isLeader  = idx === 0;
                const shipSt    = shipStates[enemy.id] || 'landed';
                const destroyed = destroyAnim.has(enemy.id);
                const driftDelay= (idx * 0.6).toFixed(1) + 's';
                return (
                  <div key={enemy.id}
                    onClick={() => !isDefeated && onSelectEnemy && onSelectEnemy(enemy.id)}
                    style={{ position:'absolute', left:pos.x+'%', top:pos.y+'%', transform:'translate(-50%,-50%)', cursor: isDefeated ? 'default' : 'pointer', zIndex: isSelected ? 12 : 10 }}>
                    {(enemy.shields||0) > 0 && !isDefeated && (
                      <div style={{ position:'absolute',left:'50%',top:'50%',width:shipSize*1.7,height:shipSize*1.7,transform:'translate(-50%,-50%)', border:'1px solid '+eColor+'77', borderRadius:'50%', boxShadow:'0 0 10px '+eColor+'33', animation:'shieldGlow 2s ease-in-out infinite', pointerEvents:'none', zIndex:5 }}/>
                    )}
                    {shieldFlash===enemy.id && (
                      <>
                        <div style={{ position:'absolute',left:'50%',top:'50%',width:shipSize*2,height:shipSize*2,border:'3px solid '+eColor,borderRadius:'50%',animation:'shieldRipple 0.5s ease-out forwards',pointerEvents:'none',zIndex:16 }}/>
                        <div style={{ position:'absolute',left:'50%',top:'50%',width:shipSize*1.8,height:shipSize*1.8,border:'2px solid '+eColor+'cc',borderRadius:6,animation:'shieldHex 0.45s ease-out forwards',pointerEvents:'none',zIndex:15 }}/>
                      </>
                    )}
                    {isSelected && !isDefeated && (
                      <div style={{ position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',pointerEvents:'none',zIndex:14,animation:'reticlePulse 1.2s ease-in-out infinite' }}>
                        <svg width={shipSize+32} height={shipSize+32} viewBox="0 0 100 100" style={{overflow:'visible',display:'block'}}>
                          {/* Corner bracket TL */}
                          <path d="M 6 24 L 6 6 L 24 6" fill="none" stroke={eColor} strokeWidth="2.2" strokeLinecap="square" opacity="0.9"/>
                          {/* Corner bracket TR */}
                          <path d="M 76 6 L 94 6 L 94 24" fill="none" stroke={eColor} strokeWidth="2.2" strokeLinecap="square" opacity="0.9"/>
                          {/* Corner bracket BL */}
                          <path d="M 6 76 L 6 94 L 24 94" fill="none" stroke={eColor} strokeWidth="2.2" strokeLinecap="square" opacity="0.9"/>
                          {/* Corner bracket BR */}
                          <path d="M 94 76 L 94 94 L 76 94" fill="none" stroke={eColor} strokeWidth="2.2" strokeLinecap="square" opacity="0.9"/>
                          {/* Axis ticks */}
                          <line x1="50" y1="1" x2="50" y2="10" stroke={eColor} strokeWidth="1" strokeOpacity="0.45"/>
                          <line x1="50" y1="90" x2="50" y2="99" stroke={eColor} strokeWidth="1" strokeOpacity="0.45"/>
                          <line x1="1" y1="50" x2="10" y2="50" stroke={eColor} strokeWidth="1" strokeOpacity="0.45"/>
                          <line x1="90" y1="50" x2="99" y2="50" stroke={eColor} strokeWidth="1" strokeOpacity="0.45"/>
                          {/* Center ring */}
                          <circle cx="50" cy="50" r="5" fill="none" stroke={eColor} strokeWidth="0.8" strokeOpacity="0.35"/>
                          {/* Center dot */}
                          <circle cx="50" cy="50" r="1.5" fill={eColor} opacity="0.6"/>
                          {/* Scanning sweep line */}
                          <line x1="10" y1="50" x2="90" y2="50" stroke={eColor} strokeWidth="0.6" strokeOpacity="0.12" style={{animation:'reticleScan 2.4s ease-in-out infinite'}}/>
                          {/* Corner accent dots */}
                          <circle cx="6" cy="6" r="1.5" fill={eColor} opacity="0.5"/>
                          <circle cx="94" cy="6" r="1.5" fill={eColor} opacity="0.5"/>
                          <circle cx="6" cy="94" r="1.5" fill={eColor} opacity="0.5"/>
                          <circle cx="94" cy="94" r="1.5" fill={eColor} opacity="0.5"/>
                        </svg>
                      </div>
                    )}
                    {active && !isDefeated && (
                      <div style={{ position:'absolute',bottom:-14,left:'50%',transform:'translateX(-50%)', fontFamily:MONO,fontSize:6,color:eColor,letterSpacing:1,whiteSpace:'nowrap',textShadow:'0 0 6px '+eColor+'77',pointerEvents:'none' }}>
                        {enemy.hp}/{enemy.hpMax||enemy.hp}
                      </div>
                    )}
                    <div style={{ animation: shipSt==='warping' ? 'warpIn 1.4s cubic-bezier(0.16,1,0.3,1) forwards' : destroyed ? 'destroyFlash 1.2s ease-out forwards' : 'idleDrift 3.8s ease-in-out '+driftDelay+' infinite' }}>
                      <ShipDisplay faction={enemy.faction} isBoss={enemy.isBoss} isLeader={isLeader && eCount>1} size={shipSize} facing="left" defeated={isDefeated} hit={!!hitEnemy[enemy.id]} eColor={eColor}/>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Weapons */}
          {beams.map(b=>(
            <BeamWeapon key={b.id} x1pct={b.x1pct} y1pct={b.y1pct} x2pct={b.x2pct} y2pct={b.y2pct} color={b.color} weaponType={b.weaponType} onDone={()=>setBeams(prev=>prev.filter(x=>x.id!==b.id))}/>
          ))}
          {missiles.map(m=>(
            <MissileSwarm key={m.id} x1pct={m.x1pct} y1pct={m.y1pct} x2pct={m.x2pct} y2pct={m.y2pct} color={m.color} onDone={()=>setMissiles(prev=>prev.filter(x=>x.id!==m.id))}/>
          ))}
          {explosions.map(e=><Explosion key={e.id} x={e.x} y={e.y} color={e.color}/>)}

          {/* COMMS OVERLAY */}
          {commsOpen && (
            <div style={{ position:'absolute',inset:0,background:'rgba(1,2,8,0.93)',zIndex:60,display:'flex',flexDirection:'column',padding:'10px 12px',animation:'commsSlideIn 0.2s ease-out' }}>
              <div style={{ fontFamily:MONO,fontSize:6,color:TEAL+'88',letterSpacing:4,textAlign:'center',marginBottom:8 }}>⬡ COMM CHANNEL OPEN ⬡</div>
              <div style={{ display:'flex',gap:10,flex:1 }}>
                <div style={{ flex:1,border:'1px solid rgba(0,255,208,0.17)',borderRadius:3,padding:'8px',display:'flex',flexDirection:'column',alignItems:'center',gap:5,background:'rgba(0,255,208,0.02)' }}>
                  <div style={{ fontFamily:MONO,fontSize:5,color:TEAL+'77',letterSpacing:2 }}>OUR SIGNAL</div>
                  <div style={{ width:46,height:62,border:'1px solid rgba(0,255,208,0.23)',borderRadius:2,background:'rgba(0,255,208,0.03)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:2 }}>
                    <div style={{ fontFamily:ORB,fontSize:16,color:TEAL }}>M</div>
                    <div style={{ fontFamily:MONO,fontSize:4,color:TEAL+'55',letterSpacing:1 }}>ONLINE</div>
                  </div>
                  <div style={{ fontFamily:ORB,fontSize:7,color:TEAL,letterSpacing:2 }}>MABEL</div>
                  {commsLoading2 && <div style={{ fontFamily:MONO,fontSize:5,color:TEAL+'55',letterSpacing:1,animation:'roundPulse 1s ease-in-out infinite' }}>CONNECTING...</div>}
                  {commsLine && !commsLoading2 && <div style={{ fontFamily:MONO,fontSize:6,color:TEAL+'cc',lineHeight:1.5,textAlign:'center',marginTop:2,padding:'0 2px' }}>{commsLine}</div>}
                </div>
                <div style={{ flex:1,border:'1px solid rgba(255,255,255,0.07)',borderRadius:3,padding:'8px',display:'flex',flexDirection:'column',alignItems:'center',gap:5,background:'rgba(255,255,255,0.01)' }}>
                  <div style={{ fontFamily:MONO,fontSize:5,color:'rgba(255,255,255,0.17)',letterSpacing:2 }}>ENEMY SIGNAL</div>
                  <div style={{ width:46,height:62,border:'1px solid rgba(255,255,255,0.07)',borderRadius:2,background:'rgba(255,255,255,0.02)',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:2 }}>
                    <div style={{ fontFamily:ORB,fontSize:16,color:'rgba(255,255,255,0.2)' }}>?</div>
                    {selectedEnemy && <div style={{ fontFamily:MONO,fontSize:4,color:(FACTION_COLOR[selectedEnemy.faction]||'#ffffff')+'44',letterSpacing:1 }}>{selectedEnemy.faction}</div>}
                  </div>
                  <div style={{ fontFamily:ORB,fontSize:7,color:selectedEnemy?(FACTION_COLOR[selectedEnemy.faction]||'rgba(255,255,255,0.33)'):'rgba(255,255,255,0.13)',letterSpacing:1 }}>{selectedEnemy?.name||'UNKNOWN'}</div>
                  {selectedEnemy && <div style={{ fontFamily:MONO,fontSize:6,color:enemyDispositionColor(selectedEnemy),letterSpacing:2 }}>{enemyDisposition(selectedEnemy)}</div>}
                </div>
              </div>
              {/* MABEL advisory text — framed terminal block */}
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
                  <button key={opt} onClick={()=>setCommsOpen(false)}
                    style={{ fontFamily:MONO,fontSize:6,letterSpacing:2,padding:'4px 9px',background:'transparent', border:'1px solid '+(opt==='REJECT'?RED:opt==='DEMAND'?YEL:TEAL)+'33', color:opt==='REJECT'?RED:opt==='DEMAND'?YEL:TEAL, cursor:'pointer',borderRadius:2 }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Portrait comms */}
        <PortraitPanel
          selectedEnemy={selectedEnemy}
          mabelLine={mabelLine}
          mabelLoading={false}
          commsLine={commsLine}
          commsLoading={commsLoading2}
          commsOpen={commsOpen}
          active={active}
        />

      </div>

      {/* ── BOTTOM ACTION BAR ── */}
      <div style={{ height:40,background:'#04070b',borderTop:'1px solid rgba(255,255,255,0.03)',display:'flex',alignItems:'center',padding:'0 10px',gap:8,zIndex:50,flexShrink:0 }}>
        {active && !allDefeated && !playerDown && (
          <div style={{ fontFamily:MONO,fontSize:7,color:ACC,letterSpacing:3,animation:'roundPulse 2s ease-in-out infinite',minWidth:60 }}>
            RND {round}
          </div>
        )}
        <div style={{ flex:1 }}/>
        {!commsOpen && selectedEnemy && selectedEnemy.hp > 0 && (
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
        )}
        {commsOpen && (
          <button onClick={()=>setCommsOpen(false)}
            style={{ fontFamily:MONO,fontSize:7,letterSpacing:2,padding:'4px 9px', background:'rgba(255,32,96,0.04)', border:'1px solid rgba(255,32,96,0.2)', color:RED, cursor:'pointer',borderRadius:2 }}>
            CLOSE
          </button>
        )}
        {(!active || allDefeated || playerDown) && (
          <div style={{ fontFamily:MONO,fontSize:6,color:'rgba(255,255,255,0.06)',letterSpacing:3 }}>STANDBY</div>
        )}
      </div>

    </div>
  );
}
