import { useEffect, useState } from "react";
import api from "../../services/api";

const encodeVapidPublicKey = (key) => {
  if (!/^[A-Za-z0-9_-]+$/.test(key)) {
    throw new Error("VAPID publiskā atslēga nav derīgā Base64URL formātā.");
  }

  const padding = "=".repeat((4 - (key.length % 4)) % 4);
  const base64 = `${key}${padding}`.replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const bytes = Uint8Array.from(rawData, (character) => character.charCodeAt(0));

  if (bytes.length !== 65 || bytes[0] !== 4) {
    throw new Error(
      "VAPID publiskajai atslēgai jābūt derīgai 65 baitu atslēgai no Laravel konfigurācijas.",
    );
  }

  return bytes;
};

function PushNotificationSettings() {
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState("default");
  const [enabled, setEnabled] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const checkSubscription = async () => {
      const browserSupportsPush =
        "Notification" in window &&
        "serviceWorker" in navigator &&
        "PushManager" in window;

      if (!browserSupportsPush) {
        if (isMounted) {
          setSupported(false);
          setChecking(false);
        }
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await api.post("/api/push-subscriptions", subscription.toJSON());
      }

      if (isMounted) {
        setPermission(Notification.permission);
        setEnabled(Boolean(subscription));
        setChecking(false);
      }
    };

    checkSubscription().catch((requestError) => {
      if (isMounted) {
        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            "Neizdevās pārbaudīt vai sinhronizēt paziņojumu ierīci.",
        );
        setChecking(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const enableNotifications = async () => {
    setBusy(true);
    setError("");

    try {
      const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        throw new Error("Frontend konfigurācijā nav norādīta VAPID publiskā atslēga.");
      }

      const nextPermission = await Notification.requestPermission();
      setPermission(nextPermission);

      if (nextPermission !== "granted") {
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      const createdSubscription = !subscription;

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: encodeVapidPublicKey(publicKey),
        });
      }

      try {
        await api.post("/api/push-subscriptions", subscription.toJSON());
      } catch (requestError) {
        if (createdSubscription) {
          await subscription.unsubscribe();
        }
        throw requestError;
      }

      setEnabled(true);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Neizdevās ieslēgt paziņojumus.",
      );
    } finally {
      setBusy(false);
    }
  };

  const disableNotifications = async () => {
    setBusy(true);
    setError("");

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await api.delete("/api/push-subscriptions", {
          data: { endpoint: subscription.endpoint },
        });
        await subscription.unsubscribe();
      }

      setEnabled(false);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.message ||
          "Neizdevās izslēgt paziņojumus.",
      );
    } finally {
      setBusy(false);
    }
  };

  const status = !supported
    ? "Šī pārlūkprogramma neatbalsta push paziņojumus."
    : checking
      ? "Pārbauda paziņojumu statusu..."
      : permission === "denied"
        ? "Paziņojumu atļauja ir liegta pārlūka iestatījumos."
        : enabled
          ? "Paziņojumi šajā ierīcē ir ieslēgti."
          : "Paziņojumi šajā ierīcē ir izslēgti.";

  return (
    <section aria-labelledby="push-settings-title">
      <header className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f1f0ea] text-[#2d232e]">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
          </svg>
        </span>
        <span>
          <h2 id="push-settings-title" className="text-base font-black text-dark-purple">Push paziņojumi</h2>
          <p className="mt-1 text-xs leading-5 text-muted">Pārvaldi, vai šī ierīce drīkst saņemt vietnes paziņojumus.</p>
        </span>
      </header>

      <div className="mt-5 rounded-2xl border border-[#e9e6de] bg-[#faf9f6] p-4">
        <p role="status" className="flex min-h-10 items-center gap-2 text-sm text-muted">
          <span
            aria-hidden="true"
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              enabled ? 'bg-[#4f7f5f]' : permission === 'denied' ? 'bg-[#d1344f]' : 'bg-[#b8afa0]'
            }`}
          />
          {status}
        </p>
        <button
          type="button"
          onClick={enabled ? disableNotifications : enableNotifications}
          disabled={
            checking ||
            busy ||
            !supported ||
            (permission === "denied" && !enabled)
          }
          aria-pressed={enabled}
          className="btn-primary mt-3 min-h-11 w-full rounded-xl px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-70"
        >
          {busy
            ? "Apstrādā..."
            : enabled
              ? "Izslēgt paziņojumus šajā ierīcē"
              : "Ieslēgt paziņojumus šajā ierīcē"}
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </section>
  );
}

export default PushNotificationSettings;
