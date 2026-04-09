import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "./useAuth";

// Session expires after 30 minutes of inactivity
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
// Allow re-entry within 30 minutes of closing the tab
const TAB_CLOSE_GRACE_MS = 30 * 60 * 1000;
// How often we check for expiry (every 60s)
const CHECK_INTERVAL_MS = 60 * 1000;
// Throttle activity writes to localStorage (max once per second)
const THROTTLE_MS = 1000;

const KEYS = {
    LAST_ACTIVITY: "lastActivityTime",
    TAB_CLOSED: "tabClosedAt",
};


// Force-redirect to login: clears everything and prevents Back-button return
const forceLoginRedirect = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace("/login");
};

const useSessionManager = () => {
    const { logout } = useAuth();
    const lastWriteRef = useRef(0);
    const intervalRef = useRef(null);

    // Throttled: update lastActivityTime in localStorage
    const recordActivity = useCallback(() => {
        const now = Date.now();
        if (now - lastWriteRef.current < THROTTLE_MS) return;
        lastWriteRef.current = now;
        localStorage.setItem(KEYS.LAST_ACTIVITY, String(now));
    }, []);

    // Check if the session has expired due to inactivity → forcibly show login
    const checkIdleTimeout = useCallback(() => {
        const lastActivity = Number(localStorage.getItem(KEYS.LAST_ACTIVITY)) || 0;
        if (lastActivity && Date.now() - lastActivity > IDLE_TIMEOUT_MS) {
            forceLoginRedirect();
        }
    }, []);

    useEffect(() => {
        // ── On mount: check if tab was closed too long ago ──
        const tabClosedAt = Number(localStorage.getItem(KEYS.TAB_CLOSED));
        if (tabClosedAt) {
            const elapsed = Date.now() - tabClosedAt;
            localStorage.removeItem(KEYS.TAB_CLOSED);

            if (elapsed > TAB_CLOSE_GRACE_MS) {
                // User was away for more than 30 min → forcibly show login
                forceLoginRedirect();
                return;
            }
        }

        // Seed activity timestamp if missing (first login)
        if (!localStorage.getItem(KEYS.LAST_ACTIVITY)) {
            localStorage.setItem(KEYS.LAST_ACTIVITY, String(Date.now()));
        }

        // ── Register activity listeners (passive for zero perf impact) ──
        const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
        events.forEach((e) => window.addEventListener(e, recordActivity, { passive: true }));

        // ── Periodic idle check ──
        intervalRef.current = setInterval(checkIdleTimeout, CHECK_INTERVAL_MS);

        // ── Before tab close: stamp the time ──
        const handleBeforeUnload = () => {
            localStorage.setItem(KEYS.TAB_CLOSED, String(Date.now()));
        };
        window.addEventListener("beforeunload", handleBeforeUnload);

        // ── Cleanup ──
        return () => {
            events.forEach((e) => window.removeEventListener(e, recordActivity));
            clearInterval(intervalRef.current);
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [recordActivity, checkIdleTimeout, logout]);
};

export default useSessionManager;
