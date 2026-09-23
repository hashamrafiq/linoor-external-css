"use client";

import { useEffect } from "react";

export default function ServicesTabs() {
  useEffect(() => {
    const tabsBox = document.querySelector(".services-page .work-tabs");
    if (!tabsBox) return undefined;

    const tabs = [...tabsBox.querySelectorAll(".tab-btn[data-tab]")];
    const panels = [...tabsBox.querySelectorAll(".tabs-content > .tab")];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let activeAnimation;

    tabsBox.querySelector(".tab-btns")?.setAttribute("role", "tablist");
    tabs.forEach((tab, index) => {
      const panelId = tab.dataset.tab?.replace("#", "");
      tab.id ||= `service-tab-${index + 1}`;
      tab.setAttribute("role", "tab");
      if (panelId) tab.setAttribute("aria-controls", panelId);
    });
    panels.forEach((panel, index) => {
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabs[index]?.id || "");
    });

    const activate = (tab, animate = true) => {
      const panel = tabsBox.querySelector(tab.dataset.tab);
      if (!panel) return;
      if (animate && panel.classList.contains("active-tab") && panel.style.display !== "none") return;

      activeAnimation?.cancel();

      tabs.forEach((item) => {
        const selected = item === tab;
        item.classList.toggle("active-btn", selected);
        item.setAttribute("aria-selected", String(selected));
        item.tabIndex = selected ? 0 : -1;
      });

      panels.forEach((item) => {
        const selected = item === panel;
        item.classList.toggle("active-tab", selected);
        item.style.display = selected ? "block" : "none";
        item.style.opacity = selected && animate && !reducedMotion ? "0" : "";
        item.setAttribute("aria-hidden", String(!selected));
      });

      if (animate && !reducedMotion && typeof panel.animate === "function") {
        activeAnimation = panel.animate(
          [{ opacity: 0 }, { opacity: 1 }],
          { duration: 300, easing: "ease" },
        );
        activeAnimation.onfinish = () => {
          panel.style.opacity = "";
          activeAnimation = undefined;
        };
      } else {
        panel.style.opacity = "";
      }
    };

    const onClick = (event) => {
      const tab = event.target.closest(".tab-btn[data-tab]");
      if (tab && tabsBox.contains(tab)) activate(tab);
    };

    const onKeyDown = (event) => {
      const tab = event.target.closest(".tab-btn[data-tab]");
      if (!tab || !tabsBox.contains(tab)) return;

      const currentIndex = tabs.indexOf(tab);
      const keyToIndex = {
        ArrowRight: (currentIndex + 1) % tabs.length,
        ArrowLeft: (currentIndex - 1 + tabs.length) % tabs.length,
        Home: 0,
        End: tabs.length - 1,
      };

      if (event.key in keyToIndex) {
        event.preventDefault();
        const nextTab = tabs[keyToIndex[event.key]];
        activate(nextTab);
        nextTab.focus();
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate(tab);
      }
    };

    const activeTab = tabs.find((tab) => tab.classList.contains("active-btn"));
    if (activeTab) activate(activeTab, false);

    tabsBox.addEventListener("click", onClick);
    tabsBox.addEventListener("keydown", onKeyDown);
    return () => {
      activeAnimation?.cancel();
      tabsBox.removeEventListener("click", onClick);
      tabsBox.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
