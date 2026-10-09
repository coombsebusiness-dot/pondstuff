"use client";

import { useEffect, useState } from "react";
import styles from "./CookieConsent.module.css";

type Consent = "accepted" | "rejected";

const STORAGE_KEY = "pondstuff-analytics-consent";
const SETTINGS_EVENT = "pondstuff:cookie-settings";
const GA_ID = "G-YS3R5KGXCC";

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

function loadAnalytics() {
  Object.assign(window, {
    [`ga-disable-${GA_ID}`]: false,
  });

  if (document.getElementById("pondstuff-ga-script")) {
    return;
  }

  const analyticsWindow = window as AnalyticsWindow;

  analyticsWindow.dataLayer ??= [];

  analyticsWindow.gtag = function () {
    analyticsWindow.dataLayer?.push(arguments);
  };

  analyticsWindow.gtag("js", new Date());
  analyticsWindow.gtag("config", GA_ID);

  const script = document.createElement("script");
  script.id = "pondstuff-ga-script";
  script.async = true;
  script.src =
    `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;

  document.head.appendChild(script);
}

function disableAnalytics() {
  Object.assign(window, {
    [`ga-disable-${GA_ID}`]: true,
  });

  const hostname = window.location.hostname;
  const domains = new Set([
    "",
    hostname,
    `.${hostname}`,
    ".pondstuff.co.uk",
  ]);

  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();

    if (!name || !/^_ga(?:_|$)/.test(name)) {
      continue;
    }

    for (const domain of domains) {
      document.cookie =
        `${name}=; Max-Age=0; Path=/; SameSite=Lax` +
        (domain ? `; Domain=${domain}` : "");
    }
  }
}

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      className={styles.footerButton}
      onClick={() => {
        window.dispatchEvent(new Event(SETTINGS_EVENT));
      }}
    >
      Cookie settings
    </button>
  );
}

export default function CookieConsent() {
  const [choice, setChoice] = useState<Consent | null>(
    null,
  );
  const [ready, setReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);

      if (saved === "accepted" || saved === "rejected") {
        setChoice(saved);
      }
    } catch {
      // If storage is unavailable, ask on the next visit.
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && choice === "accepted") {
      loadAnalytics();
    }
  }, [ready, choice]);

  useEffect(() => {
    const openSettings = () => setSettingsOpen(true);

    window.addEventListener(SETTINGS_EVENT, openSettings);

    return () => {
      window.removeEventListener(
        SETTINGS_EVENT,
        openSettings,
      );
    };
  }, []);

  function saveChoice(next: Consent) {
    const previouslyAccepted = choice === "accepted";

    if (next === "rejected") {
      disableAnalytics();
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Preference still works for this page session.
    }

    setChoice(next);
    setSettingsOpen(false);

    // Fully unload previously activated analytics.
    if (next === "rejected" && previouslyAccepted) {
      window.location.reload();
    }
  }

  if (!ready || (choice !== null && !settingsOpen)) {
    return null;
  }

  return (
    <section
      className={styles.banner}
      aria-label="Cookie preferences"
    >
      <div className={styles.content}>
        <h2>Your privacy matters</h2>

        <p>
          We use optional analytics cookies to understand
          how visitors use PondStuff and improve our website.
          You can accept or reject analytics cookies.
        </p>

        <a href="/cookie-policy">
          Read our Cookie Policy
        </a>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.accept}
          onClick={() => saveChoice("accepted")}
        >
          Accept analytics
        </button>

        <button
          type="button"
          className={styles.reject}
          onClick={() => saveChoice("rejected")}
        >
          Reject analytics
        </button>

        {choice !== null && (
          <button
            type="button"
            className={styles.cancel}
            onClick={() => setSettingsOpen(false)}
          >
            Keep current choice
          </button>
        )}
      </div>
    </section>
  );
}
