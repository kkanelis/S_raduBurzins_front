import { useEffect, useState } from "react";

const DISMISSED_UNTIL_KEY = "pwa-install-dismissed-until";
const DISMISSAL_DAYS = 14;
const PROMPT_DELAY_MS = 2500;

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
      dismissed ||
      (!isIos && !installPrompt)
    ) {
      setVisible(false);
      return undefined;
    }

    const showTimer = window.setTimeout(
      () => setVisible(true),
      PROMPT_DELAY_MS,
    );

    return () => window.clearTimeout(showTimer);
  }, [dismissed, enabled, installPrompt, installed, isIos]);

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

  if (!enabled || !visible) {
    return null;
  }

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
