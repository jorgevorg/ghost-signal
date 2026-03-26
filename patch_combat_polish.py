#!/usr/bin/env python3
"""Patch CombatBattleScreen.jsx — visual polish batch.

Fixes:
 1. Cole color in left panel (TEAL → YEL #FFD166)
 2. Frame on left panel (combat orange border)
 3. Reticle redesign (SVG corner-bracket HUD targeting)
 4. Beam origin y lowered ~1.7% (4px equiv)
 5. Shot scatter expanded to cover sprite body
 6. Ship size capped at 41 (4-enemy size is ideal)
 7. Faction hue-rotate on ALL enemy ships (not just leaders)
 8. Add reticleScan animation to styles block
"""

SRC = '/Users/jorgevorg/ghost-signal/src/CombatBattleScreen.jsx'

with open(SRC, 'r') as f:
    code = f.read()

orig_lines = len(code.splitlines())
checks = []

# ── 1. Cole color in left panel ───────────────────────────────────────────
OLD1 = """              <div style={{ width:4, height:4, borderRadius:'50%', background: coleHPDisp > 0 ? TEAL : 'rgba(255,255,255,0.13)', flexShrink:0 }} />
              <span style={{ fontFamily:ORB, fontSize:7, color: coleHPDisp > 0 ? TEAL : 'rgba(255,255,255,0.2)', letterSpacing:1, flex:1 }}>COLE</span>
              <span style={{ fontFamily:MONO, fontSize:7, color: coleHPDisp > 0 ? TEAL+'99' : 'rgba(255,255,255,0.13)' }}>{coleHPDisp}</span>"""
NEW1 = """              <div style={{ width:4, height:4, borderRadius:'50%', background: coleHPDisp > 0 ? YEL : 'rgba(255,255,255,0.13)', flexShrink:0 }} />
              <span style={{ fontFamily:ORB, fontSize:7, color: coleHPDisp > 0 ? YEL : 'rgba(255,255,255,0.2)', letterSpacing:1, flex:1 }}>COLE</span>
              <span style={{ fontFamily:MONO, fontSize:7, color: coleHPDisp > 0 ? YEL+'99' : 'rgba(255,255,255,0.13)' }}>{coleHPDisp}</span>"""
checks.append(('Cole YEL color', OLD1 in code))
code = code.replace(OLD1, NEW1, 1)

# Cole HP bar color
OLD1b = "            <MiniBar val={coleHPDisp} max={coleMaxHP} color={TEAL} h={3} />"
NEW1b = "            <MiniBar val={coleHPDisp} max={coleMaxHP} color={YEL} h={3} />"
checks.append(('Cole HP bar YEL', OLD1b in code))
code = code.replace(OLD1b, NEW1b, 1)

# Cole panel border
OLD1c = "border:'1px solid rgba(0,255,208,0.08)' }}"
NEW1c = "border:'1px solid rgba(255,209,102,0.12)' }}"
checks.append(('Cole panel border YEL', OLD1c in code))
code = code.replace(OLD1c, NEW1c, 1)

print("✓ patch 1: Cole colors → YEL")

# ── 2. Frame on left panel ────────────────────────────────────────────────
OLD2 = "        <div style={{ width:100, flexShrink:0, background:'#03060a', borderRight:'1px solid rgba(255,255,255,0.03)', padding:'7px 6px', display:'flex', flexDirection:'column', gap:6, zIndex:45, overflow:'hidden' }}>"
NEW2 = "        <div style={{ width:100, flexShrink:0, background:'#06090e', border:'1px solid rgba(255,107,53,0.14)', borderRight:'1px solid rgba(255,107,53,0.14)', padding:'7px 6px', display:'flex', flexDirection:'column', gap:6, zIndex:45, overflow:'hidden' }}>"
checks.append(('Left panel frame', OLD2 in code))
code = code.replace(OLD2, NEW2, 1)
print("✓ patch 2: left panel frame")

# ── 3. Reticle redesign ───────────────────────────────────────────────────
OLD3 = """                    {isSelected && !isDefeated && (
                      <div style={{ position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)', width:shipSize+20,height:shipSize+20, border:'1px solid '+eColor, borderRadius:'50%', animation:'reticlePulse 1.2s ease-in-out infinite', pointerEvents:'none', zIndex:14 }}/>
                    )}"""
NEW3 = """                    {isSelected && !isDefeated && (
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
                    )}"""
checks.append(('Reticle redesign', OLD3 in code))
code = code.replace(OLD3, NEW3, 1)
print("✓ patch 3: reticle → SVG corner-bracket HUD")

# ── 4. Beam origin y lowered ──────────────────────────────────────────────
OLD4 = "    const wingTop    = { x: 15.8, y: 38 };\n    const wingBottom = { x: 15.8, y: 52.2 };"
NEW4 = "    const wingTop    = { x: 15.8, y: 40 };\n    const wingBottom = { x: 15.8, y: 54 };"
checks.append(('Wing beam y lowered', OLD4 in code))
code = code.replace(OLD4, NEW4, 1)
print("✓ patch 4: beam origin y lowered ~2%")

# ── 5. Shot scatter expanded ──────────────────────────────────────────────
OLD5 = "    const aimX = targetX + (Math.random() - 0.5) * 4;  // ±2% horizontal scatter\n    const aimY = targetY + (Math.random() - 0.5) * 10; // ±5% vertical scatter"
NEW5 = "    const aimX = targetX + (Math.random() - 0.5) * 14; // ±7% horizontal — full sprite body\n    const aimY = targetY + (Math.random() - 0.5) * 16; // ±8% vertical — full sprite body"
checks.append(('Shot scatter expanded', OLD5 in code))
code = code.replace(OLD5, NEW5, 1)
print("✓ patch 5: shot scatter expanded to sprite body")

# ── 6. Ship size capped at 41 ─────────────────────────────────────────────
OLD6 = "  const shipSize    = eCount <= 1 ? 68 : eCount === 2 ? 58 : eCount === 3 ? 48 : eCount === 4 ? 41 : 35;"
NEW6 = "  // Size locked: 4-enemy size (41px) is ideal. Cap there to prevent dead-enemy scale-up.\n  const shipSize    = eCount >= 5 ? 35 : 41;"
checks.append(('Ship size cap 41', OLD6 in code))
code = code.replace(OLD6, NEW6, 1)
print("✓ patch 6: ship size capped at 41px")

# ── 7. Faction hue-rotate on ALL enemy ships ──────────────────────────────
OLD7 = """  const hitFilter = hit
    ? `drop-shadow(0 0 18px ${RED}ff) drop-shadow(0 0 6px ${RED}) brightness(2)`
    : isLeader && !isPlayer
    ? `sepia(1) saturate(8) hue-rotate(${_hueFor(leaderColor)}deg) brightness(1.05)`
    : isPlayer
    ? `drop-shadow(0 0 10px ${TEAL}88)`
    : `drop-shadow(0 0 8px ${color}66)`;"""
NEW7 = """  const hitFilter = hit
    ? `drop-shadow(0 0 18px ${RED}ff) drop-shadow(0 0 6px ${RED}) brightness(2)`
    : isPlayer
    ? `drop-shadow(0 0 10px ${TEAL}88)`
    : `sepia(1) saturate(8) hue-rotate(${_hueFor(leaderColor)}deg) brightness(${isLeader ? 1.08 : 0.95}) drop-shadow(0 0 6px ${leaderColor}55)`;"""
checks.append(('Faction hue-rotate all enemies', OLD7 in code))
code = code.replace(OLD7, NEW7, 1)
print("✓ patch 7: faction hue-rotate applied to all enemy ships")

# ── 8. Add reticleScan animation ──────────────────────────────────────────
OLD8 = "        @keyframes commsSlideIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}"
NEW8 = "        @keyframes commsSlideIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}\n        @keyframes reticleScan{0%,100%{opacity:0.12}50%{opacity:0.35}}"
checks.append(('reticleScan animation', OLD8 in code))
code = code.replace(OLD8, NEW8, 1)
print("✓ patch 8: reticleScan animation added")

# ── Validation ────────────────────────────────────────────────────────────
print("\nAnchor checks:")
all_ok = True
for name, found in checks:
    status = "✓" if found else "✗ MISSING"
    print(f"  {status}  {name}")
    if not found:
        all_ok = False

if not all_ok:
    print("\n⚠️  Some anchors were not found — file NOT written")
    exit(1)

with open(SRC, 'w') as f:
    f.write(code)

added = len(code.splitlines()) - orig_lines
print(f"\n✅ Done. Lines added: {added}")
print(f"   File: {SRC}")
