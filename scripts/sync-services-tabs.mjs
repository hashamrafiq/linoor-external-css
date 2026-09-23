import fs from "node:fs";

const reference = fs.readFileSync(".reference-pages/services.html", "utf8");
const liveTabs = reference.match(
  /<section class="we-work-section">[\s\S]*?<\/section>/i,
)?.[0];

if (!liveTabs) throw new Error("Live work-tabs section was not found.");

const localTabs = liveTabs
  .replace(
    '<section class="we-work-section">',
    '<section class="we-work-section we-work-section--reference">',
  )
  .replaceAll(
    'src="images/resource/featured-image-14.jpg"',
    'src="/services-featured-image-14.webp"',
  );

const pagePath = "content/services.html";
const page = fs.readFileSync(pagePath, "utf8");
const updated = page.replace(
  /<section\s+class=(?:"we-work-section we-work-section--reference"|we-work-section\s+we-work-section--reference)>[\s\S]*?<\/section>/i,
  localTabs,
);

if (updated === page) throw new Error("Project work-tabs section was not replaced.");

fs.writeFileSync(pagePath, updated);
console.log("Services work-tabs synchronized from the live reference.");
