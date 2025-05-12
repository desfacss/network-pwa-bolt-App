
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'antd/dist/reset.css';
import './index.css';
import { register } from './serviceWorkerRegistration';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

// Register the Service Worker
register({
  onSuccess: () => {
    console.log('[Service Worker] Registration successful');
  },
  onUpdate: registration => {
    console.log('[Service Worker] New content available, please refresh');
    // Optionally prompt the user to refresh the page
  },
});