/* 서유럽 2027 — 오프라인 지원 서비스워커
 *
 * index.html 을 고쳤으면 아래 VERSION 을 올리세요.
 * 그래야 이미 앱을 연 적 있는 기기에 "새 버전이 준비됐습니다" 알림이 뜹니다.
 */
const VERSION = 'v1';
const SHELL   = 'shell-' + VERSION;   // 앱 본체. 버전이 바뀌면 통째로 새로 받음
const ASSET   = 'asset-' + VERSION;   // 폰트·Leaflet 등 바뀌지 않는 외부 파일
const PHOTO   = 'photo-1';            // 사진. 버전과 무관하게 유지
const TILE    = 'tile-1';             // 지도 타일. 본 곳만 남음

const PHOTO_MAX = 120;
const TILE_MAX  = 400;

/* 인터넷 없이도 열려야 하는 것들 */
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './seats/tw407-outbound.jpg',
  './seats/tw406-return.jpg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(SHELL)
      // 하나라도 실패하면 설치 전체가 실패하므로 개별로 담는다
      .then(c => Promise.all(PRECACHE.map(u => c.add(u).catch(() => {}))))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keep = [SHELL, ASSET, PHOTO, TILE];
    const names = await caches.keys();
    await Promise.all(names.filter(n => !keep.includes(n)).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

/* 페이지가 "지금 갈아끼워라"라고 알려줄 때 */
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

/* 캐시가 무한정 커지지 않도록 오래된 것부터 지운다 */
async function trim(name, max) {
  const c = await caches.open(name);
  const keys = await c.keys();
  for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);
}

async function cacheFirst(req, name, max) {
  const c = await caches.open(name);
  const hit = await c.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  // 200 응답만 저장. 404(없는 사진 확인용 요청)를 캐시하면 나중에 사진을 넣어도 안 보인다
  if (res.ok) { await c.put(req, res.clone()); if (max) trim(name, max); }
  return res;
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (_) { return; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  const host = url.hostname;

  /* 화면 이동: 인터넷을 먼저 시도하고, 안 되면 저장해 둔 앱을 연다 */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok) caches.open(SHELL).then(c => c.put('./index.html', res.clone()));
          return res;
        })
        .catch(async () =>
          (await caches.match('./index.html')) ||
          (await caches.match('./')) ||
          new Response('오프라인입니다.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
        )
    );
    return;
  }

  /* 지도 타일 — 본 곳만 남겨 두면 현지에서 데이터 없이도 대충 보인다 */
  if (host.endsWith('basemaps.cartocdn.com') || host === 'tile.openstreetmap.org') {
    e.respondWith(cacheFirst(req, TILE, TILE_MAX).catch(() => caches.match(req)));
    return;
  }

  /* 위키미디어 공용 사진 */
  if (host === 'upload.wikimedia.org' || host === 'commons.wikimedia.org') {
    e.respondWith(cacheFirst(req, PHOTO, PHOTO_MAX).catch(() => caches.match(req)));
    return;
  }

  /* 폰트·Leaflet */
  if (host === 'fonts.googleapis.com' || host === 'fonts.gstatic.com' || host === 'cdnjs.cloudflare.com') {
    e.respondWith(cacheFirst(req, ASSET).catch(() => caches.match(req)));
    return;
  }

  /* 같은 폴더 안의 파일(좌석 배치도, 내 사진, 아이콘 …) */
  if (url.origin === self.location.origin) {
    e.respondWith((async () => {
      const hit = await caches.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (res.ok) {
          const isPhoto = url.pathname.includes('/photos/');
          const c = await caches.open(isPhoto ? PHOTO : SHELL);
          c.put(req, res.clone());
          if (isPhoto) trim(PHOTO, PHOTO_MAX);
        }
        return res;
      } catch (err) {
        // 오프라인에서 없는 사진을 찾는 경우 — 404로 답해야 앱이 다음 후보로 넘어간다
        return new Response('', { status: 404 });
      }
    })());
  }
});
