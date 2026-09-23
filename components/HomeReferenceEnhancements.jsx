"use client";

import { useEffect } from "react";

const services = [
  "Choose Service",
  "Website Development",
  "Graphic Designing",
  "Digital Marketing",
  "App Development",
];

function createVideoDialog(videoUrl) {
  const dialog = document.createElement("div");
  dialog.className = "home-video-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-label", "MooAssist video");
  dialog.innerHTML = `
    <button type="button" class="home-video-dialog__close" aria-label="Close video">&times;</button>
    <iframe src="${videoUrl}" title="MooAssist video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
  `;

  const close = () => {
    dialog.remove();
    document.body.classList.remove("home-video-dialog-open");
  };
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog || event.target.closest(".home-video-dialog__close")) close();
  });
  document.body.append(dialog);
  document.body.classList.add("home-video-dialog-open");
  dialog.querySelector(".home-video-dialog__close")?.focus();
  return close;
}

function initializeQuoteSelect() {
  const section = document.querySelector(".get-quote-section");
  const select = section?.querySelector(".custom-select-box");
  const trigger = section?.querySelector(".ui-selectmenu-button");
  const field = trigger?.closest(".field-inner");
  if (!select || !trigger || !field) return () => {};

  select.name = "service";
  select.required = true;
  select.replaceChildren(...services.map((label) => {
    const option = document.createElement("option");
    option.value = label === services[0] ? "" : label;
    option.textContent = label;
    return option;
  }));

  const menu = document.createElement("ul");
  menu.className = "home-quote-select-menu";
  menu.setAttribute("role", "listbox");
  menu.hidden = true;
  field.append(menu);

  const label = trigger.querySelector(".ui-selectmenu-text");
  if (label) label.textContent = select.value || services[0];
  const closeMenu = () => {
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
    trigger.classList.add("ui-selectmenu-button-closed");
  };
  const openMenu = () => {
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    trigger.classList.remove("ui-selectmenu-button-closed");
  };
  const choose = (value) => {
    select.value = value;
    if (label) label.textContent = value || services[0];
    menu.querySelectorAll("button").forEach((button) => {
      button.setAttribute("aria-selected", String(button.dataset.value === value));
    });
    select.dispatchEvent(new Event("change", { bubbles: true }));
    closeMenu();
    trigger.focus();
  };

  services.forEach((service, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.value = index === 0 ? "" : service;
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(index === 0));
    button.textContent = service;
    button.addEventListener("click", () => choose(button.dataset.value));
    item.append(button);
    menu.append(item);
  });

  const onTriggerClick = () => (menu.hidden ? openMenu() : closeMenu());
  const onTriggerKeyDown = (event) => {
    if (event.key === "Escape") closeMenu();
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onTriggerClick();
    }
  };
  const onDocumentPointerDown = (event) => {
    if (!field.contains(event.target)) closeMenu();
  };

  trigger.addEventListener("click", onTriggerClick);
  trigger.addEventListener("keydown", onTriggerKeyDown);
  document.addEventListener("pointerdown", onDocumentPointerDown);
  return () => {
    trigger.removeEventListener("click", onTriggerClick);
    trigger.removeEventListener("keydown", onTriggerKeyDown);
    document.removeEventListener("pointerdown", onDocumentPointerDown);
    menu.remove();
  };
}

export default function HomeReferenceEnhancements() {
  useEffect(() => {
    const disposeQuoteSelect = initializeQuoteSelect();
    let closeVideo;

    const onVideoClick = (event) => {
      if (!(event.target instanceof Element)) return;
      const videoLink = event.target.closest(".why-us-section .vid-link .lightbox-image");
      if (!videoLink) return;
      event.preventDefault();
      closeVideo?.();
      const url = new URL(videoLink.href);
      const videoId = url.searchParams.get("v");
      if (videoId) closeVideo = createVideoDialog(`https://www.youtube.com/embed/${videoId}?autoplay=1`);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") closeVideo?.();
    };

    document.addEventListener("click", onVideoClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      disposeQuoteSelect();
      closeVideo?.();
      document.removeEventListener("click", onVideoClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
