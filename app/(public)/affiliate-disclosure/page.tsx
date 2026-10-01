import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: "PondStuff affiliate disclosure explaining how affiliate links may work on the website.",
};

export default function Page() {
  return (
    <section className="legal-page">
      <div className="shell legal-inner">
        
<h1>Affiliate Disclosure</h1>

<p className="lead">PondStuff may use affiliate links on some pages.</p>

<h2>What is an affiliate link?</h2>

<p>An affiliate link is a link containing tracking information supplied by a retailer or affiliate network. If you click such a link and subsequently make a qualifying purchase, PondStuff may receive a commission at no additional cost to you.</p>

<h2>How this affects PondStuff</h2>

<p>Affiliate relationships may help support the running of the website, including hosting, development, research and content creation.</p>

<p>Affiliate relationships do not change the price you pay unless the retailer's own pricing changes.</p>

<h2>Product information</h2>

<p>PondStuff aims to provide useful and accurate equipment information, but specifications, availability and prices can change. Always check the retailer and manufacturer's current information before purchasing.</p>

<h2>Editorial independence</h2>

<p>Our equipment information is intended to help readers understand their options. An affiliate relationship does not mean that a product is suitable for every pond or every reader.</p>

<p>If you have questions about an affiliate relationship, please <a href="/contact">contact us</a>.</p>

<p><strong>Last updated:</strong> 1 October 2026</p>

      </div>
    </section>
  );
}
