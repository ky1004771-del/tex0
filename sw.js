/* 설치 가능 + 오프라인에서도 화면 틀은 열리게 하는 서비스워커 */
const CACHE = 'signiel-v1';
const FILES = ['./', './index.html', './style.css', './app.js', './taxstatus.js', './fx.js',
  './api.js', './config.js', './bg.jpg', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// 같은 사이트 파일만: 네트워크 우선 → 실패 시 캐시 (업데이트가 바로 반영됨)
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
