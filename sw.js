// sw.js: makes X Frame work offline once it is on the Home Screen.
//
// Cache-first, from a versioned cache filled at install time. The app makes no
// network requests of its own; the only traffic left is the browser's periodic
// check for a newer copy of this file, which is how updates arrive.
//
// EVERY RELEASE MUST CHANGE CACHE_VERSION. The browser only installs a new
// service worker when this file's bytes change, so without the bump installed
// copies keep serving the old app indefinitely.
//
// The new worker takes over at once (skipWaiting + claim). A page already open
// keeps the code it loaded; the next launch gets the new version.

const CACHE_VERSION = 'x-frame-v5';

const APP_FILES = [
  './',
  'index.html',
  'seed.js',
  'engine.js',
  'manifest.webmanifest',
  'icon-180.png',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      // cache: 'reload' skips the HTTP cache, so a new version is never
      // assembled from stale copies of files that changed.
      .then((cache) => cache.addAll(APP_FILES.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('x-frame-') && k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Any navigation inside the app's scope gets the app shell, so a launch with
  // a query string still opens offline.
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match(new URL('index.html', self.registration.scope).href, { ignoreSearch: true })
        .then((hit) => hit || fetch(req))
    );
    return;
  }

  event.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req)));
});
