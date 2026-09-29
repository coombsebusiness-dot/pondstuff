import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free Pond Calculators & Tools",
  description:
    "Free pond calculators for working out pond volume, liner size, pump flow and filtration requirements.",
};

const tools = [
  {
    title: "Pond Volume Calculator",
    description:
      "Calculate how many litres and UK gallons your pond holds using its dimensions.",
    href: "/tools/pond-volume-calculator",
    status: "Available now",
  },
  {
    title: "Pond Pump Calculator",
    description:
      "Estimate the pump flow rate your pond needs based on its water volume.",
    href: "#",
    status: "Coming soon",
  },
  {
    title: "Pond Filter Calculator",
    description:
      "Find the filter capacity rating to look for based on pond volume and fish stocking.",
    href: "/tools/pond-filter-calculator",
    status: "Available now",
  },
  {
    title: "Pond Liner Calculator",
    description:
      "Work out the approximate liner dimensions required for a new pond.",
    href: "/tools/pond-liner-calculator",
    status: "Available now",
  },
];

export default function ToolsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="shell narrow-shell">
          <p className="eyebrow">PONDSTUFF TOOLS</p>
          <h1>Take the guesswork out of your pond.</h1>
          <p className="page-intro">
            Free calculators to help you plan your pond, choose equipment and
            understand exactly what you&apos;re working with.
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="shell">
          <div className="tools-grid">
            {tools.map((tool) =>
              tool.href === "#" ? (
                <div className="tool-card tool-card-muted" key={tool.title}>
                  <span className="tool-status">{tool.status}</span>
                  <h2>{tool.title}</h2>
                  <p>{tool.description}</p>
                </div>
              ) : (
                <Link className="tool-card" href={tool.href} key={tool.title}>
                  <span className="tool-status tool-status-live">
                    {tool.status}
                  </span>
                  <h2>{tool.title}</h2>
                  <p>{tool.description}</p>
                  <strong>Use calculator →</strong>
                </Link>
              ),
            )}
          </div>
        </div>
      </section>
    </>
  );
}
