"use client";

import { useEffect, useRef } from "react";

const IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 saat
const CHECK_INTERVAL_MS = 30 * 1000; // 30 saniyede bir kontrol
const ACTIVITY_WRITE_INTERVAL_MS = 15 * 1000;

const LAST_ACTIVITY_KEY = "arz-admin-last-activity";
const LOGOUT_EVENT_KEY = "arz-admin-logout-event";

export default function AdminIdleLogout() {
  const loggingOutRef = useRef(false);
  const lastActivityWriteRef = useRef(0);

  useEffect(() => {
    const logout = async () => {
      if (loggingOutRef.current) {
        return;
      }

      loggingOutRef.current = true;

      try {
        await fetch("/api/admin/logout", {
          method: "POST",
          credentials: "same-origin",
        });
      } catch {
        // Logout endpoint başarısız olsa bile login ekranına yönlendir.
      }

      try {
        window.localStorage.setItem(
          LOGOUT_EVENT_KEY,
          String(Date.now()),
        );
      } catch {
        // localStorage kullanılamıyorsa sessiz devam et.
      }

      window.location.href = "/admin/login";
    };

    const writeActivity = (force = false) => {
      const now = Date.now();

      if (
        !force &&
        now - lastActivityWriteRef.current <
          ACTIVITY_WRITE_INTERVAL_MS
      ) {
        return;
      }

      lastActivityWriteRef.current = now;

      try {
        window.localStorage.setItem(
          LAST_ACTIVITY_KEY,
          String(now),
        );
      } catch {
        // localStorage kullanılamıyorsa timer yine çalışabilir.
      }
    };

    const getLastActivity = () => {
      try {
        const value = Number(
          window.localStorage.getItem(LAST_ACTIVITY_KEY),
        );

        if (Number.isFinite(value) && value > 0) {
          return value;
        }
      } catch {
        // localStorage yoksa bu sekmenin son aktivitesini kullan.
      }

      return lastActivityWriteRef.current || Date.now();
    };

    const checkIdle = () => {
      const lastActivity = getLastActivity();
      const idleFor = Date.now() - lastActivity;

      if (idleFor >= IDLE_TIMEOUT_MS) {
        void logout();
      }
    };

    const handleActivity = () => {
      writeActivity();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkIdle();
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === LOGOUT_EVENT_KEY && event.newValue) {
        window.location.href = "/admin/login";
      }
    };

    /*
     * Yeni admin oturumu açıldığında eski localStorage zamanı
     * yüzünden anında logout olmaması için aktiviteyi sıfırla.
     */
    writeActivity(true);

    const activityEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "scroll",
      "wheel",
      "touchstart",
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(
        eventName,
        handleActivity,
        { passive: true },
      );
    });

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    window.addEventListener(
      "storage",
      handleStorage,
    );

    const interval = window.setInterval(
      checkIdle,
      CHECK_INTERVAL_MS,
    );

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(
          eventName,
          handleActivity,
        );
      });

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

      window.removeEventListener(
        "storage",
        handleStorage,
      );

      window.clearInterval(interval);
    };
  }, []);

  return null;
}