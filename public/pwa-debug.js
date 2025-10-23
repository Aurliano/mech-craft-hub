// PWA Debug Script
// این اسکریپت برای دیباگ کردن مشکلات PWA استفاده می‌شود

console.log('🔍 PWA Debug Script Started');

// بررسی Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('📱 Service Worker Registrations:', registrations.length);
    registrations.forEach((registration, index) => {
      console.log(`SW ${index + 1}:`, {
        scope: registration.scope,
        state: registration.active?.state,
        scriptURL: registration.active?.scriptURL
      });
    });
  });
} else {
  console.log('❌ Service Worker not supported');
}

// بررسی Manifest
fetch('/manifest.json')
  .then(response => {
    console.log('📄 Manifest Response:', response.status, response.statusText);
    return response.json();
  })
  .then(manifest => {
    console.log('📄 Manifest Content:', manifest);
  })
  .catch(error => {
    console.error('❌ Manifest Error:', error);
  });

// بررسی Browser Info
const userAgent = navigator.userAgent;
const browserInfo = {
  isIOS: /iPad|iPhone|iPod/.test(userAgent),
  isAndroid: /Android/.test(userAgent),
  isChrome: /Chrome/.test(userAgent) && !/Edge/.test(userAgent),
  isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
  isFirefox: /Firefox/.test(userAgent),
  isEdge: /Edge/.test(userAgent),
  isDesktop: !(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent))
};

console.log('🌐 Browser Info:', browserInfo);

// بررسی Display Mode
const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
console.log('📱 Standalone Mode:', isStandalone);

// بررسی localStorage
const pwaInstalled = localStorage.getItem('saydatech-pwa-installed');
const guideSeen = localStorage.getItem('saydatech-pwa-guide-seen');
console.log('💾 LocalStorage:', {
  pwaInstalled,
  guideSeen
});

// بررسی beforeinstallprompt
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('🎯 beforeinstallprompt event fired');
  deferredPrompt = e;
});

// بررسی appinstalled
window.addEventListener('appinstalled', (e) => {
  console.log('✅ PWA installed successfully');
});

// بررسی display-mode changes
window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
  console.log('📱 Display mode changed:', e.matches);
});

// بررسی Service Worker messages
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    console.log('📨 SW Message:', event.data);
  });
}

// بررسی Cache API
if ('caches' in window) {
  caches.keys().then(cacheNames => {
    console.log('🗄️ Cache Names:', cacheNames);
  });
} else {
  console.log('❌ Cache API not supported');
}

// بررسی Notification API
if ('Notification' in window) {
  console.log('🔔 Notification Permission:', Notification.permission);
} else {
  console.log('❌ Notification API not supported');
}

// بررسی Push API
if ('PushManager' in window) {
  console.log('📤 Push API supported');
} else {
  console.log('❌ Push API not supported');
}

console.log('🔍 PWA Debug Script Completed');
