with open('/Users/jorgevorg/ghost-signal/src/App.jsx', 'r') as f:
    src = f.read()

ENEMY_DB = r"""
const ENEMY_DB={
  // ── CORSAIR SYNDICATE ──────────────────────────────────────
  "Looter":{faction:"corsair",hp:10,armor:0,vig:1,gra:1,min:0,tec:1,actions:1,difficulty:"easy",exp:1,
    moves:["1–5: Revolver [d6+VIG]","6–9: Flash Round — Stun for TEC turns","10: Steal 50⊙"]},
  "Space Pirate":{faction:"corsair",hp:15,armor:1,vig:0,gra:2,min:2,tec:0,actions:1,difficulty:"easy",exp:1,
    moves:["1: ShieldStim — remove Shock","2–6: Ignition Shotgun [d10+VIG]","7–9: Heat Bomb — Overheat","10: Zero-G Liquor — gain Advantage"]},
  "Mercenary":{faction:"corsair",hp:20,armor:2,vig:0,gra:3,min:2,tec:0,actions:1,difficulty:"medium",exp:3,
    skill:"Can't be Shocked",
    moves:["1: BurnPatch — remove Overheat","2–6: Ion Carbine [d10+GRA]","7–9: Flash Round — Stun","10: Tricillin Tablet — +1 all stats"]},
  "Bounty Hunter":{faction:"corsair",hp:25,armor:3,vig:0,gra:3,min:3,tec:0,actions:2,difficulty:"medium",exp:3,
    skill:"Can't be Shocked",
    moves:["1–2: Helix Wire [d8+VIG]","3–5: Pulse Rifle [2d6+VIG]","6–7: EMP Grenade — Silence","8–9: Flash Round — Stun","10: Tricillin Tablet"]},
  "Outer Ring Crime Boss":{faction:"corsair",hp:90,armor:4,vig:0,gra:5,min:2,tec:1,actions:2,difficulty:"boss",exp:6,isBoss:true,
    moves:["1–4: Laser Blaster — ignores armor","5–6: Flash Round — Stun","7–8: Frag Grenade","9: Zero-G Liquor — Advantage","10: Tricillin Tablet"]},
  // ── W.A.R.G. ──────────────────────────────────────────────
  "Edge-Worlder":{faction:"warg",hp:15,armor:0,vig:1,gra:0,min:0,tec:2,actions:1,difficulty:"easy",exp:1,
    moves:["1–2: Bandage Wounds — +d10 HP","3–6: Rocket Hammer [d10+VIG]","7–9: EMP Grenade — Silence","10: Scrap Mallet — next Rocket Hammer +2 dmg"]},
  "Bullseye Hunter":{faction:"warg",hp:20,armor:1,vig:0,gra:2,min:1,tec:2,actions:1,difficulty:"medium",exp:3,
    moves:["1–3: Bandage Wounds — +d10 HP","4–6: Gravity Rifle [d12+GRA]","7–9: Tracking Shot","10: Precision Shot"]},
  "Rebel Fighter":{faction:"warg",hp:20,armor:2,vig:0,gra:2,min:3,tec:0,actions:1,difficulty:"easy",exp:1,
    moves:["1–4: Carbon Dagger [d6+GRA]","5–9: Gauss SMG [d8+GRA] — +2 dmg if GRA higher","10: Frag Grenade"]},
  "Guerrilla Commander":{faction:"warg",hp:30,armor:3,vig:0,gra:2,min:4,tec:0,actions:2,difficulty:"hard",exp:6,
    moves:["1–3: Revolver [d6+VIG]","4–7: Pulse Rifle [2d6+VIG]","8–9: Heat Bomb — Overheat","10: Frag Grenade"]},
  "W.A.R.G. Major General":{faction:"warg",hp:80,armor:5,vig:0,gra:5,min:3,tec:2,actions:1,difficulty:"boss",exp:6,isBoss:true,
    moves:["1–4: Neon Blade [d12+VIG]","5–7: Mantis Scythes","8–9: HACK_Ignite — d12+MIN, Overheat","10: Frag Grenade"]},
  // ── MEDUSA SECTOR ─────────────────────────────────────────
  "Scientist":{faction:"medusa",hp:10,armor:0,vig:0,gra:0,min:2,tec:2,actions:1,difficulty:"easy",exp:1,
    moves:["1–4: Treat Wounds — +d8 HP","5–7: Gamma Gun [d8+TEC]","8–9: HACK_Kraken — Stun all 1 turn","10: Electroxyn Capsule — +1 TEC"]},
  "Drone Operator":{faction:"medusa",hp:15,armor:1,vig:0,gra:0,min:0,tec:2,actions:3,difficulty:"easy",exp:1,
    moves:["1–3: Wrench","4–6: EMP Relay — Silence 2 turns","7–9: Nano-Taser — Shock 2 turns","10: Electroxyn Capsule"]},
  "NetHacker":{faction:"medusa",hp:20,armor:0,vig:0,gra:1,min:3,tec:2,actions:1,difficulty:"medium",exp:3,
    moves:["1–2: Gauss SMG [d6+GRA]","3–5: HACK_Trojan — d6+MIN, +2 dmg vulnerability","6–9: HACK_Ignite — d12+MIN, Overheat","10: Stratogen Hormones — +1 MIN"]},
  "Cyber-Terrorist":{faction:"medusa",hp:30,armor:1,vig:0,gra:0,min:2,tec:4,actions:2,difficulty:"hard",exp:6,
    moves:["1–2: Carbon Dagger [d6+GRA]","3–5: HACK_Trojan","6–7: HACK_Counterspell — cancel next hack","8–9: HACK_Shadow — untargetable 1 turn","10: HACK_Shadow"]},
  "Medusa MasterHacker":{faction:"medusa",hp:95,armor:3,vig:0,gra:0,min:2,tec:5,actions:3,difficulty:"boss",exp:6,isBoss:true,
    moves:["1–3: HACK_Parasyte — d4 dmg per turn","4–5: HACK_Supernova — 3d6+MIN to all","6–7: HACK_Hydra","8–9: HACK_Mindsteal","10: HACK_Shadow"]},
  // ── ISF + NEUTRAL ─────────────────────────────────────────
  "Merchant":{faction:"isf",hp:10,armor:0,vig:0,gra:0,min:2,tec:2,actions:1,difficulty:"easy",exp:1,
    moves:["1–3: Carbon Dagger [d6+GRA]","4–9: HACK_Ember — d4+MIN, Overheat","10: HACK_Ignite"]},
  "ISF Soldier":{faction:"isf",hp:15,armor:3,vig:0,gra:2,min:0,tec:2,actions:1,difficulty:"easy",exp:1,
    moves:["1–2: Shock Shackles — Stun 2 turns","3–6: Plasma Shield [d8+VIG] +1 Armor","7–9: HACK_Counterspell","10: Call Reinforcements"]},
  "ISF Sentinel":{faction:"isf",hp:35,armor:2,vig:0,gra:2,min:1,tec:2,actions:1,difficulty:"medium",exp:3,
    moves:["1–2: Shock Shackles — Stun 2 turns","3–5: Pulse Rifle [2d6+VIG]","6–9: HACK_Ignite — d12+MIN","10: Reinforcements"]},
  "ISF Trade Baron":{faction:"isf",hp:99,armor:3,vig:0,gra:3,min:2,tec:3,actions:2,difficulty:"boss",exp:6,isBoss:true,
    moves:["1–2: Shock Shackles","3–5: Gravity Rifle [d12+GRA]","6–9: HACK_Ragnarok — d8+MIN, block highest action","10: Call Reinforcements"]},
  // ── SYNTH ARCH ────────────────────────────────────────────
  "Automaton Bot":{faction:"synth",hp:8,armor:5,vig:0,gra:1,min:0,tec:0,actions:2,difficulty:"easy",exp:1,
    moves:["1–2: Self-Repair — +d6 HP","3–7: Claw Grip — d8+TEC","8–9: Taser Shell — Shock","10: Defense Protocol — gain +2 Armor 2 turns"]},
  "Android Synth":{faction:"synth",hp:15,armor:3,vig:0,gra:1,min:0,tec:1,actions:3,difficulty:"easy",exp:1,
    moves:["1–2: Self-Repair","3–7: Gamma Gun [d8+TEC]","8–9: HACK_Blackout — Silence","10: Machine Learning — +1 TEC"]},
  "Cyborg":{faction:"synth",hp:20,armor:3,vig:0,gra:2,min:2,tec:0,actions:2,difficulty:"medium",exp:3,
    moves:["1: Malfunction — lose 1 action this turn","2–3: Metallic Strike [d6+VIG]","4–7: Atlas Hands [d10+VIG]","8–9: Chainsaw Arms [d10×VIG]","10: Chainsaw Arms"]},
  "Android Titan":{faction:"synth",hp:30,armor:3,vig:0,gra:3,min:0,tec:2,actions:3,difficulty:"hard",exp:6,
    moves:["1–2: Self-Repair","3–5: Shoulder Turrets [d8+TEC to all]","6–7: Claw Grip","8–9: Cyber Chromefist [Armor×3]","10: Defense Protocol"]},
  "Synth Apostle":{faction:"synth",hp:70,armor:7,vig:0,gra:2,min:5,tec:3,actions:3,difficulty:"boss",exp:6,isBoss:true,
    moves:["1: System Reset — remove all own conditions","2–3: HACK_Archangel — restore MIN×5 HP ally","4–5: HACK_Volt — d8+MIN, Shock","6–7: Mantis Scythes [d6×GRA]","8–10: HACK_Volt"]},
  // ── ALIENS ────────────────────────────────────────────────
  "Mutated Chimaera":{faction:"alien",hp:55,armor:0,vig:5,gra:4,min:0,tec:0,actions:1,difficulty:"hard",exp:6,
    moves:["1–2: Hardening Skin — +2 Armor","3–4: Straining Tail — Stun 1 turn","5–7: Gargantuan Bite [d12+VIG]","8–9: Gargantuan Bite","10: Feral Rage — +2 VIG 2 turns"]},
  "Void Crawler":{faction:"alien",hp:20,armor:0,vig:1,gra:2,min:0,tec:0,actions:1,difficulty:"easy",exp:1,
    moves:["1–5: Fuel Secretion — Shock 1 turn","6–9: Retractable Mandibles [d8+VIG]","10: Teleport — gain Advantage next turn"]},
  "Dust Wasp":{faction:"alien",hp:15,armor:0,vig:2,gra:3,min:0,tec:0,actions:1,difficulty:"easy",exp:1,
    moves:["1–4: Diptera Wings — Silence 1 turn","5–9: Poisonous Stinger [d6+VIG] — Overheat","10: Swarm — 3 attacks of d4"]},
  "Deepworm":{faction:"alien",hp:30,armor:0,vig:4,gra:1,min:2,tec:0,actions:1,difficulty:"medium",exp:3,
    moves:["1–4: Body Press [d10+VIG]","5–9: Abyssal Maw [d12+VIG]","10: Hardening Skin — +3 Armor 2 turns"]},
  "Glyphmoth Queen":{faction:"alien",hp:70,armor:0,vig:2,gra:4,min:3,tec:0,actions:1,difficulty:"boss",exp:6,isBoss:true,
    moves:["1–2: Chrysalis Shield — gain Immunity 2 turns","3–5: Hypnosis — Silence 2 turns","6–7: Penetrating Gaze","8–9: Penetrating Gaze [d8+MIN]","10: Mental Shock — Stun all"]},
  "Xhiroptera Predator":{faction:"alien",hp:65,armor:0,vig:4,gra:4,min:2,tec:0,actions:1,difficulty:"hard",exp:6,
    moves:["1–3: Echolocation — gain Advantage","4–6: Curved Fangs [d10+VIG]","7–9: Vampiric Bite [d8+VIG] — restore HP","10: Fast Claw — 2 attacks"]},
  // ── WANTED TARGETS ────────────────────────────────────────
  "Jürgen Bohr":{faction:"wanted",hp:55,armor:0,vig:0,gra:0,min:4,tec:4,actions:1,difficulty:"boss",exp:6,isBoss:true,
    skill:"Xenoform: swap MIN+TEC with VIG+GRA 2 turns",
    moves:["1–6: Syringe Shot [d6+TEC] — target half dmg 2 turns","7–8: Synthesis — ROLL MIN, restore d8+TEC HP","9–10: Xenoform — swap stats, Immune + d8+VIG to all"]},
  "ARCADIA 07812":{faction:"wanted",hp:30,armor:0,vig:3,gra:3,min:3,tec:3,actions:1,difficulty:"boss",exp:6,isBoss:true,
    skill:"Permanently Immune to all damage",
    moves:["1–3: Phaser Pistol [d6] — roll 6 = +10 dmg","4–7: CODE A — ROLL TEC, all enemies d8+TEC","8–9: CODE B — +3 all stats 3 turns","10: ERROR 404 — lose Immunity 1 turn"]},
  "Dexter D. Dice":{faction:"wanted",hp:65,armor:0,vig:4,gra:3,min:1,tec:1,actions:2,difficulty:"boss",exp:6,isBoss:true,
    skill:"Double all stats at 10 HP or lower",
    moves:["1–3: Harpoon Cannon [2d8] — no weapons 2 turns if higher VIG","4–7: Devil Drug — +1 all + restore d12 HP","8–9: Gomu Grip — d6+VIG to all, Silence 2 turns","10: High Gear — +1 extra Action next turn"]},
  "XxGothKittyxX":{faction:"wanted",hp:60,armor:0,vig:1,gra:2,min:5,tec:3,actions:1,difficulty:"boss",exp:6,isBoss:true,
    skill:"First 2 Hacks don't require a roll",
    moves:["1–4: Gauss SMG [d6+GRA] — +d4 per Hack if higher MIN","5–6: HACK_Kraken — Stun all 1 turn","7–9: HACK_Aegis — +TEC Armor for MIN turns","10: HACK_Ignite — d12+MIN, Overheat 2 turns"]},
  "Ogon Blaze":{faction:"wanted",hp:75,armor:0,vig:2,gra:4,min:0,tec:3,actions:2,difficulty:"boss",exp:6,isBoss:true,
    skill:"Takes 2 Actions per turn",
    moves:["1–3: Atlantic Pistol [d8+GRA] — +TEC if Overheated","4–7: Molotov — ROLL GRA, Overheat 3 turns","8–9: Mosh Pit — d6+VIG to all, Overheated also Shocked 2 turns","10: Encore — Immune 2 turns"]},
  "Syxtvs XVII":{faction:"wanted",hp:77,armor:0,vig:0,gra:2,min:3,tec:5,actions:1,difficulty:"boss",exp:6,isBoss:true,
    skill:"+1 VIG each time HP is restored",
    moves:["1–3: Laser Minigun [4d4+VIG] — roll base twice, keep highest","4–5: Lay on Hands — ROLL TEC, restore 2d6+TEC HP","6–9: Crown of Chains — Overheat + Silence + Shock all 2 turns","10: CPU Prayer — restore TEC HP, +1 MIN"]},
};
const ENEMY_NAMES=Object.keys(ENEMY_DB);
const FACTION_COLORS={corsair:"#FF2060",warg:"#FFD166",medusa:"#00FFD0",isf:"#aaaaff",synth:"#cc88ff",alien:"#FF6B35",wanted:"#FF6EC7"};
const DIFFICULTY_C={easy:"#00FFD0",medium:"#FFD166",hard:"#FF6B35",boss:"#FF2060"};

"""

src = src.replace(
    'const STATUS_C_CT={',
    ENEMY_DB + 'const STATUS_C_CT={',
    1
)
print("✓ ENEMY_DB inserted" if 'ENEMY_DB' in src else "✗ ENEMY_DB MISSED")

with open('/Users/jorgevorg/ghost-signal/src/App.jsx', 'w') as f:
    f.write(src)
print("Done. Lines:", src.count('\n'))
