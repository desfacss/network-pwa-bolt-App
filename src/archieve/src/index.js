import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'antd/dist/reset.css';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

// Service Worker Registration
const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  } else {
    console.log('Service workers not supported');
  }
};

// Unregister Service Worker (for debugging or cleanup)
const unregisterServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
        console.log('Service Worker unregistered:', registration);
      }
    });
  }
};

// Register service worker in production, optional in development
if (process.env.NODE_ENV === 'production') {
  registerServiceWorker();
} else {
  // Optionally register in development for testing
  registerServiceWorker();
  // Uncomment to unregister during development for debugging
  // unregisterServiceWorker();
}