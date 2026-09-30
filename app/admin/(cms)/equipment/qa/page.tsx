import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type ResearchSource = {
  title?: string;
  url?: string;
};

type Equipment = {
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

  specifications: unknown;

  best_for: string | null;
  limitations: string | null;
  installation_notes: string | null;
  maintenance_notes: string | null;
  safety_notes: string | null;

  manufacturer_url: string | null;
  research_sources: unknown;

  image_url: string | null;
  image_alt: string | null;
  image_credit: string | null;

  seo_title: string | null;
  meta_description: string | null;

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
  equipment: Equipment;
  issues: Issue[];
  result: "pass" | "review";
};

function textLength(
  value: string | null,
) {
  return value?.trim().length ?? 0;
}

function validHttpUrl(
  value: unknown,
) {
  if (
    typeof value !== "string"
  ) {
    return false;
  }

  try {
    const url =
      new URL(value);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}

function hostnameFrom(
  value: unknown,
) {
  if (!validHttpUrl(value)) {
    return null;
  }

  try {
    return new URL(
      value as string,
    ).hostname
      .toLowerCase()
      .replace(/^www\./, "");
  } catch {
    return null;
  }
}

function sourcesFrom(
  value: unknown,
): ResearchSource[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (
      item,
    ): item is ResearchSource =>
      typeof item ===
        "object" &&
      item !== null,
  );
}

function specificationCount(
  value: unknown,
) {
  if (
    typeof value !==
      "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return 0;
  }

  return Object.keys(
    value,
  ).length;
}

function auditEquipment(
  equipment: Equipment,
): AuditResult {
  const issues: Issue[] = [];

  const error = (
    message: string,
  ) =>
    issues.push({
      level: "error",
      message,
    });

  const review = (
    message: string,
  ) =>
    issues.push({
      level: "review",
      message,
    });

  const evidence = (
    message: string,
  ) =>
    issues.push({
      level: "evidence",
      message,
    });

  /*
   * IDENTITY
   */

  if (!equipment.name.trim()) {
    error(
      "Equipment name is missing.",
    );
  }

  if (!equipment.brand?.trim()) {
    error(
      "Manufacturer / brand is missing.",
    );
  }

  if (!equipment.slug.trim()) {
    error("Slug is missing.");
  }

  if (
    !equipment
      .manufacturer_product_code
      ?.trim()
  ) {
    review(
      "Manufacturer product code is unknown — verify whether the manufacturer publishes one.",
    );
  } else {
    evidence(
      "Manufacturer product code is stored and should be verified against the first-party source.",
    );
  }

  if (
    !equipment.equipment_type
      ?.trim()
  ) {
    error(
      "Equipment type is missing.",
    );
  }

  /*
   * CORE CONTENT
   */

  if (
    textLength(
      equipment.summary,
    ) < 40
  ) {
    error(
      "Summary is missing or unusually short.",
    );
  }

  if (
    textLength(
      equipment.description,
    ) < 120
  ) {
    error(
      "Description is missing or unusually short.",
    );
  }

  /*
   * NUMERIC SANITY
   *
   * Null is valid. Manufacturer evidence
   * may genuinely not establish a value.
   */

  const numericFields = [
    [
      "Maximum flow",
      equipment.max_flow_lph,
    ],
    [
      "Maximum head",
      equipment.max_head_m,
    ],
    [
      "Power",
      equipment.power_watts,
    ],
    [
      "Maximum pond volume",
      equipment.max_pond_volume_litres,
    ],
    [
      "Maximum fish pond volume",
      equipment.max_fish_pond_volume_litres,
    ],
    [
      "Maximum koi pond volume",
      equipment.max_koi_pond_volume_litres,
    ],
    [
      "UV wattage",
      equipment.uv_watts,
    ],
    [
      "Cable length",
      equipment.cable_length_m,
    ],
  ] as const;

  for (
    const [
      label,
      value,
    ] of numericFields
  ) {
    if (
      value !== null &&
      (!Number.isFinite(
        value,
      ) ||
        value < 0)
    ) {
      error(
        `${label} contains an invalid value.`,
      );
    }
  }

  /*
   * STRUCTURED SPECS
   */

  const specCount =
    specificationCount(
      equipment.specifications,
    );

  if (specCount === 0) {
    review(
      "No structured manufacturer specifications are stored.",
    );
  } else {
    evidence(
      `${specCount} structured specification field(s) are stored for verification.`,
    );
  }

  /*
   * EDITORIAL GUIDANCE
   */

  if (
    !equipment.best_for
      ?.trim()
  ) {
    review(
      "Best-for guidance is missing.",
    );
  }

  if (
    !equipment
      .installation_notes
      ?.trim()
  ) {
    evidence(
      "Installation notes were not established by the stored research.",
    );
  }

  if (
    !equipment
      .maintenance_notes
      ?.trim()
  ) {
    evidence(
      "Maintenance notes were not established by the stored research.",
    );
  }

  if (
    !equipment
      .safety_notes
      ?.trim()
  ) {
    evidence(
      "Safety notes were not established by the stored research.",
    );
  }

  /*
   * MANUFACTURER EVIDENCE
   */

  if (
    !validHttpUrl(
      equipment.manufacturer_url,
    )
  ) {
    error(
      "Manufacturer product URL is missing or invalid.",
    );
  }

  const manufacturerHost =
    hostnameFrom(
      equipment.manufacturer_url,
    );

  const sources =
    sourcesFrom(
      equipment.research_sources,
    );

  if (
    sources.length === 0
  ) {
    error(
      "No research sources stored.",
    );
  }

  for (
    const source of sources
  ) {
    if (
      !source.title?.trim()
    ) {
      review(
        "A research source has no title.",
      );
    }

    if (
      !validHttpUrl(
        source.url,
      )
    ) {
      error(
        "A research source has an invalid URL.",
      );

      continue;
    }

    const sourceHost =
      hostnameFrom(
        source.url,
      );

    if (
      manufacturerHost &&
      sourceHost &&
      sourceHost !==
        manufacturerHost &&
      !sourceHost.endsWith(
        `.${manufacturerHost}`,
      ) &&
      !manufacturerHost.endsWith(
        `.${sourceHost}`,
      )
    ) {
      review(
        `Research source is outside the manufacturer domain: ${sourceHost}`,
      );
    }
  }

  if (
    manufacturerHost &&
    sources.length > 0
  ) {
    const firstParty =
      sources.some(
        (source) => {
          const sourceHost =
            hostnameFrom(
              source.url,
            );

          return Boolean(
            sourceHost &&
              (sourceHost ===
                manufacturerHost ||
                sourceHost.endsWith(
                  `.${manufacturerHost}`,
                ) ||
                manufacturerHost.endsWith(
                  `.${sourceHost}`,
                )),
          );
        },
      );

    if (!firstParty) {
      error(
        "No stored research source matches the manufacturer domain.",
      );
    } else {
      evidence(
        "First-party manufacturer research evidence is stored.",
      );
    }
  }

  /*
   * CONFLICT / LIMITATION REVIEW
   *
   * Null factual fields are not automatically
   * errors. Manufacturer conflicts should remain
   * visible rather than being guessed away.
   */

  const limitations =
    equipment.limitations
      ?.toLowerCase() ??
    "";

  if (
    limitations.includes(
      "conflict",
    ) ||
    limitations.includes(
      "conflicting",
    ) ||
    limitations.includes(
      "cannot be resolved",
    )
  ) {
    review(
      "Stored manufacturer evidence contains an unresolved conflict.",
    );
  }

  if (
    equipment.limitations
      ?.trim()
  ) {
    evidence(
      "Limitations are documented for human review.",
    );
  }

  /*
   * IMAGE
   */

  if (!equipment.image_url) {
    review(
      "Equipment needs an image.",
    );
  }

  if (
    equipment.image_url &&
    !equipment.image_alt
      ?.trim()
  ) {
    review(
      "Equipment has an image but no alt text.",
    );
  }

  if (
    equipment.image_url &&
    equipment.image_credit
      ?.toLowerCase()
      .includes(
        "ai-generated",
      )
  ) {
    evidence(
      "Equipment uses a disclosed AI-generated illustrative image.",
    );
  }

  /*
   * SEO
   */

  const seoLength =
    textLength(
      equipment.seo_title,
    );

  if (
    seoLength === 0
  ) {
    error(
      "SEO title is missing.",
    );
  } else if (
    seoLength > 65
  ) {
    review(
      `SEO title is ${seoLength} characters.`,
    );
  }

  const metaLength =
    textLength(
      equipment.meta_description,
    );

  if (
    metaLength === 0
  ) {
    error(
      "Meta description is missing.",
    );
  } else if (
    metaLength > 170
  ) {
    review(
      `Meta description is ${metaLength} characters.`,
    );
  }

  /*
   * PUBLICATION CONSISTENCY
   */

  if (
    equipment.status ===
      "published" &&
    !equipment.published_at
  ) {
    error(
      "Equipment is published but has no publication date.",
    );
  }

  if (
    equipment.status !==
      "published" &&
    equipment.published_at
  ) {
    review(
      "Draft/non-published equipment has a publication date.",
    );
  }

  return {
    equipment,
    issues,
    result:
      issues.some(
        (issue) =>
          issue.level ===
            "error" ||
          issue.level ===
            "review",
      )
        ? "review"
        : "pass",
  };
}

export default async function EquipmentQaPage() {
  const supabase =
    await createClient();

  const { data, error } =
    await supabase
      .from("equipment")
      .select(`
        id,
        name,
        brand,
        model,
        manufacturer_product_code,
        slug,
        equipment_type,
        summary,
        description,
        max_flow_lph,
        max_head_m,
        power_watts,
        max_pond_volume_litres,
        max_fish_pond_volume_litres,
        max_koi_pond_volume_litres,
        uv_watts,
        cable_length_m,
        specifications,
        best_for,
        limitations,
        installation_notes,
        maintenance_notes,
        safety_notes,
        manufacturer_url,
        research_sources,
        image_url,
        image_alt,
        image_credit,
        seo_title,
        meta_description,
        status,
        published_at
      `)
      .order("name", {
        ascending: true,
      });

  if (error) {
    throw new Error(
      `Could not run equipment QA: ${error.message}`,
    );
  }

  const equipment =
    (data ?? []) as Equipment[];

  /*
   * Whole-dataset duplicate checks.
   */

  const slugCounts =
    new Map<
      string,
      number
    >();

  const productCodeCounts =
    new Map<
      string,
      number
    >();

  const identityCounts =
    new Map<
      string,
      number
    >();

  for (
    const item of equipment
  ) {
    const slug =
      item.slug
        .trim()
        .toLowerCase();

    if (slug) {
      slugCounts.set(
        slug,
        (slugCounts.get(
          slug,
        ) ?? 0) + 1,
      );
    }

    const code =
      item
        .manufacturer_product_code
        ?.trim()
        .toLowerCase();

    if (
      code &&
      item.brand?.trim()
    ) {
      const key =
        `${item.brand
          .trim()
          .toLowerCase()}::${code}`;

      productCodeCounts.set(
        key,
        (productCodeCounts.get(
          key,
        ) ?? 0) + 1,
      );
    }

    if (
      item.brand?.trim() &&
      item.name.trim()
    ) {
      const key =
        `${item.brand
          .trim()
          .toLowerCase()}::${item.name
          .trim()
          .toLowerCase()}`;

      identityCounts.set(
        key,
        (identityCounts.get(
          key,
        ) ?? 0) + 1,
      );
    }
  }

  const results:
    AuditResult[] =
    equipment.map(
      (item) => {
        const result =
          auditEquipment(
            item,
          );

        const slug =
          item.slug
            .trim()
            .toLowerCase();

        if (
          slug &&
          (slugCounts.get(
            slug,
          ) ?? 0) > 1
        ) {
          result.issues.unshift({
            level: "error",
            message:
              "Duplicate slug detected.",
          });
        }

        const code =
          item
            .manufacturer_product_code
            ?.trim()
            .toLowerCase();

        if (
          code &&
          item.brand?.trim()
        ) {
          const key =
            `${item.brand
              .trim()
              .toLowerCase()}::${code}`;

          if (
            (productCodeCounts.get(
              key,
            ) ?? 0) > 1
          ) {
            result.issues.unshift({
              level: "error",
              message:
                "Duplicate manufacturer product code detected for this brand.",
            });
          }
        }

        if (
          item.brand?.trim() &&
          item.name.trim()
        ) {
          const key =
            `${item.brand
              .trim()
              .toLowerCase()}::${item.name
              .trim()
              .toLowerCase()}`;

          if (
            (identityCounts.get(
              key,
            ) ?? 0) > 1
          ) {
            result.issues.unshift({
              level: "review",
              message:
                "Brand + product name is used by another equipment record.",
            });
          }
        }

        result.result =
          result.issues.some(
            (issue) =>
              issue.level ===
                "error" ||
              issue.level ===
                "review",
          )
            ? "review"
            : "pass";

        return result;
      },
    );

  results.sort(
    (a, b) => {
      if (
        a.result !==
        b.result
      ) {
        return a.result ===
          "review"
          ? -1
          : 1;
      }

      const aErrors =
        a.issues.filter(
          (issue) =>
            issue.level ===
            "error",
        ).length;

      const bErrors =
        b.issues.filter(
          (issue) =>
            issue.level ===
            "error",
        ).length;

      if (
        aErrors !== bErrors
      ) {
        return (
          bErrors -
          aErrors
        );
      }

      return a.equipment.name.localeCompare(
        b.equipment.name,
      );
    },
  );

  const passCount =
    results.filter(
      (result) =>
        result.result ===
        "pass",
    ).length;

  const reviewCount =
    results.length -
    passCount;

  const errorCount =
    results.filter(
      (result) =>
        result.issues.some(
          (issue) =>
            issue.level ===
            "error",
        ),
    ).length;

  const evidenceCount =
    results.filter(
      (result) =>
        result.issues.some(
          (issue) =>
            issue.level ===
            "evidence",
        ),
    ).length;

  const withoutImages =
    equipment.filter(
      (item) =>
        !item.image_url,
    ).length;

  const publishedCount =
    equipment.filter(
      (item) =>
        item.status ===
        "published",
    ).length;

  return (
    <main className="admin-content">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">
            DATABASE QA
          </p>

          <h1>
            Equipment quality audit
          </h1>

          <p>
            Structural,
            manufacturer-evidence
            and pre-publication
            checks across the
            PondStuff equipment
            database.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/admin/equipment/batch"
            className="admin-secondary-button"
          >
            Batch Builder
          </Link>

          <Link
            href="/admin/equipment"
            className="admin-secondary-button"
          >
            ← Equipment
          </Link>
        </div>
      </div>

      <section
        className="admin-panel"
        style={{
          marginBottom:
            "1.5rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "1rem",
          }}
        >
          <Stat
            value={
              results.length
            }
            label="Checked"
          />

          <Stat
            value={
              passCount
            }
            label="Pass"
          />

          <Stat
            value={
              reviewCount
            }
            label="Review"
          />

          <Stat
            value={
              errorCount
            }
            label="Structural errors"
          />

          <Stat
            value={
              evidenceCount
            }
            label="Evidence checks"
          />

          <Stat
            value={
              withoutImages
            }
            label="Need images"
          />

          <Stat
            value={
              publishedCount
            }
            label="Published"
          />
        </div>
      </section>

      <section className="admin-panel">
        <div
          style={{
            display: "grid",
            gap: "1rem",
          }}
        >
          {results.map(
            (result) => (
              <article
                key={
                  result.equipment
                    .id
                }
                style={{
                  border:
                    "1px solid #d9e1dc",
                  borderRadius:
                    "14px",
                  padding:
                    "1rem",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    gap: "1rem",
                    alignItems:
                      "flex-start",
                    flexWrap:
                      "wrap",
                  }}
                >
                  <div>
                    <strong>
                      {
                        result
                          .equipment
                          .name
                      }
                    </strong>

                    <div
                      style={{
                        marginTop:
                          "0.25rem",
                        opacity:
                          0.7,
                      }}
                    >
                      {result
                        .equipment
                        .brand ??
                        "Unknown brand"}
                      {" · "}
                      {
                        result
                          .equipment
                          .equipment_type
                      }
                      {" · "}
                      {
                        result
                          .equipment
                          .status
                      }
                    </div>
                  </div>

                  <div
                    style={{
                      display:
                        "flex",
                      gap:
                        "0.75rem",
                      alignItems:
                        "center",
                    }}
                  >
                    <strong>
                      {result.result ===
                      "pass"
                        ? "PASS"
                        : "REVIEW"}
                    </strong>

                    <Link
                      href={`/admin/equipment/${result.equipment.id}/edit`}
                    >
                      Open
                    </Link>
                  </div>
                </div>

                {result.issues
                  .length >
                0 ? (
                  <div
                    style={{
                      display:
                        "grid",
                      gap:
                        "0.4rem",
                      marginTop:
                        "0.9rem",
                    }}
                  >
                    {result.issues.map(
                      (
                        issue,
                        index,
                      ) => (
                        <div
                          key={`${issue.level}-${index}`}
                          style={{
                            fontSize:
                              "0.9rem",
                          }}
                        >
                          <strong>
                            {issue.level ===
                            "error"
                              ? "ERROR"
                              : issue.level ===
                                  "review"
                                ? "REVIEW"
                                : "EVIDENCE"}
                            :
                          </strong>{" "}
                          {
                            issue.message
                          }
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <p
                    style={{
                      marginTop:
                        "0.75rem",
                    }}
                  >
                    No QA issues
                    detected.
                  </p>
                )}
              </article>
            ),
          )}

          {results.length ===
          0 ? (
            <p>
              No equipment records
              to audit yet.
            </p>
          ) : null}
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
    <div>
      <strong
        style={{
          display: "block",
          fontSize: "1.8rem",
          lineHeight: 1,
        }}
      >
        {value}
      </strong>

      <span
        style={{
          display: "block",
          marginTop:
            "0.4rem",
          opacity: 0.7,
        }}
      >
        {label}
      </span>
    </div>
  );
}
