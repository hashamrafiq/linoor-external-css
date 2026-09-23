"use client";

import { useEffect } from "react";

const carouselConfigs = [
  {
    selector: ".testimonials-carousel",
    desktopItems: 2,
    tabletItems: 2,
  },
  {
    selector: ".testimonials-four-carousel",
    desktopItems: 3,
    tabletItems: 2,
    showNavigation: false,
  },
];

const GAP = 30;
const AUTOPLAY_DELAY = 5000;

function getItemsPerView(config) {
  if (window.innerWidth < 992) return 1;
  return config.desktopItems;
}

function initializeCarousel(root, config) {
  const viewport = root.querySelector(":scope > .owl-stage-outer");
  const stage = viewport?.querySelector(":scope > .owl-stage");
  const navigation = root.querySelector(":scope > .owl-nav");
  const dots = root.querySelector(":scope > .owl-dots");
  const items = stage ? [...stage.children].filter((item) => item.classList.contains("owl-item")) : [];
  const originalItems = items.filter((item) => !item.classList.contains("cloned"));
  const firstOriginalIndex = items.findIndex((item) => !item.classList.contains("cloned"));

  if (
    !viewport ||
    !stage ||
    !dots ||
    !originalItems.length ||
    firstOriginalIndex < 0 ||
    (config.showNavigation !== false && !navigation)
  ) {
    return () => {};
  }

  let itemsPerView = getItemsPerView(config);
  let currentIndex = firstOriginalIndex;
  let logicalIndex = 0;
  let itemWidth = 0;
  let autoplayId;
  let pointerStart;

  if (config.showNavigation === false) {
    navigation?.remove();
  } else {
    navigation.classList.remove("disabled", "sf-hidden");
    navigation.innerHTML = [
      '<button type="button" class="owl-prev" aria-label="Previous testimonial"><span class="icon fa fa-angle-left"></span></button>',
      '<button type="button" class="owl-next" aria-label="Next testimonial"><span class="icon fa fa-angle-right"></span></button>',
    ].join("");
  }

  const renderDots = () => {
    const pageCount = Math.ceil(originalItems.length / itemsPerView);
    dots.innerHTML = Array.from({ length: pageCount }, (_, index) => (
      `<button type="button" class="owl-dot${index === 0 ? " active" : ""}" aria-label="Show testimonials ${index + 1}"><span></span></button>`
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

  const goTo = (index) => {
    logicalIndex = Math.min(index * itemsPerView, originalItems.length - 1);
    currentIndex = firstOriginalIndex + logicalIndex;
    render();
  };

  const refresh = () => {
    const nextItemsPerView = getItemsPerView(config);
    const itemCountChanged = itemsPerView !== nextItemsPerView;
    itemsPerView = nextItemsPerView;
    itemWidth = (viewport.clientWidth - GAP * (itemsPerView - 1)) / itemsPerView;

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

  const onNavigationClick = (event) => {
    if (event.target.closest(".owl-prev")) moveBy(-1);
    if (event.target.closest(".owl-next")) moveBy(1);
    startAutoplay();
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
    if (Math.abs(distance) > 40) moveBy(distance < 0 ? 1 : -1);
  };

  const onVisibilityChange = () => {
    if (document.hidden) pauseAutoplay();
    else startAutoplay();
  };

  const resizeObserver = new ResizeObserver(refresh);
  renderDots();
  refresh();
  startAutoplay();

  if (config.showNavigation !== false) {
    navigation.addEventListener("click", onNavigationClick);
  }
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
    if (config.showNavigation !== false) {
      navigation.replaceChildren();
    }
    renderDots();
    if (config.showNavigation !== false) {
      navigation.classList.add("disabled", "sf-hidden");
      navigation.removeEventListener("click", onNavigationClick);
    }
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

export default function TestimonialCarousels() {
  useEffect(() => {
    const cleanup = carouselConfigs.flatMap((config) => (
      [...document.querySelectorAll(config.selector)].map((carousel) => initializeCarousel(carousel, config))
    ));

    return () => cleanup.forEach((dispose) => dispose());
  }, []);

  return null;
}
