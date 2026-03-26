import React, { useState, useEffect, useRef } from 'react';
import FactionIcon from './FactionIcon.jsx';

const MONO = "'Share Tech Mono', monospace";
const ORB  = "'Orbitron', sans-serif";
const TEAL = '#00FFD0';

const FACTION_COLOR = {
  CORSAIR: '#FFD166', ISF: '#00BFFF', WARG: '#FF2060',
  MEDUSA: '#cc88ff', SYNTH: '#00FFD0', ALIEN: '#9090b8',
  WANTED: '#FF6B35', NONE: '#9090b8',
};

// ── Portrait pools — random pick per enemy ─────────────────────────────────
const PORTRAIT_POOL = {
  WARG:    ['/portraits/warg-01.png','/portraits/warg-02.png','/portraits/warg-03.png'],
  CORSAIR: ['/portraits/raider-01.png','/portraits/raider-02.png','/portraits/raider-03.png'],
  MEDUSA:  ['/portraits/medusa-01.png','/portraits/medusa-02.png','/portraits/medusa-03.png','/portraits/medusa-04.png'],
  ISF:     ['/portraits/isf-02.png'],
  SYNTH:   ['/portraits/synth-02.png','/portraits/synth-05.png','/portraits/synth-07.png','/portraits/synth-08.png','/portraits/synth-09.png'],
  ALIEN:   ['/portraits/alien-01.png','/portraits/alien-03.png','/portraits/alien-05.png','/portraits/alien-06.png','/portraits/alien-07.png','/portraits/alien-09.png'],
  WANTED:  ['/portraits/bounty-01.png','/portraits/bounty-02.png','/portraits/bounty-03.png','/portraits/bounty-04.png','/portraits/bounty-05.png','/portraits/bounty-06.png','/portraits/bounty-07.png','/portraits/bounty-08.png','/portraits/bounty-10.png'],
};

const pickPortrait = (faction) => {
  const pool = PORTRAIT_POOL[faction];
  if (!pool || !pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
};

const iconFilter = (color, distorted = false) => {
  const base = `invert(1) drop-shadow(0 0 6px ${color}dd) drop-shadow(0 0 2px ${color}) brightness(0.92)`;
  return distorted ? `${base} blur(1.8px)` : base;
};

// ── Canvas static noise ────────────────────────────────────────────────────
function StaticNoise({ color = '#ffffff', size = 54 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      for (let i = 0; i < 340; i++) {
        const x = Math.random() * size, y = Math.random() * size;
        const r = Math.random() < 0.05 ? 2 : 1;
        const alpha = 0.07 + Math.random() * 0.32;
        ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2,'0');
        ctx.fillRect(x, y, r, r);
      }
      if (Math.random() < 0.18) {
        const gy = Math.random() * size;
        ctx.fillStyle = color + '33';
        ctx.fillRect(0, gy, size, 1 + Math.random() * 2.5);
      }
    };
    draw();
    const iv = setInterval(draw, 80);
    return () => clearInterval(iv);
  }, [color, size]);
  return (
    <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
      <canvas ref={canvasRef} style={{ display:'block', width:size, height:size }}/>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', gap:3 }}>
        <div style={{ fontFamily:MONO, fontSize:5, color, letterSpacing:2,
          animation:'signalBlink 1.1s step-end infinite', textAlign:'center', lineHeight:1.9 }}>
          {'⬡ UNKNOWN\nVESSEL ⬡'}
        </div>
      </div>
    </div>
  );
}

// ── Faction banner (crest) with glitch — pre-comms known faction ───────────
function FactionBanner({ faction, color, commsOpen }) {
  return (
    <div style={{ width:54, height:54, position:'relative', flexShrink:0,
      border:`1px solid ${color}${commsOpen ? '55' : '28'}`,
      borderRadius:3, background:`${color}06`, overflow:'hidden',
      display:'flex', alignItems:'center', justifyContent:'center',
      transition:'border-color 0.4s' }}>
      <div style={{
        opacity: commsOpen ? 0 : 0.85,
        transition:'opacity 0.5s',
        '--gf': `drop-shadow(0 0 8px ${color}cc)`,
        animation: commsOpen ? 'none' : 'glitchShift 1.8s ease-in-out infinite',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <FactionIcon faction={faction} size={38} color={color} />
      </div>
      {/* Scanlines while distorted */}
      {!commsOpen && (
        <div style={{ position:'absolute', inset:0, pointerEvents:'none',
          background:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.25) 3px,rgba(0,0,0,0.25) 4px)',
          animation:'scanlines 0.18s linear infinite', zIndex:2 }}/>
      )}
    </div>
  );
}

// ── Talk waveform ──────────────────────────────────────────────────────────
function TalkWave({ color, visible, loading }) {
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
}

// ── Quip bubble ────────────────────────────────────────────────────────────
function QuipBubble({ text, color, loading }) {
  const display = text ? text.slice(0, 90) + (text.length > 90 ? '…' : '') : '';
  return (
    <div style={{ width:'100%', minHeight:28, padding:'4px 5px',
      background:`${color}0a`, border:`1px solid ${color}22`,
      borderRadius:3, boxSizing:'border-box' }}>
      {loading
        ? <div style={{ display:'flex', gap:3, padding:'4px 0', justifyContent:'center' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width:3, height:3, borderRadius:'50%', background:color,
                animation:`dotPulse 1.2s ease-in-out ${i*0.2}s infinite` }}/>
            ))}
          </div>
        : <div style={{ fontFamily:MONO, fontSize:6, color:`${color}cc`,
            lineHeight:1.6, letterSpacing:0.5, wordBreak:'break-word' }}>
            {display}
          </div>
      }
    </div>
  );
}

// ── MABEL face SVG ─────────────────────────────────────────────────────────
function MabelFace({ size = 54, talking = false, loading = false }) {
  const glow = loading ? `0 0 18px ${TEAL}cc, 0 0 6px ${TEAL}88` : `0 0 8px ${TEAL}44`;
  return (
    <div style={{ width:size, height:size, borderRadius:'50%',
      border:`1.5px solid ${TEAL}${loading?'bb':'33'}`,
      background:'#020d0a', boxShadow:glow, overflow:'hidden',
      display:'flex', alignItems:'center', justifyContent:'center',
      transition:'box-shadow 0.5s, border-color 0.5s', flexShrink:0 }}>
      <svg viewBox="80 50 355 430" width={size-6} height={size-6}
        style={{ display:'block', overflow:'visible' }}>
        <path fill={TEAL} fillOpacity={loading?0.92:0.7}
          style={{ transition:'fill-opacity 0.5s' }}
          d="M212.103,408.644c28.22,9.692,59.575,9.692,87.795,0v56.725h-87.795V408.644z M208.967,394.106 c-46.748-19.098-76.963-63.851-76.963-114.875v-62.426c78.959-27.935,110.884-70.977,123.141-93.781 c10.262,23.659,40.192,67.271,124.567,94.351l-0.855,72.972h-31.926l-19.668-19.668c-6.151-5.467-14.706,2.968-8.837,8.837 l21.664,21.379c2.974,2.974,3.835,1.183,37.056,1.71c-2.565,14.538-7.696,27.935-15.108,40.192h-39.052 c-3.438,0-3.134,0.569-21.662,19.097c-2.722,2.722-4.362,6.959-1.613,9.708c4.607,4.607,9.308-0.014,9.308-0.014l16.533-16.533 h27.935C319.761,399.044,260.951,415.194,208.967,394.106z M214.098,214.811H166.78c-3.421,0-6.271,2.851-6.271,6.271 c0,3.42,2.85,6.271,6.271,6.271h11.402c-1.425,2.565-2.565,4.846-2.565,7.981c0,7.696,6.271,13.967,13.967,13.967 c9.784,0,18.276-10.95,11.402-21.949h13.682C223.074,227.353,221.842,214.811,214.098,214.811z M285.075,332.536 c0-3.421-2.85-6.271-6.271-6.271h-45.608c-3.421,0-6.271,2.85-6.271,6.271c0,3.706,2.85,6.271,6.271,6.271h45.608 C282.225,338.807,285.075,336.241,285.075,332.536z M296.762,227.353h11.402c-1.425,2.565-2.565,4.846-2.565,7.981 c0,7.696,6.271,13.967,13.968,13.967c9.784,0,18.276-10.95,11.402-21.949h13.682c8.406,0,7.174-12.542-0.57-12.542h-47.318 c-3.421,0-6.271,2.851-6.271,6.271C290.491,224.502,293.341,227.353,296.762,227.353z M120.602,291.489h-15.108l-5.986,173.595 H199.56v-62.141C154.808,382.989,125.163,340.517,120.602,291.489z M406.769,291.508l-15.656-0.019 c-0.26,5.709-0.953,11.396-2.184,16.977c-3.349,15.193-9.336,29.646-17.2,42.598c-0.285,0.285-0.285,0.57-0.57,0.855 c-13.967,21.949-33.921,39.907-58.72,51.024v62.141h100.052L406.769,291.508z M248.404,107.023 c0.827-2.165,2.218-4.068,4.006-5.542l0.01-0.009c1.919-1.582,4.713-1.497,6.532,0.198 c1.823,1.698,3.144,3.859,3.808,6.26c3.905,14.131,25.354,68.351,124.077,98.613h19.098 c0.285-3.706,0-9.122-0.285-13.682c0-70.972-29.388-123.117-97.487-139.959c-26.935-6.966-50.951-6.188-52.449-6.271 c-80.403,0-136.037,35.46-147.94,114.02c-0.57,3.135-1.995,33.066-2.28,45.893h18.813 C217.018,174.395,243.27,120.455,248.404,107.023z M102.359,279.517h17.673v-60.43h-17.673 c-16.533,0-30.215,13.682-30.215,30.215C72.144,265.834,85.826,279.517,102.359,279.517z M391.968,279.517h17.673 c16.533,0,30.215-13.682,30.215-30.215c0-16.533-13.397-30.215-30.215-30.215h-17.673V279.517z"/>
        <rect x={231} y={327} width={52} height={9} rx={3} fill={TEAL}
          style={{ transformOrigin:'257px 331px',
            animation: talking ? 'mabelTalk 0.38s ease-in-out infinite' : 'none',
            opacity: talking ? 1 : 0, transition:'opacity 0.2s' }}/>
      </svg>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────
export default function PortraitPanel({
  selectedEnemy, mabelLine, mabelLoading,
  commsLine, commsLoading, commsOpen, active,
}) {
  const [mabelTalking, setMabelTalking] = useState(false);
  const [enemyTalking,  setEnemyTalking]  = useState(false);
  const mabelTimer   = useRef(null);
  const enemyTimer   = useRef(null);
  const portraitRef  = useRef({ id:null, src:null });

  useEffect(() => {
    if (!mabelLine) return;
    setMabelTalking(true);
    clearTimeout(mabelTimer.current);
    mabelTimer.current = setTimeout(() => setMabelTalking(false), 2600);
  }, [mabelLine]);

  useEffect(() => {
    if (!commsLine) return;
    setEnemyTalking(true);
    clearTimeout(enemyTimer.current);
    enemyTimer.current = setTimeout(() => setEnemyTalking(false), 2600);
  }, [commsLine]);

  const hasEnemy    = !!(selectedEnemy && selectedEnemy.hp > 0);
  const faction     = hasEnemy ? (selectedEnemy.faction || 'NONE') : 'NONE';
  const knownFaction= faction !== 'NONE';
  const eColor      = FACTION_COLOR[faction] || FACTION_COLOR.NONE;

  // Lock portrait per enemy id
  const enemyId = selectedEnemy?.id;
  if (enemyId && portraitRef.current.id !== enemyId) {
    portraitRef.current = { id:enemyId, src:pickPortrait(faction) };
  }
  const portrait = hasEnemy ? portraitRef.current.src : null;

  // 4 states:
  // 1. No enemy          → static + NO ACTIVE CHANNEL
  // 2. Enemy, unknown    → static + UNKNOWN VESSEL
  // 3. Enemy, known, no comms → faction crest glitching + CONNECTING
  // 4. Enemy, comms open → portrait clear

  const showPortrait   = hasEnemy && commsOpen && portrait;
  const showCrest      = hasEnemy && knownFaction && !commsOpen;
  const showUnknown    = hasEnemy && !knownFaction;
  const showNoChannel  = !hasEnemy;

  const statusLabel = commsOpen
    ? faction
    : knownFaction && hasEnemy
    ? '⬡ CONNECTING ⬡'
    : hasEnemy ? '⬡ UNKNOWN ⬡' : '';

  return (
    <div style={{ width:116, flexShrink:0, background:'#03060a',
      border:'1px solid rgba(255,107,53,0.14)',
      padding:'7px 6px', display:'flex', flexDirection:'column',
      gap:6, zIndex:45, overflow:'hidden', boxSizing:'border-box' }}>

      <style>{`
        @keyframes talkWave   { 0%,100%{height:3px}  50%{height:10px} }
        @keyframes dotPulse   { 0%,100%{opacity:.3;transform:scale(.8)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes mabelTalk  { 0%,100%{transform:scaleY(.18);opacity:.45} 35%{transform:scaleY(1);opacity:1} 65%{transform:scaleY(.5);opacity:.75} }
        @keyframes signalBlink{ 0%,49%{opacity:1} 50%,100%{opacity:0} }
        @keyframes portraitIn { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes scanlines  { 0%{background-position:0 0} 100%{background-position:0 8px} }
        @keyframes glitchShift{
          0%,100%{transform:skewX(0deg) translateX(0);filter:var(--gf) hue-rotate(0deg);}
          8%     {transform:skewX(-2.5deg) translateX(-2px);filter:var(--gf) hue-rotate(30deg) brightness(1.3);}
          16%    {transform:skewX(1.8deg) translateX(1px); filter:var(--gf) hue-rotate(-20deg);}
          44%    {transform:skewX(3deg) translateX(-3px);  filter:var(--gf) hue-rotate(60deg) brightness(1.5) saturate(2);}
          45%    {transform:skewX(0deg) translateX(0);     filter:var(--gf);}
          72%    {transform:skewX(-1deg) translateX(2px);  filter:var(--gf) hue-rotate(-40deg);}
          85%    {transform:skewX(2deg) translateX(-1px);  filter:var(--gf) brightness(1.2);}
        }
      `}</style>

      {/* ── MABEL ─────────────────────────────────── */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
        <div style={{ fontFamily:MONO, fontSize:5, color:`${TEAL}55`, letterSpacing:2 }}>M.A.B.E.L</div>
        <MabelFace size={54} talking={mabelTalking} loading={mabelLoading}/>
        <TalkWave color={TEAL} visible={mabelTalking} loading={mabelLoading}/>
        <QuipBubble text={mabelLine} color={TEAL} loading={mabelLoading}/>
      </div>

      {/* ── Divider ─────────────────────────────────── */}
      <div style={{ height:1, background: hasEnemy ? `${eColor}22` : 'rgba(255,255,255,0.04)',
        transition:'background 0.4s' }}/>

      {/* ── Enemy section — 4 states ──────────────── */}
      {showNoChannel && (
        <div style={{ flex:1, display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center', gap:5, opacity:0.3 }}>
          <StaticNoise color='#ffffff' size={46}/>
          <div style={{ fontFamily:MONO, fontSize:5, color:'rgba(255,255,255,0.2)',
            letterSpacing:2, textAlign:'center', lineHeight:2 }}>
            NO ACTIVE{'\n'}CHANNEL
          </div>
        </div>
      )}

      {showUnknown && (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4,
          animation:'portraitIn 0.3s ease-out' }}>
          <div style={{ fontFamily:MONO, fontSize:5, color:'rgba(255,255,255,0.18)',
            letterSpacing:2 }}>⬡ UNKNOWN ⬡</div>
          <StaticNoise color='#ffffff' size={54}/>
          <QuipBubble text={commsLine} color='#ffffff' loading={commsLoading}/>
        </div>
      )}

      {showCrest && (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4,
          animation:'portraitIn 0.3s ease-out' }}>
          <div style={{ fontFamily:MONO, fontSize:5, color:`${eColor}44`, letterSpacing:2,
            animation:'signalBlink 1.4s step-end infinite' }}>
            {statusLabel}
          </div>
          <FactionBanner faction={faction} color={eColor} commsOpen={false}/>
          <div style={{ fontFamily:MONO, fontSize:6, color:`${eColor}77`, letterSpacing:1 }}>
            {selectedEnemy.hp}/{selectedEnemy.hpMax||selectedEnemy.hp} HP
          </div>
          <QuipBubble text={commsLine} color={eColor} loading={commsLoading}/>
        </div>
      )}

      {showPortrait && (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4,
          animation:'portraitIn 0.35s ease-out' }}>
          <div style={{ fontFamily:MONO, fontSize:5, color:`${eColor}55`, letterSpacing:2,
            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'100%' }}>
            {faction}
          </div>
          <div style={{ width:54, height:54, position:'relative', flexShrink:0,
            border:`1px solid ${eColor}55`, borderRadius:3,
            background:`${eColor}06`, overflow:'hidden',
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            <img src={portrait} alt={faction} style={{
              width:46, height:46, objectFit:'contain',
              filter: iconFilter(eColor, false),
              imageRendering:'crisp-edges',
              transition:'filter 0.4s',
            }}/>
          </div>
          <div style={{ fontFamily:MONO, fontSize:6, color:`${eColor}77`, letterSpacing:1 }}>
            {selectedEnemy.hp}/{selectedEnemy.hpMax||selectedEnemy.hp} HP
          </div>
          <TalkWave color={eColor} visible={enemyTalking}/>
          <QuipBubble text={commsLine} color={eColor} loading={commsLoading}/>
        </div>
      )}

      {/* Portrait missing but comms open — show crest cleared */}
      {hasEnemy && commsOpen && !portrait && (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4,
          animation:'portraitIn 0.35s ease-out' }}>
          <div style={{ fontFamily:MONO, fontSize:5, color:`${eColor}55`, letterSpacing:2 }}>{faction}</div>
          <FactionBanner faction={faction} color={eColor} commsOpen={true}/>
          <TalkWave color={eColor} visible={enemyTalking}/>
          <QuipBubble text={commsLine} color={eColor} loading={commsLoading}/>
        </div>
      )}
    </div>
  );
}
