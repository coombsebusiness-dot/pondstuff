import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "PondStuff privacy policy explaining how information may be collected and used when you visit the website.",
};

export default function Page() {
  return (
    <section className="legal-page">
      <div className="shell legal-inner">
        
<h1>Privacy Policy</h1>

<p className="lead">This policy explains how PondStuff may handle information when you use this website.</p>

<h2>Information we may collect</h2>

<p>Depending on how you use the website, we may receive information such as information you provide when contacting us, technical information about your device and browser, and information about how pages are used.</p>

<h2>Contact information</h2>

<p>If you contact PondStuff by email, we may retain your message and contact details so that we can respond and keep an appropriate record of the enquiry.</p>

<h2>Website analytics</h2>

<p>We may use analytics or similar technologies to understand how visitors use the website, improve content and identify technical problems. These services may process information such as pages visited, approximate location, device information and referral information.</p>

<h2>Cookies</h2>

<p>The website may use cookies and similar technologies. Some may be necessary for the website to function, while others may support analytics, preferences or advertising. See our <a href="/cookie-policy">Cookie Policy</a> for more information.</p>

<h2>Third-party services</h2>

<p>Some features or links on PondStuff may involve third-party services. Those services have their own privacy policies and terms, and their handling of information is outside PondStuff's direct control.</p>

<h2>Your rights</h2>

<p>UK data protection law provides individuals with rights relating to their personal information. Depending on the circumstances, these may include rights to access, correction, deletion, restriction and objection.</p>

<h2>Contact</h2>

<p>If you have a privacy question, please contact us through our <a href="/contact">Contact page</a>.</p>

<p><strong>Last updated:</strong> 1 October 2026</p>

      </div>
    </section>
  );
}
