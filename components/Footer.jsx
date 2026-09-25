import fs from "node:fs";
import path from "node:path";

const homepageMarkup = fs.readFileSync(
  path.join(process.cwd(), "content", "index.html"),
  "utf8",
);
const homepageFooter = homepageMarkup.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0] ?? "";
const footerLogoMarkup = (
  homepageFooter.match(/<div class=logo>([\s\S]*?)<\/div>/i)?.[1] ?? ""
).replace("/mooassist-logo.png", "/mooassist-logo-light.png");

export default function Footer() {
  return (
    <footer className="main-footer normal-padding">
      <div className="auto-container">
        <div className="widgets-section">
          <div className="footer-grid">
            <div className="column">
              <div className="footer-widget logo-widget">
                <div className="widget-content">
                  <div
                    className="logo"
                    dangerouslySetInnerHTML={{ __html: footerLogoMarkup }}
                  />
                  <div className="text">
                    Reliable Developers. Scalable Solutions. MooAssist connects businesses
                    with developers and flexible engineering teams for modern digital projects.
                  </div>
                  <ul className="social-links clearfix">
                    <li><a href="#"><span className="fab fa-facebook-square" /></a></li>
                    <li><a href="#"><span className="fab fa-twitter" /></a></li>
                    <li><a href="#"><span className="fab fa-instagram" /></a></li>
                    <li><a href="#"><span className="fab fa-pinterest-p" /></a></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="column">
              <div className="footer-widget links-widget">
                <div className="widget-content">
                  <h6>Company</h6>
                  <ul>
                    <li><a href="/about">About</a></li>
                    <li><a href="/contact">Contact Us</a></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="column">
              <div className="footer-widget links-widget">
                <div className="widget-content">
                  <h6>Services</h6>
                  <ul>
                    <li><a href="/services">Frontend Development</a></li>
                    <li><a href="/services">Backend Development</a></li>
                    <li><a href="/services">Full-Stack Development</a></li>
                    <li><a href="/services">AI &amp; Automation</a></li>
                    <li><a href="/services">Team Augmentation</a></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="column">
              <div className="footer-widget info-widget">
                <div className="widget-content">
                  <h6>Contact</h6>
                  <ul className="contact-info">
                    <li className="address">
                      <span className="icon flaticon-pin-1" /> H 30, Street 3, Askari 3,
                      <br />A Block Cantt, Lahore
                    </li>
                    <li><span className="icon flaticon-call" /><a href="tel:03238898732">0323-8898732</a></li>
                    <li><span className="icon flaticon-email-2" /><a href="mailto:mansoorisworking@gmail.com">mansoorisworking@gmail.com</a></li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="column">
              <div className="footer-widget newsletter-widget">
                <div className="widget-content">
                  <h6>Stay Updated</h6>
                  <div className="newsletter-form">
                    <form method="post" action="/contact">
                      <div className="form-group clearfix">
                        <input type="email" name="email" placeholder="Email Address" required />
                        <button type="submit" className="theme-btn" aria-label="Subscribe">
                          <span className="fa fa-envelope" />
                        </button>
                      </div>
                    </form>
                  </div>
                  <div className="text">
                    Get practical insights on software development, product building, and AI
                    automation.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="auto-container">
          <div className="inner clearfix">
            <div className="copyright">{"\u00A9"} 2026 MOOASSIST (SMC-PRIVATE) LIMITED. All rights reserved.</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
