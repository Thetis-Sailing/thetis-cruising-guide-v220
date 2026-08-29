'use strict';
const state={records:[],filtered:[],approachesBySite:new Map(),markers:new Map(),currentId:null,favorites:new Set(JSON.parse(localStorage.getItem('thetis-favorites')||'[]')),map:null,layer:null,userMarker:null};
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
function applyFilters(){const q=$('#searchInput').value.trim().toLowerCase(),zone=$('#zoneFilter').value,type=$('#typeFilter').value;state.filtered=state.records.filter(r=>(!q||searchable(r).includes(q))&&(!zone||r.zone===zone)&&(!type||r.type===type)&&(!$('#navilyFilter').checked||Boolean(NAVILY_PORT_LINKS[r.id]))&&(!$('#restaurantFilter').checked||isYes(r.restaurant))&&(!$('#vhfFilter').checked||isKnownVhf(r.vhf))&&(!$('#favoritesFilter').checked||state.favorites.has(r.id)));renderMarkers();renderList();const label=`${state.filtered.length} fiche${state.filtered.length>1?'s':''}`;$('#resultCount').textContent=label;$('#floatingCount').textContent=state.filtered.length;}
function renderMarkers(){state.layer.clearLayers();state.markers.clear();const bounds=[];state.filtered.forEach(r=>{if(!Number.isFinite(r.lat)||!Number.isFinite(r.lon))return;const m=L.marker([r.lat,r.lon],{icon:markerIcon(r)}).on('click',()=>showDetail(r.id));m.addTo(state.layer);state.markers.set(r.id,m);bounds.push([r.lat,r.lon]);});if(bounds.length&&state.filtered.length<state.records.length)state.map.fitBounds(bounds,{padding:[35,35],maxZoom:11});}
function serviceTag(v,label){const cls=isYes(v)?'yes':(!v||/vérifier|documenter/i.test(v)?'unknown':'');return `<span class="tag ${cls}">${label}: ${esc(clean(v))}</span>`;}
function renderList(){const list=$('#resultsList');list.innerHTML='';state.filtered.slice(0,150).forEach(r=>{const card=document.createElement('article');card.className='result-card';card.innerHTML=`<div class="result-title"><span>${esc(r.nom)}</span><span>${state.favorites.has(r.id)?'★':''}</span></div><div class="result-meta">${esc(r.zone)} · ${esc(r.type)}</div><div class="mini-tags">${serviceTag(r.vhf,'VHF')}${serviceTag(r.supermarche,'Courses')}${serviceTag(r.restaurant,'Resto')}</div>`;card.onclick=()=>{showDetail(r.id);const m=state.markers.get(r.id);if(m)state.map.setView(m.getLatLng(),Math.max(state.map.getZoom(),12));closeFiltersMobile();};list.appendChild(card);});}
function stars(n){if(!Number.isFinite(n))return'—';const x=Math.max(0,Math.min(5,Math.round(n)));return`${'★'.repeat(x)}${'☆'.repeat(5-x)} ${n.toFixed(1)}`;}
function depthText(r){const a=Number.isFinite(r.profondeurMin)?r.profondeurMin:null,b=Number.isFinite(r.profondeurMax)?r.profondeurMax:null;if(a!==null&&b!==null)return`${a} à ${b} m`;if(a!==null)return`dès ${a} m`;if(b!==null)return`jusqu’à ${b} m`;return'À documenter';}
function coordDM(value,isLat){if(!Number.isFinite(value))return'À documenter';const hemi=isLat?(value>=0?'N':'S'):(value>=0?'E':'W');const abs=Math.abs(value),deg=Math.floor(abs),min=(abs-deg)*60;return`${deg}°${min.toFixed(1).replace('.',',')}′ ${hemi}`;}
const infoCard=(l,v)=>`<div class="info-card"><b>${l}</b><strong>${esc(clean(v))}</strong></div>`;
function compass16(deg){
  if(!Number.isFinite(Number(deg)))return'—';
  const labels=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSO','SO','OSO','O','ONO','NO','NNO'];
  return labels[Math.round((((Number(deg)%360)+360)%360)/22.5)%16];
}
function fmtWeather(v,digits=0,suffix=''){
  const n=Number(v);return Number.isFinite(n)?`${n.toFixed(digits).replace('.',',')}${suffix}`:'—';
}
const NAVILY_PORT_LINKS={
  "S001":"https://www.navily.com/port/ic-cesme-marina/1627",
  "S002":"https://www.navily.com/port/setur-cesme-marina/1626",
  "S007":"https://www.navily.com/port/alacati-marina/1628",
  "S013":"https://www.navily.com/port/setur-kusadasi-marina/1630",
  "S014":"https://www.navily.com/port/kusadasi-quay-cesme/35005",
  "S017":"https://www.navily.com/port/didim-marina/1631",
  "S024":"https://www.navily.com/mouillage/asin-koyu/44679",
  "S025":"https://www.navily.com/port/milta-bodrum-marina/1639",
  "S026":"https://www.navily.com/port/cruise-port-bodrum-yacht-check-in-out/32877",
  "S032":"https://www.navily.com/port/d-marin-turgutreis-marina/1637",
  "S034":"https://www.navily.com/port/yal-kavak-marina/1636",
  "S043":"https://www.navily.com/mouillage/english-harbour/52644",
  "S049":"https://www.navily.com/port/datca/1646",
  "S061":"https://www.navily.com/port/marmaris-yacht-marine/1651",
  "S062":"https://www.navily.com/port/netsel-marmaris-marina/1650",
  "S067":"https://www.navily.com/mouillage/serce-limani-north-sparrow-bay/14416",
  "S073":"https://www.navily.com/port/mucev-marina/12223",
  "S075":"https://www.navily.com/port/skopea-marina/1655",
  "S083":"https://www.navily.com/port/ece-saray-marina/1656",
  "S086":"https://www.navily.com/mouillage/yesilkoey/21035",
  "S087":"https://www.navily.com/port/setur-kas-marina/1645",
  "S093":"https://www.navily.com/mouillage/gokkaya-limani/42563",
  "S095":"https://www.navily.com/port/setur-finike-marina/1659",
  "S109":"https://www.navily.com/port/mandraki/1536",
  "S110":"https://www.navily.com/port/kolona-port/24543",
  "S120":"https://www.navily.com/mouillage/kamiros/30585",
  "S121":"https://www.navily.com/port/symi-public-port/1550",
  "S133":"https://www.navily.com/port/luxury-marina-of-tilos/21997",
  "S138":"https://www.navily.com/port/chalki/1964",
  "S145":"https://www.navily.com/port/port-of-palon/1549",
  "S146":"https://www.navily.com/port/nisyros-mandraki-port/31319",
  "S150":"https://www.navily.com/port/kos-marina/1423",
  "S151":"https://www.navily.com/port/kos-port-mandraki/2055",
  "S157":"https://www.navily.com/port/kalymnos-marina/18946",
  "S169":"https://www.navily.com/port/lakki-town-marina/9748",
  "S170":"https://www.navily.com/mouillage/lakki-port/25271",
  "S174":"https://www.navily.com/port/agia-marina/19723",
  "S181":"https://www.navily.com/port/patmos-port/33352",
  "S185":"https://www.navily.com/mouillage/livadi-geranou/28701",
  "S187":"https://www.navily.com/port/lipsi-marina/32966",
  "S193":"https://www.navily.com/port/arki/24594",
  "S196":"https://www.navily.com/port/arki/24594",
  "S198":"https://www.navily.com/port/agathonisi/12015"
};
function navilyLocationButtonHtml(r){
  const url=NAVILY_PORT_LINKS[r.id];
  if(!url)return'';
  return `<a class="location-action-btn navily-btn"
       target="_blank" rel="noopener"
       href="${url}"
       title="Ouvrir dans Navily"
       aria-label="Ouvrir dans Navily">
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none"
         stroke="currentColor" stroke-width="1.8"
         stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11z"></path>
      <path d="M12 7v6"></path>
      <path d="M9.4 10.8c.7 1.7 1.6 2.6 2.6 2.6s1.9-.9 2.6-2.6"></path>
      <path d="M9.6 8.9h4.8"></path>
    </svg>
  </a>`;
}
function weatherToolsHtml(r){
  const meteoConsultUrl='https://marine.meteoconsult.fr/carte-marine/carte-interactive';
  const windyUrl=`https://www.windy.com/${r.lat}/${r.lon}`;

  return `<div class="weather-tools" aria-label="Outils météo externes">
    <a class="weather-tool-btn meteo-consult"
       href="${meteoConsultUrl}" target="_blank" rel="noopener"
       title="Ouvrir Météo Consult Marine"
       aria-label="Ouvrir Météo Consult Marine">
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
           stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="8.5"></circle>
        <path d="M14.8 9.2l-1.8 5.6-5.6 1.8 1.8-5.6 5.6-1.8z"></path>
        <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"></circle>
      </svg>
    </a>
    <a class="weather-tool-btn windy"
       href="${windyUrl}" target="_blank" rel="noopener"
       title="Ouvrir Windy"
       aria-label="Ouvrir Windy">
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
           stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 9.5h9.5a2.5 2.5 0 1 0-2.3-3.5"></path>
        <path d="M3 14h13.5a2.5 2.5 0 1 1-2.4 3.5"></path>
        <path d="M4 18.5h7"></path>
      </svg>
    </a>
  </div>`;
}
function weatherActionsHtml(r){
  return `<div class="weather-actions">
    <div class="weather-actions-left">
      <a class="weather-source-link" href="https://open-meteo.com/" target="_blank" rel="noopener">Open‑Meteo</a>
      <button id="weatherRefresh" type="button">Actualiser</button>
    </div>
    ${weatherToolsHtml(r)}
  </div>`;
}
function weatherSectionHtml(r){
  if(!Number.isFinite(r.lat)||!Number.isFinite(r.lon))return `<section class="thetis-section weather-section"><h3>Météo</h3><div class="weather-status">Coordonnées indisponibles.</div></section>`;
  return `<section class="thetis-section weather-section">
    <h3>Météo</h3>
    <div id="weatherPanel" class="weather-panel"><div class="weather-status">Chargement de la météo locale…</div></div>
    ${weatherActionsHtml(r)}
  </section>`;
}
async function loadWeather(r){
  const panel=$('#weatherPanel');if(!panel||state.currentId!==r.id)return;
  if(!navigator.onLine){panel.innerHTML='<div class="weather-status">Météo indisponible hors connexion.</div>';return;}
  const q=`latitude=${encodeURIComponent(r.lat)}&longitude=${encodeURIComponent(r.lon)}&timezone=auto&cell_selection=sea`;
  const weatherUrl=`https://api.open-meteo.com/v1/forecast?${q}&current=temperature_2m,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m&wind_speed_unit=kn`;
  const marineUrl=`https://marine-api.open-meteo.com/v1/marine?${q}&current=wave_height,wave_direction,wave_period,sea_surface_temperature`;
  try{
    const [wr,mr]=await Promise.allSettled([
      fetch(weatherUrl,{cache:'no-store'}).then(x=>{if(!x.ok)throw new Error(`Météo HTTP ${x.status}`);return x.json();}),
      fetch(marineUrl,{cache:'no-store'}).then(x=>{if(!x.ok)throw new Error(`Marine HTTP ${x.status}`);return x.json();})
    ]);
    if(state.currentId!==r.id)return;
    const w=wr.status==='fulfilled'?(wr.value.current||{}):{};
    const m=mr.status==='fulfilled'?(mr.value.current||{}):{};
    if(!Object.keys(w).length&&!Object.keys(m).length)throw new Error('Données indisponibles');
    const windDir=Number(w.wind_direction_10m);
    const waveDir=Number(m.wave_direction);
    const time=w.time||m.time||'';
    const localTime=time&&time.includes('T')?time.split('T')[1]:'';
    panel.innerHTML=`
      <div class="weather-grid">
        <div class="weather-card"><i>🌬️</i><small>Vent</small><strong>${fmtWeather(w.wind_speed_10m,0,' kt')}</strong><span>${compass16(windDir)}${Number.isFinite(windDir)?` · ${Math.round(windDir)}°`:''}</span></div>
        <div class="weather-card"><i>💨</i><small>Rafales</small><strong>${fmtWeather(w.wind_gusts_10m,0,' kt')}</strong><span>à 10 m</span></div>
        <div class="weather-card"><i>🌡️</i><small>Air / pression</small><strong>${fmtWeather(w.temperature_2m,0,' °C')}</strong><span>${fmtWeather(w.pressure_msl,0,' hPa')}</span></div>
        <div class="weather-card"><i>🌊</i><small>Vagues</small><strong>${fmtWeather(m.wave_height,1,' m')}</strong><span>${compass16(waveDir)}${Number.isFinite(waveDir)?` · ${Math.round(waveDir)}°`:''}</span></div>
        <div class="weather-card"><i>⏱️</i><small>Période</small><strong>${fmtWeather(m.wave_period,1,' s')}</strong><span>houle / mer</span></div>
        <div class="weather-card"><i>🌡️</i><small>Temp. mer</small><strong>${fmtWeather(m.sea_surface_temperature,0,' °C')}</strong><span>${localTime?`mise à jour ${esc(localTime)}`:'modèle météo'}</span></div>
      </div>
`;

  }catch(e){
    console.warn('Météo THETIS',e);
    if(state.currentId===r.id)panel.innerHTML='<div class="weather-status">Météo momentanément indisponible. Réessayer avec une connexion Internet.</div>';
  }
}
function approachHtml(siteId){
  const approaches=state.approachesBySite.get(siteId)||[];
  const visible=approaches.filter(a=>a.description||a.reperesVisuels||a.dangers);
  if(!visible.length)return'';
  return `<section class="thetis-section approach-section">
    <h3>Approche</h3>
    <div class="approach-list">${visible.map(a=>{
      const meta=[a.typeApproche,a.directionArrivee,a.difficulte?`Difficulté : ${a.difficulte}`:'',a.navigationNuit?`Nuit : ${a.navigationNuit}`:''].filter(Boolean);
      return `<article class="approach-card">
        ${meta.length?`<p class="approach-meta">${meta.map(esc).join(' · ')}</p>`:''}
        ${a.description?`<p>${esc(a.description)}</p>`:''}
        ${a.reperesVisuels?`<p><strong>Repères visuels :</strong> ${esc(a.reperesVisuels)}</p>`:''}
        ${a.dangers?`<p class="approach-warning"><strong>Vigilance :</strong> ${esc(a.dangers)}</p>`:''}
        ${a.profondeurEntree!==null?`<p><strong>Profondeur à l’entrée :</strong> ${esc(a.profondeurEntree)} m</p>`:''}
      </article>`;
    }).join('')}</div>
  </section>`;
}
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
          <div class="coordinates-data"><small>Coordonnées</small><strong>${coordText}</strong></div>
          <div class="location-actions">
            <a class="location-action-btn maps-btn"
               target="_blank" rel="noopener"
               href="https://www.google.com/maps?q=${lat},${lon}"
               title="Ouvrir dans Google Maps"
               aria-label="Ouvrir dans Google Maps">⌖</a>
            ${navilyLocationButtonHtml(r)}
          </div>
        </div>
      </section>

      ${weatherSectionHtml(r)}

      ${approachHtml(r.id)}

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
          <div><span>☎</span><small>Téléphone</small><strong>${esc(clean(r.telephone))}</strong></div>
          <div><span>⛽</span><small>Carburant</small><strong>${esc(clean(e.carburant))}</strong></div>
          <div><span>💧</span><small>Eau</small><strong>${esc(clean(e.eau))}</strong></div>
          <div><span>⚡</span><small>Électricité</small><strong>${esc(clean(e.electricite))}</strong></div>
          <div><span>🚿</span><small>Douches</small><strong>${esc(clean(e.douches))}</strong></div>
          <div><span>🧺</span><small>Laverie</small><strong>${esc(clean(e.laverie))}</strong></div>
          <div><span>♻</span><small>Déchets</small><strong>${esc(clean(e.dechets))}</strong></div>
          <div><span>🔧</span><small>Réparation</small><strong>${esc(clean(e.chantierReparations))}</strong></div>
        </div>
      </section>

      <section class="thetis-section">
        <h3>À terre</h3>
        <div class="shore-grid">
          <div><span>📶</span><small>Wi-Fi</small><strong>${esc(clean(e.wifi))}</strong></div>
          <div><span>🛒</span><small>Supermarché</small><strong>${esc(clean(r.supermarche))}</strong></div>
          <div><span>🍴</span><small>Restaurant / Snack</small><strong>${esc(clean(r.restaurant))}</strong></div>
        </div>
      </section>

      <section class="thetis-section thetis-comment-section">
        <h3>Commentaire THETIS</h3>
        <p class="thetis-comment${r.notesThetis?'':' is-draft'}">${r.notesThetis?esc(String(r.notesThetis).replace(/\s+/g,' ').trim()):'Commentaire THETIS en cours de rédaction...'}</p>
      </section> 

     

     <footer class="profile-disclaimer important"><span>⚠️</span><p><strong>IMPORTANT</strong><br>Les informations de <strong>THETIS</strong> sont fournies à titre indicatif. <strong>Une vérification sur Navionics est indispensable avant toute navigation</strong>, ainsi qu'avec les cartes marines officielles et les Instructions nautiques. Les données météorologiques sont indicatives : vérifiez également les prévisions marines officielles et vos outils météo habituels.</p></footer>
    </article>`;
  $('#favoriteBtn').onclick=()=>toggleFavorite(id);
  $('#detailSheet').classList.add('open');
  const weatherRefresh=$('#weatherRefresh');
  if(weatherRefresh)weatherRefresh.onclick=()=>{const panel=$('#weatherPanel');if(panel)panel.innerHTML='<div class="weather-status">Actualisation…</div>';loadWeather(r);};
  loadWeather(r);
}

function toggleFavorite(id){state.favorites.has(id)?state.favorites.delete(id):state.favorites.add(id);localStorage.setItem('thetis-favorites',JSON.stringify([...state.favorites]));showDetail(id);applyFilters();}
function openFiltersMobile(){if(innerWidth<=760){$('#filtersPanel').classList.add('open');$('#panelBackdrop').classList.add('show');$('#filtersToggle').setAttribute('aria-expanded','true');}}
function closeFiltersMobile(){if(innerWidth<=760){$('#filtersPanel').classList.remove('open');$('#panelBackdrop').classList.remove('show');$('#filtersToggle').setAttribute('aria-expanded','false');}}
function resetFilters(){$('#searchInput').value='';$('#zoneFilter').value='';$('#typeFilter').value='';['navilyFilter','restaurantFilter','vhfFilter','favoritesFilter'].forEach(id=>$('#'+id).checked=false);applyFilters();state.map.setView([36.8,27.8],7);}
function locateUser(){if(!navigator.geolocation){alert('Géolocalisation indisponible.');return;}navigator.geolocation.getCurrentPosition(p=>{const ll=[p.coords.latitude,p.coords.longitude];if(state.userMarker)state.userMarker.remove();state.userMarker=L.circleMarker(ll,{radius:8,color:'#fff',weight:3,fillColor:'#26c6e9',fillOpacity:1}).addTo(state.map);state.map.setView(ll,12);},()=>alert('Impossible d’obtenir votre position.'));}
function setOnlineState(){$('#offlineBadge').classList.toggle('show',!navigator.onLine);}
function bindUI(){let timer;$('#searchInput').addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(applyFilters,120);});['zoneFilter','typeFilter','navilyFilter','restaurantFilter','vhfFilter','favoritesFilter'].forEach(id=>$('#'+id).addEventListener('change',applyFilters));$('#resetFilters').onclick=resetFilters;$('#filtersToggle').onclick=openFiltersMobile;$('#filtersClose').onclick=closeFiltersMobile;$('#panelBackdrop').onclick=closeFiltersMobile;$('#detailClose').onclick=()=>$('#detailSheet').classList.remove('open');$('#locateBtn').onclick=locateUser;$('#themeBtn').onclick=()=>document.body.classList.toggle('night');addEventListener('online',setOnlineState);addEventListener('offline',setOnlineState);setOnlineState();}
let installPrompt=null;addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;$('#installBtn').hidden=false;});$('#installBtn').addEventListener('click',async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;$('#installBtn').hidden=true;});
async function registerServiceWorker(){if(!('serviceWorker'in navigator))return;try{const reg=await navigator.serviceWorker.register('sw.js');reg.addEventListener('updatefound',()=>{const worker=reg.installing;if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)$('#updateBadge').classList.add('show');});});$('#updateBadge').onclick=()=>location.reload();}catch(e){console.error(e);}}
const DB_PATH='database/THETIS_Database_MASTER.xlsx';
const DB_SHEET='Base_THETIS_MASTER';
const APPROACH_SHEET='Approches';
const num=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:null;};
const text=v=>(v===null||v===undefined)?'':String(v).trim();
function sheetRows(workbook,sheetName,requiredHeader){
  const sheet=workbook.Sheets[sheetName];
  if(!sheet)return[];
  const matrix=XLSX.utils.sheet_to_json(sheet,{header:1,defval:''});
  const headerIndex=matrix.findIndex(row=>row.some(cell=>text(cell)===requiredHeader));
  if(headerIndex<0)return[];
  const headers=matrix[headerIndex].map(text);
  return matrix.slice(headerIndex+1).filter(row=>row.some(cell=>text(cell))).map(row=>Object.fromEntries(headers.map((h,i)=>[h,row[i]??''])));
}
function excelRowToApproach(row,index){
  return {
    idApproche:text(row.ID_Approche)||`APP-${index+1}`,
    idSite:text(row.ID_Site),
    typeApproche:text(row.Type_approche),
    directionArrivee:text(row['Direction_arrivée']),
    description:text(row.Description),
    reperesVisuels:text(row['Repères_visuels']),
    dangers:text(row.Dangers),
    profondeurEntree:num(row['Profondeur_entrée_m']),
    difficulte:text(row['Difficulté']),
    navigationNuit:text(row.Navigation_nuit),
    ventTraversier:text(row.Vent_traversier),
    source:text(row.Source),
    dateVerification:text(row['Date_vérification']),
    niveauConfiance:text(row.Niveau_confiance),
    statut:text(row.Statut)
  };
}
function indexApproaches(rows){
  const map=new Map();
  rows.filter(a=>a.idSite&&!/archiv/i.test(a.statut)).forEach(a=>{
    if(!map.has(a.idSite))map.set(a.idSite,[]);
    map.get(a.idSite).push(a);
  });
  return map;
}
function excelRowToRecord(row,index){
  const protections={N:text(row['Prot. N']),NE:text(row['Prot. NE']),E:text(row['Prot. E']),SE:text(row['Prot. SE']),S:text(row['Prot. S']),SO:text(row['Prot. SO']),O:text(row['Prot. O']),NO:text(row['Prot. NO'])};
  return {
    id:text(row.ID)||`THETIS-${index+1}`,
    nom:text(row.Nom),zone:text(row.Zone),pays:text(row.Pays),type:text(row.Type),
    lat:num(row.Latitude),lon:num(row.Longitude),note:num(row['Note /5']),
    protections,profondeurMin:num(row['Prof. min']),profondeurMax:num(row['Prof. max']),
    fond:text(row.Fond),tenue:text(row['Tenue estimée']),aussieres:text(row['Aussières']),
    vhf:text(row['Canal VHF']),telephone:text(row['Téléphone']),supermarche:text(row['Supermarché']),restaurant:text(row['Restaurant / Snack']),
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
  const baseSheet=workbook.Sheets[DB_SHEET];
  if(!baseSheet)throw new Error(`Feuille ${DB_SHEET} introuvable`);
  const records=XLSX.utils.sheet_to_json(baseSheet,{defval:''}).map(excelRowToRecord).filter(r=>r.nom);
  const approaches=sheetRows(workbook,APPROACH_SHEET,'ID_Approche').map(excelRowToApproach).filter(a=>a.idSite);
  return {records,approaches};
}
async function start(){initMap();bindUI();try{const [database,vRes]=await Promise.all([loadExcelDatabase(),fetch('version.json',{cache:'no-store'})]);state.records=database.records;state.approachesBySite=indexApproaches(database.approaches);console.info(`THETIS v2.5.1 : ${state.records.length} fiches, ${database.approaches.length} approche(s) chargée(s).`);if(vRes.ok){const v=await vRes.json();$('#appVersion').textContent=`v${v.version||'2.5.1'}`;}fillSelect('#zoneFilter',state.records.map(r=>r.zone));fillSelect('#typeFilter',state.records.map(r=>r.type));state.filtered=[...state.records];applyFilters();}catch(e){console.error(e);$('#resultCount').textContent='Erreur de chargement';alert(`Impossible de charger la base THETIS.\n${e.message||e}`);}registerServiceWorker();}
start();
