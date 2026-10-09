"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PondType =
  | "no-fish"
  | "light-fish"
  | "normal-fish"
  | "koi";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PondFilterCalculator() {
  const [volume, setVolume] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const incoming = params.get("volume");

    if (incoming === null || incoming.trim() === "") {
      return;
    }

    const litres = Number(incoming);

    if (
      Number.isFinite(litres) &&
      litres > 0 &&
      litres <= 100_000_000
    ) {
      setVolume(String(litres));
    }
  }, []);

  const [pondType, setPondType] =
    useState<PondType>("normal-fish");
  const [waterfall, setWaterfall] = useState(false);
  const [sunny, setSunny] = useState(false);

  const result = useMemo(() => {
    const litres = Number(volume);

    if (!Number.isFinite(litres) || litres <= 0) {
      return null;
    }

    const ratings: Record<
      PondType,
      {
        label: string;
        rating: string;
        explanation: string;
      }
    > = {
      "no-fish": {
        label: "Fishless or wildlife pond",
        rating: "no-fish pond capacity",
        explanation:
          "Compare your pond volume with the manufacturer's stated capacity for a pond without fish.",
      },
      "light-fish": {
        label: "Lightly stocked fish pond",
        rating: "fish-pond capacity",
        explanation:
          "Use the manufacturer's fish-pond rating rather than relying on the larger headline or no-fish capacity.",
      },
      "normal-fish": {
        label: "Normally stocked fish pond",
        rating: "fish-pond capacity",
        explanation:
          "Choose a filter whose stated fish-pond capacity is at least as large as your actual pond volume.",
      },
      koi: {
        label: "Koi or heavily stocked pond",
        rating: "koi / high-fish-stock capacity",
        explanation:
          "Use the manufacturer's koi or high-fish-stock rating where one is supplied. Do not size the filter from its no-fish headline capacity.",
      },
    };

    return {
      litres,
      ...ratings[pondType],
    };
  }, [volume, pondType]);

  return (
    <div className="calculator-card">
      <div className="calculator-control">
        <span className="calculator-label">
          Pond volume
        </span>

        <div className="measurement-grid">
          <label>
            <span>Volume (litres)</span>
            <input
              inputMode="decimal"
              type="number"
              min="0"
              step="any"
              value={volume}
              onChange={(event) =>
                setVolume(event.target.value)
              }
              placeholder="e.g. 5000"
            />
          </label>
        </div>

        <p className="calculator-note">
          Not sure of your pond&apos;s volume?{" "}
          <Link href="/tools/pond-volume-calculator">
            Use the Pond Volume Calculator
          </Link>
          .
        </p>
      </div>

      <div className="calculator-control">
        <span className="calculator-label">
          What type of pond do you have?
        </span>

        <div className="choice-row">
          <button
            type="button"
            className={
              pondType === "no-fish"
                ? "choice active"
                : "choice"
            }
            onClick={() => setPondType("no-fish")}
          >
            No fish
          </button>

          <button
            type="button"
            className={
              pondType === "light-fish"
                ? "choice active"
                : "choice"
            }
            onClick={() => setPondType("light-fish")}
          >
            Light fish stock
          </button>

          <button
            type="button"
            className={
              pondType === "normal-fish"
                ? "choice active"
                : "choice"
            }
            onClick={() =>
              setPondType("normal-fish")
            }
          >
            Normal fish stock
          </button>

          <button
            type="button"
            className={
              pondType === "koi"
                ? "choice active"
                : "choice"
            }
            onClick={() => setPondType("koi")}
          >
            Koi / heavy stock
          </button>
        </div>
      </div>

      <div className="calculator-control">
        <span className="calculator-label">
          Pond setup
        </span>

        <div className="choice-row">
          <button
            type="button"
            className={
              waterfall
                ? "choice active"
                : "choice"
            }
            aria-pressed={waterfall}
            onClick={() =>
              setWaterfall((current) => !current)
            }
          >
            Waterfall / raised return
          </button>

          <button
            type="button"
            className={
              sunny ? "choice active" : "choice"
            }
            aria-pressed={sunny}
            onClick={() =>
              setSunny((current) => !current)
            }
          >
            Lots of direct sun
          </button>
        </div>

        <p className="calculator-note">
          These factors do not create a universal
          filter-size multiplier, but they can affect
          the equipment and setup your pond needs.
        </p>
      </div>

      <div
        className="calculator-result"
        aria-live="polite"
      >
        {result ? (
          <>
            <p>Recommended filter rating to compare</p>

            <strong>
              At least{" "}
              {formatNumber(result.litres)} litres
            </strong>

            <span>
              using the manufacturer&apos;s{" "}
              <b>{result.rating}</b>
            </span>
          </>
        ) : (
          <>
            <p>Filter sizing guidance</p>
            <strong>Enter your pond volume</strong>
            <span>
              Your recommendation will appear here.
            </span>
          </>
        )}
      </div>

      {result && (
        <div className="calculator-control">
          <span className="calculator-label">
            What this means
          </span>

          <p>
            <strong>{result.label}:</strong>{" "}
            {result.explanation}
          </p>

          {waterfall && (
            <p className="calculator-note">
              Your waterfall or raised return adds
              resistance to the system. Pump selection
              should account for the actual delivery
              head, pipework and the filter&apos;s
              permitted flow range.
            </p>
          )}

          {sunny && (
            <p className="calculator-note">
              A pond receiving substantial direct
              sunlight may experience stronger algae
              growth. Filtration is only one part of
              managing the pond, so avoid simply
              increasing filter size as a substitute
              for addressing the wider pond
              conditions.
            </p>
          )}

          <p className="calculator-note">
            Manufacturer ratings are not standardised.
            Always check the rating for your particular
            pond type and the manufacturer&apos;s
            recommended pump flow before buying.
          </p>
        </div>
      )}
    </div>
  );
}
