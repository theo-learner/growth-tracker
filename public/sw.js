// Service Worker for Growth Tracker PWA
const CACHE_NAME = 'growth-tracker-v3';
const urlsToCache = [
  '/',
  '/manifest.json',
];

// 설치 시 핵심 자산 사전 캐시
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// 활성화 시 이전 버전 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// 요청 처리
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // HTTP(S) 요청만 처리 (chrome-extension 등 제외)
  if (!request.url.startsWith('http')) return;

  // API 요청은 캐시하지 않음 (항상 네트워크)
  if (request.url.includes('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // GET 요청만 캐시
  if (request.method !== 'GET') return;

  // 정적 자산: 캐시 우선 전략 (빠른 로딩)
  const isStaticAsset =
    request.url.includes('/_next/static/') ||
    request.url.includes('/icons/') ||
    request.destination === 'font';

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then(
        (cached) => cached || fetchAndCache(request)
      )
    );
    return;
  }

  // 페이지 내비게이션: 네트워크 우선, 실패 시 캐시
  event.respondWith(
    fetchAndCache(request).catch(() => caches.match(request))
  );
});

async function fetchAndCache(request) {
  const response = await fetch(request);
  if (response.status === 200) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

// 푸시 알림 수신
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || '🌱 성장 트래커';
  const options = {
    body: data.body || '아이의 기록을 남겨보세요!',
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    tag: 'growth-tracker-reminder',
    renotify: true,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// 알림 클릭 시 앱 포커스 또는 열기
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        const existing = windowClients.find((c) => c.url.includes('/'));
        if (existing) return existing.focus();
        return clients.openWindow('/');
      })
  );
});
