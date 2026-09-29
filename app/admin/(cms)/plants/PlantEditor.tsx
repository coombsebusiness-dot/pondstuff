"use client";

import {
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import {
  createPlant,
  deletePlant,
  generatePlantDraft,
  updatePlant,
} from "./actions";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function safeFileName(name: string) {
  const extension =
    name.split(".").pop()?.toLowerCase() ||
    "jpg";

  const base = name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

  return `${base || "plant"}-${Date.now()}.${extension}`;
}

function numberValue(
  value: number | null | undefined,
) {
  return value == null
    ? ""
    : String(value);
}

type InitialPlant = {
  id: string;
  common_name: string;
  scientific_name: string | null;
  slug: string;
  plant_type: string | null;
  summary: string | null;
  description: string | null;
  min_planting_depth_cm: number | null;
  max_planting_depth_cm: number | null;
  min_water_depth_cm: number | null;
  max_water_depth_cm: number | null;
  max_height_cm: number | null;
  max_spread_cm: number | null;
  sunlight: string | null;
  flowering_months: string[];
  is_native_uk: boolean | null;
  is_oxygenating: boolean | null;
  is_wildlife_friendly: boolean | null;
  is_small_pond_suitable: boolean | null;
  hardiness: string | null;
  growth_habit: string | null;
  planting_method: string | null;
  winter_behaviour: string | null;
  propagation: string | null;
  maintenance_notes: string | null;
  legal_status_uk: string | null;
  legal_status_notes: string | null;
  care_level: string | null;
  image_url: string | null;
  image_alt: string | null;
  image_credit: string | null;
  seo_title: string | null;
  meta_description: string | null;
  research_sources: Array<{
    title: string;
    url: string;
  }>;
  status: string;
  is_featured: boolean;
  published_at: string | null;
};

type PlantEditorProps = {
  initialPlant?: InitialPlant;
};

export default function PlantEditor({
  initialPlant,
}: PlantEditorProps) {
  const imageInputRef =
    useRef<HTMLInputElement>(null);

  // ----------------------------------------------------------
  // AI
  // ----------------------------------------------------------

  const [aiPlantName, setAiPlantName] =
    useState("");

  const [aiGenerating, setAiGenerating] =
    useState(false);

  const [aiMessage, setAiMessage] =
    useState("");

  const [
    researchSources,
    setResearchSources,
  ] = useState<
    Array<{
      title: string;
      url: string;
    }>
  >(
    Array.isArray(initialPlant?.research_sources)
      ? initialPlant.research_sources
      : [],
  );

  // ----------------------------------------------------------
  // Identity
  // ----------------------------------------------------------

  const [commonName, setCommonName] =
    useState(initialPlant?.common_name ?? "");

  const [
    scientificName,
    setScientificName,
  ] = useState(initialPlant?.scientific_name ?? "");

  const [slug, setSlug] =
    useState(initialPlant?.slug ?? "");

  const [plantType, setPlantType] =
    useState(initialPlant?.plant_type ?? "");

  const [summary, setSummary] =
    useState(initialPlant?.summary ?? "");

  const [description, setDescription] =
    useState(initialPlant?.description ?? "");

  // ----------------------------------------------------------
  // Growing
  // ----------------------------------------------------------

  const [
    minPlantingDepth,
    setMinPlantingDepth,
  ] = useState(numberValue(initialPlant?.min_planting_depth_cm));

  const [
    maxPlantingDepth,
    setMaxPlantingDepth,
  ] = useState(numberValue(initialPlant?.max_planting_depth_cm));

  const [
    minWaterDepth,
    setMinWaterDepth,
  ] = useState(numberValue(initialPlant?.min_water_depth_cm));

  const [
    maxWaterDepth,
    setMaxWaterDepth,
  ] = useState(numberValue(initialPlant?.max_water_depth_cm));

  const [maxHeight, setMaxHeight] =
    useState(numberValue(initialPlant?.max_height_cm));

  const [maxSpread, setMaxSpread] =
    useState(numberValue(initialPlant?.max_spread_cm));

  const [sunlight, setSunlight] =
    useState(initialPlant?.sunlight ?? "");

  const [careLevel, setCareLevel] =
    useState(initialPlant?.care_level ?? "");

  const [hardiness, setHardiness] =
    useState(initialPlant?.hardiness ?? "");

  const [growthHabit, setGrowthHabit] =
    useState(initialPlant?.growth_habit ?? "");

  const [plantingMethod, setPlantingMethod] =
    useState(initialPlant?.planting_method ?? "");

  const [
    winterBehaviour,
    setWinterBehaviour,
  ] = useState(
    initialPlant?.winter_behaviour ?? "",
  );

  const [propagation, setPropagation] =
    useState(initialPlant?.propagation ?? "");

  const [
    maintenanceNotes,
    setMaintenanceNotes,
  ] = useState(
    initialPlant?.maintenance_notes ?? "",
  );

  const [
    legalStatusUk,
    setLegalStatusUk,
  ] = useState(
    initialPlant?.legal_status_uk ?? "",
  );

  const [
    legalStatusNotes,
    setLegalStatusNotes,
  ] = useState(
    initialPlant?.legal_status_notes ?? "",
  );

  const [
    floweringMonths,
    setFloweringMonths,
  ] = useState<string[]>(
      initialPlant?.flowering_months ?? [],
    );

  // ----------------------------------------------------------
  // Suitability
  // ----------------------------------------------------------

  const [nativeUk, setNativeUk] =
    useState(
      initialPlant?.is_native_uk === true
        ? "yes"
        : initialPlant?.is_native_uk === false
          ? "no"
          : "unknown",
    );

  const [
    isOxygenating,
    setIsOxygenating,
  ] = useState(
    initialPlant?.is_oxygenating === true
      ? "yes"
      : initialPlant?.is_oxygenating === false
        ? "no"
        : "unknown",
  );

  const [
    isWildlifeFriendly,
    setIsWildlifeFriendly,
  ] = useState(
    initialPlant?.is_wildlife_friendly === true
      ? "yes"
      : initialPlant?.is_wildlife_friendly === false
        ? "no"
        : "unknown",
  );

  const [
    isSmallPondSuitable,
    setIsSmallPondSuitable,
  ] = useState(
    initialPlant?.is_small_pond_suitable === true
      ? "yes"
      : initialPlant?.is_small_pond_suitable === false
        ? "no"
        : "unknown",
  );

  // ----------------------------------------------------------
  // SEO / image
  // ----------------------------------------------------------

  const [seoTitle, setSeoTitle] =
    useState(initialPlant?.seo_title ?? "");

  const [
    metaDescription,
    setMetaDescription,
  ] = useState(initialPlant?.meta_description ?? "");

  const [imageUrl, setImageUrl] =
    useState(initialPlant?.image_url ?? "");

  const [imageAlt, setImageAlt] =
    useState(initialPlant?.image_alt ?? "");

  const [imageCredit, setImageCredit] =
    useState(initialPlant?.image_credit ?? "");

  const [imageUploading, setImageUploading] =
    useState(false);

  const [imageMessage, setImageMessage] =
    useState("");

  // ----------------------------------------------------------
  // AI generation
  // ----------------------------------------------------------

  async function generateWithAI() {
    const requestedName =
      aiPlantName.trim() ||
      commonName.trim();

    if (!requestedName) {
      setAiMessage(
        "Enter a plant name first.",
      );
      return;
    }

    setAiGenerating(true);
    setAiMessage("");
    setResearchSources([]);

    try {
      const plant =
        await generatePlantDraft(
          requestedName,
        );

      setCommonName(
        plant.commonName ?? "",
      );

      setScientificName(
        plant.scientificName ?? "",
      );

      setSlug(
        plant.slug ?? "",
      );

      setPlantType(
        plant.plantType ?? "",
      );

      setSummary(
        plant.summary ?? "",
      );

      setDescription(
        plant.description ?? "",
      );

      setMinPlantingDepth(
        numberValue(
          plant.minPlantingDepthCm,
        ),
      );

      setMaxPlantingDepth(
        numberValue(
          plant.maxPlantingDepthCm,
        ),
      );

      setMinWaterDepth(
        numberValue(
          plant.minWaterDepthCm,
        ),
      );

      setMaxWaterDepth(
        numberValue(
          plant.maxWaterDepthCm,
        ),
      );

      setMaxHeight(
        numberValue(
          plant.maxHeightCm,
        ),
      );

      setMaxSpread(
        numberValue(
          plant.maxSpreadCm,
        ),
      );

      setSunlight(
        plant.sunlight ?? "",
      );

      setCareLevel(
        plant.careLevel ?? "",
      );

      setHardiness(
        plant.hardiness ?? "",
      );

      setGrowthHabit(
        plant.growthHabit ?? "",
      );

      setPlantingMethod(
        plant.plantingMethod ?? "",
      );

      setWinterBehaviour(
        plant.winterBehaviour ?? "",
      );

      setPropagation(
        plant.propagation ?? "",
      );

      setMaintenanceNotes(
        plant.maintenanceNotes ?? "",
      );

      setLegalStatusUk(
        plant.legalStatusUk ?? "",
      );

      setLegalStatusNotes(
        plant.legalStatusNotes ?? "",
      );

      setFloweringMonths(
        Array.isArray(
          plant.floweringMonths,
        )
          ? plant.floweringMonths.filter(
              (month) =>
                months.includes(month),
            )
          : [],
      );

      setNativeUk(
        plant.isNativeUk === true
          ? "yes"
          : plant.isNativeUk === false
            ? "no"
            : "unknown",
      );

      setIsOxygenating(
        plant.isOxygenating === true
          ? "yes"
          : plant.isOxygenating === false
            ? "no"
            : "unknown",
      );

      setIsWildlifeFriendly(
        plant.isWildlifeFriendly === true
          ? "yes"
          : plant.isWildlifeFriendly === false
            ? "no"
            : "unknown",
      );

      setIsSmallPondSuitable(
        plant.isSmallPondSuitable === true
          ? "yes"
          : plant.isSmallPondSuitable === false
            ? "no"
            : "unknown",
      );

      setImageAlt(
        plant.imageAlt ?? "",
      );

      setSeoTitle(
        plant.seoTitle ?? "",
      );

      setMetaDescription(
        plant.metaDescription ?? "",
      );

      setResearchSources(
        plant.researchSources ?? [],
      );

      setAiMessage(
        "Plant draft generated. Review the researched fields before saving or publishing.",
      );
    } catch (error) {
      setAiMessage(
        error instanceof Error
          ? error.message
          : "Plant generation failed.",
      );
    } finally {
      setAiGenerating(false);
    }
  }

  // ----------------------------------------------------------
  // Image upload
  // ----------------------------------------------------------

  async function uploadPlantImage(
    file: File,
  ) {
    if (!file.type.startsWith("image/")) {
      setImageMessage(
        "Please choose an image file.",
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageMessage(
        "Please use an image smaller than 10 MB.",
      );
      return;
    }

    setImageUploading(true);
    setImageMessage("");

    try {
      const supabase =
        createClient();

      const path =
        `plants/${safeFileName(
          file.name,
        )}`;

      const { error } =
        await supabase.storage
          .from("article-images")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          });

      if (error) {
        throw error;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("article-images")
        .getPublicUrl(path);

      setImageUrl(
        publicUrlData.publicUrl,
      );

      setImageMessage(
        "Plant image uploaded.",
      );
    } catch (error) {
      setImageMessage(
        error instanceof Error
          ? error.message
          : "Plant image upload failed.",
      );
    } finally {
      setImageUploading(false);

      if (
        imageInputRef.current
      ) {
        imageInputRef.current.value =
          "";
      }
    }
  }

  function toggleFloweringMonth(
    month: string,
  ) {
    setFloweringMonths(
      (current) =>
        current.includes(month)
          ? current.filter(
              (item) =>
                item !== month,
            )
          : [...current, month],
    );
  }

  return (
    <form
      action={
        initialPlant
          ? updatePlant.bind(
              null,
              initialPlant.id,
            )
          : createPlant
      }
      className="admin-editor-form"
    >
      <input
        type="hidden"
        name="image_url"
        value={imageUrl}
      />

      <div className="admin-editor-grid">
        <div className="admin-editor-main">

          {/* AI BUILDER */}

          <section className="admin-panel admin-form-section">
            <p className="admin-eyebrow">
              AI PLANT BUILDER
            </p>

            <h2>
              Generate a researched plant profile
            </h2>

            <p>
              Enter a pond plant name and
              PondStuff will research it and
              populate the structured profile.
              Review every field before
              publishing.
            </p>

            <label className="admin-field">
              <span>Plant name</span>

              <input
                type="text"
                value={aiPlantName}
                onChange={(event) =>
                  setAiPlantName(
                    event.target.value,
                  )
                }
                placeholder="e.g. Hornwort"
                disabled={aiGenerating}
              />
            </label>

            <button
              type="button"
              className="admin-primary-button"
              disabled={aiGenerating}
              onClick={() => {
                void generateWithAI();
              }}
            >
              {aiGenerating
                ? "Researching plant…"
                : "Generate with AI"}
            </button>

            {aiMessage && (
              <p
                style={{
                  marginTop: "0.75rem",
                }}
              >
                {aiMessage}
              </p>
            )}

            <input
              type="hidden"
              name="research_sources"
              value={JSON.stringify(researchSources)}
            />

            {researchSources.length >
              0 && (
              <div
                className="admin-field"
                style={{
                  marginTop: "1rem",
                }}
              >
                <span>
                  Research sources used
                </span>

                <div
                  style={{
                    display: "grid",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {researchSources.map(
                    (source) => (
                      <a
                        key={source.url}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {source.title}
                      </a>
                    ),
                  )}
                </div>
              </div>
            )}
          </section>

          {/* IDENTITY */}

          <section className="admin-panel admin-form-section">
            <p className="admin-eyebrow">
              IDENTITY
            </p>

            <h2>Plant details</h2>

            <label className="admin-field">
              <span>Common name *</span>
              <input
                name="common_name"
                required
                value={commonName}
                onChange={(event) =>
                  setCommonName(
                    event.target.value,
                  )
                }
                placeholder="e.g. Yellow flag iris"
              />
            </label>

            <label className="admin-field">
              <span>
                Scientific name
              </span>
              <input
                name="scientific_name"
                value={scientificName}
                onChange={(event) =>
                  setScientificName(
                    event.target.value,
                  )
                }
                placeholder="e.g. Iris pseudacorus"
              />
            </label>

            <label className="admin-field">
              <span>Slug</span>
              <input
                name="slug"
                value={slug}
                onChange={(event) =>
                  setSlug(
                    event.target.value,
                  )
                }
                placeholder="Leave blank to generate automatically"
              />
            </label>

            <label className="admin-field">
              <span>Plant type</span>
              <select
                name="plant_type"
                value={plantType}
                onChange={(event) =>
                  setPlantType(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Select type
                </option>
                <option value="marginal">
                  Marginal
                </option>
                <option value="oxygenating">
                  Oxygenating
                </option>
                <option value="floating">
                  Floating
                </option>
                <option value="water-lily">
                  Water lily
                </option>
                <option value="deep-water">
                  Deep-water
                </option>
                <option value="bog">
                  Bog
                </option>
              </select>
            </label>

            <label className="admin-field">
              <span>Summary</span>
              <textarea
                name="summary"
                rows={3}
                value={summary}
                onChange={(event) =>
                  setSummary(
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="admin-field">
              <span>Description</span>
              <textarea
                name="description"
                rows={12}
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
              />
            </label>
          </section>

          {/* GROWING */}

          <section className="admin-panel admin-form-section">
            <p className="admin-eyebrow">
              GROWING
            </p>

            <h2>
              Planting & growth
            </h2>

            <div className="admin-form-columns">
              <label className="admin-field">
                <span>
                  Minimum planting depth
                  (cm)
                </span>
                <input
                  type="number"
                  step="any"
                  name="min_planting_depth_cm"
                  value={minPlantingDepth}
                  onChange={(event) =>
                    setMinPlantingDepth(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="admin-field">
                <span>
                  Maximum planting depth
                  (cm)
                </span>
                <input
                  type="number"
                  step="any"
                  name="max_planting_depth_cm"
                  value={maxPlantingDepth}
                  onChange={(event) =>
                    setMaxPlantingDepth(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="admin-field">
                <span>
                  Minimum suitable water depth
                  (cm)
                </span>
                <input
                  type="number"
                  step="any"
                  name="min_water_depth_cm"
                  value={minWaterDepth}
                  onChange={(event) =>
                    setMinWaterDepth(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="admin-field">
                <span>
                  Maximum suitable water depth
                  (cm)
                </span>
                <input
                  type="number"
                  step="any"
                  name="max_water_depth_cm"
                  value={maxWaterDepth}
                  onChange={(event) =>
                    setMaxWaterDepth(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="admin-field">
                <span>
                  Maximum height (cm)
                </span>
                <input
                  type="number"
                  step="any"
                  name="max_height_cm"
                  value={maxHeight}
                  onChange={(event) =>
                    setMaxHeight(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="admin-field">
                <span>
                  Maximum spread (cm)
                </span>
                <input
                  type="number"
                  step="any"
                  name="max_spread_cm"
                  value={maxSpread}
                  onChange={(event) =>
                    setMaxSpread(
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>

            <label className="admin-field">
              <span>Sunlight</span>
              <select
                name="sunlight"
                value={sunlight}
                onChange={(event) =>
                  setSunlight(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Not specified
                </option>
                <option value="full-sun">
                  Full sun
                </option>
                <option value="full-sun-partial-shade">
                  Full sun / partial shade
                </option>
                <option value="partial-shade">
                  Partial shade
                </option>
                <option value="shade">
                  Shade
                </option>
              </select>
            </label>

            <label className="admin-field">
              <span>Care level</span>
              <select
                name="care_level"
                value={careLevel}
                onChange={(event) =>
                  setCareLevel(
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Not specified
                </option>
                <option value="easy">
                  Easy
                </option>
                <option value="moderate">
                  Moderate
                </option>
                <option value="advanced">
                  Advanced
                </option>
              </select>
            </label>

            <label className="admin-field">
              <span>Hardiness</span>
              <input
                name="hardiness"
                value={hardiness}
                onChange={(event) =>
                  setHardiness(
                    event.target.value,
                  )
                }
                placeholder="Only researched information"
              />
            </label>

            <label className="admin-field">
              <span>Growth habit</span>
              <textarea
                name="growth_habit"
                rows={3}
                value={growthHabit}
                onChange={(event) =>
                  setGrowthHabit(
                    event.target.value,
                  )
                }
                placeholder="e.g. Free-floating submerged aquatic plant"
              />
            </label>

            <label className="admin-field">
              <span>
                Planting / introduction method
              </span>
              <textarea
                name="planting_method"
                rows={4}
                value={plantingMethod}
                onChange={(event) =>
                  setPlantingMethod(
                    event.target.value,
                  )
                }
                placeholder="How the plant should be introduced or planted"
              />
            </label>

            <label className="admin-field">
              <span>Winter behaviour</span>
              <textarea
                name="winter_behaviour"
                rows={4}
                value={winterBehaviour}
                onChange={(event) =>
                  setWinterBehaviour(
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="admin-field">
              <span>Propagation</span>
              <textarea
                name="propagation"
                rows={4}
                value={propagation}
                onChange={(event) =>
                  setPropagation(
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="admin-field">
              <span>Maintenance notes</span>
              <textarea
                name="maintenance_notes"
                rows={5}
                value={maintenanceNotes}
                onChange={(event) =>
                  setMaintenanceNotes(
                    event.target.value,
                  )
                }
              />
            </label>

            <fieldset className="admin-field">
              <legend>
                Flowering months
              </legend>

              <div className="admin-checkbox-grid">
                {months.map(
                  (month) => (
                    <label key={month}>
                      <input
                        type="checkbox"
                        name="flowering_months"
                        value={month}
                        checked={floweringMonths.includes(
                          month,
                        )}
                        onChange={() =>
                          toggleFloweringMonth(
                            month,
                          )
                        }
                      />
                      <span>
                        {month}
                      </span>
                    </label>
                  ),
                )}
              </div>
            </fieldset>
          </section>

          {/* SUITABILITY */}

          <section className="admin-panel admin-form-section">
            <p className="admin-eyebrow">
              SUITABILITY
            </p>

            <h2>
              Pond suitability
            </h2>

            <label className="admin-field">
              <span>
                Native to the UK?
              </span>

              <select
                name="is_native_uk"
                value={nativeUk}
                onChange={(event) =>
                  setNativeUk(
                    event.target.value,
                  )
                }
              >
                <option value="unknown">
                  Unknown / not set
                </option>
                <option value="yes">
                  Yes
                </option>
                <option value="no">
                  No
                </option>
              </select>
            </label>

            <label className="admin-field">
              <span>Oxygenating plant?</span>
              <select
                name="is_oxygenating"
                value={isOxygenating}
                onChange={(event) =>
                  setIsOxygenating(event.target.value)
                }
              >
                <option value="unknown">
                  Unknown / not established
                </option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>

            <label className="admin-field">
              <span>Wildlife friendly?</span>
              <select
                name="is_wildlife_friendly"
                value={isWildlifeFriendly}
                onChange={(event) =>
                  setIsWildlifeFriendly(
                    event.target.value,
                  )
                }
              >
                <option value="unknown">
                  Unknown / not established
                </option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>

            <label className="admin-field">
              <span>Suitable for small ponds?</span>
              <select
                name="is_small_pond_suitable"
                value={isSmallPondSuitable}
                onChange={(event) =>
                  setIsSmallPondSuitable(
                    event.target.value,
                  )
                }
              >
                <option value="unknown">
                  Unknown / not established
                </option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
          </section>

          {/* UK LEGAL / INVASIVE STATUS */}

          <section className="admin-panel admin-form-section">
            <p className="admin-eyebrow">
              UK STATUS
            </p>

            <h2>
              Legal & invasive-species information
            </h2>

            <p>
              Regulatory information must be based on
              researched sources. Keep the jurisdiction
              explicit where rules differ across the UK.
            </p>

            <label className="admin-field">
              <span>Legal status</span>
              <input
                name="legal_status_uk"
                value={legalStatusUk}
                onChange={(event) =>
                  setLegalStatusUk(
                    event.target.value,
                  )
                }
                placeholder="e.g. No restriction identified in researched sources"
              />
            </label>

            <label className="admin-field">
              <span>
                Legal / invasive status notes
              </span>
              <textarea
                name="legal_status_notes"
                rows={6}
                value={legalStatusNotes}
                onChange={(event) =>
                  setLegalStatusNotes(
                    event.target.value,
                  )
                }
                placeholder="Source-backed notes, including jurisdiction where relevant"
              />
            </label>
          </section>

          {/* SEO */}

          <section className="admin-panel admin-form-section">
            <p className="admin-eyebrow">
              SEARCH
            </p>

            <h2>SEO</h2>

            <label className="admin-field">
              <span>SEO title</span>
              <input
                name="seo_title"
                maxLength={60}
                value={seoTitle}
                onChange={(event) =>
                  setSeoTitle(
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="admin-field">
              <span>
                Meta description
              </span>
              <textarea
                name="meta_description"
                rows={3}
                maxLength={160}
                value={metaDescription}
                onChange={(event) =>
                  setMetaDescription(
                    event.target.value,
                  )
                }
              />
            </label>
          </section>
        </div>

        {/* SIDEBAR */}

        <aside className="admin-editor-side">
          <section className="admin-panel admin-form-section">
            <p className="admin-eyebrow">
              IMAGE
            </p>

            <h2>Plant image</h2>

            {imageUrl && (
              <div
                style={{
                  marginBottom: "1rem",
                }}
              >
                <img
                  src={imageUrl}
                  alt={imageAlt}
                  style={{
                    display: "block",
                    width: "100%",
                    aspectRatio: "4 / 3",
                    objectFit: "cover",
                    borderRadius: "12px",
                  }}
                />
              </div>
            )}

            <div className="admin-field">
              <span>Upload image</span>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                disabled={imageUploading}
                onChange={(event) => {
                  const file =
                    event.target
                      .files?.[0];

                  if (file) {
                    void uploadPlantImage(
                      file,
                    );
                  }
                }}
              />

              {imageMessage && (
                <small
                  style={{
                    display: "block",
                    marginTop: "0.5rem",
                  }}
                >
                  {imageMessage}
                </small>
              )}
            </div>

            {imageUrl && (
              <button
                type="button"
                className="admin-secondary-button"
                onClick={() => {
                  setImageUrl("");
                  setImageMessage("");
                }}
              >
                Remove image
              </button>
            )}

            <label className="admin-field">
              <span>Alt text</span>
              <input
                name="image_alt"
                value={imageAlt}
                onChange={(event) =>
                  setImageAlt(
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="admin-field">
              <span>
                Image credit
              </span>
              <input
                name="image_credit"
                value={imageCredit}
                onChange={(event) =>
                  setImageCredit(
                    event.target.value,
                  )
                }
              />
            </label>
          </section>

          <section className="admin-panel admin-form-section">
            <p className="admin-eyebrow">
              DISPLAY
            </p>

            <h2>Options</h2>

            <label className="admin-check">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={
                  initialPlant?.is_featured ??
                  false
                }
              />
              <span>
                Featured plant
              </span>
            </label>
          </section>

          <section className="admin-panel admin-form-section">
            <button
              type="submit"
              name="intent"
              value="draft"
              className="admin-secondary-button"
            >
              Save draft
            </button>

            <button
              type="submit"
              name="intent"
              value="publish"
              className="admin-primary-button"
            >
              {initialPlant?.status ===
              "published"
                ? "Update published plant"
                : "Publish plant"}
            </button>

            {initialPlant && (
              <button
                type="submit"
                formAction={deletePlant.bind(
                  null,
                  initialPlant.id,
                )}
                className="admin-secondary-button"
                style={{
                  marginTop: "1rem",
                }}
              >
                Delete plant
              </button>
            )}
          </section>
        </aside>
      </div>
    </form>
  );
}
