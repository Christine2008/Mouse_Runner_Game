(()=>{
'use strict';
const T=16,W=19,H=21,OY=22,CW=W*T,CH=H*T+OY+22;
const MAP=[
"###################",
"#........#........#",
"#.##.###.#.###.##.#",
"#.................#",
"#.##.#.#####.#.##.#",
"#....#...#...#....#",
"####.### # ###.####",
"   #.#       #.#   ",
"####.# ##-## #.####",
"    .  #GGG#  .    ",
"####.# ##### #.####",
"   #.#       #.#   ",
"####.# ##### #.####",
"#........#........#",
"#.##.###.#.###.##.#",
"#..#.....P.....#..#",
"##.#.#.#####.#.#.##",
"#....#...#...#....#",
"#.######.#.######.#",
"#.................#",
"###################"];
/* ---------- pixel sprites (8x8, drawn at 2x) ---------- */
const PAL={K:'#2b1b2b',R:'#ff4b4b',r:'#ffa0a0',O:'#ff9a2e',Y:'#ffd93d',G:'#3fbf5a',g:'#23803c',L:'#9be564',B:'#7b4a2b',b:'#d9b48a',W:'#fff',V:'#9b4dca',v:'#6a2c91',M:'#e0287d',S:'#d6dae6',s:'#6b7080',E:'#a8968a',P:'#ffc6d0',N:'#ff8fa3',m:'#d8c7b6'};
const SP={
mouse:["EE....EE","EPE..EPE",".mmmmmm.",".mKmmKm.",".mmmmmmN","..mmmm..","Nmmmmmm.","N.m..m.."],
cat:["CC....CC","CCCCCCCC","CWKCCKWC","CCCCCCCC","CCCPPCCC",".CCCCCC.",".CCCCCC.",".C.CC.C."],
heart:[".RR..RR.","RrRRRRRR","RRRRRRRR","RRRRRRRR",".RRRRRR.","..RRRR..","...RR...","........"],
trap:["........",".R..R..R",".S..S..S",".S..S..S","SS.SS.SS","SSSSSSSS","ssssssss","........"],
trophy:["YYYYYYYY","Y.YWYY.Y","Y.YYYY.Y",".YYYYYY.","..YYYY..","...YY...","..YYYY..",".YYYYYY."]};
const FD=[
["..gLg...","...g....","..OOO...","..OrO...","..OOO...","...OO...","...OO...","....O..."],
["..gGg...",".RRgRR..","RRRRRRR.","RrRRRRR.","RRRRRRR.","RRRRRRR.",".RRRRR..","..RRR..."],
[".GGgGG..","GGGLGGG.","GgGGGgG.",".GGGGG..","..LLL...","...LL...","...LL...","...LL..."],
["..YYY...","..YYY...","gYYYYg..","gYYYYg..","gYYYYg..",".gYYg...","..gg....","...g...."],
["..gg....",".gVVV...",".VVVVV..",".VvVVV..",".VVVVV..","..VVV...","..VV....","...V...."],
["..RRRR..",".RWRRWR.","RRRRRRRR","RWRRRWRR","..bbbb..","..bbbb..","..bbbb..","...bb..."],
[".....YYY","...YYYYY","..YOYYYY",".YYYYOYY","YYYYYYYY","YOYYYYYY","YYYYYOYY","YYYYYYYY"],
["...gg...",".OOgOOO.","OOOOOOOO","OrOOOrOO","OrOOOrOO",".OOOOOO.","..OOOO..","........"],
["......Gg",".....GLG","....GGGg","...GGLG.","..GGGg..",".GLGg...","GGGg....","Gg......"],
["..gLg...",".MMMMM..","MMrMMMM.","MMMMMMM.","MMMMMMM.",".MMMMM..","..MMM...","...M...."]];
const CATS=[['#ff9a2e','#fff'],['#f4efe6','#fff'],['#8e98a8','#fff'],['#4b4668','#ffd93d'],['#ff8fc0','#fff']];
const CS=[[9,7,10],[8,9,100],[9,9,220],[10,9,340],[6,7,40]];
const CHASE=[.7,.5,.6,.35,.5];
const FP=[[1,1],[17,1],[9,3],[4,5],[14,5],[4,13],[14,13],[1,19],[17,19],[9,19]];
const HP=[[1,3],[17,3],[5,15]];
const TP=[[3,3],[15,19],[7,13]];
const DIRS={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]};
function spr(x,S,px,py,pal={},flip=0,sc=2){
  for(let j=0;j<8;j++)for(let i=0;i<8;i++){
    const ch=S[j][flip?7-i:i];
    if(ch!=='.'){x.fillStyle=pal[ch]||PAL[ch];x.fillRect(px+i*sc,py+j*sc,sc,sc)}
  }
}
/* ---------- setup ---------- */
const $=id=>document.getElementById(id);
const cv=$('game'),c=cv.getContext('2d'),ov=$('overlay');
c.imageSmoothingEnabled=false;
const at=(x,y)=>y<0||y>=H?'#':MAP[y][((x%W)+W)%W];
const free=(x,y,door)=>{const k=at(x,y);return k!=='#'&&(k!=='-'||door)};
/* pre-rendered maze */
const bg=document.createElement('canvas');bg.width=CW;bg.height=H*T;
(()=>{
  const b=bg.getContext('2d'),isW=(x,y)=>x<0||x>=W||y<0||y>=H||MAP[y][x]==='#';
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const k=MAP[y][x],X=x*T,Y=y*T;
    if(k==='#'){
      b.fillStyle='#2a3cc4';b.fillRect(X,Y,T,T);
      b.fillStyle='#8fb0ff';
      if(!isW(x,y-1))b.fillRect(X,Y,T,3);
      if(!isW(x,y+1))b.fillRect(X,Y+T-3,T,3);
      if(!isW(x-1,y))b.fillRect(X,Y,3,T);
      if(!isW(x+1,y))b.fillRect(X+T-3,Y,3,T);
    }else{
      b.fillStyle=k==='G'||k==='-'?'#1d1640':'#120e2c';b.fillRect(X,Y,T,T);
      if(k==='-'){b.fillStyle='#ff8fc0';b.fillRect(X,Y+6,T,4)}
    }
  }
})();
/* ---------- state ---------- */
let state='title',m,cats,items,coins,foods,got,score,lives,boost,inv,shake,freeze,fr=0,want=[0,0],face=1;
function respawn(){
  m={x:9,y:15,dx:0,dy:0,t:0};want=[0,0];boost=0;freeze=60;
  cats=CATS.map((k,i)=>({x:CS[i][0],y:CS[i][1],dx:0,dy:0,t:0,col:k[0],eye:k[1],st:'wait',w:CS[i][2],stun:0,ch:CHASE[i]}));
}
function reset(){
  items=new Map();coins=0;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(MAP[y][x]==='.'){items.set(x+','+y,{k:'coin',x,y});coins++}
  const put=(L,k)=>L.forEach(([x,y],i)=>{items.set(x+','+y,{k,x,y,i});coins--});
  put(FP,'food');put(HP,'heart');put(TP,'trap');
  foods=10;got=Array(10).fill(0);score=0;lives=3;inv=0;shake=0;
  respawn();
}
/* ---------- movement ---------- */
function move(e,sp,pick){
  if(!e.dx&&!e.dy){pick(e);if(!e.dx&&!e.dy)return}
  e.t+=sp;
  if(e.t>=1){e.t-=1;e.x=(e.x+e.dx+W)%W;e.y+=e.dy;pick(e);if(!e.dx&&!e.dy)e.t=0}
}
function mpick(e){
  if((want[0]||want[1])&&free(e.x+want[0],e.y+want[1])){e.dx=want[0];e.dy=want[1]}
  else if(!free(e.x+e.dx,e.y+e.dy)){e.dx=e.dy=0}
}
function cpick(e){
  if(e.st==='exit'){
    if(e.y>7){
      if(e.x<9){e.dx=1;e.dy=0}else if(e.x>9){e.dx=-1;e.dy=0}else{e.dx=0;e.dy=-1}
      return;
    }
    e.st='roam';
  }
  const D=[[1,0],[-1,0],[0,1],[0,-1]],mv=e.dx||e.dy;
  let o=D.filter(([a,b])=>free(e.x+a,e.y+b)&&!(mv&&a===-e.dx&&b===-e.dy));
  if(!o.length)o=[[-e.dx,-e.dy]];
  let d=o[(Math.random()*o.length)|0];
  if(Math.random()<e.ch){
    let best=1e9;
    for(const q of o){const v=(e.x+q[0]-m.x)**2+(e.y+q[1]-m.y)**2;if(v<best){best=v;d=q}}
  }
  e.dx=d[0];e.dy=d[1];
}
/* ---------- sound ---------- */
let ac;
function beep(f,d=.06,tp='square'){
  try{
    ac=ac||new (window.AudioContext||window.webkitAudioContext)();
    const o=ac.createOscillator(),g=ac.createGain();
    o.type=tp;o.frequency.value=f;g.gain.value=.04;
    o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d);
  }catch(e){}
}
/* ---------- game rules ---------- */
function hurt(){
  lives--;beep(120,.35,'sawtooth');
  if(lives<=0){end('over');return}
  inv=120;shake=14;respawn();
}
function eat(){
  const tx=((Math.round(m.x+m.dx*m.t))+W)%W,ty=Math.round(m.y+m.dy*m.t),key=tx+','+ty,it=items.get(key);
  if(!it)return;
  items.delete(key);
  if(it.k==='coin'){score+=10;coins--;beep(880,.04)}
  else if(it.k==='food'){
    score+=50;foods--;got[it.i]=1;boost=360;
    cats.forEach(e=>e.stun=240);
    beep(520,.08);setTimeout(()=>beep(780,.1),80);
  }else if(it.k==='heart'){
    if(lives<3)lives++;else score+=100;
    beep(660,.08,'triangle');setTimeout(()=>beep(990,.12,'triangle'),90);
  }else{
    lives--;shake=18;inv=100;beep(110,.4,'sawtooth');
    if(lives<=0)end('over');
  }
}
function tick(){
  if(freeze>0){freeze--;return}
  if(inv>0)inv--;
  if(boost>0)boost--;
  if((want[0]&&want[0]===-m.dx)||(want[1]&&want[1]===-m.dy)){
    m.x=(m.x+m.dx+W)%W;m.y+=m.dy;m.t=1-m.t;m.dx=-m.dx;m.dy=-m.dy;
  }
  move(m,boost>0?.17:.13,mpick);
  if(m.dx)face=m.dx;
  eat();if(state!=='play')return;
  for(const e of cats){
    if(e.stun>0){e.stun--;continue}
    if(e.st==='wait'){if(--e.w<=0)e.st='exit';continue}
    move(e,.095,cpick);
  }
  const mx=m.x+m.dx*m.t,my=m.y+m.dy*m.t;
  for(const [i,e] of cats.entries()){
    if(e.st==='wait')continue;
    if(Math.hypot(mx-(e.x+e.dx*e.t),my-(e.y+e.dy*e.t))<.7){
      if(e.stun>0){
        score+=200;beep(1040,.1);
        Object.assign(e,{x:CS[i][0],y:CS[i][1],dx:0,dy:0,t:0,st:'wait',w:120,stun:0});
      }else if(inv<=0){hurt();return}
    }
  }
  if(!coins&&!foods)end('win');
}
/* ---------- drawing ---------- */
function draw(){
  c.fillStyle='#0e0b24';c.fillRect(0,0,CW,CH);
  c.save();
  if(shake>0){shake--;c.translate((Math.random()*5-2)|0,(Math.random()*5-2)|0)}
  c.drawImage(bg,0,OY);
  items.forEach(it=>{
    const X=it.x*T,Y=OY+it.y*T;
    if(it.k==='coin'){
      const w=[6,4,2,4][((fr>>3)+it.x+it.y)&3];
      c.fillStyle='#c98a1b';c.fillRect(X+8-w/2,Y+5,w,7);
      c.fillStyle='#ffd93d';c.fillRect(X+8-w/2,Y+4,w,7);
    }else{
      const bob=Math.round(Math.sin((fr+it.x*9)/9));
      spr(c,it.k==='food'?FD[it.i]:SP[it.k],X,Y+(it.k==='trap'?0:bob));
    }
  });
  for(const e of cats){
    const px=(e.x+e.dx*e.t)*T,py=OY+(e.y+e.dy*e.t)*T+(e.st==='wait'?((fr>>4)&1):0);
    let col=e.col,eye=e.eye;
    if(e.stun>0){col=e.stun<70&&((fr>>2)&1)?'#fff':'#8fd8ff';eye='#fff'}
    spr(c,SP.cat,px,py,{C:col,W:eye},e.dx<0);
  }
  if(!(inv>0&&((fr>>2)&1))){
    const px=(m.x+m.dx*m.t)*T,py=OY+(m.y+m.dy*m.t)*T;
    if(boost>0){c.fillStyle=((fr>>2)&1)?'rgba(255,217,61,.45)':'rgba(255,255,255,.35)';c.fillRect(px-2,py-2,20,20)}
    spr(c,SP.mouse,px,py+((m.dx||m.dy)&&((fr>>3)&1)?-1:0),{},face<0);
  }
  c.restore();
  hud();
  if(state==='play'&&freeze>0){
    c.font='10px "Press Start 2P",monospace';c.textAlign='center';
    c.fillStyle='#ffa94d';c.fillText('READY!',CW/2,OY+11*T+12);
  }
}
function hud(){
  c.fillStyle='#120e2c';c.fillRect(0,0,CW,OY);c.fillRect(0,CH-22,CW,22);
  for(let i=0;i<3;i++)spr(c,SP.heart,4+i*18,3,i<lives?{}:{R:'#3b3560',r:'#3b3560'});
  c.font='8px "Press Start 2P",monospace';
  c.textAlign='right';c.fillStyle='#ffd93d';c.fillText(String(score).padStart(5,'0'),CW-6,15);
  c.fillStyle='#ffd93d';c.fillRect(CW/2-22,7,6,8);
  c.textAlign='left';c.fillStyle='#fff';c.fillText('x'+coins,CW/2-12,15);
  for(let i=0;i<10;i++){c.globalAlpha=got[i]?1:.22;spr(c,FD[i],7+i*29,CH-19)}
  c.globalAlpha=1;
}
/* ---------- screens & input ---------- */
function show(t,msg,btn,ico){
  $('ttl').textContent=t;$('msg').textContent=msg;$('act').textContent=btn;
  const x=$('ico').getContext('2d');x.clearRect(0,0,8,8);
  spr(x,SP[ico],0,0,ico==='cat'?{C:'#ff9a2e',W:'#fff'}:{},0,1);
  ov.classList.remove('hide');
}
function start(){reset();state='play';ov.classList.add('hide')}
function end(s){
  state=s;
  if(s==='win'){
    show('VICTORY!','Every coin and food collected! Score: '+score,'PLAY AGAIN','trophy');
    [523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.15,'triangle'),i*140));
  }else{
    show('GAME OVER','The cats got you! Score: '+score,'RETRY','cat');
  }
}
function toggle(){
  if(state==='play'){state='pause';show('PAUSED','Take a breath, little mouse.','RESUME','mouse')}
  else if(state==='pause'){state='play';ov.classList.add('hide')}
  else start();
}
$('act').onclick=()=>state==='pause'?toggle():start();
$('sta').onclick=start;
$('pau').onclick=()=>{if(state==='play'||state==='pause')toggle()};
const KD={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'};
addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if(KD[k]){want=DIRS[KD[k]];e.preventDefault();return}
  if(k==='enter'||k===' '||k==='p'){e.preventDefault();state==='play'||state==='pause'?toggle():start()}
});
let sx=0,sy=0;
cv.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY},{passive:true});
cv.addEventListener('touchend',e=>{
  const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;
  if(Math.max(Math.abs(dx),Math.abs(dy))>20)want=Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)];
},{passive:true});
/* ---------- loop ---------- */
let last=performance.now(),acc=0;
function loop(ts){
  acc+=Math.min(ts-last,100);last=ts;
  while(acc>=16.67){if(state==='play')tick();fr++;acc-=16.67}
  draw();requestAnimationFrame(loop);
}
reset();
show('MOUSE RUNNER','Collect every coin and all 10 foods. Dodge the 5 cats!','PLAY','mouse');
requestAnimationFrame(loop);
})();
