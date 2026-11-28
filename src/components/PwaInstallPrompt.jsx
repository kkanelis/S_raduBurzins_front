import { useEffect, useState } from "react";
import api from "../services/api";

const DISMISSED_UNTIL_KEY = "pwa-install-dismissed-until";
const DISMISSAL_DAYS = 14;
const PROMPT_DELAY_MS = 2500;
const NOTIFICATION_DISMISSED_KEY = "push-notification-dismissed-until";

const isIosDevice = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

function PwaInstallPrompt({ enabled }) {
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(() => {
    const dismissedUntil = Number(
      window.localStorage.getItem(DISMISSED_UNTIL_KEY) || 0,
    );

    return dismissedUntil > Date.now();
  });
  const [installed, setInstalled] = useState(() => isStandalone());
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationBusy, setNotificationBusy] = useState(false);
  const [notificationError, setNotificationError] = useState("");

  useEffect(() => {
    setIsIos(isIosDevice());

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setVisible(false);
      setInstallPrompt(null);
      window.localStorage.removeItem(DISMISSED_UNTIL_KEY);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (
      !enabled ||
      installed ||
      (!installed && (dismissed || (!isIos && !installPrompt)))
    ) {
      if (!installed) setVisible(false);
      return undefined;
    }

    const showTimer = window.setTimeout(
      () => setVisible(true),
      PROMPT_DELAY_MS,
    );

    return () => window.clearTimeout(showTimer);
  }, [dismissed, enabled, installPrompt, installed, isIos]);

  useEffect(() => {
    if (!enabled || !installed || !("Notification" in window) || !("serviceWorker" in navigator)) {
      setNotificationVisible(false);
      return;
    }
    if (Notification.permission !== "default") {
      setNotificationVisible(false);
      return;
    }
    const dismissedUntil = Number(window.localStorage.getItem(NOTIFICATION_DISMISSED_KEY) || 0);
    if (dismissedUntil > Date.now()) {
      setNotificationVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setNotificationVisible(true), PROMPT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [enabled, installed]);

  const dismissPrompt = () => {
    window.localStorage.setItem(
      DISMISSED_UNTIL_KEY,
      String(Date.now() + DISMISSAL_DAYS * 24 * 60 * 60 * 1000),
    );
    setDismissed(true);
    setVisible(false);
  };

  const installApp = async () => {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    setInstallPrompt(null);

    if (outcome === "accepted") {
      setVisible(false);
    } else {
      dismissPrompt();
    }
  };

  const dismissNotificationPrompt = () => {
    window.localStorage.setItem(NOTIFICATION_DISMISSED_KEY, String(Date.now() + DISMISSAL_DAYS * 24 * 60 * 60 * 1000));
    setNotificationVisible(false);
  };

  const enableNotifications = async () => {
    setNotificationBusy(true);
    setNotificationError("");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setNotificationVisible(false);
        return;
      }
      const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error("VAPID publiskā atslēga nav konfigurēta.");
      const padding = "=".repeat((4 - (publicKey.length % 4)) % 4);
      const base64 = `${publicKey}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
      const rawData = window.atob(base64);
      const applicationServerKey = Uint8Array.from(rawData, (character) => character.charCodeAt(0));
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }
      await api.post("/api/push-subscriptions", subscription.toJSON());
      setNotificationVisible(false);
    } catch (error) {
      setNotificationError(error?.response?.data?.message || error?.message || "Neizdevās ieslēgt paziņojumus.");
    } finally {
      setNotificationBusy(false);
    }
  };

  if (!enabled) return null;

  if (notificationVisible) {
    return (
      <aside
        aria-label="Ieslēgt paziņojumus"
        className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md rounded-2xl border border-[#e0ddcf] bg-white p-4 shadow-[0_16px_48px_rgba(36,23,38,0.22)] sm:bottom-5 sm:p-5"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2d232e] text-xl text-[#f1f0ea]">🔔</span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-extrabold text-dark-purple">Ieslēgt paziņojumus</h2>
            <p className="mt-1 text-sm leading-5 text-muted">Saņem īsus paziņojumus par ģimenes jaunumiem un svarīgiem notikumiem.</p>
          </div>
          <button type="button" onClick={dismissNotificationPrompt} aria-label="Aizvērt paziņojumu piedāvājumu" className="rounded-full px-2 py-1 text-xl leading-none text-muted hover:bg-[#f1f0ea]">&times;</button>
        </div>
        {notificationError && <p role="alert" className="mt-3 text-sm font-bold text-red-700">{notificationError}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={dismissNotificationPrompt} className="btn-ghost px-4 py-2 text-sm">Vēlāk</button>
          <button type="button" onClick={enableNotifications} disabled={notificationBusy} className="btn-primary px-4 py-2 text-sm">{notificationBusy ? 'Ieslēdz...' : 'Ieslēgt'}</button>
        </div>
      </aside>
    );
  }

  if (!visible) return null;

  return (
    <aside
      aria-label="Instalēt Radu Burziņu"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-md rounded-2xl border border-[#ded7e5] bg-white p-4 shadow-[0_16px_48px_rgba(36,23,38,0.22)] sm:bottom-5 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <img
          src="/icons/rb-icon-180.png"
          alt=""
          className="h-12 w-12 shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-extrabold text-dark-purple">
            Instalē Radu Burziņu
          </h2>
          <p className="mt-1 text-sm leading-5 text-muted">
            Pievieno sākuma ekrānam, lai ērti atvērtu kā lietotni.
          </p>
        </div>
        <button
          type="button"
          onClick={dismissPrompt}
          aria-label="Aizvērt instalēšanas piedāvājumu"
          className="rounded-full px-2 py-1 text-xl leading-none text-muted hover:bg-[#f4f0f6]"
        >
          &times;
        </button>
      </div>

      {isIos && showInstructions ? (
        <p className="mt-3 rounded-xl bg-[#f7f3ef] p-3 text-sm leading-5 text-dark-purple">
          Safari apakšējā izvēlnē nospied <strong>Kopīgot</strong>, tad izvēlies{" "}
          <strong>Add to Home Screen</strong> (Pievienot sākuma ekrānam).
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={dismissPrompt}
          className="btn-ghost px-4 py-2 text-sm"
        >
          Vēlāk
        </button>
        {isIos ? (
          <button
            type="button"
            onClick={() => setShowInstructions((current) => !current)}
            aria-expanded={showInstructions}
            className="btn-primary px-4 py-2 text-sm"
          >
            Kā pievienot
          </button>
        ) : installPrompt ? (
          <button
            type="button"
            onClick={installApp}
            className="btn-primary px-4 py-2 text-sm"
          >
            Instalēt
          </button>
        ) : null}
      </div>
    </aside>
  );
}

export default PwaInstallPrompt;
