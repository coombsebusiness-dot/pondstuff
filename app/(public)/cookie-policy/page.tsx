import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "PondStuff cookie policy explaining cookies and similar technologies used on the website.",
};

export default function Page() {
  return (
    <section className="legal-page">
      <div className="shell legal-inner">
        
<h1>Cookie Policy</h1>

<p className="lead">This page explains how cookies and similar technologies may be used on PondStuff.</p>

<h2>What are cookies?</h2>

<p>Cookies are small text files stored on your device by websites. They can be used to make websites function, remember preferences, understand usage and support advertising.</p>

<h2>How PondStuff may use cookies</h2>

<p>Cookies or similar technologies may be used for:</p>

<ul>
  <li>essential website functionality;</li>
  <li>understanding how visitors use the website;</li>
  <li>remembering certain preferences;</li>
  <li>supporting advertising or affiliate services where applicable.</li>
</ul>

<h2>Third-party cookies</h2>

<p>Third-party providers used by PondStuff may place or access cookies or similar technologies in accordance with their own policies.</p>

<h2>Managing cookies</h2>

<p>Most modern browsers allow you to control or delete cookies through their settings. Blocking some cookies may affect how parts of a website function.</p>

<h2>Changes</h2>

<p>We may update this policy when the technologies or services used by PondStuff change.</p>

<p><strong>Last updated:</strong> 1 October 2026</p>

      </div>
    </section>
  );
}
