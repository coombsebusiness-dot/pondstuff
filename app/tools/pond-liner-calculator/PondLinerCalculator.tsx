"use client";

import { useMemo, useState } from "react";

type Unit = "metres" | "feet";

function formatMeasurement(value: number) {
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 2,
  }).format(value);
}

export default function PondLinerCalculator() {
  const [unit, setUnit] = useState<Unit>("metres");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState("");
  const [overlap, setOverlap] = useState("0.5");

  const result = useMemo(() => {
    const l = Number(length);
    const w = Number(width);
    const d = Number(depth);
    const o = Number(overlap);

    if (
      !Number.isFinite(l) ||
      !Number.isFinite(w) ||
      !Number.isFinite(d) ||
      !Number.isFinite(o) ||
      l <= 0 ||
      w <= 0 ||
      d <= 0 ||
      o < 0
    ) {
      return null;
    }

    const linerLength = l + d * 2 + o * 2;
    const linerWidth = w + d * 2 + o * 2;
    const area = linerLength * linerWidth;

    return {
      linerLength,
      linerWidth,
      area,
    };
  }, [length, width, depth, overlap]);

  function changeUnit(nextUnit: Unit) {
    if (nextUnit === unit) return;

    const factor =
      unit === "metres" && nextUnit === "feet"
        ? 3.28084
        : 0.3048;

    const convert = (value: string) => {
      if (!value) return "";

      const number = Number(value);

      if (!Number.isFinite(number)) return value;

      return String(Math.round(number * factor * 100) / 100);
    };

    setLength(convert(length));
    setWidth(convert(width));
    setDepth(convert(depth));
    setOverlap(convert(overlap));
    setUnit(nextUnit);
  }

  const shortUnit = unit === "metres" ? "m" : "ft";
  const areaUnit = unit === "metres" ? "m²" : "ft²";

  return (
    <div className="calculator-card">
      <div className="calculator-control">
        <span className="calculator-label">Measurements</span>

        <div className="choice-row">
          <button
            type="button"
            className={unit === "metres" ? "choice active" : "choice"}
            onClick={() => changeUnit("metres")}
          >
            Metres
          </button>

          <button
            type="button"
            className={unit === "feet" ? "choice active" : "choice"}
            onClick={() => changeUnit("feet")}
          >
            Feet
          </button>
        </div>
      </div>

      <div className="measurement-grid liner-measurement-grid">
        <label>
          <span>Maximum length ({shortUnit})</span>
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
          <span>Maximum width ({shortUnit})</span>
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

        <label>
          <span>Maximum depth ({shortUnit})</span>
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

        <label>
          <span>Edge overlap ({shortUnit})</span>
          <input
            inputMode="decimal"
            type="number"
            min="0"
            step="any"
            value={overlap}
            onChange={(event) => setOverlap(event.target.value)}
          />
        </label>
      </div>

      <p className="calculator-note">
        The overlap is added to both ends of each liner dimension. You can
        change the default allowance to suit your project.
      </p>

      <div className="calculator-result" aria-live="polite">
        {result ? (
          <>
            <p>Estimated minimum liner size</p>

            <strong>
              {formatMeasurement(result.linerLength)} {shortUnit} ×{" "}
              {formatMeasurement(result.linerWidth)} {shortUnit}
            </strong>

            <span>
              approximately {formatMeasurement(result.area)} {areaUnit} of
              liner
            </span>
          </>
        ) : (
          <>
            <p>Estimated minimum liner size</p>
            <strong>Enter your measurements</strong>
            <span>Your result will appear here.</span>
          </>
        )}
      </div>
    </div>
  );
}
