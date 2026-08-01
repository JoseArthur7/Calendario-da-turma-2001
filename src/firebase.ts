import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCXiZajoc67Ke_ggkD3oSxrJLO4e_ND3zY",
  authDomain: "calendario-2001.firebaseapp.com",
  projectId: "calendario-2001",
  storageBucket: "calendario-2001.firebasestorage.app",
  messagingSenderId: "414569008948",
  appId: "1:414569008948:web:03b9438368bb48c3aedf61",
};

const VAPID_KEY = "BDxKD_FQFeqehSzvci-0GriTgGz1m-5pL5tpF7kMhcEI6vlINQ9XHLBQNN0iW_fnBWpeYT6Hkp9e_4TZUIah5xM";
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxBA4E6n8zBKGxJRIfwzwx8baUPRndUOyFdK5gWZn4a-cCoBQC266klEiMVS0kxXwm6/exec";

const app = initializeApp(firebaseConfig);

export async function requestNotificationPermission(): Promise<string | null> {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const messaging = getMessaging(app);
    const swReg = await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (!token) return null;

    // Avoid re-registering the same token
    const saved = localStorage.getItem("fcm_token");
    if (saved === token) return token;

    // Send token to Apps Script so it can be stored in the sheet
    await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ token }),
      headers: { "Content-Type": "application/json" },
      mode: "no-cors", // Apps Script requires no-cors
    });

    localStorage.setItem("fcm_token", token);
    return token;
  } catch (err) {
    console.error("Erro ao registrar notificações:", err);
    return null;
  }
}

export function setupForegroundNotifications() {
  try {
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      const { title, body } = payload.notification ?? {};
      if (title && Notification.permission === "granted") {
        new Notification(title, {
          body: body ?? "",
          icon: "/icon-192.png",
        });
      }
    });
  } catch (e) {
    // Not supported in this browser
  }
}
