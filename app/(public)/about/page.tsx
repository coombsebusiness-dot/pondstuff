import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About PondStuff",
  description: "Learn about PondStuff, an independent UK resource for pond guides, equipment, plants, fish, troubleshooting and practical pond tools.",
};

export default function Page() {
  return (
    <section className="legal-page">
      <div className="shell legal-inner">
        
<h1>About PondStuff</h1>

<p className="lead">Practical information for people who build, keep and care for ponds.</p>

<p>PondStuff is an independent UK pond resource created to make pond keeping easier to understand. We bring together practical guides, equipment information, pond problem-solving advice, plant and fish information, and useful calculators in one place.</p>

<h2>What you'll find here</h2>

<div className="info-grid">
  <div className="info-card">
    <h3>Pond Guides</h3>
    <p>Practical information covering pond planning, construction, maintenance and everyday care.</p>
  </div>
  <div className="info-card">
    <h3>Equipment</h3>
    <p>Information about pumps, filters, UV clarifiers, aeration, pond vacuums and other pond equipment.</p>
  </div>
  <div className="info-card">
    <h3>Plants & Fish</h3>
    <p>Reference information to help you understand pond plants, fish requirements and suitable pond conditions.</p>
  </div>
  <div className="info-card">
    <h3>Pond Tools</h3>
    <p>Free calculators designed to help with common pond measurements and planning decisions.</p>
  </div>
</div>

<h2>Our approach</h2>

<p>We aim to keep PondStuff straightforward, useful and practical. Where specifications or product information are provided, readers should always check the manufacturer's current information before making a purchase or installation decision.</p>

<p>PondStuff is an information resource. It does not replace professional advice where specialist, electrical, structural, environmental or animal-health advice is required.</p>

<h2>Get in touch</h2>

<p>If you have a question, correction or suggestion for the site, please visit our <a href="/contact">Contact page</a>.</p>

      </div>
    </section>
  );
}
