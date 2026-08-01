export async function registerSW() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    console.log("Service Worker registrado:", reg.scope);
  } catch (err) {
    console.error("Erro ao registrar Service Worker:", err);
  }
}
