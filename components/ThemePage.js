import { getThemePage } from "@/lib/theme-pages";
import BannerCarousel from "./BannerCarousel";
import ProjectCarousels from "./ProjectCarousels";
import HomeReferenceEnhancements from "./HomeReferenceEnhancements";
import SponsorsCarousel from "./SponsorsCarousel";
import ThemeAnimations from "./ThemeAnimations";
import TestimonialCarousels from "./TestimonialCarousels";
import ThemeInteractions from "./ThemeInteractions";

export default function ThemePage({ slug }) {
  const markup = getThemePage(slug).replace(/<footer\b[\s\S]*?<\/footer>/i, "");

  return (
    <>
      <main dangerouslySetInnerHTML={{ __html: markup }} />
      <ThemeInteractions />
      <ThemeAnimations />
      <BannerCarousel />
      <ProjectCarousels />
      <SponsorsCarousel />
      <TestimonialCarousels />
      {slug === "home" && <HomeReferenceEnhancements />}
    </>
  );
}
