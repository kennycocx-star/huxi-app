// ================================================================
// HUXI App — Service Worker
// Ontvangt push notificaties op de achtergrond (ook als app gesloten is)
// ================================================================

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDESfbeHRWA-xv0MEc_TiCgM2-Rt_ujlNA",
  authDomain: "huxi-app-a1876.firebaseapp.com",
  databaseURL: "https://huxi-app-a1876-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "huxi-app-a1876",
  storageBucket: "huxi-app-a1876.firebasestorage.app",
  messagingSenderId: "699548699062",
  appId: "1:699548699062:web:0f0b16510671d0b0e01917"
});

const messaging = firebase.messaging();

// Achtergrond notificaties — data-only payload, wij tonen zelf de notificatie
messaging.onBackgroundMessage((payload) => {
  // Lees bericht uit data-veld (Cloud Function stuurt data.message)
  const title = payload.data?.title || payload.notification?.title || 'HUXI 🌱';
  const body = payload.data?.message || payload.notification?.body || 'Even een moment voor jezelf 🌿';

  self.registration.showNotification(title, {
    body: body,
    icon: '/huxi-app/icons/icon-192.png',
    badge: '/huxi-app/icons/icon-72.png',
    vibrate: [200, 100, 200],
    tag: 'huxi-reminder',
    renotify: true,
    data: { url: '/huxi-app/', message: body }  // message meegeven voor de app
  });
});

// Klik op notificatie → open de app + toon het moment
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const msg = event.notification.data?.message || '';
  const baseUrl = '/huxi-app/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/huxi-app/') && 'focus' in client) {
          // App was al open op achtergrond — stuur message
          if (msg) client.postMessage({ type: 'huxi-moment', message: msg });
          return client.focus();
        }
      }
      // App was gesloten — open met moment in URL
      const targetUrl = msg ? baseUrl + '?moment=' + encodeURIComponent(msg) : baseUrl;
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
