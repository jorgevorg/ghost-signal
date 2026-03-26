#!/usr/bin/env python3
"""Patch CombatBattleScreen.jsx — wire MABEL into combat."""

import re

SRC = '/Users/jorgevorg/ghost-signal/src/CombatBattleScreen.jsx'

with open(SRC, 'r') as f:
    code = f.read()

orig = code  # keep for diffing

# ── 1. Fix destructure — add selectedEnemyId, coleEN, velaEN ─────────────
OLD1 = "  const { active, enemies = [], coleHP, velaHP, round } = ctBrief || {};"
NEW1 = "  const { active, enemies = [], coleHP, velaHP, coleEN, velaEN, round, selectedEnemyId } = ctBrief || {};"
assert OLD1 in code, "PATCH 1 anchor not found"
code = code.replace(OLD1, NEW1, 1)
print("✓ patch 1: destructure fixed")

# ── 2. Add commsOpen + mabelLine + commsLine states ───────────────────────
OLD2 = "  const [combatResult,setCombatResult]= useState(null);      // {txt,color,key}"
NEW2 = (
    "  const [combatResult,setCombatResult]= useState(null);      // {txt,color,key}\n"
    "  const [commsOpen,    setCommsOpen]   = useState(false);\n"
    "  const [mabelLine,    setMabelLine]   = useState('');\n"
    "  const [commsLine,    setCommsLine]   = useState('');\n"
    "  const [commsLoading2,setCommsLoading2] = useState(false);"
)
assert OLD2 in code, "PATCH 2 anchor not found"
code = code.replace(OLD2, NEW2, 1)
print("✓ patch 2: state declarations added")

# ── 3. Add MABEL API call at end of lastFire useEffect ────────────────────
# Anchor on the last line before the closing }, [ctBrief?.lastFire]);
OLD3 = "    setTimeout(() => setCombatResult(null), travelMs + 1800);\n  }, [ctBrief?.lastFire]);"
NEW3 = """    setTimeout(() => setCombatResult(null), travelMs + 1800);

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
  }, [ctBrief?.lastFire]);"""
assert OLD3 in code, "PATCH 3 anchor not found"
code = code.replace(OLD3, NEW3, 1)
print("✓ patch 3: MABEL lastFire API call added")

# ── 4. Add commsOpen useEffect after tab enter useEffect ─────────────────
OLD4 = "  const addBeam = (x1pct, y1pct, x2pct, y2pct, color, weaponType='laser') => {"
NEW4 = """  // ── MABEL COMMS channel — fires when overlay opens ───────────────────────
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
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 200,
        system: `You are MABEL, advising your crew during an open communication channel with an enemy vessel. The enemy is ${faction}, currently ${disposition}. Speak in 2-3 sentences as a tactical advisor. Be specific about what you know about this faction. You can be suspicious, wry, or cautiously optimistic depending on disposition. Never be generic. No asterisk actions.`,
        messages: [{ role: 'user', content: `Opening comms with ${selectedEnemy.name} (${faction}, ${disposition}). HP: ${selectedEnemy.hp}/${selectedEnemy.hpMax || selectedEnemy.hp}. Advise.` }],
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

  const addBeam = (x1pct, y1pct, x2pct, y2pct, color, weaponType='laser') => {"""
assert OLD4 in code, "PATCH 4 anchor not found"
code = code.replace(OLD4, NEW4, 1)
print("✓ patch 4: commsOpen useEffect added")

# ── 5. Update top bar — show mabelLine as ticker ─────────────────────────
OLD5 = """        <span style={{ fontFamily:MONO, fontSize:7, color: active ? TEAL+'cc' : 'rgba(255,255,255,0.13)', letterSpacing:2 }}>
          {active ? 'MABEL // COMBAT ACTIVE' : 'MABEL // GHOST SIGNAL // STANDBY'}
        </span>"""
NEW5 = """        <span style={{ fontFamily:MONO, fontSize:7, color: active ? TEAL+'cc' : 'rgba(255,255,255,0.13)', letterSpacing:2,
          flex:1, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', maxWidth:420 }}>
          {mabelLine && active ? mabelLine : active ? 'MABEL // COMBAT ACTIVE' : 'MABEL // GHOST SIGNAL // STANDBY'}
        </span>"""
assert OLD5 in code, "PATCH 5 anchor not found"
code = code.replace(OLD5, NEW5, 1)
print("✓ patch 5: top bar MABEL ticker updated")

# ── 6. Update COMMS overlay — show commsLine below MABEL portrait ─────────
OLD6 = """                  <div style={{ fontFamily:ORB,fontSize:7,color:TEAL,letterSpacing:2 }}>MABEL</div>
                </div>"""
NEW6 = """                  <div style={{ fontFamily:ORB,fontSize:7,color:TEAL,letterSpacing:2 }}>MABEL</div>
                  {commsLoading2 && <div style={{ fontFamily:MONO,fontSize:5,color:TEAL+'55',letterSpacing:1,animation:'roundPulse 1s ease-in-out infinite' }}>CONNECTING...</div>}
                  {commsLine && !commsLoading2 && <div style={{ fontFamily:MONO,fontSize:6,color:TEAL+'cc',lineHeight:1.5,textAlign:'center',marginTop:2,padding:'0 2px' }}>{commsLine}</div>}
                </div>"""
assert OLD6 in code, "PATCH 6 anchor not found"
code = code.replace(OLD6, NEW6, 1)
print("✓ patch 6: COMMS overlay MABEL line added")

# ── Write output ──────────────────────────────────────────────────────────
with open(SRC, 'w') as f:
    f.write(code)

changed = sum(1 for a, b in zip(orig.splitlines(), code.splitlines()) if a != b)
added = len(code.splitlines()) - len(orig.splitlines())
print(f"\n✅ Done. Lines changed: ~{changed}, lines added: {added}")
print(f"   File: {SRC}")
