import { useCallback, useEffect, useState } from "react";
import { Download, Share, Plus, X } from "lucide-react";
import { isIos, isStandalone } from "@/lib/pwa/guard";

const DISMISS_KEY = "megsy:a2hs-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * @doc InstallPrompt — automatic Add-to-Home-Screen banner.
 * Chromium: uses the native `beforeinstallprompt` event, so the real browser
 * install dialog opens on tap. iOS Safari: shows the Share -> Add to Home
 * Screen hint (Apple exposes no install API). Hidden when already installed
 * or once dismissed.
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const onInstalled = () => {
      setDeferred(null);
      setShowIosHint(false);
      localStorage.setItem(DISMISS_KEY, "1");
    };
    window.addEventListener("appinstalled", onInstalled);

    // iOS never fires beforeinstallprompt — show the manual hint instead.
    let t: number | undefined;
    if (isIos()) t = window.setTimeout(() => setShowIosHint(true), 4000);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      if (t) window.clearTimeout(t);
    };
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDeferred(null);
    setShowIosHint(false);
  }, []);

  const install = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    try {
      await deferred.userChoice;
    } catch {
      /* ignore */
    }
    setDeferred(null);
  }, [deferred]);

  if (!deferred && !showIosHint) return null;

  return (
    <div
      className="fixed inset-x-3 z-[60] rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-lg p-3 flex items-center gap-3 animate-fade-in"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
      role="dialog"
      aria-label="Install Megsy"
    >
      <img src="/pwa-192x192.png" alt="" className="h-10 w-10 rounded-xl shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">Install Megsy</p>
        <p className="text-xs text-muted-foreground truncate">
          {deferred ? (
            "Faster launch, full screen, works offline."
          ) : (
            <span className="inline-flex items-center gap-1">
              Tap <Share className="h-3 w-3" /> then <Plus className="h-3 w-3" /> Add to Home Screen
            </span>
          )}
        </p>
      </div>
      {deferred && (
        <button
          type="button"
          onClick={install}
          className="h-9 px-3 inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground text-sm font-medium active:scale-95 transition-transform"
        >
          <Download className="h-4 w-4" />
          Install
        </button>
      )}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="h-9 w-9 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
