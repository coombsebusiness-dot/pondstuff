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

<p>With your permission, PondStuff uses Google Analytics 4 to understand how visitors use the website. Google Analytics may process information about pages visited, approximate location, browser and device details, and clicks on external links. We only load our Google Analytics tracking script after you accept optional analytics cookies.</p><p>You can withdraw your permission at any time using Cookie settings in the website footer. For details about Google's handling of information, see the <a href="https://policies.google.com/privacy">Google Privacy Policy</a>.</p>

<h2>Cookies</h2>

<p>We use browser storage to remember your analytics preference. Optional Google Analytics cookies are used only after you accept analytics. You can reject analytics without losing access to the website. See our <a href="/cookie-policy">Cookie Policy</a> for more information.</p>

<h2>Third-party services</h2>

<p>PondStuff contains links to third-party retailers and affiliate partners. We may earn commission from qualifying purchases. These third parties may use their own tracking technologies when you visit their websites. Their privacy policies and terms explain how they handle information.</p>

<h2>Your rights</h2>

<p>UK data protection law provides individuals with rights relating to their personal information. Depending on the circumstances, these may include rights to access, correction, deletion, restriction and objection.</p>

<h2>Contact</h2>

<p>If you have a privacy question, please contact us through our <a href="/contact">Contact page</a>.</p>

<p><strong>Last updated:</strong> 9 October 2026</p>

      </div>
    </section>
  );
}
