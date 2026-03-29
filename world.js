// ================================================================
// HUXI App — BoomCanvas (Wereld Animatie)
// Canvas-gebaseerde boom en wereld met:
//   - Seizoenen (Lente/Zomer/Herfst/Winter)
//   - Dag/nacht cyclus
//   - Bewegende dieren (vlinders, vuurvliegjes, hert, konijn...)
//   - Groeiende boom op basis van gebruikersactiviteit
// ================================================================

function BoomCanvas({ season, growth, wp, tod, c, totalSessions, wi, accType, tapA, rareAnimal }) {
  const canvasRef = React.useRef(null);
  const animRef = React.useRef(null);
  const animTRef = React.useRef(0);

  // Vlinders state
  const butterfliesRef = React.useRef(
    Array.from({length:6},(_,i)=>({
      x:50+i*42, y:220-i*12,
      vx:(Math.random()-0.5)*0.8,
      vy:(Math.random()-0.5)*0.4,
      phase:i*1.2,
      flapSpeed:3+Math.random()*2,
      col:['rgba(255,130,0,0.80)','rgba(140,60,220,0.78)','rgba(240,60,130,0.75)','rgba(50,180,100,0.78)','rgba(255,200,50,0.78)','rgba(255,80,80,0.75)'][i],
      r:4.5+Math.random()*2,
      angle:Math.random()*Math.PI*2,
      turnSpeed:(Math.random()-0.5)*0.04,
      wobble:Math.random()*100,
    }))
  );

  // Vuurvliegjes state
  const firefliesRef = React.useRef(
    Array.from({length:16},(_,i)=>({
      x:20+Math.random()*300,
      y:80+Math.random()*160,
      vx:(Math.random()-0.5)*0.3,
      vy:(Math.random()-0.5)*0.22,
      phase:Math.random()*Math.PI*2,
      pulseSpeed:1.2+Math.random()*1.8,
      glowR:4+Math.random()*4,
      brightness:0.5+Math.random()*0.5,
      angle:Math.random()*Math.PI*2,
      turnSpeed:(Math.random()-0.5)*0.05,
      wobble:Math.random()*200,
    }))
  );

  // Canvas sizing — moet VOOR de animatie-loop, en opnieuw bij resize
  React.useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      const rect = cv.getBoundingClientRect();
      const w = rect.width > 0 ? rect.width : cv.offsetWidth || 340;
      const h = rect.height > 0 ? rect.height : cv.offsetHeight || 420;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  React.useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    // Wacht tot canvas afmetingen bekend zijn
    function startLoop() {
      if (cv.width === 0 || cv.height === 0) {
        const dpr = window.devicePixelRatio || 1;
        const w = cv.offsetWidth || 340;
        const h = cv.offsetHeight || 420;
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }

    const ctx = cv.getContext('2d');
    const CVW = cv.width, CVH = cv.height;
    const CX = CVW/2, GY = Math.round(CVH*0.745);

    const isN = tod === 'Nacht';
    const isW = season === 'Winter';
    const isH = season === 'Herfst';
    const isL = season === 'Lente';
    const isZ = season === 'Zomer';

    // Leaf kleuren uit SC
    const GR = [c.lf, c.la, c.ll||c.la, c.lf, c.la, c.ll||c.la, c.lf, c.la, c.ll||c.la, c.lf, c.la, c.ll||c.la];

    function ease(g,lo,hi){if(g<=lo)return 0;if(g>=hi)return 1;const t=(g-lo)/(hi-lo);return t*t*(3-2*t);}

    function leaves(x,y,r,alpha,seed){
      if(r<1.5||alpha<=0.02)return;seed=seed||0;
      const pts=[[0,0,1.0],[-.48,.26,.90],[.48,.26,.90],[-.28,-.50,.84],[.28,-.50,.84],[0,-.64,.80],[-.70,-.08,.72],[.70,-.08,.72],[0,.54,.70],[-.52,-.32,.64],[.52,-.32,.64],[-.18,-.78,.60],[.18,-.78,.60],[-.78,.18,.56],[.78,.18,.56],[0,-.90,.52],[-.60,.46,.48],[.60,.46,.48],[-.36,.70,.44],[.36,.70,.44],[-.85,-.28,.36],[.85,-.28,.36],[-.42,-.66,.34],[.42,-.66,.34]];
      for(const[dx,dy,rs]of pts){ctx.globalAlpha=Math.min(1,alpha*(0.58+rs*0.36));ctx.fillStyle=GR[((seed+Math.floor((dx+dy+2)*3))&11)%GR.length];ctx.beginPath();ctx.arc(x+dx*r,y+dy*r,r*rs,0,Math.PI*2);ctx.fill();}
      ctx.globalAlpha=1;
    }

    function branch(x,y,ang,len,w,depth,g,glo,ghi,blo,bhi,leafR,leafA,seed){
      const bt=ease(g,blo,bhi),tt=ease(g,glo,ghi);if(bt<=0&&tt<=0)return;
      const gl2=len*Math.max(bt,tt),ex=x+Math.cos(ang)*gl2,ey=y+Math.sin(ang)*gl2;
      if(!isW&&bt>0.15&&depth>=1){const mt=ease(g,blo+(bhi-blo)*0.3,bhi);if(mt>0.05){const mx=x+Math.cos(ang)*gl2*0.48,my=y+Math.sin(ang)*gl2*0.48,sr=leafR*0.40*mt;if(sr>2){leaves(mx-Math.sin(ang)*sr*0.7,my+Math.cos(ang)*sr*0.7,sr,leafA*0.52*mt,seed+1);leaves(mx+Math.sin(ang)*sr*0.7,my-Math.cos(ang)*sr*0.7,sr,leafA*0.52*mt,seed+2);}}}
      if(tt>0){ctx.strokeStyle='rgba(52,33,8,0.88)';ctx.lineWidth=Math.max(0.4,w*(0.4+tt*0.6));ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(ex,ey);ctx.stroke();}
      if(depth<=0){if(!isW&&bt>0)leaves(ex,ey,leafR*bt,leafA*bt,seed);return;}
      const sp=0.40+depth*0.05,clo=glo+(ghi-glo)*0.28,chi=Math.min(1,ghi+0.04),cblo=blo+(bhi-blo)*0.20,cbhi=Math.min(1,bhi+0.03),cl=len*0.70,cw=w*0.63;
      branch(ex,ey,ang-sp,cl,cw,depth-1,g,clo,chi,cblo,cbhi,leafR*0.85,leafA,seed+3);
      branch(ex,ey,ang+sp,cl,cw,depth-1,g,clo,chi,cblo,cbhi,leafR*0.85,leafA,seed+5);
      if(depth>=2)branch(ex,ey,ang-sp*0.10,cl*0.78,cw*0.75,depth-1,g,clo,chi,cblo,cbhi,leafR*0.78,leafA*0.90,seed+7);
      if(depth>=3){branch(ex,ey,ang-sp*0.62,cl*0.60,cw*0.52,depth-2,g,clo+0.04,Math.min(1,chi+0.04),cblo+0.03,Math.min(1,cbhi+0.03),leafR*0.62,leafA*0.75,seed+9);branch(ex,ey,ang+sp*0.62,cl*0.60,cw*0.52,depth-2,g,clo+0.04,Math.min(1,chi+0.04),cblo+0.03,Math.min(1,cbhi+0.03),leafR*0.62,leafA*0.75,seed+11);}
    }

    function updateButterfly(b,dt){
      b.wobble+=dt;b.angle+=b.turnSpeed+Math.sin(b.wobble*0.7)*0.02;
      b.vx=Math.cos(b.angle)*0.6+Math.sin(b.wobble*0.5)*0.3;
      b.vy=Math.sin(b.angle)*0.3+Math.cos(b.wobble*0.4)*0.2;
      b.x+=b.vx;b.y+=b.vy;
      if(b.x<15)b.angle=Math.random()*Math.PI*0.5-Math.PI*0.25;
      if(b.x>CVW-15)b.angle=Math.PI+Math.random()*Math.PI*0.5-Math.PI*0.25;
      if(b.y<40)b.vy=0.5;if(b.y>GY-8)b.vy=-0.5;
      b.x=Math.max(12,Math.min(CVW-12,b.x));b.y=Math.max(38,Math.min(GY-10,b.y));
    }

    function drawButterfly(b,alpha,aT){
      if(alpha<=0)return;
      const flap=Math.sin(aT*b.flapSpeed+b.phase),spread=0.5+flap*0.45;
      ctx.globalAlpha=alpha;ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.angle*0.3);
      ctx.fillStyle=b.col;
      ctx.beginPath();ctx.ellipse(-b.r*spread,-b.r*0.2,b.r*0.9,b.r*0.55,0.4+flap*0.3,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(b.r*spread,-b.r*0.2,b.r*0.9,b.r*0.55,-0.4-flap*0.3,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(-b.r*spread*0.65,b.r*0.32,b.r*0.58,b.r*0.35,0.7+flap*0.2,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.ellipse(b.r*spread*0.65,b.r*0.32,b.r*0.58,b.r*0.35,-0.7-flap*0.2,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='rgba(30,15,5,0.72)';ctx.beginPath();ctx.ellipse(0,0,b.r*0.12,b.r*0.62,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(30,15,5,0.55)';ctx.lineWidth=0.6;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(-b.r*0.08,-b.r*0.55);ctx.quadraticCurveTo(-b.r*0.4,-b.r*1.1,-b.r*0.3,-b.r*1.3);ctx.stroke();
      ctx.beginPath();ctx.moveTo(b.r*0.08,-b.r*0.55);ctx.quadraticCurveTo(b.r*0.4,-b.r*1.1,b.r*0.3,-b.r*1.3);ctx.stroke();
      ctx.fillStyle='rgba(30,15,5,0.55)';
      ctx.beginPath();ctx.arc(-b.r*0.3,-b.r*1.3,b.r*0.1,0,Math.PI*2);ctx.fill();
      ctx.beginPath();ctx.arc(b.r*0.3,-b.r*1.3,b.r*0.1,0,Math.PI*2);ctx.fill();
      ctx.restore();ctx.globalAlpha=1;
    }

    function updateFirefly(f,dt){
      f.wobble+=dt;f.angle+=f.turnSpeed+Math.sin(f.wobble*0.5)*0.03;
      f.vx=Math.cos(f.angle)*0.25+Math.sin(f.wobble*0.4)*0.15;
      f.vy=Math.sin(f.angle)*0.15+Math.cos(f.wobble*0.35)*0.10;
      f.x+=f.vx;f.y+=f.vy;
      if(f.x<12)f.angle=Math.random()*Math.PI*0.5;
      if(f.x>CVW-12)f.angle=Math.PI+Math.random()*Math.PI*0.5;
      if(f.y<40)f.vy=0.3;if(f.y>GY-5)f.vy=-0.4;
      f.x=Math.max(10,Math.min(CVW-10,f.x));f.y=Math.max(38,Math.min(GY-8,f.y));
    }

    function drawFirefly(f,alpha,aT){
      if(alpha<=0)return;
      const pulse=0.5+Math.sin(aT*f.pulseSpeed+f.phase)*0.5,gA=alpha*pulse*f.brightness;
      const glowG=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,f.glowR*2.5);
      glowG.addColorStop(0,`rgba(160,255,80,${gA*0.55})`);glowG.addColorStop(1,'rgba(100,200,50,0)');
      ctx.fillStyle=glowG;ctx.beginPath();ctx.arc(f.x,f.y,f.glowR*2.5,0,Math.PI*2);ctx.fill();
      const innerG=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,f.glowR);
      innerG.addColorStop(0,`rgba(220,255,160,${gA*0.90})`);innerG.addColorStop(1,`rgba(100,220,40,${gA*0.1})`);
      ctx.fillStyle=innerG;ctx.beginPath();ctx.arc(f.x,f.y,f.glowR,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=gA*0.90;ctx.fillStyle='rgba(230,255,180,0.95)';
      ctx.beginPath();ctx.arc(f.x,f.y,1.4,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    }

    function snowflake(x,y,r,alpha){if(alpha<=0)return;ctx.globalAlpha=alpha;ctx.strokeStyle='rgba(220,240,255,0.85)';ctx.lineWidth=r*0.18;ctx.lineCap='round';for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);ctx.stroke();}ctx.globalAlpha=1;}
    function cloud(x,y,r,alpha){if(alpha<=0)return;ctx.globalAlpha=Math.min(1,alpha);ctx.fillStyle='rgba(255,255,255,0.88)';[[0,0,1.0],[-.55,.1,.72],[.55,.1,.72],[-.28,-.2,.62],[.28,-.2,.62]].forEach(([dx,dy,rs])=>{ctx.beginPath();ctx.arc(x+dx*r,y+dy*r,r*rs,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;}
    function flyingBird(x,y,sz,alpha,aT){if(alpha<=0)return;ctx.strokeStyle=`rgba(40,30,55,${alpha})`;ctx.lineWidth=sz*0.38;ctx.lineCap='round';const wing=Math.sin(aT*8+x*0.1)*0.5;ctx.beginPath();ctx.moveTo(x-sz,y+wing*sz*0.4);ctx.quadraticCurveTo(x-sz*0.4,y-sz*0.5+wing*sz*0.2,x,y);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+sz*0.4,y-sz*0.5+wing*sz*0.2,x+sz,y+wing*sz*0.4);ctx.stroke();}
    function bat(x,y,r,alpha,aT){if(alpha<=0||r<3)return;ctx.globalAlpha=alpha;const flap=Math.sin(aT*5+x);ctx.fillStyle='rgba(30,20,50,0.85)';ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-r,y-r+flap*r*0.3,x-r*2,y+r*0.2,x-r*1.8,y+r*0.4);ctx.bezierCurveTo(x-r*0.5,y+r*0.2,x,y+r*0.1,x,y);ctx.fill();ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+r,y-r+flap*r*0.3,x+r*2,y+r*0.2,x+r*1.8,y+r*0.4);ctx.bezierCurveTo(x+r*0.5,y+r*0.2,x,y+r*0.1,x,y);ctx.fill();ctx.fillStyle='rgba(40,25,55,0.90)';ctx.beginPath();ctx.arc(x,y-r*0.1,r*0.45,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    function owl(x,y,r,alpha){if(alpha<=0||r<3)return;ctx.globalAlpha=alpha;ctx.fillStyle='#8B6914';ctx.beginPath();ctx.ellipse(x,y,r*0.7,r,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#7A5810';ctx.beginPath();ctx.ellipse(x-r*0.65,y+r*0.1,r*0.45,r*0.7,-0.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(x+r*0.65,y+r*0.1,r*0.45,r*0.7,0.3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#9A7820';ctx.beginPath();ctx.arc(x,y-r*0.7,r*0.55,0,Math.PI*2);ctx.fill();ctx.fillStyle='#FFD84D';ctx.beginPath();ctx.arc(x-r*0.22,y-r*0.72,r*0.22,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+r*0.22,y-r*0.72,r*0.22,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1A1A1A';ctx.beginPath();ctx.arc(x-r*0.22,y-r*0.72,r*0.11,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+r*0.22,y-r*0.72,r*0.11,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    function rabbit(x,y,r,alpha,dir){if(alpha<=0||r<3)return;ctx.globalAlpha=alpha;ctx.fillStyle='#D8C8A8';ctx.beginPath();ctx.ellipse(x,y,r*0.8,r*0.65,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+dir*r*0.5,y-r*0.45,r*0.52,0,Math.PI*2);ctx.fill();ctx.fillStyle='#C8B098';ctx.beginPath();ctx.ellipse(x+dir*r*0.35,y-r*1.05,r*0.14,r*0.42,dir*0.2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(x+dir*r*0.62,y-r*1.02,r*0.14,r*0.42,dir*0.3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#F0A0A0';ctx.beginPath();ctx.ellipse(x+dir*r*0.35,y-r*1.05,r*0.07,r*0.28,dir*0.2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(x+dir*r*0.62,y-r*1.02,r*0.07,r*0.28,dir*0.3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#F0EDE8';ctx.beginPath();ctx.arc(x-dir*r*0.8,y,r*0.25,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    function deer(x,y,r,alpha,dir){if(alpha<=0||r<4)return;ctx.globalAlpha=alpha;ctx.fillStyle='#C48840';ctx.beginPath();ctx.ellipse(x,y,r,r*0.6,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(x+dir*r*0.8,y-r*0.3,r*0.35,r*0.55,dir*0.3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(x+dir*r*1.1,y-r*0.65,r*0.3,r*0.38,dir*0.15,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#8A5820';ctx.lineWidth=r*0.12;ctx.lineCap='round';const hx=x+dir*r*1.05,hy=y-r*0.9;ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(hx+dir*r*0.2,hy-r*0.5);ctx.stroke();ctx.beginPath();ctx.moveTo(hx+dir*r*0.1,hy-r*0.25);ctx.lineTo(hx+dir*r*0.35,hy-r*0.45);ctx.stroke();ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(hx-dir*r*0.05,hy-r*0.45);ctx.stroke();ctx.strokeStyle='#B07030';ctx.lineWidth=r*0.15;[[-0.55],[-.2],[.2],[.55]].forEach(([dx])=>{const px=x+dir*dx*r,py=y+r*0.4;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+dir*r*0.08,py+r*0.55);ctx.stroke();});ctx.fillStyle='rgba(255,240,200,0.6)';ctx.beginPath();ctx.ellipse(x,y-r*0.05,r*0.35,r*0.25,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    function squirrel(x,y,r,alpha,dir){if(alpha<=0||r<3)return;ctx.globalAlpha=alpha;ctx.fillStyle='#C87A30';ctx.beginPath();ctx.moveTo(x-dir*r*0.2,y);ctx.bezierCurveTo(x-dir*r*1.5,y-r,x-dir*r*2,y-r*1.8,x-dir*r*1.2,y-r*2.2);ctx.bezierCurveTo(x-dir*r*0.5,y-r*2.5,x-dir*r*0.2,y-r*2.0,x-dir*r*0.1,y-r*1.2);ctx.bezierCurveTo(x-dir*r*0.2,y-r*0.8,x-dir*r*0.1,y-r*0.4,x-dir*r*0.2,y);ctx.closePath();ctx.fill();ctx.fillStyle='#E09040';ctx.beginPath();ctx.ellipse(x,y-r*0.3,r*0.55,r*0.65,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+dir*r*0.35,y-r*0.95,r*0.42,0,Math.PI*2);ctx.fill();ctx.fillStyle='#D07830';ctx.beginPath();ctx.arc(x+dir*r*0.28,y-r*1.3,r*0.16,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+dir*r*0.52,y-r*1.28,r*0.14,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1A1A1A';ctx.beginPath();ctx.arc(x+dir*r*0.48,y-r*0.98,r*0.09,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    function hedgehog(x,y,r,alpha,dir){if(alpha<=0||r<3)return;ctx.globalAlpha=alpha;ctx.fillStyle='#8B6914';ctx.beginPath();ctx.ellipse(x,y-r*0.1,r*0.9,r*0.65,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#6B4A10';ctx.lineWidth=r*0.08;ctx.lineCap='round';for(let i=0;i<8;i++){const a=Math.PI+i*(Math.PI/7);ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r*0.6,y-r*0.1+Math.sin(a)*r*0.45);ctx.lineTo(x+Math.cos(a)*r*0.9,y-r*0.1+Math.sin(a)*r*0.7);ctx.stroke();}ctx.fillStyle='#D4A855';ctx.beginPath();ctx.ellipse(x+dir*r*0.82,y-r*0.05,r*0.35,r*0.28,dir*0.3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#3A2A10';ctx.beginPath();ctx.arc(x+dir*r*1.08,y-r*0.08,r*0.1,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    function frog(x,y,r,alpha){if(alpha<=0||r<2)return;ctx.globalAlpha=alpha;ctx.fillStyle='#4A9A3A';ctx.beginPath();ctx.ellipse(x,y,r*0.9,r*0.65,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#5AB84A';ctx.beginPath();ctx.arc(x-r*0.35,y-r*0.4,r*0.32,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+r*0.35,y-r*0.4,r*0.32,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1A1A1A';ctx.beginPath();ctx.arc(x-r*0.35,y-r*0.4,r*0.15,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+r*0.35,y-r*0.4,r*0.15,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#3A8A2A';ctx.lineWidth=r*0.15;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-r*0.7,y+r*0.3);ctx.lineTo(x-r*1.2,y+r*0.6);ctx.stroke();ctx.beginPath();ctx.moveTo(x+r*0.7,y+r*0.3);ctx.lineTo(x+r*1.2,y+r*0.6);ctx.stroke();ctx.globalAlpha=1;}
    function mushroom(x,y,r,alpha){if(alpha<=0||r<1)return;ctx.globalAlpha=Math.min(1,alpha);ctx.fillStyle='#E8D5B0';ctx.beginPath();ctx.ellipse(x,y+r*0.4,r*0.35,r*0.55,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#D4522A';ctx.beginPath();ctx.ellipse(x,y-r*0.1,r*0.85,r*0.65,0,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,255,255,0.7)';[[-.3,-.3,.18],[.28,-.4,.14],[-.1,-.15,.12]].forEach(([dx,dy,sr])=>{ctx.beginPath();ctx.arc(x+dx*r,y+dy*r,r*sr,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;}
    function flower(x,y,r,col,alpha){if(alpha<=0||r<1)return;ctx.globalAlpha=Math.min(1,alpha);ctx.fillStyle=col;for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2;ctx.beginPath();ctx.arc(x+Math.cos(a)*r*0.9,y+Math.sin(a)*r*0.9,r*0.65,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#FFE580';ctx.beginPath();ctx.arc(x,y,r*0.52,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    function stone(x,y,rx,ry,alpha){if(alpha<=0)return;ctx.globalAlpha=Math.min(1,alpha);const sg=ctx.createRadialGradient(x-rx*0.2,y-ry*0.2,rx*0.1,x,y,rx*1.1);sg.addColorStop(0,'#b8b8b0');sg.addColorStop(1,'#787870');ctx.fillStyle=sg;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0.2,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}
    function smallTree(x,y,h,alpha,isWint){if(alpha<=0||h<5)return;ctx.globalAlpha=Math.min(1,alpha);const sw=Math.max(1,h*0.06);const sg=ctx.createLinearGradient(x-sw,0,x+sw,0);sg.addColorStop(0,'#4A2E08');sg.addColorStop(0.5,'#6A4818');sg.addColorStop(1,'#4A2E08');ctx.fillStyle=sg;ctx.beginPath();ctx.moveTo(x-sw,y);ctx.lineTo(x-sw*0.5,y-h*0.55);ctx.lineTo(x+sw*0.5,y-h*0.55);ctx.lineTo(x+sw,y);ctx.closePath();ctx.fill();const pts=isWint?[[0,-h*0.92,h*0.20,0],[-.18,-h*0.75,h*0.28,1],[.18,-h*0.75,h*0.28,2],[-.25,-h*0.58,h*0.34,0],[.25,-h*0.58,h*0.34,1],[0,-h*0.43,h*0.38,2]]:[[0,-h*0.88,h*0.28,0],[-.18,-h*0.72,h*0.22,1],[.18,-h*0.72,h*0.22,2],[0,-h*0.60,h*0.26,3]];pts.forEach(([dx,dy,r,ci])=>{ctx.fillStyle=GR[ci%GR.length];ctx.beginPath();ctx.arc(x+dx,y+dy,r,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;}

    function render(aT) {
      ctx.clearRect(0,0,CVW,CVH);

      // HEMEL
      const skyG=ctx.createLinearGradient(0,0,0,GY);
      if(isN){skyG.addColorStop(0,'#0C1838');skyG.addColorStop(0.5,'#141E48');skyG.addColorStop(1,'#1A2850');}
      else if(tod==='Avond'){skyG.addColorStop(0,'#3A2060');skyG.addColorStop(0.4,'#E04020');skyG.addColorStop(0.8,'#F0A030');skyG.addColorStop(1,c.s2);}
      else if(isW){skyG.addColorStop(0,'#6A8098');skyG.addColorStop(0.6,c.s2);skyG.addColorStop(1,c.s2);}
      else{skyG.addColorStop(0,c.s1);skyG.addColorStop(0.65,c.s2);skyG.addColorStop(1,c.s2);}
      ctx.fillStyle=skyG;ctx.fillRect(0,0,CVW,GY);

      // ZON
      const sunX=tod==='Ochtend'?CVW*0.12:tod==='Avond'?CVW*0.88:CVW*0.14;
      const sunY=tod==='Ochtend'?CVH*0.14:tod==='Avond'?CVH*0.13:CVH*0.13;
      if(!isN){
        const r=CVW*0.038;
        const glow=ctx.createRadialGradient(sunX,sunY,r*0.3,sunX,sunY,r*2.5);
        glow.addColorStop(0,'rgba(255,225,80,0.28)');glow.addColorStop(1,'rgba(255,225,80,0)');
        ctx.fillStyle=glow;ctx.beginPath();ctx.arc(sunX,sunY,r*2.5,0,Math.PI*2);ctx.fill();
        const sG=ctx.createRadialGradient(sunX-3,sunY-3,1,sunX,sunY,r);
        sG.addColorStop(0,'#FFF5CC');sG.addColorStop(0.5,'#FFD84D');sG.addColorStop(1,'#FFBE1A');
        ctx.fillStyle=sG;ctx.beginPath();ctx.arc(sunX,sunY,r,0,Math.PI*2);ctx.fill();
        if(tod==='Avond'){const ag=ctx.createRadialGradient(CVW,GY,0,CVW,GY,CVW*0.7);ag.addColorStop(0,'rgba(255,80,20,0.20)');ag.addColorStop(1,'rgba(255,80,20,0)');ctx.fillStyle=ag;ctx.fillRect(0,0,CVW,GY);}
      }

      // STERREN + MAAN (nacht)
      if(isN){
        const stPos=[[CVW*.06,CVH*.05],[CVW*.21,CVH*.03],[CVW*.38,CVH*.05],[CVW*.54,CVH*.03],[CVW*.66,CVH*.06],[CVW*.78,CVH*.04],[CVW*.11,CVH*.12],[CVW*.32,CVH*.10],[CVW*.49,CVH*.11],[CVW*.65,CVH*.10],[CVW*.83,CVH*.13],[CVW*.14,CVH*.16],[CVW*.45,CVH*.15],[CVW*.70,CVH*.16],[CVW*.93,CVH*.08],[CVW*.89,CVH*.15],[CVW*.26,CVH*.14],[CVW*.58,CVH*.05]];
        for(const[x,y]of stPos){const r=0.85+Math.sin(x*y*0.012+aT*1.5)*0.5,a=0.88*(0.5+Math.sin(x*0.12+aT)*0.38);ctx.globalAlpha=a;ctx.fillStyle='rgba(255,255,215,0.95)';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
        ctx.globalAlpha=1;
        // Maan
        const mx=CVW*0.88,my=CVH*0.11;
        const mg=ctx.createRadialGradient(mx,my,4,mx,my,CVW*0.12);mg.addColorStop(0,'rgba(255,248,200,0.28)');mg.addColorStop(1,'rgba(255,248,200,0)');
        ctx.fillStyle=mg;ctx.beginPath();ctx.arc(mx,my,CVW*0.12,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(255,248,185,0.93)';ctx.beginPath();ctx.arc(mx,my,CVW*0.052,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(15,25,70,0.76)';ctx.beginPath();ctx.arc(mx+CVW*0.022,my-CVW*0.008,CVW*0.043,0,Math.PI*2);ctx.fill();
      }

      // BERGEN
      ctx.globalAlpha=0.28+ease(growth,0,0.8)*0.38;
      ctx.fillStyle=isN?'#0C1A36':isW?'#6A8098':'#8AAABB';
      ctx.beginPath();ctx.moveTo(0,GY);ctx.lineTo(0,GY-CVH*0.14);ctx.lineTo(CVW*0.09,GY-CVH*0.26);ctx.lineTo(CVW*0.18,GY-CVH*0.18);ctx.lineTo(CVW*0.30,GY-CVH*0.22);ctx.lineTo(CVW*0.40,GY-CVH*0.16);ctx.lineTo(CVW*0.45,GY);ctx.closePath();ctx.fill();
      ctx.fillStyle=isN?'#0A1530':isW?'#5A7088':'#7A9AAB';
      ctx.beginPath();ctx.moveTo(CVW*0.54,GY);ctx.lineTo(CVW*0.57,GY-CVH*0.17);ctx.lineTo(CVW*0.66,GY-CVH*0.25);ctx.lineTo(CVW*0.77,GY-CVH*0.19);ctx.lineTo(CVW*0.86,GY-CVH*0.23);ctx.lineTo(CVW*0.95,GY-CVH*0.16);ctx.lineTo(CVW,GY-CVH*0.13);ctx.lineTo(CVW,GY);ctx.closePath();ctx.fill();
      // Sneeuwtoppen
      ctx.fillStyle='rgba(255,255,255,0.82)';
      [[CVW*0.08,GY-CVH*0.245,CVW*0.09,GY-CVH*0.26,CVW*0.10,GY-CVH*0.245],[CVW*0.65,GY-CVH*0.24,CVW*0.66,GY-CVH*0.25,CVW*0.67,GY-CVH*0.24],[CVW*0.85,GY-CVH*0.225,CVW*0.86,GY-CVH*0.23,CVW*0.87,GY-CVH*0.225]].forEach(([x1,y1,cx2,cy2,x3,y3])=>{ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(cx2,cy2);ctx.lineTo(x3,y3);ctx.closePath();ctx.fill();});
      ctx.globalAlpha=1;

      // HEUVELS
      ctx.globalAlpha=0.28+ease(growth,0,0.7)*0.42;
      ctx.fillStyle=isN?'#0C1E0C':isW?'#3A4A3A':c.gd;
      ctx.beginPath();ctx.moveTo(-10,GY);ctx.quadraticCurveTo(CVW*0.14,GY-CVH*0.11,CVW*0.36,GY-CVH*0.046);ctx.quadraticCurveTo(CVW*0.45,GY-CVH*0.023,CVW*0.51,GY);ctx.closePath();ctx.fill();
      ctx.fillStyle=isN?'#0A180C':isW?'#2E382E':c.gl;
      ctx.beginPath();ctx.moveTo(CVW*0.48,GY);ctx.quadraticCurveTo(CVW*0.63,GY-CVH*0.09,CVW*0.84,GY-CVH*0.052);ctx.quadraticCurveTo(CVW*0.93,GY-CVH*0.029,CVW+10,GY);ctx.closePath();ctx.fill();
      ctx.globalAlpha=1;

      // WOLKEN
      if(!isN){cloud(CVW*0.21,CVH*0.135,CVW*0.065,0.48+ease(growth,0,0.5)*0.22);cloud(CVW*0.76,CVH*0.115,CVW*0.053,0.40+ease(growth,0,0.5)*0.20);cloud(CVW*0.43,CVH*0.079,CVW*0.041,ease(growth,0.12,0.38)*0.52);cloud(CVW*0.89,CVH*0.178,CVW*0.047,ease(growth,0.22,0.48)*0.48);}

      // KLEINE BOOMPJES
      smallTree(CVW*0.054,GY-CVH*0.04,28*ease(growth,0.05,0.28),ease(growth,0.05,0.26),isW);
      smallTree(CVW*0.93,GY-CVH*0.036,26*ease(growth,0.08,0.30),ease(growth,0.08,0.28),isW);
      smallTree(CVW*0.016,GY-CVH*0.05,36*ease(growth,0.18,0.42),ease(growth,0.18,0.40),isW);
      smallTree(CVW*0.97,GY-CVH*0.046,32*ease(growth,0.22,0.44),ease(growth,0.22,0.42),isW);
      smallTree(CVW*0.136,GY-CVH*0.02,40*ease(growth,0.48,0.68),ease(growth,0.46,0.66),isW);
      smallTree(CVW*0.848,GY-CVH*0.02,38*ease(growth,0.52,0.72),ease(growth,0.50,0.70),isW);

      // GROND
      const grG=ctx.createLinearGradient(0,GY,0,CVH);
      grG.addColorStop(0,isN?'#0A180A':isW?'#3A4A3A':c.gl);
      grG.addColorStop(0.4,'rgba(55,40,18,0.58)');grG.addColorStop(1,'rgba(40,25,10,0.4)');
      ctx.fillStyle=grG;ctx.fillRect(0,GY,CVW,CVH-GY);

      // WINTER SNEEUW
      if(isW){
        const snG=ctx.createLinearGradient(0,GY,0,GY+40);snG.addColorStop(0,'rgba(235,248,255,0.92)');snG.addColorStop(1,'rgba(210,232,252,0.65)');
        ctx.fillStyle=snG;ctx.globalAlpha=0.90;
        ctx.beginPath();ctx.moveTo(0,GY+6);for(let x=0;x<=CVW;x+=8)ctx.lineTo(x,GY+2+Math.sin(x*0.18+aT*0.3)*2.5);
        ctx.lineTo(CVW,CVH);ctx.lineTo(0,CVH);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
        [[CVW*0.12,GY-CVH*0.25,3.5],[CVW*0.29,GY-CVH*0.163,2.8],[CVW*0.47,GY-CVH*0.302,4.0],[CVW*0.63,GY-CVH*0.205,3.2],[CVW*0.80,GY-CVH*0.258,3.8],[CVW*0.92,GY-CVH*0.153,2.5],[CVW*0.16,GY-CVH*0.382,2.2],[CVW*0.52,GY-CVH*0.126,4.5],[CVW*0.73,GY-CVH*0.355,3.0],[CVW*0.38,GY-CVH*0.084,5.0],[CVW*0.87,GY-CVH*0.389,2.8],[CVW*0.21,GY-CVH*0.073,4.2]].forEach(([x,y,r])=>snowflake(x,y,r,0.75));
        ctx.fillStyle='rgba(228,242,255,0.55)';ctx.globalAlpha=0.5;
        [[CVW*0.13,GY+18,30,8],[CVW*0.47,GY+22,40,10],[CVW*0.82,GY+16,35,9]].forEach(([x,y,rx,ry])=>{ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;
      }

      // BEEKJE
      if(growth>0.45){
        const bt=ease(growth,0.45,0.70);ctx.globalAlpha=bt*0.70;
        ctx.fillStyle=isN?'rgba(25,45,115,0.65)':isW?'rgba(145,198,238,0.68)':'rgba(95,182,222,0.72)';
        ctx.beginPath();ctx.moveTo(0,GY+CVH*0.053);ctx.bezierCurveTo(CVW*0.15,GY+CVH*0.035,CVW*0.27,GY+CVH*0.074,CVW*0.43,GY+CVH*0.059);ctx.bezierCurveTo(CVW*0.59,GY+CVH*0.040,CVW*0.71,GY+CVH*0.079,CVW,GY+CVH*0.063);ctx.lineTo(CVW,GY+CVH*0.106);ctx.bezierCurveTo(CVW*0.71,GY+CVH*0.116,CVW*0.59,GY+CVH*0.100,CVW*0.43,GY+CVH*0.111);ctx.bezierCurveTo(CVW*0.27,GY+CVH*0.122,CVW*0.15,GY+CVH*0.095,0,GY+CVH*0.106);ctx.closePath();ctx.fill();ctx.globalAlpha=1;
      }

      // STENEN
      stone(CVW*0.14,GY+9,12,8,ease(growth,0.02,0.16));stone(CVW*0.82,GY+11,15,10,ease(growth,0.04,0.18));
      stone(CVW*0.09,GY+17,9,6,ease(growth,0.10,0.26));stone(CVW*0.88,GY+21,11,7,ease(growth,0.14,0.30));

      // GRAS
      if(!isW){
        const gxA=[CVW*.41,CVW*.46,CVW*.37,CVW*.50,CVW*.34,CVW*.54,CVW*.38,CVW*.48,CVW*.31,CVW*.57,CVW*.44,CVW*.40,CVW*.52,CVW*.35,CVW*.55,CVW*.32,CVW*.47,CVW*.40,CVW*.49,CVW*.38,CVW*.54,CVW*.30,CVW*.59,CVW*.43,CVW*.35,CVW*.51,CVW*.31,CVW*.57,CVW*.45,CVW*.39,CVW*.26,CVW*.63,CVW*.23,CVW*.68,CVW*.19,CVW*.71,CVW*.16,CVW*.74,CVW*.12,CVW*.78,CVW*.10,CVW*.82,CVW*.07,CVW*.85];
        ctx.lineCap='round';
        for(let i=0;i<gxA.length;i++){const t=ease(growth,0+i*0.007,0.015+i*0.007);if(t<=0)continue;const h2=6+(i%4)*2.5,cv2=(i%2===0)?-3:3;ctx.strokeStyle=isN?`rgba(28,55,28,0.55)`:c.gl;ctx.lineWidth=1.2;ctx.globalAlpha=t*0.58;ctx.beginPath();ctx.moveTo(gxA[i],GY);ctx.quadraticCurveTo(gxA[i]+cv2,GY-h2*0.6,gxA[i]+cv2*0.4,GY-h2);ctx.stroke();ctx.globalAlpha=1;}
      }

      // BLOEMEN
      if(!isW&&!isN&&c.fl&&c.fl.length>0){
        [[CVW*.10,GY-5,4.0,0,0.03],[CVW*.92,GY-5,3.7,1,0.04],[CVW*.058,GY-5,3.3,2,0.06],[CVW*.97,GY-5,3.6,3,0.08],[CVW*.145,GY-5,2.8,0,0.15],[CVW*.875,GY-5,3.0,1,0.18],[CVW*.033,GY-5,3.4,2,0.22],[CVW*.98,GY-5,2.9,3,0.25],[CVW*.178,GY-5,2.5,0,0.30],[CVW*.795,GY-5,2.7,1,0.35],[CVW*.235,GY-5,2.3,2,0.55],[CVW*.735,GY-5,2.3,3,0.58]].forEach(([x,y,r,ci,lo])=>{if(ci<c.fl.length)flower(x,y,r,c.fl[ci],ease(growth,lo,lo+0.14));});
      }

      // PADDENSTOELEN
      if(!isW){mushroom(CVW*.09,GY+8,7,ease(growth,0.30,0.48));mushroom(CVW*.89,GY+10,6,ease(growth,0.35,0.52));}

      // DIEREN PER SEIZOEN
      if(isL){rabbit(CVW*.16,GY-6,8,ease(growth,0.20,0.40),1);rabbit(CVW*.87,GY-5,7,ease(growth,0.28,0.48),-1);frog(CVW*.265,GY+CVH*0.10,6,ease(growth,0.42,0.60));}
      if(isZ){deer(CVW*.20,GY-12,12,ease(growth,0.35,0.55),-1);squirrel(CVW*.836,GY-8,9,ease(growth,0.28,0.48),1);frog(CVW*.30,GY+CVH*0.095,7,ease(growth,0.38,0.56));hedgehog(CVW*.868,GY+5,8,ease(growth,0.45,0.62),-1);}
      if(isH){hedgehog(CVW*.177,GY+4,9,ease(growth,0.22,0.42),1);squirrel(CVW*.854,GY-8,10,ease(growth,0.30,0.50),-1);deer(CVW*.354,GY-10,11,ease(growth,0.48,0.65),1);
        const hC=['#D4842A','#E6A832','#C4553A','#E8C060','#CC6020'];
        [[CX-CVW*.17,GY-CVH*.10],[CX+CVW*.16,GY-CVH*.074],[CX-CVW*.11,GY-CVH*.037],[CX+CVW*.12,GY-CVH*.053],[CX-CVW*.23,GY-CVH*.137],[CX+CVW*.20,GY-CVH*.111]].forEach(([x,y],i)=>{const fall=Math.sin(aT*0.8+i*1.2)*4;ctx.globalAlpha=ease(growth,0.35,0.75)*0.72;ctx.fillStyle=hC[i%hC.length];ctx.save();ctx.translate(x+fall,y+Math.sin(aT*0.6+i)*3);ctx.rotate(aT*0.4+i*0.8);ctx.beginPath();ctx.ellipse(0,0,5,3,0,0,Math.PI*2);ctx.fill();ctx.restore();ctx.globalAlpha=1;});}
      if(isW){rabbit(CVW*.141,GY+12,8,ease(growth,0.20,0.40),-1);rabbit(CVW*.877,GY+10,7,ease(growth,0.28,0.48),1);ctx.globalAlpha=ease(growth,0.30,0.50)*0.55;ctx.fillStyle='rgba(180,210,240,0.6)';[[CVW*.235,GY+20],[CVW*.271,GY+18],[CVW*.309,GY+22],[CVW*.347,GY+19]].forEach(([x,y])=>{ctx.beginPath();ctx.ellipse(x,y,3,2,0.3,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;}

      // NACHT: vleermuizen + uil
      if(isN){
        const b1x=CX-CVW*.24+Math.sin(aT*0.7)*CVW*.12,b1y=GY-CVH*.316+Math.cos(aT*0.5)*CVH*.053;
        const b2x=CX+CVW*.18+Math.sin(aT*0.8+1)*CVW*.10,b2y=GY-CVH*.250+Math.cos(aT*0.6+1)*CVH*.047;
        bat(b1x,b1y,9,ease(growth,0.25,0.50),aT);bat(b2x,b2y,7,ease(growth,0.35,0.55),aT);
        owl(CX+CVW*.162,GY-CVH*.237,10,ease(growth,0.30,0.55));
      }

      // VLIEGENDE VOGELS (niet 's nachts)
      if(!isN){
        const v1x=((CX+CVW*.24+aT*18)%(CVW+60))-20,v2x=((CX-CVW*.12+aT*12)%(CVW+60))-20,v3x=((CX+CVW*.06+aT*22)%(CVW+60))-20;
        flyingBird(v1x,GY-CVH*.295,5,ease(growth,0.18,0.40),aT);
        flyingBird(v1x+20,GY-CVH*.277,4,ease(growth,0.18,0.40)*0.8,aT);
        flyingBird(v2x,GY-CVH*.227,5,ease(growth,0.28,0.50),aT);
        flyingBird(v3x,GY-CVH*.340,4,ease(growth,0.48,0.65),aT);
      }

      // VLINDERS (lente/zomer, dag) - echt bewegend
      if((isL||isZ)&&!isN){
        const bAlpha=ease(growth,0.22,0.42);
        butterfliesRef.current.forEach((b,i)=>{
          updateButterfly(b,0.016);
          if(i<3||growth>0.45) drawButterfly(b,bAlpha*(0.75+i*0.04),aT);
        });
      }

      // REGENBOOG (lente/zomer hoog g)
      if((isL||isZ)&&growth>0.72&&!isN){
        const rt=ease(growth,0.72,0.90);
        ['rgba(255,50,50,','rgba(255,140,0,','rgba(255,220,0,','rgba(50,200,80,','rgba(50,130,255,'].forEach((col,i)=>{ctx.globalAlpha=rt*0.15;ctx.strokeStyle=col+'0.7)';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.arc(CX,GY+35,(CVW*.20+i*CVW*.026),Math.PI,Math.PI*2);ctx.stroke();});ctx.globalAlpha=1;
      }

      // ============================================================
      // BOOM — centraal, groeit met growth
      // ============================================================
      if(growth<0.01){ctx.fillStyle='#8B6914';ctx.beginPath();ctx.ellipse(CX,GY-4,7,5,-0.3,0,Math.PI*2);ctx.fill();}
      else{
        const stamH=Math.min(CVH*0.565,growth*CVH*0.671);
        const stamW=Math.max(1.5,Math.min(CVW*0.033,2.2+growth*CVW*0.036));
        const topY=GY-stamH;
        const P=-Math.PI/2;

        // Stam
        const sg2=ctx.createLinearGradient(CX-stamW,0,CX+stamW,0);sg2.addColorStop(0,'#3A2508');sg2.addColorStop(0.28,c.trunk||'#4A5060');sg2.addColorStop(0.62,'#7A6030');sg2.addColorStop(1,'#3A2508');
        ctx.fillStyle=sg2;ctx.beginPath();ctx.moveTo(CX-stamW*0.78,GY);
        ctx.bezierCurveTo(CX-stamW*0.96,GY-stamH*0.28,CX-stamW*0.66,GY-stamH*0.68,CX-stamW*0.28,topY+8);
        ctx.lineTo(CX,topY);ctx.lineTo(CX+stamW*0.28,topY+8);
        ctx.bezierCurveTo(CX+stamW*0.66,GY-stamH*0.68,CX+stamW*0.96,GY-stamH*0.28,CX+stamW*0.78,GY);
        ctx.closePath();ctx.fill();

        // Schors
        if(growth>0.05){ctx.strokeStyle='rgba(26,12,3,0.12)';ctx.lineWidth=0.7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(CX-stamW*0.16,GY-12);ctx.bezierCurveTo(CX-stamW*0.12,GY-stamH*0.35,CX-stamW*0.08,GY-stamH*0.62,CX-stamW*0.04,topY+6);ctx.stroke();}

        // Wortels
        if(growth>0.45){const rt=ease(growth,0.45,0.72);ctx.lineCap='round';[[-1,2.1],[-1,3.4],[1,2.1],[1,3.4]].forEach(([dir,dist])=>{ctx.strokeStyle=`rgba(50,30,7,${0.44*rt})`;ctx.lineWidth=Math.max(0.5,1.8*rt);ctx.beginPath();ctx.moveTo(CX+dir*stamW*0.55,GY-2);ctx.quadraticCurveTo(CX+dir*stamW*1.6*rt,GY+3,CX+dir*stamW*dist*rt,GY-1);ctx.stroke();});}

        // Takken
        function startY(frac,glo){
          if(frac>=0.85) return topY;
          const t=ease(growth,glo,Math.min(1,glo+0.18));
          return topY+(GY-stamH*frac-topY)*t;
        }
        const takken=[{f:0.88,a:P,len:30,w:2.8,glo:0.06,ghi:0.16,blo:0.01,bhi:0.16,lr:9,d:1,s:0},{f:0.52,a:P-0.82,len:50,w:4.2,glo:0.17,ghi:0.27,blo:0.13,bhi:0.28,lr:11,d:3,s:10},{f:0.58,a:P+0.84,len:50,w:4.2,glo:0.23,ghi:0.33,blo:0.19,bhi:0.34,lr:11,d:3,s:20},{f:0.70,a:P-0.62,len:45,w:3.2,glo:0.30,ghi:0.40,blo:0.26,bhi:0.41,lr:10,d:3,s:30},{f:0.75,a:P+0.64,len:45,w:3.2,glo:0.36,ghi:0.46,blo:0.32,bhi:0.47,lr:10,d:3,s:40},{f:0.82,a:P-0.48,len:40,w:2.5,glo:0.43,ghi:0.53,blo:0.39,bhi:0.54,lr:9,d:2,s:50},{f:0.86,a:P+0.50,len:40,w:2.5,glo:0.48,ghi:0.58,blo:0.44,bhi:0.59,lr:9,d:2,s:60},{f:0.90,a:P-0.34,len:32,w:1.8,glo:0.55,ghi:0.65,blo:0.51,bhi:0.66,lr:8,d:2,s:70},{f:0.92,a:P+0.36,len:32,w:1.8,glo:0.60,ghi:0.70,blo:0.56,bhi:0.71,lr:8,d:2,s:80},{f:0.62,a:P-1.02,len:34,w:2.2,glo:0.49,ghi:0.59,blo:0.45,bhi:0.60,lr:9,d:2,s:90},{f:0.66,a:P+1.04,len:34,w:2.2,glo:0.54,ghi:0.64,blo:0.50,bhi:0.65,lr:9,d:2,s:100},{f:0.77,a:P-0.22,len:23,w:1.3,glo:0.63,ghi:0.72,blo:0.59,bhi:0.73,lr:7,d:2,s:110},{f:0.79,a:P+0.24,len:23,w:1.3,glo:0.67,ghi:0.76,blo:0.63,bhi:0.77,lr:7,d:2,s:120},{f:0.94,a:P-0.20,len:18,w:0.9,glo:0.71,ghi:0.80,blo:0.67,bhi:0.81,lr:6,d:1,s:130},{f:0.96,a:P+0.22,len:18,w:0.9,glo:0.75,ghi:0.83,blo:0.71,bhi:0.84,lr:6,d:1,s:140},{f:0.99,a:P,len:15,w:0.8,glo:0.79,ghi:0.87,blo:0.75,bhi:0.88,lr:6,d:1,s:150}];
        for(const tk of takken)branch(CX,startY(tk.f,tk.glo),tk.a,tk.len,tk.w,tk.d,growth,tk.glo,tk.ghi,tk.blo,tk.bhi,tk.lr,0.88,tk.s);

        // Sneeuw op takken (winter)
        if(isW&&growth>0.2){const snT=ease(growth,0.2,0.6);ctx.fillStyle='rgba(228,242,255,0.78)';[[CX-38,topY+stamH*0.28],[CX+40,topY+stamH*0.30],[CX-30,topY+stamH*0.42],[CX+32,topY+stamH*0.44],[CX,topY+8],[CX-22,topY+stamH*0.55],[CX+24,topY+stamH*0.57]].forEach(([x,y])=>{ctx.globalAlpha=snT*0.70;ctx.beginPath();ctx.ellipse(x,y,10+snT*5,4,0,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;}
      }

      // VUURVLIEGJES (alleen nacht)
      if(isN&&growth>0.30){
        const fAlpha=ease(growth,0.30,0.55);
        firefliesRef.current.forEach(f=>{updateFirefly(f,0.016);drawFirefly(f,fAlpha,aT);});
      }

      // DIER BERICHTEN
      if(growth>0.40){
        ctx.font=`${Math.round(CVW*0.058)}px serif`;ctx.globalAlpha=ease(growth,0.40,0.60);
        ctx.fillText('🦊',CVW*0.072,GY-CVH*0.105);ctx.globalAlpha=1;
      }
      if(totalSessions>60){ctx.font=`${Math.round(CVW*0.044)}px serif`;ctx.globalAlpha=ease(growth,0.50,0.65);ctx.fillText('🐦',CX+CVW*.15*Math.max(growth,0.4),topY?topY-CVH*0.032:GY-CVH*0.40);ctx.globalAlpha=1;}
      if(totalSessions>150){ctx.font=`${Math.round(CVW*0.044)}px serif`;ctx.globalAlpha=ease(growth,0.65,0.78)*0.85;ctx.fillText('🦋',CX-CVW*.13,GY-CVH*.185);ctx.globalAlpha=1;}
      if(rareAnimal&&growth>0.6){ctx.font=`${Math.round(CVW*0.061)}px serif`;ctx.globalAlpha=0.85;ctx.fillText(rareAnimal,CX+CVW*.24,GY-CVH*.053);ctx.globalAlpha=1;}

      animTRef.current = aT + 0.016;
    }

    function loop(){
      render(animTRef.current);
      animRef.current = requestAnimationFrame(loop);
    }
    animRef.current = requestAnimationFrame(loop);
    }

    // Kleine vertraging zodat de DOM layout klaar is voor we starten
    const timer = setTimeout(startLoop, 50);
    return () => {
      clearTimeout(timer);
      if(animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [season, growth, wp, tod, totalSessions, rareAnimal, wi]);

  return React.createElement('canvas', {
    ref: canvasRef,
    style: { width:'100%', height:'100%', display:'block' }
  });
}
