const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

$('#year').textContent = new Date().getFullYear();

const loader = $('#loader');
window.addEventListener('load', () => setTimeout(() => loader.classList.add('hide'), 1500), {once:true});
setTimeout(() => loader.classList.add('hide'), 3000);

const glow = $('#cursorGlow');
window.addEventListener('pointermove', e => {
  glow.style.left = `${e.clientX}px`;
  glow.style.top = `${e.clientY}px`;
  if (window.innerWidth > 700) {
    document.documentElement.style.setProperty('--mx', `${e.clientX}px`);
    document.documentElement.style.setProperty('--my', `${e.clientY}px`);
  }
}, {passive:true});

const progress = $('#scrollProgress');
const parallaxNodes = $$('[data-parallax]');
let lastScroll = window.scrollY;
function updateScrollFx(){
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? window.scrollY / max : 0;
  progress.style.width = `${pct*100}%`;
  parallaxNodes.forEach(el => {
    const speed = Number(el.dataset.parallax || 0.1);
    const rect = el.parentElement.getBoundingClientRect();
    const offset = (rect.top + rect.height/2 - window.innerHeight/2) * speed;
    el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0) scale(1.08)`;
  });
  lastScroll = window.scrollY;
}
let raf = 0;
window.addEventListener('scroll', () => { if(!raf){raf=requestAnimationFrame(()=>{updateScrollFx();raf=0;});} }, {passive:true});
updateScrollFx();

const scenes = $$('.scene');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting) {
      entry.target.classList.add('active');
      $$('.reveal', entry.target).forEach((el, i) => setTimeout(() => el.classList.add('in'), i * 95));
    } else if(entry.boundingClientRect.top < 0) {
      entry.target.classList.add('is-past');
    } else {
      entry.target.classList.remove('is-past');
    }
  });
}, {threshold:.18});
scenes.forEach(s => observer.observe(s));

$$('.tilt').forEach(card => {
  card.addEventListener('pointermove', e => {
    if(window.innerWidth < 700) return;
    const r = card.getBoundingClientRect();
    const x = (e.clientX-r.left)/r.width-.5;
    const y = (e.clientY-r.top)/r.height-.5;
    card.style.transform = `perspective(900px) rotateX(${(-y*8).toFixed(2)}deg) rotateY(${(x*8).toFixed(2)}deg) translateZ(8px)`;
  });
  card.addEventListener('pointerleave', ()=>card.style.transform='');
});

// Extra 3D depth for the hero image as the pointer moves.
const heroStage = $('.hero-stage');
if(heroStage){
  window.addEventListener('pointermove', e => {
    if(window.innerWidth < 900) return;
    const x = (e.clientX / window.innerWidth - .5) * 10;
    const y = (e.clientY / window.innerHeight - .5) * -7;
    heroStage.style.transform = `perspective(1200px) rotateY(${x}deg) rotateX(${y}deg)`;
  }, {passive:true});
}

// Lightweight Three.js particles for a real depth layer behind the hero.
const canvas = document.createElement('canvas');
canvas.className = 'hero-particles';
$('.hero')?.prepend(canvas);
if(window.THREE && canvas){
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, .1, 100);
  camera.position.z = 7;
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  const geo = new THREE.BufferGeometry();
  const pts = [];
  for(let i=0;i<320;i++){
    pts.push((Math.random()-.5)*9, (Math.random()-.5)*5.8, (Math.random()-.5)*5);
  }
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts,3));
  const mat = new THREE.PointsMaterial({color:0x77ddff,size:.018,transparent:true,opacity:.48});
  const points = new THREE.Points(geo,mat); scene.add(points);
  const resize = () => { const r=canvas.getBoundingClientRect(); renderer.setSize(r.width,r.height,false); camera.aspect=r.width/r.height; camera.updateProjectionMatrix(); };
  addEventListener('resize',resize); resize();
  let t=0;
  (function tick(){requestAnimationFrame(tick); t+=.0012; points.rotation.y=t; points.rotation.x=t*.2; renderer.render(scene,camera);})();
}
