import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Learn how PondStuff uses cookies, Google Analytics and consent preferences.",
};

export default function Page() {
  return (
    <section className="legal-page">
      <div className="shell legal-inner">
        <h1>Cookie Policy</h1>

        <p className="lead">
          This policy explains how PondStuff.co.uk uses cookies
          and similar technologies, and how you can control them.
        </p>

        <h2>What are cookies?</h2>
        <p>
          Cookies are small files stored by your browser.
          Websites use them for functionality, preferences
          and, where permitted, analytics.
        </p>

        <h2>Essential preferences</h2>
        <p>
          PondStuff uses browser local storage to remember
          whether you accepted or rejected optional analytics.
          This preference helps us respect your choice on
          subsequent visits.
        </p>

        <h2>Optional analytics cookies</h2>
        <p>
          With your permission, PondStuff uses Google Analytics 4
          to understand website visits, page usage and clicks
          on links leading to other websites.
        </p>
        <p>
          Google Analytics may use cookies such as _ga and
          _ga_* to distinguish visits and measure website usage.
          These are optional and our analytics script is not
          loaded unless you accept analytics.
        </p>
        <p>
          Google processes analytics information according to
          its own privacy terms. You can read the{" "}
          <a href="https://policies.google.com/privacy">
            Google Privacy Policy
          </a>
          .
        </p>

        <h2>Affiliate links</h2>
        <p>
          Some PondStuff pages contain links to third-party
          retailers. We may earn a commission when you make
          a qualifying purchase.
        </p>
        <p>
          Retailers and affiliate networks may use their own
          tracking technologies when you visit their websites.
          Their privacy and cookie policies apply to those
          services.
        </p>

        <h2>Managing your preferences</h2>
        <p>
          You can accept or reject optional analytics using
          our cookie banner. Both options are available
          without affecting access to PondStuff.
        </p>
        <p>
          You can change your decision at any time using
          the Cookie settings option in our website footer.
          You can also clear stored preferences and cookies
          through your browser settings.
        </p>

        <h2>Further information</h2>
        <p>
          Please also read our{" "}
          <a href="/privacy-policy">Privacy Policy</a>
          {" "}for additional information about personal data.
        </p>

        <p>
          <strong>Last updated:</strong> 9 October 2026
        </p>
      </div>
    </section>
  );
}
