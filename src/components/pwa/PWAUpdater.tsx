import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";
import { isPwaAllowed, unregisterAppSw } from "@/lib/pwa/guard";

/**
 * @doc PWAUpdater — the official vite-plugin-pwa React registration hook.
 * Handles service-worker registration, periodic update checks and a single
 * "new version" toast with a Reload action. No manual registration code.
 */
function Updater() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      // Automatic hourly update check while the app stays open.
      setInterval(
        () => {
          void registration.update();
        },
        60 * 60 * 1000,
      );
    },
  });

  useEffect(() => {
    if (!needRefresh) return;
    toast("A new version of Megsy is available", {
      duration: Infinity,
      action: {
        label: "Reload",
        onClick: () => {
          setNeedRefresh(false);
          void updateServiceWorker(true);
        },
      },
      onDismiss: () => setNeedRefresh(false),
    });
  }, [needRefresh, setNeedRefresh, updateServiceWorker]);

  return null;
}

export default function PWAUpdater() {
  const allowed = isPwaAllowed();

  useEffect(() => {
    if (!allowed) void unregisterAppSw();
  }, [allowed]);

  if (!allowed) return null;
  return <Updater />;
}
