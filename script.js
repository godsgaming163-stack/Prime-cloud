(function(){
  const year=document.getElementById('year'); if(year) year.textContent=new Date().getFullYear();
  const glow=document.querySelector('.cursor-glow');
  window.addEventListener('pointermove',e=>{if(glow){glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'}});

  const observer=new IntersectionObserver(entries=>entries.forEach((entry,i)=>{
    if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}
  }),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

  const hero=document.getElementById('heroVisual');
  const core=document.querySelector('.core-shell');
  if(hero&&core){hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;core.style.transform=`rotateY(${x*8}deg) rotateX(${-y*6}deg)`});hero.addEventListener('pointerleave',()=>core.style.transform='rotateY(0) rotateX(0)')}

  const root=document.getElementById('three-root');
  if(!root || !window.THREE) return;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(42,1,.1,100); camera.position.set(0,0,7.2);
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true}); renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.7)); root.appendChild(renderer.domElement);
  const group=new THREE.Group(); scene.add(group);
  const matCore=new THREE.MeshPhysicalMaterial({color:0x2d55b8,emissive:0x182c8a,emissiveIntensity:1.3,metalness:.35,roughness:.25,clearcoat:1,clearcoatRoughness:.2,transparent:true,opacity:.96});
  const coreMesh=new THREE.Mesh(new THREE.IcosahedronGeometry(1.47,4),matCore); group.add(coreMesh);
  const inner=new THREE.Mesh(new THREE.SphereGeometry(1.08,48,48),new THREE.MeshBasicMaterial({color:0x7eb8ff,transparent:true,opacity:.10})); group.add(inner);
  const ringMat=new THREE.MeshBasicMaterial({color:0x82b9ff,transparent:true,opacity:.38});
  [[2.0,.035,.45,0.25,0.7],[2.35,.022,-.68,.4,.25],[1.8,.024,1.1,-.45,1.0]].forEach((d)=>{const t=new THREE.Mesh(new THREE.TorusGeometry(d[0],d[1],12,140),ringMat); t.rotation.set(d[2],d[3],d[4]); group.add(t)});
  const particleGeo=new THREE.BufferGeometry(), count=420, pos=new Float32Array(count*3);
  for(let i=0;i<count;i++){const r=2.8+Math.random()*2.4, a=Math.random()*Math.PI*2, b=Math.acos(2*Math.random()-1); pos[i*3]=r*Math.sin(b)*Math.cos(a);pos[i*3+1]=r*Math.sin(b)*Math.sin(a);pos[i*3+2]=r*Math.cos(b)}
  particleGeo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const points=new THREE.Points(particleGeo,new THREE.PointsMaterial({color:0x78abff,size:.028,transparent:true,opacity:.82})); group.add(points);
  const starLight=new THREE.PointLight(0x6ca6ff,4,9);starLight.position.set(2.3,1.8,3);scene.add(starLight);scene.add(new THREE.AmbientLight(0x9dbdff,.8));
  function resize(){const r=root.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()} window.addEventListener('resize',resize);resize();
  const clock=new THREE.Clock();
  function animate(){const t=clock.getElapsedTime();group.rotation.y=t*.16;group.rotation.x=Math.sin(t*.32)*.09;coreMesh.rotation.x=t*.13;coreMesh.rotation.z=t*.1;points.rotation.y=-t*.035;renderer.render(scene,camera);requestAnimationFrame(animate)} animate();
})();
