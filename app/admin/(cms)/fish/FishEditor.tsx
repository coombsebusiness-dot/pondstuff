"use client";

import { useState } from "react";
import { createFish, updateFish } from "./actions";

type InitialFish = {
  id?: string;
  common_name: string;
  scientific_name: string | null;
  slug: string;
  summary: string | null;
  description: string | null;
  max_length_cm: number | null;
  minimum_pond_volume_litres: number | null;
  minimum_pond_depth_cm: number | null;
  min_temperature_c: number | null;
  max_temperature_c: number | null;
  diet: string | null;
  temperament: string | null;
  care_level: string | null;
  suitable_for_small_ponds: boolean;
  suitable_for_wildlife_ponds: boolean;
  compatibility_notes: string | null;
  care_notes: string | null;
  image_url: string | null;
  image_alt: string | null;
  image_credit: string | null;
  seo_title: string | null;
  meta_description: string | null;
  status: string;
  is_featured: boolean;
};

type Props = {
  initialFish?: InitialFish;
};

export default function FishEditor({
  initialFish,
}: Props) {
  const [message, setMessage] = useState("");

  const [commonName, setCommonName] =
    useState(initialFish?.common_name ?? "");

  const [scientificName, setScientificName] =
    useState(initialFish?.scientific_name ?? "");

  const [slug, setSlug] =
    useState(initialFish?.slug ?? "");

  const [summary, setSummary] =
    useState(initialFish?.summary ?? "");

  const [description, setDescription] =
    useState(initialFish?.description ?? "");

  const [maxLength, setMaxLength] =
    useState(
      initialFish?.max_length_cm == null
        ? ""
        : String(initialFish.max_length_cm),
    );

  const [minimumVolume, setMinimumVolume] =
    useState(
      initialFish?.minimum_pond_volume_litres == null
        ? ""
        : String(
            initialFish.minimum_pond_volume_litres,
          ),
    );

  const [minimumDepth, setMinimumDepth] =
    useState(
      initialFish?.minimum_pond_depth_cm == null
        ? ""
        : String(initialFish.minimum_pond_depth_cm),
    );

  const [minTemperature, setMinTemperature] =
    useState(
      initialFish?.min_temperature_c == null
        ? ""
        : String(initialFish.min_temperature_c),
    );

  const [maxTemperature, setMaxTemperature] =
    useState(
      initialFish?.max_temperature_c == null
        ? ""
        : String(initialFish.max_temperature_c),
    );

  const [diet, setDiet] =
    useState(initialFish?.diet ?? "");

  const [temperament, setTemperament] =
    useState(initialFish?.temperament ?? "");

  const [careLevel, setCareLevel] =
    useState(initialFish?.care_level ?? "");

  const [smallPond, setSmallPond] =
    useState(
      initialFish?.suitable_for_small_ponds ?? false,
    );

  const [wildlifePond, setWildlifePond] =
    useState(
      initialFish?.suitable_for_wildlife_ponds ?? false,
    );

  const [compatibility, setCompatibility] =
    useState(
      initialFish?.compatibility_notes ?? "",
    );

  const [careNotes, setCareNotes] =
    useState(initialFish?.care_notes ?? "");

  const [imageUrl, setImageUrl] =
    useState(initialFish?.image_url ?? "");

  const [imageAlt, setImageAlt] =
    useState(initialFish?.image_alt ?? "");

  const [imageCredit, setImageCredit] =
    useState(initialFish?.image_credit ?? "");

  const [seoTitle, setSeoTitle] =
    useState(initialFish?.seo_title ?? "");

  const [metaDescription, setMetaDescription] =
    useState(initialFish?.meta_description ?? "");

  const [status, setStatus] =
    useState(initialFish?.status ?? "draft");

  const [featured, setFeatured] =
    useState(initialFish?.is_featured ?? false);

  function autoSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function numberOrNull(value: string) {
    if (!value.trim()) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  async function save(nextStatus = status) {
    setMessage("Saving...");

    try {
      const payload = {
        common_name: commonName.trim(),
        scientific_name:
          scientificName.trim() || null,
        slug: slug.trim() || autoSlug(commonName),
        summary: summary.trim() || null,
        description: description.trim() || null,
        max_length_cm: numberOrNull(maxLength),
        minimum_pond_volume_litres:
          numberOrNull(minimumVolume),
        minimum_pond_depth_cm:
          numberOrNull(minimumDepth),
        min_temperature_c:
          numberOrNull(minTemperature),
        max_temperature_c:
          numberOrNull(maxTemperature),
        diet: diet.trim() || null,
        temperament: temperament.trim() || null,
        care_level: careLevel || null,
        suitable_for_small_ponds: smallPond,
        suitable_for_wildlife_ponds: wildlifePond,
        compatibility_notes:
          compatibility.trim() || null,
        care_notes: careNotes.trim() || null,
        image_url: imageUrl.trim() || null,
        image_alt: imageAlt.trim() || null,
        image_credit:
          imageCredit.trim() || null,
        seo_title: seoTitle.trim() || null,
        meta_description:
          metaDescription.trim() || null,
        status: nextStatus,
        is_featured: featured,
      };

      if (initialFish?.id) {
        await updateFish(
          initialFish.id,
          payload,
        );
      } else {
        await createFish(payload);
      }

      setStatus(nextStatus);
      setMessage(
        nextStatus === "published"
          ? "Fish published successfully."
          : "Fish saved successfully.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not save fish.",
      );
    }
  }

  const fieldStyle = {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid rgba(13,41,34,.18)",
    borderRadius: "8px",
  };

  return (
    <div className="admin-form-section">
      {message && (
        <div className="admin-editor-success">
          {message}
        </div>
      )}

      <section className="admin-panel">
        <p className="admin-eyebrow">IDENTITY</p>

        <div className="admin-form-grid">
          <label>
            Common name
            <input
              value={commonName}
              onChange={(event) => {
                setCommonName(event.target.value);

                if (!initialFish) {
                  setSlug(
                    autoSlug(event.target.value),
                  );
                }
              }}
              style={fieldStyle}
            />
          </label>

          <label>
            Scientific name
            <input
              value={scientificName}
              onChange={(event) =>
                setScientificName(event.target.value)
              }
              style={fieldStyle}
            />
          </label>

          <label>
            Slug
            <input
              value={slug}
              onChange={(event) =>
                setSlug(event.target.value)
              }
              style={fieldStyle}
            />
          </label>
        </div>
      </section>

      <section className="admin-panel">
        <p className="admin-eyebrow">DESCRIPTION</p>

        <label>
          Summary
          <textarea
            value={summary}
            onChange={(event) =>
              setSummary(event.target.value)
            }
            rows={3}
            style={fieldStyle}
          />
        </label>

        <label style={{ display: "block", marginTop: "1rem" }}>
          Description
          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            rows={8}
            style={fieldStyle}
          />
        </label>
      </section>

      <section className="admin-panel">
        <p className="admin-eyebrow">POND REQUIREMENTS</p>

        <div className="admin-form-grid">
          <label>
            Maximum length (cm)
            <input
              type="number"
              value={maxLength}
              onChange={(event) =>
                setMaxLength(event.target.value)
              }
              style={fieldStyle}
            />
          </label>

          <label>
            Minimum pond volume (litres)
            <input
              type="number"
              value={minimumVolume}
              onChange={(event) =>
                setMinimumVolume(event.target.value)
              }
              style={fieldStyle}
            />
          </label>

          <label>
            Minimum pond depth (cm)
            <input
              type="number"
              value={minimumDepth}
              onChange={(event) =>
                setMinimumDepth(event.target.value)
              }
              style={fieldStyle}
            />
          </label>

          <label>
            Minimum temperature (°C)
            <input
              type="number"
              value={minTemperature}
              onChange={(event) =>
                setMinTemperature(event.target.value)
              }
              style={fieldStyle}
            />
          </label>

          <label>
            Maximum temperature (°C)
            <input
              type="number"
              value={maxTemperature}
              onChange={(event) =>
                setMaxTemperature(event.target.value)
              }
              style={fieldStyle}
            />
          </label>

          <label>
            Care level
            <select
              value={careLevel}
              onChange={(event) =>
                setCareLevel(event.target.value)
              }
              style={fieldStyle}
            >
              <option value="">Not set</option>
              <option value="easy">Easy</option>
              <option value="moderate">
                Moderate
              </option>
              <option value="advanced">
                Advanced
              </option>
            </select>
          </label>
        </div>
      </section>

      <section className="admin-panel">
        <p className="admin-eyebrow">CARE</p>

        <label>
          Diet
          <textarea
            value={diet}
            onChange={(event) =>
              setDiet(event.target.value)
            }
            rows={3}
            style={fieldStyle}
          />
        </label>

        <label style={{ display: "block", marginTop: "1rem" }}>
          Temperament
          <textarea
            value={temperament}
            onChange={(event) =>
              setTemperament(event.target.value)
            }
            rows={3}
            style={fieldStyle}
          />
        </label>

        <label style={{ display: "block", marginTop: "1rem" }}>
          Compatibility notes
          <textarea
            value={compatibility}
            onChange={(event) =>
              setCompatibility(event.target.value)
            }
            rows={4}
            style={fieldStyle}
          />
        </label>

        <label style={{ display: "block", marginTop: "1rem" }}>
          Care notes
          <textarea
            value={careNotes}
            onChange={(event) =>
              setCareNotes(event.target.value)
            }
            rows={6}
            style={fieldStyle}
          />
        </label>

        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            marginTop: "1rem",
            flexWrap: "wrap",
          }}
        >
          <label>
            <input
              type="checkbox"
              checked={smallPond}
              onChange={(event) =>
                setSmallPond(event.target.checked)
              }
            />{" "}
            Suitable for small ponds
          </label>

          <label>
            <input
              type="checkbox"
              checked={wildlifePond}
              onChange={(event) =>
                setWildlifePond(event.target.checked)
              }
            />{" "}
            Suitable for wildlife ponds
          </label>
        </div>
      </section>

      <section className="admin-panel">
        <p className="admin-eyebrow">IMAGE</p>

        <label>
          Image URL
          <input
            value={imageUrl}
            onChange={(event) =>
              setImageUrl(event.target.value)
            }
            style={fieldStyle}
          />
        </label>

        <label style={{ display: "block", marginTop: "1rem" }}>
          Image alt text
          <input
            value={imageAlt}
            onChange={(event) =>
              setImageAlt(event.target.value)
            }
            style={fieldStyle}
          />
        </label>

        <label style={{ display: "block", marginTop: "1rem" }}>
          Image credit
          <input
            value={imageCredit}
            onChange={(event) =>
              setImageCredit(event.target.value)
            }
            style={fieldStyle}
          />
        </label>
      </section>

      <section className="admin-panel">
        <p className="admin-eyebrow">SEO</p>

        <label>
          SEO title
          <input
            value={seoTitle}
            onChange={(event) =>
              setSeoTitle(event.target.value)
            }
            style={fieldStyle}
          />
        </label>

        <label style={{ display: "block", marginTop: "1rem" }}>
          Meta description
          <textarea
            value={metaDescription}
            onChange={(event) =>
              setMetaDescription(event.target.value)
            }
            rows={4}
            style={fieldStyle}
          />
        </label>
      </section>

      <section className="admin-panel">
        <p className="admin-eyebrow">PUBLISHING</p>

        <label>
          Status
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            style={fieldStyle}
          >
            <option value="draft">Draft</option>
            <option value="published">
              Published
            </option>
          </select>
        </label>

        <label
          style={{
            display: "block",
            marginTop: "1rem",
          }}
        >
          <input
            type="checkbox"
            checked={featured}
            onChange={(event) =>
              setFeatured(event.target.checked)
            }
          />{" "}
          Featured fish
        </label>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginTop: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            className="admin-secondary-button"
            onClick={() => void save("draft")}
          >
            Save draft
          </button>

          <button
            type="button"
            className="admin-primary-button"
            onClick={() => void save("published")}
          >
            Publish fish
          </button>
        </div>
      </section>
    </div>
  );
}
