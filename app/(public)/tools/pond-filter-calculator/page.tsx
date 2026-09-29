import type { Metadata } from "next";
import Link from "next/link";
import PondFilterCalculator from "./PondFilterCalculator";

export const metadata: Metadata = {
  title: "Pond Filter Calculator – What Size Filter Do I Need?",
  description:
    "Use the free PondStuff pond filter calculator to understand which manufacturer filter capacity rating to look for based on pond volume and fish stocking.",
};

export default function PondFilterCalculatorPage() {
  return (
    <>
      <section className="page-hero calculator-page-hero">
        <div className="shell narrow-shell">
          <p className="eyebrow">
            FREE POND CALCULATOR
          </p>
          <h1>Pond Filter Calculator</h1>
          <p className="page-intro">
            Enter your pond volume and fish stocking
            level to understand which filter capacity
            rating you should compare when choosing a
            filtration system.
          </p>
        </div>
      </section>

      <section className="calculator-section">
        <div className="shell calculator-layout">
          <PondFilterCalculator />

          <aside className="calculator-aside">
            <p className="eyebrow">WHY IT MATTERS</p>
            <h2>
              Filter capacity is more than pond
              volume.
            </h2>

            <p>
              A filter advertised for a particular
              pond size may have different capacities
              for ponds without fish, ordinary fish
              ponds and heavily stocked or koi ponds.
            </p>

            <p>
              PondStuff therefore does not apply a
              made-up universal multiplier. Instead,
              the calculator helps you identify the
              manufacturer rating that is relevant to
              your pond.
            </p>
          </aside>
        </div>
      </section>

      <section className="article-section">
        <div className="shell article-shell">
          <p className="eyebrow">PONDSTUFF GUIDE</p>
          <h2>
            How to choose the right filter capacity
          </h2>

          <p>
            Start with the most accurate estimate you
            can get of your pond&apos;s water volume.
            If you do not know it, use our{" "}
            <Link href="/tools/pond-volume-calculator">
              Pond Volume Calculator
            </Link>
            .
          </p>

          <h3>Check the correct capacity rating</h3>
          <p>
            Do not assume the largest capacity number
            printed on a filter applies to every pond.
            Look for the manufacturer&apos;s rating
            that matches your pond&apos;s fish
            stocking level.
          </p>

          <h3>Fish load matters</h3>
          <p>
            Fish increase the biological load placed
            on a filtration system. Koi and heavily
            stocked ponds therefore need to be
            assessed using the appropriate
            manufacturer rating rather than a
            fishless-pond capacity.
          </p>

          <h3>What about the pump?</h3>
          <p>
            Filter capacity and pump flow are related,
            but they are not the same measurement.
            Pump selection also needs to account for
            the filter&apos;s permitted flow range,
            pipework, restrictions and the height to
            which water must be lifted.
          </p>

          <h3>Use the result as a specification</h3>
          <p>
            The calculator is designed to give you a
            specification to compare against product
            information, rather than pretending every
            manufacturer rates its filters in exactly
            the same way.
          </p>
        </div>
      </section>
    </>
  );
}
