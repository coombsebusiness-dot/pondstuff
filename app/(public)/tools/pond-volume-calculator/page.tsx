import type { Metadata } from "next";
import PondVolumeCalculator from "./PondVolumeCalculator";

export const metadata: Metadata = {
  alternates: { canonical: "/tools/pond-volume-calculator" },
  title: "Pond Volume Calculator – Litres & UK Gallons",
  description:
    "Calculate your pond volume in litres and UK gallons. Works with rectangular, circular and irregular garden ponds.",
};

export default function PondVolumeCalculatorPage() {
  return (
    <>
      <section className="page-hero calculator-page-hero">
        <div className="shell narrow-shell">
          <p className="eyebrow">FREE POND CALCULATOR</p>
          <h1>Pond Volume Calculator</h1>
          <p className="page-intro">
            Enter your pond&apos;s measurements to estimate how much water it
            holds in litres and UK gallons.
          </p>
        </div>
      </section>

      <section className="calculator-section">
        <div className="shell calculator-layout">
          <PondVolumeCalculator />

          <aside className="calculator-aside">
            <p className="eyebrow">WHY IT MATTERS</p>
            <h2>Know your pond&apos;s real volume.</h2>
            <p>
              Pond volume affects equipment sizing, water treatments and many
              everyday maintenance decisions.
            </p>
            <p>
              Measure as accurately as you reasonably can. For ponds with an
              uneven shape or depth, the result should be treated as an
              estimate.
            </p>
          </aside>
        </div>
      </section>

      <section className="article-section">
        <div className="shell article-shell">
          <p className="eyebrow">PONDSTUFF GUIDE</p>
          <h2>How to calculate pond volume</h2>

          <p>
            Pond volume is simply an estimate of the amount of water contained
            within your pond. For a straightforward rectangular pond, volume
            can be calculated from its length, width and average depth.
          </p>

          <h3>Why use average depth?</h3>
          <p>
            Garden ponds rarely have perfectly flat bottoms. Shelves, planting
            areas and deeper sections mean that using only the deepest point
            can significantly overestimate the amount of water present.
          </p>

          <h3>What if my pond is an irregular shape?</h3>
          <p>
            Irregular ponds are harder to measure precisely. Our calculator
            applies an adjustment to a rectangular estimate to account for the
            missing corners and curved edges typical of natural-shaped garden
            ponds. The result should therefore be treated as an approximation.
          </p>

          <h3>Litres or gallons?</h3>
          <p>
            Pond equipment sold in the UK may quote capacities in litres or
            gallons. PondStuff displays both litres and imperial UK gallons so
            you can compare the result with the specifications provided for
            your equipment.
          </p>
        </div>
      </section>
    </>
  );
}
