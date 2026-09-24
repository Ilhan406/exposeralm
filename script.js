// =========================================================
// MAEL & ILHAN — INTERACTIONS GALAXIE
// =========================================================
const glow = document.getElementById('mouse-glow');
window.addEventListener('mousemove', (e) => {
    if (glow) { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }
});

const typewriterText = document.getElementById('typewriter');
if (typewriterText) {
    const phrases = [
        "Une classe où chaque voix compte. 🤝",
        "Des idées concrètes, classées par mission. 🚀",
        "Des informations claires et faciles à retrouver. 📡",
        "Un espace pour proposer, discuter et construire. 🌌"
    ];
    let pi=0, ci=0, deleting=false;
    function type(){
        const p=phrases[pi];
        typewriterText.textContent = deleting ? p.slice(0,ci-1) : p.slice(0,ci+1);
        ci += deleting ? -1 : 1;
        let speed=deleting?45:75;
        if(!deleting && ci===p.length){speed=1900;deleting=true}
        else if(deleting && ci===0){deleting=false;pi=(pi+1)%phrases.length;speed=450}
        setTimeout(type,speed);
    }
    setTimeout(type,500);
}

const store = {
    get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v ?? d}catch{return d}},
    set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}
};
function toast(msg){
    let t=document.getElementById('toast');
    if(!t){t=document.createElement('div');t.id='toast';document.body.appendChild(t)}
    t.textContent=msg;t.classList.add('show');clearTimeout(t._t);
    t._t=setTimeout(()=>t.classList.remove('show'),2200);
}
function burst(x,y){
    for(let i=0;i<18;i++){
        const s=document.createElement('span');s.className='spark';
        const a=(i/18)*Math.PI*2,d=45+Math.random()*65;
        s.style.left=x+'px';s.style.top=y+'px';
        s.style.setProperty('--dx',Math.cos(a)*d+'px');s.style.setProperty('--dy',Math.sin(a)*d+'px');
        document.body.appendChild(s);setTimeout(()=>s.remove(),800);
    }
}
const approved = new Set(store.get('approved',[]));
function paint(btn,n,done){
    btn.innerHTML=(done?'Approuvé ✓ ':'Approuver ❤️ ')+`<span class="like-count">${n}</span>`;
    btn.disabled=done;btn.classList.toggle('done',done);
}
function approve(btn,key,n,save,e){
    if(approved.has(key)) return n;
    approved.add(key);store.set('approved',[...approved]);n++;save(n);paint(btn,n,true);
    burst(e.clientX,e.clientY);toast('Approbation enregistrée ✨');return n;
}
document.querySelectorAll('.card[data-project] .btn-like').forEach(btn=>{
    const id=btn.closest('.card').dataset.project,key='p'+id;
    let n=Number(store.get('project_likes_'+id,0))||0;
    paint(btn,n,approved.has(key));
    btn.addEventListener('click',e=>{n=approve(btn,key,n,v=>store.set('project_likes_'+id,v),e)});
});

// Filtres du programme
const filterBtns=document.querySelectorAll('.filter-btn');
const cards=document.querySelectorAll('.project-card');
const count=document.getElementById('project-count');
filterBtns.forEach(btn=>{
    btn.addEventListener('click',()=>{
        filterBtns.forEach(b=>b.classList.remove('active'));btn.classList.add('active');
        const cat=btn.dataset.cat;let visible=0;
        cards.forEach(card=>{
            const show=cat==='all'||card.dataset.cat===cat;
            card.classList.toggle('is-hidden',!show);if(show)visible++;
        });
        if(count)count.textContent=visible;
    });
});

// Compteurs animés de l'accueil
document.querySelectorAll('.count').forEach(el=>{
    const target=Number(el.dataset.to)||0,suffix=el.dataset.suffix||'';
    let current=0;const step=Math.max(1,Math.ceil(target/30));
    const timer=setInterval(()=>{
        current=Math.min(target,current+step);el.textContent=current+suffix;
        if(current>=target)clearInterval(timer);
    },35);
});

// Galaxie canvas : étoiles, poussière colorée, noyau et étoiles filantes.
(function(){
    const c=document.getElementById('galaxy');if(!c)return;
    const x=c.getContext('2d'),reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W,H,mx=0,my=0,tx=0,ty=0,lastShot=0;
    const stars=[],dust=[],shooters=[];
    function size(){
        const d=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;
        c.width=W*d;c.height=H*d;x.setTransform(d,0,0,d,0,0);
    }
    size();addEventListener('resize',size);
    addEventListener('mousemove',e=>{mx=e.clientX/W-.5;my=e.clientY/H-.5});
    for(let i=0;i<360;i++)stars.push({x:Math.random(),y:Math.random(),z:.15+Math.random()*.95,s:Math.random()*1.6+.3,p:Math.random()*6.28});
    for(let i=0;i<1900;i++){
        const r=Math.pow(Math.random(),.72),a=Math.random()*Math.PI*2;
        dust.push({r,a,arm:Math.floor(Math.random()*4),s:Math.random()*1.8+.25,alpha:.15+Math.random()*.45,
            hue:Math.random()<.55?'blue':'pink'});
    }
    function shooting(t){
        if(reduce)return;
        if(t-lastShot>1700+Math.random()*2600){
            shooters.push({x:Math.random()*W*.9,y:Math.random()*H*.45,vx:6+Math.random()*6,vy:3+Math.random()*4,life:0});
            lastShot=t;
        }
    }
    function frame(t){
        x.clearRect(0,0,W,H);x.globalCompositeOperation='lighter';
        tx+=(mx-tx)*.035;ty+=(my-ty)*.035;
        const cx=W/2+tx*45,cy=H/2+ty*35,R=Math.min(W,H)*.46;
        const g=x.createRadialGradient(cx,cy,0,cx,cy,R);
        g.addColorStop(0,'rgba(255,255,255,.11)');g.addColorStop(.10,'rgba(55,180,255,.10)');
        g.addColorStop(.26,'rgba(70,90,255,.06)');g.addColorStop(.48,'rgba(255,50,195,.045)');g.addColorStop(1,'transparent');
        x.fillStyle=g;x.fillRect(0,0,W,H);
        const rot=t*.000025;
        dust.forEach(d=>{
            const rr=d.r*R,angle=d.a+rot+d.arm*.35+rr*.0018;
            const px=cx+Math.cos(angle)*rr*(1.55-d.r*.55);
            const py=cy+Math.sin(angle)*rr*.56;
            const tw=.55+.45*Math.sin(t*.001*d.s+d.a);
            x.fillStyle=d.hue==='blue'?`rgba(50,200,255,${d.alpha*tw})`:`rgba(255,70,205,${d.alpha*tw})`;
            x.fillRect(px,py,d.s,d.s);
        });
        stars.forEach(st=>{
            const px=(st.x*W+tx*st.z*35+W)%W,py=(st.y*H+ty*st.z*28+H)%H;
            const a=.25+.65*(.5+.5*Math.sin(t*.0015*st.s+st.p));
            x.fillStyle=`rgba(255,255,255,${a})`;x.beginPath();x.arc(px,py,st.s*(.55+st.z),0,Math.PI*2);x.fill();
        });
        shooting(t);
        shooters.forEach((s,i)=>{
            s.x+=s.vx;s.y+=s.vy;s.life++;
            const grad=x.createLinearGradient(s.x-s.vx*9,s.y-s.vy*9,s.x,s.y);
            grad.addColorStop(0,'rgba(255,70,210,0)');grad.addColorStop(.6,'rgba(80,210,255,.45)');grad.addColorStop(1,'rgba(255,255,255,.95)');
            x.strokeStyle=grad;x.lineWidth=1.6;x.beginPath();x.moveTo(s.x-s.vx*10,s.y-s.vy*10);x.lineTo(s.x,s.y);x.stroke();
            if(s.x>W+80||s.y>H+80||s.life>100)shooters.splice(i,1);
        });
        x.globalCompositeOperation='source-over';
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
})();

// Petit effet de tilt sur les cartes au survol desktop
if (matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.card,.profile-card').forEach(card=>{
        card.addEventListener('mousemove',e=>{
            const r=card.getBoundingClientRect(),rx=((e.clientY-r.top)/r.height-.5)*-3,ry=((e.clientX-r.left)/r.width-.5)*3;
            card.style.transform=`translateY(-8px) perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
        });
        card.addEventListener('mouseleave',()=>card.style.transform='');
    });
}
