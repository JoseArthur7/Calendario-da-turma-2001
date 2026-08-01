export async function registerSW(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
    await navigator.serviceWorker.ready;
  } catch (err) {
    console.error("Erro ao registrar Service Worker:", err);
  }
}
