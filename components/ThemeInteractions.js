"use client";

import { useEffect } from "react";

const colors = {
  "color-default": ["#ffaa17", "255, 170, 23"],
  "color-2": ["#70f28b", "112, 242, 139"],
  "color-3": ["#83dcfa", "131, 220, 250"],
  "color-4": ["#ff6c6c", "255, 108, 108"],
  "color-5": ["#73a5ff", "115, 165, 255"],
  "color-6": ["#fe9759", "254, 151, 89"],
};

function toggle(selector, className = "is-open") {
  document.querySelector(selector)?.classList.toggle(className);
}

export default function ThemeInteractions() {
  useEffect(() => {
    const onClick = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target.closest("#switcher-toggler")) {
        event.preventDefault();
        toggle(".style-switcher");
      }

      const styleOption = target.closest("#styleOptions a");
      if (styleOption) {
        event.preventDefault();
        const color = colors[styleOption.dataset.theme];
        if (color) {
          document.documentElement.style.setProperty("--thm-base", color[0]);
          document.documentElement.style.setProperty("--thm-base-rgb", color[1]);
        }
      }

      if (target.closest(".dark-switcher")) {
        event.preventDefault();
        document.body.classList.toggle("body-dark");
      }

      if (target.closest(".boxed-switcher")) {
        document.body.classList.toggle("is-boxed");
      }

      if (target.closest(".rtl-switcher")) document.documentElement.dir = "rtl";
      if (target.closest(".ltr-switcher")) document.documentElement.dir = "ltr";

      if (target.closest(".side-menu__toggler, .mobile-nav-toggler")) {
        event.preventDefault();
        toggle(".side-menu__block");
      }

      if (target.closest(".side-menu__block-overlay")) {
        document.querySelector(".side-menu__block")?.classList.remove("is-open");
      }

      if (target.closest(".search-toggler, .search-popup__overlay")) {
        event.preventDefault();
        toggle(".search-popup");
      }

      const megaMenuTrigger = target.closest(
        ".main-menu .navigation > .megamenu-clickable > a",
      );
      const megaMenuClose = target.closest(".home-showcase__toggler");
      if (megaMenuTrigger || megaMenuClose) {
        event.preventDefault();
        const megaMenu = (megaMenuTrigger || megaMenuClose)?.closest(
          ".megamenu-clickable",
        );
        megaMenu?.classList.toggle("is-open", Boolean(megaMenuTrigger));
      }

      if (target.closest(".scroll-to-top")) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      const projectTabButton = target.closest(".p-tab-btn[data-tab]");
      if (projectTabButton) {
        const projectTabs = projectTabButton.closest(".project-tab");
        projectTabs?.querySelectorAll(".p-tab-btn").forEach((button) => {
          button.classList.remove("active-btn");
        });
        projectTabs?.querySelectorAll(".p-tab").forEach((tab) => {
          tab.classList.remove("active-tab");
        });

        projectTabButton.classList.add("active-btn");
        const tab = projectTabs?.querySelector(projectTabButton.dataset.tab);
        if (tab) {
          tab.classList.add("active-tab");
          document.dispatchEvent(
            new CustomEvent("project-tab:shown", { detail: { tab } }),
          );
        }
      }

      const tabButton = target.closest(".tab-btn[data-tab]");
      if (tabButton) {
        const container = tabButton.closest(".tabs-box");
        container?.querySelectorAll(".tab-btn").forEach((button) => button.classList.remove("active-btn"));
        container?.querySelectorAll(".tab").forEach((tab) => {
          tab.classList.remove("active-tab");
          tab.style.display = "none";
        });
        tabButton.classList.add("active-btn");
        const tab = container?.querySelector(tabButton.dataset.tab);
        if (tab) {
          tab.classList.add("active-tab");
          tab.style.display = "block";
        }
      }
    };

    const onSubmit = (event) => {
      const form = event.target;
      if (!form.matches("form")) return;
      event.preventDefault();
      const submit = form.querySelector("button[type=submit]");
      if (submit) submit.dataset.submitted = "true";
    };

    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("submit", onSubmit);
    };
  }, []);

  return null;
}
