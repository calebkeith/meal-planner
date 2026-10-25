// Offline cache: app shell precached on install; same-origin GETs are cache-first (prices.json network-first).
const CACHE = 'mealplanner-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './apple-touch-icon.png', './icon-192.png', './icon-512.png', './prices.json'];
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url); if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  const put = r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; };
  if (u.pathname.endsWith('prices.json') || e.request.mode === 'navigate')
    e.respondWith(fetch(e.request).then(put).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
  else e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(put)));
});
