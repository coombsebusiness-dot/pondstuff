import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://pondstuff.co.uk"),
  title: {
    default: "PondStuff | Everything for Your Pond",
    template: "%s | PondStuff",
  },
  description:
    "Practical pond advice, pond plants, fish guides, equipment help, troubleshooting and free pond calculators for UK pond owners.",
};

const navItems = [
  { href: "/guides", label: "Guides" },
  { href: "/problems", label: "Pond Problems" },
  { href: "/equipment", label: "Equipment" },
  { href: "/plants", label: "Plants" },
  { href: "/fish", label: "Fish" },
  { href: "/tools", label: "Tools" },
];

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <header className="site-header">
        <div className="topbar">
          <div className="shell topbar-inner">
            <span>Practical advice for better ponds</span>
            <span className="topbar-right">
              Independent UK pond resource
            </span>
          </div>
        </div>

        <div className="shell brand-row">
          <Link href="/" className="brand" aria-label="PondStuff home">
            <span className="brand-mark" aria-hidden="true">
              <span className="brand-ripple" />
            </span>

            <span className="brand-copy">
              <span className="brand-name">
                POND<span>STUFF</span>
              </span>
              <span className="brand-tagline">
                Everything for your pond
              </span>
            </span>
          </Link>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          <div className="shell nav-inner">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="site-footer">
        <div className="shell footer-grid">
          <div>
            <div className="footer-brand">
              POND<span>STUFF</span>
            </div>
            <p>
              Practical guides, tools and resources for creating and caring
              for a better pond.
            </p>
          </div>

          <div>
            <h2>Explore</h2>
            <Link href="/guides">Pond Guides</Link>
            <Link href="/problems">Pond Problems</Link>
            <Link href="/equipment">Equipment</Link>
          </div>

          <div>
            <h2>Discover</h2>
            <Link href="/plants">Pond Plants</Link>
            <Link href="/fish">Pond Fish</Link>
            <Link href="/tools">Pond Tools</Link>
          </div>
        </div>

        <div className="shell footer-bottom">
          <span>© {new Date().getFullYear()} PondStuff.co.uk</span>
          <span>Everything for your pond.</span>
        </div>
      </footer>
    </>
  );
}
