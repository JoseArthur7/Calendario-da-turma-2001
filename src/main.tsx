import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App";
import { registerSW } from "./registerSW";
import { requestNotificationPermission, setupForegroundNotifications } from "./firebase";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex}>
    <App />
  </ConvexAuthProvider>,
);

// Register PWA service worker
registerSW().then(() => {
  // After SW is ready, ask for notification permission
  requestNotificationPermission().then((token) => {
    if (token) {
      console.log("Notificações ativadas!");
      setupForegroundNotifications();
    }
  });
});
