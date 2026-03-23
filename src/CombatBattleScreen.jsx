import React, { useState, useEffect, useRef, useMemo } from 'react';

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

// Which ship image to use per faction
const factionShipSrc = (faction, isBoss) => {
  if (faction === 'WARG')    return '/ships/flagship.webp';
  if (faction === 'ISF')     return '/ships/vector-ace.webp';
  if (faction === 'CORSAIR') return isBoss ? '/ships/smuggler-interceptor.webp' : '/ships/smuggler-speeder.webp';
  return null;
};

// Better geometric fallback ships — no more thumb tacks
function FallbackShip({ faction, size = 64, facing = 'right' }) {
  const c = FACTION_COLOR[faction] || '#9090b8';
  const s = size;
  // facing='right' means nose points right (player), 'left' means nose points left (enemy)
  const flip = facing === 'left';

  return (
    <svg
      width={s} height={s * 0.55}
      viewBox="0 0 120 66"
      style={{
        transform: flip ? 'scaleX(-1)' : 'none',
        filter: `drop-shadow(0 0 8px ${c}99)`,
        display: 'block',
      }}
    >
      {faction === 'MEDUSA' && (
        <g fill={c} opacity="0.92">
          {/* Sleek organic hull */}
          <ellipse cx="60" cy="33" rx="42" ry="14" />
          <polygon points="102,33 60,10 60,56" opacity="0.7" />
          {/* Side pods */}
          <ellipse cx="30" cy="20" rx="12" ry="6" transform="rotate(-20,30,20)" />
          <ellipse cx="30" cy="46" rx="12" ry="6" transform="rotate(20,30,46)" />
          {/* Cockpit eye */}
          <ellipse cx="78" cy="33" rx="8" ry="5" fill="#000" opacity="0.6" />
          <ellipse cx="80" cy="33" rx="3" ry="2" fill={c} opacity="0.8" />
          {/* Tendrils */}
          <line x1="20" y1="18" x2="5" y2="10" stroke={c} strokeWidth="1.5" opacity="0.6"/>
          <line x1="20" y1="48" x2="5" y2="56" stroke={c} strokeWidth="1.5" opacity="0.6"/>
        </g>
      )}
      {faction === 'SYNTH' && (
        <g fill={c} opacity="0.92">
          {/* Geometric angular hull */}
          <polygon points="100,33 70,15 40,18 20,33 40,48 70,51" />
          <polygon points="100,33 110,28 108,38" opacity="0.7" />
          {/* Center core */}
          <rect x="48" y="27" width="24" height="12" rx="2" fill="#000" opacity="0.5" />
          <rect x="53" y="30" width="14" height="6" rx="1" fill={c} opacity="0.9" />
          {/* Wing struts */}
          <rect x="22" y="31" width="20" height="4" rx="1" opacity="0.6" />
          {/* Antenna */}
          <line x1="75" y1="15" x2="80" y2="8" stroke={c} strokeWidth="1.5"/>
          <circle cx="80" cy="7" r="2" />
        </g>
      )}
      {(faction === 'NONE' || !faction) && (
        <g fill={c} opacity="0.85">
          {/* Generic freighter — chunky and believable */}
          <rect x="25" y="24" width="60" height="18" rx="4" />
          <polygon points="85,24 105,33 85,42" />
          <rect x="18" y="28" width="14" height="10" rx="2" opacity="0.7" />
          {/* Cockpit */}
          <rect x="68" y="27" width="12" height="12" rx="3" fill="#000" opacity="0.5"/>
          <rect x="70" y="29" width="8" height="8" rx="2" fill={c} opacity="0.6"/>
          {/* Engine pods */}
          <rect x="20" y="18" width="18" height="8" rx="3" opacity="0.6" />
          <rect x="20" y="40" width="18" height="8" rx="3" opacity="0.6" />
        </g>
      )}
    </svg>
  );
}

// Flame trail particles
function FlameTrail({ facing, color, active }) {
  const dir = facing === 'right' ? 'left' : 'right';
  if (!active) return null;
  return (
    <div style={{
      position: 'absolute',
      [dir]: '100%',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      flexDirection: dir === 'left' ? 'row-reverse' : 'row',
      gap: 3,
      pointerEvents: 'none',
    }}>
      {[1, 0.7, 0.4].map((op, i) => (
        <div key={i} style={{
          width: 12 - i * 3,
          height: 12 - i * 3,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}ff 0%, ${color}88 50%, transparent 100%)`,
          opacity: op,
          animation: `flamePulse ${0.2 + i * 0.1}s ease-in-out ${i * 0.06}s infinite alternate`,
          alignSelf: 'center',
        }} />
      ))}
    </div>
  );
}

// Ship wrapper — handles rotation, image, fallback, flame trail
function ShipDisplay({ faction, isBoss, size, facing = 'right', defeated, hit, isPlayer }) {
  const imgSrc = isPlayer ? '/ships/duskwing.webp' : factionShipSrc(faction, isBoss);
  const color  = isPlayer ? TEAL : (FACTION_COLOR[faction] || '#9090b8');
  const w = size || (isBoss ? 90 : 64);

  // Top-down art: nose points UP. Rotate so nose points right or left.
  const rotationDeg = facing === 'right' ? 90 : -90;

  const hitGlow = hit
    ? `drop-shadow(0 0 16px ${RED}ff) drop-shadow(0 0 6px ${RED}ff) brightness(1.8)`
    : isPlayer
    ? `drop-shadow(0 0 10px ${TEAL}88)`
    : `drop-shadow(0 0 8px ${color}66)`;

  const containerStyle = {
    position: 'relative',
    display: 'inline-block',
    transition: 'opacity 1.2s',
    opacity: defeated ? 0.12 : 1,
  };

  const imgStyle = {
    width: w,
    height: w,
    objectFit: 'contain',
    display: 'block',
    transform: `rotate(${rotationDeg}deg) ${defeated ? 'translateY(10px) rotate(25deg)' : ''}`,
    transition: 'transform 0.3s',
    filter: hitGlow,
    imageRendering: 'crisp-edges',
  };

  // Add red racing stripes overlay for player ship
  const stripes = isPlayer ? (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `repeating-linear-gradient(
        ${rotationDeg}deg,
        transparent, transparent 28%,
        ${RED}66 28%, ${RED}66 32%,
        transparent 32%, transparent 62%,
        ${RED}44 62%, ${RED}44 65%,
        transparent 65%
      )`,
      pointerEvents: 'none',
      borderRadius: 4,
      mixBlendMode: 'screen',
    }} />
  ) : null;

  return (
    <div style={containerStyle}>
      <FlameTrail facing={facing} color={isPlayer ? TEAL : color} active={!defeated} />
      {imgSrc ? (
        <div style={{ position: 'relative' }}>
          <img src={imgSrc} alt={faction || 'ship'} style={imgStyle} />
          {stripes}
        </div>
      ) : (
        <FallbackShip faction={faction} size={w} facing={facing} />
      )}
    </div>
  );
}

// Projectile bolt
function Projectile({ fromLeft, color, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 620);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: fromLeft ? '24%' : '76%',
      width: 48, height: 4,
      background: `linear-gradient(${fromLeft ? '90deg' : '270deg'}, ${color}ff, ${color}88, transparent)`,
      borderRadius: 3,
      transform: 'translateY(-50%)',
      animation: `bolt${fromLeft ? 'R' : 'L'} 0.58s ease-in forwards`,
      boxShadow: `0 0 10px 2px ${color}88`,
      zIndex: 20,
    }} />
  );
}

// Explosion burst
function Explosion({ x, y, color }) {
  return (
    <>
      <div style={{
        position: 'absolute', left: x + '%', top: y + '%',
        transform: 'translate(-50%,-50%)',
        width: 48, height: 48, borderRadius: '50%',
        background: `radial-gradient(circle, #ffffffcc 0%, ${color}ff 25%, ${color}44 60%, transparent 80%)`,
        animation: 'explode 0.52s ease-out forwards',
        zIndex: 25,
      }} />
      {/* Debris sparks */}
      {[0,60,120,180,240,300].map((angle, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: x + '%', top: y + '%',
          width: 4, height: 4, borderRadius: '50%',
          background: color,
          transform: `translate(-50%,-50%)`,
          animation: `spark${i % 3} 0.5s ease-out forwards`,
          zIndex: 24,
        }} />
      ))}
    </>
  );
}

// Scrolling star with occasional bright ones
function Star({ x, y, size, speed, opacity, bright }) {
  return (
    <div style={{
      position: 'absolute',
      left: x + '%', top: y + '%',
      width: size, height: size,
      borderRadius: '50%',
      background: bright ? `radial-gradient(circle, #ffffff, #88bbff88)` : '#ffffff',
      opacity,
      boxShadow: bright ? `0 0 4px 1px #88bbffaa` : 'none',
      animation: `starDrift ${speed}s linear infinite`,
    }} />
  );
}

export default function CombatBattleScreen({ ctBrief }) {
  const { active, enemies = [], coleHP, velaHP, round } = ctBrief || {};

  const prevColeHP  = useRef(coleHP);
  const prevVelaHP  = useRef(velaHP);
  const prevEnemyHP = useRef({});

  const [projectiles, setProjectiles] = useState([]);
  const [explosions,  setExplosions]  = useState([]);
  const [hitPlayer,   setHitPlayer]   = useState(false);
  const [hitEnemy,    setHitEnemy]    = useState({});

  const stars = useMemo(() => Array.from({ length: 70 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() < 0.08 ? 3 : Math.random() < 0.25 ? 2 : 1,
    speed: 14 + Math.random() * 28,
    opacity: 0.12 + Math.random() * 0.65,
    bright: Math.random() < 0.1,
  })), []);

  const addProjectile = (fromLeft, color) => {
    const id = Date.now() + Math.random();
    setProjectiles(p => [...p, { id, fromLeft, color }]);
  };

  const addExplosion = (x, y, color) => {
    const id = Date.now() + Math.random();
    setExplosions(p => [...p, { id, x, y, color }]);
    setTimeout(() => setExplosions(p => p.filter(e => e.id !== id)), 600);
  };

  useEffect(() => {
    if (!active) return;
    const coleDmg = (prevColeHP.current ?? coleHP) > (coleHP ?? 0);
    const velaDmg = (prevVelaHP.current ?? velaHP) > (velaHP ?? 0);
    if (coleDmg || velaDmg) {
      addProjectile(false, RED);
      setHitPlayer(true);
      addExplosion(20, 50, RED);
      setTimeout(() => setHitPlayer(false), 320);
    }
    prevColeHP.current = coleHP;
    prevVelaHP.current = velaHP;
  }, [coleHP, velaHP, active]);

  useEffect(() => {
    if (!active || !enemies.length) return;
    enemies.forEach(e => {
      const prev = prevEnemyHP.current[e.id];
      if (prev !== undefined && e.hp < prev) {
        addProjectile(true, TEAL);
        addExplosion(80, 50, TEAL);
        setHitEnemy(h => ({ ...h, [e.id]: true }));
        setTimeout(() => setHitEnemy(h => ({ ...h, [e.id]: false })), 320);
      }
      prevEnemyHP.current[e.id] = e.hp;
    });
  }, [enemies, active]);

  const liveEnemies   = enemies.filter(e => e.hp > 0);
  const primaryEnemy  = liveEnemies[0] || enemies[0];
  const enemyDefeated = primaryEnemy && primaryEnemy.hp <= 0;
  const enemyHit      = primaryEnemy && hitEnemy[primaryEnemy.id];
  const allDefeated   = enemies.length > 0 && enemies.every(e => e.hp <= 0);
  const playerDown    = coleHP === 0 && velaHP === 0;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: 190,
      background: '#010208',
      overflow: 'hidden',
      borderBottom: '1px solid #FF6B3533',
    }}>
      <style>{`
        @keyframes starDrift {
          from { transform: translateX(0); }
          to   { transform: translateX(-60px); }
        }
        @keyframes boltR {
          from { left: 24%; opacity: 1; transform: translateY(-50%) scaleX(1); }
          to   { left: 82%; opacity: 0; transform: translateY(-50%) scaleX(0.3); }
        }
        @keyframes boltL {
          from { left: 76%; opacity: 1; transform: translateY(-50%) scaleX(-1); }
          to   { left: 18%; opacity: 0; transform: translateY(-50%) scaleX(-0.3); }
        }
        @keyframes explode {
          0%   { transform: translate(-50%,-50%) scale(0.1); opacity: 1; }
          50%  { transform: translate(-50%,-50%) scale(1.6); opacity: 0.8; }
          100% { transform: translate(-50%,-50%) scale(2.4); opacity: 0; }
        }
        @keyframes spark0 { to { transform: translate(calc(-50% + 22px), calc(-50% - 18px)); opacity: 0; } }
        @keyframes spark1 { to { transform: translate(calc(-50% - 20px), calc(-50% - 14px)); opacity: 0; } }
        @keyframes spark2 { to { transform: translate(calc(-50% + 8px),  calc(-50% + 22px)); opacity: 0; } }
        @keyframes idleDrift {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-4px); }
        }
        @keyframes flamePulse {
          from { transform: scale(0.85); opacity: 0.7; }
          to   { transform: scale(1.15); opacity: 1; }
        }
        @keyframes roundPulse {
          0%,100% { opacity: 0.55; }
          50%      { opacity: 1; }
        }
        @keyframes victorySlide {
          0%   { left: 10%; }
          100% { left: 110%; }
        }
      `}</style>

      {/* ── STARFIELD ── */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {stars.map(s => <Star key={s.id} {...s} />)}
      </div>

      {/* ── CRT EFFECTS ── */}
      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 40,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.22) 2px, rgba(0,0,0,0.22) 4px)',
      }} />
      {/* Phosphor bloom */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 39,
        background: 'radial-gradient(ellipse at 50% 50%, rgba(0,255,180,0.018) 0%, transparent 70%)',
      }} />
      {/* CRT barrel vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 41,
        background: `
          radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.72) 100%),
          linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 12%, transparent 88%, rgba(0,0,0,0.18) 100%)
        `,
      }} />
      {/* CRT flicker */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 38,
        background: 'rgba(255,255,255,0)',
        animation: 'none',
        opacity: 0.015,
      }} />

      {/* ── HUD ── */}
      <div style={{
        position: 'absolute', top: 7, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16,
        pointerEvents: 'none', zIndex: 42,
      }}>
        {active && !allDefeated && !playerDown && (
          <div style={{ fontFamily: MONO, fontSize: 9, color: ACC, letterSpacing: 3,
            textShadow: `0 0 8px ${ACC}`, animation: 'roundPulse 2s ease-in-out infinite' }}>
            ROUND {round}
          </div>
        )}
        {allDefeated && (
          <div style={{ fontFamily: ORB, fontSize: 12, color: ACC, letterSpacing: 5,
            textShadow: `0 0 20px ${ACC}, 0 0 40px ${ACC}88` }}>
            ★ VICTORY ★
          </div>
        )}
        {playerDown && !allDefeated && (
          <div style={{ fontFamily: ORB, fontSize: 12, color: RED, letterSpacing: 5,
            textShadow: `0 0 20px ${RED}` }}>
            ✕ DEFEAT ✕
          </div>
        )}
      </div>

      {/* ── PLAYER SHIP — left, facing RIGHT ── */}
      <div style={{
        position: 'absolute', left: '8%', top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        zIndex: 10,
        animation: hitPlayer ? 'none' : 'idleDrift 4.2s ease-in-out infinite',
      }}>
        <ShipDisplay
          isPlayer={true}
          size={active ? 76 : 64}
          facing="right"
          hit={hitPlayer}
          defeated={playerDown && !allDefeated}
        />
        {active && (
          <div style={{ fontFamily: MONO, fontSize: 7, color: TEAL + 'bb',
            letterSpacing: 2, textAlign: 'center', textShadow: `0 0 6px ${TEAL}66` }}>
            INDESTRUCTIBLE II
          </div>
        )}
        {active && coleHP !== null && (
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontFamily: MONO, fontSize: 7, color: TEAL,
              textShadow: `0 0 6px ${TEAL}` }}>C {coleHP}</span>
            <span style={{ fontFamily: MONO, fontSize: 7, color: VELA,
              textShadow: `0 0 6px ${VELA}` }}>V {velaHP}</span>
          </div>
        )}
      </div>

      {/* ── ENEMY SHIP — right, facing LEFT ── */}
      {primaryEnemy ? (
        <div style={{
          position: 'absolute', right: '8%', top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
          zIndex: 10,
          animation: enemyDefeated || enemyHit ? 'none' : 'idleDrift 3.8s ease-in-out 0.4s infinite',
        }}>
          <ShipDisplay
            faction={primaryEnemy.faction}
            isBoss={primaryEnemy.isBoss}
            size={primaryEnemy.isBoss ? 92 : 68}
            facing="left"
            hit={enemyHit}
            defeated={enemyDefeated}
          />
          {active && (
            <div style={{
              fontFamily: MONO, fontSize: 7,
              color: (FACTION_COLOR[primaryEnemy.faction] || '#9090b8') + 'bb',
              letterSpacing: 1, textAlign: 'center', maxWidth: 90,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              textShadow: `0 0 6px ${FACTION_COLOR[primaryEnemy.faction] || '#9090b8'}66`,
            }}>
              {primaryEnemy.name?.toUpperCase()}
            </div>
          )}
          {active && (
            <div style={{ fontFamily: MONO, fontSize: 7, color: RED,
              textShadow: `0 0 6px ${RED}88` }}>
              {primaryEnemy.hp}/{primaryEnemy.hpMax} HP
            </div>
          )}
        </div>
      ) : !active && (
        /* Idle — just the player ship centered */
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <div style={{ animation: 'idleDrift 4s ease-in-out infinite' }}>
            <ShipDisplay isPlayer={true} size={68} facing="right" />
          </div>
          <div style={{ fontFamily: MONO, fontSize: 8, color: ACC + '55', letterSpacing: 4 }}>
            STANDING BY
          </div>
        </div>
      )}

      {/* Extra live enemy count indicators */}
      {active && liveEnemies.length > 1 && (
        <div style={{
          position: 'absolute', top: 8, right: 10, zIndex: 42,
          display: 'flex', gap: 4,
        }}>
          {liveEnemies.slice(1, 5).map((e, i) => {
            const ec = FACTION_COLOR[e.faction] || '#9090b8';
            return (
              <div key={e.id} style={{
                width: 16, height: 16, borderRadius: '50%',
                background: ec + '18', border: '1px solid ' + ec + '88',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: MONO, fontSize: 6, color: ec,
              }}>+1</div>
            );
          })}
        </div>
      )}

      {/* Divider line */}
      {active && primaryEnemy && !enemyDefeated && (
        <div style={{
          position: 'absolute', left: '50%', top: '10%', bottom: '10%',
          width: 1,
          background: `linear-gradient(to bottom, transparent, ${ACC}44, transparent)`,
          zIndex: 5,
        }} />
      )}

      {/* Projectiles */}
      {projectiles.map(p => (
        <Projectile key={p.id} fromLeft={p.fromLeft} color={p.color}
          onDone={() => setProjectiles(prev => prev.filter(x => x.id !== p.id))} />
      ))}

      {/* Explosions */}
      {explosions.map(e => (
        <Explosion key={e.id} x={e.x} y={e.y} color={e.color} />
      ))}

      {/* Corner brackets */}
      {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
        <div key={v+h} style={{
          position: 'absolute', [v]: 5, [h]: 5, width: 10, height: 10,
          borderStyle: 'solid', borderColor: ACC + '66', borderWidth: 0,
          [`border${v.charAt(0).toUpperCase()+v.slice(1)}Width`]: 1,
          [`border${h.charAt(0).toUpperCase()+h.slice(1)}Width`]: 1,
          zIndex: 42,
        }} />
      ))}
    </div>
  );
}
