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

      if (isMounted) {
        setPermission(Notification.permission);
        setEnabled(Boolean(subscription));
        setChecking(false);
      }
    };

    checkSubscription().catch(() => {
      if (isMounted) {
        setError("Neizdevās pārbaudīt paziņojumu iestatījumus.");
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
    <section className="border-t border-[#e9ebe5] pt-6">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="shrink-0 text-sm font-extrabold text-dark-purple">
          Push paziņojumi
        </h2>
        <span aria-hidden="true" className="h-px flex-1 bg-[#e9ebe5]" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p role="status" className="text-sm text-muted">
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
          className="btn-primary w-full rounded-lg px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {busy
            ? "Apstrādā..."
            : enabled
              ? "Izslēgt paziņojumus"
              : "Ieslēgt paziņojumus"}
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </section>
  );
}

export default PushNotificationSettings;
