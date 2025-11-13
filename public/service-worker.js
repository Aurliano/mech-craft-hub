// Service Worker for SaydaTech PWA
const CACHE_NAME = 'saydatech-pwa-v6';
const OFFLINE_CACHE_URLS = [
  '/',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache opened');
        return cache.addAll(OFFLINE_CACHE_URLS);
      })
      .catch((error) => {
        console.error('Service Worker: Cache addAll failed', error);
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients
      return self.clients.claim();
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Only handle GET, same-origin requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);
  const path = url.pathname || '';

  // Bypass caching/interception for admin, static, media and API endpoints
  // Admin needs fresh assets; static/media are served by Django/WhiteNoise
  if (
    path.startsWith('/admin/') ||
    path.startsWith('/static/') ||
    path.startsWith('/media/') ||
    path.startsWith('/api/')
  ) {
    return; // Let the network handle it directly
  }

  // Network-first strategy for JavaScript assets to ensure fresh code
  // Cache-first for HTML and other static assets
  if (path.startsWith('/assets/') && path.endsWith('.js')) {
    // Network-first for JavaScript files to ensure we get the latest code
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try cache as fallback
          return caches.match(event.request);
        })
    );
    return;
  }

  // Cache-first strategy for other assets (HTML, CSS, images)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const isCachable = path === '/' || (path.startsWith('/assets/') && !path.endsWith('.js'));
          if (isCachable) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch((error) => {
          console.error('Service Worker: Fetch failed', error);
          throw error;
        });
    })
  );
});

// Message event
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker: Script loaded');