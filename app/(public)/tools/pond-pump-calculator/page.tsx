import type { Metadata } from "next";
import Link from "next/link";
import PondPumpCalculator from "./PondPumpCalculator";

export const metadata: Metadata = {
  title: "Pond Pump Calculator – What Size Pump Do I Need?",
  description:
    "Use the free PondStuff pond pump calculator to estimate a baseline flow rate and understand how head height affects real pump performance.",
};

export default function PondPumpCalculatorPage() {
  return (
    <>
      <section className="page-hero calculator-page-hero">
        <div className="shell narrow-shell">
          <p className="eyebrow">
            FREE POND CALCULATOR
          </p>

          <h1>Pond Pump Calculator</h1>

          <p className="page-intro">
            Estimate a baseline pond circulation rate
            and understand how waterfalls and head
            height affect the pump you actually need.
          </p>
        </div>
      </section>

      <section className="calculator-section">
        <div className="shell calculator-layout">
          <PondPumpCalculator />

          <aside className="calculator-aside">
            <p className="eyebrow">
              WHY IT MATTERS
            </p>

            <h2>
              The number on the pump box is only the
              start.
            </h2>

            <p>
              Pump flow is normally quoted in litres
              per hour, but the amount of water
              actually delivered can fall as the pump
              has to lift water higher and overcome
              resistance in the plumbing.
            </p>

            <p>
              That is why PondStuff separates the
              circulation target from the real-world
              head and system requirements.
            </p>
          </aside>
        </div>
      </section>

      <section className="article-section">
        <div className="shell article-shell">
          <p className="eyebrow">
            PONDSTUFF GUIDE
          </p>

          <h2>
            How the Pond Pump Calculator works
          </h2>

          <p>
            Start with your pond&apos;s volume. If you
            do not know it, use the{" "}
            <Link href="/tools/pond-volume-calculator">
              Pond Volume Calculator
            </Link>
            .
          </p>

          <h3>Baseline circulation</h3>

          <p>
            For general pond circulation, the
            calculator uses a starting guideline of
            moving approximately half of the
            pond&apos;s volume each hour.
          </p>

          <h3>Fish ponds need more context</h3>

          <p>
            A simple circulation figure is not enough
            to select a complete system for a pond
            containing fed fish or koi. Filter
            capacity, fish load and the
            manufacturer&apos;s permitted flow range
            also need to be considered.
          </p>

          <h3>Why head height matters</h3>

          <p>
            A pump moving water to a waterfall or
            raised return has to work against vertical
            head. Pipe length, diameter, bends,
            fittings and other equipment add further
            resistance.
          </p>

          <h3>Check the pump curve</h3>

          <p>
            A pump&apos;s maximum advertised flow is
            not necessarily the flow it will deliver
            in your pond. Compare your required flow
            with the manufacturer&apos;s performance
            curve at the head your installation
            creates.
          </p>

          <p>
            You can also use the{" "}
            <Link href="/tools/pond-filter-calculator">
              Pond Filter Calculator
            </Link>{" "}
            when planning a filtered fish pond.
          </p>
        </div>
      </section>
    </>
  );
}
