import React, { useState, useEffect, useRef, useMemo } from 'react';

const ACC   = '#FF6B35';
const TEAL  = '#00FFD0';
const VELA  = '#cc88ff';
const RED   = '#FF2060';
const YEL   = '#FFD166';
const BLUE  = '#00BFFF';
const MONO  = "'Share Tech Mono', monospace";
const ORB   = "'Orbitron', sans-serif";

// Ship image mapping by faction
const SHIP_IMG = {
  CORSAIR: '/ships/smuggler-speeder.webp',
  CORSAIR_HEAVY: '/ships/smuggler-interceptor.webp',
  ISF: '/ships/vector-ace.webp',
  WARG: '/ships/flagship.webp',
  PLAYER: '/ships/duskwing.webp',
};

const FACTION_COLOR = {
  CORSAIR: YEL, ISF: BLUE, WARG: RED, MEDUSA: VELA, SYNTH: TEAL, NONE: '#9090b8',
};

// Geometric SVG fallback ships for factions without images
function FallbackShip({ faction, size = 60, flip = false }) {
  const c = FACTION_COLOR[faction] || '#9090b8';
  const s = size;
  return (
    <svg width={s} height={s * 0.6} viewBox="0 0 100 60"
      style={{ transform: flip ? 'scaleX(-1)' : 'none', filter: `drop-shadow(0 0 6px ${c}88)` }}>
      {faction === 'MEDUSA' && (
        <g fill={c} opacity="0.9">
          <polygon points="50,5 70,55 50,45 30,55" />
          <ellipse cx="35" cy="38" rx="10" ry="18" />
          <ellipse cx="65" cy="38" rx="10" ry="18" />
          <rect x="44" y="25" width="12" height="3" rx="1" fill={c} opacity="0.5"/>
        </g>
      )}
      {faction === 'SYNTH' && (
        <g fill={c} opacity="0.9">
          <rect x="35" y="5" width="30" height="50" rx="4" />
          <rect x="15" y="20" width="20" height="25" rx="2" />
          <rect x="65" y="20" width="20" height="25" rx="2" />
          <circle cx="50" cy="30" r="8" fill="none" stroke={c} strokeWidth="2" />
          <circle cx="50" cy="30" r="3" />
        </g>
      )}
      {(faction === 'NONE' || !faction) && (
        <g fill={c} opacity="0.8">
          <polygon points="50,5 65,50 50,42 35,50" />
          <rect x="30" y="30" width="40" height="18" rx="3" />
        </g>
      )}
    </svg>
  );
}

function ShipDisplay({ faction, isBoss, size, flip, defeated, hit, isPlayer }) {
  const imgSrc = isPlayer
    ? SHIP_IMG.PLAYER
    : faction === 'WARG' ? SHIP_IMG.WARG
    : faction === 'ISF'  ? SHIP_IMG.ISF
    : faction === 'CORSAIR' && isBoss ? SHIP_IMG.CORSAIR_HEAVY
    : faction === 'CORSAIR' ? SHIP_IMG.CORSAIR
    : null;

  const color = isPlayer ? TEAL : (FACTION_COLOR[faction] || '#9090b8');
  const w = size || (isBoss ? 90 : 60);
  const h = w * 0.8;

  const style = {
    width: w, height: h,
    transform: `scaleX(${flip ? -1 : 1}) ${defeated ? 'rotate(30deg) translateY(20px)' : hit ? 'translateX(4px)' : ''}`,
    opacity: defeated ? 0.15 : 1,
    transition: 'transform 0.15s, opacity 1.2s',
    filter: hit
      ? `drop-shadow(0 0 12px ${RED}) drop-shadow(0 0 4px ${RED})`
      : isPlayer
      ? `drop-shadow(0 0 8px ${TEAL}88)`
      : `drop-shadow(0 0 6px ${color}66)`,
    imageRendering: 'crisp-edges',
    objectFit: 'contain',
  };

  if (imgSrc) {
    return <img src={imgSrc} alt={faction} style={style} />;
  }
  return (
    <div style={{ transform: style.transform, opacity: style.opacity, transition: style.transition }}>
      <FallbackShip faction={faction} size={w} flip={flip} />
    </div>
  );
}

// Single star
function Star({ x, y, size, speed, opacity }) {
  return (
    <div style={{
      position: 'absolute',
      left: x + '%', top: y + '%',
      width: size, height: size,
      borderRadius: '50%',
      background: '#ffffff',
      opacity,
      animation: `starDrift ${speed}s linear infinite`,
    }} />
  );
}

// Projectile
function Projectile({ fromLeft, color, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: fromLeft ? '22%' : '78%',
      width: 40, height: 3,
      background: `linear-gradient(${fromLeft ? '90deg' : '270deg'}, ${color}, transparent)`,
      borderRadius: 2,
      transform: 'translateY(-50%)',
      animation: `projectile${fromLeft ? 'R' : 'L'} 0.55s ease-in forwards`,
      boxShadow: `0 0 8px ${color}`,
      zIndex: 20,
    }} />
  );
}

// Explosion
function Explosion({ x, y, color }) {
  return (
    <div style={{
      position: 'absolute', left: x + '%', top: y + '%',
      transform: 'translate(-50%, -50%)',
      width: 40, height: 40,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color}ff 0%, ${color}44 50%, transparent 70%)`,
      animation: 'explode 0.5s ease-out forwards',
      zIndex: 25,
    }} />
  );
}

export default function CombatBattleScreen({ ctBrief }) {
  const { active, enemies = [], coleHP, velaHP, round } = ctBrief || {};

  const prevColeHP  = useRef(coleHP);
  const prevVelaHP  = useRef(velaHP);
  const prevEnemyHP = useRef({});

  const [projectiles,  setProjectiles]  = useState([]);
  const [explosions,   setExplosions]   = useState([]);
  const [hitPlayer,    setHitPlayer]    = useState(false);
  const [hitEnemy,     setHitEnemy]     = useState({});

  // Generate stars once
  const stars = useMemo(() => Array.from({ length: 55 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() < 0.15 ? 2 : 1,
    speed: 18 + Math.random() * 24,
    opacity: 0.15 + Math.random() * 0.55,
  })), []);

  const addProjectile = (fromLeft, color) => {
    const id = Date.now() + Math.random();
    setProjectiles(p => [...p, { id, fromLeft, color }]);
  };

  const addExplosion = (x, y, color) => {
    const id = Date.now() + Math.random();
    setExplosions(p => [...p, { id, x, y, color }]);
    setTimeout(() => setExplosions(p => p.filter(e => e.id !== id)), 550);
  };

  // Watch for HP changes → trigger animations
  useEffect(() => {
    if (!active) return;

    // Player took damage
    const coleDmg  = (prevColeHP.current  ?? coleHP)  > (coleHP  ?? 0);
    const velaDmg   = (prevVelaHP.current  ?? velaHP)  > (velaHP  ?? 0);

    if (coleDmg || velaDmg) {
      addProjectile(false, RED); // enemy fires left→right... wait, enemy is right, fires right-to-left
      setHitPlayer(true);
      addExplosion(22, 50, RED);
      setTimeout(() => setHitPlayer(false), 300);
    }

    prevColeHP.current = coleHP;
    prevVelaHP.current = velaHP;
  }, [coleHP, velaHP, active]);

  useEffect(() => {
    if (!active || !enemies.length) return;

    enemies.forEach(e => {
      const prev = prevEnemyHP.current[e.id];
      if (prev !== undefined && e.hp < prev) {
        // Enemy took damage
        addProjectile(true, TEAL);
        addExplosion(78, 50, TEAL);
        setHitEnemy(h => ({ ...h, [e.id]: true }));
        setTimeout(() => setHitEnemy(h => ({ ...h, [e.id]: false })), 300);
      }
      prevEnemyHP.current[e.id] = e.hp;
    });
  }, [enemies, active]);

  // Primary enemy (first live one, or last one standing)
  const liveEnemies   = enemies.filter(e => e.hp > 0);
  const primaryEnemy  = liveEnemies[0] || enemies[0];
  const enemyDefeated = primaryEnemy && primaryEnemy.hp <= 0;
  const enemyHit      = primaryEnemy && hitEnemy[primaryEnemy.id];

  const allDefeated = enemies.length > 0 && enemies.every(e => e.hp <= 0);
  const playerDown  = (coleHP === 0) && (velaHP === 0);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: 180,
      background: '#02030a',
      overflow: 'hidden',
      borderBottom: '1px solid #FF6B3533',
      borderTop: '1px solid #FF6B3522',
    }}>
      <style>{`
        @keyframes starDrift {
          from { transform: translateX(0); }
          to   { transform: translateX(-40px); }
        }
        @keyframes projectileR {
          from { left: 22%; opacity: 1; }
          to   { left: 80%; opacity: 0; }
        }
        @keyframes projectileL {
          from { left: 78%; opacity: 1; }
          to   { left: 20%; opacity: 0; }
        }
        @keyframes explode {
          0%   { transform: translate(-50%,-50%) scale(0.2); opacity: 1; }
          60%  { transform: translate(-50%,-50%) scale(1.4); opacity: 0.7; }
          100% { transform: translate(-50%,-50%) scale(2);   opacity: 0; }
        }
        @keyframes idle-drift {
          0%, 100% { transform: translateY(0px) scaleX(1); }
          50%       { transform: translateY(-3px) scaleX(1); }
        }
        @keyframes idle-drift-flip {
          0%, 100% { transform: translateY(0px) scaleX(-1); }
          50%       { transform: translateY(-3px) scaleX(-1); }
        }
        @keyframes screenGlow {
          0%,100% { box-shadow: inset 0 0 30px #FF6B3508; }
          50%     { box-shadow: inset 0 0 30px #FF6B350f; }
        }
        @keyframes roundPulse {
          0%,100% { opacity: 0.6; }
          50%     { opacity: 1; }
        }
      `}</style>

      {/* Starfield */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {stars.map(s => <Star key={s.id} {...s} />)}
      </div>

      {/* Scan line overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 40%, #000000aa 100%)',
      }} />

      {/* HUD — round + status */}
      <div style={{
        position: 'absolute', top: 8, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16,
        pointerEvents: 'none', zIndex: 30,
      }}>
        {active && (
          <div style={{ fontFamily: MONO, fontSize: 9, color: ACC, letterSpacing: 3,
            animation: 'roundPulse 2s ease-in-out infinite' }}>
            ROUND {round}
          </div>
        )}
        {allDefeated && (
          <div style={{ fontFamily: ORB, fontSize: 11, color: ACC, letterSpacing: 4 }}>
            ★ VICTORY ★
          </div>
        )}
        {playerDown && !allDefeated && (
          <div style={{ fontFamily: ORB, fontSize: 11, color: RED, letterSpacing: 4 }}>
            ✕ DEFEAT ✕
          </div>
        )}
      </div>

      {/* Enemy count bubbles */}
      {active && liveEnemies.length > 1 && (
        <div style={{
          position: 'absolute', top: 8, right: 12, zIndex: 30,
          display: 'flex', gap: 4,
        }}>
          {liveEnemies.slice(1, 4).map((e, i) => (
            <div key={e.id} style={{
              width: 18, height: 18, borderRadius: '50%',
              background: (FACTION_COLOR[e.faction] || '#9090b8') + '22',
              border: '1px solid ' + (FACTION_COLOR[e.faction] || '#9090b8') + '88',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: MONO, fontSize: 7,
              color: FACTION_COLOR[e.faction] || '#9090b8',
            }}>+{i === 2 && liveEnemies.length > 4 ? liveEnemies.length - 2 : 1}</div>
          ))}
        </div>
      )}

      {/* ── PLAYER SHIP — left side ── */}
      <div style={{
        position: 'absolute', left: '10%', top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        zIndex: 10,
      }}>
        <div style={{ animation: hitPlayer ? 'none' : 'idle-drift 4s ease-in-out infinite' }}>
          <ShipDisplay
            isPlayer={true}
            size={active ? 72 : 60}
            flip={false}
            hit={hitPlayer}
            defeated={playerDown && !allDefeated}
          />
        </div>
        {active && (
          <div style={{ fontFamily: MONO, fontSize: 7, color: TEAL + 'cc', letterSpacing: 2, textAlign: 'center' }}>
            THE INDESTRUCTIBLE II
          </div>
        )}
        {active && coleHP !== null && (
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ fontFamily: MONO, fontSize: 7, color: TEAL }}>
              C {coleHP}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 7, color: VELA }}>
              V {velaHP}
            </div>
          </div>
        )}
      </div>

      {/* ── ENEMY SHIP — right side ── */}
      {primaryEnemy ? (
        <div style={{
          position: 'absolute', right: '10%', top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          zIndex: 10,
        }}>
          <div style={{ animation: enemyDefeated || enemyHit ? 'none' : 'idle-drift-flip 3.5s ease-in-out infinite' }}>
            <ShipDisplay
              faction={primaryEnemy.faction}
              isBoss={primaryEnemy.isBoss}
              size={primaryEnemy.isBoss ? 88 : 64}
              flip={true}
              hit={enemyHit}
              defeated={enemyDefeated}
            />
          </div>
          {active && (
            <div style={{ fontFamily: MONO, fontSize: 7,
              color: (FACTION_COLOR[primaryEnemy.faction] || '#9090b8') + 'cc',
              letterSpacing: 1, textAlign: 'center', maxWidth: 80,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {primaryEnemy.name?.toUpperCase()}
            </div>
          )}
          {active && (
            <div style={{ fontFamily: MONO, fontSize: 7, color: RED }}>
              {primaryEnemy.hp}/{primaryEnemy.hpMax} HP
            </div>
          )}
        </div>
      ) : (
        /* No enemies — idle state */
        !active && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 8,
          }}>
            <div style={{ animation: 'idle-drift 4s ease-in-out infinite' }}>
              <ShipDisplay isPlayer={true} size={64} flip={false} />
            </div>
            <div style={{ fontFamily: MONO, fontSize: 8, color: ACC + '66', letterSpacing: 3 }}>
              STANDING BY
            </div>
          </div>
        )
      )}

      {/* Center line / VS */}
      {active && primaryEnemy && !enemyDefeated && (
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 1, height: '60%',
          background: `linear-gradient(to bottom, transparent, ${ACC}33, transparent)`,
          zIndex: 5,
        }} />
      )}

      {/* Projectiles */}
      {projectiles.map(p => (
        <Projectile
          key={p.id}
          fromLeft={p.fromLeft}
          color={p.color}
          onDone={() => setProjectiles(prev => prev.filter(x => x.id !== p.id))}
        />
      ))}

      {/* Explosions */}
      {explosions.map(e => (
        <Explosion key={e.id} x={e.x} y={e.y} color={e.color} />
      ))}

      {/* Corner brackets */}
      {[['tl','top:6px;left:6px','top','left'],['tr','top:6px;right:6px','top','right'],
        ['bl','bottom:6px;left:6px','bottom','left'],['br','bottom:6px;right:6px','bottom','right']].map(([k,p,v,h]) => (
        <div key={k} style={{
          position: 'absolute', [v]: 6, [h]: 6,
          width: 10, height: 10,
          borderStyle: 'solid', borderColor: ACC + '88', borderWidth: 0,
          [`border${v.charAt(0).toUpperCase()+v.slice(1)}Width`]: 1,
          [`border${h.charAt(0).toUpperCase()+h.slice(1)}Width`]: 1,
        }} />
      ))}
    </div>
  );
}
