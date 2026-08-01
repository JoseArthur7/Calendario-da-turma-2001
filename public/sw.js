importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCXiZajoc67Ke_ggkD3oSxrJLO4e_ND3zY",
  authDomain: "calendario-2001.firebaseapp.com",
  projectId: "calendario-2001",
  storageBucket: "calendario-2001.firebasestorage.app",
  messagingSenderId: "414569008948",
  appId: "1:414569008948:web:03b9438368bb48c3aedf61",
});

const messaging = firebase.messaging();

const CACHE_NAME = "calendario-2001-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((res) => res)
      .catch(() => caches.match(event.request))
  );
});

// Background push notifications via Firebase
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Calendário 2001";
  const body = payload.notification?.body || "Novo trabalho adicionado!";
  self.registration.showNotification(title, {
    body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    vibrate: [200, 100, 200],
    data: { url: "/" },
  });
});

// Click notification — open the site
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("/");
    })
  );
});
