import type { Metadata } from "next";
import PondLinerCalculator from "./PondLinerCalculator";

export const metadata: Metadata = {
  title: "Pond Liner Calculator – Calculate Liner Size",
  description:
    "Calculate the pond liner size you need from your pond length, width and maximum depth. Includes an adjustable overlap allowance.",
};

export default function PondLinerCalculatorPage() {
  return (
    <>
      <section className="page-hero calculator-page-hero">
        <div className="shell narrow-shell">
          <p className="eyebrow">FREE POND CALCULATOR</p>
          <h1>Pond Liner Calculator</h1>
          <p className="page-intro">
            Enter your pond&apos;s maximum dimensions to estimate the minimum
            liner length and width required.
          </p>
        </div>
      </section>

      <section className="calculator-section">
        <div className="shell calculator-layout">
          <PondLinerCalculator />

          <aside className="calculator-aside">
            <p className="eyebrow">BEFORE YOU BUY</p>
            <h2>Give your liner room to spare.</h2>
            <p>
              A pond liner needs to travel down one side of the pond, across
              the bottom and back up the other side. You also need spare liner
              around the edge so it can be secured properly.
            </p>
            <p>
              Measure the longest, widest and deepest points of the pond. For
              irregular designs, these maximum dimensions provide a practical
              starting point for estimating liner size.
            </p>
          </aside>
        </div>
      </section>

      <section className="article-section">
        <div className="shell article-shell">
          <p className="eyebrow">PONDSTUFF GUIDE</p>
          <h2>How pond liner size is calculated</h2>

          <p>
            A simple way to estimate pond liner dimensions is to add twice the
            maximum pond depth to both the maximum length and maximum width.
            An additional overlap allowance is then added at both ends.
          </p>

          <h3>Pond liner length</h3>
          <p>
            Maximum pond length + twice the maximum depth + twice the chosen
            overlap allowance.
          </p>

          <h3>Pond liner width</h3>
          <p>
            Maximum pond width + twice the maximum depth + twice the chosen
            overlap allowance.
          </p>

          <h3>Why include an overlap?</h3>
          <p>
            The extra material around the perimeter allows the liner to extend
            beyond the pond edge so it can be positioned and secured during
            installation. It also gives you some tolerance for measurement and
            construction variations.
          </p>

          <h3>What about shelves and unusual pond shapes?</h3>
          <p>
            Shelves, steep sides and complex shapes can make real liner
            requirements differ from a simple dimensional estimate. Treat the
            calculator as a planning guide and check your measurements and the
            liner manufacturer&apos;s installation guidance before ordering.
          </p>
        </div>
      </section>
    </>
  );
}
