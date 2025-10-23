import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    })
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          console.log('Service Worker update found');
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('New Service Worker installed, reloading...');
                window.location.reload();
              }
            });
          }
        });
      })
      .catch((err) => {
        console.error('ServiceWorker registration failed: ', err);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
