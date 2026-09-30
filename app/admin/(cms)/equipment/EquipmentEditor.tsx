"use client";

import {
  useRef,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";

import {
  createEquipment,
  deleteEquipment,
  generateEquipmentDraft,
  updateEquipment,
} from "./actions";

type ResearchSource = {
  title: string;
  url: string;
};

type InitialEquipment = {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  manufacturer_product_code: string | null;
  slug: string;
  equipment_type: string;

  summary: string | null;
  description: string | null;

  max_flow_lph: number | null;
  max_head_m: number | null;
  power_watts: number | null;

  max_pond_volume_litres: number | null;
  max_fish_pond_volume_litres: number | null;
  max_koi_pond_volume_litres: number | null;

  uv_watts: number | null;
  cable_length_m: number | null;

  specifications:
    Record<string, unknown> | null;

  best_for: string | null;
  limitations: string | null;
  installation_notes: string | null;
  maintenance_notes: string | null;
  safety_notes: string | null;

  manufacturer_url: string | null;

  research_sources:
    ResearchSource[];

  image_url: string | null;
  image_alt: string | null;
  image_credit: string | null;

  seo_title: string | null;
  meta_description: string | null;

  affiliate_url: string | null;
  affiliate_network: string | null;

  status: string;
  is_featured: boolean;
  published_at: string | null;
};

type Props = {
  initialEquipment?: InitialEquipment;
};

const equipmentTypes = [
  ["pond-pump", "Pond pump"],
  ["pond-filter", "Pond filter"],
  ["uv-clarifier", "UV clarifier"],
  ["air-pump", "Air pump / aeration"],
  ["pond-vacuum", "Pond vacuum"],
  ["pond-liner", "Pond liner"],
  ["underlay", "Pond underlay"],
  ["water-test-kit", "Water test kit"],
  ["maintenance", "Maintenance equipment"],
  ["other", "Other"],
] as const;

function safeFileName(
  name: string,
) {
  const extension =
    name
      .split(".")
      .pop()
      ?.toLowerCase() || "jpg";

  const base = name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

  return `${base || "equipment"}-${Date.now()}.${extension}`;
}

function numberValue(
  value: number | null | undefined,
) {
  return value == null
    ? ""
    : String(value);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function EquipmentEditor({
  initialEquipment,
}: Props) {
  const imageInputRef =
    useRef<HTMLInputElement>(null);

  const [
    aiProductName,
    setAiProductName,
  ] = useState("");

  const [
    aiGenerating,
    setAiGenerating,
  ] = useState(false);

  const [
    aiMessage,
    setAiMessage,
  ] = useState("");

  const [name, setName] =
    useState(
      initialEquipment?.name ?? "",
    );

  const [brand, setBrand] =
    useState(
      initialEquipment?.brand ?? "",
    );

  const [model, setModel] =
    useState(
      initialEquipment?.model ?? "",
    );

  const [
    manufacturerProductCode,
    setManufacturerProductCode,
  ] = useState(
    initialEquipment
      ?.manufacturer_product_code ?? "",
  );

  const [slug, setSlug] =
    useState(
      initialEquipment?.slug ?? "",
    );

  const [
    equipmentType,
    setEquipmentType,
  ] = useState(
    initialEquipment?.equipment_type ??
      "pond-pump",
  );

  const [summary, setSummary] =
    useState(
      initialEquipment?.summary ?? "",
    );

  const [
    description,
    setDescription,
  ] = useState(
    initialEquipment?.description ?? "",
  );

  const [
    specifications,
    setSpecifications,
  ] = useState(
    JSON.stringify(
      initialEquipment?.specifications ??
        {},
      null,
      2,
    ),
  );

  const [maxFlowLph, setMaxFlowLph] =
    useState(
      numberValue(
        initialEquipment?.max_flow_lph,
      ),
    );

  const [maxHeadM, setMaxHeadM] =
    useState(
      numberValue(
        initialEquipment?.max_head_m,
      ),
    );

  const [powerWatts, setPowerWatts] =
    useState(
      numberValue(
        initialEquipment?.power_watts,
      ),
    );

  const [uvWatts, setUvWatts] =
    useState(
      numberValue(
        initialEquipment?.uv_watts,
      ),
    );

  const [
    maxPondVolumeLitres,
    setMaxPondVolumeLitres,
  ] = useState(
    numberValue(
      initialEquipment
        ?.max_pond_volume_litres,
    ),
  );

  const [
    maxFishPondVolumeLitres,
    setMaxFishPondVolumeLitres,
  ] = useState(
    numberValue(
      initialEquipment
        ?.max_fish_pond_volume_litres,
    ),
  );

  const [
    maxKoiPondVolumeLitres,
    setMaxKoiPondVolumeLitres,
  ] = useState(
    numberValue(
      initialEquipment
        ?.max_koi_pond_volume_litres,
    ),
  );

  const [
    cableLengthM,
    setCableLengthM,
  ] = useState(
    numberValue(
      initialEquipment?.cable_length_m,
    ),
  );

  const [bestFor, setBestFor] =
    useState(
      initialEquipment?.best_for ?? "",
    );

  const [
    limitations,
    setLimitations,
  ] = useState(
    initialEquipment?.limitations ?? "",
  );

  const [
    installationNotes,
    setInstallationNotes,
  ] = useState(
    initialEquipment?.installation_notes ??
      "",
  );

  const [
    maintenanceNotes,
    setMaintenanceNotes,
  ] = useState(
    initialEquipment?.maintenance_notes ??
      "",
  );

  const [
    safetyNotes,
    setSafetyNotes,
  ] = useState(
    initialEquipment?.safety_notes ?? "",
  );

  const [
    manufacturerUrl,
    setManufacturerUrl,
  ] = useState(
    initialEquipment?.manufacturer_url ??
      "",
  );

  const [seoTitle, setSeoTitle] =
    useState(
      initialEquipment?.seo_title ?? "",
    );

  const [
    metaDescription,
    setMetaDescription,
  ] = useState(
    initialEquipment?.meta_description ??
      "",
  );

  const [
    researchSources,
    setResearchSources,
  ] = useState<ResearchSource[]>(
    Array.isArray(
      initialEquipment?.research_sources,
    )
      ? initialEquipment.research_sources
      : [],
  );

  const [imageUrl, setImageUrl] =
    useState(
      initialEquipment?.image_url ?? "",
    );

  const [imageAlt, setImageAlt] =
    useState(
      initialEquipment?.image_alt ?? "",
    );

  const [
    imageCredit,
    setImageCredit,
  ] = useState(
    initialEquipment?.image_credit ?? "",
  );

  const [
    imageUploading,
    setImageUploading,
  ] = useState(false);

  const [
    imageMessage,
    setImageMessage,
  ] = useState("");

  function addResearchSource() {
    setResearchSources(
      (current) => [
        ...current,
        {
          title: "",
          url: "",
        },
      ],
    );
  }

  function updateResearchSource(
    index: number,
    key: keyof ResearchSource,
    value: string,
  ) {
    setResearchSources(
      (current) =>
        current.map(
          (source, sourceIndex) =>
            sourceIndex === index
              ? {
                  ...source,
                  [key]: value,
                }
              : source,
        ),
    );
  }

  function removeResearchSource(
    index: number,
  ) {
    setResearchSources(
      (current) =>
        current.filter(
          (_, sourceIndex) =>
            sourceIndex !== index,
        ),
    );
  }

  async function researchEquipment() {
    const requested =
      aiProductName.trim();

    if (!requested) {
      setAiMessage(
        "Enter a product or model to research.",
      );
      return;
    }

    setAiGenerating(true);
    setAiMessage(
      "Researching manufacturer evidence and building draft…",
    );

    try {
      const draft =
        await generateEquipmentDraft(
          requested,
          equipmentType,
        );

      setName(draft.name ?? requested);
      setBrand(draft.brand ?? "");
      setModel(draft.model ?? "");

      setManufacturerProductCode(
        draft.manufacturerProductCode ??
          "",
      );

      if (!initialEquipment) {
        setSlug(
          draft.slug ||
            slugify(
              draft.name ?? requested,
            ),
        );
      }

      setEquipmentType(
        draft.equipmentType ?? "other",
      );

      setSummary(draft.summary ?? "");
      setDescription(
        draft.description ?? "",
      );

      setMaxFlowLph(
        numberValue(draft.maxFlowLph),
      );
      setMaxHeadM(
        numberValue(draft.maxHeadM),
      );
      setPowerWatts(
        numberValue(draft.powerWatts),
      );
      setUvWatts(
        numberValue(draft.uvWatts),
      );

      setMaxPondVolumeLitres(
        numberValue(
          draft.maxPondVolumeLitres,
        ),
      );

      setMaxFishPondVolumeLitres(
        numberValue(
          draft.maxFishPondVolumeLitres,
        ),
      );

      setMaxKoiPondVolumeLitres(
        numberValue(
          draft.maxKoiPondVolumeLitres,
        ),
      );

      setCableLengthM(
        numberValue(draft.cableLengthM),
      );

      setSpecifications(
        JSON.stringify(
          draft.specifications ?? {},
          null,
          2,
        ),
      );

      setBestFor(draft.bestFor ?? "");
      setLimitations(
        draft.limitations ?? "",
      );
      setInstallationNotes(
        draft.installationNotes ?? "",
      );
      setMaintenanceNotes(
        draft.maintenanceNotes ?? "",
      );
      setSafetyNotes(
        draft.safetyNotes ?? "",
      );

      setManufacturerUrl(
        draft.manufacturerUrl ?? "",
      );

      setResearchSources(
        Array.isArray(
          draft.researchSources,
        )
          ? draft.researchSources
          : [],
      );

      setImageAlt(
        draft.imageAlt ?? "",
      );

      setSeoTitle(
        draft.seoTitle ?? "",
      );

      setMetaDescription(
        draft.metaDescription ?? "",
      );

      setAiMessage(
        "Research complete. Review every field and source before saving.",
      );
    } catch (error) {
      setAiMessage(
        error instanceof Error
          ? error.message
          : "Equipment research failed.",
      );
    } finally {
      setAiGenerating(false);
    }
  }

  async function uploadEquipmentImage(
    file: File,
  ) {
    if (
      !file.type.startsWith("image/")
    ) {
      setImageMessage(
        "Please choose an image file.",
      );
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
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
        `equipment/${safeFileName(
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
        "Equipment image uploaded.",
      );
    } catch (error) {
      setImageMessage(
        error instanceof Error
          ? error.message
          : "Equipment image upload failed.",
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

  const action = initialEquipment
    ? updateEquipment.bind(
        null,
        initialEquipment.id,
      )
    : createEquipment;

  return (
    <form
      action={action}
      className="admin-editor-form"
    >
      <input
        type="hidden"
        name="research_sources"
        value={JSON.stringify(
          researchSources,
        )}
      />

      <section className="admin-editor-card">
        <p className="admin-eyebrow">
          AI RESEARCH BUILDER
        </p>

        <h2>
          Research an equipment product
        </h2>

        <p>
          Enter an exact product or model.
          PondStuff will research available
          evidence and populate a draft for
          human review. Nothing is saved
          automatically.
        </p>

        <div className="admin-field-grid">
          <label className="admin-field">
            <span>
              Product / model to research
            </span>

            <input
              type="text"
              value={aiProductName}
              onChange={(event) =>
                setAiProductName(
                  event.target.value,
                )
              }
              placeholder="e.g. OASE AquaMax Eco Premium 9000"
              disabled={aiGenerating}
            />
          </label>

          <label className="admin-field">
            <span>
              Equipment type hint
            </span>

            <select
              value={equipmentType}
              onChange={(event) =>
                setEquipmentType(
                  event.target.value,
                )
              }
              disabled={aiGenerating}
            >
              {equipmentTypes.map(
                ([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={() => {
            void researchEquipment();
          }}
          disabled={
            aiGenerating ||
            !aiProductName.trim()
          }
        >
          {aiGenerating
            ? "Researching…"
            : "Research & build"}
        </button>

        {aiMessage && (
          <p>{aiMessage}</p>
        )}
      </section>

      <div className="admin-editor-grid">
        <div className="admin-editor-main">
          <section className="admin-editor-card">
            <p className="admin-eyebrow">
              IDENTITY
            </p>

            <h2>Equipment details</h2>

            <label className="admin-field">
              <span>Name</span>

              <input
                name="name"
                value={name}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setName(value);

                  if (!initialEquipment) {
                    setSlug(
                      slugify(value),
                    );
                  }
                }}
                required
              />
            </label>

            <div className="admin-field-grid">
              <label className="admin-field">
                <span>Brand</span>
                <input
                  name="brand"
                  value={brand}
                  onChange={(event) =>
                    setBrand(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="admin-field">
                <span>Model</span>
                <input
                  name="model"
                  value={model}
                  onChange={(event) =>
                    setModel(
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>

            <label className="admin-field">
              <span>
                Manufacturer product code
              </span>

              <input
                name="manufacturer_product_code"
                value={manufacturerProductCode}
                onChange={(event) =>
                  setManufacturerProductCode(
                    event.target.value,
                  )
                }
                placeholder="SKU / item / article number"
              />
            </label>

            <div className="admin-field-grid">
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
                  required
                />
              </label>

              <label className="admin-field">
                <span>
                  Equipment type
                </span>

                <select
                  name="equipment_type"
                  value={equipmentType}
                  onChange={(event) =>
                    setEquipmentType(
                      event.target.value,
                    )
                  }
                >
                  {equipmentTypes.map(
                    ([value, label]) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {label}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>

            <label className="admin-field">
              <span>Summary</span>

              <textarea
                name="summary"
                value={summary}
                onChange={(event) =>
                  setSummary(
                    event.target.value,
                  )
                }
                rows={3}
              />
            </label>

            <label className="admin-field">
              <span>Description</span>

              <textarea
                name="description"
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value,
                  )
                }
                rows={8}
              />
            </label>
          </section>

          <section className="admin-editor-card">
            <p className="admin-eyebrow">
              VERIFIED SPECIFICATIONS
            </p>

            <h2>Core specifications</h2>

            <p>
              Leave any specification blank
              unless it has been verified
              against a reliable source.
            </p>

            <div className="admin-field-grid">
              <label className="admin-field">
                <span>
                  Maximum flow (L/h)
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  name="max_flow_lph"
                  value={maxFlowLph}
                  onChange={(event) =>
                    setMaxFlowLph(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="admin-field">
                <span>
                  Maximum head (m)
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  name="max_head_m"
                  value={maxHeadM}
                  onChange={(event) =>
                    setMaxHeadM(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="admin-field">
                <span>
                  Power (watts)
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  name="power_watts"
                  value={powerWatts}
                  onChange={(event) =>
                    setPowerWatts(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="admin-field">
                <span>
                  UV power (watts)
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  name="uv_watts"
                  value={uvWatts}
                  onChange={(event) =>
                    setUvWatts(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="admin-field">
                <span>
                  General pond capacity (L)
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  name="max_pond_volume_litres"
                  value={maxPondVolumeLitres}
                  onChange={(event) =>
                    setMaxPondVolumeLitres(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="admin-field">
                <span>
                  Fish pond capacity (L)
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  name="max_fish_pond_volume_litres"
                  value={maxFishPondVolumeLitres}
                  onChange={(event) =>
                    setMaxFishPondVolumeLitres(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="admin-field">
                <span>
                  Koi pond capacity (L)
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  name="max_koi_pond_volume_litres"
                  value={maxKoiPondVolumeLitres}
                  onChange={(event) =>
                    setMaxKoiPondVolumeLitres(
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="admin-field">
                <span>
                  Cable length (m)
                </span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  name="cable_length_m"
                  value={cableLengthM}
                  onChange={(event) =>
                    setCableLengthM(
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>

            <label className="admin-field">
              <span>
                Additional specifications
                (JSON)
              </span>

              <textarea
                name="specifications"
                value={specifications}
                onChange={(event) =>
                  setSpecifications(
                    event.target.value,
                  )
                }
                rows={8}
                spellCheck={false}
              />

              <small>
                Use this only for verified
                manufacturer specifications
                that do not have a dedicated
                field above.
              </small>
            </label>
          </section>

          <section className="admin-editor-card">
            <p className="admin-eyebrow">
              EDITORIAL
            </p>

            <h2>Suitability &amp; notes</h2>

            {([
              [
                "best_for",
                "Best for",
                bestFor,
                setBestFor,
              ],
              [
                "limitations",
                "Limitations",
                limitations,
                setLimitations,
              ],
              [
                "installation_notes",
                "Installation notes",
                installationNotes,
                setInstallationNotes,
              ],
              [
                "maintenance_notes",
                "Maintenance notes",
                maintenanceNotes,
                setMaintenanceNotes,
              ],
              [
                "safety_notes",
                "Safety notes",
                safetyNotes,
                setSafetyNotes,
              ],
            ] satisfies Array<
              [
                string,
                string,
                string,
                React.Dispatch<
                  React.SetStateAction<string>
                >,
              ]
            >).map(
              ([
                field,
                label,
                value,
                setter,
              ]) => (
                <label
                  key={field}
                  className="admin-field"
                >
                  <span>{label}</span>

                  <textarea
                    name={field}
                    value={value}
                    onChange={(event) =>
                      setter(
                        event.target.value,
                      )
                    }
                    rows={4}
                  />
                </label>
              ),
            )}
          </section>

          <section className="admin-editor-card">
            <p className="admin-eyebrow">
              SOURCES
            </p>

            <h2>
              Manufacturer &amp; research
            </h2>

            <label className="admin-field">
              <span>
                Manufacturer URL
              </span>

              <input
                type="url"
                name="manufacturer_url"
                value={manufacturerUrl}
                onChange={(event) =>
                  setManufacturerUrl(
                    event.target.value,
                  )
                }
              />
            </label>

            {researchSources.map(
              (source, index) => (
                <div
                  key={index}
                  className="admin-field-grid"
                >
                  <label className="admin-field">
                    <span>
                      Source title
                    </span>

                    <input
                      value={
                        source.title
                      }
                      onChange={(event) =>
                        updateResearchSource(
                          index,
                          "title",
                          event.target
                            .value,
                        )
                      }
                    />
                  </label>

                  <label className="admin-field">
                    <span>
                      Source URL
                    </span>

                    <input
                      type="url"
                      value={source.url}
                      onChange={(event) =>
                        updateResearchSource(
                          index,
                          "url",
                          event.target
                            .value,
                        )
                      }
                    />
                  </label>

                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={() =>
                      removeResearchSource(
                        index,
                      )
                    }
                  >
                    Remove source
                  </button>
                </div>
              ),
            )}

            <button
              type="button"
              className="admin-secondary-button"
              onClick={
                addResearchSource
              }
            >
              + Add research source
            </button>
          </section>
        </div>

        <aside className="admin-editor-sidebar">
          <section className="admin-editor-card">
            <p className="admin-eyebrow">
              PUBLISH
            </p>

            <p>
              Current status:{" "}
              <strong>
                {initialEquipment?.status ??
                  "new"}
              </strong>
            </p>

            <label className="admin-checkbox-row">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={
                  initialEquipment?.is_featured ??
                  false
                }
              />
              Featured equipment
            </label>

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
              Publish
            </button>
          </section>

          <section className="admin-editor-card">
            <p className="admin-eyebrow">
              IMAGE
            </p>

            {imageUrl && (
              <img
                src={imageUrl}
                alt=""
                style={{
                  width: "100%",
                  height: "auto",
                  borderRadius: "12px",
                  marginBottom: "1rem",
                }}
              />
            )}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file =
                  event.target
                    .files?.[0];

                if (file) {
                  void uploadEquipmentImage(
                    file,
                  );
                }
              }}
              disabled={imageUploading}
            />

            {imageMessage && (
              <p>{imageMessage}</p>
            )}

            <input
              type="hidden"
              name="image_url"
              value={imageUrl}
            />

            <label className="admin-field">
              <span>Image alt</span>

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
              <span>Image credit</span>

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

          <section className="admin-editor-card">
            <p className="admin-eyebrow">
              SEO
            </p>

            <label className="admin-field">
              <span>SEO title</span>

              <input
                name="seo_title"
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
                value={metaDescription}
                onChange={(event) =>
                  setMetaDescription(
                    event.target.value,
                  )
                }
                rows={5}
              />
            </label>
          </section>

          <section className="admin-editor-card">
            <p className="admin-eyebrow">
              COMMERCIAL
            </p>

            <label className="admin-field">
              <span>Affiliate URL</span>

              <input
                type="url"
                name="affiliate_url"
                defaultValue={
                  initialEquipment?.affiliate_url ??
                  ""
                }
              />
            </label>

            <label className="admin-field">
              <span>
                Affiliate network
              </span>

              <input
                name="affiliate_network"
                defaultValue={
                  initialEquipment?.affiliate_network ??
                  ""
                }
              />
            </label>
          </section>

          {initialEquipment && (
            <section className="admin-editor-card">
              <p className="admin-eyebrow">
                DANGER ZONE
              </p>

              <button
                type="submit"
                formAction={deleteEquipment.bind(
                  null,
                  initialEquipment.id,
                )}
                className="admin-secondary-button"
                onClick={(event) => {
                  if (
                    !window.confirm(
                      `Delete ${initialEquipment.name}? This cannot be undone.`,
                    )
                  ) {
                    event.preventDefault();
                  }
                }}
              >
                Delete equipment
              </button>
            </section>
          )}
        </aside>
      </div>
    </form>
  );
}
