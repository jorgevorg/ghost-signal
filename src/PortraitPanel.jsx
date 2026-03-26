import React, { useState, useEffect, useRef } from 'react';

const MONO = "'Share Tech Mono', monospace";
const ORB  = "'Orbitron', sans-serif";
const TEAL = '#00FFD0';
const RED  = '#FF2060';

// ── Faction → portrait file + color ────────────────────────────────────────
const FACTION_COLOR = {
  CORSAIR: '#FFD166', ISF: '#00BFFF', WARG: '#FF2060',
  MEDUSA: '#cc88ff', SYNTH: '#00FFD0', ALIEN: '#9090b8',
  WANTED: '#FF6B35', NONE: '#9090b8',
};

const PORTRAIT_DB = {
  WARG:    '/portraits/warg-01.png',
  CORSAIR: '/portraits/raider-02.png',
  MEDUSA:  '/portraits/medusa-01.png',
  ISF:     '/portraits/isf-02.png',
  SYNTH:   '/portraits/synth-07.png',
  ALIEN:   '/portraits/alien-05.png',
  WANTED:  '/portraits/bounty-03.png',
};

// Convert black-stroke icon to faction-colored on dark bg
// invert(1) → white strokes, then colorize
const iconFilter = (color, glowOnly = false) => {
  if (glowOnly) return `invert(1) drop-shadow(0 0 5px ${color}cc) drop-shadow(0 0 2px ${color})`;
  return `invert(1) drop-shadow(0 0 6px ${color}dd) drop-shadow(0 0 2px ${color}) brightness(0.92)`;
};

// ── Lightweight MABEL face SVG ──────────────────────────────────────────────
function MabelFace({ size = 52, talking = false, loading = false }) {
  const glow = loading
    ? `0 0 18px ${TEAL}cc, 0 0 6px ${TEAL}88`
    : `0 0 8px ${TEAL}44`;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `1.5px solid ${TEAL}${loading ? 'bb' : '33'}`,
      background: '#020d0a',
      boxShadow: glow,
      overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'box-shadow 0.5s, border-color 0.5s',
      flexShrink: 0,
    }}>
      <svg viewBox="80 50 355 430" width={size - 6} height={size - 6}
        style={{ display: 'block', overflow: 'visible' }}>
        <path
          fill={TEAL} fillOpacity={loading ? 0.92 : 0.7}
          style={{ transition: 'fill-opacity 0.5s' }}
          d="M212.103,408.644c28.22,9.692,59.575,9.692,87.795,0v56.725h-87.795V408.644z M208.967,394.106 c-46.748-19.098-76.963-63.851-76.963-114.875v-62.426c78.959-27.935,110.884-70.977,123.141-93.781 c10.262,23.659,40.192,67.271,124.567,94.351l-0.855,72.972h-31.926l-19.668-19.668c-6.151-5.467-14.706,2.968-8.837,8.837 l21.664,21.379c2.974,2.974,3.835,1.183,37.056,1.71c-2.565,14.538-7.696,27.935-15.108,40.192h-39.052 c-3.438,0-3.134,0.569-21.662,19.097c-2.722,2.722-4.362,6.959-1.613,9.708c4.607,4.607,9.308-0.014,9.308-0.014l16.533-16.533 h27.935C319.761,399.044,260.951,415.194,208.967,394.106z M214.098,214.811H166.78c-3.421,0-6.271,2.851-6.271,6.271 c0,3.42,2.85,6.271,6.271,6.271h11.402c-1.425,2.565-2.565,4.846-2.565,7.981c0,7.696,6.271,13.967,13.967,13.967 c9.784,0,18.276-10.95,11.402-21.949h13.682C223.074,227.353,221.842,214.811,214.098,214.811z M285.075,332.536 c0-3.421-2.85-6.271-6.271-6.271h-45.608c-3.421,0-6.271,2.85-6.271,6.271c0,3.706,2.85,6.271,6.271,6.271h45.608 C282.225,338.807,285.075,336.241,285.075,332.536z M296.762,227.353h11.402c-1.425,2.565-2.565,4.846-2.565,7.981 c0,7.696,6.271,13.967,13.968,13.967c9.784,0,18.276-10.95,11.402-21.949h13.682c8.406,0,7.174-12.542-0.57-12.542h-47.318 c-3.421,0-6.271,2.851-6.271,6.271C290.491,224.502,293.341,227.353,296.762,227.353z M120.602,291.489h-15.108l-5.986,173.595 H199.56v-62.141C154.808,382.989,125.163,340.517,120.602,291.489z M406.769,291.508l-15.656-0.019 c-0.26,5.709-0.953,11.396-2.184,16.977c-3.349,15.193-9.336,29.646-17.2,42.598c-0.285,0.285-0.285,0.57-0.57,0.855 c-13.967,21.949-33.921,39.907-58.72,51.024v62.141h100.052L406.769,291.508z M248.404,107.023 c0.827-2.165,2.218-4.068,4.006-5.542l0.01-0.009c1.919-1.582,4.713-1.497,6.532,0.198l0,0 c1.823,1.698,3.144,3.859,3.808,6.26c3.905,14.131,25.354,68.351,124.077,98.613h19.098 c0.285-3.706,0-9.122-0.285-13.682c0-70.972-29.388-123.117-97.487-139.959c-26.935-6.966-50.951-6.188-52.449-6.271 c-80.403,0-136.037,35.46-147.94,114.02c-0.57,3.135-1.995,33.066-2.28,45.893h18.813 C217.018,174.395,243.27,120.455,248.404,107.023z M102.359,279.517h17.673v-60.43h-17.673 c-16.533,0-30.215,13.682-30.215,30.215C72.144,265.834,85.826,279.517,102.359,279.517z M391.968,279.517h17.673 c16.533,0,30.215-13.682,30.215-30.215c0-16.533-13.397-30.215-30.215-30.215h-17.673V279.517z"
        />
        {/* Mouth bar — animates when talking */}
        <rect x={231} y={327} width={52} height={9} rx={3}
          fill={TEAL}
          style={{
            transformOrigin: '257px 331px',
            animation: talking ? 'mabelTalk 0.38s ease-in-out infinite' : 'none',
            opacity: talking ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
        />
      </svg>
    </div>
  );
}

// ── Talking waveform indicator ───────────────────────────────────────────────
function TalkWave({ color, visible }) {
  if (!visible) return null;
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center', height: 10 }}>
      {[0, 1, 2, 3, 4].map(i => (
        <div key={i} style={{
          width: 2, borderRadius: 1,
          background: color,
          animation: `talkWave 0.6s ease-in-out ${i * 0.1}s infinite`,
          opacity: 0.8,
        }} />
      ))}
    </div>
  );
}

// ── Quip bubble ───────────────────────────────────────────────────────────────
function QuipBubble({ text, color, loading }) {
  const display = text ? text.slice(0, 90) + (text.length > 90 ? '…' : '') : '';
  return (
    <div style={{
      width: '100%',
      minHeight: 28,
      padding: '4px 5px',
      background: `${color}0a`,
      border: `1px solid ${color}22`,
      borderRadius: 3,
      position: 'relative',
      boxSizing: 'border-box',
    }}>
      {loading
        ? <div style={{ display: 'flex', gap: 3, padding: '2px 0', justifyContent: 'center' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 3, height: 3, borderRadius: '50%',
                background: color,
                animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        : <div style={{
            fontFamily: MONO, fontSize: 6, color: `${color}cc`,
            lineHeight: 1.6, letterSpacing: 0.5,
            wordBreak: 'break-word',
          }}>
            {display || ''}
          </div>
      }
    </div>
  );
}

// ── Portrait Panel — the full right panel component ─────────────────────────
export default function PortraitPanel({
  selectedEnemy,
  mabelLine,
  mabelLoading,
  commsLine,
  commsLoading,
  active,
}) {
  const [mabelTalking, setMabelTalking] = useState(false);
  const [enemyTalking, setEnemyTalking] = useState(false);
  const mabelTimer = useRef(null);
  const enemyTimer = useRef(null);

  // Trigger mouth animation when mabelLine changes
  useEffect(() => {
    if (!mabelLine) return;
    setMabelTalking(true);
    clearTimeout(mabelTimer.current);
    mabelTimer.current = setTimeout(() => setMabelTalking(false), 2600);
  }, [mabelLine]);

  // Trigger enemy wave when commsLine changes
  useEffect(() => {
    if (!commsLine) return;
    setEnemyTalking(true);
    clearTimeout(enemyTimer.current);
    enemyTimer.current = setTimeout(() => setEnemyTalking(false), 2600);
  }, [commsLine]);

  const hasEnemy = !!(selectedEnemy && selectedEnemy.hp > 0);
  const faction  = hasEnemy ? (selectedEnemy.faction || 'NONE') : 'NONE';
  const eColor   = FACTION_COLOR[faction] || FACTION_COLOR.NONE;
  const portrait = PORTRAIT_DB[faction] || null;

  return (
    <div style={{
      width: 116, flexShrink: 0,
      background: '#03060a',
      borderLeft: `1px solid rgba(255,107,53,0.14)`,
      border: `1px solid rgba(255,107,53,0.14)`,
      padding: '7px 6px',
      display: 'flex', flexDirection: 'column',
      gap: 6, zIndex: 45, overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      <style>{`
        @keyframes talkWave {
          0%,100% { height: 3px; }
          50%      { height: 10px; }
        }
        @keyframes dotPulse {
          0%,100% { opacity: 0.3; transform: scale(0.8); }
          50%      { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes mabelTalk {
          0%,100% { transform: scaleY(0.18); opacity: 0.45; }
          35%     { transform: scaleY(1);    opacity: 1; }
          65%     { transform: scaleY(0.5);  opacity: 0.75; }
        }
        @keyframes portraitFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── MABEL section ───────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ fontFamily: MONO, fontSize: 5, color: `${TEAL}55`, letterSpacing: 2 }}>M.A.B.E.L</div>
        <MabelFace size={54} talking={mabelTalking} loading={mabelLoading} />
        <TalkWave color={TEAL} visible={mabelTalking} />
        <QuipBubble text={mabelLine} color={TEAL} loading={mabelLoading} />
      </div>

      {/* ── Divider ─────────────────────────────── */}
      <div style={{ height: 1, background: hasEnemy ? `${eColor}22` : 'rgba(255,255,255,0.04)', transition: 'background 0.4s' }} />

      {/* ── Enemy / No-channel section ──────────── */}
      {hasEnemy ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, animation: 'portraitFadeIn 0.3s ease-out' }}>
          <div style={{ fontFamily: MONO, fontSize: 5, color: `${eColor}55`, letterSpacing: 2,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
            {faction}
          </div>

          {/* Portrait image or fallback */}
          <div style={{
            width: 54, height: 54,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${eColor}33`,
            borderRadius: 3,
            background: `${eColor}06`,
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {portrait
              ? <img src={portrait} alt={faction}
                  style={{
                    width: 46, height: 46,
                    objectFit: 'contain',
                    filter: iconFilter(eColor),
                    imageRendering: 'crisp-edges',
                  }} />
              : <div style={{ fontFamily: ORB, fontSize: 18, color: `${eColor}44` }}>?</div>
            }
          </div>

          {/* Disposition badge */}
          <div style={{ fontFamily: MONO, fontSize: 6, letterSpacing: 1,
            color: eColor, opacity: 0.8, textAlign: 'center' }}>
            {selectedEnemy.hp}/{selectedEnemy.hpMax || selectedEnemy.hp} HP
          </div>

          <TalkWave color={eColor} visible={enemyTalking} />
          <QuipBubble text={commsLine} color={eColor} loading={commsLoading} />
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', gap: 6, opacity: 0.35 }}>
          <div style={{ width: 32, height: 32, border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>⊘</div>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 5, color: 'rgba(255,255,255,0.2)',
            letterSpacing: 2, textAlign: 'center', lineHeight: 2 }}>
            NO ACTIVE{'\n'}CHANNEL
          </div>
        </div>
      )}
    </div>
  );
}
