const CACHE='thetis-v2.4.2';
const SHELL=['./','./index.html','./styles.css','./app.js','./manifest.webmanifest','./version.json','./database/THETIS_Database_MASTER.xlsx','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.pathname.endsWith('/version.json')||u.pathname.endsWith('/database/THETIS_Database_MASTER.xlsx')){
    e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;}).catch(()=>caches.match(e.request)));return;
  }
  if(u.hostname.includes('tile.openstreetmap.org')||u.hostname.includes('unpkg.com')||u.hostname.includes('cdn.jsdelivr.net')){
    e.respondWith(caches.open(CACHE).then(async c=>{const hit=await c.match(e.request);if(hit)return hit;try{const fresh=await fetch(e.request);if(fresh.ok)c.put(e.request,fresh.clone());return fresh;}catch(_){return new Response('',{status:503});}}));return;
  }
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r;}).catch(()=>caches.match('./index.html'))));
});
