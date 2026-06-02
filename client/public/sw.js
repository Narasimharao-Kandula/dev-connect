const CACHE = 'devconnect-v1';
const ASSETS = ['/', '/offline'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request).then((cached) => {
      if (cached) return cached;
      if (event.request.mode === 'navigate') return caches.match('/offline');
      return new Response('Offline', { status: 503 });
    }))
  );
});
