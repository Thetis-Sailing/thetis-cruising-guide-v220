'use strict';
const state={records:[],filtered:[],markers:new Map(),currentId:null,favorites:new Set(JSON.parse(localStorage.getItem('thetis-favorites')||'[]')),map:null,layer:null,userMarker:null};
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=(v,f='À documenter')=>(v===null||v===undefined||String(v).trim()==='')?f:String(v);
const isYes=v=>/^oui$/i.test(clean(v,''));
const isKnownVhf=v=>!['','—','-','à vérifier','à documenter'].includes(clean(v,'').toLowerCase());
const qualityClass=v=>'quality-'+clean(v,'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z]/g,'');
function markerIcon(r){const t=clean(r.type,'').toLowerCase();let cls='marker-mouillage',symbol='⚓';if(t.includes('marina')){cls='marker-marina';symbol='M';}else if(t.includes('port')||t.includes('quai')){cls='marker-port';symbol='P';}const fav=state.favorites.has(r.id)?' marker-fav':'';return L.divIcon({className:'',html:`<div class="marker ${cls}${fav}">${symbol}</div>`,iconSize:[31,31],iconAnchor:[15,15]});}
function initMap(){state.map=L.map('map',{zoomControl:true,preferCanvas:true}).setView([36.8,27.8],7);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'© OpenStreetMap'}).addTo(state.map);state.layer=L.layerGroup().addTo(state.map);}
function fillSelect(sel,vals){const el=$(sel);[...new Set(vals.filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr')).forEach(v=>el.add(new Option(v,v)));}
function searchable(r){return `${r.nom} ${r.zone} ${r.pays} ${r.type} ${r.vhf} ${r.supermarche} ${r.restaurant} ${r.notesThetis||''}`.toLowerCase();}
function applyFilters(){const q=$('#searchInput').value.trim().toLowerCase(),zone=$('#zoneFilter').value,type=$('#typeFilter').value;state.filtered=state.records.filter(r=>(!q||searchable(r).includes(q))&&(!zone||r.zone===zone)&&(!type||r.type===type)&&(!$('#supermarketFilter').checked||isYes(r.supermarche))&&(!$('#restaurantFilter').checked||isYes(r.restaurant))&&(!$('#vhfFilter').checked||isKnownVhf(r.vhf))&&(!$('#favoritesFilter').checked||state.favorites.has(r.id)));renderMarkers();renderList();const label=`${state.filtered.length} fiche${state.filtered.length>1?'s':''}`;$('#resultCount').textContent=label;$('#floatingCount').textContent=state.filtered.length;}
function renderMarkers(){state.layer.clearLayers();state.markers.clear();const bounds=[];state.filtered.forEach(r=>{if(!Number.isFinite(r.lat)||!Number.isFinite(r.lon))return;const m=L.marker([r.lat,r.lon],{icon:markerIcon(r)}).on('click',()=>showDetail(r.id));m.addTo(state.layer);state.markers.set(r.id,m);bounds.push([r.lat,r.lon]);});if(bounds.length&&state.filtered.length<state.records.length)state.map.fitBounds(bounds,{padding:[35,35],maxZoom:11});}
function serviceTag(v,label){const cls=isYes(v)?'yes':(!v||/vérifier|documenter/i.test(v)?'unknown':'');return `<span class="tag ${cls}">${label}: ${esc(clean(v))}</span>`;}
function renderList(){const list=$('#resultsList');list.innerHTML='';state.filtered.slice(0,150).forEach(r=>{const card=document.createElement('article');card.className='result-card';card.innerHTML=`<div class="result-title"><span>${esc(r.nom)}</span><span>${state.favorites.has(r.id)?'★':''}</span></div><div class="result-meta">${esc(r.zone)} · ${esc(r.type)}</div><div class="mini-tags">${serviceTag(r.vhf,'VHF')}${serviceTag(r.supermarche,'Courses')}${serviceTag(r.restaurant,'Resto')}</div>`;card.onclick=()=>{showDetail(r.id);const m=state.markers.get(r.id);if(m)state.map.setView(m.getLatLng(),Math.max(state.map.getZoom(),12));closeFiltersMobile();};list.appendChild(card);});}
function stars(n){if(!Number.isFinite(n))return'—';const x=Math.max(0,Math.min(5,Math.round(n)));return`${'★'.repeat(x)}${'☆'.repeat(5-x)} ${n.toFixed(1)}`;}
function depthText(r){const a=Number.isFinite(r.profondeurMin)?r.profondeurMin:null,b=Number.isFinite(r.profondeurMax)?r.profondeurMax:null;if(a!==null&&b!==null)return`${a} à ${b} m`;if(a!==null)return`dès ${a} m`;if(b!==null)return`jusqu’à ${b} m`;return'À documenter';}
function coordDM(value,isLat){if(!Number.isFinite(value))return'À documenter';const hemi=isLat?(value>=0?'N':'S'):(value>=0?'E':'W');const abs=Math.abs(value),deg=Math.floor(abs),min=(abs-deg)*60;return`${deg}°${min.toFixed(1).replace('.',',')}′ ${hemi}`;}
const infoCard=(l,v)=>`<div class="info-card"><b>${l}</b><strong>${esc(clean(v))}</strong></div>`;
function equipmentHtml(r){const e=r.equipements||{};const items=[['Carburant',e.carburant],['Eau',e.eau],['Électricité',e.electricite],['Douches',e.douches],['Laverie',e.laverie],['Wi-Fi',e.wifi],['Déchets',e.dechets],['Réparations',e.chantierReparations]].filter(([,v])=>v&&!['—','À documenter'].includes(v));if(!items.length)return'';return `<div class="section-card"><h3>Équipements</h3><div class="equipment-grid">${items.map(([k,v])=>`<div class="equipment-item"><span>${esc(k)}</span><strong>${esc(v)}</strong></div>`).join('')}</div></div>`;}
function protectionLevel(v){
  const t=clean(v,'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(t.includes('excellent'))return['excellent','Excellente'];
  if(t.includes('bon'))return['good','Bonne'];
  if(t.includes('moy'))return['medium','Moyenne'];
  if(t.includes('faible')||t.includes('dang'))return['weak','Faible'];
  return['unknown',clean(v)];
}
function warningItems(r){
  return [r.avertissementProtection,r.avertissement]
    .filter(Boolean)
    .flatMap(v=>String(v).split(/\n|[•;]/))
    .map(v=>v.trim()).filter(Boolean);
}
function showDetail(id){
  const r=state.records.find(x=>x.id===id);if(!r)return;
  state.currentId=id;
  const fav=state.favorites.has(id);
  const lat=Number.isFinite(r.lat)?r.lat:0,lon=Number.isFinite(r.lon)?r.lon:0;
  const coordText=`${coordDM(r.lat,true)}  |  ${coordDM(r.lon,false)}`;
  const protections=r.protections||{};
  const windLabels=[['N','N'],['NE','NE'],['E','E'],['SE','SE'],['S','S'],['SO','SW'],['O','W'],['NO','NW']];
  const winds=windLabels.map(([key,label])=>{const [level,text]=protectionLevel(protections[key]);return `<div class="wind-box"><b>${label}</b><span class="wind-shield ${level}">◆</span><small>${esc(text)}</small></div>`}).join('');
  const e=r.equipements||{};
  const warnings=warningItems(r);
  const warningHtml=warnings.length?`<section class="thetis-section"><h3>À savoir</h3><div class="warning-list">${warnings.map(x=>`<p><span>⚠</span>${esc(x)}</p>`).join('')}</div></section>`:'';
  $('#detailContent').innerHTML=`
    <article class="thetis-profile">
      <header class="profile-header">
        <div class="profile-heading">
          <h2>${esc(r.nom)}</h2>
          <p><span>📍</span> Zone : <strong>${esc(r.zone)}</strong>${r.pays?` <em>${esc(r.pays)}</em>`:''}</p>
          <p><span>⚓</span> Type : <strong>${esc(r.type)}</strong></p>
          <p class="profile-rating"><span>▣</span> Note THETIS <b>${stars(r.note)}</b></p>
        </div>
        <button id="favoriteBtn" class="profile-favorite ${fav?'on':''}" aria-label="Favori">${fav?'★':'☆'}</button>
      </header>

      <section class="thetis-section location-section">
        <h3>Localisation</h3>
        <div class="coordinates-row">
          <div><small>Coordonnées</small><strong>${coordText}</strong></div>
          <a target="_blank" rel="noopener" href="https://www.google.com/maps?q=${lat},${lon}" aria-label="Ouvrir dans Google Maps">⌖</a>
        </div>
      </section>

      <section class="thetis-section">
        <h3>Protection du mouillage</h3>
        <div class="wind-matrix">${winds}</div>
      </section>

      <section class="thetis-section">
        <h3>Caractéristiques</h3>
        <div class="feature-grid">
          <div class="feature-card"><span>♒</span><p><small>Profondeur</small><strong>${esc(depthText(r))}</strong></p></div>
          <div class="feature-card"><span>∴</span><p><small>Nature du fond</small><strong>${esc(clean(r.fond))}</strong></p></div>
          <div class="feature-card"><span>⚓</span><p><small>Tenue</small><strong>${esc(clean(r.tenue))}</strong></p></div>
          <div class="feature-card"><span>⚯</span><p><small>Aussières à terre</small><strong>${esc(clean(r.aussieres))}</strong></p></div>
        </div>
      </section>

      <section class="thetis-section">
        <h3>Services</h3>
        <div class="service-grid">
          <div><span>📻</span><small>VHF</small><strong>${esc(clean(r.vhf))}</strong></div>
          <div><span>⛽</span><small>Carburant</small><strong>${esc(clean(e.carburant))}</strong></div>
          <div><span>💧</span><small>Eau</small><strong>${esc(clean(e.eau))}</strong></div>
          <div><span>⚡</span><small>Électricité</small><strong>${esc(clean(e.electricite))}</strong></div>
        </div>
      </section>

      <section class="thetis-section">
        <h3>À terre</h3>
        <div class="shore-grid">
          <div><span>🛒</span><small>Supermarché</small><strong>${esc(clean(r.supermarche))}</strong></div>
          <div><span>🍴</span><small>Restaurant / Snack</small><strong>${esc(clean(r.restaurant))}</strong></div>
          <div><span>☕</span><small>Café</small><strong>${esc(clean(e.cafe||e.bar||r.cafe))}</strong></div>
        </div>
      </section>

      ${r.notesThetis?`<section class="thetis-section notes-section"><h3>Notes THETIS</h3><p>${esc(r.notesThetis)}</p></section>`:''}
      ${r.usage?`<section class="thetis-section notes-section"><h3>Usage recommandé</h3><p>${esc(r.usage)}</p></section>`:''}
      ${warningHtml}

      <footer class="profile-disclaimer"><span>ⓘ</span><p>Les informations sont fournies à titre indicatif et doivent toujours être vérifiées avec les cartes officielles, les instructions nautiques et les conditions météorologiques du moment.</p></footer>
    </article>`;
  $('#favoriteBtn').onclick=()=>toggleFavorite(id);
  $('#detailSheet').classList.add('open');
}

function toggleFavorite(id){state.favorites.has(id)?state.favorites.delete(id):state.favorites.add(id);localStorage.setItem('thetis-favorites',JSON.stringify([...state.favorites]));showDetail(id);applyFilters();}
function openFiltersMobile(){if(innerWidth<=760){$('#filtersPanel').classList.add('open');$('#panelBackdrop').classList.add('show');$('#filtersToggle').setAttribute('aria-expanded','true');setTimeout(()=>$('#searchInput').focus(),120);}}
function closeFiltersMobile(){if(innerWidth<=760){$('#filtersPanel').classList.remove('open');$('#panelBackdrop').classList.remove('show');$('#filtersToggle').setAttribute('aria-expanded','false');}}
function resetFilters(){$('#searchInput').value='';$('#zoneFilter').value='';$('#typeFilter').value='';['supermarketFilter','restaurantFilter','vhfFilter','favoritesFilter'].forEach(id=>$('#'+id).checked=false);applyFilters();state.map.setView([36.8,27.8],7);}
function locateUser(){if(!navigator.geolocation){alert('Géolocalisation indisponible.');return;}navigator.geolocation.getCurrentPosition(p=>{const ll=[p.coords.latitude,p.coords.longitude];if(state.userMarker)state.userMarker.remove();state.userMarker=L.circleMarker(ll,{radius:8,color:'#fff',weight:3,fillColor:'#26c6e9',fillOpacity:1}).addTo(state.map);state.map.setView(ll,12);},()=>alert('Impossible d’obtenir votre position.'));}
function setOnlineState(){$('#offlineBadge').classList.toggle('show',!navigator.onLine);}
function bindUI(){let timer;$('#searchInput').addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(applyFilters,120);});['zoneFilter','typeFilter','supermarketFilter','restaurantFilter','vhfFilter','favoritesFilter'].forEach(id=>$('#'+id).addEventListener('change',applyFilters));$('#resetFilters').onclick=resetFilters;$('#filtersToggle').onclick=openFiltersMobile;$('#filtersClose').onclick=closeFiltersMobile;$('#panelBackdrop').onclick=closeFiltersMobile;$('#detailClose').onclick=()=>$('#detailSheet').classList.remove('open');$('#locateBtn').onclick=locateUser;$('#themeBtn').onclick=()=>document.body.classList.toggle('night');addEventListener('online',setOnlineState);addEventListener('offline',setOnlineState);setOnlineState();}
let installPrompt=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#installBtn').hidden=false;});$('#installBtn').addEventListener('click',async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('#installBtn').hidden=true;});
async function registerServiceWorker(){if(!('serviceWorker'in navigator))return;try{const reg=await navigator.serviceWorker.register('sw.js');reg.addEventListener('updatefound',()=>{const worker=reg.installing;if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)$('#updateBadge').classList.add('show');});});$('#updateBadge').onclick=()=>location.reload();}catch(e){console.error(e);}}
const DB_PATH='database/THETIS_Database_MASTER.xlsx';
const DB_SHEET='Base_THETIS_MASTER';
const num=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:null;};
const text=v=>(v===null||v===undefined)?'':String(v).trim();
function excelRowToRecord(row,index){
  const protections={N:text(row['Prot. N']),NE:text(row['Prot. NE']),E:text(row['Prot. E']),SE:text(row['Prot. SE']),S:text(row['Prot. S']),SO:text(row['Prot. SO']),O:text(row['Prot. O']),NO:text(row['Prot. NO'])};
  return {
    id:text(row.ID)||`THETIS-${index+1}`,
    nom:text(row.Nom),zone:text(row.Zone),pays:text(row.Pays),type:text(row.Type),
    lat:num(row.Latitude),lon:num(row.Longitude),note:num(row['Note /5']),
    protections,profondeurMin:num(row['Prof. min']),profondeurMax:num(row['Prof. max']),
    fond:text(row.Fond),tenue:text(row['Tenue estimée']),aussieres:text(row['Aussières']),
    vhf:text(row['Canal VHF']),supermarche:text(row['Supermarché']),restaurant:text(row['Restaurant / Snack']),
    notesThetis:text(row['Notes THETIS']),usage:text(row['Usage recommandé']),
    precisionPosition:text(row['Précision position']),avertissementProtection:text(row['Avertissement protection']),
    avertissement:text(row['Avertissement']),
    equipements:{carburant:text(row.Carburant),eau:text(row.Eau),electricite:text(row['Électricité']),douches:text(row.Douches),laverie:text(row.Laverie),wifi:text(row['Wi-Fi']),dechets:text(row['Déchets']),chantierReparations:text(row['Chantier / réparations'])}
  };
}
async function loadExcelDatabase(){
  if(typeof XLSX==='undefined')throw new Error('Bibliothèque Excel indisponible');
  const res=await fetch(DB_PATH,{cache:'no-store'});
  if(!res.ok)throw new Error(`Classeur Excel introuvable (HTTP ${res.status})`);
  const workbook=XLSX.read(await res.arrayBuffer(),{type:'array',cellDates:true});
  const sheet=workbook.Sheets[DB_SHEET];
  if(!sheet)throw new Error(`Feuille ${DB_SHEET} introuvable`);
  return XLSX.utils.sheet_to_json(sheet,{defval:''}).map(excelRowToRecord).filter(r=>r.nom);
}
async function start(){initMap();bindUI();try{const [records,vRes]=await Promise.all([loadExcelDatabase(),fetch('version.json',{cache:'no-store'})]);state.records=records;if(vRes.ok){const v=await vRes.json();$('#appVersion').textContent=`v${v.version||'2.1.0'}`;}fillSelect('#zoneFilter',state.records.map(r=>r.zone));fillSelect('#typeFilter',state.records.map(r=>r.type));state.filtered=[...state.records];applyFilters();}catch(e){console.error(e);$('#resultCount').textContent='Erreur de chargement';alert(`Impossible de charger la base THETIS.\n${e.message||e}`);}registerServiceWorker();}
start();
