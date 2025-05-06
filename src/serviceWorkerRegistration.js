// src/serviceWorkerRegistration.js
const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
  );
  
  function register(config) {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      const publicUrl = new URL('/', window.location.href);
      if (publicUrl.origin !== window.location.origin) {
        console.log('[Service Worker] Public URL origin mismatch, skipping registration');
        return;
      }
  
      window.addEventListener('load', () => {
        const swUrl = `/service-worker.js`;
        console.log('[Service Worker] Attempting to register service worker at:', swUrl);
  
        if (isLocalhost) {
          console.log('[Service Worker] Running on localhost, checking service worker');
          checkValidServiceWorker(swUrl, config);
          navigator.serviceWorker.ready.then(registration => {
            console.log('[Service Worker] Service worker ready on localhost:', registration.scope);
          }).catch(error => {
            console.error('[Service Worker] Error checking ready state on localhost:', error);
          });
        } else {
          console.log('[Service Worker] Not localhost, registering service worker');
          registerValidSW(swUrl, config);
        }
      });
    } else {
      console.log('[Service Worker] Skipped registration: not in production or serviceWorker not supported');
    }
  }
  
  function registerValidSW(swUrl, config) {
    console.log('[Service Worker] Registering service worker at:', swUrl);
    navigator.serviceWorker
      .register(swUrl)
      .then(registration => {
        console.log('[Service Worker] Service worker registered successfully:', registration.scope);
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker == null) {
            console.log('[Service Worker] No installing worker found');
            return;
          }
          installingWorker.onstatechange = () => {
            console.log('[Service Worker] Installing worker state:', installingWorker.state);
            if (installingWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('[Service Worker] New content available, please refresh');
                if (config && config.onUpdate) {
                  config.onUpdate(registration);
                }
              } else {
                console.log('[Service Worker] Content cached for offline use');
                if (config && config.onSuccess) {
                  config.onSuccess(registration);
                }
              }
            }
          };
        };
      })
      .catch(error => {
        console.error('[Service Worker] Registration failed:', error);
      });
  }
  
  function checkValidServiceWorker(swUrl, config) {
    console.log('[Service Worker] Checking if service worker exists at:', swUrl);
    fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
      .then(response => {
        const contentType = response.headers.get('content-type');
        console.log('[Service Worker] Fetch response:', response.status, contentType);
        if (
          response.status === 404 ||
          (contentType != null && contentType.indexOf('javascript') === -1)
        ) {
          console.log('[Service Worker] Service worker not found or invalid, unregistering');
          navigator.serviceWorker.ready.then(registration => {
            registration.unregister().then(() => {
              console.log('[Service Worker] Unregistered, reloading page');
              window.location.reload();
            });
          });
        } else {
          console.log('[Service Worker] Service worker valid, proceeding with registration');
          registerValidSW(swUrl, config);
        }
      })
      .catch(error => {
        console.error('[Service Worker] Fetch error, possibly offline:', error);
        console.log('[Service Worker] Running in offline mode');
      });
  }
  
  function unregister() {
    if ('serviceWorker' in navigator) {
      return navigator.serviceWorker.ready
        .then(registration => {
          return registration.unregister().then(() => {
            console.log('[Service Worker] Unregistered successfully');
          });
        })
        .catch(error => {
          console.error('[Service Worker] Error during unregistration:', error);
          throw error;
        });
    }
    console.log('[Service Worker] Service worker not supported, skipping unregistration');
    return Promise.resolve();
  }
  
  export { register, unregister };