import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCXiZajoc67Ke_ggkD3oSxrJLO4e_ND3zY",
  authDomain: "calendario-2001.firebaseapp.com",
  projectId: "calendario-2001",
  storageBucket: "calendario-2001.firebasestorage.app",
  messagingSenderId: "414569008948",
  appId: "1:414569008948:web:03b9438368bb48c3aedf61",
  measurementId: "G-TEYEVV7CWL",
};

const VAPID_KEY = "BDxKD_FQFeqehSzvci-0GriTgGz1m-5pL5tpF7kMhcEI6vlINQ9XHLBQNN0iW_fnBWpeYT6Hkp9e_4TZUIah5xM";

const app = initializeApp(firebaseConfig);

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.ready,
    });

    // Save token to localStorage so the Apps Script can collect it
    const tokens: string[] = JSON.parse(localStorage.getItem("fcm_tokens") ?? "[]");
    if (!tokens.includes(token)) {
      tokens.push(token);
      localStorage.setItem("fcm_tokens", JSON.stringify(tokens));
    }

    // Also save to a shared location via the sheet URL pattern
    // We store the token in a Firestore-like way using the sheet
    await saveTokenToSheet(token);

    return token;
  } catch (err) {
    console.error("Erro ao registrar notificações:", err);
    return null;
  }
}

async function saveTokenToSheet(token: string) {
  // We post the token to a Google Apps Script web app that saves it
  const SCRIPT_URL = ""; // Will be filled after Apps Script is deployed
  if (!SCRIPT_URL) return;
  try {
    await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ token }),
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    // Silently fail — token already saved locally
  }
}

export function setupForegroundNotifications() {
  try {
    const messaging = getMessaging(app);
    onMessage(messaging, (payload) => {
      const { title, body } = payload.notification ?? {};
      if (title) {
        new Notification(title, { body: body ?? "", icon: "/icon-192.png" });
      }
    });
  } catch (e) {
    // Not supported in this browser
  }
}
