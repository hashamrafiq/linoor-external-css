"use client";

import { useEffect } from "react";

const GAP = 30;
const AUTOPLAY_DELAY = 5000;

function getItemsPerView() {
  if (window.innerWidth < 768) return 1;
  if (window.innerWidth < 992) return 2;
  return 4;
}

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

  let itemsPerView = getItemsPerView();
  let currentIndex = firstOriginalIndex;
  let logicalIndex = 0;
  let itemWidth = 0;
  let autoplayId;
  let pointerStart;

  const renderDots = () => {
    const pageCount = Math.ceil(originalItems.length / itemsPerView);
    dots.innerHTML = Array.from({ length: pageCount }, (_, index) => (
      `<button type="button" class="owl-dot${index === 0 ? " active" : ""}" aria-label="Show project ${index + 1}"><span></span></button>`
    )).join("");
  };

  const updateDots = () => {
    const activePage = Math.floor(logicalIndex / itemsPerView);
    dots.querySelectorAll(".owl-dot").forEach((dot, index) => {
      dot.classList.toggle("active", index === activePage);
    });
  };

  const render = (animate = true) => {
    const offset = currentIndex * (itemWidth + GAP);
    stage.style.transition = animate ? "transform 700ms ease" : "none";
    stage.style.transform = `translate3d(${-offset}px, 0, 0)`;
    updateDots();
  };

  const resetLoopPosition = (event) => {
    if (event.target !== stage) return;

    const lastOriginalIndex = firstOriginalIndex + originalItems.length - 1;
    if (currentIndex >= firstOriginalIndex + originalItems.length) {
      currentIndex = firstOriginalIndex;
      render(false);
    } else if (currentIndex < firstOriginalIndex) {
      currentIndex = lastOriginalIndex;
      render(false);
    }
  };

  const moveBy = (direction) => {
    currentIndex += direction;
    logicalIndex = (logicalIndex + direction + originalItems.length) % originalItems.length;
    render();
  };

  const goTo = (page) => {
    logicalIndex = Math.min(page * itemsPerView, originalItems.length - 1);
    currentIndex = firstOriginalIndex + logicalIndex;
    render();
  };

  const refresh = () => {
    const width = viewport.clientWidth;
    if (!width) return;

    const nextItemsPerView = getItemsPerView();
    const itemCountChanged = itemsPerView !== nextItemsPerView;
    itemsPerView = nextItemsPerView;
    itemWidth = (width - GAP * (itemsPerView - 1)) / itemsPerView;

    items.forEach((item) => {
      item.style.width = `${itemWidth}px`;
      item.style.marginRight = `${GAP}px`;
    });
    stage.style.width = `${items.length * (itemWidth + GAP)}px`;
    if (itemCountChanged) renderDots();
    render(false);
  };

  const pauseAutoplay = () => window.clearInterval(autoplayId);
  const startAutoplay = () => {
    pauseAutoplay();
    autoplayId = window.setInterval(() => moveBy(1), AUTOPLAY_DELAY);
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
    else if (root.closest(".p-tab")?.classList.contains("active-tab")) startAutoplay();
  };

  const onProjectTabShown = (event) => {
    if (event.detail?.tab?.contains(root)) {
      window.requestAnimationFrame(() => {
        refresh();
        startAutoplay();
      });
    } else {
      pauseAutoplay();
    }
  };

  const resizeObserver = new ResizeObserver(refresh);
  renderDots();
  refresh();
  if (root.closest(".p-tab")?.classList.contains("active-tab")) startAutoplay();

  dots.addEventListener("click", onDotClick);
  stage.addEventListener("transitionend", resetLoopPosition);
  viewport.addEventListener("pointerdown", onPointerDown);
  viewport.addEventListener("pointerup", onPointerUp);
  root.addEventListener("mouseenter", pauseAutoplay);
  root.addEventListener("mouseleave", startAutoplay);
  root.addEventListener("focusin", pauseAutoplay);
  root.addEventListener("focusout", startAutoplay);
  document.addEventListener("visibilitychange", onVisibilityChange);
  document.addEventListener("project-tab:shown", onProjectTabShown);
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
    document.removeEventListener("project-tab:shown", onProjectTabShown);
  };
}

export default function ProjectCarousels() {
  useEffect(() => {
    const cleanup = [...document.querySelectorAll(".project-carousel")].map(
      initializeCarousel,
    );

    return () => cleanup.forEach((dispose) => dispose());
  }, []);

  return null;
}
