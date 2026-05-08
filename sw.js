// ================================================================
// HUXI App — Service Worker
// Ontvangt push notificaties op de achtergrond (ook als app gesloten is)
// ================================================================

// TODO: Vul hier je Firebase config in (kopieer van Firebase Console → Project Settings → General → Your apps)
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

// Achtergrond notificaties (app is gesloten of op de achtergrond)
messaging.onBackgroundMessage((payload) => {
  console.log('[HUXI SW] Achtergrond notificatie ontvangen:', payload);

  const notificationTitle = payload.notification?.title || 'HUXI 🌱';
  const notificationBody = payload.notification?.body || 'Even een moment voor jezelf nemen?';

  self.registration.showNotification(notificationTitle, {
    body: notificationBody,
    icon: '/huxi-app/icons/icon-192.png',
    badge: '/huxi-app/icons/icon-72.png',
    vibrate: [200, 100, 200],
    tag: 'huxi-reminder',
    renotify: true,
    data: { url: '/huxi-app/' }
  });
});

// Klik op notificatie → open de app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/huxi-app/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/huxi-app/') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
