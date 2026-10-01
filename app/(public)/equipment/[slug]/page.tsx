import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import PublicArticlePage, {
  getArticleMetadata,
} from "@/components/articles/PublicArticlePage";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
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

  specifications:
    | Record<string, unknown>
    | null;

  best_for: string | null;
  limitations: string | null;
  installation_notes: string | null;
  maintenance_notes: string | null;
  safety_notes: string | null;

  manufacturer_url: string | null;

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

const typeLabels: Record<string, string> = {
  "pond-pump": "Pond Pump",
  "pond-filter": "Pond Filter",
  "uv-clarifier": "UV Clarifier",
  "air-pump": "Air Pump",
  "pond-vacuum": "Pond Vacuum",
  "pond-liner": "Pond Liner",
  underlay: "Pond Underlay",
  "water-test-kit": "Water Test Kit",
  maintenance: "Pond Maintenance Equipment",
  other: "Pond Equipment",
};

function labelForType(type: string) {
  return (
    typeLabels[type] ??
    type
      .replaceAll("-", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase(),
      )
  );
}

async function getEquipment(
  slug: string,
): Promise<Equipment | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("equipment")
    .select(
      `
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
        image_url,
        image_alt,
        image_credit,
        seo_title,
        meta_description,
        affiliate_url,
        affiliate_network,
        status,
        is_featured,
        published_at
      `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Could not load equipment: ${error.message}`,
    );
  }

  return (data ?? null) as Equipment | null;
}

async function getArticleExists(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select("id")
    .eq("slug", slug)
    .eq("content_type", "equipment")
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Could not check equipment article: ${error.message}`,
    );
  }

  return Boolean(data);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const equipment = await getEquipment(slug);

  if (equipment) {
    return {
      title:
        equipment.seo_title ??
        `${equipment.name} | PondStuff`,
      description:
        equipment.meta_description ??
        equipment.summary ??
        `Information about ${equipment.name}, including specifications, pond suitability and practical considerations.`,
      alternates: {
        canonical:
          `https://pondstuff.co.uk/equipment/${equipment.slug}`,
      },
    };
  }

  return getArticleMetadata(
    slug,
    "equipment",
  );
}

export default async function Page({
  params,
}: PageProps) {
  const { slug } = await params;

  const equipment = await getEquipment(slug);

  if (!equipment) {
    const articleExists =
      await getArticleExists(slug);

    if (articleExists) {
      return (
        <PublicArticlePage
          slug={slug}
          contentType="equipment"
        />
      );
    }

    notFound();
  }

  const displayName =
    equipment.brand &&
    equipment.name
      .toLowerCase()
      .startsWith(
        equipment.brand.toLowerCase(),
      )
      ? equipment.name
      : equipment.brand
        ? `${equipment.brand} ${equipment.name}`
        : equipment.name;

  const specs = [
    [
      "Maximum flow",
      equipment.max_flow_lph != null
        ? `${equipment.max_flow_lph.toLocaleString()} L/h`
        : null,
    ],
    [
      "Maximum head",
      equipment.max_head_m != null
        ? `${equipment.max_head_m} m`
        : null,
    ],
    [
      "Power",
      equipment.power_watts != null
        ? `${equipment.power_watts} W`
        : null,
    ],
    [
      "Maximum pond volume",
      equipment.max_pond_volume_litres != null
        ? `${equipment.max_pond_volume_litres.toLocaleString()} L`
        : null,
    ],
    [
      "Maximum fish pond volume",
      equipment.max_fish_pond_volume_litres != null
        ? `${equipment.max_fish_pond_volume_litres.toLocaleString()} L`
        : null,
    ],
    [
      "Maximum koi pond volume",
      equipment.max_koi_pond_volume_litres != null
        ? `${equipment.max_koi_pond_volume_litres.toLocaleString()} L`
        : null,
    ],
    [
      "UV",
      equipment.uv_watts != null
        ? `${equipment.uv_watts} W`
        : null,
    ],
    [
      "Cable length",
      equipment.cable_length_m != null
        ? `${equipment.cable_length_m} m`
        : null,
    ],
  ].filter(
    (item): item is [string, string] =>
      Boolean(item[1]),
  );

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": displayName,
    "description":
      equipment.description ??
      equipment.summary ??
      undefined,
    "url":
      `https://pondstuff.co.uk/equipment/${equipment.slug}`,
    ...(equipment.image_url
      ? {
          "image": [
            equipment.image_url,
          ],
        }
      : {}),
    ...(equipment.brand
      ? {
          "brand": {
            "@type": "Brand",
            "name": equipment.brand,
          },
        }
      : {}),
    ...(equipment.manufacturer_product_code
      ? {
          "sku":
            equipment.manufacturer_product_code,
        }
      : {}),
    ...(equipment.model
      ? {
          "model": equipment.model,
        }
      : {}),
    ...(equipment.manufacturer_url
      ? {
          "manufacturer": {
            "@type": "Organization",
            "name":
              equipment.brand ??
              equipment.name,
            "url":
              equipment.manufacturer_url,
          },
        }
      : {}),
  };

  const specificationEntries =
    equipment.specifications
      ? Object.entries(
          equipment.specifications,
        ).filter(
          ([, value]) =>
            value !== null &&
            value !== undefined &&
            String(value).trim() !== "",
        )
      : [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />

      <main className="equipment-detail">
      <article>
        <section className="equipment-hero">
          <div className="shell">
            <p className="eyebrow">
              {labelForType(
                equipment.equipment_type,
              )}
            </p>

            <h1>{displayName}</h1>

            {equipment.model ? (
              <p className="equipment-model">
                Model: {equipment.model}
              </p>
            ) : null}

            {equipment.summary ? (
              <p className="equipment-intro">
                {equipment.summary}
              </p>
            ) : null}
          </div>
        </section>

        <section className="equipment-content">
          <div className="shell">
            <div className="equipment-detail-grid">
              <div>
                {equipment.image_url ? (
                  <figure>
                    <img
                      src={equipment.image_url}
                      alt={
                        equipment.image_alt ??
                        displayName
                      }
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: "12px",
                      }}
                    />

                    {equipment.image_credit ? (
                      <figcaption>
                        {equipment.image_credit}
                      </figcaption>
                    ) : null}
                  </figure>
                ) : null}

                {equipment.description ? (
                  <section>
                    <h2>About {displayName}</h2>
                    <p>
                      {equipment.description}
                    </p>
                  </section>
                ) : null}

                {equipment.best_for ? (
                  <section>
                    <h2>Best for</h2>
                    <p>
                      {equipment.best_for}
                    </p>
                  </section>
                ) : null}

                {equipment.limitations ? (
                  <section>
                    <h2>Things to consider</h2>
                    <p>
                      {equipment.limitations}
                    </p>
                  </section>
                ) : null}

                {equipment.installation_notes ? (
                  <section>
                    <h2>Installation</h2>
                    <p>
                      {equipment.installation_notes}
                    </p>
                  </section>
                ) : null}

                {equipment.maintenance_notes ? (
                  <section>
                    <h2>Maintenance</h2>
                    <p>
                      {equipment.maintenance_notes}
                    </p>
                  </section>
                ) : null}

                {equipment.safety_notes ? (
                  <section>
                    <h2>Safety</h2>
                    <p>
                      {equipment.safety_notes}
                    </p>
                  </section>
                ) : null}
              </div>

              <aside>
                {specs.length > 0 ? (
                  <section>
                    <h2>Key specifications</h2>

                    <dl>
                      {specs.map(
                        ([label, value]) => (
                          <div
                            key={label}
                          >
                            <dt>{label}</dt>
                            <dd>{value}</dd>
                          </div>
                        ),
                      )}
                    </dl>
                  </section>
                ) : null}

                {specificationEntries.length >
                0 ? (
                  <section>
                    <h2>
                      Specifications
                    </h2>

                    <dl>
                      {specificationEntries.map(
                        ([label, value]) => (
                          <div
                            key={label}
                          >
                            <dt>
                              {label
                                .replaceAll(
                                  "_",
                                  " ",
                                )
                                .replace(
                                  /\b\w/g,
                                  (letter) =>
                                    letter.toUpperCase(),
                                )}
                            </dt>
                            <dd>
                              {String(value)}
                            </dd>
                          </div>
                        ),
                      )}
                    </dl>
                  </section>
                ) : null}

                {equipment.manufacturer_url ? (
                  <p>
                    <a
                      href={
                        equipment.manufacturer_url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit manufacturer
                    </a>
                  </p>
                ) : null}

                {equipment.affiliate_url ? (
                  <div>
                    <a
                      href={
                        equipment.affiliate_url
                      }
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                    >
                      Check this equipment
                    </a>

                    {equipment.affiliate_network ? (
                      <small>
                        Affiliate link
                      </small>
                    ) : null}
                  </div>
                ) : null}

                {equipment.manufacturer_product_code ? (
                  <p>
                    <strong>
                      Product code:
                    </strong>{" "}
                    {
                      equipment.manufacturer_product_code
                    }
                  </p>
                ) : null}
              </aside>
            </div>
          </div>
        </section>
      </article>
    </main>
    </>
  );
}
