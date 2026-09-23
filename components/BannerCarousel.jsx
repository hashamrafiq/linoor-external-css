"use client";

import { useEffect } from "react";

const AUTOPLAY_DELAY = 7000;
const TRANSITION_DURATION = 500;

function initializeCarousel(root) {
  const viewport = root.querySelector(":scope > .owl-stage-outer");
  const stage = viewport?.querySelector(":scope > .owl-stage");
  const dots = root.querySelector(":scope > .owl-dots");
  const items = stage
    ? [...stage.children].filter((item) => item.classList.contains("owl-item"))
    : [];
  const originalItems = items.filter((item) => !item.classList.contains("cloned"));
  const firstOriginalIndex = items.findIndex(
    (item) => !item.classList.contains("cloned"),
  );

  if (!viewport || !stage || !dots || !originalItems.length || firstOriginalIndex < 0) {
    return () => {};
  }

  const activeOriginalIndex = items.findIndex(
    (item) => !item.classList.contains("cloned") && item.classList.contains("active"),
  );
  let currentIndex = activeOriginalIndex >= 0 ? activeOriginalIndex : firstOriginalIndex;
  let logicalIndex = currentIndex - firstOriginalIndex;
  let itemWidth = 0;
  let autoplayId;
  let pointerStart;

  const renderDots = () => {
    dots.innerHTML = originalItems
      .map(
        (_, index) =>
          `<button type="button" class="owl-dot${index === logicalIndex ? " active" : ""}" aria-label="Show slide ${index + 1}"><span></span></button>`,
      )
      .join("");
  };

  const updateActiveSlide = () => {
    items.forEach((item, index) => {
      item.classList.toggle("active", index === currentIndex);
    });
    dots.querySelectorAll(".owl-dot").forEach((dot, index) => {
      dot.classList.toggle("active", index === logicalIndex);
    });
  };

  const render = (animate = true) => {
    stage.style.transition = animate
      ? `transform ${TRANSITION_DURATION}ms ease`
      : "none";
    stage.style.transform = `translate3d(${-currentIndex * itemWidth}px, 0, 0)`;
    updateActiveSlide();
  };

  const resetLoopPosition = (event) => {
    if (event.target !== stage) return;

    if (currentIndex >= firstOriginalIndex + originalItems.length) {
      currentIndex = firstOriginalIndex;
      render(false);
    } else if (currentIndex < firstOriginalIndex) {
      currentIndex = firstOriginalIndex + originalItems.length - 1;
      render(false);
    }
  };

  const moveBy = (direction) => {
    currentIndex += direction;
    logicalIndex = (logicalIndex + direction + originalItems.length) % originalItems.length;
    render();
  };

  const goTo = (index) => {
    logicalIndex = index;
    currentIndex = firstOriginalIndex + index;
    render();
  };

  const refresh = () => {
    itemWidth = viewport.clientWidth;
    if (!itemWidth) return;

    items.forEach((item) => {
      item.style.width = `${itemWidth}px`;
      item.style.marginRight = "0px";
    });
    stage.style.width = `${items.length * itemWidth}px`;
    render(false);
  };

  const pauseAutoplay = () => window.clearInterval(autoplayId);
  const startAutoplay = () => {
    pauseAutoplay();
    if (!document.hidden) autoplayId = window.setInterval(() => moveBy(1), AUTOPLAY_DELAY);
  };

  const onDotClick = (event) => {
    const dot = event.target.closest(".owl-dot");
    if (!dot) return;
    goTo([...dots.querySelectorAll(".owl-dot")].indexOf(dot));
    startAutoplay();
  };

  const onPointerDown = (event) => {
    pointerStart = event.clientX;
  };

  const onPointerUp = (event) => {
    if (pointerStart === undefined) return;
    const distance = event.clientX - pointerStart;
    pointerStart = undefined;
    if (Math.abs(distance) > 40) {
      moveBy(distance < 0 ? 1 : -1);
      startAutoplay();
    }
  };

  const onVisibilityChange = () => {
    if (document.hidden) pauseAutoplay();
    else startAutoplay();
  };

  const resizeObserver = new ResizeObserver(refresh);
  renderDots();
  refresh();
  startAutoplay();

  dots.addEventListener("click", onDotClick);
  stage.addEventListener("transitionend", resetLoopPosition);
  viewport.addEventListener("pointerdown", onPointerDown);
  viewport.addEventListener("pointerup", onPointerUp);
  root.addEventListener("mouseenter", pauseAutoplay);
  root.addEventListener("mouseleave", startAutoplay);
  root.addEventListener("focusin", pauseAutoplay);
  root.addEventListener("focusout", startAutoplay);
  document.addEventListener("visibilitychange", onVisibilityChange);
  resizeObserver.observe(viewport);

  return () => {
    pauseAutoplay();
    resizeObserver.disconnect();
    dots.removeEventListener("click", onDotClick);
    stage.removeEventListener("transitionend", resetLoopPosition);
    viewport.removeEventListener("pointerdown", onPointerDown);
    viewport.removeEventListener("pointerup", onPointerUp);
    root.removeEventListener("mouseenter", pauseAutoplay);
    root.removeEventListener("mouseleave", startAutoplay);
    root.removeEventListener("focusin", pauseAutoplay);
    root.removeEventListener("focusout", startAutoplay);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}

export default function BannerCarousel() {
  useEffect(() => {
    const cleanup = [...document.querySelectorAll(".banner-carousel")].map(
      initializeCarousel,
    );

    return () => cleanup.forEach((dispose) => dispose());
  }, []);

  return null;
}
