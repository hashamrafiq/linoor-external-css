import fs from "node:fs";
import path from "node:path";

const sourceFiles = {
  home: "index.html",
  about: "about.html",
  contact: "contact.html",
  services: "services.html",
  shop: "shop.html",
  "website-development": "website-development.html",
  "ui-designing": "ui-designing.html",
  "app-development": "app-development.html",
  seo: "seo.html",
  "digital-marketing": "digital-marketing.html",
  "graphic-designing": "graphic-designing.html",
  "blog-grid": "blog-grid.html",
  "blog-single": "blog-single.html",
};

export const pageMeta = {
  home: { title: "Linoor | Digital Agency" },
  about: { title: "About Us | Linoor" },
  contact: { title: "Contact | Linoor" },
  services: { title: "Services | Linoor" },
  shop: { title: "Shop | Linoor" },
  "website-development": { title: "Website Development | Linoor" },
  "ui-designing": { title: "UI/UX Designing | Linoor" },
  "app-development": { title: "App Development | Linoor" },
  seo: { title: "SEO & Content Writting | Linoor" },
  "digital-marketing": { title: "Digital Marketing | Linoor" },
  "graphic-designing": { title: "Graphic Designing | Linoor" },
  "blog-grid": { title: "Blog Posts | Linoor" },
  "blog-single": { title: "Blog Posts | Linoor" },
};

export function getThemePage(slug) {
  const file = sourceFiles[slug];
  if (!file) return null;
  return fs.readFileSync(path.join(process.cwd(), "content", file), "utf8");
}
