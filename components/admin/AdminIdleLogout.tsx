"use client";

import {useEffect} from "react";

const IDLE_TIMEOUT_MS = 5 * 60 * 1000;
const ACTIVITY_THROTTLE_MS = 1000;
const ACTIVITY_KEY = "arz-admin-last-activity";
const LOGOUT_KEY = "arz-admin-logout";
const CHANNEL_NAME = "arz-admin-session";
const activityEvents: Array<keyof WindowEventMap> = [
  "mousemove", "mousedown", "keydown", "scroll", "touchstart", "click",
];

export default function AdminIdleLogout() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastRecordedAt = 0;
    let loggingOut = false;
    const channel = typeof BroadcastChannel === "undefined"
      ? null
      : new BroadcastChannel(CHANNEL_NAME);

    const goToIdleLogin = () => window.location.replace("/admin/login?reason=idle");
    const logout = async (notifyOtherTabs = true) => {
      if (loggingOut) return;
      loggingOut = true;
      if (timer) clearTimeout(timer);
      try {
        await fetch("/api/admin/logout", {method: "POST"});
      } catch {
        // Navigation still continues when the server session is already gone.
      }
      if (notifyOtherTabs) {
        const value = String(Date.now());
        window.localStorage.setItem(LOGOUT_KEY, value);
        channel?.postMessage({type: "logout", value});
      }
      goToIdleLogin();
    };
    const schedule = (lastActivity: number) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(
        () => void logout(),
        Math.max(0, IDLE_TIMEOUT_MS - (Date.now() - lastActivity)),
      );
    };
    const recordActivity = () => {
      const now = Date.now();
      if (now - lastRecordedAt < ACTIVITY_THROTTLE_MS) return;
      lastRecordedAt = now;
      window.localStorage.setItem(ACTIVITY_KEY, String(now));
      schedule(now);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === LOGOUT_KEY && event.newValue) void logout(false);
      if (event.key === ACTIVITY_KEY && event.newValue) {
        const timestamp = Number(event.newValue);
        if (Number.isFinite(timestamp)) schedule(timestamp);
      }
    };
    const handleChannel = (event: MessageEvent<{type?: string}>) => {
      if (event.data?.type === "logout") void logout(false);
    };

    for (const eventName of activityEvents) {
      window.addEventListener(eventName, recordActivity, {passive: true});
    }
    window.addEventListener("storage", handleStorage);
    channel?.addEventListener("message", handleChannel);

    const storedActivity = Number(window.localStorage.getItem(ACTIVITY_KEY));
    const initialActivity =
      Number.isFinite(storedActivity) && Date.now() - storedActivity < IDLE_TIMEOUT_MS
        ? storedActivity
        : Date.now();
    window.localStorage.setItem(ACTIVITY_KEY, String(initialActivity));
    schedule(initialActivity);

    return () => {
      if (timer) clearTimeout(timer);
      for (const eventName of activityEvents) {
        window.removeEventListener(eventName, recordActivity);
      }
      window.removeEventListener("storage", handleStorage);
      channel?.removeEventListener("message", handleChannel);
      channel?.close();
    };
  }, []);

  return null;
}
