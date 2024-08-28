import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

self.skipWaiting();
self.clientsClaim();

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('my-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/main.bundle.js',
        '/styles.css',
      ]);
    }),

    self.precacheAndRoute(self.__WB_MANIFEST),
  );
});

registerRoute(
  ({ request }) =>
    request.destination === 'document' || request.destination === 'script',
  new NetworkFirst({
    cacheName: 'api-cache',
  }),
);
