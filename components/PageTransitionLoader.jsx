"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const REFERENCE_LOADER_DELAY = 300;
const FAILSAFE_TIMEOUT = 10000;

export default function PageTransitionLoader() {
  const pathname = usePathname();
  const router = useRouter();
  const [phase, setPhase] = useState("hidden");
  const isNavigating = useRef(false);
  const completeTimer = useRef();
  const failSafeTimer = useRef();
  const hideTimer = useRef();

  const clearTimers = useCallback(() => {
    window.clearTimeout(completeTimer.current);
    window.clearTimeout(failSafeTimer.current);
    window.clearTimeout(hideTimer.current);
  }, []);

  const finishTransition = useCallback(() => {
    if (!isNavigating.current) return;

    isNavigating.current = false;
    window.clearTimeout(completeTimer.current);
    window.clearTimeout(failSafeTimer.current);
    setPhase("finishing");
    hideTimer.current = window.setTimeout(
      () => setPhase("hidden"),
      REFERENCE_LOADER_DELAY,
    );
  }, []);

  const beginTransition = useCallback(
    (destination, isSamePath) => {
      clearTimers();
      isNavigating.current = true;
      setPhase("loading");
      router.push(destination);

      if (isSamePath) {
        completeTimer.current = window.setTimeout(finishTransition, 0);
      }
      failSafeTimer.current = window.setTimeout(finishTransition, FAILSAFE_TIMEOUT);
    },
    [clearTimers, finishTransition, router],
  );

  useEffect(() => {
    if (!isNavigating.current) return;

    completeTimer.current = window.setTimeout(finishTransition, 0);
  }, [finishTransition, pathname]);

  useEffect(() => {
    const onDocumentClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;

      const anchor = event.target.closest("a[href]");
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;

      const destination = new URL(href, window.location.href);
      if (destination.origin !== window.location.origin) return;

      const isSamePath =
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search;
      if (isSamePath) return;

      event.preventDefault();
      beginTransition(
        `${destination.pathname}${destination.search}${destination.hash}`,
        destination.pathname === window.location.pathname,
      );
    };

    document.addEventListener("click", onDocumentClick, true);
    return () => {
      document.removeEventListener("click", onDocumentClick, true);
      clearTimers();
    };
  }, [beginTransition, clearTimers]);

  return (
    <div
      className={`route-transition-loader route-transition-loader--${phase}`}
      aria-hidden="true"
    >
      <div className="icon" />
    </div>
  );
}
