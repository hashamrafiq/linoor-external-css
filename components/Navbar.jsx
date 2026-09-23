import fs from "node:fs";
import path from "node:path";
import NavbarScroll from "./NavbarScroll";

const navbarMarkup = fs.readFileSync(
  path.join(process.cwd(), "components", "navbar.html"),
  "utf8",
);

export default function Navbar() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: navbarMarkup }} />
      <NavbarScroll />
    </>
  );
}
