// Basic PWA cache & background sync for local checks
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('bpv-cache-v2').then(cache => cache.addAll([
      '/', '/index.html', '/src/styles.css', '/src/main.tsx', '/src/App.tsx',
      '/manifest.webmanifest'
    ]))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((resp) => resp || fetch(event.request))
  );
});

// Local check when browser allows (not guaranteed on iOS)
async function checkLocalSignals() {
  try {
    const recsResp = await fetch('/data/recs.json', { cache: 'no-store' });
    if (!recsResp.ok) return;
    const recs = await recsResp.json();

    const allClients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
    if (!allClients.length) return;
    const client = allClients[0];
    const holdings = await new Promise((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = (e) => resolve(e.data || []);
      client.postMessage({ type: 'GET_HOLDINGS' }, [channel.port2]);
    });

    const symbols = new Set((holdings || []).map(h => h.symbol));
    const negatives = (recs.recs || []).filter(r => symbols.has(r.symbol) && r.acao === 'vender');

    for (const n of negatives) {
      self.registration.showNotification('BPV Trader: Alerta de venda', {
        body: `${n.symbol}: condições deterioraram (score ${n.score}).`,
        tag: `sell-${n.symbol}`,
        icon: '/icons/icon-192.png',
        data: { symbol: n.symbol }
      });
    }
  } catch (e) { /* noop */ }
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'bpv-sync') event.waitUntil(checkLocalSignals());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow('/#holdings'));
});
