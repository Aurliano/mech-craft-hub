// PWA Test Script
console.log('PWA Test Script Loaded');

// Check if service worker is supported
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
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        console.log('Service Worker update found');
      });
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
} else {
  console.log('Service Worker is not supported');
}

// Check manifest
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

// Check display mode
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('PWA is running in standalone mode');
} else {
  console.log('PWA is NOT running in standalone mode');
}

// Listen for beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('beforeinstallprompt event fired:', e);
  e.preventDefault();
  // Store the event for later use
  window.deferredPrompt = e;
});

// Listen for appinstalled event
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed!');
});

// Check if PWA is installable
function checkPWAInstallability() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const hasDeferredPrompt = window.deferredPrompt !== undefined;
  
  console.log('PWA Installability Check:');
  console.log('- Is Standalone:', isStandalone);
  console.log('- Has Deferred Prompt:', hasDeferredPrompt);
  console.log('- Can Install:', hasDeferredPrompt && !isStandalone);
  
  return hasDeferredPrompt && !isStandalone;
}

// Run check after 2 seconds
setTimeout(checkPWAInstallability, 2000);
