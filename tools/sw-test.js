const fs=require('fs'), vm=require('vm');
// 브라우저 없이 sw.js 의 동작을 확인한다.
//   node tools/sw-test.js
// 크롬 없이도 캐시 규칙·오프라인 폴백·404 미저장을 검증할 수 있다.
const src=fs.readFileSync(__dirname+'/../sw.js','utf8');

// ── 가짜 캐시 저장소 ──
const store=new Map();
const mkCache=name=>({
  async match(req){ const m=store.get(name)||new Map(); return m.get(key(req))||undefined; },
  async put(req,res){ if(!store.has(name)) store.set(name,new Map()); store.get(name).set(key(req),res); },
  async keys(){ return [...(store.get(name)||new Map()).keys()].map(u=>({url:u})); },
  async delete(req){ return (store.get(name)||new Map()).delete(key(req)); },
  async add(u){ const r=await fetchImpl(u); if(!r.ok) throw new Error('add fail'); await this.put(u,r); }
});
const key=r=>typeof r==='string'?new URL(r,'https://x.io/west-europe-2027/').href:r.url;
const caches={
  _names:new Set(),
  async open(n){ this._names.add(n); return mkCache(n); },
  async keys(){ return [...this._names]; },
  async delete(n){ this._names.delete(n); store.delete(n); return true; },
  async match(req){ for(const n of this._names){ const c=mkCache(n); const h=await c.match(req); if(h) return h; } }
};
// ── 가짜 네트워크 ──
let offline=false, log=[];
const mkRes=(ok,status=200)=>({ok,status,clone(){return this}});
async function fetchImpl(req){
  const url=key(req); log.push(url);
  if(offline) throw new Error('offline');
  if(url.includes('/photos/')) return mkRes(false,404);   // 없는 사진
  return mkRes(true,200);
}
const listeners={};
const self={ addEventListener:(t,f)=>{(listeners[t]=listeners[t]||[]).push(f)},
             location:{origin:'https://x.io'}, clients:{claim:async()=>{}}, skipWaiting(){} };
const ctx={self,caches,fetch:fetchImpl,Response:class{constructor(b,i){this.body=b;Object.assign(this,i||{});this.ok=(this.status||200)<400}},
           URL,Promise,console,setTimeout};
vm.createContext(ctx); vm.runInContext(src,ctx);

// ── 시나리오 ──
const ev=(url,mode)=>{ let out=null;
  const e={request:{url,method:'GET',mode:mode||'no-cors'},respondWith:p=>{out=p}};
  listeners.fetch.forEach(f=>f(e)); return out; };

(async()=>{
  await Promise.all(listeners.install.map(f=>{let p;f({waitUntil:x=>p=x});return p}));
  await Promise.all(listeners.activate.map(f=>{let p;f({waitUntil:x=>p=x});return p}));
  const names=await caches.keys();
  console.log('설치 후 캐시:', names.join(', '));
  console.log('shell 항목수:', (store.get('shell-v2')||new Map()).size);

  const cases=[
    ['앱 화면(navigate)','https://x.io/west-europe-2027/','navigate'],
    ['지도 타일 OSM','https://tile.openstreetmap.org/6/33/22.png'],
    ['지도 타일 Esri','https://services.arcgisonline.com/ArcGIS/rest/x/6/22/33'],
    ['옛 CARTO(이제 안 잡힘)','https://a.basemaps.cartocdn.com/light_all/6/33/22.png'],
    ['위키미디어 사진','https://upload.wikimedia.org/a.jpg'],
    ['구글 폰트','https://fonts.gstatic.com/a.woff2'],
    ['좌석 배치도','https://x.io/west-europe-2027/seats/tw407-outbound.jpg'],
    ['없는 내 사진(404)','https://x.io/west-europe-2027/photos/sagrada-1.jpg'],
  ];
  for(const [label,url,mode] of cases){
    log=[]; const p=ev(url,mode); const r=p?await p.catch(e=>({err:e.message})):null;
    console.log(`  ${label.padEnd(24)} 처리:${p?'예':'아니오'}  네트워크호출:${log.length}  상태:${r&&r.status}`);
  }
  // 404 는 캐시에 남으면 안 된다
  const photoCached=await caches.match('https://x.io/west-europe-2027/photos/sagrada-1.jpg');
  console.log('\n404 사진이 캐시에 저장됐나:', photoCached?'예 ✗':'아니오 ✓');

  // 오프라인에서 화면 이동
  offline=true; log=[];
  const p=ev('https://x.io/west-europe-2027/','navigate'); const r=await p;
  console.log('오프라인 화면 이동 →', r&&r.ok?'캐시에서 앱 반환 ✓':'실패 ✗');
})();
