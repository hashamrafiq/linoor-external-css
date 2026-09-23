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
    document.querySelector(".main-header")?.classList.toggle("is-scrolled", isScrolled);
  }, [isScrolled]);

  return null;
}
