// MIME Type Test Script
console.log('=== MIME Type Test Script ===');

// Test Service Worker MIME type
fetch('/service-worker.js', { method: 'HEAD' })
  .then(response => {
    console.log('Service Worker MIME Type:', response.headers.get('content-type'));
    console.log('Service Worker Status:', response.status);
    console.log('Service Worker Headers:', [...response.headers.entries()]);
  })
  .catch(error => {
    console.error('Service Worker fetch error:', error);
  });

// Test Manifest MIME type
fetch('/manifest.json', { method: 'HEAD' })
  .then(response => {
    console.log('Manifest MIME Type:', response.headers.get('content-type'));
    console.log('Manifest Status:', response.status);
    console.log('Manifest Headers:', [...response.headers.entries()]);
  })
  .catch(error => {
    console.error('Manifest fetch error:', error);
  });

// Test regular JS file MIME type
fetch('/src/main.tsx', { method: 'HEAD' })
  .then(response => {
    console.log('Main TSX MIME Type:', response.headers.get('content-type'));
    console.log('Main TSX Status:', response.status);
  })
  .catch(error => {
    console.error('Main TSX fetch error:', error);
  });

// Test if Service Worker is supported
if ('serviceWorker' in navigator) {
  console.log('Service Worker is supported');
  
  // Try to register service worker
  navigator.serviceWorker.register('/service-worker.js')
    .then((registration) => {
      console.log('Service Worker registered successfully:', registration);
      
      // Check if service worker is active
      if (registration.active) {
        console.log('Service Worker is active:', registration.active);
      }
      
      // Check if service worker is installing
      if (registration.installing) {
        console.log('Service Worker is installing:', registration.installing);
      }
      
      // Check if service worker is waiting
      if (registration.waiting) {
        console.log('Service Worker is waiting:', registration.waiting);
      }
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    });
} else {
  console.log('Service Worker is not supported');
}

// Test manifest loading
fetch('/manifest.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(manifest => {
    console.log('Manifest loaded successfully:', manifest);
  })
  .catch(e => {
    console.error('Error loading manifest:', e);
  });

console.log('=== MIME Type Test Complete ===');
