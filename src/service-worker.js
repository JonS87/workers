const FETCH_PRIORITY_URLS = [
  '/',
  '/index.html',
  // '/css/style.css',
];

const cacheName = 'my-best-cache';

const cacheFile = async (url) => {
  const response = await fetch(url);

  if (response.ok) {
    const cache = await caches.open(cacheName);

    await cache.put(url, response.clone());
    console.log(`Файл ${url} успешно закеширован.`);
  } else {
    console.error(`Файл ${url} недоступен: ${response.status}`);
  }
};

self.addEventListener('install', (event) => {
  console.log('Установлен');

  event.waitUntil(
    Promise.all([
      cacheFile('./'),
      cacheFile('./index.html'),
      cacheFile('./index.js'),
      cacheFile('./src/svg/name1.jpg'),
      cacheFile('./css/style.css'),
      cacheFile('./js/app.js'),
    ])
      .then(() => {
        console.log('Service Worker: Кеширование файлов завершено');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Ошибка кеширования:', error);
      }),
  );
});

const controllerChange = async () => {
  await self.clients.claim();

  const clients = await self.clients.matchAll();

  clients.forEach((client) => client.navigate(client.url));
};

self.addEventListener('activate', (event) => {
  console.log('Активирован', event);

  event.waitUntil(controllerChange());
});

const cachePriorityThenFetch = async (event) => {
  const cacheResponse = await caches.match(event.request);

  if (cacheResponse) {
    return cacheResponse;
  }

  let response;

  try {
    response = await fetch(event.request);
  } catch {
    return;
  }

  const cache = await caches.open(cacheName);
  cache.put(event.request, response.clone());

  return response;
};

const fetchPriorityThenCache = async (event) => {
  let response;

  try {
    response = await fetch(event.request);
  } catch {
    const cacheResponse = await caches.match(event.request);

    if (cacheResponse) {
      return cacheResponse;
    }

    return new Response('Нет соединения', { status: 503 });
  }

  const cache = await caches.open(cacheName);
  cache.put(event.request, response.clone());

  return response;
};

const fetchPriorityThenCacheThenImageFallback = async (event) => {
  let response;

  try {
    response = await fetch(event.request);
  } catch {
    const cacheResponse = await caches.match(event.request);

    if (cacheResponse) {
      return cacheResponse;
    }

    return await caches.match('./src/svg/name1.jpg');
  }

  const cache = await caches.open(cacheName);
  cache.put(event.request, response.clone());

  return response;
};

self.addEventListener('fetch', (event) => {
  console.log('Происходит запрос на сервер', event);

  const url = new URL(event.request.url);

  if (FETCH_PRIORITY_URLS.includes(url.pathname)) {
    event.respondWith(fetchPriorityThenCache(event));

    return;
  }

  if (url.pathname.startsWith('/src/svg')) {
    event.respondWith(fetchPriorityThenCacheThenImageFallback(event));

    return;
  }

  event.respondWith(cachePriorityThenFetch(event));
});
