const FETCH_PRIORITY_URLS = ['/', '/index.html', '/css/style.css', '/index.js'];

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
      caches.delete(cacheName),

      cacheFile('/'),
      cacheFile('/index.html'),
      cacheFile('/index.js'),
      cacheFile('/image/bad-picture.jpg'),
      cacheFile('/css/style.css'),
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

  const clients = await self.clients.matchAll(); // Что делает?

  clients.forEach((client) => client.navigate(client.url)); // Что делает?
};

self.addEventListener('activate', (event) => {
  // console.log('Активирован', event);

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

const cachePriorityThenFetchImage = async (event) => {
  const cacheResponse = await caches.match(event.request);

  if (cacheResponse) {
    return cacheResponse;
  }

  let response;
  try {
    response = await fetch(event.request);

    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(event.request, response.clone());

      return response;
    } else {
      return await caches.match('/image/bad-picture.jpg');
    }
  } catch {
    const res = await caches.match('/image/bad-picture.jpg');
    console.log(res);
    return res;
  }
};

self.addEventListener('fetch', (event) => {
  console.log('Происходит запрос на сервер');
  console.dir(event);

  const url = new URL(event.request.url);
  const destination = event.request.destination;

  if (
    FETCH_PRIORITY_URLS.includes(url.pathname) ||
    url.pathname.startsWith('/api/news')
  ) {
    event.respondWith(fetchPriorityThenCache(event));

    return;
  }

  if (
    destination === 'image' ||
    url.pathname.endsWith('jpg') ||
    url.host.includes('avatar')
  ) {
    event.respondWith(cachePriorityThenFetchImage(event));

    return;
  }

  event.respondWith(cachePriorityThenFetch(event));
});
