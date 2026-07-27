/** @doc Single place that decides whether the app service worker may run.
 *  Registration is refused in dev, inside iframes, on Lovable preview hosts
 *  and when `?sw=off` is present. In refused contexts any previously
 *  installed app SW is unregistered so stale caches cannot survive.
 *  The Megsy Push worker (/megsy-push-sw.js) is never touched. */

export function isPwaAllowed(): boolean {
  if (typeof window === "undefined") return false;
  if (!import.meta.env.PROD) return false;
  try {
    if (window.top !== window.self) return false;
  } catch {
    return false;
  }
  const h = window.location.hostname;
  if (
    h.startsWith("id-preview--") ||
    h.startsWith("preview--") ||
    h === "lovableproject.com" ||
    h.endsWith(".lovableproject.com") ||
    h === "lovableproject-dev.com" ||
    h.endsWith(".lovableproject-dev.com") ||
    h === "beta.lovable.dev" ||
    h.endsWith(".beta.lovable.dev")
  )
    return false;
  if (new URLSearchParams(window.location.search).get("sw") === "off") return false;
  return true;
}

export async function unregisterAppSw(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const r of regs) {
      const url = r.active?.scriptURL || r.installing?.scriptURL || r.waiting?.scriptURL || "";
      if (/\/sw\.js(\?|$)/.test(url) || /\/service-worker\.js(\?|$)/.test(url)) {
        try {
          await r.unregister();
        } catch {
          /* ignore */
        }
      }
    }
  } catch {
    /* ignore */
  }
}

/** True when the app is running as an installed PWA (any platform). */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    window.matchMedia?.("(display-mode: fullscreen)").matches === true ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}
