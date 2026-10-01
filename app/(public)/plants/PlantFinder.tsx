"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type PlantFinderPlant = {
  id: string;
  common_name: string;
  scientific_name: string | null;
  slug: string;
  plant_type: string | null;
  summary: string | null;
  min_planting_depth_cm: number | null;
  max_planting_depth_cm: number | null;
  sunlight: string | null;
  is_native_uk: boolean | null;
  is_oxygenating: boolean;
  is_wildlife_friendly: boolean;
  is_small_pond_suitable: boolean;
  image_url: string | null;
  image_alt: string | null;
};

type PlantFinderProps = {
  plants: PlantFinderPlant[];
};

const typeLabels: Record<string, string> = {
  marginal: "Marginal",
  oxygenating: "Oxygenating",
  floating: "Floating",
  "water-lily": "Water lily",
  "deep-water": "Deep-water",
  bog: "Bog",
};

const sunlightLabels: Record<string, string> = {
  "full-sun": "Full sun",
  "full-sun-partial-shade":
    "Full sun / partial shade",
  "partial-shade": "Partial shade",
  shade: "Shade",
};

function depthLabel(
  min: number | null,
  max: number | null,
) {
  if (min != null && max != null) {
    return min === max
      ? `${min} cm`
      : `${min}–${max} cm`;
  }

  if (min != null) {
    return `From ${min} cm`;
  }

  if (max != null) {
    return `Up to ${max} cm`;
  }

  return null;
}

export default function PlantFinder({
  plants,
}: PlantFinderProps) {
  const [search, setSearch] = useState("");
  const [plantType, setPlantType] =
    useState("");
  const [sunlight, setSunlight] =
    useState("");
  const [nativeOnly, setNativeOnly] =
    useState(false);
  const [
    oxygenatingOnly,
    setOxygenatingOnly,
  ] = useState(false);
  const [
    wildlifeOnly,
    setWildlifeOnly,
  ] = useState(false);
  const [
    smallPondOnly,
    setSmallPondOnly,
  ] = useState(false);

  const filteredPlants = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return plants.filter((plant) => {
      if (query) {
        const haystack = [
          plant.common_name,
          plant.scientific_name ?? "",
          plant.summary ?? "",
        ]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(query)) {
          return false;
        }
      }

      if (
        plantType &&
        plant.plant_type !== plantType
      ) {
        return false;
      }

      if (
        sunlight &&
        plant.sunlight !== sunlight
      ) {
        return false;
      }

      if (
        nativeOnly &&
        plant.is_native_uk !== true
      ) {
        return false;
      }

      if (
        oxygenatingOnly &&
        !plant.is_oxygenating
      ) {
        return false;
      }

      if (
        wildlifeOnly &&
        !plant.is_wildlife_friendly
      ) {
        return false;
      }

      if (
        smallPondOnly &&
        !plant.is_small_pond_suitable
      ) {
        return false;
      }

      return true;
    });
  }, [
    plants,
    search,
    plantType,
    sunlight,
    nativeOnly,
    oxygenatingOnly,
    wildlifeOnly,
    smallPondOnly,
  ]);

  function clearFilters() {
    setSearch("");
    setPlantType("");
    setSunlight("");
    setNativeOnly(false);
    setOxygenatingOnly(false);
    setWildlifeOnly(false);
    setSmallPondOnly(false);
  }

  const filtersActive =
    Boolean(search) ||
    Boolean(plantType) ||
    Boolean(sunlight) ||
    nativeOnly ||
    oxygenatingOnly ||
    wildlifeOnly ||
    smallPondOnly;

  return (
    <div className="plant-finder">
      <div className="plant-finder-panel">
        <div className="plant-finder-search">
          <label htmlFor="plant-search">
            Search plants
          </label>

          <input
            id="plant-search"
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by common or scientific name…"
          />
        </div>

        <div className="plant-filter-selects">
          <label>
            <span>Plant type</span>
            <select
              value={plantType}
              onChange={(event) =>
                setPlantType(
                  event.target.value,
                )
              }
            >
              <option value="">
                All plant types
              </option>

              {Object.entries(
                typeLabels,
              ).map(([value, label]) => (
                <option
                  value={value}
                  key={value}
                >
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Sunlight</span>
            <select
              value={sunlight}
              onChange={(event) =>
                setSunlight(
                  event.target.value,
                )
              }
            >
              <option value="">
                Any sunlight
              </option>

              {Object.entries(
                sunlightLabels,
              ).map(([value, label]) => (
                <option
                  value={value}
                  key={value}
                >
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="plant-filter-checks">
          <label>
            <input
              type="checkbox"
              checked={nativeOnly}
              onChange={(event) =>
                setNativeOnly(
                  event.target.checked,
                )
              }
            />
            <span>UK native</span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={oxygenatingOnly}
              onChange={(event) =>
                setOxygenatingOnly(
                  event.target.checked,
                )
              }
            />
            <span>Oxygenating</span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={wildlifeOnly}
              onChange={(event) =>
                setWildlifeOnly(
                  event.target.checked,
                )
              }
            />
            <span>Wildlife friendly</span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={smallPondOnly}
              onChange={(event) =>
                setSmallPondOnly(
                  event.target.checked,
                )
              }
            />
            <span>Small ponds</span>
          </label>
        </div>

        <div className="plant-filter-footer">
          <strong>
            {filteredPlants.length}{" "}
            {filteredPlants.length === 1
              ? "plant"
              : "plants"}
          </strong>

          {filtersActive && (
            <button
              type="button"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {filteredPlants.length > 0 ? (
        <div className="plant-grid">
          {filteredPlants.map((plant) => {
            const depth = depthLabel(
              plant.min_planting_depth_cm,
              plant.max_planting_depth_cm,
            );

            return (
              <Link
                href={`/plants/${plant.slug}`}
                className="plant-card"
                key={plant.id}
              >
                <div className="plant-card-image">
                  {plant.image_url ? (
                    <img
                      src={plant.image_url}
                      alt={
                        plant.image_alt ||
                        plant.common_name
                      }
                    />
                  ) : (
                    <div className="plant-card-placeholder">
                      <span>✦</span>
                    </div>
                  )}
                </div>

                <div className="plant-card-body">
                  <div className="plant-card-topline">
                    {plant.plant_type && (
                      <span className="plant-type-badge">
                        {typeLabels[
                          plant.plant_type
                        ] ??
                          plant.plant_type}
                      </span>
                    )}

                    {plant.is_native_uk ===
                      true && (
                      <span className="plant-native-badge">
                        UK native
                      </span>
                    )}
                  </div>

                  <h2>
                    {plant.common_name}
                  </h2>

                  {plant.scientific_name && (
                    <p className="plant-scientific">
                      <em>
                        {
                          plant.scientific_name
                        }
                      </em>
                    </p>
                  )}

                  {plant.summary && (
                    <p className="plant-card-summary">
                      {plant.summary}
                    </p>
                  )}

                  <div className="plant-card-facts">
                    {depth && (
                      <span>
                        <strong>
                          Depth
                        </strong>
                        {depth}
                      </span>
                    )}

                    {plant.sunlight && (
                      <span>
                        <strong>
                          Light
                        </strong>
                        {sunlightLabels[
                          plant.sunlight
                        ] ??
                          plant.sunlight}
                      </span>
                    )}
                  </div>

                  <div className="plant-card-tags">
                    {plant.is_oxygenating && (
                      <span>
                        Oxygenating
                      </span>
                    )}

                    {plant.is_wildlife_friendly && (
                      <span>
                        Wildlife
                      </span>
                    )}

                    {plant.is_small_pond_suitable && (
                      <span>
                        Small ponds
                      </span>
                    )}
                  </div>

                  <strong className="plant-card-link">
                    View plant profile →
                  </strong>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="plant-empty">
          <p className="eyebrow">
            NO MATCHES
          </p>

          <h2>
            No plants match those filters.
          </h2>

          <p>
            Try broadening your search or
            clearing some filters.
          </p>

          <button
            type="button"
            className="button button-primary"
            onClick={clearFilters}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
