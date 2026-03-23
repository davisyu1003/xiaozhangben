// Service Worker for 小鱼儿账本 PWA
const CACHE_NAME = 'xiaoyu-ledger-v1';
const STATIC_ASSETS = [
  '/xiaozhangben/',
  '/xiaozhangben/index.html',
  '/xiaozhangben/manifest.json'
];

// CDN 资源（使用 stale-while-revalidate 策略）
const CDN_RESOURCES = [
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.2/babel.min.js'
];

// 安装时缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).catch((err) => {
      console.log('Cache install failed:', err);
    })
  );
  self.skipWaiting();
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 网络优先策略（适用于 API 请求）
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// 缓存优先策略（适用于静态资源）
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // 返回离线页面或错误
    return new Response('Offline', { status: 503 });
  }
}

// 拦截 fetch 请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 请求使用网络优先
  if (url.hostname.includes('jsonbin.io') || url.hostname.includes('openrouter.ai')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // CDN 资源使用缓存优先
  if (CDN_RESOURCES.some((cdn) => url.href.includes(cdn))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // 其他请求使用缓存优先
  event.respondWith(cacheFirst(request));
});
