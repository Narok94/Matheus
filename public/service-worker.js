const CACHE_NAME = 'mds-cache-v4'; // Increment version to trigger update
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// On install, cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching App Shell');
        return cache.addAll(APP_SHELL_URLS);
      })
      .then(() => self.skipWaiting()) // Activate new SW immediately
  );
});

// On activate, clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of open pages
  );
});

// On fetch, use Network-First strategy for all assets
self.addEventListener('fetch', event => {
  // We only want to handle GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // If the request is successful, clone it and cache it.
        return caches.open(CACHE_NAME).then(cache => {
          if (networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
      })
      .catch(() => {
        // If the network request fails (e.g., offline),
        // try to serve the response from the cache.
        return caches.match(event.request);
      })
  );
});


// --- Existing Push & Sync Logic ---

// Ouve por eventos de push para exibir notificações.
self.addEventListener('push', event => {
  console.log('[Service Worker] Push Recebido.');
  const title = 'Alerta MDS';
  const options = {
    body: 'Um equipamento está próximo do vencimento. Verifique o painel.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Ouve por eventos de sincronização periódica (suporte limitado do navegador).
self.addEventListener('periodicsync', event => {
    if (event.tag === 'check-expirations') {
        event.waitUntil(checkExpirationsAndNotify());
    }
});

async function checkExpirationsAndNotify() {
    console.log('Verificando vencimentos em segundo plano...');
    // A lógica real para abrir o IndexedDB, ler os dados do equipamento
    // e acionar uma notificação local seria implementada aqui.
}