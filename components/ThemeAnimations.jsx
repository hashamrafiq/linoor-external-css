"use client";

import { useEffect } from "react";

const animationClassPattern = /^(fade|slide|zoom|bounce|flip|lightSpeed|rotate|roll|jackIn|hinge)/i;

function getAnimationName(element) {
  return (
    element.dataset.wowAnimation ||
    element.style.animationName ||
    [...element.classList].find((className) => animationClassPattern.test(className)) ||
    "fadeInUp"
  );
}

function initializeScrollAnimations() {
  const elements = [...document.querySelectorAll("main .wow")];
  if (!elements.length) return () => {};

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveal = (element, animate = true) => {
    const animationName = getAnimationName(element);
    const duration = element.dataset.wowDuration || "1s";
    const delay = element.dataset.wowDelay || "0ms";

    element.classList.toggle("animated", animate);
    element.style.setProperty("visibility", "visible", "important");
    element.style.setProperty("animation-name", animate ? animationName : "none", "important");
    element.style.setProperty("animation-duration", duration, "important");
    element.style.setProperty("animation-delay", delay, "important");
    element.dataset.animationVisible = "true";
  };

  if (reducedMotion) {
    elements.forEach((element) => reveal(element, false));
    return () => {};
  }

  elements.forEach((element) => {
    element.dataset.wowAnimation = getAnimationName(element);
    element.classList.remove("animated");
    element.style.setProperty("visibility", "hidden", "important");
    element.style.setProperty("animation-name", "none", "important");
    delete element.dataset.animationVisible;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.05 },
  );

  elements.forEach((element) => observer.observe(element));
  return () => observer.disconnect();
}

function initializeCounters() {
  const counterBoxes = [...document.querySelectorAll("main .count-box")];
  if (!counterBoxes.length) return () => {};

  const animationFrames = new Set();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setFinalValue = (counter) => {
    const target = Number.parseFloat(counter.dataset.stop);
    if (Number.isFinite(target)) counter.textContent = String(target);
  };

  const animateBox = (box) => {
    const counters = [...box.querySelectorAll(".count-text[data-stop]")];
    if (!counters.length) return;

    box.classList.add("counted");
    counters.forEach((counter) => {
      const target = Number.parseFloat(counter.dataset.stop);
      const duration = Number.parseInt(counter.dataset.speed, 10) || 2000;
      if (!Number.isFinite(target)) return;

      if (reducedMotion) {
        setFinalValue(counter);
        return;
      }

      counter.textContent = "0";
      let startedAt;
      const tick = (timestamp) => {
        if (!startedAt) startedAt = timestamp;
        const progress = Math.min((timestamp - startedAt) / duration, 1);
        counter.textContent = String(Math.floor(target * progress));

        if (progress < 1) {
          const frame = window.requestAnimationFrame(tick);
          animationFrames.add(frame);
        } else {
          counter.textContent = String(target);
        }
      };

      const frame = window.requestAnimationFrame(tick);
      animationFrames.add(frame);
    });
  };

  if (reducedMotion) {
    counterBoxes.forEach((box) => {
      box.classList.add("counted");
      box.querySelectorAll(".count-text[data-stop]").forEach(setFinalValue);
    });
    return () => {};
  }

  counterBoxes.forEach((box) => {
    box.classList.remove("counted");
    box.querySelectorAll(".count-text[data-stop]").forEach((counter) => {
      counter.textContent = "0";
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateBox(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.1 },
  );

  counterBoxes.forEach((box) => observer.observe(box));
  return () => {
    observer.disconnect();
    animationFrames.forEach((frame) => window.cancelAnimationFrame(frame));
  };
}

export default function ThemeAnimations() {
  useEffect(() => {
    const disposeScrollAnimations = initializeScrollAnimations();
    const disposeCounters = initializeCounters();

    return () => {
      disposeScrollAnimations();
      disposeCounters();
    };
  }, []);

  return null;
}
