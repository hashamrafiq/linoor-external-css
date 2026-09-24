export const metadata = { title: "Thank You | MooAssist" };

export default function ThankYouPage() {
  return (
    <main className="page-wrapper">
      <section className="page-banner">
        <div className="image-layer" style={{ backgroundImage: "url(/linoor-assets/images/background/image-7.jpg)" }} />
        <div className="shape-1" />
        <div className="shape-2" />
        <div className="banner-inner">
          <div className="auto-container">
            <div className="inner-container clearfix">
              <h1>Thank You</h1>
              <div className="page-nav"><ul className="bread-crumb clearfix"><li><a href="/">Home</a></li><li className="active">Thank You</li></ul></div>
            </div>
          </div>
        </div>
      </section>
      <section className="contact-section">
        <div className="auto-container">
          <div className="sec-title centered">
            <div className="lower-text">Thank you for contacting MooAssist. We have received your message and our team will review your requirements.</div>
            <a className="theme-btn btn-style-one" href="/"><i className="btn-curve" /><span className="btn-title">Back to Home</span></a>
          </div>
        </div>
      </section>
    </main>
  );
}
