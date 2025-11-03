const CACHE_NAME = 'inspecpro-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
];

// Instala o service worker e pré-carrega os recursos essenciais.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Intercepta as solicitações de rede para servir arquivos do cache primeiro.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna a resposta do cache se encontrada.
        if (response) {
          return response;
        }
        // Caso contrário, busca na rede.
        return fetch(event.request);
      }
    )
  );
});

// Limpa caches antigos quando o service worker é ativado.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Ouve por eventos de push para exibir notificações.
self.addEventListener('push', event => {
  console.log('[Service Worker] Push Recebido.');
  const title = 'Alerta InspecPro';
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
