self.skipWaiting();

self.addEventListener('install', (event) => {
  console.log('Установлен');

  event.waitUntil(
    caches.open('my-best-cache').then((cache) => {
      cache.addAll(['../', './index.html', './css/style.css']);
    }),
  );
});

self.addEventListener('activate', (event) => {
  console.log('Активирован', event);
});

self.addEventListener('fetch', (event) => {
  console.log('Происходит запрос на сервер', event);
});
