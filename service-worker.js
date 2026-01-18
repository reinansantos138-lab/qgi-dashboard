const CACHE_NAME = 'qgi-lab-v5-firebase-sync'; // Mudei a versão para forçar atualização
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/react@18/umd/react.development.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com',
  'https://cdn-icons-png.flaticon.com/512/2906/2906274.png'
];

// Instalação: Cacheamento inicial
self.addEventListener('install', (event) => {
  // Força o SW a ativar imediatamente, não espera o usuário fechar a aba
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Abrindo cache:', CACHE_NAME);
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Interceptação de rede (Cache First, Network Fallback)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retorna do cache se existir, senão busca na rede
      return response || fetch(event.request).catch(() => {
        // Se falhar (offline total) e não estiver no cache, não faz nada (ou mostra pág offline)
        // Para arquivos do Firestore, o próprio SDK lida com offline
      });
    })
  );
});

// Ativação: Limpeza de caches antigos
self.addEventListener('activate', (event) => {
  // Garante que o SW controle a página imediatamente
  event.waitUntil(clients.claim());

  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('Removendo cache antigo:', key);
          return caches.delete(key);
        }
      }));
    })
  );
});