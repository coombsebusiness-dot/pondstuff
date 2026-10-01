import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact PondStuff",
  description: "Contact PondStuff with questions, corrections, suggestions or feedback about the site.",
};

export default function Page() {
  return (
    <section className="legal-page">
      <div className="shell legal-inner">
        
<h1>Contact PondStuff</h1>

<p className="lead">Have a question, correction or suggestion? We'd love to hear from you.</p>

<h2>General enquiries</h2>

<p>For general questions about PondStuff, suggestions for future guides, corrections to information or feedback about the website, please contact us using the email address provided for the site.</p>

<p><strong>Email:</strong> hello@pondstuff.co.uk</p>

<h2>Corrections and product information</h2>

<p>If you spot an incorrect specification, outdated product detail or other factual error, please tell us what needs correcting and, where possible, include a link to the relevant manufacturer information.</p>

<h2>Affiliate and commercial enquiries</h2>

<p>For affiliate, partnership or commercial enquiries, please include enough information for us to understand what you are proposing.</p>

<h2>Before contacting us</h2>

<p>PondStuff is an independent information website. We cannot guarantee availability, pricing, specifications or delivery times for products supplied by third parties. Please contact the relevant manufacturer or retailer for order-specific support.</p>

      </div>
    </section>
  );
}
