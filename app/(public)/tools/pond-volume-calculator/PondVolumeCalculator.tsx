"use client";

import { useMemo, useState } from "react";

type Shape = "rectangle" | "circle" | "irregular";
type Unit = "metres" | "feet";

const LITRES_PER_CUBIC_METRE = 1000;
const LITRES_PER_CUBIC_FOOT = 28.316846592;
const LITRES_PER_UK_GALLON = 4.54609;

function formatNumber(value: number, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits,
  }).format(value);
}

export default function PondVolumeCalculator() {
  const [shape, setShape] = useState<Shape>("rectangle");
  const [unit, setUnit] = useState<Unit>("metres");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [diameter, setDiameter] = useState("");
  const [depth, setDepth] = useState("");

  const result = useMemo(() => {
    const d = Number(depth);

    if (!Number.isFinite(d) || d <= 0) {
      return null;
    }

    let cubicUnits = 0;

    if (shape === "circle") {
      const dia = Number(diameter);

      if (!Number.isFinite(dia) || dia <= 0) {
        return null;
      }

      const radius = dia / 2;
      cubicUnits = Math.PI * radius * radius * d;
    } else {
      const l = Number(length);
      const w = Number(width);

      if (
        !Number.isFinite(l) ||
        !Number.isFinite(w) ||
        l <= 0 ||
        w <= 0
      ) {
        return null;
      }

      cubicUnits = l * w * d;

      if (shape === "irregular") {
        cubicUnits *= 0.8;
      }
    }

    const litres =
      unit === "metres"
        ? cubicUnits * LITRES_PER_CUBIC_METRE
        : cubicUnits * LITRES_PER_CUBIC_FOOT;

    const gallons = litres / LITRES_PER_UK_GALLON;

    return {
      litres,
      gallons,
    };
  }, [shape, unit, length, width, diameter, depth]);

  return (
    <div className="calculator-card">
      <div className="calculator-control">
        <span className="calculator-label">Pond shape</span>

        <div className="choice-row">
          <button
            type="button"
            className={shape === "rectangle" ? "choice active" : "choice"}
            onClick={() => setShape("rectangle")}
          >
            Rectangular
          </button>

          <button
            type="button"
            className={shape === "circle" ? "choice active" : "choice"}
            onClick={() => setShape("circle")}
          >
            Circular
          </button>

          <button
            type="button"
            className={shape === "irregular" ? "choice active" : "choice"}
            onClick={() => setShape("irregular")}
          >
            Irregular
          </button>
        </div>
      </div>

      <div className="calculator-control">
        <span className="calculator-label">Measurements</span>

        <div className="choice-row">
          <button
            type="button"
            className={unit === "metres" ? "choice active" : "choice"}
            onClick={() => setUnit("metres")}
          >
            Metres
          </button>

          <button
            type="button"
            className={unit === "feet" ? "choice active" : "choice"}
            onClick={() => setUnit("feet")}
          >
            Feet
          </button>
        </div>
      </div>

      <div className="measurement-grid">
        {shape === "circle" ? (
          <label>
            <span>Diameter ({unit === "metres" ? "m" : "ft"})</span>
            <input
              inputMode="decimal"
              type="number"
              min="0"
              step="any"
              value={diameter}
              onChange={(event) => setDiameter(event.target.value)}
              placeholder="e.g. 3"
            />
          </label>
        ) : (
          <>
            <label>
              <span>Length ({unit === "metres" ? "m" : "ft"})</span>
              <input
                inputMode="decimal"
                type="number"
                min="0"
                step="any"
                value={length}
                onChange={(event) => setLength(event.target.value)}
                placeholder="e.g. 3"
              />
            </label>

            <label>
              <span>Width ({unit === "metres" ? "m" : "ft"})</span>
              <input
                inputMode="decimal"
                type="number"
                min="0"
                step="any"
                value={width}
                onChange={(event) => setWidth(event.target.value)}
                placeholder="e.g. 2"
              />
            </label>
          </>
        )}

        <label>
          <span>Average depth ({unit === "metres" ? "m" : "ft"})</span>
          <input
            inputMode="decimal"
            type="number"
            min="0"
            step="any"
            value={depth}
            onChange={(event) => setDepth(event.target.value)}
            placeholder={unit === "metres" ? "e.g. 0.8" : "e.g. 2.5"}
          />
        </label>
      </div>

      {shape === "irregular" && (
        <p className="calculator-note">
          Irregular pond estimates use 80% of the equivalent rectangular
          volume to allow approximately for curved edges and missing corners.
        </p>
      )}

      <div className="calculator-result" aria-live="polite">
        {result ? (
          <>
            <p>Estimated pond volume</p>

            <strong>{formatNumber(result.litres)} litres</strong>

            <span>
              approximately {formatNumber(result.gallons)} UK gallons
            </span>
          </>
        ) : (
          <>
            <p>Estimated pond volume</p>
            <strong>Enter your measurements</strong>
            <span>Your result will appear here.</span>
          </>
        )}
      </div>
    </div>
  );
}
