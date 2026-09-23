import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const referenceDirectory = path.join(root, ".reference-pages");
const contentDirectory = path.join(root, "content");
const publicDirectory = path.join(root, "public", "linoor-assets");

const pages = [
  ["web-development", "website-development"],
  ["ui-designing", "ui-designing"],
  ["app-development", "app-development"],
  ["seo", "seo"],
  ["digital-marketing", "digital-marketing"],
  ["graphic-designing", "graphic-designing"],
  ["blog-grid", "blog-grid"],
  ["blog-single", "blog-single"],
];

const routeMap = new Map([
  ["index.html", "/"],
  ["index-main.html", "/"],
  ["about.html", "/about"],
  ["about-2.html", "/about"],
  ["contact.html", "/contact"],
  ["services.html", "/services"],
  ["web-development.html", "/website-development"],
  ["ui-designing.html", "/ui-designing"],
  ["app-development.html", "/app-development"],
  ["seo.html", "/seo"],
  ["digital-marketing.html", "/digital-marketing"],
  ["graphic-designing.html", "/graphic-designing"],
  ["blog-grid.html", "/blog-grid"],
  ["blog-single.html", "/blog-single"],
]);

function pageBody(document) {
  const body = document.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1];
  if (!body) throw new Error("Reference document does not contain a body.");

  return body
    .replace(/<header\b[^>]*>[\s\S]*?<\/header>/i, "")
    .replace(/<!--Mobile Menu-->[\s\S]*?<!-- Banner Section -->/i, "<!-- Banner Section -->")
    .replace(/<div\s+class=["']side-menu__block["']>[\s\S]*?<\/div><!-- \/\.side-menu__block -->/i, "")
    .replace(/<div\s+class=["']search-popup["']>[\s\S]*?<\/div><!-- \/\.search-popup -->/i, "")
    .replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/i, "")
    // The original jQuery bundle removes this overlay after page load. Next.js
    // uses the React interaction layer instead, so keep converted pages visible.
    .replace(/<div\s+class=["']preloader["']>/i, '<div class="preloader" style="display: none">')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "");
}

function localAssetPath(asset) {
  return `/linoor-assets/${asset.replace(/^\.\//, "")}`;
}

function pageAssets(markup) {
  const assets = new Set();
  const add = (value) => {
    const asset = value.trim().replace(/^['"]|['"]$/g, "");
    if (/^images\//.test(asset)) assets.add(asset);
  };

  for (const match of markup.matchAll(/\bsrc=["']([^"']+)["']/gi)) add(match[1]);
  for (const match of markup.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) add(match[1]);
  return [...assets];
}

function localizeAssets(markup) {
  return markup
    .replace(/\bsrc=(["'])(images\/[^"']+)\1/gi, (_, quote, asset) => `src=${quote}${localAssetPath(asset)}${quote}`)
    .replace(/url\(\s*(["']?)(images\/[^"')]+)\1\s*\)/gi, (_, quote, asset) => `url(${quote}${localAssetPath(asset)}${quote})`);
}

function updateLinks(markup) {
  return markup.replace(/\b(href|action)=(["']?)([^\s>"']+)\2/gi, (match, attribute, quote, href) => {
    const localHref = href.replace(/^https?:\/\/pixydrops\.com\/linoorhtml\//i, "");
    const route = routeMap.get(localHref);
    return route ? `${attribute}=${quote}${route}${quote}` : match;
  });
}

async function cacheAsset(asset) {
  const target = path.join(publicDirectory, asset);
  try {
    await fs.access(target);
    return;
  } catch {}

  const response = await fetch(`https://pixydrops.com/linoorhtml/${asset}`, {
    headers: {
      Accept: "image/jpeg,image/png,image/gif,image/*;q=0.8,*/*;q=0.5",
      "User-Agent": "Mozilla/5.0",
    },
  });
  if (!response.ok) throw new Error(`Could not download ${asset}: ${response.status}`);

  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, Buffer.from(await response.arrayBuffer()));
}

for (const [referenceSlug, projectSlug] of pages) {
  const source = await fs.readFile(path.join(referenceDirectory, `${referenceSlug}.html`), "utf8");
  const markup = pageBody(source);
  await Promise.all(pageAssets(markup).map(cacheAsset));
  await fs.writeFile(
    path.join(contentDirectory, `${projectSlug}.html`),
    `${updateLinks(localizeAssets(markup)).trim()}\n`,
  );
  console.log(`Converted ${referenceSlug} to ${projectSlug}.`);
}

for (const file of await fs.readdir(contentDirectory)) {
  if (!file.endsWith(".html")) continue;
  const target = path.join(contentDirectory, file);
  const current = await fs.readFile(target, "utf8");
  const updated = updateLinks(current);
  if (updated !== current) await fs.writeFile(target, updated);
}
