// ================================================================
// HUXI App — BoomCanvas (Geïllustreerde Wereld) v4
// - Bladeren bedekken takken volledig (kruin OVER takken)
// - Bergen, gelaagde heuvels, diep bos op achtergrond
// - Bos groeit mee (meerdere bomen)
// - 35+ elementen verspreid over 0-100%
// ================================================================

function BoomCanvas({ season, growth, wp, tod, c, totalSessions, wi, accType, tapA, rareAnimal }) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 80);
    return () => clearInterval(iv);
  }, []);
  const t = tick * 0.08;
  const el = React.createElement;
  const g = Math.max(0, Math.min(1, growth));

  const W = 430, H = 700;
  const cx = W / 2;
  const groundY = H * 0.72;

  // ─── SEIZOEN KLEUREN ───
  const sky = {
    Lente:  { top:"#87CEEB", mid:"#B4E4F7", bot:"#E0F0D4" },
    Zomer:  { top:"#4A90C4", mid:"#7CB8E0", bot:"#C8E8B0" },
    Herfst: { top:"#8A7D5B", mid:"#C4A868", bot:"#D8C8A0" },
    Winter: { top:"#6A7F98", mid:"#94A8BC", bot:"#D0D8E0" }
  }[season] || { top:"#87CEEB", mid:"#B4E4F7", bot:"#E0F0D4" };

  const todOverlay = { Ochtend:"rgba(255,210,120,0.15)", Middag:"rgba(0,0,0,0)", Avond:"rgba(255,80,20,0.25)", Nacht:"rgba(8,8,50,0.6)" }[tod] || "rgba(0,0,0,0)";
  const isNight = tod === "Nacht";
  const isEvening = tod === "Avond";

  const grassColor = c.gd || "#4A7A5A";
  const grassLight = c.gl || "#6A9A72";
  const leafColor = c.lf || "#4CAF7A";
  const leafAlt = c.la || "#6BC5A0";
  const leafLight = c.ll || "#7DD4A8";
  const trunkColor = c.trunk || "#4A5568";
  const flowerColors = c.fl || ["#E07850","#E8A840","#5BB8A0"];
  const waterColor = season === "Winter" ? "#A0B8C8" : "#5BA3D9";
  const waterLight = season === "Winter" ? "#C0D0D8" : "#8CC8F0";

  function appear(threshold, range) {
    if (g < threshold) return 0;
    if (g >= threshold + range) return 1;
    return (g - threshold) / range;
  }
  function srand(seed) {
    let s = seed;
    return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
  }

  // ─── DEFS ───
  const defs = el("defs", null,
    el("linearGradient", { id:"skyG", x1:"0",y1:"0",x2:"0",y2:"1" },
      el("stop", { offset:"0%", stopColor: sky.top }),
      el("stop", { offset:"55%", stopColor: sky.mid }),
      el("stop", { offset:"100%", stopColor: sky.bot })
    ),
    el("linearGradient", { id:"grassG", x1:"0",y1:"0",x2:"0",y2:"1" },
      el("stop", { offset:"0%", stopColor: grassLight }),
      el("stop", { offset:"100%", stopColor: grassColor })
    ),
    el("linearGradient", { id:"trunkG", x1:"0",y1:"0",x2:"1",y2:"0" },
      el("stop", { offset:"0%", stopColor: trunkColor }),
      el("stop", { offset:"40%", stopColor: trunkColor }),
      el("stop", { offset:"60%", stopColor: "rgba(255,255,255,0.08)" }),
      el("stop", { offset:"100%", stopColor: trunkColor })
    ),
    el("linearGradient", { id:"rockG", x1:"0",y1:"0",x2:"0.3",y2:"1" },
      el("stop", { offset:"0%", stopColor: "#9A9590" }),
      el("stop", { offset:"100%", stopColor: "#706860" })
    ),
    el("linearGradient", { id:"mtnG", x1:"0",y1:"0",x2:"0",y2:"1" },
      el("stop", { offset:"0%", stopColor: season==="Winter"?"#C8D0D8":"#8898A0" }),
      el("stop", { offset:"40%", stopColor: season==="Winter"?"#A0B0B8":"#708878" }),
      el("stop", { offset:"100%", stopColor: season==="Herfst"?"#8A7A58":season==="Winter"?"#90A098":"#5A8A60" })
    ),
    el("radialGradient", { id:"sunGlow", cx:"50%",cy:"20%",r:"35%" },
      el("stop", { offset:"0%", stopColor:"rgba(255,240,200,0.4)" }),
      el("stop", { offset:"100%", stopColor:"rgba(255,240,200,0)" })
    ),
    el("filter", { id:"shadow" },
      el("feDropShadow", { dx:"2",dy:"4",stdDeviation:"6",floodColor:"rgba(0,0,0,0.12)" })
    ),
    el("filter", { id:"glow" },
      el("feGaussianBlur", { stdDeviation:"3",result:"b" }),
      el("feMerge", null, el("feMergeNode",{in:"b"}), el("feMergeNode",{in:"SourceGraphic"}))
    )
  );

  // ─── LUCHT ───
  const skyBg = el("rect", { x:0,y:0,width:W,height:H,fill:"url(#skyG)" });

  const sunMoon = isNight
    ? el("g", null,
        el("circle", { cx:340,cy:80,r:28,fill:"#F0E8D0",opacity:0.9 }),
        el("circle", { cx:348,cy:74,r:22,fill:sky.top,opacity:0.8 })
      )
    : isEvening
    ? el("circle", { cx:360,cy:120,r:35,fill:"#F4A040",opacity:0.7 })
    : el("g", null,
        el("circle", { cx:80,cy:80,r:32,fill:"#FFE066",opacity:0.85 }),
        el("rect", { x:0,y:0,width:W,height:H,fill:"url(#sunGlow)" })
      );

  function cloud(key, x0, y, sc, spd) {
    const px = ((x0 + t * spd * 15) % (W + 200)) - 100;
    return el("g", { key, transform:`translate(${px},${y}) scale(${sc})`, opacity: isNight?0.2:0.75 },
      el("ellipse",{cx:0,cy:0,rx:40,ry:18,fill:"white"}),
      el("ellipse",{cx:-22,cy:4,rx:25,ry:14,fill:"white"}),
      el("ellipse",{cx:24,cy:5,rx:30,ry:16,fill:"white"}),
      el("ellipse",{cx:8,cy:-8,rx:28,ry:15,fill:"white"})
    );
  }
  const clouds = el("g",null, cloud("c1",50,50,0.8,0.3), cloud("c2",200,80,1.1,0.2), cloud("c3",350,35,0.7,0.4));

  const stars = isNight ? el("g",null,
    ...Array.from({length:45+Math.floor(g*25)},(_,i) => {
      const sx=(i*97+13)%W, sy=(i*43+7)%(H*0.38);
      return el("circle",{key:"s"+i,cx:sx,cy:sy,r:1+(i%3)*0.5,fill:"white",opacity:0.25+0.75*Math.abs(Math.sin(t*0.5+i))});
    })
  ) : null;

  // ═══════════════════════════════════════════════════════════
  // ACHTERGROND — bergen, heuvels, bos (diepte!)
  // ═══════════════════════════════════════════════════════════

  // ─── BERGEN (ver weg, altijd zichtbaar, worden hoger met groei) ───
  const mtnH = 40 + appear(0.10, 0.70) * 100;
  const mountains = el("g", { opacity: 0.35 + appear(0.05, 0.30)*0.35 },
    // Linkerberg
    el("path", { d:`M-20,${groundY-10} L60,${groundY-10-mtnH*0.8} L100,${groundY-10-mtnH*0.5} L140,${groundY-10}`, fill:"url(#mtnG)" }),
    // Middenberg (hoogste)
    el("path", { d:`M100,${groundY-10} L190,${groundY-10-mtnH} L215,${groundY-10-mtnH*0.85} L280,${groundY-10}`, fill:"url(#mtnG)" }),
    // Rechterberg
    el("path", { d:`M260,${groundY-10} L340,${groundY-10-mtnH*0.7} L390,${groundY-10-mtnH*0.55} L450,${groundY-10}`, fill:"url(#mtnG)" }),
    // Sneeuwtoppen (winter of hoge bergen)
    (season === "Winter" || mtnH > 80) && el("g", { opacity: season==="Winter"?0.7:0.3 },
      el("path", { d:`M55,${groundY-10-mtnH*0.73} L60,${groundY-10-mtnH*0.8} L65,${groundY-10-mtnH*0.73}`, fill:"white" }),
      el("path", { d:`M185,${groundY-10-mtnH*0.93} L190,${groundY-10-mtnH} L200,${groundY-10-mtnH*0.88}`, fill:"white" }),
      el("path", { d:`M335,${groundY-10-mtnH*0.63} L340,${groundY-10-mtnH*0.7} L350,${groundY-10-mtnH*0.58}`, fill:"white" })
    )
  );

  // ─── VERRE HEUVELS (laag 1 — achter bos) ───
  const hillGreen = appear(0.08, 0.50);
  const hc1 = `rgb(${Math.round(120-hillGreen*30)},${Math.round(145+hillGreen*45)},${Math.round(110-hillGreen*10)})`;
  const hc2 = `rgb(${Math.round(110-hillGreen*20)},${Math.round(140+hillGreen*50)},${Math.round(105)})`;
  const hc3 = `rgb(${Math.round(100-hillGreen*15)},${Math.round(135+hillGreen*45)},${Math.round(100)})`;

  const farHills = el("g", { opacity: 0.5 + hillGreen*0.3 },
    el("ellipse", { cx:80,  cy:groundY-5, rx:160, ry:50, fill:hc1 }),
    el("ellipse", { cx:280, cy:groundY,   rx:180, ry:45, fill:hc2 }),
    el("ellipse", { cx:400, cy:groundY-8, rx:120, ry:40, fill:hc3 }),
    g >= 0.25 && el("ellipse", { cx:180, cy:groundY-15, rx:140, ry:55, fill:hc1, opacity:appear(0.25,0.15) })
  );

  // ─── ACHTERGROND BOS (verschijnt geleidelijk) ───
  function bgTree(key, x, baseY, scale, startG, color1, color2) {
    const tp = appear(startG, 0.12);
    if (tp <= 0) return null;
    const h = 40 * scale * tp;
    const w = 3 * scale;
    return el("g", { key, opacity: 0.5 * tp, transform:`translate(${x},${baseY})` },
      el("rect", { x:-w/2, y:-h, width:w, height:h, fill:trunkColor, opacity:0.5 }),
      el("ellipse", { cx:0, cy:-h-8*scale, rx:12*scale*tp, ry:15*scale*tp, fill:color1 }),
      el("ellipse", { cx:-5*scale, cy:-h-4*scale, rx:9*scale*tp, ry:11*scale*tp, fill:color2 }),
      el("ellipse", { cx:5*scale, cy:-h-5*scale, rx:8*scale*tp, ry:10*scale*tp, fill:color1, opacity:0.8 })
    );
  }

  const bgForest = el("g", null,
    // Verre bomen (klein, vroeg)
    bgTree("bt1", 30,  groundY-8,  0.5, 0.20, hc1, hc2),
    bgTree("bt2", 55,  groundY-12, 0.6, 0.22, hc2, hc1),
    bgTree("bt3", 390, groundY-6,  0.5, 0.24, hc1, hc3),
    bgTree("bt4", 415, groundY-10, 0.55,0.26, hc2, hc1),
    // Middelgrote bomen (iets dichterbij)
    bgTree("bt5", 15,  groundY-2,  0.7, 0.35, leafColor, leafAlt),
    bgTree("bt6", 70,  groundY-5,  0.8, 0.38, leafAlt, leafColor),
    bgTree("bt7", 360, groundY-3,  0.75,0.40, leafColor, leafLight),
    bgTree("bt8", 410, groundY-1,  0.65,0.42, leafAlt, leafColor),
    // Meer bomen (bos wordt dichter)
    bgTree("bt9",  95, groundY-8,  0.6, 0.50, leafLight, leafColor),
    bgTree("bt10", 340,groundY-6,  0.7, 0.52, leafColor, leafAlt),
    bgTree("bt11", 45, groundY+2,  0.9, 0.58, leafAlt, leafLight),
    bgTree("bt12", 380,groundY+3,  0.85,0.60, leafColor, leafAlt),
    // Dicht bos (later)
    bgTree("bt13", 120,groundY-3,  0.55,0.68, hc2, leafColor),
    bgTree("bt14", 310,groundY-4,  0.6, 0.70, hc1, leafAlt),
    bgTree("bt15", 5,  groundY+5,  0.95,0.75, leafAlt, leafColor),
    bgTree("bt16", 425,groundY+4,  0.9, 0.78, leafColor, leafLight),
    // Volgroeid bos
    bgTree("bt17", 140,groundY+2,  0.5, 0.85, leafLight, leafAlt),
    bgTree("bt18", 290,groundY,    0.55,0.88, leafColor, leafAlt)
  );

  // ─── ROTSEN (zachte vormen, rechts achteraan) ───
  const rP = appear(0.40, 0.15);
  const bgRocks = g >= 0.40 ? el("g", { opacity: rP * 0.5 },
    // Rotsen rechts (niet links — dat was te druk)
    el("ellipse", { cx:400, cy:groundY-5, rx:25, ry:35*rP, fill:"#8A8478" }),
    el("ellipse", { cx:415, cy:groundY-2, rx:18, ry:25*rP, fill:"#9A9488" }),
    el("ellipse", { cx:395, cy:groundY+5, rx:30, ry:15*rP, fill:"#7A7468" }),
    // Kleine rots links (subtiel)
    g >= 0.55 && el("ellipse", { cx:25, cy:groundY+5, rx:20, ry:18*appear(0.55,0.15), fill:"#8A8478", opacity:0.35 })
  ) : null;

  // ─── VLIEGENDE VOGELS (achtergrond) ───
  const nFlyBirds = Math.floor(appear(0.15, 0.40) * 5);
  const flyingBirds = nFlyBirds > 0 ? Array.from({length:nFlyBirds},(_,i) => {
    const bx = ((80 + i*110 + t*12*(0.8+i*0.15)) % (W+60)) - 30;
    const by = 100 + i*35 + Math.sin(t*0.3+i*2)*15;
    const wingUp = Math.sin(t*3+i*1.8)*4;
    return el("g",{key:"fb"+i,transform:`translate(${bx},${by})`,opacity:0.4+i*0.05},
      el("path",{d:`M-6,0 Q-3,${-3+wingUp} 0,0 Q3,${-3+wingUp} 6,0`,fill:"none",stroke:"#3A3A3A",strokeWidth:1.2,strokeLinecap:"round"})
    );
  }) : [];

  // ─── WATERVAL (g>=0.60) ───
  const wfP = appear(0.60, 0.15);
  const waterfall = g >= 0.60 ? el("g", { opacity: wfP },
    ...Array.from({length:6},(_,i) => {
      const wy = groundY+5-85*appear(0.35,0.35) + i*14;
      const wb = Math.sin(t*2.5+i*1.1)*2.5;
      return el("path",{key:"wf"+i,d:`M${25+wb},${wy} Q${27+wb},${wy+7} ${24+wb},${wy+14}`,fill:"none",stroke:waterLight,strokeWidth:2.5-i*0.2,strokeLinecap:"round",opacity:0.4+0.3*Math.sin(t*3+i)});
    }),
    el("circle",{cx:28,cy:groundY+38,r:5+Math.sin(t*4)*2,fill:waterLight,opacity:0.2}),
    el("circle",{cx:22,cy:groundY+34,r:3,fill:"white",opacity:0.25})
  ) : null;

  // ─── BEEKJE (g>=0.25) ───
  const stP = appear(0.25, 0.20);
  const stream = g >= 0.25 ? el("g", { opacity: stP },
    el("path",{
      d:`M${-5+wfP*35},${groundY+38} Q${70},${groundY+52} ${150},${groundY+48} Q${240},${groundY+42} ${330},${groundY+58}`,
      fill:"none",stroke:waterColor,strokeWidth:5+stP*7,strokeLinecap:"round",opacity:0.45
    }),
    ...Array.from({length:7},(_,i) => {
      const sx=30+i*45+Math.sin(t*0.4+i)*6, sy=groundY+43+Math.sin(i*1.2)*7;
      return el("ellipse",{key:"wr"+i,cx:sx,cy:sy,rx:6+Math.sin(t*0.8+i)*2,ry:1.5,fill:"white",opacity:0.12+0.08*Math.sin(t+i)});
    })
  ) : null;

  // ─── BRUGGETJE (g>=0.50) ───
  const bridge = g >= 0.50 ? el("g", { opacity: appear(0.50, 0.08) },
    el("rect",{x:140,y:groundY+36,width:42,height:5,rx:2,fill:"#8A6A40"}),
    ...Array.from({length:4},(_,i) => el("rect",{key:"bp"+i,x:143+i*10,y:groundY+35,width:5,height:7,rx:1,fill:"#6A5030"})),
    el("line",{x1:140,y1:groundY+28,x2:140,y2:groundY+36,stroke:"#6A5030",strokeWidth:2}),
    el("line",{x1:182,y1:groundY+28,x2:182,y2:groundY+36,stroke:"#6A5030",strokeWidth:2}),
    el("line",{x1:140,y1:groundY+28,x2:182,y2:groundY+28,stroke:"#6A5030",strokeWidth:1.5})
  ) : null;

  // ─── GROND ───
  const groundLush = appear(0.05, 0.40);
  const ground = el("g",null,
    el("ellipse",{cx:80,cy:groundY+18,rx:200,ry:75,fill:grassLight,opacity:0.3+groundLush*0.35}),
    el("ellipse",{cx:360,cy:groundY+12,rx:170,ry:65,fill:grassLight,opacity:0.25+groundLush*0.3}),
    el("ellipse",{cx:cx,cy:groundY+45,rx:350,ry:115,fill:"url(#grassG)"}),
    el("rect",{x:0,y:groundY+55,width:W,height:H-groundY,fill:grassColor})
  );

  // ─── PAD ───
  const pP = appear(0.08, 0.15);
  const pathEl = g >= 0.08 ? el("g", { opacity: pP },
    el("path",{d:`M${cx-8},${groundY+140} Q${cx-20},${groundY+75} ${cx},${groundY+35} Q${cx+12},${groundY+5} ${cx},${groundY-8}`,fill:"none",stroke:"#C4B090",strokeWidth:12+pP*6,strokeLinecap:"round",opacity:0.22}),
    ...Array.from({length:Math.floor(pP*6)},(_,i) => {
      const py=groundY+115-i*22;
      return el("ellipse",{key:"ps"+i,cx:cx-2+(i%2)*5,cy:py,rx:2.5,ry:1.8,fill:"#B0A080",opacity:0.25});
    })
  ) : null;

  // ═══════════════════════════════════════════════════════════
  // BOOM — takken VOLLEDIG bedekt door kruin
  // ═══════════════════════════════════════════════════════════

  function renderTree() {
    const trunkParts = [];
    const leafParts = [];

    const trunkProgress = appear(0.02, 0.70);
    const trunkH = 8 + trunkProgress * 210;
    const trunkW = 2 + trunkProgress * 30;
    const trunkTop = groundY - trunkH;

    // --- STAM ---
    if (g >= 0.02) {
      trunkParts.push(el("path", {
        key:"trunk",
        d:`M${cx-trunkW/2},${groundY} C${cx-trunkW/2.5},${groundY-trunkH*0.3} ${cx-trunkW/3},${groundY-trunkH*0.7} ${cx-2},${trunkTop+5} L${cx+2},${trunkTop+5} C${cx+trunkW/3},${groundY-trunkH*0.7} ${cx+trunkW/2.5},${groundY-trunkH*0.3} ${cx+trunkW/2},${groundY} Z`,
        fill:"url(#trunkG)"
      }));
      if (trunkW > 8) {
        for (let i = 0; i < Math.min(6, Math.floor(trunkW/4)); i++) {
          const xOff = (i-3)*(trunkW/7);
          trunkParts.push(el("line",{key:"bark"+i,x1:cx+xOff,y1:groundY-15-i*12,x2:cx+xOff*0.7,y2:trunkTop+25+i*18,stroke:"rgba(0,0,0,0.06)",strokeWidth:1+trunkW*0.02}));
        }
      }
      if (g > 0.40) trunkParts.push(el("ellipse",{key:"kn1",cx:cx+trunkW*0.25,cy:groundY-trunkH*0.4,rx:3+trunkW*0.08,ry:2+trunkW*0.05,fill:"rgba(0,0,0,0.12)"}));
      if (g > 0.65) trunkParts.push(el("ellipse",{key:"kn2",cx:cx-trunkW*0.2,cy:groundY-trunkH*0.55,rx:2+trunkW*0.06,ry:1.5+trunkW*0.04,fill:"rgba(0,0,0,0.10)"}));
    }

    // --- WORTELS ---
    [
      {a:-35,l:1.0,th:1.0,s:0.20},{a:30,l:0.8,th:0.8,s:0.25},{a:-55,l:0.6,th:0.6,s:0.35},
      {a:50,l:0.7,th:0.7,s:0.40},{a:-15,l:0.5,th:0.5,s:0.50},{a:15,l:0.4,th:0.4,s:0.55}
    ].forEach((r,i) => {
      const rp = appear(r.s,0.15); if (rp<=0) return;
      const rLen=(15+trunkW*0.8)*r.l*rp, rTh=(2+trunkW*0.15)*r.th*rp;
      const side=r.a<0?-1:1, sx=cx+side*trunkW*0.4;
      const ex=sx+Math.sin(r.a*Math.PI/180)*rLen, ey=groundY+Math.abs(Math.cos(r.a*Math.PI/180))*rLen*0.5;
      trunkParts.push(el("path",{key:"root"+i,d:`M${sx},${groundY} Q${(sx+ex)/2},${groundY+rLen*0.2} ${ex},${ey}`,fill:"none",stroke:trunkColor,strokeWidth:rTh,strokeLinecap:"round"}));
    });

    // --- TAKKEN (kort, alleen zichtbaar onder de kruin bij jonge boom) ---
    // Takken beginnen hoog op de stam (h=0.60-0.90) zodat ze IN de kruin zitten
    const branchDefs = [
      {sg:0.15,a:-35,l:0.14,th:0.45,h:0.62,sd:-1},{sg:0.18,a:30,l:0.12,th:0.40,h:0.65,sd:1},
      {sg:0.25,a:-50,l:0.16,th:0.50,h:0.68,sd:-1},{sg:0.28,a:45,l:0.15,th:0.45,h:0.70,sd:1},
      {sg:0.32,a:-25,l:0.20,th:0.55,h:0.75,sd:-1},{sg:0.36,a:22,l:0.18,th:0.50,h:0.78,sd:1},
      {sg:0.40,a:-55,l:0.12,th:0.35,h:0.72,sd:-1},{sg:0.44,a:50,l:0.11,th:0.30,h:0.74,sd:1},
      {sg:0.48,a:-18,l:0.22,th:0.55,h:0.82,sd:-1},{sg:0.52,a:16,l:0.20,th:0.50,h:0.85,sd:1},
      {sg:0.56,a:-40,l:0.16,th:0.42,h:0.80,sd:-1},{sg:0.60,a:38,l:0.14,th:0.38,h:0.83,sd:1},
    ];

    const branchEndpoints = [];
    branchDefs.forEach((b,i) => {
      const bp = appear(b.sg,0.12); if (bp<=0) return;
      const startY = groundY-trunkH*b.h;
      const bLen = (20+trunkH*0.22)*b.l*bp;
      const bTh = (1.5+trunkW*0.18)*b.th*bp;
      const rad = b.a*Math.PI/180;
      const endX = cx+b.sd*trunkW*0.3+Math.sin(rad)*bLen;
      const endY = startY-bLen*0.4+Math.cos(rad)*bLen*0.08;
      const midX = cx+b.sd*trunkW*0.25+Math.sin(rad)*bLen*0.5;
      const midY = startY-bLen*0.15;
      const sw = Math.sin(t*0.4+i*0.9)*(0.8+bp*0.5);
      trunkParts.push(el("path",{key:"br"+i,d:`M${cx+b.sd*trunkW*0.2},${startY} Q${midX+sw},${midY} ${endX+sw},${endY}`,fill:"none",stroke:trunkColor,strokeWidth:bTh,strokeLinecap:"round"}));
      branchEndpoints.push({x:endX+sw, y:endY, bp, i});
    });

    // --- KRUIN ACHTERGROND (ondoorzichtig, verbergt takken volledig) ---
    if (g > 0.20) {
      const cs = appear(0.20, 0.50);
      const crRx = (48+trunkH*0.33)*cs;
      const crRy = (38+trunkH*0.26)*cs;
      const crCy = trunkTop+crRy*0.22;
      const sw = Math.sin(t*0.25)*1.5;

      // Ondoorzichtige achtergrond — verbergt alle takken
      [
        {dx:0,dy:0,rx:1.0,ry:1.0,c:leafColor,o:0.92},
        {dx:-crRx*0.30,dy:crRy*0.10,rx:0.65,ry:0.70,c:leafAlt,o:0.90},
        {dx:crRx*0.30,dy:crRy*0.06,rx:0.60,ry:0.65,c:leafAlt,o:0.90},
        {dx:0,dy:-crRy*0.32,rx:0.55,ry:0.48,c:leafColor,o:0.88},
        {dx:-crRx*0.50,dy:crRy*0.12,rx:0.40,ry:0.42,c:leafColor,o:0.85},
        {dx:crRx*0.50,dy:crRy*0.10,rx:0.38,ry:0.40,c:leafAlt,o:0.85},
        {dx:0,dy:crRy*0.30,rx:0.48,ry:0.35,c:leafColor,o:0.85},
      ].forEach((cp,i) => {
        leafParts.push(el("ellipse",{key:"crbg"+i,cx:cx+cp.dx+sw,cy:crCy+cp.dy,rx:crRx*cp.rx,ry:crRy*cp.ry,fill:cp.c,opacity:cp.o*(0.3+cs*0.7)}));
      });

      // --- INDIVIDUELE BLADEREN bovenop de kruin ---
      // Elk blad is een echt bladvorm (druppelvorm met nerflijn)
      const leafColors = [leafColor, leafAlt, leafLight];
      const totalLeaves = Math.floor(cs * 65); // tot 65 aparte blaadjes

      for (let i = 0; i < totalLeaves; i++) {
        const rng = srand(i*59+17);
        // Positie: willekeurig binnen de kruin-ellips
        const angle = rng()*Math.PI*2;
        const dist = rng()*0.88; // 0..0.88 van de rand
        const lx = cx + Math.cos(angle)*crRx*dist + sw;
        const ly = crCy + Math.sin(angle)*crRy*dist;

        // Check of het punt binnen de kruin valt
        const ndx = (lx-cx-sw)/crRx, ndy = (ly-crCy)/crRy;
        if (ndx*ndx+ndy*ndy > 0.92) continue;

        const sz = 4 + rng()*5; // bladgrootte
        const rot = rng()*360; // willekeurige rotatie
        const lCol = leafColors[i%3];
        const sway = Math.sin(t*0.4+i*0.3)*2;
        const opacity = 0.70 + rng()*0.25;

        // Bladvorm: druppel/ovaal met nerf
        leafParts.push(el("g",{key:"lf"+i,transform:`translate(${lx+sway},${ly}) rotate(${rot})`},
          // Bladlichaam (druppelvorm via path)
          el("path",{
            d:`M0,${-sz*0.5} C${sz*0.4},${-sz*0.35} ${sz*0.45},${sz*0.2} 0,${sz*0.5} C${-sz*0.45},${sz*0.2} ${-sz*0.4},${-sz*0.35} 0,${-sz*0.5}Z`,
            fill:lCol, opacity:opacity
          }),
          // Bladnerf (middelste lijn)
          el("line",{x1:0,y1:-sz*0.35,x2:0,y2:sz*0.35,stroke:"rgba(255,255,255,0.15)",strokeWidth:0.4}),
          // Zijnerven (kleine lijntjes)
          sz > 5 && el("line",{x1:0,y1:-sz*0.1,x2:sz*0.2,y2:-sz*0.2,stroke:"rgba(255,255,255,0.10)",strokeWidth:0.3}),
          sz > 5 && el("line",{x1:0,y1:sz*0.1,x2:-sz*0.2,y2:0,stroke:"rgba(255,255,255,0.10)",strokeWidth:0.3})
        ));
      }

      // Lichtpuntjes op kruin (zon door bladeren)
      if (cs > 0.4 && !isNight) {
        const nSun = Math.floor(cs*8);
        for (let i=0;i<nSun;i++) {
          const rng=srand(i*37+99);
          const sx=cx+(rng()-0.5)*crRx*1.4+sw;
          const sy=crCy+(rng()-0.5)*crRy*1.2;
          const ndx=(sx-cx)/crRx, ndy=(sy-crCy)/crRy;
          if (ndx*ndx+ndy*ndy > 0.7) continue;
          leafParts.push(el("circle",{key:"sun"+i,cx:sx,cy:sy,r:1.5+rng()*2,fill:"#FFFDE0",opacity:0.08+0.12*Math.sin(t*0.8+i)}));
        }
      }
    }

    // --- BLADEREN OP TAKUITEINDEN (zichtbaar bij jonge boom vóór volle kruin) ---
    if (g >= 0.15 && g < 0.50) {
      branchEndpoints.forEach((ep,bi) => {
        const nLeaves = Math.floor(3 + ep.bp * 6);
        const leafColors = [leafColor, leafAlt, leafLight];
        for (let li=0; li<nLeaves; li++) {
          const an = (li/nLeaves)*Math.PI*2 + bi*1.5;
          const dist = 4 + ep.bp*8 + li*1.5;
          const lx = ep.x + Math.cos(an)*dist;
          const ly = ep.y + Math.sin(an)*dist*0.5 - 3;
          const sz = 3 + ep.bp*3;
          const rot = an*180/Math.PI + Math.sin(t*0.5+li)*10;
          leafParts.push(el("path",{
            key:"bl"+bi+"_"+li,
            d:`M${lx},${ly-sz*0.4} C${lx+sz*0.35},${ly-sz*0.25} ${lx+sz*0.35},${ly+sz*0.15} ${lx},${ly+sz*0.4} C${lx-sz*0.35},${ly+sz*0.15} ${lx-sz*0.35},${ly-sz*0.25} ${lx},${ly-sz*0.4}Z`,
            fill:leafColors[(bi+li)%3], opacity:0.75+ep.bp*0.2,
            transform:`rotate(${rot} ${lx} ${ly})`
          }));
        }
      });
    }

    // Sprietje-blaadjes (vroege fase)
    if (g >= 0.06 && g < 0.20) {
      const n = Math.floor(appear(0.06,0.08)*6);
      for (let i=0;i<n;i++) {
        const side=i%2===0?-1:1;
        const ly=trunkTop+trunkH*(0.18+i*0.12);
        const sz=3.5+appear(0.06+i*0.01,0.02)*3.5;
        const rot=side*35+Math.sin(t*0.5+i)*12;
        const lx=cx+side*(3+trunkW*0.5+i*1.2);
        // Bladvorm (druppel)
        leafParts.push(el("path",{
          key:"sl"+i,
          d:`M${lx},${ly-sz*0.4} C${lx+sz*0.35},${ly-sz*0.2} ${lx+sz*0.35},${ly+sz*0.2} ${lx},${ly+sz*0.4} C${lx-sz*0.35},${ly+sz*0.2} ${lx-sz*0.35},${ly-sz*0.2} ${lx},${ly-sz*0.4}Z`,
          fill:[leafColor,leafAlt,leafLight][i%3], opacity:0.82,
          transform:`rotate(${rot} ${lx} ${ly})`
        }));
        // Steeltje dat blad met stam verbindt
        leafParts.push(el("line",{key:"slst"+i,x1:cx+side*trunkW*0.3,y1:ly,x2:lx,y2:ly,stroke:"#6A9A72",strokeWidth:0.6,opacity:0.5}));
      }
    }

    // Glinsterpunten in de kruin
    if (g > 0.40) {
      const nSp=Math.floor(appear(0.40,0.45)*10);
      for (let i=0;i<nSp;i++) {
        const an=t*0.3+i*(Math.PI*2/nSp);
        const crR=25+trunkH*0.20;
        const sx=cx+Math.cos(an)*crR*0.6;
        const sy=(trunkTop+15)+Math.sin(an)*crR*0.3;
        leafParts.push(el("circle",{key:"sp"+i,cx:sx,cy:sy,r:1.3,fill:"#FFFDE0",opacity:(0.1+0.8*Math.abs(Math.sin(t*1.8+i*0.7)))*0.4}));
      }
    }

    // Zaadje
    if (g < 0.06) {
      const ss = g<0.02?1:1-appear(0.02,0.04);
      trunkParts.push(el("g",{key:"seed",transform:`translate(${cx},${groundY-2})`,opacity:0.5+ss*0.5},
        el("ellipse",{cx:0,cy:0,rx:5+ss*2,ry:3+ss,fill:"#8B6914"}),
        g>=0.03 && el("line",{x1:0,y1:-3,x2:0,y2:-3-appear(0.03,0.03)*12,stroke:"#6A9A72",strokeWidth:1.5,strokeLinecap:"round"})
      ));
    }

    // RENDER: stam+takken EERST, dan kruin+bladeren EROVER
    return el("g", { filter: g>0.15?"url(#shadow)":undefined },
      ...trunkParts,
      ...leafParts
    );
  }

  // ═══════════════════════════════════════════════════════════
  // WERELD ELEMENTEN
  // ═══════════════════════════════════════════════════════════

  // Gras
  const grassCount = Math.floor(8+appear(0.05,0.50)*45+Math.min(wi.grass||0,35));
  const grassBlades = Array.from({length:grassCount},(_,i) => {
    const rng=srand(i*73+11);
    const gx=rng()*W, gy=groundY+22+rng()*50;
    const sw=Math.sin(t*0.4+i*0.7)*3.5, gh=7+rng()*9;
    return el("path",{key:"gb"+i,d:`M${gx},${gy} Q${gx+sw},${gy-gh} ${gx+sw*0.5},${gy-gh-3}`,fill:"none",stroke:grassLight,strokeWidth:1+rng()*0.8,strokeLinecap:"round",opacity:0.35+rng()*0.3});
  });

  // Bloemen
  const nFl = Math.min((wi.flowers||0)+Math.floor(appear(0.10,0.45)*10),40);
  const flowerEls = Array.from({length:nFl},(_,i) => {
    const rng=srand(i*137+29);
    const fx=25+rng()*380, fy=groundY+16+rng()*52;
    const fc=flowerColors[i%flowerColors.length], sw=Math.sin(t*0.6+i)*2, fs=2.2+rng()*2;
    return el("g",{key:"fl"+i,transform:`translate(${fx+sw},${fy})`},
      el("line",{x1:0,y1:0,x2:0,y2:-9-rng()*4,stroke:"#6A9A72",strokeWidth:1.1}),
      el("circle",{cx:-fs*0.6,cy:-12,r:fs,fill:fc,opacity:0.82}),
      el("circle",{cx:fs*0.6,cy:-12,r:fs,fill:fc,opacity:0.82}),
      el("circle",{cx:0,cy:-12-fs*0.6,r:fs,fill:fc,opacity:0.82}),
      el("circle",{cx:0,cy:-12+fs*0.4,r:fs*0.7,fill:fc,opacity:0.72}),
      el("circle",{cx:0,cy:-12,r:fs*0.45,fill:"#FFE066"})
    );
  });

  // Bloemenweide links (g>=0.45)
  const mP=appear(0.45,0.20);
  const meadow = g>=0.45 ? Array.from({length:Math.floor(mP*18)},(_,i) => {
    const rng=srand(i*89+201);
    const mx=10+rng()*110, my=groundY+28+rng()*32;
    const mc=flowerColors[i%flowerColors.length], sw=Math.sin(t*0.5+i*0.8)*2;
    return el("g",{key:"mf"+i,transform:`translate(${mx+sw},${my})`},
      el("line",{x1:0,y1:0,x2:0,y2:-6,stroke:"#6A9A72",strokeWidth:0.8}),
      el("circle",{cx:0,cy:-8,r:2.2,fill:mc,opacity:0.75}),
      el("circle",{cx:0,cy:-8,r:1,fill:"#FFE066"})
    );
  }) : [];

  // Stenen
  const nSt = Math.min((wi.stones||0)+Math.floor(appear(0.06,0.25)*5),18);
  const stoneEls = Array.from({length:nSt},(_,i) => {
    const rng=srand(i*113+41);
    const sx=20+rng()*390, sy=groundY+38+rng()*42, sr=2.5+rng()*5;
    return el("g",{key:"st"+i},
      el("ellipse",{cx:sx,cy:sy,rx:sr,ry:sr*0.55,fill:"#9A9080",opacity:0.6}),
      el("ellipse",{cx:sx-sr*0.2,cy:sy-sr*0.15,rx:sr*0.5,ry:sr*0.25,fill:"rgba(255,255,255,0.07)"})
    );
  });

  // Paddenstoelen
  const nSh = Math.min((wi.shrooms||0)+Math.floor(appear(0.18,0.25)*4),14);
  const shroomEls = Array.from({length:nSh},(_,i) => {
    const rng=srand(i*149+53);
    const mx=35+rng()*360, my=groundY+24+rng()*38, red=rng()>0.4;
    return el("g",{key:"sh"+i,transform:`translate(${mx},${my})`},
      el("rect",{x:-1.3,y:-4.5,width:2.6,height:6.5,rx:0.8,fill:"#E8D8C0"}),
      el("ellipse",{cx:0,cy:-6,rx:5.5,ry:4,fill:red?"#D04030":"#E8A840"}),
      el("circle",{cx:-1.8,cy:-6.8,r:0.9,fill:"white",opacity:0.65}),
      el("circle",{cx:1.8,cy:-5.5,r:0.7,fill:"white",opacity:0.55})
    );
  });

  // Fairy ring (g>=0.72)
  const fairyRing = g>=0.72 ? el("g",{opacity:appear(0.72,0.08)},
    ...Array.from({length:8},(_,i) => {
      const an=(i/8)*Math.PI*2, rx=340+Math.cos(an)*22, ry=groundY+48+Math.sin(an)*11;
      return el("g",{key:"fr"+i,transform:`translate(${rx},${ry})`},
        el("rect",{x:-1,y:-3.5,width:2,height:4.5,rx:0.5,fill:"#E8D8C0"}),
        el("ellipse",{cx:0,cy:-4.5,rx:3.8,ry:2.8,fill:"#D04030"}),
        el("circle",{cx:-0.8,cy:-5,r:0.6,fill:"white",opacity:0.55})
      );
    })
  ) : null;

  // Struiken
  const nBu = Math.min((wi.bushes||0)+Math.floor(appear(0.12,0.30)*4),12);
  const bushEls = Array.from({length:nBu},(_,i) => {
    const rng=srand(i*163+67);
    const bx=15+rng()*400, by=groundY+20+rng()*22, sw=Math.sin(t*0.3+i*1.1)*1.2;
    return el("g",{key:"bu"+i,transform:`translate(${bx+sw},${by})`},
      el("ellipse",{cx:0,cy:0,rx:15,ry:10,fill:grassLight,opacity:0.72}),
      el("ellipse",{cx:-6,cy:-3,rx:10,ry:7,fill:leafColor,opacity:0.6}),
      el("ellipse",{cx:6,cy:-2,rx:8,ry:6,fill:leafAlt,opacity:0.6})
    );
  });

  // Hutje (g>=0.62)
  const hP=appear(0.62,0.10);
  const hut = g>=0.62 ? el("g",{opacity:hP,transform:`translate(375,${groundY-8})`},
    el("rect",{x:-18,y:-22,width:36,height:28,rx:2,fill:"#B08A5A"}),
    el("rect",{x:-15,y:-20,width:30,height:24,rx:1,fill:"#C49A6A"}),
    el("polygon",{points:"-24,-22 0,-40 24,-22",fill:"#8A4030"}),
    el("polygon",{points:"-22,-22 0,-38 22,-22",fill:"#A05040"}),
    el("rect",{x:-5,y:-6,width:10,height:12,rx:1,fill:"#6A4020"}),
    el("circle",{cx:3,cy:0,r:1,fill:"#E8C840"}),
    el("rect",{x:-14,y:-16,width:7,height:7,rx:1,fill:"#FFE87C",opacity:isNight?0.8:0.3}),
    el("line",{x1:-14,y1:-12.5,x2:-7,y2:-12.5,stroke:"#6A4020",strokeWidth:0.5}),
    el("line",{x1:-10.5,y1:-16,x2:-10.5,y2:-9,stroke:"#6A4020",strokeWidth:0.5}),
    el("rect",{x:8,y:-38,width:6,height:14,rx:1,fill:"#806050"}),
    ...Array.from({length:3},(_,i) => el("circle",{key:"smk"+i,cx:11+Math.sin(t*0.2+i*0.8)*5,cy:-42-i*12-Math.sin(t*0.3+i)*3,r:3+i*2,fill:"white",opacity:0.1-i*0.025}))
  ) : null;

  // Lantaarn
  const lantern = g>=0.10 ? el("g",{key:"lan",transform:`translate(${cx-35},${groundY-3})`,opacity:appear(0.10,0.06)},
    el("rect",{x:-2.5,y:-16,width:5,height:13,rx:1,fill:"#5A4A3A"}),
    el("rect",{x:-4.5,y:-18,width:9,height:3.5,rx:1.5,fill:"#6A5A4A"}),
    el("circle",{cx:0,cy:-12,r:2.8,fill:isNight||isEvening?"#FFD060":"#E8C840",opacity:isNight?0.9:isEvening?0.7:0.3}),
    (isNight||isEvening)&&el("circle",{cx:0,cy:-12,r:9,fill:"#FFE87C",opacity:0.1})
  ) : null;

  // Bankje (g>=0.68)
  const bench = g>=0.68 ? el("g",{opacity:appear(0.68,0.08),transform:`translate(${cx+50},${groundY+6})`},
    el("rect",{x:-14,y:-2,width:3,height:9,fill:"#6A5030"}),el("rect",{x:11,y:-2,width:3,height:9,fill:"#6A5030"}),
    el("rect",{x:-16,y:-4,width:32,height:3.5,rx:1,fill:"#A08050"}),
    el("rect",{x:-15,y:-13,width:30,height:2.5,rx:1,fill:"#8A6A40"}),
    el("rect",{x:-14,y:-4,width:2,height:-9,fill:"#6A5030"}),el("rect",{x:12,y:-4,width:2,height:-9,fill:"#6A5030"})
  ) : null;

  // Schommel (g>=0.78)
  const swP = appear(0.78,0.08);
  const swAn = Math.sin(t*0.6)*8*swP;
  const tH2 = 8+appear(0.02,0.70)*210;
  const swing = g>=0.78 ? el("g",{opacity:swP,transform:`translate(${cx-45},${groundY-tH2*0.68}) rotate(${swAn} 0 0)`},
    el("line",{x1:0,y1:0,x2:-7,y2:55,stroke:"#8A7A60",strokeWidth:1.3}),
    el("line",{x1:0,y1:0,x2:7,y2:55,stroke:"#8A7A60",strokeWidth:1.3}),
    el("rect",{x:-9,y:53,width:18,height:3.5,rx:1.5,fill:"#A08050"})
  ) : null;

  // Nest (g>=0.52)
  const nest = g>=0.52 ? el("g",{key:"nest",transform:`translate(${cx+42},${groundY-tH2*0.70})`,opacity:appear(0.52,0.06)},
    el("ellipse",{cx:0,cy:0,rx:11,ry:4.5,fill:"#8A6A40"}),
    el("path",{d:"M-9,0 Q-11,-3 -7,-4.5 Q-3,-6.5 0,-3.5 Q3,-6.5 7,-4.5 Q11,-3 9,0",fill:"#A08050"}),
    g>=0.56 && el("ellipse",{cx:-2.5,cy:-3,rx:2.2,ry:3.2,fill:"#E8E0D0"}),
    g>=0.60 && el("ellipse",{cx:2.5,cy:-2.5,rx:2.2,ry:3.2,fill:"#E8E0D0"})
  ) : null;

  // Hek (g>=0.65)
  const fence = g>=0.65 ? el("g",{opacity:appear(0.65,0.08)},
    ...Array.from({length:5},(_,i) => {
      const fx=cx+18+i*13, fy=groundY+18;
      return el("g",{key:"fn"+i},
        el("rect",{x:fx-1.3,y:fy-13,width:2.6,height:15,rx:0.5,fill:"#B09060"}),
        i<4&&el("rect",{x:fx+1.3,y:fy-11,width:11,height:1.8,rx:0.5,fill:"#A08050"}),
        i<4&&el("rect",{x:fx+1.3,y:fy-5.5,width:11,height:1.8,rx:0.5,fill:"#A08050"})
      );
    })
  ) : null;

  // ═══════════════════════════════════════════════════════════
  // DIEREN — verfijnde vormen
  // ═══════════════════════════════════════════════════════════

  // Konijn (goed — behouden)
  const bunnyX=95+Math.sin(t*0.15)*28, bunnyY=groundY+28, bHop=Math.abs(Math.sin(t*0.8))*4;
  const bunny = totalSessions>=3 ? el("g",{key:"bunny",transform:`translate(${bunnyX},${bunnyY-bHop})`},
    el("ellipse",{cx:0,cy:0,rx:9,ry:7,fill:"#F0E8DC"}),
    el("circle",{cx:7,cy:-4.5,r:5.5,fill:"#F0E8DC"}),
    el("ellipse",{cx:4.5,cy:-13,rx:2.2,ry:6.5,fill:"#F0E8DC"}),el("ellipse",{cx:4.5,cy:-13,rx:1.3,ry:4.5,fill:"#F0C8C0"}),
    el("ellipse",{cx:10,cy:-12,rx:2.2,ry:5.5,fill:"#F0E8DC"}),el("ellipse",{cx:10,cy:-12,rx:1.3,ry:4,fill:"#F0C8C0"}),
    el("circle",{cx:10,cy:-4.5,r:1.1,fill:"#2A2A2A"}),el("circle",{cx:12,cy:-2.5,r:0.5,fill:"#E0A0A0"}),
    el("circle",{cx:-7,cy:2,r:2.8,fill:"#F0E8DC"})
  ) : null;

  // Eekhoorn — ronde vormen, pluizige staart
  const squirrel = g>=0.20 ? el("g",{key:"sq",transform:`translate(${cx+18},${groundY+4})`,opacity:appear(0.20,0.05)},
    el("ellipse",{cx:0,cy:0,rx:5,ry:4,fill:"#A06830"}), // lichaam
    el("circle",{cx:5,cy:-3,r:3.2,fill:"#A06830"}), // hoofd
    el("circle",{cx:7,cy:-4,r:0.6,fill:"#2A2A2A"}), // oog
    el("ellipse",{cx:4,cy:-6.5,rx:1.5,ry:2,fill:"#B07838"}), // oor (rond, klein)
    el("path",{d:"M-4,0 C-8,-4 -10,-12 -6,-16",fill:"none",stroke:"#B07838",strokeWidth:4,strokeLinecap:"round"}), // staart
    el("circle",{cx:-6,cy:-16,r:3,fill:"#C08840"}), // staartpluim
    el("ellipse",{cx:0,cy:3,rx:2,ry:1,fill:"#8A5828"}) // pootje
  ) : null;

  // Vos — sierlijk, puntige snuit, driehoekige oren
  const foxX=315+Math.sin(t*0.12+2)*22, foxY=groundY+33;
  const fox = (g>=0.38&&totalSessions>=10) ? el("g",{key:"fox",transform:`translate(${foxX},${foxY})`,opacity:appear(0.38,0.08)},
    el("ellipse",{cx:0,cy:0,rx:12,ry:7,fill:"#D4783C"}), // lichaam
    el("ellipse",{cx:0,cy:2,rx:8,ry:4,fill:"#F0E8DC",opacity:0.6}), // witte buik
    el("ellipse",{cx:-11,cy:-3,r:6,rx:6,ry:5,fill:"#D4783C"}), // hoofd
    el("path",{d:"M-14,-8 L-12.5,-14 L-10.5,-8",fill:"#D4783C",stroke:"#D4783C",strokeWidth:0.5}), // linkeroor
    el("path",{d:"M-14,-8.5 L-12.8,-12 L-11.2,-8.5",fill:"#1A1A1A",opacity:0.3}), // oor binnen
    el("path",{d:"M-8,-8 L-6.5,-13.5 L-4.5,-8",fill:"#D4783C",stroke:"#D4783C",strokeWidth:0.5}), // rechteroor
    el("path",{d:"M-8,-8.5 L-6.8,-11.5 L-5.2,-8.5",fill:"#1A1A1A",opacity:0.3}), // oor binnen
    el("circle",{cx:-13,cy:-4,r:0.8,fill:"#2A2A2A"}), // oog
    el("ellipse",{cx:-16,cy:-1.5,rx:1.2,ry:0.8,fill:"#1A1A1A"}), // neus
    el("ellipse",{cx:-11,cy:0.5,rx:3,ry:2,fill:"#F0E8DC"}), // witte snuit
    el("path",{d:"M11,0 Q18,-3 22,1",fill:"none",stroke:"#D4783C",strokeWidth:4,strokeLinecap:"round"}), // staart
    el("circle",{cx:22,cy:1,r:2.5,fill:"#F0E8DC"}) // witte staartpunt
  ) : null;

  // Roodborstje op tak
  const birdY2 = g>=0.28 ? groundY-tH2*0.76 : null;
  const bird = g>=0.28 ? el("g",{key:"bird",transform:`translate(${cx+32},${birdY2})`,opacity:appear(0.28,0.06)},
    el("ellipse",{cx:0,cy:0,rx:5.5,ry:4.5,fill:"#8A7060"}), // lichaam bruin
    el("ellipse",{cx:0,cy:1,rx:3.5,ry:2.5,fill:"#E05030"}), // rode borst
    el("circle",{cx:5,cy:-2.5,r:3.5,fill:"#8A7060"}), // hoofd
    el("circle",{cx:7,cy:-3,r:0.8,fill:"#2A2A2A"}), // oog
    el("polygon",{points:"9,-2.5 12,-1.5 9,-0.5",fill:"#E8A020"}), // snaveltje
    el("path",{d:`M-3,-2 Q-2,${-4+Math.sin(t*3)*4} -6,${-3+Math.sin(t*3)*4}`,fill:"none",stroke:"#6A5A48",strokeWidth:1.8,strokeLinecap:"round"}), // vleugeltje
    el("line",{x1:2,y1:4,x2:1,y2:7,stroke:"#6A5A48",strokeWidth:0.8}), // pootje
    el("line",{x1:4,y1:4,x2:5,y2:7,stroke:"#6A5A48",strokeWidth:0.8}) // pootje
  ) : null;

  // Kat — slapend, opgerold
  const cat = (isNight||isEvening)&&totalSessions>=5 ? el("g",{key:"cat",transform:`translate(${cx-55},${groundY+38})`},
    el("ellipse",{cx:0,cy:0,rx:13,ry:7,fill:"#8A8A90"}), // lichaam
    el("circle",{cx:10,cy:-2,r:5.5,fill:"#8A8A90"}), // hoofd
    el("path",{d:"M6.5,-6.5 L8,-11 L10,-6.5",fill:"#8A8A90"}), // linkeroor (driehoek)
    el("path",{d:"M7,-7 L8.2,-9.5 L9.5,-7",fill:"#B0A0A0"}), // oor binnen
    el("path",{d:"M11,-6.5 L13,-10.5 L15,-6",fill:"#8A8A90"}), // rechteroor
    el("path",{d:"M11.5,-7 L13,-9 L14.2,-6.5",fill:"#B0A0A0"}), // oor binnen
    el("path",{d:"M12.5,-3 Q14,-2 15.5,-3",fill:"none",stroke:"#2A2A2A",strokeWidth:0.6}), // gesloten ogen
    el("ellipse",{cx:13,cy:-0.5,rx:0.6,ry:0.4,fill:"#E0A0A0"}), // neusje
    el("path",{d:"M-12,2 Q-16,0 -18,4 Q-16,6 -12,4",fill:"#8A8A90"}), // staart opgerold
    el("ellipse",{cx:5,cy:4,rx:3,ry:1.5,fill:"#7A7A80"}) // voorpootje
  ) : null;

  // Uil — grote ogen, verentoefjes
  const owl = (isNight&&g>=0.70) ? el("g",{key:"owl",transform:`translate(${cx-18},${groundY-tH2*0.63})`,opacity:appear(0.70,0.06)},
    el("ellipse",{cx:0,cy:0,rx:7,ry:9,fill:"#8A7A60"}), // lichaam
    el("ellipse",{cx:0,cy:2,rx:5,ry:4,fill:"#A09070",opacity:0.5}), // buik
    el("circle",{cx:-3,cy:-4,r:3.8,fill:"#C0B090"}), // linkeroog-ring
    el("circle",{cx:3,cy:-4,r:3.8,fill:"#C0B090"}), // rechteroog-ring
    el("circle",{cx:-3,cy:-4,r:2,fill:"#2A2A2A"}), // oog
    el("circle",{cx:3,cy:-4,r:2,fill:"#2A2A2A"}), // oog
    el("circle",{cx:-3,cy:-4,r:0.8,fill:"#FFE060",opacity:0.5+0.5*Math.sin(t*0.3)}), // glans
    el("circle",{cx:3,cy:-4,r:0.8,fill:"#FFE060",opacity:0.5+0.5*Math.sin(t*0.3+0.5)}), // glans
    el("polygon",{points:"-0.8,-1 0,1.5 0.8,-1",fill:"#C08030"}), // snavel
    el("path",{d:"M-5,-9 L-3.5,-14 L-2,-9",fill:"#8A7A60"}), // verentoef links
    el("path",{d:"M2,-9 L3.5,-14 L5,-9",fill:"#8A7A60"}), // verentoef rechts
    el("line",{x1:-2,y1:8,x2:-3,y2:11,stroke:"#6A5A48",strokeWidth:0.8}), // poot
    el("line",{x1:2,y1:8,x2:3,y2:11,stroke:"#6A5A48",strokeWidth:0.8}) // poot
  ) : null;

  // Hertje — elegant, bambi-achtig
  const deerShow = g>=0.82&&((Math.floor(t*0.01)+totalSessions)%7<2);
  const deer = deerShow ? el("g",{key:"deer",transform:`translate(${55+Math.sin(t*0.08)*35},${groundY+12})`,opacity:0.65},
    el("ellipse",{cx:0,cy:0,rx:13,ry:8,fill:"#C09060"}), // lichaam
    el("ellipse",{cx:2,cy:2,rx:8,ry:4,fill:"#E0C8A0",opacity:0.4}), // lichte buik
    el("ellipse",{cx:13,cy:-10,rx:4,ry:5.5,fill:"#C09060"}), // hoofd (ovaal, niet rond)
    el("circle",{cx:15,cy:-11,r:0.8,fill:"#2A2A2A"}), // oog
    el("ellipse",{cx:16.5,cy:-8,rx:0.8,ry:0.5,fill:"#1A1A1A"}), // neusje
    el("ellipse",{cx:11,cy:-15,rx:1.8,ry:3.5,fill:"#C09060",transform:"rotate(-20 11 -15)"}), // linkeroor
    el("ellipse",{cx:11,cy:-15,rx:1,ry:2.5,fill:"#D8B088",transform:"rotate(-20 11 -15)"}), // oor binnen
    el("ellipse",{cx:15,cy:-15,rx:1.8,ry:3.5,fill:"#C09060",transform:"rotate(15 15 -15)"}), // rechteroor
    el("ellipse",{cx:15,cy:-15,rx:1,ry:2.5,fill:"#D8B088",transform:"rotate(15 15 -15)"}), // oor binnen
    el("line",{x1:-6,y1:7,x2:-6,y2:17,stroke:"#A07848",strokeWidth:1.8}), // poten
    el("line",{x1:-2,y1:7,x2:-2,y2:17,stroke:"#A07848",strokeWidth:1.8}),
    el("line",{x1:4,y1:7,x2:4,y2:17,stroke:"#A07848",strokeWidth:1.8}),
    el("line",{x1:8,y1:7,x2:8,y2:17,stroke:"#A07848",strokeWidth:1.8}),
    // Witte stippen
    el("circle",{cx:-4,cy:-2,r:0.8,fill:"#E8DCC8",opacity:0.4}),
    el("circle",{cx:3,cy:-4,r:0.8,fill:"#E8DCC8",opacity:0.4}),
    el("circle",{cx:7,cy:-1,r:0.8,fill:"#E8DCC8",opacity:0.4})
  ) : null;

  // Egel — bolletje met stekels
  const hogShow = g>=0.42&&((Math.floor(t*0.008)+totalSessions*3)%11<3);
  const hedgehog = hogShow ? el("g",{key:"hog",transform:`translate(${275+Math.sin(t*0.1)*14},${groundY+43})`},
    el("ellipse",{cx:0,cy:0,rx:8,ry:5,fill:"#8A7060"}), // lichaam
    el("circle",{cx:7,cy:-1,r:3,fill:"#C0A080"}), // snoetje
    el("circle",{cx:9,cy:-2,r:0.5,fill:"#2A2A2A"}), // oog
    el("ellipse",{cx:10.5,cy:-0.5,rx:0.5,ry:0.4,fill:"#1A1A1A"}), // neusje
    ...Array.from({length:9},(_,i) => {
      const sa=-1.0+i*0.22;
      return el("line",{key:"hsp"+i,x1:Math.cos(sa)*4,y1:Math.sin(sa)*3-1.5,x2:Math.cos(sa)*9.5,y2:Math.sin(sa)*6.5-2,stroke:"#5A4A38",strokeWidth:0.8,strokeLinecap:"round"});
    }),
    el("ellipse",{cx:5,cy:3.5,rx:1.5,ry:0.8,fill:"#A08868"}) // pootje
  ) : null;

  // Schildpad — schattig schild
  const trtShow = g>=0.52&&((Math.floor(t*0.005)+totalSessions*7)%13<2);
  const turtle = trtShow ? el("g",{key:"trt",transform:`translate(${195+Math.sin(t*0.05)*18},${groundY+53})`,opacity:0.7},
    el("ellipse",{cx:0,cy:0,rx:9,ry:6,fill:"#5A8A50"}), // schild
    el("ellipse",{cx:0,cy:0,rx:7,ry:4,fill:"#4A7A40"}), // schild patroon
    el("ellipse",{cx:0,cy:0,rx:3,ry:2,fill:"#3A6830",opacity:0.3}), // midden
    el("circle",{cx:9,cy:0,r:2.8,fill:"#7AAA68"}), // hoofd
    el("circle",{cx:11,cy:-0.8,r:0.5,fill:"#2A2A2A"}), // oog
    el("ellipse",{cx:-8,cy:3.5,rx:2,ry:1.2,fill:"#6A9A58"}), // achterpoot
    el("ellipse",{cx:-7,cy:-3.5,rx:2,ry:1.2,fill:"#6A9A58"}), // achterpoot
    el("ellipse",{cx:6,cy:3.5,rx:2,ry:1.2,fill:"#6A9A58"}), // voorpoot
    el("ellipse",{cx:6,cy:-3.5,rx:2,ry:1.2,fill:"#6A9A58"}) // voorpoot
  ) : null;

  // Vlinders
  const nBf = season!=="Winter" ? 2+Math.floor(appear(0.12,0.45)*5) : 0;
  const butterflies = nBf>0 ? Array.from({length:nBf},(_,i) => {
    const bx=75+(i*97%265)+Math.sin(t*0.4+i*2)*38;
    const by=groundY-55-(i*43%115)+Math.cos(t*0.3+i)*18;
    const ws=3.5+2.8*Math.abs(Math.sin(t*4+i*1.5));
    const bc=["#E07850","#A060D0","#E060A0","#50C080","#5BA3D9"];
    return el("g",{key:"bf"+i,transform:`translate(${bx},${by})`},
      el("ellipse",{cx:-ws,cy:-1.8,rx:ws,ry:3.5,fill:bc[i%5],opacity:0.7}),
      el("ellipse",{cx:ws,cy:-1.8,rx:ws,ry:3.5,fill:bc[i%5],opacity:0.7}),
      el("ellipse",{cx:0,cy:0,rx:1.2,ry:2.5,fill:"#3A3A3A"})
    );
  }) : [];

  // Libellen (g>=0.60)
  const dragonflies = g>=0.60 ? Array.from({length:Math.floor(appear(0.60,0.10)*4)},(_,i) => {
    const dx=90+i*55+Math.sin(t*0.6+i*2)*28, dy=groundY+28+Math.cos(t*0.4+i*1.5)*14;
    const wf=Math.sin(t*6+i*2)*0.5;
    return el("g",{key:"df"+i,transform:`translate(${dx},${dy})`},
      el("ellipse",{cx:0,cy:0,rx:7,ry:1.3,fill:"rgba(180,220,255,0.45)",transform:`rotate(${14*wf})`}),
      el("ellipse",{cx:0,cy:0,rx:7,ry:1.3,fill:"rgba(180,220,255,0.45)",transform:`rotate(${-14*wf})`}),
      el("ellipse",{cx:0,cy:0,rx:1.3,ry:3.5,fill:"#4090C0",opacity:0.65})
    );
  }) : [];

  // Vuurvliegjes
  const fireflies = (isNight||isEvening) ? Array.from({length:8+Math.floor(g*14)},(_,i) => {
    const fx=25+(i*83%375)+Math.sin(t*0.3+i*1.7)*22;
    const fy=75+(i*67%410)+Math.cos(t*0.2+i*1.3)*14;
    return el("circle",{key:"ff"+i,cx:fx,cy:fy,r:2.2,fill:"#FFE87C",opacity:(0.2+0.8*Math.abs(Math.sin(t*1.5+i*0.9)))*0.65,filter:"url(#glow)"});
  }) : [];

  // Vallende bladeren
  const fallingLeaves = season==="Herfst" ? Array.from({length:6+Math.floor(g*7)},(_,i) => {
    const lx=(45+i*53+t*18*(0.5+i*0.1))%W, ly=(i*67+t*28*(0.3+i*0.08))%(groundY+35);
    const rot=t*55+i*45, lc=["#D4842A","#E6A832","#C4553A"];
    return el("ellipse",{key:"lf"+i,cx:lx,cy:ly,rx:3.5,ry:2.2,fill:lc[i%3],opacity:0.6,transform:`rotate(${rot} ${lx} ${ly})`});
  }) : [];

  // Sneeuw
  const snow = season==="Winter" ? Array.from({length:16+Math.floor(g*16)},(_,i) => {
    const sx=(28+i*71+t*8*(0.3+i*0.05))%W, sy=(i*43+t*14*(0.4+i*0.06))%(H-45);
    return el("circle",{key:"sn"+i,cx:sx,cy:sy,r:1.8+(i%3),fill:"white",opacity:0.45+(i%2)*0.2});
  }) : [];

  // Regenboog (g>=0.85)
  const rainbow = (g>=0.85&&!isNight) ? el("g",{opacity:appear(0.85,0.06)*0.22},
    ...["#E05030","#E8A020","#E8E040","#50B050","#5080D0","#8050C0"].map((c,i) =>
      el("path",{key:"rb"+i,d:`M${45+i*5},${groundY+i*4} Q215,${groundY-195+i*8} ${385-i*5},${groundY+i*4}`,fill:"none",stroke:c,strokeWidth:3.5})
    )
  ) : null;

  // Glinstering (g>=0.88)
  const worldSparkles = g>=0.88 ? Array.from({length:Math.floor(appear(0.88,0.12)*22)},(_,i) => {
    const rng=srand(i*131+99);
    return el("circle",{key:"ws"+i,cx:rng()*W,cy:groundY+rng()*75,r:1.1,fill:"#FFFDE0",opacity:(0.1+0.9*Math.abs(Math.sin(t*2+i*0.6)))*0.35});
  }) : [];

  const rareEl = rareAnimal ? el("text",{key:"rare",x:cx-60,y:groundY+10,fontSize:28,opacity:0.5+0.5*Math.abs(Math.sin(t)),style:{cursor:"pointer"}},rareAnimal) : null;
  const overlay = el("rect",{x:0,y:0,width:W,height:H,fill:todOverlay,pointerEvents:"none"});
  const tapAreaEl = el("rect",{x:cx-100,y:groundY-250,width:200,height:200,fill:"transparent",style:{cursor:"pointer"},onClick:tapA});

  // ═══════════════════════════════════════════════════════════
  // RENDER VOLGORDE
  // ═══════════════════════════════════════════════════════════
  return el("div",{style:{width:"100%",height:"100%",position:"relative",overflow:"hidden"}},
    el("svg",{viewBox:`0 0 ${W} ${H}`,style:{width:"100%",height:"100%",display:"block"},preserveAspectRatio:"xMidYMid slice"},
      defs,
      // Lucht
      skyBg, sunMoon, stars, rainbow, clouds, ...flyingBirds,
      // Diepte: bergen → heuvels → bos
      mountains, farHills, bgForest, bgRocks,
      // Grond + water
      ground, stream, pathEl, bridge,
      // Wereld items
      ...grassBlades, ...bushEls, ...stoneEls, ...shroomEls,
      fairyRing, hut,
      ...flowerEls, ...meadow,
      waterfall,
      // Boom
      renderTree(), lantern, nest, swing, bench, fence,
      // Dieren
      bunny, fox, squirrel, bird, cat, owl, deer, hedgehog, turtle,
      // Effecten
      ...butterflies, ...dragonflies, ...fireflies,
      ...fallingLeaves, ...snow, ...worldSparkles,
      rareEl, overlay, tapAreaEl
    )
  );
}
