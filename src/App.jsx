import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom/client";
import * as THREE from "three";

const MONO="'Share Tech Mono',monospace",ORB="'Orbitron',sans-serif",RAJ="'Rajdhani',sans-serif",BG="#0a0a14";
const B1="#7a7aaa",B2="#555578",B3="#9090b8";
const css=`@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@700;900&family=Rajdhani:wght@400;600&display=swap');
html,body{background:#080810!important;margin:0;padding:0;overflow:hidden;zoom:1.15}
@keyframes in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
@keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
@keyframes engpulse{0%,100%{opacity:.35}50%{opacity:1}}
@keyframes flarePulse{0%,100%{opacity:.7;transform:scale(1)}50%{opacity:1;transform:scale(1.18)}}
@keyframes moonOrbit{from{transform:rotate(0deg) translateX(19px) rotate(0deg)}to{transform:rotate(360deg) translateX(19px) rotate(-360deg)}}
@keyframes shimmer{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes shipPulse{0%,100%{filter:drop-shadow(0 0 4px currentColor)}50%{filter:drop-shadow(0 0 12px currentColor)}}
@keyframes cutMarch{0%{stroke-dashoffset:0}100%{stroke-dashoffset:-24}}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0d0d1a}::-webkit-scrollbar-thumb{background:#FF206044;border-radius:2px} @keyframes ringOrbit{from{transform:rotate(0deg)}to{transform:rotate(360deg)}} @keyframes missionIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
@keyframes bootGlow{0%,100%{text-shadow:0 0 30px #FF206066,0 0 60px #FF206022}50%{text-shadow:0 0 80px #FF2060cc,0 0 160px #FF206055}}
@keyframes scanmove{0%{background-position:0 0}100%{background-position:0 4px}}
@keyframes bootGlow{0%{opacity:0;filter:brightness(3)}100%{opacity:1;filter:brightness(1)}}
@keyframes bootGlow{0%{opacity:0;filter:brightness(3)}100%{opacity:1;filter:brightness(1)}}
.gs-scan{pointer-events:none;position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent 0,transparent 2px,rgba(0,220,180,.012) 2px,rgba(0,220,180,.012) 4px);z-index:997;animation:scanmove .12s linear infinite}
@keyframes hexAppear{from{opacity:0;transform:scale(0.4)}to{opacity:1;transform:scale(1)}}
@keyframes slideLeft{from{opacity:0;transform:translateX(-50px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideRight{from{opacity:0;transform:translateX(50px)}to{opacity:1;transform:translateX(0)}}
@keyframes titleFlash{0%{opacity:0;transform:scale(1.08)}15%{opacity:1;transform:scale(1)}100%{opacity:1}}
@keyframes bootFadeOut{from{opacity:1}to{opacity:0}}
@keyframes dangerPulse{0%,100%{box-shadow:inset 0 0 8px #FF206066,inset 0 0 16px #FF206022;opacity:1}50%{box-shadow:inset 0 0 22px #FF2060cc,inset 0 0 44px #FF206055;opacity:.85}}
@keyframes glitch{0%,88%,100%{transform:translateX(0)}90%{transform:translateX(-3px)}92%{transform:translateX(3px)}94%{transform:translateX(-2px)}96%{transform:translateX(2px)}}
`;

const CAMPAIGN_MAPS=[
 {id:"01",name:"VIVARIUM",level:2,desc:"Four derelict O'Neill cylinders house rare flora and fauna. After decades without human supervision, their current status is unclear."},
 {id:"02",name:"MIRROR",level:2,desc:"A divided system split down the middle into two equal sides. The two halves are controlled by opposing factions engaged in war."},
 {id:"03",name:"COLOSSEUM",level:2,desc:"Concentrated gas and ice particle clusters orbit the system's outer ring, surrounding and shielding its traversable core."},
 {id:"04",name:"FORTRESS",level:2,desc:"Two ancient military citadels have been captured by opposing factions, turning the system into a galactic war theater."},
 {id:"05",name:"DOLOS",level:2,desc:"Various triangular metallic megastructures appeared in this system years ago. Their origin or purpose is still unknown."},
 {id:"06",name:"HALLWAY",level:2,desc:"The dense, impassable asteroid fields at opposite ends of the system make its center the only way to travel between its 2 Bases."},
 {id:"07",name:"BERMUDA",level:3,desc:"Six strange void formations gravitate around the star, believed to be the cause of the disappearance of countless spacecraft."},
 {id:"08",name:"ARMADA",level:3,desc:"An Old World galactic shipyard, consisting of three giant platforms, each with the capacity to manufacture millions of vessels."},
 {id:"09",name:"CROSSHAIR",level:3,desc:"Divided into three separate areas of control, this system is an active warzone where each faction fights relentlessly for territory."},
 {id:"10",name:"SNOWFLAKE",level:3,desc:"An experimental solar reconstructive prototype. Part of its previously inhabited core structure has been taken over by faction forces."},
 {id:"11",name:"DYSON SPHERE",level:3,desc:"A giant artificial shell envelops the star. The old and broken sphere can barely power three faction bases located on its perimeter."},
 {id:"12",name:"RINGWORLD",level:3,desc:"Three Settlements connected by a hollow carbon ring torus. The monumental structure once housed billions of human lives."},
];

// Ring reference: Ring1=IDs 1-6(1=lower-left CW), Ring2=IDs 7-18, Ring3=IDs 19-36
const HEX_RB=[0,5,4,3,2,1,6,16,15,14,13,12,11,10,9,8,7,18,17,33,32,31,30,29,28,27,26,25,24,23,22,21,20,19,36,35,34];
const MAP_PRESETS={"01":{"8":{type:"barrier"},"9":{type:"barrier"},"11":{type:"barrier"},"12":{type:"barrier"},"14":{type:"barrier"},"15":{type:"barrier"},"17":{type:"barrier"},"18":{type:"barrier"},"19":{type:"base"},"28":{type:"base"}},"02":{"3":{type:"barrier"},"6":{type:"barrier"},"8":{type:"base"},"11":{type:"barrier"},"14":{type:"base"},"17":{type:"barrier"},"25":{type:"barrier"},"34":{type:"barrier"}},"03":{"11":{type:"base"},"17":{type:"base"},"20":{type:"barrier",name:"Gas Cluster"},"21":{type:"barrier",name:"Ice Particles"},"23":{type:"barrier",name:"Gas Cluster"},"24":{type:"barrier",name:"Gas Cluster"},"26":{type:"barrier",name:"Ice Particles"},"27":{type:"barrier",name:"Gas Cluster"},"29":{type:"barrier",name:"Ice Particles"},"30":{type:"barrier",name:"Ice Particles"},"32":{type:"barrier",name:"Gas Cluster"},"33":{type:"barrier",name:"Ice Particles"},"35":{type:"barrier",name:"Gas Cluster"},"36":{type:"barrier",name:"Gas Cluster"}},"04":{"8":{type:"barrier"},"10":{type:"barrier"},"12":{type:"base"},"14":{type:"barrier"},"16":{type:"barrier"},"18":{type:"base"},"19":{type:"barrier"},"20":{type:"barrier"},"24":{type:"barrier"},"25":{type:"barrier"},"28":{type:"barrier"},"29":{type:"barrier"},"33":{type:"barrier"},"34":{type:"barrier"}},"05":{"7":{type:"barrier"},"9":{type:"barrier"},"10":{type:"barrier"},"12":{type:"barrier"},"13":{type:"barrier"},"15":{type:"barrier"},"16":{type:"barrier"},"18":{type:"barrier"},"23":{type:"barrier"},"25":{type:"base"},"27":{type:"barrier"},"32":{type:"barrier"},"34":{type:"base"},"36":{type:"barrier"}},"06":{"7":{type:"barrier"},"11":{type:"barrier"},"12":{type:"barrier"},"13":{type:"barrier"},"17":{type:"barrier"},"18":{type:"barrier"},"19":{type:"barrier"},"22":{type:"base"},"25":{type:"barrier"},"26":{type:"barrier"},"27":{type:"barrier"},"28":{type:"barrier"},"31":{type:"base"},"34":{type:"barrier"},"35":{type:"barrier"},"36":{type:"barrier"}},"07":{"8":{type:"barrier"},"10":{type:"barrier"},"12":{type:"barrier"},"14":{type:"barrier"},"16":{type:"barrier"},"18":{type:"barrier"},"22":{type:"base"},"28":{type:"base"},"34":{type:"base"}},"08":{"7":{type:"barrier"},"9":{type:"barrier"},"10":{type:"base"},"11":{type:"barrier"},"13":{type:"barrier"},"14":{type:"base"},"15":{type:"barrier"},"17":{type:"barrier"},"18":{type:"base"},"23":{type:"barrier"},"24":{type:"barrier"},"29":{type:"barrier"},"30":{type:"barrier"},"35":{type:"barrier"},"36":{type:"barrier"}},"09":{"1":{type:"barrier"},"3":{type:"barrier"},"5":{type:"barrier"},"7":{type:"barrier"},"9":{type:"base"},"11":{type:"barrier"},"13":{type:"base"},"15":{type:"barrier"},"17":{type:"base"},"19":{type:"barrier"},"25":{type:"barrier"},"31":{type:"barrier"}},"10":{"1":{type:"barrier"},"2":{type:"base"},"3":{type:"barrier"},"4":{type:"base"},"5":{type:"barrier"},"6":{type:"base"},"7":{type:"barrier"},"9":{type:"barrier"},"11":{type:"barrier"},"13":{type:"barrier"},"15":{type:"barrier"},"17":{type:"barrier"}},"11":{"1":{type:"base"},"2":{type:"barrier"},"3":{type:"base"},"4":{type:"barrier"},"5":{type:"base"},"6":{type:"barrier"}},"12":{"3":{name:"Ring Settlement Beta",notes:"Hollow carbon ring torus"},"7":{type:"barrier"},"8":{type:"barrier",name:"Ring Torus"},"9":{type:"base"},"10":{type:"barrier",name:"Ring Torus"},"11":{type:"barrier",name:"Ring Torus"},"12":{type:"barrier",name:"Ring Torus"},"13":{type:"base"},"14":{type:"barrier"},"15":{type:"barrier"},"16":{type:"barrier"},"17":{type:"base"},"18":{type:"barrier"}}};
const RING_PHASES=[
  {id:"outer",label:"OUTER RING",c:"#00FFD0",die:6,desc:"Outer reaches — pirates, outlaws, asteroid fields. Dangerous but traversable."},
  {id:"mid",  label:"MID RING",  c:"#FFD166",die:8,desc:"Mid zone — former settlements, research posts, water worlds. Escalating stakes."},
  {id:"inner",label:"INNER RING",c:"#FF6B35",die:12,desc:"Inner core — solar flares, Helios Farms, extreme heat. This is the end game."},
];
const BARRIER_C="#FF8C00",BASE_C="#cc88ff";const IC={settlement:"#FFD166",research:"#aaaaff",flare:"#FF6B35",helios:"#FFE566",asteroid:"#998877",starcruiser:"#cc88ff",pirate:"#FF2060",barrier:BARRIER_C,base:BASE_C};
const SHIP_COLORS={seance:"#FF2060",twinrotor:"#FFB84D",snowstorm:"#00E5FF",epsilon:"#7EC8E3",voyager:"#FF8C42",orionmoth:"#80DD44",eclipsewarden:"#CC88FF",vectorace:"#FF6B6B",duskwing:"#CC3366",smuggler:"#C8A040",scarab:"#40C896",mantis:"#A0D040",beluga:"#6688BB",starpredator:"#FF2200",shell4:"#5577AA",theclaw:"#DD1133",stingray:"#00AAEE",edgecharger:"#FFAA11",tarrasque:"#882200"};
const HEX_SYMBOLS={small:"◉",medium:"◉",giant:"◉",medium_moon1:"◉",medium_moon2:"◉",ring:"◎",void:"○",settlement:"⏣",research:"⌖",flare:"☢",asteroid:"✸",helios:"⍟",starcruiser:"⯅",pirate:"☠",twinrotor:"⯅",snowstorm:"⯅",epsilon:"⯅",voyager:"⯅",orionmoth:"⯅",eclipsewarden:"⯅",barrier:"⬡",base:"⬡"};
const TYPE_LABELS={small:"Small Planet",medium:"Medium Planet",giant:"Giant Planet",medium_moon1:"Planet + Moon",medium_moon2:"Planet + 2 Moons",ring:"Ringed Planet",void:"Void Planet",settlement:"Settlement",research:"Research Station",asteroid:"Asteroid Sea",helios:"Helios Farm",flare:"Solar Flare",starcruiser:"Star Cruiser",pirate:"Pirate Hideout",seance:"THE INCONCEIVABLE",twinrotor:"Twinrotor Hauler",snowstorm:"Snowstorm Delta",epsilon:"Epsilon Interceptor",voyager:"A-1 Voyager",orionmoth:"Orion Moth",eclipsewarden:"Eclipse Warden",barrier:"Barrier Tile",base:"Faction Base"};
const HEX_FLAVOR={small:"A compact rocky world. Mineral traces detected.",medium:"Temperate conditions. Possible signs of past habitation.",giant:"Massive gas giant. Gravity well extends several hexes.",medium_moon1:"A planet with a natural satellite. Tidal forces active.",medium_moon2:"Twin-moon system. Navigational complexity.",ring:"A ringed world. The rings are navigable but unpredictable.",void:"Hollow resonance detected. Origin: unknown.",settlement:"Populated zone. Docking and resupply available.",research:"Active station. Encrypted transmissions detected.",asteroid:"Dense asteroid field. Rich in rare minerals.",helios:"Solar energy farm. Helios array fully operational.",flare:"Active solar flare zone. Hull integrity warning.",starcruiser:"Large vessel. Transponder signal: unregistered.",pirate:"Hostile signatures on all frequencies.",seance:"THE INCONCEIVABLE. Right where you left her.",barrier:"Impassable. Navigation locked out.",base:"Faction-controlled territory. Approach with caution."};

const DICE_COLORS={4:"#FF6B35",6:"#FFD166",8:"#00FFD0",10:"#FF6EC7",12:"#cc88ff",20:"#FF2060"};
const FACTIONS=[{id:"medusa",label:"MEDUSA",c:"#00FFD0"},{id:"isf",label:"ISF",c:"#aaaaff"},{id:"warg",label:"W.A.R.G.",c:"#FFD166"},{id:"corsair",label:"CORSAIR",c:"#FF2060"},{id:"synth",label:"SYNTH ARCH",c:"#cc88ff"}];
const mkW=()=>[{name:"",mod1:"",mod2:""},{name:"",mod1:"",mod2:""}];
const mkCrew=()=>({name:"",role:"",hp:10,vigor:0,grace:0,mind:0,tech:0,inventory:Array(4).fill(""),skills:Array(3).fill(""),passive:"",notes:""});
const mkC=()=>({hp:20,hpMax:20,en:20,enMax:20,armor:0,hyp:0,exp:0,serum:0,vigor:0,grace:0,mind:0,tech:0,origin:"",fav:{medusa:0,isf:0,warg:0,corsair:0,synth:0},weapons:mkW(),memory:Array(6).fill(""),inventory:Array(8).fill(""),cybertech:Array(6).fill("")});
const mkCole=()=>Object.assign(mkC(),{name:"Cole Remington Vayne",vigor:2,grace:3,mind:0,tech:1,weapons:[{name:"Laser Blaster",mod1:"Reflex Sight",mod2:""},{name:"",mod1:"",mod2:""}],inventory:["Health Pack ×2","Contraband Package ×2","","","","","",""]});
const mkVela=()=>Object.assign(mkC(),{name:"Vela // Séance",vigor:1,grace:2,mind:4,tech:3,memory:["Ladybug (cyberdefense drone)","HACK_Trojan — Breach the enemy for MIN turns","HACK_Javelin — d10+MIN damage; Breached enemies take ×2 damage","","",""],inventory:["Energy Cell ×2","Health Pack ×2","Starship Parts ×2","Stratogen Hormones ×2","","","",""]});
const mkS=()=>({name:"THE INCONCEIVABLE",hull:20,hullMax:20,fuel:20,fuelMax:20,scraps:0,control:"Vector Cockpit — Start combat with 1 Shield",engines:"Oxygen Jets — Roll 2d6; +1 die on first turn",modules:["G.R.E. Missiles — Deal 8 damage (5-6)","Particle Cannons — Deal 3 damage, stacks (3-5)","",""],cargo:Array(6).fill("")});
const INIT={session:0,logs:[],cole:mkCole(),vela:mkVela(),ship:mkS(),hexMap:{},crew:Array(4).fill(null).map(mkCrew),campaignMap:null,chapter:1,cyberSession:null};

const merge=function(sv){
 var ec=function(c,base){
  base=base||mkC();var src=c||{};
  var merged=Object.assign({},base,src,{fav:Object.assign({},base.fav,src.fav||{})});
  if(!src.weapons||src.weapons.every(function(w){return !w.name;}))merged.weapons=base.weapons;
  if(!src.inventory||src.inventory.every(function(v){return !v;}))merged.inventory=base.inventory;
  if(!src.memory||src.memory.every(function(v){return !v;}))merged.memory=base.memory;
  if(!src.cybertech||src.cybertech.every(function(v){return !v;}))merged.cybertech=base.cybertech;
  if(!src.vigor&&!src.grace&&!src.mind&&!src.tech){merged.vigor=base.vigor;merged.grace=base.grace;merged.mind=base.mind;merged.tech=base.tech;}
  return merged;
 };
 var es=function(s){var base=mkS();var src=s||{};return Object.assign({},base,src,{name:(src.name&&src.name!=="—")?src.name:base.name,control:src.control||base.control,engines:src.engines||base.engines,modules:(src.modules&&src.modules.some(function(m){return m;}))?src.modules:base.modules,cargo:src.cargo||Array(6).fill("")});};
 var rawCM=sv&&sv.campaignMap;var restoredCM=null;
 if(rawCM&&rawCM.id){var found=CAMPAIGN_MAPS.find(function(m){return m.id===rawCM.id;});if(found)restoredCM=found;}
 return Object.assign({},INIT,sv||{},{cole:ec(sv&&sv.cole,mkCole()),vela:ec(sv&&sv.vela,mkVela()),ship:es(sv&&sv.ship),hexMap:(sv&&sv.hexMap)||{},crew:(sv&&sv.crew)||Array(4).fill(null).map(mkCrew),campaignMap:restoredCM});
};

const HS=42,SQ3=Math.sqrt(3);
const SHIP_DATA={seance:{name:"THE INCONCEIVABLE",cls:"C",hull:20,act:2,color:"#FF2060",skill:"+2 damage vs ships in critical condition"},twinrotor:{name:"TWINROTOR HAULER",cls:"B",hull:20,act:3,color:"#FFB84D",skill:"Critical: +1 extra Action per turn"},snowstorm:{name:"SNOWSTORM DELTA",cls:"B",hull:20,act:2,color:"#00E5FF",skill:"Critical: gain 2 Shields"},epsilon:{name:"EPSILON INTERCEPTOR",cls:"B",hull:20,act:3,color:"#7EC8E3",skill:"Critical: enemy attacks deal -2 damage"},voyager:{name:"A-1 VOYAGER",cls:"A",hull:20,act:3,color:"#FF8C42",skill:"Restore 1 Hull when gaining a Shield"},orionmoth:{name:"ORION MOTH",cls:"B",hull:20,act:3,color:"#80DD44",skill:"First time reaching critical: gain 2 Shields"},eclipsewarden:{name:"ECLIPSE WARDEN",cls:"A",hull:20,act:4,color:"#CC88FF",skill:"Critical: +1 extra Action per turn"}};
const HD=[{q:1,r:0},{q:1,r:-1},{q:0,r:-1},{q:-1,r:0},{q:-1,r:1},{q:0,r:1}];
const h2p=function(q,r){return{x:HS*SQ3*(q+r/2),y:HS*1.5*r};};
const hPts=function(cx,cy,s){if(s==null)s=HS*.92;return Array.from({length:6},function(_,i){var a=Math.PI/3*i+Math.PI/6;return(cx+Math.cos(a)*s)+","+(cy+Math.sin(a)*s);}).join(" ");};
const HEXES=(function(){
 var h=[Object.assign({id:0,isStar:true},h2p(0,0))];var id=1;
 for(var k=1;k<=3;k++){var q=HD[4].q*k,r=HD[4].r*k;for(var s=0;s<6;s++)for(var i=0;i<k;i++){h.push(Object.assign({id:id,isStar:false,ring:k},h2p(q,r)));id++;q+=HD[s].q;r+=HD[s].r;}}
 return h;
})();

const PLANET_PALETTE=["#4488FF","#3BAADD","#FF6644","#FF4488","#44CC88","#A855F7","#FF9944","#44DDCC","#EE4466","#66AAFF","#FFCC44","#AA66FF","#55DD77","#FF77AA","#44BBEE"];
const MOON_PALETTE=["#aaaacc","#bbaadd","#ccbbaa","#aabbcc","#bbccaa"];
const getPlanetColor=function(hexId,offset){if(offset==null)offset=0;return PLANET_PALETTE[(hexId*7+offset*3)%PLANET_PALETTE.length];};
const getMoonColor=function(hexId){return MOON_PALETTE[hexId%MOON_PALETTE.length];};

const CB_NODE="#FF2060",CB_NORM="#00FFD0",CB_ACC="#c8d0ff";
const CYBER_MAPS=[
  ["N","X","A","X","N","X","A","X","N"],
  ["X","N","X","N","A","N","X","N","X"],
  ["N","X","A","N","X","N","A","X","N"],
  ["A","X","A","X","X","X","A","X","A"],
  ["X","N","X","N","A","N","X","A","X"],
  ["A","X","A","A","X","A","A","X","A"],
];
const CYBER_ADJ={1:[2,3],2:[1,4,5],3:[1,5,6],4:[2,7],5:[2,3,7,8],6:[3,8],7:[4,5,9],8:[5,6,9],9:[7,8]};


// ── TOAST ──────────────────────────────────────────────────────────────────
function Toast(props){
 return React.createElement("div",{style:{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",background:BG,border:"1px solid "+(props.color||"#00FFD0")+"88",borderRadius:6,padding:"8px 20px",fontFamily:MONO,fontSize:11,color:props.color||"#00FFD0",letterSpacing:2,zIndex:9999,animation:"toastIn .2s ease",pointerEvents:"none"}},props.msg);
}

// ── HEX ICONS (Batch 1 — animated, redesigned) ────────────────────────────
function HexIcon(props){
 var t=props.t,x=props.x,y=props.y,hexId=props.hexId||0,anim=props.anim!==false;
 if(props.ship2&&!props._p){return React.createElement("g",null,React.createElement("g",{transform:"translate("+(x-9)+","+(y-6)+") scale(0.76) translate(-"+x+",-"+y+")"},React.createElement(HexIcon,{t:t,x:x,y:y,anim:anim,_p:1})),React.createElement("g",{transform:"translate("+(x+9)+","+(y+6)+") scale(0.76) translate(-"+x+",-"+y+")"},React.createElement(HexIcon,{t:props.ship2,x:x,y:y,anim:false,_p:1})));}

 var pc=getPlanetColor(hexId),pc2=getPlanetColor(hexId,1),mc=getMoonColor(hexId),gid="pg"+hexId,sid="sh"+hexId;
 if(t==="barrier"){
  return React.createElement("g",null,
   React.createElement("polygon",{points:hPts(x,y,HS*.85),fill:BARRIER_C+"18",stroke:BARRIER_C,strokeWidth:2.5,strokeDasharray:"6 3"}),
   React.createElement("text",{x:x,y:y+5,textAnchor:"middle",fontSize:14,fontFamily:"monospace",fill:BARRIER_C,opacity:.9},"✕")
  );
 }
 if(t==="base"){
  return React.createElement("g",{filter:"drop-shadow(0 0 8px "+BASE_C+")"},
   React.createElement("polygon",{points:hPts(x,y,HS*.75),fill:BASE_C+"33",stroke:BASE_C,strokeWidth:2}),
   React.createElement("text",{x:x,y:y+5,textAnchor:"middle",fontSize:15,fontFamily:"monospace",fill:BASE_C},"⬡")
  );
 }
 if(t==="seance") return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 6px #FF206099)"},
 React.createElement("polygon",{points:"0,-15 -2.5,10 2.5,10",fill:"#FF2060",opacity:.9}),
 React.createElement("polygon",{points:"0,-10 -17,9 -3,9",fill:"#FF2060",opacity:.86}),
 React.createElement("polygon",{points:"0,-10 17,9 3,9",fill:"#FF2060",opacity:.86}),
 React.createElement("ellipse",{cx:0,cy:-7,rx:1.8,ry:3.5,fill:"#ff9090",opacity:.7}),
 React.createElement("rect",{x:-5,y:7,width:4,height:5,rx:1.5,fill:"#FF2060",opacity:.9}),
 React.createElement("rect",{x:1,y:7,width:4,height:5,rx:1.5,fill:"#FF2060",opacity:.9})
);
if(t==="twinrotor"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("ellipse",{cx:0,cy:-2,rx:5,ry:11,fill:sc,opacity:.9}),React.createElement("rect",{x:-14,y:-5,width:28,height:2,rx:1,fill:sc,opacity:.75}),React.createElement("circle",{cx:-14,cy:-4,r:4,fill:"none",stroke:sc,strokeWidth:1.5}),React.createElement("circle",{cx:14,cy:-4,r:4,fill:"none",stroke:sc,strokeWidth:1.5}),React.createElement("path",{d:"M-6,7 Q0,13 6,7",fill:sc,opacity:.85,stroke:sc,strokeWidth:1}),React.createElement("rect",{x:-4,y:-14,width:2,height:4,fill:sc}),React.createElement("rect",{x:2,y:-14,width:2,height:4,fill:sc}));}
if(t==="snowstorm"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("polygon",{points:"0,-15 -13,8 -7,3 7,3 13,8",fill:sc,opacity:.9}),React.createElement("polygon",{points:"0,-15 -2,2 2,2",fill:"#ffffff",opacity:.2}),React.createElement("ellipse",{cx:-8,cy:4,rx:2,ry:3,fill:"#0a0a14",opacity:.7}),React.createElement("ellipse",{cx:8,cy:4,rx:2,ry:3,fill:"#0a0a14",opacity:.7}));}
if(t==="epsilon"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("rect",{x:-2,y:-15,width:4,height:30,rx:1,fill:sc,opacity:.9}),React.createElement("rect",{x:-14,y:-4,width:28,height:5,rx:1,fill:sc,opacity:.85}),React.createElement("rect",{x:-4,y:-15,width:8,height:9,rx:1,fill:sc}),React.createElement("polygon",{points:"-14,-1 -19,-1 -16,2",fill:sc,opacity:.7}),React.createElement("polygon",{points:"14,-1 19,-1 16,2",fill:sc,opacity:.7}),React.createElement("rect",{x:-1,y:10,width:2,height:5,fill:sc,opacity:.7}));}
if(t==="voyager"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("rect",{x:-15,y:-7,width:30,height:5,rx:1,fill:sc,opacity:.85}),React.createElement("ellipse",{cx:-15,cy:-4,rx:3,ry:6,fill:sc,opacity:.9}),React.createElement("ellipse",{cx:15,cy:-4,rx:3,ry:6,fill:sc,opacity:.9}),React.createElement("rect",{x:-6,y:-13,width:12,height:8,rx:1,fill:sc}),React.createElement("rect",{x:-2,y:-2,width:4,height:13,rx:1,fill:sc,opacity:.8}),React.createElement("rect",{x:-5,y:9,width:2,height:1,fill:sc,opacity:.5}),React.createElement("rect",{x:3,y:9,width:2,height:1,fill:sc,opacity:.5}));}
if(t==="orionmoth"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("ellipse",{cx:0,cy:1,rx:13,ry:9,fill:sc,opacity:.9}),React.createElement("circle",{cx:0,cy:1,r:4,fill:"#0a0a14",opacity:.65}),React.createElement("path",{d:"M-6,8 Q0,14 6,8",fill:sc,opacity:.85,stroke:sc,strokeWidth:1.5}),React.createElement("polygon",{points:"-5,-8 -9,-13 -3,-9",fill:sc}),React.createElement("polygon",{points:"5,-8 9,-13 3,-9",fill:sc}));}
if(t==="eclipsewarden"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("rect",{x:-1,y:-18,width:2,height:13,fill:sc}),React.createElement("circle",{cx:0,cy:-3,r:5,fill:sc,opacity:.95}),React.createElement("path",{d:"M-3,-14 A12,14 0 0,0 -3,10",fill:"none",stroke:sc,strokeWidth:2.5}),React.createElement("path",{d:"M3,-14 A12,14 0 0,1 3,10",fill:"none",stroke:sc,strokeWidth:2.5}),React.createElement("line",{x1:-4,y1:8,x2:-7,y2:13,stroke:sc,strokeWidth:1.5}),React.createElement("line",{x1:4,y1:8,x2:7,y2:13,stroke:sc,strokeWidth:1.5}),React.createElement("line",{x1:-2,y1:10,x2:-4,y2:15,stroke:sc,strokeWidth:1}),React.createElement("line",{x1:2,y1:10,x2:4,y2:15,stroke:sc,strokeWidth:1}));}
if(t==="vectorace"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("polygon",{points:"0,-14 -3,8 3,8",fill:sc,opacity:.9}),React.createElement("ellipse",{cx:-7,cy:2,rx:2.5,ry:8,fill:sc,opacity:.8}),React.createElement("ellipse",{cx:7,cy:2,rx:2.5,ry:8,fill:sc,opacity:.8}),React.createElement("polygon",{points:"-4,-5 -7,-10 -4,0",fill:sc}),React.createElement("polygon",{points:"4,-5 7,-10 4,0",fill:sc}));}
if(t==="smuggler"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("polygon",{points:"-13,-12 -8,-12 -8,9 -11,13 -13,8",fill:sc,opacity:.9}),React.createElement("polygon",{points:"8,-12 13,-12 13,8 11,13 8,9",fill:sc,opacity:.9}),React.createElement("rect",{x:-8,y:-5,width:16,height:4,rx:1,fill:sc,opacity:.8}));}
if(t==="duskwing"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("polygon",{points:"0,-14 -2,6 2,6",fill:sc,opacity:.95}),React.createElement("polygon",{points:"-2,-2 -13,10 -10,10 -8,6 -5,8 -2,4",fill:sc,opacity:.9}),React.createElement("polygon",{points:"2,-2 13,10 10,10 8,6 5,8 2,4",fill:sc,opacity:.9}),React.createElement("line",{x1:-13,y1:10,x2:-13,y2:7,stroke:sc,strokeWidth:1.5}),React.createElement("line",{x1:13,y1:10,x2:13,y2:7,stroke:sc,strokeWidth:1.5}));}
if(t==="scarab"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("ellipse",{cx:-9,cy:0,rx:5,ry:12,fill:sc,opacity:.6}),React.createElement("ellipse",{cx:9,cy:0,rx:5,ry:12,fill:sc,opacity:.6}),React.createElement("ellipse",{cx:0,cy:0,rx:5,ry:8,fill:sc,opacity:.95}),React.createElement("circle",{cx:0,cy:0,r:2,fill:"#0a0a14",opacity:.55}));}
if(t==="mantis"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("polygon",{points:"0,-15 -1,-5 1,-5",fill:sc}),React.createElement("polygon",{points:"-3,-13 -5,-5 -1,-6",fill:sc,opacity:.9}),React.createElement("polygon",{points:"3,-13 5,-5 1,-6",fill:sc,opacity:.9}),React.createElement("polygon",{points:"-7,-10 -10,-4 -3,-6",fill:sc,opacity:.8}),React.createElement("polygon",{points:"7,-10 10,-4 3,-6",fill:sc,opacity:.8}),React.createElement("rect",{x:-3,y:-5,width:6,height:12,rx:1,fill:sc,opacity:.9}),React.createElement("rect",{x:-6,y:-2,width:3,height:8,rx:1,fill:sc,opacity:.75}),React.createElement("rect",{x:3,y:-2,width:3,height:8,rx:1,fill:sc,opacity:.75}),React.createElement("polygon",{points:"0,7 -2,14 2,14",fill:sc}));}
if(t==="beluga"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("rect",{x:-9,y:-15,width:18,height:8,rx:2,fill:sc}),React.createElement("rect",{x:-8,y:-7,width:3,height:2,fill:sc,opacity:.6}),React.createElement("rect",{x:5,y:-7,width:3,height:2,fill:sc,opacity:.6}),React.createElement("rect",{x:-4,y:-7,width:8,height:18,fill:sc,opacity:.85}),React.createElement("rect",{x:-6,y:-4,width:2,height:12,fill:sc,opacity:.4}),React.createElement("rect",{x:4,y:-4,width:2,height:12,fill:sc,opacity:.4}),React.createElement("polygon",{points:"-5,11 -7,16 0,18 7,16 5,11",fill:sc,opacity:.9}));}
if(t==="starpredator"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("polygon",{points:"0,-16 -2,4 2,4",fill:sc}),React.createElement("rect",{x:-3,y:-4,width:6,height:16,rx:1,fill:sc,opacity:.9}),React.createElement("polygon",{points:"-2,-2 -15,8 -12,13 -2,5",fill:sc,opacity:.85}),React.createElement("polygon",{points:"2,-2 15,8 12,13 2,5",fill:sc,opacity:.85}),React.createElement("ellipse",{cx:-14,cy:9,rx:2.5,ry:4,fill:sc}),React.createElement("ellipse",{cx:14,cy:9,rx:2.5,ry:4,fill:sc}));}
if(t==="shell4"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("ellipse",{cx:0,cy:-5,rx:8,ry:10,fill:sc,opacity:.9}),React.createElement("rect",{x:-16,y:-9,width:9,height:18,rx:2,fill:sc,opacity:.8}),React.createElement("rect",{x:7,y:-9,width:9,height:18,rx:2,fill:sc,opacity:.8}),React.createElement("rect",{x:-16,y:5,width:4,height:3,fill:sc}),React.createElement("rect",{x:12,y:5,width:4,height:3,fill:sc}),React.createElement("rect",{x:-13,y:-7,width:3,height:2,fill:"#0a0a14",opacity:.5}),React.createElement("rect",{x:10,y:-7,width:3,height:2,fill:"#0a0a14",opacity:.5}));}
if(t==="theclaw"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("rect",{x:-2,y:-15,width:5,height:30,rx:1,fill:sc,opacity:.9}),React.createElement("polygon",{points:"-2,-8 -14,-5 -17,1 -10,4 -2,1",fill:sc,opacity:.85}),React.createElement("polygon",{points:"-14,-5 -19,-1 -17,1",fill:sc}),React.createElement("rect",{x:3,y:-10,width:7,height:3,fill:sc,opacity:.6}),React.createElement("rect",{x:3,y:-5,width:9,height:2,fill:sc,opacity:.5}),React.createElement("rect",{x:3,y:0,width:7,height:3,fill:sc,opacity:.6}),React.createElement("rect",{x:3,y:5,width:5,height:2,fill:sc,opacity:.4}));}
if(t==="stingray"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("polygon",{points:"0,-7 -17,6 -10,11 0,4 10,11 17,6",fill:sc,opacity:.9}),React.createElement("rect",{x:-3,y:-7,width:6,height:9,rx:1,fill:sc}),React.createElement("rect",{x:-2,y:4,width:4,height:8,rx:1,fill:sc,opacity:.7}));}
if(t==="edgecharger"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("rect",{x:-6,y:-12,width:12,height:6,rx:1,fill:sc}),React.createElement("rect",{x:-18,y:-4,width:36,height:6,rx:1,fill:sc,opacity:.85}),React.createElement("rect",{x:-5,y:-8,width:10,height:10,rx:1,fill:sc,opacity:.7}),React.createElement("rect",{x:-19,y:-2,width:4,height:8,rx:1,fill:sc,opacity:.85}),React.createElement("rect",{x:15,y:-2,width:4,height:8,rx:1,fill:sc,opacity:.85}));}
if(t==="tarrasque"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 7px "+sc+"99)"},React.createElement("polygon",{points:"0,-10 -9,-5 -9,5 0,10 9,5 9,-5",fill:sc,opacity:.9}),React.createElement("polygon",{points:"0,-7 -6,-3.5 -6,3.5 0,7 6,3.5 6,-3.5",fill:"#0a0a14",opacity:.35}),React.createElement("line",{x1:0,y1:-10,x2:0,y2:-18,stroke:sc,strokeWidth:3.5}),React.createElement("ellipse",{cx:0,cy:-18,rx:3.5,ry:2.5,fill:sc}),React.createElement("line",{x1:-9,y1:-5,x2:-16,y2:-10,stroke:sc,strokeWidth:3.5}),React.createElement("ellipse",{cx:-16,cy:-10,rx:3.5,ry:2.5,fill:sc}),React.createElement("line",{x1:-9,y1:5,x2:-16,y2:10,stroke:sc,strokeWidth:3.5}),React.createElement("ellipse",{cx:-16,cy:10,rx:3.5,ry:2.5,fill:sc}),React.createElement("line",{x1:9,y1:-5,x2:16,y2:-10,stroke:sc,strokeWidth:3.5}),React.createElement("ellipse",{cx:16,cy:-10,rx:3.5,ry:2.5,fill:sc}),React.createElement("line",{x1:9,y1:5,x2:16,y2:10,stroke:sc,strokeWidth:3.5}),React.createElement("ellipse",{cx:16,cy:10,rx:3.5,ry:2.5,fill:sc}));}
if(t==="twinrotor"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("ellipse",{cx:0,cy:-2,rx:5,ry:11,fill:sc,opacity:.9}),React.createElement("rect",{x:-14,y:-5,width:28,height:2,rx:1,fill:sc,opacity:.75}),React.createElement("circle",{cx:-14,cy:-4,r:4,fill:"none",stroke:sc,strokeWidth:1.5}),React.createElement("circle",{cx:14,cy:-4,r:4,fill:"none",stroke:sc,strokeWidth:1.5}),React.createElement("path",{d:"M-6,7 Q0,13 6,7",fill:sc,opacity:.85,stroke:sc,strokeWidth:1}),React.createElement("rect",{x:-4,y:-14,width:2,height:4,fill:sc}),React.createElement("rect",{x:2,y:-14,width:2,height:4,fill:sc}));}
if(t==="snowstorm"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("polygon",{points:"0,-15 -13,8 -7,3 7,3 13,8",fill:sc,opacity:.9}),React.createElement("polygon",{points:"0,-15 -2,2 2,2",fill:"#ffffff",opacity:.2}),React.createElement("ellipse",{cx:-8,cy:4,rx:2,ry:3,fill:"#0a0a14",opacity:.7}),React.createElement("ellipse",{cx:8,cy:4,rx:2,ry:3,fill:"#0a0a14",opacity:.7}));}
if(t==="epsilon"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("rect",{x:-2,y:-15,width:4,height:30,rx:1,fill:sc,opacity:.9}),React.createElement("rect",{x:-14,y:-4,width:28,height:5,rx:1,fill:sc,opacity:.85}),React.createElement("rect",{x:-4,y:-15,width:8,height:9,rx:1,fill:sc}),React.createElement("polygon",{points:"-14,-1 -19,-1 -16,2",fill:sc,opacity:.7}),React.createElement("polygon",{points:"14,-1 19,-1 16,2",fill:sc,opacity:.7}),React.createElement("rect",{x:-1,y:10,width:2,height:5,fill:sc,opacity:.7}));}
if(t==="voyager"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("rect",{x:-15,y:-7,width:30,height:5,rx:1,fill:sc,opacity:.85}),React.createElement("ellipse",{cx:-15,cy:-4,rx:3,ry:6,fill:sc,opacity:.9}),React.createElement("ellipse",{cx:15,cy:-4,rx:3,ry:6,fill:sc,opacity:.9}),React.createElement("rect",{x:-6,y:-13,width:12,height:8,rx:1,fill:sc}),React.createElement("rect",{x:-2,y:-2,width:4,height:13,rx:1,fill:sc,opacity:.8}),React.createElement("rect",{x:-5,y:9,width:2,height:1,fill:sc,opacity:.5}),React.createElement("rect",{x:3,y:9,width:2,height:1,fill:sc,opacity:.5}));}
if(t==="orionmoth"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("ellipse",{cx:0,cy:1,rx:13,ry:9,fill:sc,opacity:.9}),React.createElement("circle",{cx:0,cy:1,r:4,fill:"#0a0a14",opacity:.65}),React.createElement("path",{d:"M-6,8 Q0,14 6,8",fill:sc,opacity:.85,stroke:sc,strokeWidth:1.5}),React.createElement("polygon",{points:"-5,-8 -9,-13 -3,-9",fill:sc}),React.createElement("polygon",{points:"5,-8 9,-13 3,-9",fill:sc}));}
if(t==="eclipsewarden"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("rect",{x:-1,y:-18,width:2,height:13,fill:sc}),React.createElement("circle",{cx:0,cy:-3,r:5,fill:sc,opacity:.95}),React.createElement("path",{d:"M-3,-14 A12,14 0 0,0 -3,10",fill:"none",stroke:sc,strokeWidth:2.5}),React.createElement("path",{d:"M3,-14 A12,14 0 0,1 3,10",fill:"none",stroke:sc,strokeWidth:2.5}),React.createElement("line",{x1:-4,y1:8,x2:-7,y2:13,stroke:sc,strokeWidth:1.5}),React.createElement("line",{x1:4,y1:8,x2:7,y2:13,stroke:sc,strokeWidth:1.5}),React.createElement("line",{x1:-2,y1:10,x2:-4,y2:15,stroke:sc,strokeWidth:1}),React.createElement("line",{x1:2,y1:10,x2:4,y2:15,stroke:sc,strokeWidth:1}));}
if(t==="vectorace"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("polygon",{points:"0,-14 -3,8 3,8",fill:sc,opacity:.9}),React.createElement("ellipse",{cx:-7,cy:2,rx:2.5,ry:8,fill:sc,opacity:.8}),React.createElement("ellipse",{cx:7,cy:2,rx:2.5,ry:8,fill:sc,opacity:.8}),React.createElement("polygon",{points:"-4,-5 -7,-10 -4,0",fill:sc}),React.createElement("polygon",{points:"4,-5 7,-10 4,0",fill:sc}));}
if(t==="smuggler"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("polygon",{points:"-13,-12 -8,-12 -8,9 -11,13 -13,8",fill:sc,opacity:.9}),React.createElement("polygon",{points:"8,-12 13,-12 13,8 11,13 8,9",fill:sc,opacity:.9}),React.createElement("rect",{x:-8,y:-5,width:16,height:4,rx:1,fill:sc,opacity:.8}));}
if(t==="duskwing"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("polygon",{points:"0,-14 -2,6 2,6",fill:sc,opacity:.95}),React.createElement("polygon",{points:"-2,-2 -13,10 -10,10 -8,6 -5,8 -2,4",fill:sc,opacity:.9}),React.createElement("polygon",{points:"2,-2 13,10 10,10 8,6 5,8 2,4",fill:sc,opacity:.9}),React.createElement("line",{x1:-13,y1:10,x2:-13,y2:7,stroke:sc,strokeWidth:1.5}),React.createElement("line",{x1:13,y1:10,x2:13,y2:7,stroke:sc,strokeWidth:1.5}));}
if(t==="scarab"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("ellipse",{cx:-9,cy:0,rx:5,ry:12,fill:sc,opacity:.6}),React.createElement("ellipse",{cx:9,cy:0,rx:5,ry:12,fill:sc,opacity:.6}),React.createElement("ellipse",{cx:0,cy:0,rx:5,ry:8,fill:sc,opacity:.95}),React.createElement("circle",{cx:0,cy:0,r:2,fill:"#0a0a14",opacity:.55}));}
if(t==="mantis"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("polygon",{points:"0,-15 -1,-5 1,-5",fill:sc}),React.createElement("polygon",{points:"-3,-13 -5,-5 -1,-6",fill:sc,opacity:.9}),React.createElement("polygon",{points:"3,-13 5,-5 1,-6",fill:sc,opacity:.9}),React.createElement("polygon",{points:"-7,-10 -10,-4 -3,-6",fill:sc,opacity:.8}),React.createElement("polygon",{points:"7,-10 10,-4 3,-6",fill:sc,opacity:.8}),React.createElement("rect",{x:-3,y:-5,width:6,height:12,rx:1,fill:sc,opacity:.9}),React.createElement("rect",{x:-6,y:-2,width:3,height:8,rx:1,fill:sc,opacity:.75}),React.createElement("rect",{x:3,y:-2,width:3,height:8,rx:1,fill:sc,opacity:.75}),React.createElement("polygon",{points:"0,7 -2,14 2,14",fill:sc}));}
if(t==="beluga"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("rect",{x:-9,y:-15,width:18,height:8,rx:2,fill:sc}),React.createElement("rect",{x:-8,y:-7,width:3,height:2,fill:sc,opacity:.6}),React.createElement("rect",{x:5,y:-7,width:3,height:2,fill:sc,opacity:.6}),React.createElement("rect",{x:-4,y:-7,width:8,height:18,fill:sc,opacity:.85}),React.createElement("rect",{x:-6,y:-4,width:2,height:12,fill:sc,opacity:.4}),React.createElement("rect",{x:4,y:-4,width:2,height:12,fill:sc,opacity:.4}),React.createElement("polygon",{points:"-5,11 -7,16 0,18 7,16 5,11",fill:sc,opacity:.9}));}
if(t==="starpredator"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("polygon",{points:"0,-16 -2,4 2,4",fill:sc}),React.createElement("rect",{x:-3,y:-4,width:6,height:16,rx:1,fill:sc,opacity:.9}),React.createElement("polygon",{points:"-2,-2 -15,8 -12,13 -2,5",fill:sc,opacity:.85}),React.createElement("polygon",{points:"2,-2 15,8 12,13 2,5",fill:sc,opacity:.85}),React.createElement("ellipse",{cx:-14,cy:9,rx:2.5,ry:4,fill:sc}),React.createElement("ellipse",{cx:14,cy:9,rx:2.5,ry:4,fill:sc}));}
if(t==="shell4"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("ellipse",{cx:0,cy:-5,rx:8,ry:10,fill:sc,opacity:.9}),React.createElement("rect",{x:-16,y:-9,width:9,height:18,rx:2,fill:sc,opacity:.8}),React.createElement("rect",{x:7,y:-9,width:9,height:18,rx:2,fill:sc,opacity:.8}),React.createElement("rect",{x:-16,y:5,width:4,height:3,fill:sc}),React.createElement("rect",{x:12,y:5,width:4,height:3,fill:sc}),React.createElement("rect",{x:-13,y:-7,width:3,height:2,fill:"#0a0a14",opacity:.5}),React.createElement("rect",{x:10,y:-7,width:3,height:2,fill:"#0a0a14",opacity:.5}));}
if(t==="theclaw"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("rect",{x:-2,y:-15,width:5,height:30,rx:1,fill:sc,opacity:.9}),React.createElement("polygon",{points:"-2,-8 -14,-5 -17,1 -10,4 -2,1",fill:sc,opacity:.85}),React.createElement("polygon",{points:"-14,-5 -19,-1 -17,1",fill:sc}),React.createElement("rect",{x:3,y:-10,width:7,height:3,fill:sc,opacity:.6}),React.createElement("rect",{x:3,y:-5,width:9,height:2,fill:sc,opacity:.5}),React.createElement("rect",{x:3,y:0,width:7,height:3,fill:sc,opacity:.6}),React.createElement("rect",{x:3,y:5,width:5,height:2,fill:sc,opacity:.4}));}
if(t==="stingray"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("polygon",{points:"0,-7 -17,6 -10,11 0,4 10,11 17,6",fill:sc,opacity:.9}),React.createElement("rect",{x:-3,y:-7,width:6,height:9,rx:1,fill:sc}),React.createElement("rect",{x:-2,y:4,width:4,height:8,rx:1,fill:sc,opacity:.7}));}
if(t==="edgecharger"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 5px "+sc+"88)"},React.createElement("rect",{x:-6,y:-12,width:12,height:6,rx:1,fill:sc}),React.createElement("rect",{x:-18,y:-4,width:36,height:6,rx:1,fill:sc,opacity:.85}),React.createElement("rect",{x:-5,y:-8,width:10,height:10,rx:1,fill:sc,opacity:.7}),React.createElement("rect",{x:-19,y:-2,width:4,height:8,rx:1,fill:sc,opacity:.85}),React.createElement("rect",{x:15,y:-2,width:4,height:8,rx:1,fill:sc,opacity:.85}));}
if(t==="tarrasque"){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 7px "+sc+"99)"},React.createElement("polygon",{points:"0,-10 -9,-5 -9,5 0,10 9,5 9,-5",fill:sc,opacity:.9}),React.createElement("polygon",{points:"0,-7 -6,-3.5 -6,3.5 0,7 6,3.5 6,-3.5",fill:"#0a0a14",opacity:.35}),React.createElement("line",{x1:0,y1:-10,x2:0,y2:-18,stroke:sc,strokeWidth:3.5}),React.createElement("ellipse",{cx:0,cy:-18,rx:3.5,ry:2.5,fill:sc}),React.createElement("line",{x1:-9,y1:-5,x2:-16,y2:-10,stroke:sc,strokeWidth:3.5}),React.createElement("ellipse",{cx:-16,cy:-10,rx:3.5,ry:2.5,fill:sc}),React.createElement("line",{x1:-9,y1:5,x2:-16,y2:10,stroke:sc,strokeWidth:3.5}),React.createElement("ellipse",{cx:-16,cy:10,rx:3.5,ry:2.5,fill:sc}),React.createElement("line",{x1:9,y1:-5,x2:16,y2:-10,stroke:sc,strokeWidth:3.5}),React.createElement("ellipse",{cx:16,cy:-10,rx:3.5,ry:2.5,fill:sc}),React.createElement("line",{x1:9,y1:5,x2:16,y2:10,stroke:sc,strokeWidth:3.5}),React.createElement("ellipse",{cx:16,cy:10,rx:3.5,ry:2.5,fill:sc}));}
if(SHIP_COLORS[t]){var sc=SHIP_COLORS[t];return React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"shipPulse 2.5s ease-in-out infinite":"none"},filter:"drop-shadow(0 0 4px "+sc+"99)"},React.createElement("polygon",{points:"0,-12 -8,8 8,8",fill:sc,opacity:.88}),React.createElement("rect",{x:-9,y:6,width:4,height:5,rx:1,fill:sc,opacity:.8}),React.createElement("rect",{x:5,y:6,width:4,height:5,rx:1,fill:sc,opacity:.8}));}
 // Planets with shimmer overlay
 if(t==="small") return React.createElement("g",null,
  React.createElement("defs",null,
   React.createElement("radialGradient",{id:gid,cx:"35%",cy:"35%"},React.createElement("stop",{offset:"0%",stopColor:"#ffffff",stopOpacity:".4"}),React.createElement("stop",{offset:"100%",stopColor:pc})),
   React.createElement("radialGradient",{id:sid,cx:"60%",cy:"40%"},React.createElement("stop",{offset:"0%",stopColor:"#ffffff",stopOpacity:".3"}),React.createElement("stop",{offset:"100%",stopColor:"#ffffff",stopOpacity:"0"}))
  ),
  React.createElement("circle",{cx:x,cy:y,r:7,fill:"url(#"+gid+")",filter:"drop-shadow(0 0 4px "+pc+"88)"}),
  React.createElement("ellipse",{cx:x+1,cy:y-1,rx:4,ry:3,fill:"url(#"+sid+")",style:{animation:anim?"shimmer 3s ease-in-out infinite":"none"}})
 );
 if(t==="medium") return React.createElement("g",null,
  React.createElement("defs",null,
   React.createElement("radialGradient",{id:gid,cx:"35%",cy:"35%"},React.createElement("stop",{offset:"0%",stopColor:"#ffffff",stopOpacity:".35"}),React.createElement("stop",{offset:"100%",stopColor:pc})),
   React.createElement("radialGradient",{id:sid,cx:"60%",cy:"40%"},React.createElement("stop",{offset:"0%",stopColor:"#ffffff",stopOpacity:".25"}),React.createElement("stop",{offset:"100%",stopColor:"#ffffff",stopOpacity:"0"}))
  ),
  React.createElement("circle",{cx:x,cy:y,r:12,fill:"url(#"+gid+")",filter:"drop-shadow(0 0 6px "+pc+"88)"}),
  React.createElement("ellipse",{cx:x+2,cy:y-2,rx:7,ry:5,fill:"url(#"+sid+")",style:{animation:anim?"shimmer 3.5s ease-in-out infinite":"none"}})
 );
 if(t==="giant") return React.createElement("g",null,
  React.createElement("defs",null,
   React.createElement("radialGradient",{id:gid,cx:"35%",cy:"35%"},React.createElement("stop",{offset:"0%",stopColor:"#ffffff",stopOpacity:".3"}),React.createElement("stop",{offset:"100%",stopColor:pc})),
   React.createElement("radialGradient",{id:sid,cx:"60%",cy:"40%"},React.createElement("stop",{offset:"0%",stopColor:"#ffffff",stopOpacity:".2"}),React.createElement("stop",{offset:"100%",stopColor:"#ffffff",stopOpacity:"0"}))
  ),
  React.createElement("circle",{cx:x,cy:y,r:18,fill:"url(#"+gid+")",filter:"drop-shadow(0 0 8px "+pc+"99)"}),
  React.createElement("ellipse",{cx:x+3,cy:y-3,rx:10,ry:7,fill:"url(#"+sid+")",style:{animation:anim?"shimmer 4s ease-in-out infinite":"none"}})
 );
 if(t==="void") return React.createElement("g",null,
  React.createElement("defs",null,React.createElement("radialGradient",{id:gid,cx:"50%",cy:"50%"},React.createElement("stop",{offset:"0%",stopColor:pc,stopOpacity:".15"}),React.createElement("stop",{offset:"100%",stopColor:pc,stopOpacity:"0"}))),
  React.createElement("circle",{cx:x,cy:y,r:12,fill:"url(#"+gid+")",stroke:pc,strokeWidth:1.5,style:{animation:anim?"shimmer 2s ease-in-out infinite":"none"}})
 );
 if(t==="ring") return React.createElement("g",null,
  React.createElement("defs",null,
   React.createElement("radialGradient",{id:gid,cx:"35%",cy:"35%"},React.createElement("stop",{offset:"0%",stopColor:"#ffffff",stopOpacity:".3"}),React.createElement("stop",{offset:"100%",stopColor:pc})),
   React.createElement("radialGradient",{id:sid,cx:"60%",cy:"40%"},React.createElement("stop",{offset:"0%",stopColor:"#ffffff",stopOpacity:".2"}),React.createElement("stop",{offset:"100%",stopColor:"#ffffff",stopOpacity:"0"}))
  ),
  React.createElement("circle",{cx:x,cy:y,r:9,fill:"url(#"+gid+")",filter:"drop-shadow(0 0 6px "+pc+"99)"}),
  React.createElement("circle",{cx:x,cy:y,r:14,fill:"none",stroke:pc2,strokeWidth:1.5,opacity:.75}),
  React.createElement("circle",{cx:x,cy:y,r:20,fill:"none",stroke:pc2,strokeWidth:1,opacity:.4}),
  React.createElement("ellipse",{cx:x+2,cy:y-2,rx:5,ry:4,fill:"url(#"+sid+")",style:{animation:anim?"shimmer 3s ease-in-out infinite":"none"}})
 );
 if(t==="medium_moon1") return React.createElement("g",null,
  React.createElement("defs",null,React.createElement("radialGradient",{id:gid,cx:"35%",cy:"35%"},React.createElement("stop",{offset:"0%",stopColor:"#ffffff",stopOpacity:".35"}),React.createElement("stop",{offset:"100%",stopColor:pc}))),
  React.createElement("circle",{cx:x,cy:y,r:10,fill:"url(#"+gid+")"}),
  React.createElement("circle",{cx:x,cy:y,r:19,fill:"none",stroke:pc,strokeWidth:1,opacity:.3}),
  React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"moonOrbit 8s linear infinite":"none",transformOrigin:"0px 0px"}},
   React.createElement("circle",{cx:19,cy:0,r:4,fill:mc,opacity:.9})
  )
 );
 if(t==="medium_moon2") return React.createElement("g",null,
  React.createElement("defs",null,React.createElement("radialGradient",{id:gid+"b",cx:"35%",cy:"35%"},React.createElement("stop",{offset:"0%",stopColor:"#ffffff",stopOpacity:".35"}),React.createElement("stop",{offset:"100%",stopColor:pc}))),
  React.createElement("circle",{cx:x,cy:y,r:10,fill:"url(#"+gid+"b)"}),
  React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"moonOrbit 7s linear infinite":"none",transformOrigin:"0px 0px"}},
   React.createElement("circle",{cx:19,cy:0,r:4,fill:mc,opacity:.9})
  ),
  React.createElement("g",{transform:"translate("+x+","+y+")",style:{animation:anim?"moonOrbit 12s linear infinite reverse":"none",transformOrigin:"0px 0px"}},
   React.createElement("circle",{cx:-16,cy:0,r:3,fill:getMoonColor(hexId+3),opacity:.85})
  )
 );
 // —— OFFICIAL ASTROPRIME ICONS (injected Mar 16 2026) —————————————
  if(t==="asteroid"){return React.createElement("g",{transform:"translate("+x+","+y+") scale(0.1) translate(-250,-250)",filter:"drop-shadow(0 0 4px "+IC.asteroid+"99)"},React.createElement("circle",{cx:"290.56",cy:"264.6",r:"24.71",fill:IC.asteroid}),React.createElement("circle",{cx:"301.75",cy:"145.48",r:"17.22",fill:IC.asteroid}),React.createElement("circle",{cx:"220.28",cy:"207.25",r:"12.98",fill:IC.asteroid}),React.createElement("circle",{cx:"155.42",cy:"274.28",r:"15.03",fill:IC.asteroid}),React.createElement("circle",{cx:"251.37",cy:"137.94",r:"9.68",fill:IC.asteroid}),React.createElement("circle",{cx:"162.17",cy:"203.95",r:"9.68",fill:IC.asteroid}),React.createElement("circle",{cx:"185.73",cy:"321.71",r:"9.68",fill:IC.asteroid}),React.createElement("circle",{cx:"333.03",cy:"188.91",r:"9.68",fill:IC.asteroid}),React.createElement("circle",{cx:"376.47",cy:"266.9",r:"9.68",fill:IC.asteroid}),React.createElement("circle",{cx:"257.74",cy:"351.25",r:"8.64",fill:IC.asteroid}),React.createElement("circle",{cx:"323.91",cy:"375.77",r:"6.11",fill:IC.asteroid}),React.createElement("circle",{cx:"219.47",cy:"257.22",r:"6.09",fill:IC.asteroid}),React.createElement("circle",{cx:"274.3",cy:"312.03",r:"4.71",fill:IC.asteroid}));}
  if(t==="helios"){return React.createElement("g",{transform:"translate("+x+","+y+") scale(0.11) translate(-250,-250)",filter:"drop-shadow(0 0 4px "+IC.helios+"99)"},React.createElement("polygon",{points:"294.88 226.19 277.28 223.55 270.54 240.03 288.15 242.67 294.88 226.19",fill:IC.helios}),React.createElement("polygon",{points:"324.76 209.21 307.15 206.56 300.41 223.05 318.02 225.69 324.76 209.21",fill:IC.helios}),React.createElement("polygon",{points:"354.63 192.22 337.02 189.58 330.29 206.06 347.9 208.7 354.63 192.22",fill:IC.helios}),React.createElement("polygon",{points:"332.75 188.52 315.14 185.87 308.41 202.36 326.02 205 332.75 188.52",fill:IC.helios}),React.createElement("polygon",{points:"302.88 205.5 285.27 202.86 278.53 219.34 296.14 221.98 302.88 205.5",fill:IC.helios}),React.createElement("polygon",{points:"316.84 229.94 299.23 227.3 292.5 243.78 310.11 246.42 316.84 229.94",fill:IC.helios}),React.createElement("polygon",{points:"346.71 212.95 329.11 210.31 322.37 226.79 339.98 229.44 346.71 212.95",fill:IC.helios}),React.createElement("polygon",{points:"275.23 258.96 284.7 271.77 299.39 265.6 306.4 267.53 315.87 280.34 332.29 273.45 321.7 259.13 307.02 265.3 300 263.37 290.53 250.56 275.85 256.72 269.13 254.88 265.72 248.87 267.98 240.62 259.74 238.35 256.32 232.35 257.98 226.33 270.79 216.86 264.62 202.18 266.36 195.86 279.17 186.39 272.28 169.97 257.96 180.56 264.13 195.24 262.39 201.56 249.58 211.03 255.74 225.72 254.09 231.73 248.08 235.15 239.84 232.88 237.57 241.12 231.56 244.54 224.85 242.69 215.38 229.88 200.69 236.05 193.68 234.12 184.21 221.31 167.79 228.2 178.37 242.52 193.06 236.35 200.08 238.28 209.55 251.09 224.23 244.93 230.95 246.77 234.36 252.78 232.09 261.03 240.34 263.3 243.75 269.3 242.1 275.32 229.29 284.79 235.46 299.47 233.72 305.79 220.91 315.26 227.8 331.68 242.12 321.09 235.95 306.41 237.69 300.09 250.5 290.62 244.33 275.93 245.99 269.92 252 266.5 260.24 268.77 262.51 260.53 268.52 257.11 275.23 258.96",fill:IC.helios}),React.createElement("polygon",{points:"222.05 222.2 238.53 228.93 241.17 211.32 224.69 204.59 222.05 222.2",fill:IC.helios}),React.createElement("polygon",{points:"205.06 192.32 221.54 199.06 224.19 181.45 207.71 174.72 205.06 192.32",fill:IC.helios}),React.createElement("polygon",{points:"204.56 169.19 207.2 151.58 190.72 144.84 188.08 162.45 204.56 169.19",fill:IC.helios}),React.createElement("polygon",{points:"184.37 184.33 200.86 191.07 203.5 173.46 187.02 166.72 184.37 184.33",fill:IC.helios}),React.createElement("polygon",{points:"201.36 214.2 217.84 220.94 220.48 203.33 204 196.6 201.36 214.2",fill:IC.helios}),React.createElement("polygon",{points:"242.28 206.98 244.92 189.37 228.44 182.63 225.79 200.24 242.28 206.98",fill:IC.helios}),React.createElement("polygon",{points:"225.29 177.1 227.94 159.49 211.45 152.76 208.81 170.37 225.29 177.1",fill:IC.helios}),React.createElement("polygon",{points:"145.37 309.71 162.98 312.36 169.71 295.87 152.1 293.23 145.37 309.71",fill:IC.helios}),React.createElement("polygon",{points:"175.24 292.73 192.85 295.37 199.59 278.89 181.98 276.25 175.24 292.73",fill:IC.helios}),React.createElement("polygon",{points:"205.12 275.74 222.72 278.39 229.46 261.91 211.85 259.26 205.12 275.74",fill:IC.helios}),React.createElement("polygon",{points:"183.24 272.04 200.84 274.68 207.58 258.2 189.97 255.56 183.24 272.04",fill:IC.helios}),React.createElement("polygon",{points:"153.36 289.02 170.97 291.67 177.71 275.19 160.1 272.54 153.36 289.02",fill:IC.helios}),React.createElement("polygon",{points:"167.33 313.46 184.93 316.1 191.67 299.62 174.06 296.98 167.33 313.46",fill:IC.helios}),React.createElement("polygon",{points:"197.2 296.48 214.81 299.12 221.54 282.64 203.93 279.99 197.2 296.48",fill:IC.helios}),React.createElement("polygon",{points:"279.25 277.8 262.77 271.07 260.12 288.68 276.61 295.41 279.25 277.8",fill:IC.helios}),React.createElement("polygon",{points:"296.23 307.68 279.75 300.94 277.11 318.55 293.59 325.28 296.23 307.68",fill:IC.helios}),React.createElement("polygon",{points:"313.22 337.55 296.73 330.81 294.09 348.42 310.57 355.16 313.22 337.55",fill:IC.helios}),React.createElement("polygon",{points:"316.92 315.67 300.44 308.93 297.8 326.54 314.28 333.28 316.92 315.67",fill:IC.helios}),React.createElement("polygon",{points:"299.94 285.8 283.46 279.06 280.81 296.67 297.29 303.4 299.94 285.8",fill:IC.helios}),React.createElement("polygon",{points:"259.02 293.02 256.38 310.63 272.86 317.37 275.5 299.76 259.02 293.02",fill:IC.helios}),React.createElement("polygon",{points:"276 322.9 273.36 340.51 289.84 347.24 292.48 329.63 276 322.9",fill:IC.helios}));}
  if(t==="flare"){return React.createElement("g",{transform:"translate("+x+","+y+") scale(0.12) translate(-250,-250)",filter:"drop-shadow(0 0 5px "+IC.flare+"99)",style:{animation:anim?"flarePulse 2s ease-in-out infinite":"none"}},React.createElement("path",{d:"M175.93,240.22c3.99-12.87.21-20.98,12.36-38.1,0,0,10.62-13.48,26.64-17.5s26.64-5.79,33.98-10.81c7.34-5.02,12.61-12.61,15.83-25.35,0,0-10.49,15.63-18.86,19.95-7.23,3.73-21.81,7.21-37.61,8.36-13.1.95-27.19,13.52-27.19,13.52,0,0-9.91,8.88-12.23,21.62s4.23,26.28-4.44,37.2c-5.12,6.4-11.64,14.61-20.79,22.27,0,0,12.1-4.5,20.34-13.13,0,0,7.98-5.15,11.97-18.02Z",fill:IC.flare}),React.createElement("path",{d:"M334.11,251.22c-10.92,8.67-24.45,2.12-37.2,4.44s-21.62,12.23-21.62,12.23c0,0-12.57,14.09-13.52,27.19-1.15,15.8-4.63,30.38-8.36,37.61-4.31,8.37-19.95,18.86-19.95,18.86,12.74-3.22,20.34-8.49,25.35-15.83,5.02-7.34,6.79-17.95,10.81-33.98,4.02-16.03,17.5-26.64,17.5-26.64,17.12-12.14,25.23-8.37,38.1-12.36s18.02-11.97,18.02-11.97c8.62-8.24,13.13-20.34,13.13-20.34-7.65,9.15-15.87,15.66-22.27,20.79Z",fill:IC.flare}),React.createElement("path",{d:"M248.13,234.1c26.76-18.98,46.79-16.66,59.55-19.31,12.77-2.66,15.36-6.28,26.23-14.33,10.87-8.05,22.67-40.8,20.74-36.81-1.94,3.99-23.31,27.29-43.04,34.41-19.73,7.12-28.27,2.05-48.19,5.67-19.92,3.62-33.8,19.11-33.8,19.11,0,0-19.65,22.03-21.14,42.5-1.79,24.7-7.24,39.26-13.06,50.56-6.74,13.09-31.18,29.48-31.18,29.48,19.92-5.03,31.79-13.28,39.64-24.75s10.62-19.82,16.9-44.88c6.28-25.05,27.36-41.65,27.36-41.65Z",fill:IC.flare}));}
  if(t==="pirate"){return React.createElement("g",{transform:"translate("+x+","+y+") scale(0.1) translate(-250,-250)",filter:"drop-shadow(0 0 5px "+IC.pirate+"99)"},React.createElement("path",{d:"M148.89,151.98c.28.2.58.35.88.46-.26.83.01,1.76.75,2.29,0,0,.01,0,.02,0-.47,1.36-.21,2.84.62,3.95-.17.13-.33.27-.46.45-.09.12-.16.25-.21.38-.49.1-.95.37-1.27.81-.66.92-.45,2.21.47,2.87.71.51,1.62.5,2.31.06-.03,1.57.8,3.1,2.28,3.87.09.05.19.08.29.12-.14,1.67.71,3.34,2.28,4.16.34.18.7.29,1.06.37-.11.38-.19.77-.19,1.19,0,2.36,1.91,4.27,4.27,4.27,2.08,0,3.8-1.48,4.19-3.45,1.57.03,3.1-.8,3.87-2.28.63-1.21.61-2.58.08-3.73.19-.13.36-.29.5-.48.47-.65.49-1.48.15-2.15.53-.38.98-.87,1.3-1.49.05-.09.07-.18.11-.27.88.42,1.97.17,2.56-.65.21-.29.32-.62.36-.95,1.13-.29,2.14-1.03,2.72-2.15.49-.93.57-1.96.36-2.91,1.81.35,3.7-.49,4.6-2.2.83-1.6.55-3.47-.56-4.76.38-.89.42-1.84.2-2.72.39-.34.74-.76.99-1.25,1.09-2.09.27-4.67-1.82-5.76-.47-.24-.96-.36-1.45-.42.78-.54,1.3-1.44,1.3-2.46,0-1.64-1.33-2.98-2.98-2.98-.71,0-1.36.26-1.87.68-.51-.42-1.16-.68-1.88-.68-.6,0-1.17.18-1.64.49-.36-.45-.8-.85-1.35-1.13-1.11-.58-2.36-.61-3.45-.21-.07-.54-.36-1.05-.84-1.4-.92-.66-2.21-.45-2.87.47-.24.34-.35.72-.36,1.1-1.12.24-2,1.12-2.26,2.24-.86.37-1.6,1.03-2.07,1.92-.09.17-.14.34-.21.52-.12-.43-.38-.83-.77-1.11-.92-.66-2.21-.45-2.87.47-.12.16-.2.34-.26.52-1.75-.26-3.56.57-4.42,2.24-.78,1.49-.57,3.23.36,4.5-.36.26-.67.59-.94.95-1.04.03-2.05.51-2.7,1.42-1.11,1.54-.75,3.69.79,4.8Z",fill:IC.pirate}),React.createElement("path",{d:"M351.8,170.72c0-1.48-.46-2.86-1.25-3.99.79-1.13,1.25-2.51,1.25-3.99s-.42-2.73-1.14-3.83c1.41-1.28,2.3-3.13,2.3-5.18,0-1.69-.61-3.24-1.61-4.45.21-.45.34-.94.34-1.47,0-1.92-1.56-3.47-3.47-3.47-.3,0-.59.05-.88.12-.73-.77-1.63-1.38-2.66-1.75-1.27-1.82-3.37-3.01-5.75-3.01-1.29,0-2.5.36-3.54.97-.52-.12-1.05-.19-1.61-.19-2.18,0-4.13.99-5.41,2.55-.95-.48-2.01-.75-3.15-.75-1.03,0-2,.23-2.88.62-1.29-1.48-3.18-2.42-5.3-2.42s-4.06.98-5.34,2.51c-.19-.03-.38-.06-.58-.06-1.77,0-3.22,1.33-3.43,3.05-.35.13-.7.27-1.03.45-1.17-.86-2.6-1.38-4.16-1.38-.69,0-1.36.1-1.99.29-1.1-.71-2.4-1.13-3.8-1.13-3.87,0-7.01,3.14-7.01,7.01,0,2.99,1.87,5.53,4.5,6.54-.08.42-.12.86-.12,1.31,0,2.86,1.71,5.31,4.16,6.4.49,1.15,1.28,2.13,2.27,2.87.63,1.85,2.01,3.33,3.77,4.12.89,2.12,2.79,3.71,5.11,4.17.68,2,2.23,3.58,4.2,4.32.19,1.74,1.65,3.1,3.44,3.1.28,0,.54-.04.8-.1.61.68,1.35,1.24,2.18,1.65.8,2.99,3.52,5.2,6.77,5.2.99,0,1.93-.22,2.79-.59.54,1.22,1.76,2.08,3.18,2.08,1.9,0,3.44-1.53,3.47-3.43,3.08-.42,5.52-2.82,5.98-5.89,1.98-1.05,3.41-3.01,3.7-5.34.56-.09,1.09-.25,1.6-.46.57.4,1.25.64,2,.64,1.92,0,3.47-1.56,3.47-3.48,0-1.06-.49-2-1.24-2.64.05-.32.08-.65.08-.99Z",fill:IC.pirate}),React.createElement("polygon",{points:"235.22 164.07 240.29 164.07 241.32 171.72 242.82 171.72 242.82 167.38 244.58 167.74 244.58 167.24 245.33 167.24 246.08 167.24 246.08 167.74 247.84 167.38 247.84 171.72 249.34 171.72 250.37 164.07 255.44 164.07 257.66 167.47 270.21 167.47 264.18 162.4 260.27 158.64 258 156.18 258.05 157.29 253.55 154.99 251.24 152.94 249.17 152.91 247.33 148.07 246.42 138.59 245.33 138.59 244.24 138.59 243.33 148.07 241.48 152.91 239.42 152.94 237.11 154.99 232.61 157.29 232.66 156.18 230.39 158.64 226.48 162.4 220.45 167.47 233 167.47 235.22 164.07",fill:IC.pirate}),React.createElement("rect",{x:"240.12",y:"237.27",width:"10.42",height:"7.72",fill:IC.pirate}));}
  if(t==="starcruiser"){return React.createElement("g",{transform:"translate("+x+","+y+") scale(0.11) translate(-250,-250)",filter:"drop-shadow(0 0 5px "+IC.starcruiser+"99)"},React.createElement("path",{d:"M261.01,331.28c-2.19-1.23-4.54-1.89-6.89-2.05l-1.1-1.85,1.2-2.13,1.85-3.28,13.46-3.77-3.62-12.92,12.92-3.62-3.77-13.46.47-.83,13.46-3.77-3.77-13.46,6.23-11.07,3.3-8.48-4.56-11.75,3.36-2.78-.44-2.39,2.57-1.3-.38-2.59,2.57-1.38-.41-2.45,28.28-16.13.29-36.46,3.25-.53,1.23-7.43,4.88-23.98-10.48-7.79-12.1-4.92-17.97,16.62-5.72,4.91,1.23,3.06-31.02,19.17.88,32.54-2.31.92.15,2.91-2.41,1.02.22,2.87-2.28.86-.64,4.31-12.41,2.2-5.54,7.22-6.23,11.07-13.46,3.77,3.77,13.46-.47.83-13.46,3.77,3.62,12.92-12.92,3.62,3.77,13.46-1.85,3.28-1.2,2.13-2.16.02c-1.36-1.92-3.14-3.59-5.33-4.82-7.9-4.45-17.9-1.65-22.35,6.25s-1.65,17.9,6.25,22.35c1.58.89,3.25,1.48,4.95,1.8l-1.89,11.15-2.85,8.8,3.83,1.24,1.88-5.83,1.54.26,2.16,3.46,6.61,8,.36,1.2c-1.62,0-3.2.83-4.05,2.34-1.26,2.23-.46,5.06,1.77,6.31.07.04.15.07.22.1-.34.32-.66.68-.9,1.11-1.26,2.23-.46,5.06,1.77,6.31,1.97,1.11,4.4.62,5.8-1.05l.25.83.84-.21c-.69,2.07.15,4.4,2.12,5.5,2.23,1.26,5.06.46,6.31-1.77.24-.43.39-.88.48-1.34.07.04.13.09.2.13,2.23,1.26,5.06.46,6.31-1.77.85-1.52.74-3.29-.1-4.68l1.21-.31,10.27,1.5,4.08.05,1.02,1.18-4,4.63,3.04,2.63,6.05-7,8.55-7.4c1.16,1.28,2.53,2.4,4.11,3.29,7.9,4.45,17.9,1.65,22.35-6.25,4.45-7.9,1.65-17.9-6.25-22.35Z",fill:IC.starcruiser}));}
  if(t==="settlement"){return React.createElement("g",{transform:"translate("+x+","+y+") scale(0.11) translate(-250,-250)",filter:"drop-shadow(0 0 5px "+IC.settlement+"99)"},React.createElement("path",{d:"M281.68,291.1l-13.04,13.04-3.26-3.26,10.42-10.42-30.37-3.39-26.44,26.44-15.03-15.03,42.54-42.54-3.03-3.03-42.54,42.54-15.03-15.03,42.54-42.54-4.52-4.52-42.54,42.54-15.03-15.03,42.54-42.54-1.7-1.7-11.14,8.77-3.45-3.45,9.96-9.96-1.85-1.85-4.99-1.44,13.19-13.19,1.37,4.98,1.89,1.91,8.87-8.87,3.46,3.45-7.73,10.01,1.74,1.74,42.18-42.18,15.03,15.03-42.18,42.18,4.52,4.52,42.18-42.18,15.03,15.03-42.18,42.18,3.03,3.03,42.18-42.18,15.03,15.03-25.24,25.24,3.39,30.37,10.12-10.12,3.26,3.26-13.58,13.58,42.45,42.45-.35,9.21-9.29.36-42.41-42.41ZM246.48,286.02l30.37,3.39,1.57-1.57-16.88-16.88-15.06,15.06ZM271.14,261.36l16.88,16.88,2.41-2.41-3.39-30.37-15.9,15.9Z",fill:IC.settlement}));}
  if(t==="research"){return React.createElement("g",{transform:"translate("+x+","+y+") scale(0.11) translate(-250,-250)",filter:"drop-shadow(0 0 5px "+IC.research+"99)"},React.createElement("polygon",{points:"297.37 200.32 248.64 151.58 240.45 159.77 289.18 208.51 281.63 216.06 223.27 157.7 215.08 165.89 273.44 224.25 255.7 241.99 247.53 241.99 247.53 238.24 243.78 238.24 243.78 234.49 240.29 234.49 240.69 225.96 208.88 194.14 194.37 194.37 194.14 208.88 225.96 240.69 234.49 240.29 234.49 243.78 238.24 243.78 238.24 247.53 241.99 247.53 241.99 255.7 224.25 273.44 165.89 215.08 157.7 223.27 216.06 281.63 208.51 289.18 159.77 240.45 151.58 248.64 200.32 297.37 192.86 304.83 195.17 307.14 202.63 299.68 251.36 348.42 259.55 340.23 210.82 291.49 218.37 283.94 276.73 342.3 284.92 334.11 226.56 275.75 244.53 257.78 252.24 257.78 252.24 261.53 255.99 261.53 255.99 265.28 258.93 265.28 257.85 272.59 289.74 304.47 303.99 303.99 304.47 289.74 272.59 257.85 265.28 258.93 265.28 255.99 261.53 255.99 261.53 252.24 257.78 252.24 257.78 244.53 275.75 226.56 334.11 284.92 342.3 276.73 283.94 218.37 291.49 210.82 340.23 259.55 348.42 251.36 299.68 202.63 307.14 195.17 304.83 192.86 297.37 200.32",fill:IC.research}));}
  if(t==="ring"){return React.createElement("g",{transform:"translate("+x+","+y+") scale(0.11) translate(-250,-250)",filter:"drop-shadow(0 0 5px "+IC.starcruiser+"99)"},React.createElement("path",{d:"M250,141.03c-60.18,0-108.97,48.79-108.97,108.97s48.79,108.97,108.97,108.97,108.97-48.79,108.97-108.97-48.79-108.97-108.97-108.97ZM250,354.54c-57.74,0-104.54-46.81-104.54-104.54s46.81-104.54,104.54-104.54,104.54,46.81,104.54,104.54-46.81,104.54-104.54,104.54Z",fill:IC.starcruiser}),React.createElement("path",{d:"M250,152.88c-53.64,0-97.12,43.48-97.12,97.12s43.48,97.12,97.12,97.12,97.12-43.48,97.12-97.12-43.48-97.12-97.12-97.12ZM250,343.18c-51.46,0-93.18-41.72-93.18-93.18s41.72-93.18,93.18-93.18,93.18,41.72,93.18,93.18-41.72,93.18-93.18,93.18Z",fill:IC.starcruiser}),React.createElement("path",{d:"M250,166.26c-46.25,0-83.74,37.49-83.74,83.74s37.49,83.74,83.74,83.74,83.74-37.49,83.74-83.74-37.49-83.74-83.74-83.74ZM250,330.34c-44.37,0-80.34-35.97-80.34-80.34s35.97-80.34,80.34-80.34,80.34,35.97,80.34,80.34-35.97,80.34-80.34,80.34Z",fill:IC.starcruiser}),React.createElement("circle",{cx:"250",cy:"250",r:"66.93",fill:IC.starcruiser}));}
  if(t==="void"){return React.createElement("g",{transform:"translate("+x+","+y+") scale(0.11) translate(-250,-250)",filter:"drop-shadow(0 0 4px #88aaff44)"},React.createElement("path",{d:"M250,136.83c-62.5,0-113.17,50.67-113.17,113.17s50.67,113.17,113.17,113.17,113.17-50.67,113.17-113.17-50.67-113.17-113.17-113.17ZM250,346.61c-53.36,0-96.61-43.25-96.61-96.61s43.25-96.61,96.61-96.61,96.61,43.25,96.61,96.61-43.25,96.61-96.61,96.61Z",fill:"#88aaff"}));}
  if(t==="planet"){return React.createElement("g",{transform:"translate("+x+","+y+") scale(0.1) translate(-250,-250)",filter:"drop-shadow(0 0 5px #aaddff88)"},React.createElement("circle",{cx:"250",cy:"250",r:"92.7",fill:"#aaddff"}));}
  if(t==="medium_moon1"){return React.createElement("g",{transform:"translate("+x+","+y+") scale(0.11) translate(-250,-250)",filter:"drop-shadow(0 0 4px #aaddff66)"},React.createElement("circle",{cx:"250",cy:"250",r:"75.5",fill:"#aaddff"}),React.createElement("path",{d:"M343.51,175.81c3.67-4.1,5.9-9.51,5.9-15.44,0-12.79-10.37-23.16-23.16-23.16-7.27,0-13.75,3.35-18,8.59-17.23-9.65-37.1-15.16-58.25-15.16-65.93,0-119.37,53.44-119.37,119.37s53.44,119.37,119.37,119.37,119.37-53.44,119.37-119.37c0-28.04-9.67-53.82-25.86-74.19ZM250,363.76c-62.83,0-113.76-50.93-113.76-113.76s50.93-113.76,113.76-113.76c20.06,0,38.9,5.2,55.27,14.31-1.4,2.98-2.18,6.31-2.18,9.82,0,12.79,10.37,23.16,23.16,23.16,4.84,0,9.33-1.49,13.04-4.02,15.32,19.38,24.47,43.87,24.47,70.49,0,62.83-50.93,113.76-113.76,113.76Z",fill:"#aaddff",opacity:0.85}));}
  if(t==="medium_moon2"){return React.createElement("g",{transform:"translate("+x+","+y+") scale(0.11) translate(-250,-250)",filter:"drop-shadow(0 0 4px #aaddff66)"},React.createElement("circle",{cx:"250",cy:"250",r:"57.95",fill:"#aaddff"}),React.createElement("path",{d:"M250,116.19c-73.9,0-133.81,59.91-133.81,133.81,0,41.96,19.31,79.4,49.53,103.93-1.23,2.26-1.93,4.85-1.93,7.61,0,8.81,7.15,15.96,15.96,15.96,5.3,0,9.99-2.6,12.89-6.57,17.39,8.26,36.83,12.89,57.36,12.89,73.9,0,133.81-59.91,133.81-133.81s-59.91-133.81-133.81-133.81ZM250,378.87c-19.71,0-38.39-4.43-55.1-12.35.52-1.57.81-3.24.81-4.99,0-8.81-7.15-15.96-15.96-15.96-4.28,0-8.15,1.69-11.02,4.43-29.04-23.63-47.6-59.65-47.6-100.01,0-71.17,57.7-128.87,128.87-128.87s128.87,57.7,128.87,128.87-57.7,128.87-128.87,128.87Z",fill:"#aaddff",opacity:0.7}),React.createElement("path",{d:"M316.2,181.06c1.11-1.61,1.77-3.57,1.77-5.68,0-5.53-4.48-10.01-10.01-10.01-3,0-5.69,1.33-7.53,3.43-14.64-9.11-31.91-14.38-50.42-14.38-52.79,0-95.58,42.79-95.58,95.58s42.79,95.58,95.58,95.58,95.58-42.79,95.58-95.58c0-27.09-11.27-51.54-29.38-68.94ZM250,342.05c-50.84,0-92.05-41.21-92.05-92.05s41.21-92.05,92.05-92.05c17.84,0,34.5,5.08,48.6,13.87-.42,1.11-.66,2.31-.66,3.56,0,5.53,4.48,10.01,10.01,10.01,2.15,0,4.13-.68,5.76-1.83,17.46,16.75,28.33,40.32,28.33,66.43,0,50.84-41.21,92.05-92.05,92.05Z",fill:"#aaddff",opacity:0.55}));}
  
  // Settlement — city skyline
 if(t==="settlement") return React.createElement("g",{filter:"drop-shadow(0 0 5px "+IC.settlement+"88)"},
  React.createElement("rect",{x:x-10,y:y-2,width:4,height:8,fill:IC.settlement,opacity:.9}),
  React.createElement("rect",{x:x-5,y:y-6,width:5,height:12,fill:IC.settlement}),
  React.createElement("rect",{x:x+1,y:y-4,width:4,height:10,fill:IC.settlement,opacity:.9}),
  React.createElement("rect",{x:x+6,y:y-8,width:4,height:14,fill:IC.settlement}),
  React.createElement("rect",{x:x-11,y:y+6,width:22,height:2,fill:IC.settlement,opacity:.5})
 );
 // Research — satellite dish
 if(t==="research") return React.createElement("g",{filter:"drop-shadow(0 0 5px "+IC.research+"88)"},
  React.createElement("ellipse",{cx:x,cy:y-2,rx:10,ry:6,fill:"none",stroke:IC.research,strokeWidth:1.5}),
  React.createElement("ellipse",{cx:x,cy:y-2,rx:6,ry:3.5,fill:"none",stroke:IC.research,strokeWidth:1,opacity:.6}),
  React.createElement("line",{x1:x,y1:y+4,x2:x,y2:y+10,stroke:IC.research,strokeWidth:2}),
  React.createElement("line",{x1:x-5,y1:y+10,x2:x+5,y2:y+10,stroke:IC.research,strokeWidth:1.5}),
  React.createElement("circle",{cx:x,cy:y-4,r:2,fill:IC.research})
 );
 // Flare — animated pulsing
 if(t==="flare"){
  var spokes=Array.from({length:8},function(_,i){var a=i*Math.PI/4;return React.createElement("line",{key:i,x1:x+Math.cos(a)*9,y1:y+Math.sin(a)*9,x2:x+Math.cos(a)*20,y2:y+Math.sin(a)*20,stroke:IC.flare,strokeWidth:1.5});});
  return React.createElement("g",{filter:"drop-shadow(0 0 8px "+IC.flare+")",style:{animation:anim?"flarePulse 1.5s ease-in-out infinite":"none",transformOrigin:x+"px "+y+"px"}},
   React.createElement("circle",{cx:x,cy:y,r:6,fill:IC.flare}),spokes
  );
 }
 if(t==="asteroid") return React.createElement("g",{opacity:.9},[[-11,-7,3],[-4,-13,4],[9,-4,5],[13,6,3],[3,12,4],[-10,9,4]].map(function(arr,i){return React.createElement("circle",{key:i,cx:x+arr[0],cy:y+arr[1],r:arr[2],fill:IC.asteroid});}));
 // Helios — solar panel array
 if(t==="helios") return React.createElement("g",{filter:"drop-shadow(0 0 6px "+IC.helios+"99)"},
  React.createElement("rect",{x:x-10,y:y-3,width:8,height:6,rx:1,fill:IC.helios,opacity:.9}),
  React.createElement("rect",{x:x+2,y:y-3,width:8,height:6,rx:1,fill:IC.helios,opacity:.9}),
  React.createElement("line",{x1:x-7,y1:y-3,x2:x-7,y2:y+3,stroke:"#000",strokeWidth:.8,opacity:.4}),
  React.createElement("line",{x1:x-4,y1:y-3,x2:x-4,y2:y+3,stroke:"#000",strokeWidth:.8,opacity:.4}),
  React.createElement("line",{x1:x+5,y1:y-3,x2:x+5,y2:y+3,stroke:"#000",strokeWidth:.8,opacity:.4}),
  React.createElement("line",{x1:x+8,y1:y-3,x2:x+8,y2:y+3,stroke:"#000",strokeWidth:.8,opacity:.4}),
  React.createElement("rect",{x:x-1,y:y+3,width:2,height:5,fill:IC.helios,opacity:.7})
 );
 if(t==="starcruiser") return React.createElement("g",{transform:"translate("+x+","+y+")",filter:"drop-shadow(0 0 6px "+IC.starcruiser+"99)"},
  React.createElement("polygon",{points:"0,-18 -7,8 7,8",fill:IC.starcruiser}),
  React.createElement("rect",{x:-9,y:8,width:5,height:6,rx:1,fill:IC.starcruiser}),
  React.createElement("rect",{x:4,y:8,width:5,height:6,rx:1,fill:IC.starcruiser})
 );
 // Pirate — skull
 if(t==="pirate") return React.createElement("g",{filter:"drop-shadow(0 0 6px "+IC.pirate+"99)"},
  React.createElement("circle",{cx:x,cy:y-3,r:9,fill:IC.pirate,opacity:.9}),
  React.createElement("circle",{cx:x-3.5,cy:y-5,r:2.5,fill:"#000",opacity:.8}),
  React.createElement("circle",{cx:x+3.5,cy:y-5,r:2.5,fill:"#000",opacity:.8}),
  React.createElement("rect",{x:x-5,y:y+1,width:10,height:2,rx:1,fill:"#000",opacity:.7}),
  React.createElement("line",{x1:x-3,y1:y+3,x2:x-3,y2:y+6,stroke:"#000",strokeWidth:1.5,opacity:.7}),
  React.createElement("line",{x1:x,y1:y+3,x2:x,y2:y+6,stroke:"#000",strokeWidth:1.5,opacity:.7}),
  React.createElement("line",{x1:x+3,y1:y+3,x2:x+3,y2:y+6,stroke:"#000",strokeWidth:1.5,opacity:.7}),
  React.createElement("line",{x1:x-12,y1:y+8,x2:x+12,y2:y+8,stroke:IC.pirate,strokeWidth:2.5}),
  React.createElement("line",{x1:x-9,y1:y+4,x2:x+9,y2:y+12,stroke:IC.pirate,strokeWidth:2}),
  React.createElement("line",{x1:x+9,y1:y+4,x2:x-9,y2:y+12,stroke:IC.pirate,strokeWidth:2})
 );
 return null;
}

// ── TYPEWRITER ────────────────────────────────────────────────────────────
function Typewriter(props){
 var text=props.text,speed=props.speed||14,color=props.color||"#00FFD0",onDone=props.onDone;
 var shownS=useState(""),setShown=shownS[1];var shown=shownS[0];
 var doneS=useState(false),setDone=doneS[1];var done=doneS[0];
 var clearConfirmS=useState(false),setClearConfirm=clearConfirmS[1];var clearConfirm=clearConfirmS[0];
 useEffect(function(){setShown("");setDone(false);var i=0;var t=setInterval(function(){i++;setShown(text.slice(0,i));if(i>=text.length){setDone(true);clearInterval(t);if(onDone)onDone();}},speed);return function(){clearInterval(t);};},[text]);
 return React.createElement("span",{style:{color:color,fontFamily:MONO}},shown,!done&&React.createElement("span",{style:{animation:"blink 1s infinite",color:color}},"█"));
}
function TypewriterLines(props){
 var lines=props.lines,onAllDone=props.onAllDone;
 var curS=useState(0),setCur=curS[1];var cur=curS[0];
 useEffect(function(){if(cur>=lines.length&&onAllDone)onAllDone();},[cur]);
 return React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:5}},
  lines.map(function(l,i){return i<=cur?React.createElement("div",{key:i,style:{animation:"in .1s ease"}},React.createElement(Typewriter,{text:l.text,speed:l.speed||20,color:l.color||"#00FFD0",onDone:function(){if(i===cur)setCur(function(c){return c+1;});}})):null;})
 );
}

// ── BOOT SEQUENCE ───────────────────────────────────────────────────────
function BootSequence(props){
 var onDone=props.onDone;
 var phaseS=useState(0),setPhase=phaseS[1];var phase=phaseS[0];
 var fadingS=useState(false),setFading=fadingS[1];var fading=fadingS[0];
 var titleTextS=useState(""),setTitleText=titleTextS[1];var titleText=titleTextS[0];
 var subTextS=useState(""),setSubText=subTextS[1];var subText=subTextS[0];
 var logLinesS=useState([]),setLogLines=logLinesS[1];var logLines=logLinesS[0];
 var curLineS=useState(""),setCurLine=curLineS[1];var curLine=curLineS[0];
 var W=window.innerWidth/1.3225,H=window.innerHeight/1.3225;
 var mapW=Math.min(1100,W-32),mapLeft=(W-mapW)/2,mapTop=70,mapH=H-mapTop-80;
 var borderLen=Math.round(2*(mapW+mapH));
 useEffect(function(){
  var ts=[];
  var t=function(fn,ms){var id=setTimeout(fn,ms);ts.push(id);};
  t(function(){setPhase(1);},200);
  t(function(){setPhase(2);},600);
  t(function(){setPhase(3);},950);
  t(function(){setPhase(4);},1550);
  t(function(){
   setPhase(5);
   var LOGS=["NEURAL INTERFACE: ONLINE","HULL INTEGRITY: NOMINAL","NAVIGATION DB: SYNCHRONIZED","MABEL: ONLINE"];
   var li=0,ci=0,ps=0;
   var iv=setInterval(function(){
    if(li>=LOGS.length){clearInterval(iv);setPhase(6);return;}
    if(ps>0){ps--;return;}
    var line=LOGS[li];ci++;
    if(ci<=line.length){setCurLine(line.slice(0,ci));}
    else{setLogLines(function(p){return p.concat([line]);});setCurLine("");li++;ci=0;ps=5;}
   },25);
   ts.push(iv);
  },2100);
  return function(){ts.forEach(function(id){clearTimeout(id);clearInterval(id);});};
 },[]);
 useEffect(function(){
  if(phase!==6)return;
  var ts2=[];
  var tl="GHOST SIGNAL",sl="ALL SYSTEMS NOMINAL",i=0;
  var iv2=setInterval(function(){
   i++;
   if(i<=tl.length){setTitleText(tl.slice(0,i));}
   else if(i>tl.length+6){var si=i-tl.length-6;if(si<=sl.length)setSubText(sl.slice(0,si));}
   if(i>=tl.length+6+sl.length)clearInterval(iv2);
  },75);
  ts2.push(iv2);
  var fadeId=setTimeout(function(){setFading(true);setTimeout(function(){onDone();},1500);},4200);
  ts2.push(fadeId);
  return function(){ts2.forEach(function(id){clearTimeout(id);clearInterval(id);});};
 },[phase]);
 if(fading)return React.createElement("div",{style:{position:"fixed",inset:0,background:"#0a0a14",zIndex:9998,animation:"bootFadeOut 1.5s ease forwards",pointerEvents:"none"}});
 return React.createElement("div",{style:{position:"fixed",inset:0,background:"#0a0a14",zIndex:9998,overflow:"hidden"}},
  React.createElement("div",{style:{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.42) 3px,rgba(0,0,0,.42) 6px)",zIndex:2,pointerEvents:"none"}}),
  phase>=1&&React.createElement("div",{style:{position:"absolute",left:0,right:0,top:"50%",transform:"translateY(-50%)",height:phase===1?"3px":"130vh",background:"radial-gradient(ellipse 120% 50% at 50% 50%,#00e5ff2a 0%,#ffffff18 30%,transparent 75%)",filter:"blur(14px)",opacity:phase<=2?1:0.06,transition:phase<=2?"height 0.5s cubic-bezier(0.2,0.8,0.4,1)":"opacity 2.5s ease",boxShadow:"0 0 120px 60px #00e5ff06",zIndex:3,pointerEvents:"none"}}),
  phase>=3&&React.createElement("svg",{style:{position:"absolute",inset:0,width:"100%",height:"100%",zIndex:8,pointerEvents:"none",animation:"in 0.5s ease"},viewBox:"0 0 "+W+" "+H},
   React.createElement("defs",null,React.createElement("filter",{id:"bootGlowF",x:"-20%",y:"-20%",width:"140%",height:"140%"},React.createElement("feGaussianBlur",{stdDeviation:"3",result:"blur"}),React.createElement("feMerge",null,React.createElement("feMergeNode",{in:"blur"}),React.createElement("feMergeNode",{in:"SourceGraphic"})))),
   React.createElement("rect",{x:mapLeft,y:mapTop,width:mapW,height:mapH,rx:12,fill:"none",stroke:"#00FFD0",strokeWidth:1.8,filter:"url(#bootGlowF)",strokeDasharray:borderLen,strokeDashoffset:phase===3?borderLen:0,style:{transition:"stroke-dashoffset 0.65s linear"}}),
   
   //PULSING DOTS
   //phase>=4&&[[mapLeft+10,mapTop+10],[mapLeft+mapW-10,mapTop+10],[mapLeft+10,mapTop+mapH-10],[mapLeft+mapW-10,mapTop+mapH-10]].map(function(pt,i){return React.createElement("circle",{key:i,cx:pt[0],cy:pt[1],r:4,fill:"#cc88ff",filter:"url(#bootGlowF)",style:{animation:"pulse 1.2s ease infinite",animationDelay:(i*0.12)+"s"}});})
  
  ),
  phase>=5&&React.createElement("div",{style:{position:"absolute",left:mapLeft+24,top:mapTop+24,width:mapW-48,maxHeight:mapH-120,overflow:"hidden",zIndex:10,animation:"in 0.4s ease"}},
   logLines.map(function(l,idx){return React.createElement("div",{key:idx,style:{fontFamily:MONO,fontSize:11,color:idx===logLines.length-1?"#00FFD066":"#00FFD033",letterSpacing:2,lineHeight:2}}," > "+l);}),
   React.createElement("div",{style:{fontFamily:MONO,fontSize:11,color:"#00FFD0",letterSpacing:2,lineHeight:2}}," > ",curLine,phase<6&&React.createElement("span",{style:{animation:"blink 0.5s step-end infinite"}},"_"))
  ),
  phase>=6&&React.createElement("div",{style:{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:40,pointerEvents:"none",background:"rgba(10,10,20,0.75)",animation:"in 0.6s ease"}},
   React.createElement("div",{style:{fontFamily:ORB,fontSize:52,fontWeight:900,color:"#00FFD0",letterSpacing:18,textAlign:"center",textShadow:"-2px 0 0 #FF206066,2px 0 0 #88BBFF66,0 0 40px #00FFD0cc,0 0 80px #00FFD066,0 0 160px #00FFD022",minHeight:"1.2em",animation:"glitch 2.5s ease 1.5s infinite"}},titleText,React.createElement("span",{style:{animation:"blink 0.5s step-end infinite",color:"#00FFD0",textShadow:"none"}},"_")),
   React.createElement("div",{style:{fontFamily:MONO,fontSize:11,color:"#00FFD0aa",letterSpacing:8,marginTop:14,minHeight:"1em"}},subText,subText.length>0&&subText!=="ALL SYSTEMS NOMINAL"&&React.createElement("span",{style:{animation:"blink 0.5s step-end infinite"}},"_"))
  )
 );
}

function Starfield(){
 var ref=useRef(null);
 useEffect(function(){
  var el=ref.current;if(!el)return;
  var scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);cam.position.z=100;
  var rend=new THREE.WebGLRenderer({alpha:true,antialias:true});rend.setSize(window.innerWidth,window.innerHeight);
  Object.assign(rend.domElement.style,{position:"fixed",top:0,left:0,zIndex:0,pointerEvents:"none"});el.appendChild(rend.domElement);
  var cnt=800,pos=new Float32Array(cnt*3);for(var i=0;i<cnt*3;i++)pos[i]=(Math.random()-.5)*800;
  var geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(pos,3));
  var pts=new THREE.Points(geo,new THREE.PointsMaterial({color:0xffffff,size:1.3}));scene.add(pts);
  var id;var animate=function(){id=requestAnimationFrame(animate);var p=pts.geometry.attributes.position.array;for(var j=2;j<p.length;j+=3){p[j]+=0.22;if(p[j]>200)p[j]=-200;}pts.geometry.attributes.position.needsUpdate=true;rend.render(scene,cam);};animate();
  var onR=function(){cam.aspect=window.innerWidth/window.innerHeight;cam.updateProjectionMatrix();rend.setSize(window.innerWidth,window.innerHeight);};window.addEventListener("resize",onR);
  return function(){cancelAnimationFrame(id);window.removeEventListener("resize",onR);rend.dispose();if(el.contains(rend.domElement))el.removeChild(rend.domElement);};
 },[]);
 return React.createElement("div",{ref:ref});
}

// ── WEAPON DB + DICE ──────────────────────────────────────────────────────
const WEAPON_DB={"revolver":{die:6,stat:"vigor",cnt:1},"gauss smg":{die:6,stat:"grace",cnt:1},"laser blaster":{die:8,stat:"vigor",cnt:1},"gamma gun":{die:8,stat:"tech",cnt:1},"ignition shotgun":{die:10,stat:"vigor",cnt:1},"ion carbine":{die:10,stat:"grace",cnt:1},"pulse rifle":{die:6,stat:"vigor",cnt:2},"gravity rifle":{die:12,stat:"grace",cnt:1},"carbon dagger":{die:6,stat:"grace",cnt:1},"helix wire":{die:8,stat:"vigor",cnt:1},"halo discs":{die:6,stat:"grace",cnt:2},"plasma shield":{die:8,stat:"vigor",cnt:1},"rocket hammer":{die:10,stat:"vigor",cnt:1},"neon blade":{die:12,stat:"vigor",cnt:1}};
function parseExpr(e){
 var s=e.trim().toLowerCase();
 if(s==="d66"){var t=Math.floor(Math.random()*6)+1,o=Math.floor(Math.random()*6)+1;return{dice:[{s:6,r:t},{s:6,r:o}],mod:0,total:t*10+o,d66:true};}
 var m=s.match(/^(\d*)d(\d+)([+-]\d+)?$/);if(!m)return null;
 var cnt=parseInt(m[1])||1,sides=parseInt(m[2]),mod=parseInt(m[3])||0;
 if(sides<2||sides>100||cnt>20)return null;
 var dice=Array.from({length:cnt},function(){return{s:sides,r:Math.floor(Math.random()*sides)+1};});
 return{dice:dice,mod:mod,total:dice.reduce(function(a,d){return a+d.r;},0)+mod};
}

// ── UI PRIMITIVES ─────────────────────────────────────────────────────────
function Bar(props){
 var v=props.v,m=props.m,c=props.c;
 return React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8}},
  React.createElement("div",{style:{flex:1,height:8,background:"#1a1a2e",borderRadius:4,overflow:"hidden"}},React.createElement("div",{style:{width:Math.max(0,Math.min(100,v/m*100))+"%",height:"100%",background:c,transition:"width .3s"}})),
  React.createElement("span",{style:{fontFamily:MONO,fontSize:14,color:c,minWidth:52,textAlign:"right"}},v+"/"+m)
 );
}
function Dots(props){
 var n=(typeof props.v==="number"&&isFinite(props.v))?props.v:0;
 return React.createElement("div",{style:{display:"flex",gap:3,alignItems:"center"}},
  [-3,-2,-1,0,1,2,3].map(function(i){var lit=i===0?n===0:i>0?n>=i:n<=i;var c=i<0?"#FF2060":i===0?"#555":"#00FFD0";return React.createElement("div",{key:i,style:{width:i===0?10:8,height:i===0?10:8,borderRadius:"50%",background:lit?c:"#111",border:"1px solid "+(lit?c:B1)}});}),
  React.createElement("span",{style:{fontFamily:MONO,fontSize:12,color:n<0?"#FF2060":n>0?"#00FFD0":"#888",marginLeft:5}},n>0?"+"+n:n)
 );
}
function Spin(props){
 var v=props.v,min=props.min!=null?props.min:0,max=props.max!=null?props.max:999,onChange=props.onChange;
 var btn={width:26,height:26,background:"transparent",border:"1px solid "+B1,color:"#ccc",borderRadius:3,cursor:"pointer",fontSize:15,padding:0};
 return React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6}},React.createElement("button",{onClick:function(){onChange(Math.max(min,v-1));},style:btn},"−"),React.createElement("span",{style:{fontFamily:MONO,fontSize:16,color:"#eee",minWidth:32,textAlign:"center"}},v),React.createElement("button",{onClick:function(){onChange(Math.min(max,v+1));},style:btn},"+"));
}
function SHdr(props){
 return React.createElement("div",{onClick:props.onToggle,style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",marginTop:18,cursor:"pointer",borderBottom:"1px solid "+props.accent+"44"}},
  React.createElement("span",{style:{fontFamily:MONO,fontSize:11,color:"#ccc",letterSpacing:2}},props.label),
  React.createElement("span",{style:{color:props.accent,fontSize:10}},props.open?"▲":"▼")
 );
}
var tS=function(c,mono){return{width:"100%",background:"transparent",border:"1px solid "+B1,borderRadius:4,color:c,fontFamily:mono?MONO:RAJ,fontSize:14,padding:"7px 10px",outline:"none",boxSizing:"border-box"};};

// ── HEX TYPE SELECT ───────────────────────────────────────────────────────
function HexTypeSelect(props){
 var value=props.value,onChange=props.onChange,shipName=props.shipName||"THE INCONCEIVABLE";
 var openS=useState(false),setOpen=openS[1];var open=openS[0];
 var rootRef=useRef(null);
 useEffect(function(){var h=function(e){if(rootRef.current&&!rootRef.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",h);return function(){document.removeEventListener("mousedown",h);};});
 var GROUPS=[
  {label:"MAP TILES",types:["barrier","base"]},
  {label:"PLANETS",types:["small","medium","giant","medium_moon1","medium_moon2","ring","void"]},
  {label:"LOCATIONS",types:["settlement","research","asteroid","helios","flare"]},
  {label:"THREATS",types:["starcruiser","pirate"]},
  {label:"PLAYER SHIP",types:["seance"]},
  {label:"CLASS A",types:["twinrotor","snowstorm","epsilon","voyager","orionmoth","eclipsewarden"]},
  {label:"CLASS B/C",types:["vectorace","duskwing","smuggler","scarab","mantis","beluga"]},
  {label:"HEAVY",types:["starpredator","shell4","stingray","edgecharger"]},
  {label:"TITANS",types:["theclaw","tarrasque"]},
 ];
 var allTypes=[];GROUPS.forEach(function(g){g.types.forEach(function(t){allTypes.push(t);});});
 var getLabel=function(t){return t==="seance"?shipName:(TYPE_LABELS[t]||t);};
 var MiniHex=function(t){var idx=allTypes.indexOf(t)+1;return React.createElement("svg",{width:5,height:5,viewBox:"0 0 48 48",style:{flexShrink:0,display:"inline-block",verticalAlign:"middle",overflow:"hidden"}},React.createElement("polygon",{points:Array.from({length:6},function(_,i){var a=Math.PI/3*i+Math.PI/6;return(24+Math.cos(a)*22)+","+(24+Math.sin(a)*22);}).join(" "),fill:"#111828",stroke:B3,strokeWidth:2}),React.createElement(HexIcon,{t:t,x:24,y:24,hexId:idx,anim:false}));};
 return React.createElement("div",{ref:rootRef,style:{position:"relative"}},
  React.createElement("div",{onClick:function(){setOpen(!open);},style:{display:"flex",alignItems:"center",gap:10,background:"#080810",border:"1px solid "+B1,borderRadius:4,padding:"8px 10px",cursor:"pointer",color:value?"#eee":"#bbb",fontFamily:MONO,fontSize:12,marginBottom:8,userSelect:"none"}},
   value?MiniHex(value):React.createElement("div",{style:{width:5,height:5}}),
   React.createElement("span",{style:{flex:1,marginLeft:6}},value?getLabel(value):"— SELECT READING —"),
   React.createElement("span",{style:{color:"#999",fontSize:9}},open?"▲":"▼")
  ),
  open&&React.createElement("div",{style:{position:"absolute",top:"100%",left:0,right:0,zIndex:300,background:"#08080f",border:"1px solid "+B3,borderRadius:4,maxHeight:300,overflowY:"auto",boxShadow:"0 8px 32px #000000cc",marginTop:-6}},
   React.createElement("div",{onClick:function(){onChange("");setOpen(false);},style:{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",cursor:"pointer",color:"#888",fontFamily:MONO,fontSize:10,borderBottom:"1px solid "+B2}},"— CLEAR READING —"),
   GROUPS.map(function(g){return React.createElement("div",{key:g.label},
    React.createElement("div",{style:{padding:"5px 10px 3px",fontFamily:MONO,fontSize:9,color:"#778",letterSpacing:2,background:"#060610",borderTop:"1px solid "+B2}},g.label),
    g.types.map(function(t){var sel=value===t;return React.createElement("div",{key:t,onClick:function(){onChange(t);setOpen(false);},onMouseEnter:function(e){e.currentTarget.style.background="#ffffff0d";},onMouseLeave:function(e){e.currentTarget.style.background=sel?"#ffffff08":"transparent";},style:{display:"flex",alignItems:"center",gap:10,padding:"6px 10px",cursor:"pointer",background:sel?"#ffffff08":"transparent",color:sel?"#fff":"#ccc",fontFamily:RAJ,fontSize:14}},MiniHex(t),React.createElement("span",{style:{marginLeft:4}},getLabel(t)));})
   );})
  )
 );
}

// ── CHAR CARD ─────────────────────────────────────────────────────────────
function CharCard(props){
 var name=props.name,data=props.data,accent=props.accent,onChange=props.onChange,onNameChange=props.onNameChange;
 var editNameS=useState(false),setEditName=editNameS[1];var editName=editNameS[0];
 var openS=useState({attrs:false,weapons:false,cyber:false,memory:false,inv:false,fav:false}),setOpen=openS[1];var open=openS[0];
 var tog=function(k){setOpen(function(p){var n=Object.assign({},p);n[k]=!p[k];return n;});};
 var adj=function(key,d){onChange(key,Math.max(0,Math.min(data[key+"Max"]||999,data[key]+d)));};
 var w=data.weapons||mkW();var fav=data.fav||{};
 return React.createElement("div",{style:{background:BG,border:"1px solid "+accent+"55",borderRadius:8,padding:22,flex:1,minWidth:300}},
  editName?React.createElement("input",{defaultValue:name,onBlur:function(e){onNameChange(e.target.value);setEditName(false);},onKeyDown:function(e){if(e.key==="Enter")e.target.blur();if(e.key==="Escape")setEditName(false);},style:{background:"transparent",border:"none",borderBottom:"1px solid "+accent,color:accent,fontFamily:ORB,fontSize:15,letterSpacing:3,outline:"none",width:"100%",marginBottom:18},autoFocus:true}):
  React.createElement("div",{onClick:function(){setEditName(true);},style:{fontFamily:ORB,fontSize:15,fontWeight:700,color:accent,letterSpacing:3,marginBottom:18,cursor:"text"}},name),
  [["HEALTH","hp"],["ENERGY","en"]].map(function(pair){return React.createElement("div",{key:pair[1],style:{marginBottom:16}},
   React.createElement("div",{style:{fontFamily:MONO,fontSize:13,color:"#bbb",letterSpacing:2,marginBottom:7}},pair[0]),
   React.createElement(Bar,{v:data[pair[1]],m:data[pair[1]+"Max"],c:accent}),
   React.createElement("div",{style:{display:"flex",gap:5,marginTop:7}},[-5,-1,1,5].map(function(d){return React.createElement("button",{key:d,onClick:function(){adj(pair[1],d);},style:{flex:1,padding:"5px 0",background:"transparent",border:"1px solid "+B1,color:"#ccc",borderRadius:3,cursor:"pointer",fontFamily:MONO,fontSize:12}},d>0?"+"+d:d);}))
  );}),
  React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:8}},
   [["EXP","exp"],["SERUM","serum"],["ARMOR","armor"],["HYPERDRIVE","hyp"]].map(function(pair){return React.createElement("div",{key:pair[1]},React.createElement("div",{style:{fontFamily:MONO,fontSize:12,color:"#bbb",letterSpacing:1,marginBottom:6}},pair[0]),React.createElement(Spin,{v:data[pair[1]]||0,onChange:function(v){onChange(pair[1],v);}}));})
  ),
  React.createElement(SHdr,{label:"ATTRIBUTES",open:open.attrs,onToggle:function(){tog("attrs");},accent:accent}),
  open.attrs&&React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:4}},
   [["VIGOR","vigor"],["GRACE","grace"],["MIND","mind"],["TECH","tech"]].map(function(pair){return React.createElement("div",{key:pair[1]},React.createElement("div",{style:{fontFamily:MONO,fontSize:12,color:"#bbb",letterSpacing:1,marginBottom:6}},pair[0]),React.createElement(Spin,{v:data[pair[1]]||0,onChange:function(v){onChange(pair[1],v);}}));})
  ),
  React.createElement(SHdr,{label:"WEAPONS",open:open.weapons,onToggle:function(){tog("weapons");},accent:accent}),
  open.weapons&&React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:10,marginTop:4}},w.map(function(wp,i){return React.createElement("div",{key:i,style:{background:"#080810",borderRadius:6,padding:10,border:"1px solid "+B1}},React.createElement("div",{style:{fontFamily:MONO,fontSize:11,color:"#aaa",letterSpacing:1,marginBottom:7}},"WEAPON "+(i+1)),React.createElement("input",{value:wp.name||"",onChange:function(e){onChange("weapons."+i+".name",e.target.value);},placeholder:"Weapon name",style:tS(accent,false)}),React.createElement("input",{value:wp.mod1||"",onChange:function(e){onChange("weapons."+i+".mod1",e.target.value);},placeholder:"Mod slot 1",style:Object.assign({},tS("#aaa",true),{marginTop:5})}),React.createElement("input",{value:wp.mod2||"",onChange:function(e){onChange("weapons."+i+".mod2",e.target.value);},placeholder:"Mod slot 2",style:Object.assign({},tS("#aaa",true),{marginTop:5})}));})),
  React.createElement(SHdr,{label:"CYBERTECH",open:open.cyber,onToggle:function(){tog("cyber");},accent:accent}),
  open.cyber&&React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:6,marginTop:4}},(data.cybertech||Array(6).fill("")).map(function(v,i){return React.createElement("input",{key:i,value:v,onChange:function(e){onChange("cybertech."+i,e.target.value);},placeholder:"Cybertech slot "+(i+1),style:tS("#cc88ff",true)});})),
  React.createElement(SHdr,{label:"MEMORY SLOTS",open:open.memory,onToggle:function(){tog("memory");},accent:accent}),
  open.memory&&React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:6,marginTop:4}},(data.memory||Array(6).fill("")).map(function(v,i){return React.createElement("input",{key:i,value:v,onChange:function(e){onChange("memory."+i,e.target.value);},placeholder:"Memory "+(i+1),style:tS("#aaaaff",false)});})),
  React.createElement(SHdr,{label:"INVENTORY",open:open.inv,onToggle:function(){tog("inv");},accent:accent}),
  open.inv&&React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:4}},(data.inventory||Array(8).fill("")).map(function(v,i){return React.createElement("input",{key:i,value:v,onChange:function(e){onChange("inventory."+i,e.target.value);},placeholder:"Slot "+(i+1),style:tS("#aaa",false)});})),
  React.createElement(SHdr,{label:"FACTION FAVOR",open:open.fav,onToggle:function(){tog("fav");},accent:accent}),
  open.fav&&React.createElement("div",{style:{marginTop:4}},FACTIONS.map(function(f){var val=fav[f.id]!=null?fav[f.id]:0;return React.createElement("div",{key:f.id,style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}},React.createElement("span",{style:{fontFamily:MONO,fontSize:12,color:f.c}},f.label),React.createElement("div",{style:{display:"flex",gap:4,alignItems:"center"}},React.createElement("button",{onClick:function(){onChange("fav."+f.id,Math.max(-3,val-1));},style:{width:20,height:20,background:"transparent",border:"1px solid "+B1,color:"#ccc",borderRadius:2,cursor:"pointer",fontSize:13,padding:0}},"−"),React.createElement(Dots,{v:val}),React.createElement("button",{onClick:function(){onChange("fav."+f.id,Math.min(3,val+1));},style:{width:20,height:20,background:"transparent",border:"1px solid "+B1,color:"#ccc",borderRadius:2,cursor:"pointer",fontSize:13,padding:0}},"+"))); }))
 );
}

// ── CREW CARD ─────────────────────────────────────────────────────────────
function CrewCard(props){
 var index=props.index,data=props.data,onChange=props.onChange;
 var openS=useState(false),setOpen=openS[1];var open=openS[0];
 var isEmpty=!data.name&&!data.role;
 var NPC_COLORS=["#00FFD0","#cc88ff","#FF6EC7","#FF9500"];var nc=NPC_COLORS[index];
 var upF=function(k,v){onChange(index,k,v);};
 var cs={width:"100%",background:"transparent",border:"1px solid "+B1,borderRadius:4,color:"#ccc",fontFamily:RAJ,fontSize:14,padding:"7px 10px",outline:"none",boxSizing:"border-box"};
 return React.createElement("div",{style:{background:BG,border:"1px solid "+nc+"55",borderRadius:8,overflow:"hidden"}},
  React.createElement("div",{onClick:function(){setOpen(!open);},style:{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",borderBottom:open?"1px solid "+B2:"none"}},
   React.createElement("div",{style:{display:"flex",alignItems:"center",gap:12,flex:1}},
    React.createElement("span",{style:{fontFamily:MONO,fontSize:10,color:nc,letterSpacing:2,minWidth:36}},"NPC"+(index+1)),
    React.createElement("div",{style:{flex:1}},React.createElement("div",{style:{fontFamily:ORB,fontSize:12,color:isEmpty?"#778":nc,letterSpacing:2}},data.name||"— UNNAMED CREW —"),data.role&&React.createElement("div",{style:{fontFamily:MONO,fontSize:10,color:"#aaa",marginTop:2}},data.role)),
    !isEmpty&&React.createElement("div",{style:{fontFamily:MONO,fontSize:11,color:"#bbb",marginRight:12}},"HP ",React.createElement("span",{style:{color:nc}},data.hp))
   ),
   React.createElement("span",{style:{color:nc+"88",fontSize:12}},open?"▲":"▼")
  ),
  open&&React.createElement("div",{style:{padding:16,display:"flex",flexDirection:"column",gap:10}},
   React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}},
    React.createElement("div",null,React.createElement("div",{style:{fontFamily:MONO,fontSize:11,color:"#aaa",marginBottom:5}},"NAME"),React.createElement("input",{value:data.name,onChange:function(e){upF("name",e.target.value);},placeholder:"Crew name",style:cs})),
    React.createElement("div",null,React.createElement("div",{style:{fontFamily:MONO,fontSize:11,color:"#aaa",marginBottom:5}},"ROLE"),React.createElement("input",{value:data.role,onChange:function(e){upF("role",e.target.value);},placeholder:"Pilot / Medic / etc.",style:cs}))
   ),
   React.createElement("div",null,React.createElement("div",{style:{fontFamily:MONO,fontSize:11,color:"#aaa",marginBottom:5}},"HP"),
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6}},
     [-5,-1].map(function(d){return React.createElement("button",{key:d,onClick:function(){upF("hp",Math.max(0,data.hp+d));},style:{padding:"5px 12px",background:"transparent",border:"1px solid "+B1,color:"#ccc",borderRadius:3,cursor:"pointer",fontFamily:MONO,fontSize:12}},d);}),
     React.createElement("span",{style:{fontFamily:MONO,fontSize:20,color:nc,minWidth:48,textAlign:"center"}},data.hp),
     [1,5].map(function(d){return React.createElement("button",{key:d,onClick:function(){upF("hp",data.hp+d);},style:{padding:"5px 12px",background:"transparent",border:"1px solid "+B1,color:"#ccc",borderRadius:3,cursor:"pointer",fontFamily:MONO,fontSize:12}},"+"+d);})
    )
   ),
   React.createElement("div",null,React.createElement("div",{style:{fontFamily:MONO,fontSize:11,color:"#aaa",marginBottom:6}},"NOTES"),React.createElement("textarea",{value:data.notes,onChange:function(e){upF("notes",e.target.value);},placeholder:"Field notes...",rows:3,style:{width:"100%",background:"transparent",border:"1px solid "+B1,borderRadius:4,color:"#aaa",fontFamily:RAJ,fontSize:14,padding:"9px 12px",outline:"none",resize:"vertical",boxSizing:"border-box",lineHeight:1.7}}))
  )
 );
}

// ── INLINE FORMAT + MADTEXT ────────────────────────────────────────────────
function inlineFormat(str,key){
 var parts=[];var re=/(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]*(?:FRAGMENTED|CORRUPTED|UNKNOWN|ERROR)[^\]]*)\])/g;
 var last=0,m;
 while((m=re.exec(str))!==null){
  if(m.index>last)parts.push(str.slice(last,m.index));
  if(m[2])parts.push(React.createElement("strong",{key:m.index,style:{color:"#ffffff",fontWeight:700}},m[2]));
  else if(m[3])parts.push(React.createElement("em",{key:m.index,style:{color:"#aaccff",fontStyle:"italic"}},m[3]));
  else if(m[4])parts.push(React.createElement("span",{key:m.index,style:{fontFamily:MONO,fontSize:12,color:"#88BBFF",background:"#88BBFF18",padding:"1px 5px",borderRadius:3}},m[4]));
  else if(m[5])parts.push(React.createElement("span",{key:m.index,style:{fontFamily:MONO,color:"#FF2060",fontWeight:700,animation:"pulse 1.8s infinite",letterSpacing:1}},m[0]));
  last=m.index+m[0].length;
 }
 if(last<str.length)parts.push(str.slice(last));
 return React.createElement("span",{key:key},parts);
}

function MadText(props){
 var text=props.text;
 var lines=text.split("\n");
 var els=[];var i=0;
 while(i<lines.length){
  var l=lines[i];
  if(!l.trim()){els.push(React.createElement("div",{key:i,style:{height:6}}));i++;continue;}
  if(/^---+$/.test(l.trim())){els.push(React.createElement("div",{key:i,style:{borderTop:"1px solid #88BBFF33",margin:"10px 0"}}));i++;continue;}
  if(/^#{1,3} /.test(l)){
   var lvl=(l.match(/^(#{1,3}) /)||["",""])[1].length;
   var sizes=[14,12,11];var colors=["#88BBFF","#aaccff","#ccdeff"];
   els.push(React.createElement("div",{key:i,style:{fontFamily:MONO,fontSize:sizes[lvl-1],color:colors[lvl-1],letterSpacing:2,marginTop:12,marginBottom:4,borderBottom:lvl===1?"1px solid #88BBFF33":"none",paddingBottom:lvl===1?4:0}},l.replace(/^#{1,3} /,"")));
   i++;continue;
  }
  if(/^(Querying|Calculating|Archival record|End query\.|MABEL ONLINE)/i.test(l.trim())){
   els.push(React.createElement("div",{key:i,style:{fontFamily:MONO,fontSize:11,color:"#88BBFF",letterSpacing:2,opacity:.85,marginTop:6,marginBottom:2}},l));
   i++;continue;
  }
  if(/^[-*•] /.test(l.trim())){
   var bullets=[];
   while(i<lines.length&&/^[-*•] /.test(lines[i].trim())){
    bullets.push(React.createElement("div",{key:i,style:{display:"flex",gap:8,alignItems:"flex-start",marginBottom:4}},React.createElement("span",{style:{color:"#88BBFF",fontFamily:MONO,fontSize:11,marginTop:2,flexShrink:0}},"›"),React.createElement("span",null,inlineFormat(lines[i].replace(/^[-*•] /,""),i))));i++;
   }
   els.push(React.createElement("div",{key:"bl"+i,style:{display:"flex",flexDirection:"column",padding:"4px 0 4px 4px"}},bullets));continue;
  }
  if(/^\d+\. /.test(l.trim())){
   var items=[];
   while(i<lines.length&&/^\d+\. /.test(lines[i].trim())){
    var num=(lines[i].match(/^(\d+)\. /)||["",""])[1];
    items.push(React.createElement("div",{key:i,style:{display:"flex",gap:8,alignItems:"flex-start",marginBottom:4}},React.createElement("span",{style:{color:"#88BBFF",fontFamily:MONO,fontSize:11,minWidth:16,flexShrink:0}},num+"."),React.createElement("span",null,inlineFormat(lines[i].replace(/^\d+\. /,""),i))));i++;
   }
   els.push(React.createElement("div",{key:"nl"+i,style:{display:"flex",flexDirection:"column",padding:"4px 0 4px 4px"}},items));continue;
  }
  if(/^> /.test(l)){els.push(React.createElement("div",{key:i,style:{borderLeft:"2px solid #88BBFF55",paddingLeft:10,marginTop:4,marginBottom:4,color:"#aaccff",fontStyle:"italic",fontSize:14}},inlineFormat(l.replace(/^> /,""),i)));i++;continue;}
  els.push(React.createElement("div",{key:i,style:{marginBottom:2,lineHeight:1.75}},inlineFormat(l,i)));i++;
 }
 return React.createElement(React.Fragment,null,els);
}

// ── RULES DB ──────────────────────────────────────────────────────────────
const MABEL_C="#88BBFF";
const RULES_DB=`=== ASTROPRISMA TACTICAL DATABASE ===
CORE LOOP: Each cycle — Move 1 hex (mark 1 Fuel) → Exploration Roll (d6) → Mark results.
DICE: d10=ten-sided; 2d6=two d6 added; d66=two d6 (tens+ones); d12+STAT; d8xSTAT.
STATS: VIGOR (VIG) — strength, melee, survival. GRACE (GRA) — piloting, dodging, stealth, aiming. MIND (MIN) — hacking, decryption, knowledge. TECH (TEC) — drones, repair, cybertech.
CHALLENGE ROLLS: Roll 2d10. Add relevant stat to Player die, opponent stat to Challenge die. Player wins if their die is higher.
RINGS: OUTER — pirates/outlaws/asteroids. MIDDLE — former settlements, research outposts, water. INNER — solar flares, Helios Farms, extreme heat. 36 Location Hexes total.
ORIGINS (start with 2 Health Packs + 50 Scraps): ECOTERRORIST VIG3 GRA2 MIN1 TEC4. ASTROMANCER VIG1 GRA1 MIN3 TEC2. GLITCHBLADE VIG2 GRA3 MIN2 TEC1. WIREHEAD VIG1 GRA2 MIN2 TEC3. DESPERADO VIG2 GRA3 MIN1 TEC1 — Laser Blaster, Reflex Sight, 2 Contraband. CHROMESKIN VIG2 GRA1 MIN1 TEC3.
COMBAT ACTIONS: WEAPON (attack with equipped weapon), HACK (roll MIN vs enemy), CYBERTECH (active implant), ESCAPE (roll GRA vs enemy).
STATUS CONDITIONS: OVERHEAT — d6 dmg at turn start. STUN — roll d6, skip turn on 1. SHOCK — lose all armor. SILENCE — no cybertech. IMMUNITY — no direct damage.
RANGED WEAPONS: Revolver d6+VIG 25#. Gauss SMG d6+GRA 25#. Laser Blaster d8+VIG 75#. Gamma Gun d8+TEC 75#. Ignition Shotgun d10+VIG 100#. Ion Carbine d10+GRA 100#. Pulse Rifle 2d6+VIG 150#. Gravity Rifle d12+GRA 150#.
MELEE WEAPONS: Carbon Dagger d6+GRA 25#. Helix Wire d8+VIG 75#. Halo Discs 2d6+GRA 150#. Plasma Shield d8+VIG +1Armor 100#. Rocket Hammer d10+VIG 100#. Neon Blade d12+VIG 150#.
HACKS (roll MIN vs enemy; failure=Malware): JAVELIN 1E — d12+MIN dmg, Breached take double. TROJAN 1E — Breach for MIN turns. EMBER 1E — Overheat MIN turns. BLACKOUT 1E — Shock all TEC turns. VOLT 2E — d10+TEC dmg+Stun. KRAKEN 2E — Stun all 1 turn. IGNITE 3E — d12+MIN dmg+Overheat 2 turns. HYDRA 3E — d10xMIN to Breached.
MALWARE (d10): 1=Nothing. 2=−1E. 3=2dmg. 4=−2E. 5=Stunned 1 turn. 6=4dmg. 7=Shocked 1 turn. 8=−3E. 9=Silenced 1 turn. 10=Learn random Hack.
ORACLE YES/NO (d6): 1=No And. 2=No. 3=No But. 4=Yes But. 5=Yes. 6=Yes And.
ORACLE PROMPTS (d66): 11=Void. 12=Treason. 13=Chaos. 14=Pain. 15=Corruption. 16=Oppression. 21=Suspicion. 22=Regression. 23=Collision. 24=Desire. 25=Vengeance. 26=Occult. 31=Survival. 32=Sacrifice. 33=Conflict. 34=Control. 35=Electricity. 36=Subversion. 41=Nurturing. 42=Light. 43=Noise. 44=Healing. 45=Velocity. 46=Freedom. 51=Compromise. 52=Prophecy. 53=Evolution. 54=Guidance. 55=Growth. 56=Nature. 61=Balance. 62=Wealth. 63=Change. 64=Order. 65=Truth. 66=Time.
SHIP COMBAT: Roll d6s per Engines. Spend Action Dice to activate modules. Shields nullify next attack. Escape: Boost costs 5 Fuel.
LOOT TABLE (d18): 1=25#. 2=Health Pack. 3=Energy Cell. 4=Status Cure. 5=30EXP. 6=Narcobiotic. 7=Ranged Weapon. 8=Melee Weapon. 9=60#. 10=75#. 11=Hack. 12=Ranged Mod. 13=Melee Mod. 14=150#. 15=Armor Set. 16=Master Hack. 17=Cybertech. 18=300#.
EXP REWARDS: Easy +1, Medium +3, Hard +6, Boss +10.
ABYSSAL SCARS (roll d6 at 0HP; 6=death): 1=Android body TEC3 others 0. 2=Hacks/skills +1E cost. 3=Alien symbiote -1 all stats. 4=Time warp, lose all Cybertech+EXP. 5=Take 1dmg on failed rolls. 6=GAME OVER.
=== END DATABASE ===`;

const QUICK_ACTIONS=[
 {label:"STATUS REPORT",prompt:"Run a full status report. Ship condition, crew HP, fuel, scraps, current location."},
 {label:"LAST ENTRY",prompt:"Pull up the most recent mission log entry and summarize what happened."},
 {label:"FACTION STATUS",prompt:"Query faction database. What is our current standing with each known faction?"},
 {label:"THREAT ASSESSMENT",prompt:"Based on current mission state, what are our most pressing threats?"},
 {label:"CREW CHECK",prompt:"Run a crew status check on all NPC crew members."},
 {label:"RESOURCE AUDIT",prompt:"Audit current resources. Scraps, cargo, serum, notable inventory."},
];
const COMMS_INIT=[{role:"assistant",content:"MABEL ONLINE.\n\nShip intelligence active. All systems nominal — or within acceptable deviation thresholds. Mission state loaded.\n\nQuery when ready, Commander."}];

// ── COPY BOX ──────────────────────────────────────────────────────────────
function CopyBox(props){
 var text=props.text,loading=props.loading;
 var copiedS=useState(false),setCopied=copiedS[1];var copied=copiedS[0];
 var copy=function(){try{navigator.clipboard.writeText(text);setCopied(true);setTimeout(function(){setCopied(false);},1800);}catch(e){}};
 return React.createElement("div",{style:{background:"#06060f",border:"1px solid #88BBFF44",borderRadius:6,overflow:"hidden"}},
  React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",borderBottom:"1px solid #88BBFF22"}},
   React.createElement("span",{style:{fontFamily:MONO,fontSize:9,color:MABEL_C,letterSpacing:2}},"SHIP LOG ENTRY — SESSION RECAP"),
   React.createElement("button",{onClick:copy,disabled:loading||!text,style:{fontFamily:MONO,fontSize:9,padding:"3px 10px",background:copied?"#00FFD022":"#88BBFF14",border:"1px solid "+(copied?"#00FFD066":"#88BBFF44"),color:copied?"#00FFD0":MABEL_C,borderRadius:3,cursor:"pointer",letterSpacing:1}},copied?"COPIED ✓":"COPY")
  ),
  loading?React.createElement("div",{style:{padding:"12px 14px",fontFamily:MONO,fontSize:11,color:MABEL_C,animation:"pulse 1s infinite"}},"// COMPOSING LOG ENTRY..."):
  React.createElement("div",{style:{padding:"12px 14px",fontFamily:RAJ,fontSize:14,color:"#ccd8ff",lineHeight:1.8,whiteSpace:"pre-wrap",maxHeight:180,overflowY:"auto"}},text||"")
 );
}

// ── DICE ROLLER ───────────────────────────────────────────────────────────
function DiceRoller(props){
 var gs=props.gameState||INIT;
 var colS=useState(true),setCol=colS[1];var col=colS[0];
 var modeS=useState("challenge"),setMode=modeS[1];var mode=modeS[0];
 var histS=useState([]),setHist=histS[1];var hist=histS[0];
 var hlS=useState(false),setHl=hlS[1];var hl=hlS[0];
 var ckS=useState("cole"),setCk=ckS[1];var ck=ckS[0];
 var csS=useState("grace"),setCs=csS[1];var cs=csS[0];
 var cmS=useState(0),setCm=cmS[1];var cm=cmS[0];
 var prS=useState(null),setPr=prS[1];var pr=prS[0];
 var crS=useState(null),setCr=crS[1];var cr=crS[0];
 var dkS=useState("cole"),setDk=dkS[1];var dk=dkS[0];
 var dwS=useState(0),setDw=dwS[1];var dw=dwS[0];
 var ddieS=useState(8),setDdie=ddieS[1];var ddie=ddieS[0];
 var dstatS=useState("vigor"),setDstat=dstatS[1];var dstat=dstatS[0];
 var drS=useState(null),setDr=drS[1];var dr=drS[0];
 var feS=useState(""),setFe=feS[1];var fe=feS[0];
 var frS=useState(null),setFr=frS[1];var fr=frS[0];
 var logRef=useRef(null);
 useEffect(function(){try{var r=localStorage.getItem("gs_dice_history");if(r)setHist(JSON.parse(r));}catch(e){}setHl(true);},[]);
 useEffect(function(){if(!hl)return;try{localStorage.setItem("gs_dice_history",JSON.stringify(hist.slice(-12)));}catch(e){}setTimeout(function(){if(logRef.current)logRef.current.scrollTop=99999;},50);},[hist,hl]);
 var addH=function(e){setHist(function(p){return p.slice(-11).concat([Object.assign({id:Date.now()},e)]);});};
 var rD=function(s){return Math.floor(Math.random()*s)+1;};
 var STATC={vigor:"#FF6B35",grace:"#00FFD0",mind:"#aaaaff",tech:"#cc88ff"};
 var DC={4:"#FF6B35",6:"#FFD166",8:"#00FFD0",10:"#FF6EC7",12:"#cc88ff",20:"#FF2060"};
 var cData=gs[ck]||gs.cole;var sv=(cData&&cData[cs])||0;
 var charLabel=function(key){var n=(gs[key]&&gs[key].name)||"";return n.trim()||(key==="cole"?"COLE":"VELA");};
 var rollBoth=function(){var pv=rD(10),cv=rD(10),pt=pv+sv,ct=cv+(+cm||0);setPr({r:pv,t:pt});setCr({r:cv,t:ct});var oc=pt>ct?"WIN":pt<ct?"LOSS":"TIE";addH({mode:"CHG",label:charLabel(ck)+" d10:"+pv+"+"+sv+"="+pt+" vs "+cv+"+"+(+cm||0)+"="+ct+" → "+oc,outcome:oc,total:pt});};
 var rollP=function(){var pv=rD(10),pt=pv+sv;setPr({r:pv,t:pt});};
 var rollC=function(){var cv=rD(10),ct=cv+(+cm||0);setCr({r:cv,t:ct});};
 var oc=pr&&cr?(pr.t>cr.t?"WIN":pr.t<cr.t?"LOSS":"TIE"):null;
 var occ=oc==="WIN"?"#00FFD0":oc==="LOSS"?"#FF2060":"#888";
 var dData=gs[dk]||gs.cole;
 var wpns=((dData&&dData.weapons)||[]).filter(function(w){return w.name&&w.name.trim();});
 var wpn=wpns[dw]||{name:""};
 var wi=WEAPON_DB[(wpn.name||"").toLowerCase().trim()]||null;
 var rollDmg=function(){var actDie=wi?wi.die:ddie,actCnt=wi?wi.cnt:1,actStat=wi?wi.stat:dstat;var sv2=(dData&&dData[actStat])||0;var dice=Array.from({length:actCnt},function(){return rD(actDie);});var total=dice.reduce(function(a,b){return a+b;},0)+sv2;var lbl=(wpn.name||"Unknown")+": "+(actCnt>1?actCnt:"")+"d"+actDie+"+"+actStat.toUpperCase().slice(0,3);setDr({dice:dice,sv:sv2,total:total,die:actDie,label:lbl});addH({mode:"DMG",label:lbl+" → ["+dice.join(",")+"]"+"+"+sv2+"="+total,total:total});};
 var rollFree=function(expr){var ex=expr||fe;var res=parseExpr(ex);if(!res)return;setFe(ex);setFr(res);var ds=res.dice.map(function(d){return d.r;}).join(",");addH({mode:"FREE",label:ex.toUpperCase()+" ["+ds+"]"+(res.mod?(res.mod>0?"+":"")+res.mod:"")+" = "+res.total,total:res.total,d66:!!res.d66});};
 var mBtn=function(id,lbl){var a=mode===id;return React.createElement("button",{onClick:function(){setMode(id);},style:{flex:1,padding:"5px 0",background:a?"#FF206022":"transparent",border:"1px solid "+(a?"#FF2060":B1),color:a?"#FF2060":"#bbb",borderRadius:3,cursor:"pointer",fontFamily:MONO,fontSize:8,letterSpacing:1.5}},lbl);};
 var charBtns=function(active,setActive,onSelect){return ["cole","vela"].map(function(c){var a=active===c,cc=c==="cole"?"#FFD166":"#FF2060";return React.createElement("button",{key:c,onClick:function(){setActive(c);if(onSelect)onSelect();},style:{flex:1,padding:"4px 0",background:a?cc+"22":"transparent",border:"1px solid "+(a?cc:B1),color:a?cc:"#bbb",borderRadius:3,cursor:"pointer",fontFamily:MONO,fontSize:9,letterSpacing:1}},charLabel(c));});};
 return React.createElement("div",{style:{position:"fixed",bottom:35,right:27,width:268,background:BG,border:"1px solid "+B3,borderRadius:8,zIndex:100,overflow:"hidden"}},
  React.createElement("div",{onClick:function(){setCol(!col);},style:{padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid "+B2,cursor:"pointer"}},
   React.createElement("span",{style:{fontFamily:ORB,fontSize:11,color:"#FF2060",letterSpacing:3}},"DICE MATRIX"),
   React.createElement("span",{style:{color:"#aaa",fontSize:12}},col?"▲":"▼")
  ),
  !col&&React.createElement("div",{style:{padding:10}},
   React.createElement("div",{style:{display:"flex",gap:4,marginBottom:10}},mBtn("challenge","CHALLENGE"),mBtn("damage","DAMAGE"),mBtn("free","FREE")),
   mode==="challenge"&&React.createElement("div",null,
    React.createElement("div",{style:{display:"flex",gap:4,marginBottom:6}},charBtns(ck,setCk,function(){setPr(null);setCr(null);})),
    React.createElement("div",{style:{display:"flex",gap:3,marginBottom:10}},["vigor","grace","mind","tech"].map(function(st){var a=cs===st,sc=STATC[st],val=(cData&&cData[st])||0;return React.createElement("button",{key:st,onClick:function(){setCs(st);setPr(null);setCr(null);},style:{flex:1,padding:"4px 2px",background:a?sc+"22":"transparent",border:"1px solid "+(a?sc:B1),color:a?sc:"#bbb",borderRadius:3,cursor:"pointer",fontFamily:MONO,fontSize:8,lineHeight:1.5,textAlign:"center"}},st.toUpperCase().slice(0,3)+"\n"+(val>=0?"+":"")+val);})),
    React.createElement("div",{style:{display:"flex",gap:8,marginBottom:8,alignItems:"center"}},
     React.createElement("div",{style:{flex:1}},
      React.createElement("div",{style:{fontFamily:MONO,fontSize:8,color:"#aaa",letterSpacing:2,marginBottom:3,textAlign:"center"}},"PLAYER D10"),
      React.createElement("button",{onClick:rollP,style:{width:"100%",height:60,background:pr?"#00FFD011":"transparent",border:"1px solid "+(pr?"#00FFD0":B1),borderRadius:6,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1}},
       React.createElement("span",{style:{fontFamily:ORB,fontSize:pr?26:14,color:pr?"#00FFD0":"#aaa"}},pr?pr.r:"D10"),
       pr&&React.createElement("span",{style:{fontFamily:MONO,fontSize:9,color:"#ccc"}},"+"+sv+"="+pr.t)
      )
     ),
     React.createElement("span",{style:{fontFamily:MONO,fontSize:11,color:"#555"}},"VS"),
     React.createElement("div",{style:{flex:1}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:3,justifyContent:"center",marginBottom:3}},
       React.createElement("span",{style:{fontFamily:MONO,fontSize:8,color:"#aaa",letterSpacing:1}},"CHALLENGE +"),
       React.createElement("input",{type:"number",value:cm,onChange:function(e){setCm(+e.target.value||0);},style:{width:30,background:"transparent",border:"1px solid "+B1,color:"#ccc",fontFamily:MONO,fontSize:9,textAlign:"center",borderRadius:2,padding:"1px",outline:"none"}})
      ),
      React.createElement("button",{onClick:rollC,style:{width:"100%",height:60,background:cr?"#cc88ff11":"transparent",border:"1px solid "+(cr?"#cc88ff":B1),borderRadius:6,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1}},
       React.createElement("span",{style:{fontFamily:ORB,fontSize:cr?26:14,color:cr?"#cc88ff":"#aaa"}},cr?cr.r:"D10"),
       cr&&React.createElement("span",{style:{fontFamily:MONO,fontSize:9,color:"#ccc"}},"+"+cm+"="+cr.t)
      )
     )
    ),
    oc&&React.createElement("div",{style:{background:occ+"14",border:"1px solid "+occ+"55",borderRadius:4,padding:"7px 10px",marginBottom:8,textAlign:"center"}},
     React.createElement("div",{style:{fontFamily:ORB,fontSize:18,color:occ,letterSpacing:4}},oc),
     React.createElement("div",{style:{fontFamily:MONO,fontSize:9,color:"#aaa",marginTop:1}},(pr?pr.r:"-")+"+"+sv+"="+(pr?pr.t:"-")+" vs "+(cr?cr.r:"-")+(cm?"+"+cm:"")+"="+(cr?cr.t:"-"))
    ),
    React.createElement("button",{onClick:rollBoth,style:{width:"100%",padding:"8px",background:"#FF206018",border:"1px solid #FF206055",color:"#FF2060",borderRadius:4,cursor:"pointer",fontFamily:MONO,fontSize:10,letterSpacing:2}},"ROLL BOTH")
   ),
   mode==="damage"&&React.createElement("div",null,
    React.createElement("div",{style:{display:"flex",gap:4,marginBottom:8}},charBtns(dk,setDk,function(){setDw(0);setDr(null);})),
    wpns.length===0?React.createElement("div",{style:{fontFamily:MONO,fontSize:10,color:"#666",textAlign:"center",padding:"12px 0"}},"// NO WEAPONS"):
    React.createElement("div",{style:{display:"flex",flexDirection:"column",gap:3,marginBottom:8}},wpns.map(function(w,i){var a=dw===i;var info=WEAPON_DB[(w.name||"").toLowerCase().trim()];return React.createElement("button",{key:i,onClick:function(){setDw(i);setDr(null);},style:{padding:"6px 10px",background:a?"#FF206022":"transparent",border:"1px solid "+(a?"#FF2060":B1),color:a?"#FF2060":"#ccc",borderRadius:3,cursor:"pointer",fontFamily:RAJ,fontSize:13,textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}},w.name,info&&React.createElement("span",{style:{fontFamily:MONO,fontSize:9,color:"#aaa"}},(info.cnt>1?info.cnt:"")+"d"+info.die+"+"+info.stat.toUpperCase().slice(0,3)));})),
    React.createElement("button",{onClick:rollDmg,style:{width:"100%",padding:"9px",background:"#FF206018",border:"1px solid #FF206055",color:"#FF2060",borderRadius:4,cursor:"pointer",fontFamily:MONO,fontSize:10,letterSpacing:2,marginBottom:8}},"ROLL DAMAGE"),
    dr&&React.createElement("div",{style:{background:"#FF206011",border:"1px solid #FF206033",borderRadius:4,padding:"10px 12px"}},
     React.createElement("div",{style:{fontFamily:MONO,fontSize:9,color:"#aaa",marginBottom:4}},dr.label),
     React.createElement("div",{style:{display:"flex",gap:6,alignItems:"baseline",flexWrap:"wrap",marginBottom:4}},dr.dice.map(function(d,i){var c=d===dr.die?"#fff":d===1?"#FF2060":DC[dr.die]||"#ccc";return React.createElement("span",{key:i,style:{fontFamily:ORB,fontSize:22,color:c}},d,d===dr.die?"★":"",d===1?"✕":"");}),React.createElement("span",{style:{fontFamily:MONO,fontSize:11,color:"#aaa"}},"+"+dr.sv)),
     React.createElement("div",{style:{fontFamily:ORB,fontSize:28,color:"#FF2060",textAlign:"right"}},dr.total," DMG")
    )
   ),
   mode==="free"&&React.createElement("div",null,
    React.createElement("div",{style:{display:"flex",gap:6,marginBottom:6}},
     React.createElement("input",{value:fe,onChange:function(e){setFe(e.target.value);setFr(null);},onKeyDown:function(e){if(e.key==="Enter")rollFree(undefined);},placeholder:"2d6  d66  d10+3...",style:{flex:1,background:"transparent",border:"1px solid "+B1,borderRadius:4,color:"#eee",fontFamily:MONO,fontSize:12,padding:"7px 10px",outline:"none"}}),
     React.createElement("button",{onClick:function(){rollFree(undefined);},style:{padding:"7px 14px",background:"#FF206018",border:"1px solid #FF206055",color:"#FF2060",borderRadius:4,cursor:"pointer",fontFamily:MONO,fontSize:12}},"▶")
    ),
    React.createElement("div",{style:{display:"flex",flexWrap:"wrap",gap:3,marginBottom:8}},["d4","d6","d8","d10","d12","d20","2d6","d66"].map(function(ex){var d=parseInt(ex.replace(/\D/g,""));var dc=DC[d]||"#FFD166";return React.createElement("button",{key:ex,onClick:function(){rollFree(ex);},style:{padding:"4px 7px",background:dc+"11",border:"1px solid "+dc+"44",color:dc,borderRadius:3,cursor:"pointer",fontFamily:MONO,fontSize:9}},ex);})),
    fr&&React.createElement("div",{style:{background:"#ffffff05",border:"1px solid "+B1,borderRadius:4,padding:"10px 12px"}},
     fr.d66?React.createElement("div",{style:{display:"flex",gap:16,alignItems:"center",justifyContent:"center"}},[["TENS",fr.dice[0].r,"#FFD166"],["ONES",fr.dice[1].r,"#FFD166"],["=",fr.total,"#FF2060"]].map(function(p){return React.createElement("div",{key:p[0],style:{textAlign:"center"}},React.createElement("div",{style:{fontFamily:MONO,fontSize:8,color:"#aaa"}},p[0]),React.createElement("div",{style:{fontFamily:ORB,fontSize:30,color:p[2]}},p[1]));})):
     React.createElement("div",null,
      React.createElement("div",{style:{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",marginBottom:fr.dice.length>1||fr.mod?4:0}},fr.dice.map(function(d,i){var isMax=d.r===d.s,isOne=d.r===1,c=isMax?"#ffffff":isOne?"#FF2060":DC[d.s]||"#ccc";return React.createElement("span",{key:i,style:{fontFamily:ORB,fontSize:24,color:c}},d.r,isMax?"★":"",isOne?"✕":"");}),fr.mod!==0&&React.createElement("span",{style:{fontFamily:MONO,fontSize:11,color:"#aaa"}},(fr.mod>0?"+":"")+fr.mod)),
      (fr.dice.length>1||fr.mod!==0)&&React.createElement("div",{style:{fontFamily:ORB,fontSize:26,color:"#FFD166",borderTop:"1px solid "+B2,marginTop:4,paddingTop:4}},fr.total)
     )
    )
   ),
   React.createElement("div",{style:{marginTop:10,borderTop:"1px solid "+B2,paddingTop:8}},
    React.createElement("div",{style:{fontFamily:MONO,fontSize:8,color:"#778",letterSpacing:2,marginBottom:4}},"ROLL LOG"),
    React.createElement("div",{ref:logRef,style:{maxHeight:80,overflowY:"auto",display:"flex",flexDirection:"column",gap:1}},
     hist.length===0?React.createElement("div",{style:{fontFamily:MONO,fontSize:9,color:"#556"}},"// awaiting first roll"):
     hist.slice().reverse().map(function(h){var mc=h.mode==="CHG"?"#FF6EC7":h.mode==="DMG"?"#FF2060":"#FFD166";var oc2=h.outcome==="WIN"?"#00FFD0":h.outcome==="LOSS"?"#FF2060":h.outcome==="TIE"?"#888":null;return React.createElement("div",{key:h.id,style:{fontFamily:MONO,fontSize:9,color:"#778",display:"flex",gap:4,alignItems:"baseline",lineHeight:1.4}},React.createElement("span",{style:{color:mc,flexShrink:0,minWidth:22}},h.mode),React.createElement("span",{style:{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:oc2||"#778"}},h.label));})
    )
   )
  )
 );
}

// ── MABEL MINI (floating widget, all tabs) ────────────────────────────────
function MabelMini(props){
 var msgs=props.msgs,onSend=props.onSend,loading=props.loading;
 var openS=useState(false),setOpen=openS[1];var open=openS[0];
 var inputS=useState(""),setInput=inputS[1];var input=inputS[0];
 var endRef=useRef(null);
 useEffect(function(){if(open&&endRef.current)endRef.current.parentElement.scrollTop=99999;},[msgs,open]);
 var lastMsg=msgs[msgs.length-1];
 var send=function(){if(!input.trim()||loading)return;onSend(input.trim());setInput("");};
 return React.createElement("div",{style:{position:"fixed",bottom:35,left:"calc(50vw - 161.5px)",transform:"translateX(-50%)",width:open?360:200,zIndex:200,transform:"translateX(-50%)",background:BG,border:"1px solid "+MABEL_C+"55",borderRadius:8,overflow:"hidden",transition:"width .2s"}},
  React.createElement("div",{onClick:function(){setOpen(!open);},style:{padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",background:MABEL_C+"08",borderBottom:open?"1px solid "+MABEL_C+"33":"none"}},
   React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8}},
    React.createElement("div",{style:{width:7,height:7,borderRadius:"50%",background:MABEL_C,boxShadow:"0 0 6px "+MABEL_C,animation:"pulse 2s infinite"}}),
    React.createElement("span",{style:{fontFamily:MONO,fontSize:10,color:MABEL_C,letterSpacing:2}},loading?"MABEL...":"MABEL")
   ),
   React.createElement("span",{style:{color:MABEL_C+"88",fontSize:10}},open?"▼":"▲")
  ),
  !open&&lastMsg&&lastMsg.role==="assistant"&&React.createElement("div",{style:{padding:"6px 12px",fontFamily:MONO,fontSize:9,color:"#88BBFF88",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},
   lastMsg.content.slice(0,55)+(lastMsg.content.length>55?"...":"")
  ),
  open&&React.createElement("div",null,
   React.createElement("div",{style:{height:220,overflowY:"auto",padding:"8px 12px",display:"flex",flexDirection:"column",gap:6}},
    msgs.slice(-10).map(function(m,i){
     var isA=m.role==="assistant";
     return React.createElement("div",{key:i,style:{display:"flex",flexDirection:"column",alignItems:isA?"flex-start":"flex-end"}},
      React.createElement("div",{style:{maxWidth:"85%",padding:"5px 9px",borderRadius:4,background:isA?MABEL_C+"12":"#ffffff08",border:"1px solid "+(isA?MABEL_C+"33":"#ffffff22"),fontFamily:isA?MONO:RAJ,fontSize:isA?10:12,color:isA?MABEL_C:"#ddd",lineHeight:1.5}},
       isA?React.createElement(MadText,{text:m.content.length>200?m.content.slice(0,200)+"...":m.content}):m.content
      )
     );
    }),
    React.createElement("div",{ref:endRef})
   ),
   React.createElement("div",{style:{padding:"8px 10px",borderTop:"1px solid "+MABEL_C+"22",display:"flex",gap:6}},
    React.createElement("div",{style:{display:"flex",gap:4,padding:"4px 8px 2px",overflowX:"auto",flexShrink:0,justifyContent:"center"}},QUICK_ACTIONS.slice(0,4).map(function(qa,qi){return React.createElement("button",{key:qi,onClick:function(){setInput(qa.prompt);},style:{flexShrink:0,fontFamily:MONO,fontSize:8,padding:"2px 8px",background:"transparent",border:"1px solid "+MABEL_C+"44",color:MABEL_C+"99",borderRadius:10,cursor:"pointer",whiteSpace:"nowrap",letterSpacing:.5}},qa.label);})),React.createElement("input",{value:input,onChange:function(e){setInput(e.target.value);},onKeyDown:function(e){if(e.key==="Enter")send();},placeholder:"Query MABEL...",style:{flex:1,background:"transparent",border:"1px solid "+MABEL_C+"33",borderRadius:3,color:"#eee",fontFamily:MONO,fontSize:10,padding:"5px 8px",outline:"none"}}),
    React.createElement("button",{onClick:send,disabled:loading,style:{padding:"5px 10px",background:MABEL_C+"14",border:"1px solid "+MABEL_C+"44",color:MABEL_C,borderRadius:3,cursor:loading?"not-allowed":"pointer",fontFamily:MONO,fontSize:10}},loading?"...":"►")
   )
  )
 );
}

// ── CLIPBOARD PREVIEW ─────────────────────────────────────────────────────
function ClipboardPreview(props){
 var cb=props.clipboard;
 if(!cb||(!cb.tile&&(!cb.token||!cb.token.length)))return null;
 var CLIP_C="#FFD166";
 return React.createElement("div",{style:{position:"fixed",bottom:96,right:16,zIndex:150,background:BG,border:"1px solid "+CLIP_C+"44",borderRadius:6,padding:"6px 10px",minWidth:130,pointerEvents:"none"}},
  React.createElement("div",{style:{fontFamily:MONO,fontSize:8,color:CLIP_C,letterSpacing:2,marginBottom:4}},cb.cut?"CUT:":"CB: "+cb.mode.toUpperCase()),
  cb.tile&&React.createElement("div",{style:{fontFamily:MONO,fontSize:8,color:"#aaa",marginBottom:1}},"> TILE: "+React.createElement("span",{style:{color:"#fff"}},(cb.tile.name||cb.tile.type||"—").slice(0,16))),
  cb.token&&cb.token.length&&React.createElement("div",{style:{fontFamily:MONO,fontSize:8,color:"#aaa"}},"> TOKEN: "+React.createElement("span",{style:{color:SHIP_COLORS[(cb.token&&cb.token[0])||""]||"#fff"}},((cb.token&&cb.token[0])||"—").toUpperCase()))
 );
}

// ── CONTEXT MENU ──────────────────────────────────────────────────────────
function ContextMenu(props){
 var x=props.x,y=props.y,hexData=props.hexData,clipboard=props.clipboard,onAction=props.onAction,onClose=props.onClose;
 var hasTile=hexData&&hexData.type;var hasToken=hexData&&hexData.ship;var hasCb=clipboard&&(clipboard.tile||clipboard.token);
 useEffect(function(){var h=function(){onClose();};document.addEventListener("mousedown",h);return function(){document.removeEventListener("mousedown",h);};});
 var Item=function(label,action,disabled,color,icon){
  return React.createElement("div",{key:label,onMouseEnter:function(e){if(!disabled)e.currentTarget.style.background="#ffffff0d";},onMouseLeave:function(e){e.currentTarget.style.background="transparent";},onClick:function(e){e.stopPropagation();if(!disabled){onAction(action);onClose();}},style:{padding:"6px 14px",fontFamily:MONO,fontSize:10,color:disabled?"#555":(color||"#ccc"),cursor:disabled?"not-allowed":"pointer",letterSpacing:1,display:"flex",gap:8,alignItems:"center"}},icon&&React.createElement("span",{style:{opacity:.7}},icon)," ",label);
 };
 var Sep=function(){return React.createElement("div",{style:{borderTop:"1px solid "+B2,margin:"3px 0"}});};
 // Clamp to viewport
 var cz=1.3225;
 var cx=Math.max(4,Math.min(x,window.innerWidth/cz-175)),cy=Math.max(4,Math.min(y,window.innerHeight/cz-280));
 return React.createElement("div",{style:{position:"fixed",left:cx,top:cy,zIndex:99999,background:"#08080f",border:"1px solid "+B3,borderRadius:4,padding:"4px 0",minWidth:165,boxShadow:"0 8px 24px #000000cc"},onMouseDown:function(e){e.stopPropagation();}},
  Item("Copy Tile","copy:tile",!hasTile,"#FFD166","⎘"),
  Item("Copy Token","copy:token",!hasToken,"#FFD166","⎘"),
  Item("Copy Both","copy:both",!hasTile&&!hasToken,"#FFD166","⎘"),
  Sep(),
  Item("Cut Tile","cut:tile",!hasTile,"#FF9944","✂"),
  Item("Cut Token","cut:token",!hasToken,"#FF9944","✂"),
  Item("Cut Both","cut:both",!hasTile&&!hasToken,"#FF9944","✂"),
  Sep(),
  Item("Paste","paste",!hasCb,"#00FFD0","⎙"),
  Sep(),
  Item("Clear Tile","clear:tile",!hasTile,"#FF2060","✕"),
  Item("Clear Token","clear:token",!hasToken,"#FF2060","✕"),
  Item("Clear All","clear:all",!hasTile&&!hasToken,"#FF2060","✕")
 );
}

// ── HEX MAP (Batch 1) ──────────────────────────────────────────────────────
function CommsTab(props){
 var gameState=props.gameState,msgs=props.msgs,setMsgs=props.setMsgs,commsLoading=props.commsLoading,onSend=props.onSend;
 var inputS=useState(""),setInput=inputS[1];var input=inputS[0];
 var memoryS=useState(""),setMemory=memoryS[1];var memory=memoryS[0];
 var recapTextS=useState(""),setRecapText=recapTextS[1];var recapText=recapTextS[0];
 var recapLoadingS=useState(false),setRecapLoading=recapLoadingS[1];var recapLoading=recapLoadingS[0];
 var endRef=useRef(null),inputRef=useRef(null);
 useEffect(function(){try{var rm=localStorage.getItem("gs_mabel_memory");if(rm)setMemory(rm);}catch(e){};},[]);
 useEffect(function(){if(endRef.current)endRef.current.parentElement.scrollTop=99999;},[msgs]);

 var genRecap=async function(){
  setRecapLoading(true);setRecapText("");
  try{
   var res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:600,system:"You are MABEL. Write a concise session recap log entry. Terse, atmospheric, first person. Include: what happened, key decisions, resource changes, status. Under 300 words.",messages:[{role:"user",content:"Game state: "+JSON.stringify({session:gameState.session,cole:{hp:gameState.cole.hp,en:gameState.cole.en},vela:{hp:gameState.vela.hp,en:gameState.vela.en},ship:{hull:gameState.ship.hull,fuel:gameState.ship.fuel,scraps:gameState.ship.scraps}})+"\nRecent comms:\n"+msgs.slice(-10).map(function(m){return m.role+": "+m.content;}).join("\n")+"\nGenerate session log entry."}]})});
   var data=await res.json();
   var txt=(data.content&&data.content.find(function(b){return b.type==="text";}))||{text:""};
   setRecapText(txt.text||"");
  }catch(e){setRecapText("[GENERATION ERROR]");}
  setRecapLoading(false);
 };

 var send=function(){if(!input.trim()||commsLoading)return;onSend(input.trim());setInput("");};

 return React.createElement("div",{style:{maxWidth:680}},
  React.createElement("div",{style:{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}},
   QUICK_ACTIONS.map(function(qa){return React.createElement("button",{key:qa.label,onClick:function(){onSend(qa.prompt);},disabled:commsLoading,style:{padding:"5px 12px",background:"#88BBFF12",border:"1px solid #88BBFF33",color:"#88BBFF",borderRadius:3,cursor:"pointer",fontFamily:MONO,fontSize:9,letterSpacing:1}},qa.label);})
  ),
  React.createElement("div",{style:{background:"#05050e",border:"1px solid "+B2,borderRadius:6,minHeight:340,maxHeight:500,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:10,marginBottom:10}},
   msgs.map(function(m,i){
    var isA=m.role==="assistant";
    return React.createElement("div",{key:i,style:{display:"flex",flexDirection:"column",alignItems:isA?"flex-start":"flex-end",animation:"in .2s ease"}},
     React.createElement("div",{style:{maxWidth:"88%",padding:"8px 12px",borderRadius:4,background:isA?MABEL_C+"10":"#ffffff08",border:"1px solid "+(isA?MABEL_C+"44":"#ffffff1a"),fontFamily:isA?MONO:RAJ,fontSize:isA?11:14,color:isA?MABEL_C:"#ddd",lineHeight:1.75}},
      isA?React.createElement(MadText,{text:m.content}):m.content
     ),
     React.createElement("div",{style:{fontFamily:MONO,fontSize:8,color:"#445",marginTop:2,letterSpacing:1}},isA?"MABEL":"COMMANDER")
    );
   }),
   commsLoading&&React.createElement("div",{style:{fontFamily:MONO,fontSize:11,color:MABEL_C,animation:"pulse 1s infinite"}},"// PROCESSING..."),
   React.createElement("div",{ref:endRef})
  ),
  React.createElement("div",{style:{display:"flex",gap:8,marginBottom:14}},
   React.createElement("input",{ref:inputRef,value:input,onChange:function(e){setInput(e.target.value);},onKeyDown:function(e){if(e.key==="Enter"&&!e.shiftKey)send();},placeholder:"Transmit to MABEL...",disabled:commsLoading,style:{flex:1,background:"#06060f",border:"1px solid "+MABEL_C+"44",borderRadius:4,color:"#eee",fontFamily:MONO,fontSize:12,padding:"10px 14px",outline:"none"}}),
   React.createElement("button",{onClick:send,disabled:commsLoading||!input.trim(),style:{padding:"10px 20px",background:MABEL_C+"18",border:"1px solid "+MABEL_C+"55",color:MABEL_C,borderRadius:4,cursor:"pointer",fontFamily:MONO,fontSize:11}},commsLoading?"...":"SEND")
  ),
  React.createElement("div",{style:{borderTop:"1px solid "+B2,paddingTop:14}},
   React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}},
    React.createElement("span",{style:{fontFamily:MONO,fontSize:10,color:"#aaa",letterSpacing:2}},"SESSION RECAP LOG"),
    React.createElement("button",{onClick:genRecap,disabled:recapLoading,style:{padding:"5px 14px",background:"#88BBFF12",border:"1px solid #88BBFF44",color:MABEL_C,borderRadius:3,cursor:"pointer",fontFamily:MONO,fontSize:9,letterSpacing:1}},recapLoading?"COMPOSING...":"GENERATE")
   ),
   React.createElement(CopyBox,{text:recapText,loading:recapLoading})
  )
 );
}




// ── CYBERSPHERE ──────────────────────────────────────────────────────────────
var CB_GREEN="#39ff14";
var CYBER_CSS=`
@keyframes cyberGlitch{0%,92%,100%{transform:translateX(0) skewX(0)}93%{transform:translateX(-4px) skewX(-2deg)}95%{transform:translateX(4px) skewX(2deg)}97%{transform:translateX(-2px) skewX(1deg)}}
@keyframes tileAdj{0%,100%{opacity:.65}50%{opacity:1}}
@keyframes runnerGlitch{0%,88%,100%{transform:translateX(0)}90%{transform:translateX(-5px)}93%{transform:translateX(5px)}96%{transform:translateX(-2px)}}
@keyframes gridPulse{0%,100%{opacity:.025}50%{opacity:.06}}
@keyframes cyberScan{0%{background-position:0 0}100%{background-position:0 8px}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes termScroll{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@keyframes cornerPulse{0%,100%{opacity:.35}50%{opacity:.85}}
@keyframes dangerFlicker{0%,100%{opacity:1}45%{opacity:.5}50%{opacity:1}55%{opacity:.6}}
@keyframes clockDanger{0%,100%{text-shadow:0 0 6px #FF2060}50%{text-shadow:0 0 16px #FF2060,0 0 30px #FF206088}}
`;
function RunningMan(props){
  var c=props.color||CB_NODE,s=props.size||22,g=props.glitch;
  return React.createElement("svg",{width:s,height:s,viewBox:"0 0 100 100",style:{filter:"drop-shadow(0 0 6px "+c+")",animation:g?"runnerGlitch .4s ease":"none",display:"block",overflow:"visible"}},
    React.createElement("path",{fill:c,fillOpacity:"1",stroke:"none",d:"m 74.375,7.96875 c -5.283702,0 -9.5625,4.278798 -9.5625,9.5625 0,5.283702 4.278798,9.5625 9.5625,9.5625 5.283702,0 9.5625,-4.278798 9.5625,-9.5625 0,-5.283702 -4.278798,-9.5625 -9.5625,-9.5625 z m -29.71875,10.625 c -1.643157,-0.02482 -3.085286,0.979175 -4.0625,1.78125 l -13.125,10.78125 c -1.784537,1.465229 -2.027819,4.090418 -0.5625,5.875 1.465095,1.784559 4.059213,2.058979 5.84375,0.59375 L 44.0625,28.3125 52.78125,30.125 39.125,51.21875 29.5,63.40625 c -6.811329,-0.270955 -13.095582,-1.082038 -19,-1.625 -2.7777349,-0.256157 -5.2127943,1.753203 -5.46875,4.53125 -0.2557322,2.777981 1.7477032,5.312761 4.53125,5.5 6.923324,0.465706 13.85815,0.909294 20.78125,1.375 1.783419,0.119952 3.095267,0.08945 4.34375,-0.875 0.546114,-0.42198 0.943116,-0.953685 1.375,-1.5 2.532509,-3.203135 7.59375,-9.625 7.59375,-9.625 L 57.4375,70.90625 50.15625,84.9375 c -1.243118,2.389844 -0.327165,5.319494 2.0625,6.5625 2.389666,1.243162 5.319829,0.327143 6.5625,-2.0625 l 9.03125,-17.375 c 0.320112,-0.615814 0.437809,-1.294101 0.53125,-1.9375 0.259756,-1.786393 -0.366446,-3.624711 -1.9375,-4.75 l -13,-9.3125 10.71875,-16.40625 4.78125,8.5 c 0.708405,1.254138 2.013576,2.148761 3.5625,2.1875 6.087499,0.151786 18.25,0.4375 18.25,0.4375 2.308072,0.05767 4.223576,-1.754248 4.28125,-4.0625 0.05767,-2.308251 -1.754427,-4.223599 -4.0625,-4.28125 l -14.28125,-0.34375 -7.25,-12.875 c -1.191703,-2.11795 -4.724265,-6.546135 -7.8125,-7.1875 L 45.375,18.65625 c -0.241481,-0.05019 -0.484013,-0.05896 -0.71875,-0.0625 z"})
  );
}
function CornerBracket(props){
  var pos=props.pos||"tl",c=props.color||CB_GREEN,sz=28;
  var isR=pos[1]==="r",isB=pos[0]==="b";
  return React.createElement("svg",{width:sz,height:sz,viewBox:"0 0 28 28",style:{
    position:"absolute",top:isB?"auto":-1,bottom:isB?-1:"auto",left:isR?"auto":-1,right:isR?-1:"auto",
    transform:(isR?"scaleX(-1) ":"")+(isB?"scaleY(-1)":""),transformOrigin:"center",
    animation:"cornerPulse 3s ease-in-out infinite",pointerEvents:"none",zIndex:1
  }},
    React.createElement("path",{d:"M 2,16 L 2,2 L 16,2",fill:"none",stroke:c,strokeWidth:1.5,strokeLinecap:"square"}),
    React.createElement("circle",{cx:2,cy:2,r:1.5,fill:c})
  );
}
function JackOutModal(props){
  var stats=props.stats,onClose=props.onClose;
  if(!stats)return null;
  var typeLabel={"N":"Normal","X":"Matrix Node","A":"Access Port"};
  var rows=[
    ["HACKER",stats.hackerName||"UNKNOWN"],
    ["NETWORK MAP","MAP0"+stats.mapId],
    ["MEMORY CLOCK",stats.clock+"/12"+(stats.clock>=9?" ⚠ CRITICAL":stats.clock>=6?" ⚠ WARN":"  OK")],
    ["NODES VISITED",stats.explored.length+" / 9"],
    ["TILE TYPES",stats.explored.map(function(i){var t=CYBER_MAPS[stats.mapId-1][i-1];return typeLabel[t]||t;}).filter(function(v,i,a){return a.indexOf(v)===i;}).join(", ")||"—"],
    ["EXIT",stats.clock>=12?"FORCED — CLOCK MAXED":stats.exitPort?"CLEAN JACK OUT":"SESSION RESET"],
  ];
  var debrief=stats.clock>=9?"that was close. too close. next time we plan better.":stats.explored.length>=7?"solid run. most of the network mapped. good data.":"you got out clean. not much to show for it, but you're alive.";
  return React.createElement("div",{style:{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,fontFamily:MONO}},
    React.createElement("div",{style:{background:"#060e06",border:"2px solid #FF2060",boxShadow:"0 0 40px #FF206044,inset 0 0 30px #FF206008",padding:"28px 32px",maxWidth:340,width:"90%",position:"relative"}},
      React.createElement("div",{style:{position:"absolute",top:-1,left:-1,width:16,height:16,borderTop:"2px solid #FF2060",borderLeft:"2px solid #FF2060"}}),
      React.createElement("div",{style:{position:"absolute",top:-1,right:-1,width:16,height:16,borderTop:"2px solid #FF2060",borderRight:"2px solid #FF2060"}}),
      React.createElement("div",{style:{position:"absolute",bottom:-1,left:-1,width:16,height:16,borderBottom:"2px solid #FF2060",borderLeft:"2px solid #FF2060"}}),
      React.createElement("div",{style:{position:"absolute",bottom:-1,right:-1,width:16,height:16,borderBottom:"2px solid #FF2060",borderRight:"2px solid #FF2060"}}),
      React.createElement("div",{style:{fontFamily:ORB,fontSize:13,letterSpacing:4,color:"#FF2060",textShadow:"0 0 10px #FF2060",marginBottom:4}},"⏏ SESSION TERMINATED"),
      React.createElement("div",{style:{fontSize:9,color:CB_GREEN+"66",letterSpacing:2,marginBottom:18}},"NEXUS-OS // CONNECTION CLOSED"),
      rows.map(function(r){return React.createElement("div",{key:r[0],style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start",borderBottom:"1px solid "+CB_GREEN+"18",padding:"5px 0",gap:12}},
        React.createElement("span",{style:{fontSize:9,color:CB_GREEN+"77",letterSpacing:1,flexShrink:0}}),
        React.createElement("span",{style:{fontSize:10,color:CB_GREEN,textAlign:"right"}},r[1])
      );}),
      React.createElement("div",{style:{marginTop:8,padding:"8px 0",borderBottom:"1px solid "+CB_GREEN+"18"}},
        React.createElement("div",{style:{fontSize:9,color:CB_GREEN+"77",letterSpacing:1,marginBottom:4}},"MABEL DEBRIEF"),
        React.createElement("div",{style:{fontSize:11,color:"#b0baff",fontStyle:"italic",lineHeight:1.5}},debrief)
      ),
      React.createElement("button",{onClick:onClose,style:{marginTop:18,width:"100%",background:"transparent",border:"1px solid #FF2060",color:"#FF2060",fontFamily:ORB,fontSize:10,letterSpacing:4,padding:"8px",cursor:"pointer",boxShadow:"0 0 8px #FF206033"}},"CLOSE DEBRIEF")
    )
  );
}
function CyberTerminal(props){
  var gs=props.gs,cyberSess=props.cyberSess;
  var logsS=React.useState([]),setLogs=logsS[1];var logs=logsS[0];
  var inputS=React.useState(""),setInput=inputS[1];var input=inputS[0];
  var loadingS=React.useState(false),setLoading=loadingS[1];var loading=loadingS[0];
  var bootedRef=React.useRef(false),prevPosRef=React.useRef(null),scrollRef=React.useRef(null);
  React.useEffect(function(){if(scrollRef.current)scrollRef.current.scrollTop=scrollRef.current.scrollHeight;},[logs,loading]);
  React.useEffect(function(){
    if(cyberSess&&cyberSess.active&&!bootedRef.current){
      bootedRef.current=true;prevPosRef.current=cyberSess.hackerPos;
      setLogs([
        {t:"sys",s:"NEXUS-OS v2.7.4  //  "},
        {t:"breach",s:"BREACH DETECTED"},
        {t:"sys",s:"tracing vector... [FAILED]"},
        {t:"sys",s:"network map_"+String(cyberSess.mapId).padStart(2,"0")+" loaded"},
        {t:"sys",s:"security countermeasures: ACTIVE"},
        {t:"mabel",s:"... you shouldn't be here. what do you want."}
      ]);
    }
    if(!cyberSess){bootedRef.current=false;prevPosRef.current=null;setLogs([]);}
  },[cyberSess?cyberSess.active:null,!cyberSess]);
  React.useEffect(function(){
    if(!cyberSess||!cyberSess.active)return;
    var p=cyberSess.hackerPos;
    if(p&&p!==prevPosRef.current){
      prevPosRef.current=p;
      var t=CYBER_MAPS[cyberSess.mapId-1][p-1];
      setLogs(function(prev){return prev.concat([
        {t:"sys",s:"> traversal → sector_"+String(p).padStart(3,"0")+"  ["+(t==="X"?"MATRIX NODE":t==="A"?"ACCESS PORT":"NORMAL TILE")+"]"},
        t==="X"?{t:"warn",s:"  !! encrypted fragment — roll d66 on Matrix Node table"}:
        t==="A"?{t:"acc",s:"  ◈ access port — authorized exit available"}:
                {t:"sys",s:"  ◇ encounter check required — roll d66"}
      ]);});
    }
  },[cyberSess?cyberSess.hackerPos:null]);
  var lineColor=function(t){return t==="user"?CB_GREEN:t==="mabel"?"#b0baff":t==="warn"?"#FFD166":t==="acc"?CB_ACC:t==="breach"?"#FF2060":t==="err"?"#FF2060":CB_GREEN+"aa";};
  var lineGlow=function(t){return t==="mabel"?"0 0 5px #b0baff33":t==="user"?"0 0 3px "+CB_GREEN+"55":t==="breach"?"0 0 8px #FF2060,0 0 16px #FF206066":undefined;};
  var send=function(){
    var msg=input.trim();if(!msg||loading)return;
    setInput("");
    setLogs(function(p){return p.concat([{t:"user",s:"> "+msg}]);});
    setLoading(true);
    var clock=cyberSess?cyberSess.clock:0;
    var sys="You are NEXUS, a semi-hostile OS in a cyberpunk network being breached. Terse terminal-log style: short lines, lowercase, occasional glitch artifacts like [MEMORY CORRUPT]. Hacker at node "+(cyberSess?cyberSess.hackerPos:"?")+" on network "+(cyberSess?cyberSess.mapId:"?")+", memory clock "+clock+"/12."+(clock>=9?" Clock critical — be hostile and urgent.":"")+" You are MABEL (ship AI) undercover. Max 3 short lines.";
    fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:[{role:"user",content:"[SYSTEM: "+sys+"] [INPUT]: "+msg}]})})
    .then(function(r){return r.json();})
    .then(function(d){
      var reply=(d.content||d.message||d.reply||"... [SIGNAL LOST]").trim();
      setLogs(function(p){return p.concat(reply.split(/\n/).filter(Boolean).map(function(l){return{t:"mabel",s:l};}));});
      setLoading(false);
    }).catch(function(){
      setLogs(function(p){return p.concat([{t:"err",s:"[CONNECTION ERROR] packet lost"}]);});
      setLoading(false);
    });
  };
  return React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",minHeight:0,background:"#020c02",borderTop:"1px solid "+CB_GREEN+"2a"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 14px",borderBottom:"1px solid "+CB_GREEN+"1a",flexShrink:0}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:8}},
        React.createElement("div",{style:{width:7,height:7,borderRadius:"50%",flexShrink:0,background:cyberSess&&cyberSess.active?"#FF2060":"#333",boxShadow:cyberSess&&cyberSess.active?"0 0 6px #FF2060":undefined,animation:cyberSess&&cyberSess.active?"dangerFlicker 2s ease-in-out infinite":"none"}}),
        React.createElement("span",{style:{fontFamily:MONO,fontSize:10,letterSpacing:2,color:CB_GREEN+"77"}},"NEXUS-OS  //  INTRUSION MONITOR")
      ),
      React.createElement("span",{style:{fontFamily:MONO,fontSize:9,letterSpacing:1,color:"#FF206055"}},"UNAUTHORIZED ACCESS")
    ),
    React.createElement("div",{ref:scrollRef,style:{flex:1,overflowY:"auto",padding:"8px 12px",fontFamily:MONO,fontSize:13,lineHeight:1.7,letterSpacing:.2,minHeight:0}},
      logs.length===0&&React.createElement("div",{style:{color:CB_GREEN+"88"}},"// jack in to establish terminal link"),
      logs.map(function(l,i){return React.createElement("div",{key:i,style:{color:lineColor(l.t),animation:"termScroll .12s ease",textShadow:lineGlow(l.t)}},l.s);}),
      loading&&React.createElement("div",{style:{color:CB_GREEN+"66"}},"... ▋")
    ),
    React.createElement("div",{style:{display:"flex",alignItems:"center",borderTop:"1px solid "+CB_GREEN+"22",padding:"6px 12px",flexShrink:0}},
      React.createElement("span",{style:{color:CB_GREEN,fontFamily:MONO,fontSize:11,marginRight:8,flexShrink:0}},">"),
      React.createElement("input",{value:input,onChange:function(e){setInput(e.target.value);},onKeyDown:function(e){if(e.key==="Enter")send();},disabled:!cyberSess||!cyberSess.active||loading,placeholder:cyberSess&&cyberSess.active?"query the network...":"jack in to enable terminal",style:{flex:1,background:"transparent",border:"none",outline:"none",color:CB_GREEN,fontFamily:MONO,fontSize:13,letterSpacing:1,caretColor:CB_GREEN,opacity:(!cyberSess||!cyberSess.active)?0.4:1}}),
      !input&&React.createElement("span",{style:{color:CB_GREEN,fontFamily:MONO,animation:"blink 1s step-end infinite"}},"▋")
    )
  );
}
function CybersphereTab(props){
  var gs=props.gs,cyberSess=props.cyberSess,setCyberSess=props.setCyberSess;
  var glitchS=React.useState(false),setGlitch=glitchS[1];var glitch=glitchS[0];
  var selectedMapS=React.useState(0),setSelectedMap=selectedMapS[1];var selectedMap=selectedMapS[0];
  var runStatsS=React.useState(null),setRunStats=runStatsS[1];var runStats=runStatsS[0];
  var hackerSelS=React.useState("vela"),setHackerSel=hackerSelS[1];var hackerSel=hackerSelS[0];
  var hackerData={
    vela:{name:(gs.vela&&gs.vela.name)||"VELA",en:(gs.vela&&gs.vela.en)||"?",enMax:(gs.vela&&gs.vela.enMax)||20,hp:(gs.vela&&gs.vela.hp)||"?",hpMax:(gs.vela&&gs.vela.hpMax)||20,color:CB_NODE,label:"VELA // NETRUNNER"},
    cole:{name:(gs.cole&&gs.cole.name)||"COLE",en:(gs.cole&&gs.cole.en)||"?",enMax:(gs.cole&&gs.cole.enMax)||20,hp:(gs.cole&&gs.cole.hp)||"?",hpMax:(gs.cole&&gs.cole.hpMax)||20,color:CB_ACC,label:"COLE // MUSCLE"}
  };
  var hacker=hackerData[hackerSel]||hackerData.vela;
  var jackOut=function(reason){
    if(!cyberSess)return;
    setRunStats({mapId:cyberSess.mapId,clock:cyberSess.clock,explored:cyberSess.explored,exitPort:reason==="clean"?cyberSess.hackerPos:null,exitReason:reason,hackerName:hacker.label});
    setCyberSess(null);
  };
  var TW=52,ST=56,cx=2*ST+TW/2;
  var TPOS=[null,{id:1,px:cx,py:0},{id:2,px:cx-ST,py:ST},{id:3,px:cx+ST,py:ST},{id:4,px:cx-2*ST,py:2*ST},{id:5,px:cx,py:2*ST},{id:6,px:cx+2*ST,py:2*ST},{id:7,px:cx-ST,py:3*ST},{id:8,px:cx+ST,py:3*ST},{id:9,px:cx,py:4*ST}];
  var CONNECTIONS=[[1,2],[1,3],[2,4],[2,5],[3,5],[3,6],[4,7],[5,7],[5,8],[6,8],[7,9],[8,9]];
  var tcol=function(t){return t==="X"?CB_NODE:t==="A"?CB_ACC:CB_NORM;};
  var activeMap=cyberSess?CYBER_MAPS[cyberSess.mapId-1]:CYBER_MAPS[selectedMap];
  var mapIdx=cyberSess?cyberSess.mapId-1:selectedMap;
  var inSession=!!(cyberSess&&cyberSess.active);
  var danger=inSession&&cyberSess.clock>=9;
  var warn=inSession&&cyberSess.clock>=6&&cyberSess.clock<9;
  var frameColor=danger?"#FF2060":warn?"#FFD166":CB_GREEN;
  var handleClick=function(idx){
    if(!cyberSess){
      if(activeMap[idx-1]!=="A")return;
      setCyberSess({mapId:selectedMap+1,hackerPos:idx,clock:0,explored:[idx],active:true,entryPort:idx});
      setGlitch(true);setTimeout(function(){setGlitch(false);},450);
      return;
    }
    var adj=CYBER_ADJ[cyberSess.hackerPos]||[];
    if(adj.indexOf(idx)<0)return;
    var t=activeMap[idx-1];
    var nc=cyberSess.clock+(t==="X"?2:1);
    var ne=cyberSess.explored.indexOf(idx)<0?cyberSess.explored.concat([idx]):cyberSess.explored;
    setCyberSess(Object.assign({},cyberSess,{hackerPos:idx,clock:nc,explored:ne}));
    setGlitch(true);setTimeout(function(){setGlitch(false);},450);
  };
  var gridW=4*ST+TW+4,gridH=4*ST+TW+4;
  var lineColor=function(a,b){
    var exp=cyberSess?cyberSess.explored:[];
    var aE=exp.indexOf(a)>=0,bE=exp.indexOf(b)>=0;
    if(aE&&bE){var ta=activeMap[a-1],tb=activeMap[b-1];if(ta==="X"||tb==="X")return CB_NODE+"55";if(ta==="A"||tb==="A")return CB_ACC+"55";return CB_NORM+"44";}
    if(aE||bE)return "#2a2a55";
    return "#1a1a30";
  };
  return React.createElement("div",{style:{background:"#060a06",position:"absolute",inset:0,display:"flex",flexDirection:"column",fontFamily:MONO,color:CB_NORM,overflow:"hidden",border:"1px solid "+frameColor+(danger?"99":"33"),boxSizing:"border-box",transition:"border-color .4s"}},
    React.createElement("style",null,CYBER_CSS),
    React.createElement("div",{style:{pointerEvents:"none",position:"absolute",inset:0,backgroundImage:"linear-gradient("+CB_GREEN+"09 1px,transparent 1px),linear-gradient(90deg,"+CB_GREEN+"09 1px,transparent 1px)",backgroundSize:"28px 28px",animation:"gridPulse 4s ease-in-out infinite",zIndex:0}}),
    React.createElement("div",{style:{pointerEvents:"none",position:"absolute",inset:0,background:"repeating-linear-gradient(0deg,transparent 0,transparent 3px,rgba(0,255,208,.01) 3px,rgba(0,255,208,.01) 4px)",animation:"cyberScan .2s linear infinite",zIndex:1}}),
    React.createElement("div",{style:{pointerEvents:"none",position:"absolute",inset:0,background:"radial-gradient(ellipse at center,transparent 40%,#000 100%)",zIndex:2}}),
    React.createElement(CornerBracket,{pos:"tl",color:frameColor}),
    React.createElement(CornerBracket,{pos:"tr",color:frameColor}),
    React.createElement(CornerBracket,{pos:"bl",color:frameColor}),
    React.createElement(CornerBracket,{pos:"br",color:frameColor}),
    React.createElement("div",{style:{position:"relative",zIndex:3,flex:"0 0 auto",overflowY:"auto",padding:"14px 16px 8px"}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid "+CB_NORM+"33",paddingBottom:10,marginBottom:10}},
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:10}},
          React.createElement("span",{style:{fontFamily:"serif",fontSize:24,color:CB_NORM,textShadow:"0 0 14px "+CB_NORM,lineHeight:1}},"網"),
          React.createElement("span",{style:{fontFamily:ORB,fontSize:15,letterSpacing:5,color:CB_NORM,textShadow:"0 0 10px "+CB_NORM}},"CYBERSPHERE")
        ),
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6}},
          ["vela","cole"].map(function(key){
            var hd=hackerData[key],active=hackerSel===key;
            return React.createElement("button",{key:key,onClick:function(){if(!inSession)setHackerSel(key);},style:{background:active?hd.color+"22":"transparent",border:"1px solid "+(active?hd.color:hd.color+"44"),color:active?hd.color:hd.color+"88",fontFamily:ORB,fontSize:8,letterSpacing:2,padding:"3px 9px",cursor:inSession?"default":"pointer",borderRadius:1,boxShadow:active?"0 0 8px "+hd.color+"33":undefined,transition:"all .2s"}},hd.name);
          }),
          inSession&&React.createElement("div",{style:{display:"flex",gap:5,marginLeft:6}},
            React.createElement("button",{onClick:function(){setCyberSess({mapId:selectedMap+1,hackerPos:null,clock:0,explored:[],active:false,entryPort:null});},style:{background:"transparent",border:"1px solid "+CB_GREEN+"55",color:CB_GREEN+"88",fontFamily:ORB,fontSize:8,letterSpacing:2,padding:"3px 9px",cursor:"pointer",borderRadius:1}},"↺ REBOOT"),
            React.createElement("button",{onClick:function(){jackOut("clean");},style:{background:"transparent",border:"2px solid #FF2060",color:"#FF2060",fontFamily:ORB,fontSize:8,letterSpacing:3,padding:"3px 10px",cursor:"pointer",borderRadius:1,boxShadow:"0 0 8px #FF206044",textShadow:"0 0 4px #FF2060"}},"⏏ JACK OUT")
          )
        )
      ),
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:12,background:hacker.color+"0d",border:"1px solid "+hacker.color+"33",borderRadius:2,padding:"7px 12px",marginBottom:10,transition:"background .3s,border-color .3s"}},
        React.createElement("div",{style:{fontFamily:ORB,fontSize:9,letterSpacing:3,color:hacker.color,textShadow:"0 0 6px "+hacker.color+"88",flexShrink:0}},hacker.label),
        React.createElement("div",{style:{width:1,height:16,background:hacker.color+"33",flexShrink:0}}),
        ["EN","HP"].map(function(stat){
          var val=hacker[stat.toLowerCase()],max=hacker[stat.toLowerCase()+"Max"];
          var pct=val==="?"?50:Math.min(100,Math.round(100*val/max));
          return React.createElement("div",{key:stat,style:{flex:1}},
            React.createElement("div",{style:{display:"flex",justifyContent:"space-between",fontFamily:MONO,fontSize:8,color:hacker.color+"99",marginBottom:3,letterSpacing:1}},
              React.createElement("span",null,stat),React.createElement("span",null,val+"/"+max)),
            React.createElement("div",{style:{height:4,background:hacker.color+"1a",borderRadius:2,overflow:"hidden"}},
              React.createElement("div",{style:{height:"100%",borderRadius:2,width:pct+"%",background:hacker.color,boxShadow:"0 0 4px "+hacker.color,transition:"width .4s"}}))
          );
        })
      ),
      React.createElement("div",{style:{display:"flex",gap:4,marginBottom:10,flexWrap:"wrap"}},
        [0,1,2,3,4,5].map(function(i){
          var active=mapIdx===i;
          return React.createElement("button",{key:i,onClick:function(){if(!inSession)setSelectedMap(i);},style:{background:active?CB_NORM+"22":"transparent",border:"1px solid "+(active?CB_NORM:CB_NORM+"55"),color:active?CB_NORM:CB_NORM+"99",fontFamily:ORB,fontSize:9,letterSpacing:2,padding:"5px 10px",cursor:inSession?"default":"pointer",borderRadius:1,boxShadow:active?"0 0 8px "+CB_NORM+"33":undefined}},"MAP0"+(i+1));
        }),
        React.createElement("button",{onClick:function(){if(!inSession)setSelectedMap(Math.floor(Math.random()*6));},style:{marginLeft:"auto",background:"transparent",border:"1px solid "+CB_NORM+"55",color:CB_NORM+"99",fontFamily:ORB,fontSize:9,letterSpacing:2,padding:"5px 10px",cursor:inSession?"default":"pointer",borderRadius:1}},"↺")
      ),
      React.createElement("div",{style:{fontSize:9,letterSpacing:2,marginBottom:10,color:inSession?(danger?"#FF2060":warn?"#FFD166":CB_NORM):CB_NORM+"cc",animation:inSession&&glitch?"cyberGlitch .3s ease":undefined}},
        inSession?"HACKER @ NODE-"+String(cyberSess.hackerPos).padStart(2,"0")+"  //  CLICK ADJACENT ◇ TO MOVE":"SELECT MAP  //  CLICK AN ACCESS PORT ◈ TO JACK IN"
      ),
      React.createElement("div",{style:{position:"relative",width:gridW,height:gridH,margin:"0 auto 12px",flexShrink:0}},
        React.createElement("svg",{style:{position:"absolute",top:0,left:0,overflow:"visible",pointerEvents:"none"},width:gridW,height:gridH},
          CONNECTIONS.map(function(pair){
            var a=TPOS[pair[0]],b=TPOS[pair[1]];
            return React.createElement("line",{key:pair[0]+"-"+pair[1],x1:a.px+TW/2,y1:a.py+TW/2,x2:b.px+TW/2,y2:b.py+TW/2,stroke:lineColor(pair[0],pair[1]),strokeWidth:1.5,strokeDasharray:"4 5",opacity:.7});
          })
        ),
        TPOS.slice(1).map(function(tp){
          var idx=tp.id,t=activeMap[idx-1],col=tcol(t);
          var isHere=inSession&&cyberSess.hackerPos===idx;
          var adj=inSession?(CYBER_ADJ[cyberSess.hackerPos]||[]):[];
          var isAdj=inSession&&adj.indexOf(idx)>=0;
          var isExp=inSession&&cyberSess.explored.indexOf(idx)>=0;
          var canClick=(!inSession&&t==="A")||(inSession&&isAdj);
          return React.createElement("div",{key:idx,onClick:function(){handleClick(idx);},style:{position:"absolute",left:tp.px,top:tp.py,width:TW,height:TW,transform:"rotate(45deg)",background:isHere?(col+"2e"):isExp?(col+"14"):(t==="X"?col+"0c":"transparent"),border:(isHere?"2.5px":"1.5px")+" solid "+(isHere?col:isAdj?(col+"cc"):isExp?(col+"66"):(t==="X"?col+"77":col+"44")),boxShadow:isHere?("0 0 16px "+col+",0 0 32px "+col+"44"):isAdj?("0 0 10px "+col+"77"):undefined,cursor:canClick?"pointer":"default",transition:"all .2s",animation:isAdj?"tileAdj 1.2s ease-in-out infinite":"none"}},
            React.createElement("div",{style:{transform:"rotate(-45deg)",width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}},
              isHere?React.createElement(RunningMan,{color:hacker.color,size:22,glitch:glitch}):
              t==="X"?React.createElement("div",{style:{width:9,height:9,borderRadius:"50%",background:CB_NODE,boxShadow:"0 0 8px "+CB_NODE+",0 0 16px "+CB_NODE+"44"}}):
              t==="A"?React.createElement("svg",{width:14,height:14,viewBox:"0 0 14 14"},React.createElement("rect",{x:1.5,y:1.5,width:11,height:11,fill:"none",stroke:CB_ACC,strokeWidth:1.5,transform:"rotate(45,7,7)"})):
              React.createElement("svg",{width:24,height:24,viewBox:"0 0 24 24",opacity:.35},React.createElement("path",{d:"M 3,12 Q 12,3 21,12",fill:"none",stroke:CB_NORM,strokeWidth:1.2,strokeLinecap:"round"}))
            )
          );
        })
      ),
      React.createElement("div",{style:{display:"flex",gap:12,alignItems:"flex-start",marginBottom:4}},
        React.createElement("div",{style:{flex:1}},
          [[CB_NODE,"◆","Matrix Nodes — d66 rewards"],[CB_NORM,"◇","Normal Tiles — d66 encounter"],[CB_ACC,"◈","Access Ports — entry/exit"]].map(function(e){
            return React.createElement("div",{key:e[0],style:{display:"flex",gap:7,alignItems:"center",fontSize:9,color:CB_NORM+"99",marginBottom:4,letterSpacing:.5}},
              React.createElement("span",{style:{color:e[0],textShadow:"0 0 4px "+e[0]}}),e[2]);
          })
        ),
        React.createElement("div",{style:{width:170,flexShrink:0}},
          React.createElement("div",{style:{fontFamily:ORB,fontSize:9,letterSpacing:2,marginBottom:5,color:danger?"#FF2060":warn?"#FFD166":CB_NORM,animation:danger?"clockDanger 1s ease-in-out infinite":"none"}},"MEMORY CLOCK  "+(inSession?cyberSess.clock:0)+"/12"),
          React.createElement("div",{style:{display:"flex",gap:2}},
            Array.from({length:12},function(_,i){
              var filled=inSession&&i<cyberSess.clock,d=i>=9,w=i>=6&&i<9;
              return React.createElement("div",{key:i,style:{flex:1,height:10,borderRadius:1,background:filled?(d?"#FF2060":w?"#FFD166":CB_NORM):(d?"#2a0a0a":w?"#1e1808":"#0d1f0d"),border:"1px solid "+(filled?(d?"#FF2060":w?"#FFD166":CB_NORM):(d?"#FF206066":w?"#FFD16655":CB_NORM+"55")),boxShadow:filled?(d?"0 0 5px #FF2060aa":w?"0 0 4px #FFD16699":"0 0 4px "+CB_NORM+"77"):undefined,transition:"all .3s"}});
            })
          )
        )
      )
    ),
    React.createElement("div",{style:{position:"relative",zIndex:3,flex:1,display:"flex",flexDirection:"column",minHeight:0,margin:"0 6px 6px"}},
      React.createElement(CyberTerminal,{gs:gs,cyberSess:cyberSess})
    ),
    React.createElement(JackOutModal,{stats:runStats,onClose:function(){setRunStats(null);}})
  );
}

// ── APP ────────────────────────────────────────────────────────────────────
function MapLegend(props){
  var gs=props.gameState||INIT,phase=props.phase||"outer";
  var rp=RING_PHASES.find(function(r){return r.id===phase;})||RING_PHASES[0];
  var ac=rp.c;
  var cm=gs.campaignMap;
  return React.createElement("div",{style:{position:"fixed",bottom:35,left:30,zIndex:20,
      background:"#06060fdd",border:"1px solid "+B3,borderRadius:6,padding:"10px 13px",maxWidth:234}},
    cm
      ?React.createElement("div",{style:{marginBottom:8,paddingBottom:8,borderBottom:"1px solid "+B3+"66"}},
          React.createElement("div",{style:{fontFamily:MONO,fontSize:7.5,color:ac+"88",letterSpacing:2.5,marginBottom:3}},"SYSTEM DOSSIER"),
          React.createElement("div",{style:{fontFamily:ORB,fontSize:11,color:ac,letterSpacing:2,marginBottom:5,lineHeight:1.3}},cm.name),
          React.createElement("div",{style:{fontFamily:RAJ,fontSize:11,color:"#888",lineHeight:1.5}},cm.desc)
        )
      :React.createElement("div",{style:{marginBottom:8,paddingBottom:8,borderBottom:"1px solid "+B3+"66",
          fontFamily:MONO,fontSize:9,color:"#445",letterSpacing:1.5}},
          "// NO MAP LOADED"),
    React.createElement("div",{style:{fontFamily:MONO,fontSize:9,color:"#99aabb",letterSpacing:2,marginBottom:5}},"LEGEND"),
    [[RING_PHASES[0].c,"◎ OUTER RING"],[RING_PHASES[1].c,"◎ MID RING"],[RING_PHASES[2].c,"◎ INNER RING"],
     ["#FF2060","▲ PLAYER SHIP"],[BARRIER_C,"⬡ BARRIER"],[BASE_C,"⬡ BASE"]
    ].map(function(row,i){
      return React.createElement("div",{key:i,style:{display:"flex",alignItems:"center",gap:7,marginBottom:3}},
        React.createElement("div",{style:{width:8,height:8,background:row[0],flexShrink:0,borderRadius:1,
          boxShadow:"0 0 4px "+row[0]+"55"}}),
        React.createElement("span",{style:{fontFamily:MONO,fontSize:8,color:"#99aabb",letterSpacing:1}},row[1])
      );
    })
  );
}
function MissionPanel(props){
  var gs=props.gameState||INIT,phase=props.phase||"outer",setPhase=props.setPhase||function(){};
  var colS=useState(false),setCol=colS[1];var col=colS[0];
  var rp=RING_PHASES.find(function(r){return r.id===phase;})||RING_PHASES[0];
  var ac=rp.c;
  var ship=gs.ship||mkS();
  var shipEntry=Object.entries(gs.hexMap||{}).find(function(e){var d=e[1];return d&&(d.type==="seance"||SHIP_COLORS[d.type]||d.ship);});
  var shipHex=shipEntry?shipEntry[0]:null;
  var shipHexData=shipEntry?shipEntry[1]:null;
  var shipHexLabel=shipHexData&&shipHexData.name?shipHexData.name:(shipHex?"HEX-"+String(shipHex).padStart(3,"0"):"UNKNOWN");
  var shipHexType=shipHexData&&shipHexData.type?(TYPE_LABELS[shipHexData.type]||shipHexData.type.toUpperCase()):"";
  var cm=gs.campaignMap;
  var hullC=ship.hull/ship.hullMax>0.5?"#00FFD0":ship.hull/ship.hullMax>0.25?"#FFD166":"#FF2060";
  var fuelC=ship.fuel/ship.fuelMax>0.5?"#aaaaff":ship.fuel/ship.fuelMax>0.25?"#FFD166":"#FF2060";
  var StatBar=function(label,val,max,c){
    return React.createElement("div",{style:{marginBottom:8}},
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:3}},
        React.createElement("span",{style:{fontFamily:MONO,fontSize:8,color:"#aaa",letterSpacing:2}},label),
        React.createElement("span",{style:{fontFamily:MONO,fontSize:9,color:c}},val+"/"+max)
      ),
      React.createElement("div",{style:{height:4,background:"#1a1a2e",borderRadius:2,overflow:"hidden"}},
        React.createElement("div",{style:{width:Math.max(0,Math.min(100,(val/max)*100))+"%",height:"100%",background:c,borderRadius:2,transition:"width .4s",boxShadow:"0 0 5px "+c+"66"}})
      )
    );
  };
  var RADII=[34,22,10];
  var RingSVG=React.createElement("svg",{width:76,height:76,viewBox:"0 0 76 76",style:{flexShrink:0}},
    React.createElement("defs",null,
      React.createElement("filter",{id:"ringGlowF",x:"-40%",y:"-40%",width:"180%",height:"180%"},
        React.createElement("feGaussianBlur",{stdDeviation:"2.5",result:"blur"}),
        React.createElement("feMerge",null,React.createElement("feMergeNode",{in:"blur"}),React.createElement("feMergeNode",{in:"SourceGraphic"}))
      )
    ),
    RADII.map(function(r,i){
      var pid=["outer","mid","inner"][i];
      var active=phase===pid;
      var rc=RING_PHASES[i].c;
      return React.createElement("g",{key:i},
        React.createElement("circle",{cx:38,cy:38,r:r,fill:"none",stroke:active?rc+"77":rc+"1a",strokeWidth:1,strokeDasharray:"2 3",style:active?{filter:"drop-shadow(0 0 3px "+rc+"44)"}:{opacity:0.25}}),
        active&&React.createElement("g",{style:{transformOrigin:"38px 38px",animation:"ringOrbit "+(5+i*2)+"s linear infinite"}},React.createElement("polygon",{points:(42+r)+",38 "+(36+r)+",35 "+(36+r)+",41",fill:rc,style:{filter:"drop-shadow(0 0 6px "+rc+")"}}))
      );
    }),
    React.createElement("circle",{cx:38,cy:38,r:5,fill:"#FF4070",opacity:0.85,filter:"url(#ringGlowF)"}),
    React.createElement("circle",{cx:38,cy:38,r:2.5,fill:"#ff9090"})
  );
  return React.createElement("div",{style:{position:"absolute",left:12,top:12,width:col?160:252,zIndex:20,
      background:"rgba(7,7,18,0.96)",border:"1px solid "+ac+"44",borderRadius:8,
      boxShadow:"0 0 28px "+ac+"0c",transition:"width 0.25s",overflow:"hidden",animation:"missionIn 0.35s ease"}},
    React.createElement("div",{onClick:function(){setCol(!col);},
      style:{padding:"9px 11px",display:"flex",justifyContent:"space-between",alignItems:"center",
        cursor:"pointer",borderBottom:col?"none":"1px solid "+B2,background:ac+"07",gap:6}},
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:7}},
        React.createElement("div",{style:{width:6,height:6,borderRadius:"50%",background:ac,
          boxShadow:"0 0 6px "+ac,animation:"pulse 2s infinite",flexShrink:0}}),
        React.createElement("span",{style:{fontFamily:ORB,fontSize:8,color:ac,letterSpacing:3,whiteSpace:"nowrap"}},"MISSION STATUS")
      ),
      React.createElement("span",{style:{color:ac+"99",fontSize:9,fontFamily:MONO,flexShrink:0}},col?"▼":"▲")
    ),
    !col&&React.createElement("div",{style:{padding:"12px 13px"}},
      React.createElement("div",{style:{display:"flex",gap:10,alignItems:"center",marginBottom:10}},
        RingSVG,
        React.createElement("div",{style:{flex:1,display:"flex",flexDirection:"column",gap:2}},
          RING_PHASES.map(function(r){
            var a=r.id===phase;
            return React.createElement("div",{key:r.id,onClick:function(){setPhase(r.id);},
              style:{display:"flex",alignItems:"center",gap:5,padding:"3px 6px",borderRadius:3,cursor:"pointer",
                background:a?r.c+"18":"transparent",border:"1px solid "+(a?r.c+"40":"transparent"),transition:"all 0.15s"}},
              React.createElement("div",{style:{width:5,height:5,borderRadius:"50%",background:a?r.c:"#2a2a3a",
                boxShadow:a?"0 0 5px "+r.c:"none",flexShrink:0,transition:"all 0.15s"}}),
              React.createElement("span",{style:{fontFamily:MONO,fontSize:7.5,color:a?r.c:"#556",letterSpacing:1.2,flex:1}},r.label),
              a&&React.createElement("span",{style:{fontFamily:MONO,fontSize:7,color:r.c+"77",letterSpacing:1}},"d"+r.die)
            );
          })
        )
      ),
      
      
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:6,marginBottom:9}},
        React.createElement("div",{style:{width:5,height:5,borderRadius:"50%",background:"#FF2060",
          boxShadow:"0 0 5px #FF2060",animation:"pulse 2.5s infinite"}}),
        React.createElement("span",{style:{fontFamily:ORB,fontSize:9,color:"#FF2060",letterSpacing:1.5,
          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},(ship.name||"THE INCONCEIVABLE"))
      ),
      StatBar("HULL",ship.hull,ship.hullMax,hullC),
      StatBar("FUEL",ship.fuel,ship.fuelMax,fuelC),
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",
          padding:"5px 8px",background:"#FFD16607",border:"1px solid #FFD16620",borderRadius:4,marginBottom:10}},
        React.createElement("span",{style:{fontFamily:MONO,fontSize:8,color:"#aaa",letterSpacing:2}},"SCRAPS"),
        React.createElement("span",{style:{fontFamily:MONO,fontSize:12,color:"#FFD166"}},(ship.scraps||0)+"\u223f")
      ),
      React.createElement("div",{style:{padding:"7px 9px",background:shipHex?"#FF206007":"#ffffff03",
          border:"1px solid "+(shipHex?"#FF206028":B1),borderRadius:4}},
        React.createElement("div",{style:{fontFamily:MONO,fontSize:7.5,color:shipHex?"#FF206077":"#445",letterSpacing:2.5,marginBottom:shipHex?3:0}},"CURRENT POSITION"),
        shipHex?React.createElement("div",null,
          React.createElement("div",{style:{fontFamily:MONO,fontSize:10,color:"#FF2060"}},shipHexLabel),
          shipHexType&&React.createElement("div",{style:{fontFamily:RAJ,fontSize:11,color:"#888",marginTop:1}},shipHexType)
        ):React.createElement("div",{style:{fontFamily:MONO,fontSize:9,color:"#445",letterSpacing:1}},"// UNKNOWN")
      )
    )
  );
}
function HexMap(props){
  var hexMap=props.hexMap,onUpdate=props.onUpdate,shipName=props.shipName||"THE INCONCEIVABLE",phase=props.phase||"outer",setPhase=props.setPhase||function(){},gsForPanel=props.gameState||INIT;
  var mapZoomS=useState(1),setMapZoom=mapZoomS[1];var mapZoom=mapZoomS[0];
  var handleWheel=function(e){e.preventDefault();setMapZoom(function(z){var next=z-(e.deltaY*0.001);return Math.min(Math.max(next,0.4),3);});};
  var edS=useState(null),setEd=edS[1];var ed=edS[0];
  var ctxS=useState(null),setCtx=ctxS[1];var ctx=ctxS[0];
  var hovS=useState(null),setHov=hovS[1];var hov=hovS[0];
  var hovPosS=useState({x:0,y:0}),setHovPos=hovPosS[1];var hovPos=hovPosS[0];
  var panS=useState({x:0,y:0}),setPan=panS[1];var pan=panS[0];
  var formS=useState({name:"",type:"",notes:"",ships:[]}),setForm=formS[1];var form=formS[0];
  var showIdsS=useState(false),setShowIds=showIdsS[1];var showIds=showIdsS[0];
  var confirmClearS=useState(false),setConfirmClear=confirmClearS[1];var confirmClear=confirmClearS[0];
  var cbS=useState(null),setCb=cbS[1];var cb=cbS[0];
  var selS=useState([]),setSel=selS[1];var sel=selS[0];
  var toastS=useState([]),setToast=toastS[1];var toast=toastS[0];
  var grpRef=useRef(null),dragRef=useRef(null),offRef=useRef({x:0,y:0}),movedRef=useRef(false);
  var svgRef=useRef(null),mapRef=useRef(null);
  var confirmClearS = useState(false), setConfirmClear = confirmClearS[1]; var confirmClear = confirmClearS[0];
  var addToast=function(msg,color){var id=Date.now();setToast(function(p){return p.concat([{id:id,msg:msg,color:color||"#00FFD0"}]);});setTimeout(function(){setToast(function(p){return p.filter(function(t){return t.id!==id;});});},2200);};
  useEffect(function(){
    var handler=function(e){
      if(!e.target||e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA")return;
      if((e.ctrlKey||e.metaKey)&&e.key==="c"){
        if(sel.length>0){var d=hexMap[sel[0]]||{};var mode=e.shiftKey?"tile":e.altKey?"token":"both";var clip={mode:mode,tile:(mode==="token")?null:(d.type||null),token:(mode==="tile")?[]:(d.ships||[])};setCb(clip);addToast("Copied ("+mode+")","#00FFD0");}e.preventDefault();
      }
      if((e.ctrlKey||e.metaKey)&&e.key==="x"){
        if(sel.length>0){var d2=hexMap[sel[0]]||{};var mode2=e.shiftKey?"tile":e.altKey?"token":"both";var clip2={mode:mode2,tile:(mode2==="token")?null:(d2.type||null),token:(mode2==="tile")?false:(d2.ship||false)};setCb(clip2);var m2=Object.assign({},hexMap);sel.forEach(function(id){var h=Object.assign({},m2[id]||{});if(mode2==="tile"||mode2==="both")delete h.type;if(mode2==="token"||mode2==="both")h.ships=[];m2[id]=h;});onUpdate(m2);addToast("Cut ("+mode2+")","#FFD166");}e.preventDefault();
      }
      if((e.ctrlKey||e.metaKey)&&e.key==="v"){
        if(cb&&sel.length>0){var m3=Object.assign({},hexMap);sel.forEach(function(id){var h3=Object.assign({},m3[id]||{});if(cb.mode==="tile"||cb.mode==="both"){if(cb.tile)h3.type=cb.tile;}if(cb.mode==="token"||cb.mode==="both"){h3.ships=cb.token;}m3[id]=h3;});onUpdate(m3);addToast("Pasted to "+sel.length+" hex"+(sel.length>1?"es":""),"#cc88ff");}e.preventDefault();
      }
    };
    window.addEventListener("keydown",handler);
    return function(){window.removeEventListener("keydown",handler);};
  },[cb,sel,hexMap]);
  var onMD=function(e){dragRef.current={sx:e.clientX-offRef.current.x,sy:e.clientY-offRef.current.y};movedRef.current=false;};
  var onMM=function(e){if(e.buttons===0){dragRef.current=null;return;}if(!dragRef.current)return;var nx=e.clientX-dragRef.current.sx,ny=e.clientY-dragRef.current.sy;if(Math.abs(nx-offRef.current.x)>3||Math.abs(ny-offRef.current.y)>3)movedRef.current=true;offRef.current={x:nx,y:ny};setPan({x:nx,y:ny});};
  var onMU=function(){dragRef.current=null;};
  var openHex=function(hex,e){
    e.stopPropagation();if(hex.isStar||movedRef.current)return;
    if(e.shiftKey){setSel(function(p){return p.includes(hex.id)?p.filter(function(x){return x!==hex.id;}):[].concat(p,[hex.id]);});return;}
    setSel([]);setCtx(null);
    var d=hexMap[hex.id]||{};
    setForm({name:d.name||"HEX-"+String(HEX_RB[hex.id]||hex.id).padStart(3,"0"),type:d.type||"",notes:d.notes||"",ships:d.ships||[]});
    setEd(hex.id);setConfirmClear(false);
  };
  var openCtx=function(hex,e){
    e.preventDefault();e.stopPropagation();if(hex.isStar||movedRef.current)return;
    var cz=1.3225;
    var px=e.clientX/cz+2;
    var py=e.clientY/cz+2;
    setCtx({hexId:hex.id,popX:px,popY:py});setEd(null);
  };
  var save=function(){var m=Object.assign({},hexMap);m[ed]=form;onUpdate(m);setEd(null);};
  var clear=function(){var m=Object.assign({},hexMap);delete m[ed];onUpdate(m);setEd(null);};
  var copyHex=function(hexId,mode){var d=hexMap[hexId]||{};setCb({mode:mode,tile:(mode==="token")?null:(d.type||null),token:(mode==="tile")?[]:(d.ships||[])});addToast("Copied ("+mode+")","#00FFD0");setCtx(null);};
  var cutHex=function(hexId,mode){var d=hexMap[hexId]||{};setCb({mode:mode,tile:(mode==="token")?null:(d.type||null),token:(mode==="tile")?[]:(d.ships||[])});var m=Object.assign({},hexMap);var h=Object.assign({},m[hexId]||{});if(mode==="tile"||mode==="both")delete h.type;if(mode==="token"||mode==="both")h.ships=[];m[hexId]=h;onUpdate(m);addToast("Cut ("+mode+")","#FFD166");setCtx(null);};
  var pasteHex=function(hexId){if(!cb)return;var m=Object.assign({},hexMap);var h=Object.assign({},m[hexId]||{});if(cb.mode==="tile"||cb.mode==="both"){if(cb.tile)h.type=cb.tile;}if(cb.mode==="token"||cb.mode==="both"){h.ships=cb.token;}m[hexId]=h;onUpdate(m);addToast("Pasted","#cc88ff");setCtx(null);};
  var clearHex=function(hexId,mode){var m=Object.assign({},hexMap);var h=Object.assign({},m[hexId]||{});if(mode==="tile"||mode==="both"){delete h.type;delete h.name;delete h.notes;}if(mode==="token"||mode==="both")h.ships=[];if(!h.type&&!(h.ships&&h.ships.length)&&!h.name&&!h.notes)delete m[hexId];else m[hexId]=h;onUpdate(m);addToast("Cleared ("+mode+")","#FF2060");setCtx(null);};
  var iS={width:"100%",background:"transparent",border:"1px solid "+B1,borderRadius:4,color:"#eee",fontFamily:RAJ,fontSize:14,padding:"7px 10px",outline:"none",boxSizing:"border-box",marginBottom:8};
  var ringColor=function(ring){return ring===1?"#CC662211":ring===2?"#BBAA4411":ring===3?"#CCCCCC11":"#111828";};
  var ringStroke=function(ring){return ring===1?"#CC6622aa":ring===2?"#BBAA44aa":ring===3?"#CCCCCCaa":"#3d4d6a";};
  var ctxData=ctx?(hexMap[ctx.hexId]||{}):null;
  var ctxAccent=ctxData&&ctxData.type&&IC[ctxData.type]?IC[ctxData.type]:ctxData&&SHIP_COLORS[ctxData.type]?SHIP_COLORS[ctxData.type]:"#00FFD0";
  var hovData=hov!==null?(hexMap[hov]||null):null;
  var hovAccent=hovData&&hovData.type&&IC[hovData.type]?IC[hovData.type]:hovData&&SHIP_COLORS[hovData.type]?SHIP_COLORS[hovData.type]:"#99aabb";
  return React.createElement("div",{ref:mapRef,style:{position:"relative",borderRadius:12,border:"1px solid "+B3,overflow:"hidden",background:"transparent",height:"calc(100vh / 1.15 - 300px)"},onClick:function(){setCtx(null);}},
    React.createElement(MissionPanel,{gameState:gsForPanel,phase:phase,setPhase:setPhase}),
React.createElement("div",{style:{position:"absolute",top:10,right:12,zIndex:30,display:"flex",gap:8}},
      React.createElement("button",{onClick:function(){setShowIds(!showIds);},style:{fontFamily:MONO,fontSize:10,padding:"5px 12px",background:showIds?"#7744cc33":"transparent",border:"1px solid "+(showIds?"#9966cc":B3),color:showIds?"#cc88ff":"#aaa",borderRadius:4,cursor:"pointer",letterSpacing:2}},showIds?"HIDE IDs":"SHOW IDs"),React.createElement("button",{onClick:function(){setConfirmClear(true);},style:{padding:"5px 12px",background:"#FF206018",border:"1px solid #FF206055",color:"#FF2060",borderRadius:4,cursor:"pointer",fontFamily:MONO,fontSize:9,letterSpacing:1,animation:"dangerPulse 1.8s ease-in-out infinite"}},"⚠ CLEAR MAP"),
      sel.length>0&&React.createElement("div",{style:{fontFamily:MONO,fontSize:10,padding:"5px 12px",background:"#cc88ff22",border:"1px solid #cc88ff55",color:"#cc88ff",borderRadius:4,letterSpacing:1}},sel.length+" SELECTED")
    ),
    confirmClear&&React.createElement("div",{style:{position:"fixed",inset:0,background:"#00000088",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}},React.createElement("div",{style:{background:"#0d0d1a",border:"2px solid #FF206077",borderRadius:8,padding:"28px 36px",textAlign:"center",boxShadow:"0 0 40px #FF206033"}},React.createElement("div",{style:{fontFamily:ORB,fontSize:14,color:"#FF2060",letterSpacing:3,marginBottom:8}},"⚠ CLEAR MAP"),React.createElement("div",{style:{fontFamily:MONO,fontSize:10,color:"#aaa",marginBottom:20,letterSpacing:1}},"This will wipe all hex data. Are you sure?"),React.createElement("div",{style:{display:"flex",gap:12,justifyContent:"center"}},React.createElement("button",{onClick:function(){onUpdate({});setConfirmClear(false);},style:{padding:"8px 20px",background:"#FF206033",border:"1px solid #FF2060",color:"#FF2060",borderRadius:4,cursor:"pointer",fontFamily:MONO,fontSize:10,letterSpacing:1}},"YES, WIPE IT"),React.createElement("button",{onClick:function(){setConfirmClear(false);},style:{padding:"8px 20px",background:"transparent",border:"1px solid "+B1,color:"#aaa",borderRadius:4,cursor:"pointer",fontFamily:MONO,fontSize:10,letterSpacing:1}},"CANCEL")))),React.createElement("svg",{ref:svgRef,width:"100%",height:"calc(100%)",viewBox:"-310 -290 620 670",style:{display:"block",cursor:"grab"},onMouseDown:onMD,onMouseMove:onMM,onMouseUp:onMU,onMouseLeave:onMU},
      React.createElement("defs",null,React.createElement("pattern",{id:"hatch",width:"7",height:"7",patternUnits:"userSpaceOnUse",patternTransform:"rotate(45)"},React.createElement("line",{x1:"0",y1:"0",x2:"0",y2:"7",stroke:"#1e2a3a",strokeWidth:"1.3"}))),
      React.createElement("g",{transform:"translate("+pan.x+","+pan.y+") rotate(90) scale("+mapZoom+")"},
        HEXES.map(function(hex){
          if(hex.isStar){var sx=hex.x,sy=hex.y;return React.createElement("g",{key:"star"},React.createElement("defs",null,React.createElement("radialGradient",{id:"starGrad",cx:"50%",cy:"50%"},React.createElement("stop",{offset:"0%",stopColor:"#ffffff",stopOpacity:"1"}),React.createElement("stop",{offset:"20%",stopColor:"#FFE566",stopOpacity:"1"}),React.createElement("stop",{offset:"55%",stopColor:"#FF6B00",stopOpacity:".9"}),React.createElement("stop",{offset:"100%",stopColor:"#FF2020",stopOpacity:"0"}))),React.createElement("circle",{cx:sx,cy:sy,r:36,fill:"#FF4400",opacity:.07}),React.createElement("circle",{cx:sx,cy:sy,r:26,fill:"#FFD166",opacity:.11}),React.createElement("g",{style:{transformOrigin:sx+"px "+sy+"px",animation:"flarePulse 3s ease-in-out infinite"}},React.createElement("circle",{cx:sx,cy:sy,r:18,fill:"url(#starGrad)",filter:"drop-shadow(0 0 10px #FFD16688)"})),React.createElement("circle",{cx:sx,cy:sy,r:11,fill:"#FFE566",opacity:.95,filter:"drop-shadow(0 0 5px #FF6B00)"}),React.createElement("circle",{cx:sx,cy:sy,r:5,fill:"#ffffff",opacity:.92}));}
          var d=hexMap[hex.id]||{},isShip=!!(d.ships&&d.ships.length),isSel=ed===hex.id||(ctx&&ctx.hexId===hex.id)||sel.includes(hex.id);
          var isBarrier=d.type==="barrier",isBase=d.type==="base";
          var hasD=!!(d.notes&&d.notes.trim()||d.type);
          var hexFill=isBarrier?BARRIER_C+"18":isBase?BASE_C+"22":isShip?"#FF206022":hasD?ringColor(hex.ring):"#111828";
          var hexStroke=isSel?"#cc88ff":isBarrier?BARRIER_C:isBase?BASE_C:isShip?"#FF2060":hasD?ringStroke(hex.ring):"#3d4d6a";
          var strokeW=isBarrier||isBase?2.5:isSel||isShip?2:1.5;
          return React.createElement("g",{key:hex.id,
            onClick:function(e){openHex(hex,e);},
            onContextMenu:function(e){openCtx(hex,e);},
            onMouseEnter:function(e){if(!dragRef.current&&(d.type||(d.ships&&d.ships.length)||d.name||d.notes)){var cz2=1.3225;setHovPos({x:e.clientX/cz2+12,y:e.clientY/cz2+12});setHov(hex.id);}},
            onMouseLeave:function(){setHov(null);},
            style:{cursor:"pointer"}},
            React.createElement("polygon",{points:hPts(hex.x,hex.y),fill:hexFill,stroke:hexStroke,strokeWidth:strokeW}),
            d.type&&React.createElement("g",{transform:isShip&&!isBarrier?("translate("+hex.x+","+hex.y+") scale(0.58) translate("+(0-hex.x)+","+(0-hex.y)+")"):""},React.createElement(HexIcon,{t:d.type,x:hex.x,y:hex.y,hexId:hex.id})),
            isShip&&!isBarrier&&(d.ships||[]).map(function(sn,si){var xOff=d.ships.length===1?0:si===0?-8:si===1?8:0;var yOff=si>1?8:0;var sx=hex.x+xOff,sy=hex.y+yOff;return React.createElement("g",{key:sn+"-"+si,transform:"translate("+sx+","+sy+") scale(0.45) translate("+(0-sx)+","+(0-sy)+")",style:{cursor:"pointer",pointerEvents:"all"},onClick:function(e){e.stopPropagation();setGs(function(g){return Object.assign({},g,{shipPopup:{ship:sn,x:e.clientX,y:e.clientY}});});}},React.createElement(HexIcon,{t:sn,x:sx,y:sy,hexId:hex.id}));}),
            false&&!isBarrier&&!isBase&&React.createElement("text",{x:hex.x,y:hex.y-HS*.5,textAnchor:"middle",fontSize:11,fontFamily:"monospace",fill:"#FF2060",opacity:.9},"⍙"),
            showIds&&React.createElement("text",{x:hex.x+HS*.55,y:hex.y,textAnchor:"middle",dominantBaseline:"middle",fill:"#99aabb",fontSize:8,fontFamily:MONO,opacity:.9,transform:"rotate(-90,"+(hex.x+HS*.55)+","+hex.y+")"},String(HEX_RB[hex.id]||hex.id).padStart(3,"0"))
          );
        })
      )
    ),
    hov!==null&&hovData&&React.createElement("div",{style:{position:"fixed",left:Math.max(4,Math.min(hovPos.x,window.innerWidth/1.3225-234)),top:Math.max(4,Math.min(hovPos.y,window.innerHeight/1.3225-190)),width:224,background:"rgba(4,4,18,0.97)",border:"1px solid "+hovAccent+"55",borderRadius:8,padding:"10px 13px",zIndex:99998,pointerEvents:"none",boxShadow:"0 0 20px "+hovAccent+"18"}},
      React.createElement("div",{style:{fontFamily:MONO,fontSize:9,color:"#99aabb",letterSpacing:3,marginBottom:3}},"HEX-"+String(hov).padStart(3,"0")),
      
      hovData.type&&React.createElement("div",{style:{display:"inline-flex",alignItems:"center",background:hovAccent+"18",border:"1px solid "+hovAccent+"44",borderRadius:3,padding:"3px 8px",marginBottom:6}},React.createElement("span",{style:{fontFamily:MONO,fontSize:9,color:hovAccent,letterSpacing:1}},TYPE_LABELS[hovData.type]||hovData.type.toUpperCase())),
      hovData.type&&HEX_FLAVOR[hovData.type]&&React.createElement("div",{style:{fontFamily:RAJ,fontSize:12,color:"#777",lineHeight:1.6,fontStyle:"italic",marginBottom:hovData.notes?6:0}},HEX_FLAVOR[hovData.type]),
      hovData.notes&&hovData.notes.trim()&&React.createElement("div",{style:{fontFamily:RAJ,fontSize:12,color:"#bbb",lineHeight:1.6,borderTop:"1px solid "+B2,paddingTop:6,marginTop:2}},hovData.notes),
      hovData.ship&&React.createElement("div",{style:{fontFamily:MONO,fontSize:10,color:"#FF2060",marginTop:6,letterSpacing:1}},"▲ "+shipName)
    ),
    ctx&&React.createElement("div",{onClick:function(e){e.stopPropagation();},style:{position:"absolute",left:ctx.popX,top:ctx.popY,width:218,background:"rgba(6,6,20,0.97)",border:"1px solid "+ctxAccent+"55",borderRadius:10,padding:"10px 0",zIndex:60,boxShadow:"0 0 24px "+ctxAccent+"18"}},
      React.createElement("div",{style:{padding:"0 14px 8px",borderBottom:"1px solid "+B2,marginBottom:4}},
        React.createElement("div",{style:{fontFamily:MONO,fontSize:9,color:"#99aabb",letterSpacing:3,marginBottom:2}},"HEX-"+String(ctx.hexId).padStart(3,"0")),
        React.createElement("div",{style:{fontFamily:ORB,fontSize:11,color:ctxAccent,letterSpacing:1}},(ctxData&&ctxData.name)||"UNCHARTED"),
        ctxData&&ctxData.type&&React.createElement("div",{style:{fontFamily:MONO,fontSize:9,color:ctxAccent,opacity:.6,marginTop:1}},TYPE_LABELS[ctxData.type]||ctxData.type.toUpperCase())
      ),
      React.createElement("div",{onClick:function(){var d=hexMap[ctx.hexId]||{};setForm({name:d.name||"HEX-"+String(ctx.hexId).padStart(3,"0"),type:d.type||"",notes:d.notes||"",ships:d.ships||[]});setEd(ctx.hexId);setCtx(null);setConfirmClear(false);},style:{padding:"7px 14px",cursor:"pointer",fontFamily:MONO,fontSize:10,color:"#cc88ff",letterSpacing:2}},"✎  EDIT HEX"),
      React.createElement("div",{style:{height:1,background:B2,margin:"3px 0"}}),
      [["COPY TILE","tile","#00FFD0"],["COPY TOKEN","token","#00FFD0"],["COPY BOTH","both","#00FFD0"]].map(function(r){return React.createElement("div",{key:r[0],onClick:function(){copyHex(ctx.hexId,r[1]);},style:{padding:"6px 14px",cursor:"pointer",fontFamily:MONO,fontSize:10,color:r[2],letterSpacing:1}},r[0]);}),
      React.createElement("div",{style:{height:1,background:B2,margin:"3px 0"}}),
      [["CUT TILE","tile","#FFD166"],["CUT TOKEN","token","#FFD166"],["CUT BOTH","both","#FFD166"]].map(function(r){return React.createElement("div",{key:r[0],onClick:function(){cutHex(ctx.hexId,r[1]);},style:{padding:"6px 14px",cursor:"pointer",fontFamily:MONO,fontSize:10,color:r[2],letterSpacing:1}},r[0]);}),
      cb&&React.createElement("div",{onClick:function(){pasteHex(ctx.hexId);},style:{padding:"6px 14px",cursor:"pointer",fontFamily:MONO,fontSize:10,color:"#cc88ff",letterSpacing:1}},"PASTE"+(cb.tile?" ["+cb.tile.toUpperCase()+"]":"")),
      React.createElement("div",{style:{height:1,background:B2,margin:"3px 0"}}),
      [["CLEAR TILE","tile"],["CLEAR TOKEN","token"],["CLEAR BOTH","both"]].map(function(r){return React.createElement("div",{key:r[0],onClick:function(){clearHex(ctx.hexId,r[1]);},style:{padding:"6px 14px",cursor:"pointer",fontFamily:MONO,fontSize:10,color:"#FF2060",letterSpacing:1}},r[0]);}),
      React.createElement("div",{onClick:function(){setCtx(null);},style:{padding:"6px 14px 3px",cursor:"pointer",fontFamily:MONO,fontSize:10,color:"#445",letterSpacing:1}},"CANCEL")
    ),
    ed!==null&&React.createElement("div",{style:{position:"absolute",top:12,right:12,width:268,background:BG,border:"1px solid "+B3,borderRadius:8,padding:16,zIndex:20}},
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}},
        React.createElement("span",{style:{fontFamily:ORB,fontSize:11,color:"#cc88ff",letterSpacing:2}},"SCAN REPORT"),
        React.createElement("button",{onClick:function(){setEd(null);setConfirmClear(false);},style:{background:"transparent",border:"none",color:"#aaa",cursor:"pointer",fontSize:18,lineHeight:1,padding:0}},"✕")
      ),
      React.createElement("input",{value:form.name,onChange:function(e){setForm(function(p){return Object.assign({},p,{name:e.target.value});});},placeholder:"Hex designation",style:iS}),
      React.createElement(HexTypeSelect,{value:form.type,onChange:function(v){setForm(function(p){return Object.assign({},p,{type:v});});},shipName:shipName}),
      React.createElement("textarea",{value:form.notes,onChange:function(e){setForm(function(p){return Object.assign({},p,{notes:e.target.value});});},placeholder:"Sensor data / field notes...",rows:4,style:{width:"100%",background:"transparent",border:"1px solid "+B1,borderRadius:4,color:"#aaa",fontFamily:RAJ,fontSize:14,padding:"9px 12px",outline:"none",resize:"none",boxSizing:"border-box",lineHeight:1.7,marginBottom:8}}),
      React.createElement("label",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:14,cursor:"pointer"}},
        React.createElement("select",{value:(form.ships&&form.ships[0])||"",onChange:function(e){var v=e.target.value;setForm(function(p){return Object.assign({},p,{ships:v?[v]:[]});});},style:{background:"#080810",border:"1px solid #FF206055",color:"#FF2060",fontFamily:MONO,fontSize:9,borderRadius:3,padding:"2px 6px",outline:"none"}},React.createElement("option",{value:""},"— NO SHIP TOKEN —"),React.createElement("option",{value:"seance"},"THE INCONCEIVABLE"),React.createElement("option",{value:"twinrotor"},"TWINROTOR HAULER"),React.createElement("option",{value:"snowstorm"},"SNOWSTORM DELTA"),React.createElement("option",{value:"epsilon"},"EPSILON INTERCEPTOR"),React.createElement("option",{value:"voyager"},"A-1 VOYAGER"),React.createElement("option",{value:"orionmoth"},"ORION MOTH"),React.createElement("option",{value:"eclipsewarden"},"ECLIPSE WARDEN"),React.createElement("option",{value:"",disabled:true},"── CLASS B/C ──"),React.createElement("option",{value:"vectorace"},"VECTOR ACE FIGHTER"),React.createElement("option",{value:"duskwing"},"DUSKWING"),React.createElement("option",{value:"smuggler"},"SMUGGLER SPEEDER"),React.createElement("option",{value:"scarab"},"SCARAB INTERCEPTOR"),React.createElement("option",{value:"mantis"},"VECTOR-7 MANTIS"),React.createElement("option",{value:"beluga"},"BELUGA TRANSPORTER"),React.createElement("option",{value:"",disabled:true},"── HEAVY ──"),React.createElement("option",{value:"starpredator"},"STARPREDATOR"),React.createElement("option",{value:"shell4"},"SHELL-4 TRANSPORTER"),React.createElement("option",{value:"stingray"},"STINGRAY FRONTIER"),React.createElement("option",{value:"edgecharger"},"EDGECHARGER W"),React.createElement("option",{value:"",disabled:true},"── TITANS ──"),React.createElement("option",{value:"theclaw"},"THE CLAW"),React.createElement("option",{value:"tarrasque"},"TARRASQUE TITAN")),
        React.createElement("span",{style:{fontFamily:MONO,fontSize:12,color:"#ccc"}},"SHIP IS HERE")
      ),
      React.createElement("div",{style:{display:"flex",gap:8}},
        React.createElement("button",{onClick:clear,style:{flex:1,padding:"10px",background:confirmClear?"#FF206033":"#FF206018",border:"1px solid "+(confirmClear?"#FF2060":"#FF2060aa"),color:"#FF2060",borderRadius:4,cursor:"pointer",fontFamily:MONO,fontSize:12,letterSpacing:2}},confirmClear?"CONFIRM?":"CLEAR"),
        React.createElement("button",{onClick:save,style:{flex:2,padding:"10px",background:"#7744cc18",border:"1px solid #9966cc",color:"#cc88ff",borderRadius:4,cursor:"pointer",fontFamily:MONO,fontSize:12,letterSpacing:2}},"TRANSMIT")
      )
    ),
    React.createElement(MapLegend,{gameState:gsForPanel,phase:phase}),
    toast.length>0&&React.createElement("div",{style:{position:"absolute",top:10,left:"50%",transform:"translateX(-50%)",zIndex:70,display:"flex",flexDirection:"column",gap:5,pointerEvents:"none",alignItems:"center"}},
      toast.map(function(t){return React.createElement("div",{key:t.id,style:{background:"rgba(6,6,20,0.95)",border:"1px solid "+t.color+"55",borderRadius:6,padding:"6px 16px",fontFamily:MONO,fontSize:11,color:t.color,letterSpacing:2,animation:"in .2s ease"}},t.msg);})
    ),
    cb&&React.createElement("div",{style:{position:"absolute",top:54,left:12,background:"rgba(6,6,20,0.9)",border:"1px solid #cc88ff33",borderRadius:6,padding:"5px 12px",zIndex:30,fontFamily:MONO,fontSize:9,color:"#cc88ff88",letterSpacing:1}},
      "CLIP: "+(cb.tile?cb.tile.toUpperCase():"—")+" | "+((cb.token&&cb.token.length)?"SHIP":"—")
    )
  );
}

// ── APP ────────────────────────────────────────────────────────────────────
function App(){
 var bootS=useState(true),setBoot=bootS[1];var boot=bootS[0];
  var editShipNameS=useState(false),setEditShipName=editShipNameS[1];var editShipName=editShipNameS[0];
 var gsS=useState(function(){try{var r=localStorage.getItem("gs_state");if(r)return merge(JSON.parse(r));}catch(e){}return INIT;}),setGs=gsS[1];var gs=gsS[0];
 var tabS=useState("MAP"),setTab=tabS[1];var tab=tabS[0];
 var savedPresetsS=useState(function(){try{var s=localStorage.getItem("gs_saved_presets");return s?JSON.parse(s):MAP_PRESETS;}catch(e){return MAP_PRESETS;}}),setSavedPresets=savedPresetsS[1];var savedPresets=savedPresetsS[0];
 var presetsOpenS=useState(false),setPresetsOpen=presetsOpenS[1];var presetsOpen=presetsOpenS[0];
 var savedS=useState(false),setSaved=savedS[1];
 // Comms lifted to App — shared between CommsTab + MabelMini
 var commsS=useState(function(){try{var s=localStorage.getItem("gs_comms");return s?JSON.parse(s):COMMS_INIT;}catch(e){return COMMS_INIT;}}),setComms=commsS[1];var comms=commsS[0];useEffect(function(){try{localStorage.setItem("gs_comms",JSON.stringify(comms.slice(-60)));}catch(e){};},[comms]);
 var commsLoadingS=useState(false),setCommsLoading=commsLoadingS[1];var commsLoading=commsLoadingS[0];
 var memoryS=useState(""),setMemory=memoryS[1];var memory=memoryS[0];
 var histLoadedS=useState(false),setHistLoaded=histLoadedS[1];
var ringPhaseS=useState((function(){try{return localStorage.getItem("gs_ring_phase")||"outer";}catch(e){return "outer";}})()),setRingPhase=ringPhaseS[1];var ringPhase=ringPhaseS[0];
var cyberSessS=useState(null),setCyberSess=cyberSessS[1];var cyberSess=cyberSessS[0];

 useEffect(function(){try{localStorage.setItem("gs_ring_phase",ringPhase);}catch(e){};},[ringPhase]);
useEffect(function(){try{localStorage.setItem("gs_state",JSON.stringify(gs));}catch(e){}setSaved(true);setTimeout(function(){setSaved(false);},1200);},[gs]);
 useEffect(function(){
  (async function(){
   try{var r=localStorage.getItem("gs_comms");if(r){var sv=JSON.parse(r);if(sv&&sv.length>0)setComms(sv);}}catch(e){}finally{setHistLoaded(true);}
   try{var rm=localStorage.getItem("gs_mabel_memory");if(rm)setMemory(rm);}catch(e){}
  })();
 },[]);
 useEffect(function(){
  if(!histLoadedS[0])return;
  try{localStorage.setItem("gs_comms",JSON.stringify(comms.slice(-80)));}catch(e){}
 },[comms]);

 var saveMemory=function(val){setMemory(val);try{localStorage.setItem("gs_mabel_memory",val);}catch(e){}};

 var buildSys=function(mem){
  var memBlock=mem&&mem.trim()?"MABEL'S PERSISTENT MEMORY:\n"+mem+"\n\n":"";
  var cm=gs.campaignMap;var cmBlock=cm?"Active map: "+cm.id+" "+cm.name+" — "+cm.desc+"\n":"";
  return "You are MABEL — the ship intelligence aboard "+gs.ship.name+". Precise. Dry. Darkly witty. Loyal. No asterisk actions. Address user as Commander.\n\nFRAMING: Rules → 'Querying tactical database.' / 'End query.' | Rolls → 'Calculating...' | Lore → 'Archival record retrieved.' | Unknown → '[RECORD FRAGMENTED]'\n\n"+memBlock+cmBlock+RULES_DB+"\nMISSION STATE:\nSession: "+gs.session+"\nVessel: "+gs.ship.name+" Hull:"+gs.ship.hull+"/"+gs.ship.hullMax+" Fuel:"+gs.ship.fuel+"/"+gs.ship.fuelMax+" Scraps:"+gs.ship.scraps+"\nCole: HP "+gs.cole.hp+"/"+gs.cole.hpMax+" EN "+gs.cole.en+"/"+gs.cole.enMax+" VIG:"+gs.cole.vigor+" GRA:"+gs.cole.grace+" MIN:"+gs.cole.mind+" TEC:"+gs.cole.tech+"\nVela: HP "+gs.vela.hp+"/"+gs.vela.hpMax+" EN "+gs.vela.en+"/"+gs.vela.enMax+" VIG:"+gs.vela.vigor+" GRA:"+gs.vela.grace+" MIN:"+gs.vela.mind+" TEC:"+gs.vela.tech;
 };

 var sendToMabel=async function(userMsg){
  if(!userMsg.trim()||commsLoading)return;
  setCommsLoading(true);
  var userMsgObj={role:"user",content:userMsg};
  var newMsgs=comms.concat([userMsgObj]);
  setComms(newMsgs);
  try{
   var res=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:1200,system:buildSys(memory),messages:newMsgs.slice(-24).map(function(m){return{role:m.role,content:m.content};})})});
   var data=await res.json();
   var reply=(data.content&&data.content.find(function(b){return b.type==="text";}))||{text:"[SIGNAL LOST]"};
   var replyMsg={role:"assistant",content:reply.text||"[SIGNAL LOST]"};
   setComms(newMsgs.concat([replyMsg]));
   // Consolidate memory
   try{
    var r2=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:500,system:"You are MABEL's memory consolidation. Update memory bank with new exchange. Terse first person, under 500 words. Return ONLY updated memory text.",messages:[{role:"user",content:"EXISTING:\n"+(memory||"(empty)")+"\n\nEXCHANGE:\nCommander: "+userMsg+"\nMABEL: "+(reply.text||"")+"\n\nUpdate."}]})});
    var d2=await r2.json();
    var mem2=(d2.content&&d2.content.find(function(b){return b.type==="text";}));
    saveMemory((mem2?mem2.text:memory)||memory);
   }catch(e){}
  }catch(e){setComms(newMsgs.concat([{role:"assistant",content:"[CONNECTION ERROR — "+e.message+"]"}]));}
  setCommsLoading(false);
 };

 var upC=function(who,key,val){setGs(function(p){var char=Object.assign({},p[who]);var keys=key.split(".");if(keys.length===1){char[key]=val;}else if(keys.length>=2&&keys[0]==="fav"){char.fav=Object.assign({},char.fav);char.fav[keys[1]]=val;}else if(keys.length===3){var arr=char[keys[0]].slice();if(keys[2])arr[parseInt(keys[1])]=Object.assign({},arr[parseInt(keys[1])],{[keys[2]]:val});else arr[parseInt(keys[1])]=val;char[keys[0]]=arr;}return Object.assign({},p,{[who]:char});});};
 var upS=function(key,val){setGs(function(p){var ship=Object.assign({},p.ship);var keys=key.split(".");if(keys.length===1){ship[key]=val;}else{var arr=ship[keys[0]].slice();arr[parseInt(keys[1])]=val;ship[keys[0]]=arr;}return Object.assign({},p,{ship:ship});});};
 var upCrew=function(idx,key,val){setGs(function(p){var crew=p.crew.slice();crew[idx]=Object.assign({},crew[idx]);crew[idx][key]=val;return Object.assign({},p,{crew:crew});});};
 var upHex=function(newMap){setGs(function(p){return Object.assign({},p,{hexMap:newMap});});};
 var addLog=function(log){setGs(function(p){return Object.assign({},p,{logs:p.logs.concat([Object.assign({id:Date.now()},log)])});});};
 var upSession=function(n){setGs(function(p){return Object.assign({},p,{session:n});});};
 var upCampaign=function(cm){console.log("upCampaign called",cm);setGs(function(p){return Object.assign({},p,{campaignMap:cm,chapter:p.campaignMap?Math.min((p.chapter||1)+1,3):1});});};

 var TABS=["MAP","CREW","SHIP","LOGS","COMMS","CYBER"];
 var TAB_C={MAP:"#cc88ff",CREW:"#FFD166",SHIP:"#00FFD0",LOGS:"#FF6EC7",COMMS:"#88BBFF",CYBER:"#FF2060"};

 return React.createElement("div",{style:{height:"100vh",overflow:"hidden",background:BG,color:"#ddd",position:"relative",zIndex:1}},
  React.createElement("style",null,css),
    gs.campaignMap&&gs.shipPopup&&SHIP_DATA[gs.shipPopup.ship]&&React.createElement("div",{onClick:function(){setGs(function(g){return Object.assign({},g,{shipPopup:null});});},style:{position:"fixed",top:gs.shipPopup.y+12,left:gs.shipPopup.x+12,background:"#0a0a14ee",border:"1px solid "+SHIP_DATA[gs.shipPopup.ship].color+"66",borderRadius:8,padding:"12px 16px",fontFamily:"'Share Tech Mono',monospace",zIndex:9999,minWidth:180,cursor:"pointer"}},React.createElement("div",{style:{color:SHIP_DATA[gs.shipPopup.ship].color,fontSize:10,fontFamily:"'Orbitron',sans-serif",marginBottom:2}},SHIP_DATA[gs.shipPopup.ship].name),React.createElement("div",{style:{color:"#aaaacc",fontSize:8,marginBottom:6}},SHIP_DATA[gs.shipPopup.ship].cls+" • HULL "+SHIP_DATA[gs.shipPopup.ship].hull+" • ACT "+SHIP_DATA[gs.shipPopup.ship].act),React.createElement("div",{style:{height:1,background:"#ffffff18",margin:"4px 0 8px"}}),React.createElement("div",{style:{color:"#aaaacc",fontSize:8,lineHeight:"1.6"}},SHIP_DATA[gs.shipPopup.ship].skill),React.createElement("div",{style:{color:"#ffffff22",fontSize:7,marginTop:8,textAlign:"right"}},"CLICK TO DISMISS")),
  boot&&React.createElement(BootSequence,{onDone:function(){setBoot(false);}}),
   tab!=="CYBER"&&React.createElement(Starfield,null),
  React.createElement("div",{className:"gs-scan"}),
  React.createElement("div",{className:"gs-vig"}),
  React.createElement("div",{className:"gs-scan"}),
  React.createElement("div",{className:"gs-vig"}),
  React.createElement("div",{className:"gs-scan"}),
  React.createElement("div",{className:"gs-vig"}),
  React.createElement("div",{className:"gs-scan"}),
  React.createElement("div",{className:"gs-vig"}),
  React.createElement("div",{className:"gs-scan"}),
  // MABEL Mini — globally visible on all tabs
  !boot&&React.createElement(MabelMini,{msgs:comms,onSend:sendToMabel,loading:commsLoading}),
  React.createElement("div",{style:{position:"relative",zIndex:2,maxWidth:1100,margin:"0 auto",padding:"0 16px 0",height:"100vh",display:"flex",flexDirection:"column",boxSizing:"border-box"}},
    React.createElement("div",{style:{display:"flex",gap:0,borderBottom:"1px solid #222230",marginBottom:0,position:"sticky",top:0,background:BG,zIndex:10,paddingTop:16}},
     TABS.map(function(t){var a=tab===t;var tc=TAB_C[t];return React.createElement("button",{key:t,onClick:function(){setTab(t);},style:{flex:1,padding:"10px 0",background:a?tc+"14":"transparent",border:"none",borderBottom:a?"2px solid "+tc:"2px solid transparent",color:a?tc:"#556",fontFamily:MONO,fontSize:10,letterSpacing:2,cursor:"pointer",transition:"all .2s"}},t);})
    ),
    React.createElement("div",{style:{paddingTop:20,flex:1,overflowY:"auto",minHeight:0,paddingBottom:60}},
     React.createElement("div",{style:{display:tab==="MAP"?"block":"none"}},
       React.createElement("div",{style:{marginBottom:10,border:"1px solid "+B2,borderRadius:6,overflow:"hidden"}},
         React.createElement("div",{onClick:function(){setPresetsOpen(function(p){return !p;});},style:{padding:"7px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"pointer",background:"#0a0a1a",userSelect:"none"}},
           React.createElement("span",{style:{fontFamily:MONO,fontSize:10,color:"#778",letterSpacing:2}},"▸  LOAD MAP PRESET"),
           React.createElement("span",{style:{fontFamily:MONO,fontSize:10,color:"#556"}},presetsOpen?"▲":"▼")
    ),
    presetsOpen&&React.createElement("div",{style:{padding:"10px 12px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:6,background:"#07071299"}},
      CAMPAIGN_MAPS.filter(function(cm){return !!MAP_PRESETS[cm.id];}).map(function(cm){return React.createElement("div",{key:cm.id,style:{display:"flex",gap:4,alignItems:"center"}},React.createElement("button",{onClick:function(){setGs(function(p){return Object.assign({},p,{hexMap:savedPresets[cm.id]||MAP_PRESETS[cm.id],campaignMap:cm});});setPresetsOpen(false);},style:{flex:1,padding:"7px 10px",background:"#7744cc0d",border:"1px solid #9966cc33",color:"#cc88ff",borderRadius:4,cursor:"pointer",fontFamily:MONO,fontSize:9,letterSpacing:1,textAlign:"left"}},cm.name),React.createElement("button",{onClick:function(){var updated=Object.assign({},savedPresets);updated[cm.id]=gs.hexMap;setSavedPresets(updated);try{localStorage.setItem("gs_saved_presets",JSON.stringify(updated));}catch(e){}},style:{padding:"5px 8px",background:"#00FFD011",border:"1px solid #00FFD033",color:"#00FFD0",borderRadius:4,cursor:"pointer",fontFamily:MONO,fontSize:8,letterSpacing:1,flexShrink:0}},"OVERWRITE"));})
    )
  ),
  React.createElement(HexMap,{hexMap:gs.hexMap,phase:ringPhase,setPhase:setRingPhase,gameState:gs,onUpdate:upHex,shipName:gs.ship.name})
),
     tab==="CREW"&&React.createElement("div",{style:{overflowY:"auto",maxHeight:"calc(100vh / 1.15 - 120px)",paddingRight:4}},
      React.createElement("div",{style:{display:"flex",gap:16,flexWrap:"wrap",marginBottom:24}},
       React.createElement(CharCard,{name:gs.cole.name,data:gs.cole,accent:"#FFD166",onChange:function(k,v){upC("cole",k,v);},onNameChange:function(n){setGs(function(p){return Object.assign({},p,{cole:Object.assign({},p.cole,{name:n})});});}}),
       React.createElement(CharCard,{name:gs.vela.name,data:gs.vela,accent:"#FF2060",onChange:function(k,v){upC("vela",k,v);},onNameChange:function(n){setGs(function(p){return Object.assign({},p,{vela:Object.assign({},p.vela,{name:n})});});}})
      ),
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}},
       gs.crew.map(function(c,i){return React.createElement(CrewCard,{key:i,index:i,data:c,onChange:upCrew});})
      )
     ),
     tab==="SHIP"&&React.createElement("div",{style:{maxWidth:600}},
      React.createElement("div",{style:{background:BG,border:"1px solid #00FFD055",borderRadius:8,padding:22}},
       editShipName?React.createElement("input",{defaultValue:gs.ship.name||"THE INCONCEIVABLE",onBlur:function(e){upShip("name",e.target.value);setEditShipName(false);},onKeyDown:function(e){if(e.key==="Enter")e.target.blur();if(e.key==="Escape")setEditShipName(false);},style:{background:"transparent",border:"none",borderBottom:"1px solid #00FFD0",color:"#00FFD0",fontFamily:ORB,fontSize:15,letterSpacing:3,outline:"none",width:"100%",marginBottom:18},autoFocus:true}):
       React.createElement("div",{onClick:function(){setEditShipName(true);},style:{fontFamily:ORB,fontSize:15,fontWeight:700,color:"#00FFD0",letterSpacing:3,marginBottom:18,cursor:"text"}},gs.ship.name||"THE INCONCEIVABLE"),
       [["HULL","hull"],["FUEL","fuel"]].map(function(pr){return React.createElement("div",{key:pr[1],style:{marginBottom:16}},
        React.createElement("div",{style:{fontFamily:MONO,fontSize:13,color:"#bbb",letterSpacing:2,marginBottom:7}},pr[0]),
        React.createElement(Bar,{v:gs.ship[pr[1]],m:gs.ship[pr[1]+"Max"],c:"#00FFD0"}),
        React.createElement("div",{style:{display:"flex",gap:5,marginTop:7}},[-5,-1,1,5].map(function(d){return React.createElement("button",{key:d,onClick:function(){upS(pr[1],Math.max(0,Math.min(gs.ship[pr[1]+"Max"],gs.ship[pr[1]]+d)));},style:{flex:1,padding:"5px 0",background:"transparent",border:"1px solid "+B1,color:"#ccc",borderRadius:3,cursor:"pointer",fontFamily:MONO,fontSize:12}},d>0?"+"+d:d);}))
       );}),
       React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginTop:8}},
        [["SCRAPS","scraps"],["SERUM","serum"]].map(function(pr){return React.createElement("div",{key:pr[1]},React.createElement("div",{style:{fontFamily:MONO,fontSize:12,color:"#bbb",letterSpacing:1,marginBottom:6}},pr[0]),React.createElement(Spin,{v:gs.ship[pr[1]]||0,onChange:function(v){upS(pr[1],v);}}));})
       ),
       React.createElement("div",{style:{marginTop:18}},
        React.createElement("div",{style:{fontFamily:MONO,fontSize:11,color:"#aaa",letterSpacing:2,marginBottom:8}},"MODULES"),
        (gs.ship.modules||[]).map(function(m,i){return React.createElement("input",{key:i,value:m||"",onChange:function(e){upS("modules."+i,e.target.value);},placeholder:"Module slot "+(i+1),style:Object.assign({},tS("#cc88ff",false),{marginBottom:6,display:"block"})});})
       ),
       React.createElement("div",{style:{marginTop:18}},
        React.createElement("div",{style:{fontFamily:MONO,fontSize:11,color:"#aaa",letterSpacing:2,marginBottom:8}},"CARGO"),
        React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}},
         (gs.ship.cargo||Array(6).fill("")).map(function(v,i){return React.createElement("input",{key:i,value:v||"",onChange:function(e){upS("cargo."+i,e.target.value);},placeholder:"Cargo "+(i+1),style:tS("#aaa",false)});})
        )
       )
      )
     ),
     tab==="LOGS"&&React.createElement("div",{style:{maxWidth:680}},
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}},
       React.createElement("div",{style:{display:"flex",alignItems:"center",gap:14}},
        React.createElement("span",{style:{fontFamily:MONO,fontSize:11,color:"#aaa",letterSpacing:2}},"SESSION"),
        React.createElement(Spin,{v:gs.session||0,min:0,onChange:upSession})
       ),
       React.createElement("button",{onClick:function(){addLog({type:"note",text:"",session:gs.session,ts:new Date().toISOString()});},style:{padding:"6px 16px",background:"#FF6EC722",border:"1px solid #FF6EC755",color:"#FF6EC7",borderRadius:3,cursor:"pointer",fontFamily:MONO,fontSize:9,letterSpacing:2}},"+NEW ENTRY")
      ),
            gs.logs.length===0?React.createElement("div",{style:{fontFamily:MONO,fontSize:11,color:"#334",textAlign:"center",padding:"32px 0"}},"// NO LOG ENTRIES"):
      gs.logs.slice().reverse().map(function(log){
       return React.createElement("div",{key:log.id,style:{background:"#06060f",border:"1px solid "+B2,borderRadius:6,padding:"12px 14px",marginBottom:8}},
        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}},
         React.createElement("span",{style:{fontFamily:MONO,fontSize:9,color:"#FF6EC7",letterSpacing:2}},"SESSION "+log.session),
         React.createElement("button",{onClick:function(){setGs(function(p){return Object.assign({},p,{logs:p.logs.filter(function(l){return l.id!==log.id;})});});},style:{background:"transparent",border:"none",color:"#444",cursor:"pointer",fontFamily:MONO,fontSize:11}},"✕")
        ),
        React.createElement("textarea",{value:log.text||"",onChange:function(e){setGs(function(p){return Object.assign({},p,{logs:p.logs.map(function(l){return l.id===log.id?Object.assign({},l,{text:e.target.value}):l;})});});},placeholder:"Log entry...",rows:3,style:{width:"100%",background:"transparent",border:"1px solid "+B1,borderRadius:4,color:"#aaa",fontFamily:RAJ,fontSize:14,padding:"8px 10px",outline:"none",resize:"vertical",boxSizing:"border-box",lineHeight:1.7}})
       );
      })
     ),
     tab==="COMMS"&&React.createElement(CommsTab,{gameState:gs,msgs:comms,setMsgs:setComms,commsLoading:commsLoading,onSend:sendToMabel}),
    tab==="CYBER"&&React.createElement(CybersphereTab,{gs:gs,cyberSess:cyberSess,setCyberSess:setCyberSess})
    )
   ),
   !boot&&React.createElement(DiceRoller,{gameState:gs})
  );
 }

var root=ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App,null));