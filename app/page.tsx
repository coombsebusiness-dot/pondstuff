import Link from "next/link";

const sections = [
  {
    eyebrow: "BUILD & CARE",
    title: "Pond Guides",
    copy: "Straightforward help with planning, building and looking after your pond.",
    href: "/guides",
    icon: "◒",
  },
  {
    eyebrow: "FIX IT",
    title: "Pond Problems",
    copy: "Find the cause of green water, algae, leaks, cloudy water and other common problems.",
    href: "/problems",
    icon: "!",
  },
  {
    eyebrow: "CHOOSE WELL",
    title: "Equipment",
    copy: "Understand pumps, filters, UV clarifiers, aeration, liners and pond accessories.",
    href: "/equipment",
    icon: "⚙",
  },
  {
    eyebrow: "GROW",
    title: "Pond Plants",
    copy: "Find plants for wildlife ponds, small ponds, deep water, margins and oxygenation.",
    href: "/plants",
    icon: "✦",
  },
  {
    eyebrow: "KEEP",
    title: "Pond Fish",
    copy: "Species guides covering pond requirements, care, feeding and compatibility.",
    href: "/fish",
    icon: "><>",
  },
  {
    eyebrow: "CALCULATE",
    title: "Pond Tools",
    copy: "Work out pond volume, liner size, pump flow and filtration requirements.",
    href: "/tools",
    icon: "＋",
  },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="shell hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">THE UK POND OWNER&apos;S RESOURCE</p>

            <h1>
              Build a better pond.
              <br />
              <span>We&apos;ll help with the rest.</span>
            </h1>

            <p className="hero-intro">
              From your first hole in the ground to pumps, plants, fish and
              crystal-clear water, PondStuff gives you practical answers
              without the jargon.
            </p>

            <div className="hero-actions">
              <Link href="/guides" className="button button-primary">
                Explore pond guides
              </Link>
              <Link href="/tools" className="button button-secondary">
                Use our free tools
              </Link>
            </div>
          </div>

          <div className="pond-graphic" aria-hidden="true">
            <div className="sun" />
            <div className="reed reed-one" />
            <div className="reed reed-two" />
            <div className="reed reed-three" />
            <div className="water water-one" />
            <div className="water water-two" />
            <div className="water water-three" />
            <div className="lily lily-one" />
            <div className="lily lily-two" />
          </div>
        </div>
      </section>

      <section className="explore">
        <div className="shell">
          <div className="section-heading">
            <div>
              <p className="eyebrow">EVERYTHING FOR YOUR POND</p>
              <h2>What can we help you with?</h2>
            </div>

            <p>
              Start with what you need today. Everything on PondStuff is
              organised around the jobs and questions real pond owners have.
            </p>
          </div>

          <div className="card-grid">
            {sections.map((section) => (
              <Link
                href={section.href}
                className="category-card"
                key={section.href}
              >
                <div className="category-icon">{section.icon}</div>
                <p className="card-eyebrow">{section.eyebrow}</p>
                <h3>{section.title}</h3>
                <p>{section.copy}</p>
                <span className="card-link">Explore {section.title} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="tool-callout">
        <div className="shell tool-callout-inner">
          <div>
            <p className="eyebrow eyebrow-light">PONDSTUFF TOOLS</p>
            <h2>Take the guesswork out of your pond.</h2>
            <p>
              Our free calculators will help you size the essentials correctly
              before you spend a penny.
            </p>
          </div>

          <Link href="/tools" className="button button-light">
            Explore pond tools
          </Link>
        </div>
      </section>
    </>
  );
}
