self.addEventListener('install', (event) => {
  console.log('Установлен');

  event.waitUntil(
    caches
      .open('my-best-cache')
      .then((cache) => {
        console.log('Service Worker: Кешируем файлы');

        return cache.addAll([
          '/',
          '/index.html',
          '/js/app.js',
          '/css/style.css',
        ]);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('Ошибка кеширования:', error);
      }),
  );
});

self.addEventListener('activate', (event) => {
  console.log('Активирован', event);
});

self.addEventListener('fetch', (event) => {
  console.log('Происходит запрос на сервер', event);

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});
