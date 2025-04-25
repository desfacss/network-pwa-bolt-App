/* eslint-disable no-restricted-globals */
/* eslint-env serviceworker */

// This service worker enables offline capabilities and push notifications.
// Learn more about service workers: https://bit.ly/CRA-PWA

// Cache name and files to cache
const CACHE_NAME = 'ibcn-networkx-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/img/ibcn-192.png',
  '/img/ibcn-512.png',
  '/img/ibcn-180.png',
];

// Install event: Cache essential files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event: Serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Push event: Handle incoming push notifications
self.addEventListener('push', event => {
  const data = event.data.json();
  const title = data.title || 'IBCN NetworkX';
  const options = {
    body: data.body || 'New content has been added!',
    icon: '/img/ibcn-192.png',
    badge: '/img/ibcn-192.png',
    data: {
      url: data.url || '/', // URL to open when notification is clicked
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event: Open the app or specific URL
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});