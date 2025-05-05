// /* eslint-disable no-restricted-globals */
// /* eslint-env serviceworker */

// // This service worker enables offline capabilities and push notifications.
// // Learn more about service workers: https://bit.ly/CRA-PWA

// // Cache name and files to cache
// const CACHE_NAME = 'ibcn-networkx-v2';
// const urlsToCache = [
//   '/',
//   '/index.html',
//   '/img/ibcn-192.png',
//   '/img/ibcn-512.png',
//   '/img/ibcn-180.png',
//   '/app/' // Cache the main app route for basic functionality
// ];

// // Install event: Cache essential files
// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME)
//       .then((cache) => {
//         console.log('[Service Worker] Caching precached resources.');
//         return cache.addAll(urlsToCache);
//       })
//       .catch((error) => console.error('[Service Worker] Install failed:', error))
//   );
// });

// // Fetch event: Serve cached content for performance, fallback to network
// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     caches.match(event.request)
//       .then((response) => {
//         // Return cached response if available
//         if (response) {
//           return response;
//         }
//         // Fetch from network
//         return fetch(event.request).catch(() => {
//           // Minimal offline fallback: return index.html for navigation requests
//           if (event.request.mode === 'navigate') {
//             return caches.match('/index.html');
//           }
//         });
//       })
//   );

//   // Redirect navigation to root to /app/
//   if (event.request.mode === 'navigate' && event.request.url === self.registration.scope) {
//     event.respondWith(Response.redirect('/app/', 302));
//   }
// });

// // Activate event: Clean up old caches
// self.addEventListener('activate', (event) => {
//   const cacheWhitelist = [CACHE_NAME];
//   event.waitUntil(
//     caches.keys()
//       .then((cacheNames) =>
//         Promise.all(
//           cacheNames.map((cacheName) => {
//             if (!cacheWhitelist.includes(cacheName)) {
//               return caches.delete(cacheName);
//             }
//           })
//         )
//       )
//       .catch((error) => console.error('[Service Worker] Activate failed:', error))
//   );
// });

// // Push event: Handle incoming push notifications
// self.addEventListener('push', (event) => {
//   let data;
//   try {
//     data = event.data.json();
//   } catch (error) {
//     console.error('[Service Worker] Invalid push data:', error);
//     data = {};
//   }
//   const title = data.title || 'IBCN NetworkX';
//   const options = {
//     body: data.body || 'New content has been added!',
//     icon: '/img/ibcn-192.png',
//     badge: '/img/ibcn-192.png',
//     data: {
//       url: data.url || '/app/',
//     },
//   };
//   event.waitUntil(self.registration.showNotification(title, options));
// });

// // Notification click event: Open the app or specific URL
// self.addEventListener('notificationclick', (event) => {
//   event.notification.close();
//   const url = event.notification.data.url || '/app/';
//   event.waitUntil(clients.openWindow(url));
// });


/* eslint-disable no-restricted-globals */
/* eslint-env serviceworker */

// This service worker enables offline capabilities and push notifications.
// Learn more about service workers: https://bit.ly/CRA-PWA

// Cache name and files to cache
const CACHE_NAME = 'ibcn-networkx-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/img/ibcn-192.png',
  '/img/ibcn-512.png',
  '/img/ibcn-180.png',
  '/app/'
];

// Install event: Cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching precached resources.');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => console.error('[Service Worker] Install failed:', error))
  );
});

// Fetch event: Serve cached content for performance, fallback to network
self.addEventListener('fetch', (event) => {
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((response) => {
        // Redirect to /app/ for all navigation requests
        return Response.redirect('/app/', 302);
      })
    );
    return;
  }

  // Handle other requests (cache-first)
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if available
        if (response) {
          return response;
        }
        // Fetch from network
        return fetch(event.request).catch(() => {
          // Minimal offline fallback: return index.html for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              return caches.delete(cacheName);
            }
          })
        )
      )
      .catch((error) => console.error('[Service Worker] Activate failed:', error))
  );
});

// Push event: Handle incoming push notifications
self.addEventListener('push', (event) => {
  let data;
  try {
    data = event.data.json();
  } catch (error) {
    console.error('[Service Worker] Invalid push data:', error);
    data = {};
  }
  const title = data.title || 'IBCN NetworkX';
  const options = {
    body: data.body || 'New content has been added!',
    icon: '/img/ibcn-192.png',
    badge: '/img/ibcn-192.png',
    data: {
      url: data.url || '/app/',
    },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event: Open the app or specific URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data.url || '/app/';
  event.waitUntil(clients.openWindow(url));
});