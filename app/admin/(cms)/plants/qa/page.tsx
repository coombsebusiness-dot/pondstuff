import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type ResearchSource = {
  title?: string;
  url?: string;
};

type Plant = {
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
  flowering_months: string[] | null;

  is_native_uk: boolean | null;
  is_oxygenating: boolean | null;
  is_wildlife_friendly: boolean | null;
  is_small_pond_suitable: boolean | null;

  is_plant_finder_suitable: boolean;

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

  seo_title: string | null;
  meta_description: string | null;

  research_sources: unknown;

  status: string;
  published_at: string | null;
};

type IssueLevel =
  | "error"
  | "review"
  | "evidence";

type Issue = {
  level: IssueLevel;
  message: string;
};

type AuditResult = {
  plant: Plant;
  issues: Issue[];
  result: "pass" | "review";
};

function textLength(
  value: string | null,
) {
  return value?.trim().length ?? 0;
}

function validHttpUrl(value: unknown) {
  if (typeof value !== "string") {
    return false;
  }

  try {
    const url = new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

function sourcesFrom(
  value: unknown,
): ResearchSource[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is ResearchSource =>
      typeof item === "object" &&
      item !== null,
  );
}

function auditPlant(
  plant: Plant,
): AuditResult {
  const issues: Issue[] = [];

  const error = (message: string) =>
    issues.push({
      level: "error",
      message,
    });

  const review = (message: string) =>
    issues.push({
      level: "review",
      message,
    });

  const evidence = (message: string) =>
    issues.push({
      level: "evidence",
      message,
    });

  /*
   * IDENTITY
   */

  if (!plant.common_name.trim()) {
    error("Common name is missing.");
  }

  if (!plant.scientific_name?.trim()) {
    error("Scientific name is missing.");
  }

  if (!plant.slug.trim()) {
    error("Slug is missing.");
  }

  if (
    !plant.plant_type &&
    plant.is_plant_finder_suitable
  ) {
    review("Plant type is unknown.");
  }

  if (!plant.is_plant_finder_suitable) {
    evidence(
      "Held out of the public Plant Finder pending suitability or taxonomy review.",
    );
  }

  /*
   * CORE CONTENT
   */

  if (textLength(plant.summary) < 40) {
    error(
      "Summary is missing or unusually short.",
    );
  }

  if (textLength(plant.description) < 120) {
    error(
      "Description is missing or unusually short.",
    );
  }

  /*
   * DEPTH SANITY
   */

  if (
    plant.min_planting_depth_cm !== null &&
    plant.max_planting_depth_cm !== null &&
    plant.min_planting_depth_cm >
      plant.max_planting_depth_cm
  ) {
    error(
      "Minimum planting depth is greater than maximum planting depth.",
    );
  }

  if (
    plant.min_water_depth_cm !== null &&
    plant.max_water_depth_cm !== null &&
    plant.min_water_depth_cm >
      plant.max_water_depth_cm
  ) {
    error(
      "Minimum water depth is greater than maximum water depth.",
    );
  }

  const numericFields = [
    [
      "Minimum planting depth",
      plant.min_planting_depth_cm,
    ],
    [
      "Maximum planting depth",
      plant.max_planting_depth_cm,
    ],
    [
      "Minimum water depth",
      plant.min_water_depth_cm,
    ],
    [
      "Maximum water depth",
      plant.max_water_depth_cm,
    ],
    [
      "Maximum height",
      plant.max_height_cm,
    ],
    [
      "Maximum spread",
      plant.max_spread_cm,
    ],
  ] as const;

  for (const [label, value] of numericFields) {
    if (
      value !== null &&
      (!Number.isFinite(value) || value < 0)
    ) {
      error(
        `${label} contains an invalid value.`,
      );
    }
  }

  /*
   * TRI-STATE FACTS
   *
   * Null is NOT automatically an error.
   * Our research pipeline deliberately uses
   * null when evidence did not establish a
   * defensible yes/no answer.
   */

  const unknownSuitability = [
    plant.is_native_uk,
    plant.is_oxygenating,
    plant.is_wildlife_friendly,
    plant.is_small_pond_suitable,
  ].filter((value) => value === null).length;

  if (unknownSuitability >= 3) {
    evidence(
      `${unknownSuitability} suitability/native fields remain unknown because the stored research did not establish them.`,
    );
  }

  /*
   * GROWING INFORMATION
   */

  if (!plant.sunlight) {
    evidence(
      "Sunlight requirement was not established by the stored research.",
    );
  }

  if (!plant.care_level) {
    evidence(
      "Care level was not established by the stored research.",
    );
  }

  if (!plant.planting_method?.trim()) {
    evidence(
      "Planting method was not established by the stored research.",
    );
  }

  if (!plant.maintenance_notes?.trim()) {
    review("Maintenance notes are missing.");
  }

  /*
   * RESEARCH PROVENANCE
   */

  const sources =
    sourcesFrom(plant.research_sources);

  if (sources.length === 0) {
    error("No research sources stored.");
  }

  if (sources.length === 1) {
    review(
      "Only one research source is stored.",
    );
  }

  for (const source of sources) {
    if (!source.title?.trim()) {
      review(
        "A research source has no title.",
      );
    }

    if (!validHttpUrl(source.url)) {
      error(
        "A research source has an invalid URL.",
      );
    }
  }

  /*
   * HIGH-RISK FACTS
   *
   * These are deliberately surfaced for
   * human review rather than pretending
   * that structural validation proves them.
   */

  if (plant.is_native_uk !== null) {
    evidence(
      "Native UK status has stored evidence to verify before publication.",
    );
  }

  if (
    plant.legal_status_uk?.trim() ||
    plant.legal_status_notes?.trim()
  ) {
    evidence(
      "UK legal-status information has stored evidence to verify before publication.",
    );
  }

  /*
   * SEO
   */

  const seoLength =
    textLength(plant.seo_title);

  if (seoLength === 0) {
    error("SEO title is missing.");
  } else if (seoLength > 65) {
    review(
      `SEO title is ${seoLength} characters.`,
    );
  }

  const metaLength =
    textLength(plant.meta_description);

  if (metaLength === 0) {
    error(
      "Meta description is missing.",
    );
  } else if (metaLength > 170) {
    review(
      `Meta description is ${metaLength} characters.`,
    );
  }

  /*
   * IMAGE
   *
   * Missing images are expected right now,
   * so they do not make a record fail QA.
   */

  if (
    plant.image_url &&
    !plant.image_alt?.trim()
  ) {
    review(
      "Plant has an image but no alt text.",
    );
  }

  /*
   * PUBLICATION CONSISTENCY
   */

  if (
    plant.status === "published" &&
    !plant.published_at
  ) {
    error(
      "Plant is published but has no publication date.",
    );
  }

  if (
    plant.status !== "published" &&
    plant.published_at
  ) {
    review(
      "Draft/non-published plant has a publication date.",
    );
  }

  return {
    plant,
    issues,
    result:
      issues.some(
        (issue) =>
          issue.level === "error" ||
          issue.level === "review",
      )
        ? "review"
        : "pass",
  };
}

export default async function PlantQaPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("plants")
    .select(`
      id,
      common_name,
      scientific_name,
      slug,
      plant_type,
      summary,
      description,
      min_planting_depth_cm,
      max_planting_depth_cm,
      min_water_depth_cm,
      max_water_depth_cm,
      max_height_cm,
      max_spread_cm,
      sunlight,
      flowering_months,
      is_native_uk,
      is_oxygenating,
      is_wildlife_friendly,
      is_small_pond_suitable,
      is_plant_finder_suitable,
      hardiness,
      growth_habit,
      planting_method,
      winter_behaviour,
      propagation,
      maintenance_notes,
      legal_status_uk,
      legal_status_notes,
      care_level,
      image_url,
      image_alt,
      seo_title,
      meta_description,
      research_sources,
      status,
      published_at
    `)
    .order("common_name", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Could not run plant QA: ${error.message}`,
    );
  }

  const plants = (data ?? []) as Plant[];

  /*
   * Duplicate checks need the whole dataset.
   */

  const nameCounts = new Map<
    string,
    number
  >();

  const slugCounts = new Map<
    string,
    number
  >();

  const scientificCounts = new Map<
    string,
    number
  >();

  for (const plant of plants) {
    const name =
      plant.common_name
        .trim()
        .toLowerCase();

    const slug =
      plant.slug
        .trim()
        .toLowerCase();

    if (name) {
      nameCounts.set(
        name,
        (nameCounts.get(name) ?? 0) + 1,
      );
    }

    if (slug) {
      slugCounts.set(
        slug,
        (slugCounts.get(slug) ?? 0) + 1,
      );
    }

    const scientific =
      plant.scientific_name
        ?.trim()
        .toLowerCase();

    if (scientific) {
      scientificCounts.set(
        scientific,
        (
          scientificCounts.get(
            scientific,
          ) ?? 0
        ) + 1,
      );
    }
  }

  const results: AuditResult[] =
    plants.map((plant) => {
      const result =
        auditPlant(plant);

      const name =
        plant.common_name
          .trim()
          .toLowerCase();

      const slug =
        plant.slug
          .trim()
          .toLowerCase();

      const scientific =
        plant.scientific_name
          ?.trim()
          .toLowerCase();

      if (
        name &&
        (nameCounts.get(name) ?? 0) > 1
      ) {
        result.issues.unshift({
          level: "error",
          message:
            "Duplicate common name detected.",
        });
      }

      if (
        slug &&
        (slugCounts.get(slug) ?? 0) > 1
      ) {
        result.issues.unshift({
          level: "error",
          message:
            "Duplicate slug detected.",
        });
      }

      if (
        scientific &&
        (
          scientificCounts.get(
            scientific,
          ) ?? 0
        ) > 1
      ) {
        result.issues.unshift({
          level: "review",
          message:
            "Scientific name is used by another record — check whether these are intentional cultivars/duplicates.",
        });
      }

      result.result =
        result.issues.some(
          (issue) =>
            issue.level === "error" ||
            issue.level === "review",
        )
          ? "review"
          : "pass";

      return result;
    });

  /*
   * Put records needing attention first.
   */

  results.sort((a, b) => {
    if (a.result !== b.result) {
      return a.result === "review"
        ? -1
        : 1;
    }

    const aErrors =
      a.issues.filter(
        (issue) =>
          issue.level === "error",
      ).length;

    const bErrors =
      b.issues.filter(
        (issue) =>
          issue.level === "error",
      ).length;

    if (aErrors !== bErrors) {
      return bErrors - aErrors;
    }

    return a.plant.common_name.localeCompare(
      b.plant.common_name,
    );
  });

  const passCount =
    results.filter(
      (result) =>
        result.result === "pass",
    ).length;

  const reviewCount =
    results.length - passCount;

  const errorPlants =
    results.filter((result) =>
      result.issues.some(
        (issue) =>
          issue.level === "error",
      ),
    ).length;

  const heldPlants =
    plants.filter(
      (plant) =>
        !plant.is_plant_finder_suitable,
    ).length;

  const launchReadyPlants =
    results.filter(
      (result) =>
        result.plant
          .is_plant_finder_suitable &&
        result.result === "pass",
    ).length;

  const evidencePlants =
    results.filter((result) =>
      result.issues.some(
        (issue) =>
          issue.level === "evidence",
      ),
    ).length;

  const reviewIssueCounts =
    new Map<string, number>();

  for (const result of results) {
    for (const issue of result.issues) {
      if (issue.level !== "review") {
        continue;
      }

      reviewIssueCounts.set(
        issue.message,
        (reviewIssueCounts.get(
          issue.message,
        ) ?? 0) + 1,
      );
    }
  }

  const reviewIssueSummary =
    [...reviewIssueCounts.entries()]
      .sort((a, b) => b[1] - a[1]);

  const withoutImages =
    plants.filter(
      (plant) => !plant.image_url,
    ).length;

  return (
    <main className="admin-content">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">
            DATABASE QA
          </p>

          <h1>Plant quality audit</h1>

          <p>
            Structural pre-publication
            checks across the PondStuff
            plant database.
          </p>
        </div>

        <Link
          href="/admin/plants"
          className="admin-secondary-button"
        >
          ← Plants
        </Link>
      </div>

      <section
        className="admin-panel"
        style={{
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1rem",
          }}
        >
          <Stat
            value={results.length}
            label="Checked"
          />
          <Stat
            value={launchReadyPlants}
            label="Launch ready"
          />
          <Stat
            value={heldPlants}
            label="Held"
          />

          <Stat
            value={passCount}
            label="Pass"
          />

          <Stat
            value={reviewCount}
            label="Review"
          />

          <Stat
            value={errorPlants}
            label="Structural errors"
          />

          <Stat
            value={evidencePlants}
            label="Evidence checks"
          />
          <Stat
            value={withoutImages}
            label="Need images"
          />
        </div>
      </section>

      {reviewIssueSummary.length > 0 && (
        <section
          className="admin-panel"
          style={{
            marginBottom: "1.5rem",
          }}
        >
          <h2>Review issue summary</h2>

          <p
            style={{
              marginBottom: "1rem",
            }}
          >
            Reasons records currently require
            human review.
          </p>

          <div
            style={{
              display: "grid",
              gap: "0.5rem",
            }}
          >
            {reviewIssueSummary.map(
              ([message, count]) => (
                <div
                  key={message}
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    gap: "1rem",
                    padding:
                      "0.65rem 0",
                    borderBottom:
                      "1px solid rgba(13, 41, 34, 0.08)",
                  }}
                >
                  <span>{message}</span>
                  <strong>{count}</strong>
                </div>
              ),
            )}
          </div>
        </section>
      )}

      <section className="admin-panel">
        <div
          style={{
            marginBottom: "1.5rem",
          }}
        >
          <h2>Audit results</h2>

          <p>
            PASS means no structural or
            content-review issue was found.
            Evidence reminders remain visible
            for sensitive claims that should
            be verified before publication.
            REVIEW means the record needs
            human attention.
          </p>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Plant</th>
                <th>Result</th>
                <th>Issues</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {results.map(
                ({
                  plant,
                  result,
                  issues,
                }) => (
                  <tr key={plant.id}>
                    <td>
                      <strong>
                        {plant.common_name}
                      </strong>

                      <small>
                        {plant.scientific_name ??
                          `/${plant.slug}`}
                      </small>
                    </td>

                    <td>
                      <span
                        className={`admin-status ${
                          result === "pass"
                            ? "admin-status-published"
                            : "admin-status-draft"
                        }`}
                      >
                        {result}
                      </span>
                    </td>

                    <td>
                      {issues.length === 0 ? (
                        <span>—</span>
                      ) : (
                        <div
                          style={{
                            display: "grid",
                            gap: "0.35rem",
                          }}
                        >
                          {issues.map(
                            (issue, index) => (
                              <small
                                key={`${plant.id}-${index}`}
                                style={{
                                  display:
                                    "block",
                                }}
                              >
                                {issue.level ===
                                "error"
                                  ? "⚠ "
                                  : "• "}
                                {issue.message}
                              </small>
                            ),
                          )}
                        </div>
                      )}
                    </td>

                    <td className="admin-table-action">
                      <Link
                        href={`/admin/plants/${plant.id}/edit`}
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Stat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div
      style={{
        border:
          "1px solid rgba(13, 41, 34, 0.12)",
        borderRadius: "16px",
        padding: "1.25rem",
      }}
    >
      <strong
        style={{
          display: "block",
          fontSize: "2rem",
          lineHeight: 1,
          marginBottom: "0.5rem",
        }}
      >
        {value}
      </strong>

      <span>{label}</span>
    </div>
  );
}
