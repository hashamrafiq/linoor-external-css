"use client";

import { useEffect, useState } from "react";

export default function NavbarScroll() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateNavbar = () => setIsScrolled(window.scrollY > 24);

    updateNavbar();
    window.addEventListener("scroll", updateNavbar, { passive: true });
    return () => window.removeEventListener("scroll", updateNavbar);
  }, []);

  useEffect(() => {
    const header = document.querySelector(".main-header");
    header?.classList.toggle("is-scrolled", isScrolled);

    const logo = document.querySelector("#thm-logo");
    const headerUpper = document.querySelector(".main-header .header-upper");

    if (!logo || !headerUpper) {
      return;
    }

    const backgroundColor = window.getComputedStyle(headerUpper).backgroundColor;
    const colorValues = backgroundColor.match(/\d+(\.\d+)?/g)?.map(Number) ?? [];
    const [red = 0, green = 0, blue = 0, alpha = 1] = colorValues;
    const luminance = (0.2126 * red) + (0.7152 * green) + (0.0722 * blue);
    const isLightBackground = alpha > 0.5 && luminance > 180;

    const lightLogo = logo.dataset.logoLight ?? logo.getAttribute("src");
    const darkLogo = logo.dataset.logoDark ?? lightLogo;

    logo.setAttribute("src", isLightBackground ? darkLogo : lightLogo);
  }, [isScrolled]);

  return null;
}
