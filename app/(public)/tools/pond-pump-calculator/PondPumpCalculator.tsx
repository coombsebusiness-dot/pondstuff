"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type PondType = "general" | "fish";
type Setup = "circulation" | "waterfall";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 0,
  }).format(value);
}

export default function PondPumpCalculator() {
  const [volume, setVolume] = useState("");
  const [pondType, setPondType] =
    useState<PondType>("general");
  const [setup, setSetup] =
    useState<Setup>("circulation");
  const [headHeight, setHeadHeight] = useState("");

  const result = useMemo(() => {
    const litres = Number(volume);

    if (!Number.isFinite(litres) || litres <= 0) {
      return null;
    }

    const baselineFlow = litres * 0.5;

    const head =
      setup === "waterfall"
        ? Number(headHeight)
        : 0;

    const validHead =
      Number.isFinite(head) && head > 0
        ? head
        : null;

    return {
      litres,
      baselineFlow,
      head: validHead,
    };
  }, [volume, setup, headHeight]);

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
          Don&apos;t know the volume?{" "}
          <Link href="/tools/pond-volume-calculator">
            Use the Pond Volume Calculator
          </Link>
          .
        </p>
      </div>

      <div className="calculator-control">
        <span className="calculator-label">
          Pond type
        </span>

        <div className="choice-row">
          <button
            type="button"
            className={
              pondType === "general"
                ? "choice active"
                : "choice"
            }
            onClick={() => setPondType("general")}
          >
            General / wildlife pond
          </button>

          <button
            type="button"
            className={
              pondType === "fish"
                ? "choice active"
                : "choice"
            }
            onClick={() => setPondType("fish")}
          >
            Fed fish / koi pond
          </button>
        </div>
      </div>

      <div className="calculator-control">
        <span className="calculator-label">
          What will the pump do?
        </span>

        <div className="choice-row">
          <button
            type="button"
            className={
              setup === "circulation"
                ? "choice active"
                : "choice"
            }
            onClick={() =>
              setSetup("circulation")
            }
          >
            Pond circulation
          </button>

          <button
            type="button"
            className={
              setup === "waterfall"
                ? "choice active"
                : "choice"
            }
            onClick={() =>
              setSetup("waterfall")
            }
          >
            Waterfall / raised return
          </button>
        </div>
      </div>

      {setup === "waterfall" && (
        <div className="calculator-control">
          <span className="calculator-label">
            Vertical head height
          </span>

          <div className="measurement-grid">
            <label>
              <span>Height above pond surface (metres)</span>
              <input
                inputMode="decimal"
                type="number"
                min="0"
                step="any"
                value={headHeight}
                onChange={(event) =>
                  setHeadHeight(event.target.value)
                }
                placeholder="e.g. 1.2"
              />
            </label>
          </div>

          <p className="calculator-note">
            Measure vertically from the pond water
            surface to the highest point the pump must
            deliver water to. Pipework and fittings
            create additional resistance that this
            simple measurement does not include.
          </p>
        </div>
      )}

      <div
        className="calculator-result"
        aria-live="polite"
      >
        {result ? (
          <>
            <p>
              Baseline circulation target
            </p>

            <strong>
              Around{" "}
              {formatNumber(result.baselineFlow)} L/h
            </strong>

            <span>
              based on circulating approximately half
              of the pond&apos;s volume per hour
            </span>
          </>
        ) : (
          <>
            <p>Pump sizing guidance</p>
            <strong>Enter your pond volume</strong>
            <span>
              Your baseline flow target will appear
              here.
            </span>
          </>
        )}
      </div>

      {result && (
        <div className="calculator-control">
          <span className="calculator-label">
            What this result means
          </span>

          {pondType === "general" ? (
            <p>
              For general pond circulation, this gives
              you a useful starting flow target before
              accounting for the real installation.
            </p>
          ) : (
            <>
              <p>
                <strong>
                  Fish or koi pond:
                </strong>{" "}
                do not use this baseline circulation
                figure by itself to select the complete
                pump and filtration system.
              </p>

              <p className="calculator-note">
                Fish stocking, feeding and the
                filter&apos;s permitted flow range all
                matter. Check the requirements of your
                filtration system as well.
              </p>

              <p className="calculator-note">
                <Link href="/tools/pond-filter-calculator">
                  Use the Pond Filter Calculator
                </Link>{" "}
                for additional filtration guidance.
              </p>
            </>
          )}

          {setup === "waterfall" && (
            <>
              {result.head ? (
                <p>
                  <strong>
                    Vertical head: {result.head} m.
                  </strong>{" "}
                  Your chosen pump needs to deliver the
                  required flow at this height, plus
                  the additional resistance created by
                  hose, pipework, bends, valves,
                  filters and other fittings.
                </p>
              ) : (
                <p className="calculator-note">
                  Enter the waterfall&apos;s vertical
                  head height to make the result more
                  useful.
                </p>
              )}

              <p className="calculator-note">
                Do not compare the required flow only
                with the pump&apos;s headline maximum
                L/h figure. Check the
                manufacturer&apos;s performance curve
                at your actual head.
              </p>
            </>
          )}

          <p className="calculator-note">
            This calculator gives a planning target,
            not a universal pump model recommendation.
            Always check the pump manufacturer&apos;s
            flow curve and the requirements of any
            filter or UV equipment in the system.
          </p>
        </div>
      )}
    </div>
  );
}
