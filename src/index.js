import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'antd/dist/reset.css';
import './index.css';
import * as serviceWorker from './serviceWorker';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);

// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('/service-worker.js')
//     .then(registration => {
//       console.log('Service worker registered:', registration.scope);
//     })
//     .catch(error => {
//       console.error('Service worker registration failed:', error);
//     });
// } else {
//   console.log('Service workers not supported');
// }

serviceWorker.unregister();