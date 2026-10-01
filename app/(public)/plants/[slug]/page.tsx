import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://pondstuff.co.uk";

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
  max_height_cm: number | null;
  max_spread_cm: number | null;
  sunlight: string | null;
  flowering_months: string[];
  is_native_uk: boolean | null;
  is_oxygenating: boolean;
  is_wildlife_friendly: boolean;
  is_small_pond_suitable: boolean;
  hardiness: string | null;
  care_level: string | null;
  image_url: string | null;
  image_alt: string | null;
  image_credit: string | null;
  seo_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  updated_at: string;
};

const typeLabels: Record<string, string> = {
  marginal: "Marginal pond plant",
  oxygenating: "Oxygenating pond plant",
  floating: "Floating pond plant",
  "water-lily": "Water lily",
  "deep-water": "Deep-water pond plant",
  bog: "Bog plant",
};

const sunlightLabels: Record<string, string> = {
  "full-sun": "Full sun",
  "full-sun-partial-shade":
    "Full sun / partial shade",
  "partial-shade": "Partial shade",
  shade: "Shade",
};

const careLabels: Record<string, string> = {
  easy: "Easy",
  moderate: "Moderate",
  advanced: "Advanced",
};

const monthLabels: Record<string, string> = {
  january: "January",
  february: "February",
  march: "March",
  april: "April",
  may: "May",
  june: "June",
  july: "July",
  august: "August",
  september: "September",
  october: "October",
  november: "November",
  december: "December",
};

async function getPlant(
  slug: string,
): Promise<Plant | null> {
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
      max_height_cm,
      max_spread_cm,
      sunlight,
      flowering_months,
      is_native_uk,
      is_oxygenating,
      is_wildlife_friendly,
      is_small_pond_suitable,
      hardiness,
      care_level,
      image_url,
      image_alt,
      image_credit,
      seo_title,
      meta_description,
      published_at,
      updated_at
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .lte(
      "published_at",
      new Date().toISOString(),
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Could not load plant: ${error.message}`,
    );
  }

  return data as Plant | null;
}

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

function formatMonths(months: string[]) {
  return months
    .map(
      (month) =>
        monthLabels[month.toLowerCase()] ??
        month,
    )
    .join(", ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const plant = await getPlant(slug);

  if (!plant) {
    return {
      title: "Plant not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonical =
    `${siteUrl}/plants/${plant.slug}`;

  const title =
    plant.seo_title ||
    `${plant.common_name} Pond Plant Guide`;

  const description =
    plant.meta_description ||
    plant.summary ||
    undefined;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
      siteName: "PondStuff",
      publishedTime:
        plant.published_at ?? undefined,
      modifiedTime: plant.updated_at,
      images: plant.image_url
        ? [
            {
              url: plant.image_url,
              alt:
                plant.image_alt ||
                plant.common_name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: plant.image_url
        ? "summary_large_image"
        : "summary",
      title,
      description,
      images: plant.image_url
        ? [plant.image_url]
        : undefined,
    },
  };
}

export default async function PlantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const plant = await getPlant(slug);

  if (!plant) {
    notFound();
  }

  const canonical =
    `${siteUrl}/plants/${plant.slug}`;

  const depth = depthLabel(
    plant.min_planting_depth_cm,
    plant.max_planting_depth_cm,
  );

  const months = Array.isArray(
    plant.flowering_months,
  )
    ? plant.flowering_months
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${plant.common_name} pond plant guide`,
    description:
      plant.meta_description ||
      plant.summary ||
      undefined,
    url: canonical,
    datePublished:
      plant.published_at ?? undefined,
    dateModified: plant.updated_at,
    primaryImageOfPage: plant.image_url
      ? {
          "@type": "ImageObject",
          url: plant.image_url,
        }
      : undefined,
    about: {
      "@type": "Thing",
      name: plant.scientific_name
        ? `${plant.common_name} (${plant.scientific_name})`
        : plant.common_name,
    },
    publisher: {
      "@type": "Organization",
      name: "PondStuff",
      url: siteUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <section className="plant-profile-hero">
        <div className="shell">
          <nav
            className="plant-breadcrumbs"
            aria-label="Breadcrumb"
          >
            <Link href="/">Home</Link>
            <span>›</span>
            <Link href="/plants">
              Pond Plants
            </Link>
            <span>›</span>
            <span>
              {plant.common_name}
            </span>
          </nav>

          <div className="plant-profile-hero-grid">
            <div className="plant-profile-copy">
              <p className="eyebrow">
                {plant.plant_type
                  ? typeLabels[
                      plant.plant_type
                    ] ?? "POND PLANT"
                  : "POND PLANT"}
              </p>

              <h1>{plant.common_name}</h1>

              {plant.scientific_name && (
                <p className="plant-profile-scientific">
                  <em>
                    {
                      plant.scientific_name
                    }
                  </em>
                </p>
              )}

              {plant.summary && (
                <p className="plant-profile-intro">
                  {plant.summary}
                </p>
              )}

              <div className="plant-profile-badges">
                {plant.is_native_uk ===
                  true && (
                  <span>UK native</span>
                )}

                {plant.is_oxygenating && (
                  <span>Oxygenating</span>
                )}

                {plant.is_wildlife_friendly && (
                  <span>
                    Wildlife friendly
                  </span>
                )}

                {plant.is_small_pond_suitable && (
                  <span>
                    Small pond suitable
                  </span>
                )}
              </div>
            </div>

            {plant.image_url && (
              <figure className="plant-profile-image">
                <img
                  src={plant.image_url}
                  alt={
                    plant.image_alt ||
                    plant.common_name
                  }
                />

                {plant.image_credit && (
                  <figcaption>
                    {plant.image_credit}
                  </figcaption>
                )}
              </figure>
            )}
          </div>
        </div>
      </section>

      <section className="plant-profile-section">
        <div className="shell plant-profile-layout">
          <main className="plant-profile-main">
            {plant.description && (
              <div className="plant-profile-content">
                <p className="eyebrow">
                  PLANT PROFILE
                </p>

                <h2>
                  About {plant.common_name}
                </h2>

                {plant.description
                  .split(/\n+/)
                  .filter(Boolean)
                  .map((paragraph, index) => (
                    <p key={index}>
                      {paragraph}
                    </p>
                  ))}
              </div>
            )}

            <div className="plant-profile-content">
              <p className="eyebrow">
                POND SUITABILITY
              </p>

              <h2>
                Is {plant.common_name} right
                for your pond?
              </h2>

              <div className="plant-suitability-grid">
                <div>
                  <strong>
                    UK native
                  </strong>
                  <span>
                    {plant.is_native_uk ===
                    true
                      ? "Yes"
                      : plant.is_native_uk ===
                          false
                        ? "No"
                        : "Not specified"}
                  </span>
                </div>

                <div>
                  <strong>
                    Oxygenating
                  </strong>
                  <span>
                    {plant.is_oxygenating
                      ? "Yes"
                      : "No"}
                  </span>
                </div>

                <div>
                  <strong>
                    Wildlife friendly
                  </strong>
                  <span>
                    {plant.is_wildlife_friendly
                      ? "Yes"
                      : "No"}
                  </span>
                </div>

                <div>
                  <strong>
                    Small ponds
                  </strong>
                  <span>
                    {plant.is_small_pond_suitable
                      ? "Suitable"
                      : "Not specified"}
                  </span>
                </div>
              </div>
            </div>
          </main>

          <aside className="plant-facts-card">
            <p className="eyebrow">
              AT A GLANCE
            </p>

            <h2>Plant facts</h2>

            <dl>
              {plant.plant_type && (
                <div>
                  <dt>Plant type</dt>
                  <dd>
                    {typeLabels[
                      plant.plant_type
                    ] ??
                      plant.plant_type}
                  </dd>
                </div>
              )}

              {plant.sunlight && (
                <div>
                  <dt>Sunlight</dt>
                  <dd>
                    {sunlightLabels[
                      plant.sunlight
                    ] ??
                      plant.sunlight}
                  </dd>
                </div>
              )}

              {depth && (
                <div>
                  <dt>
                    Water / planting depth
                  </dt>
                  <dd>{depth}</dd>
                </div>
              )}

              {plant.max_height_cm !=
                null && (
                <div>
                  <dt>
                    Maximum height
                  </dt>
                  <dd>
                    {plant.max_height_cm} cm
                  </dd>
                </div>
              )}

              {plant.max_spread_cm !=
                null && (
                <div>
                  <dt>
                    Maximum spread
                  </dt>
                  <dd>
                    {plant.max_spread_cm} cm
                  </dd>
                </div>
              )}

              {plant.care_level && (
                <div>
                  <dt>Care level</dt>
                  <dd>
                    {careLabels[
                      plant.care_level
                    ] ??
                      plant.care_level}
                  </dd>
                </div>
              )}

              {plant.hardiness && (
                <div>
                  <dt>Hardiness</dt>
                  <dd>
                    {plant.hardiness}
                  </dd>
                </div>
              )}

              {months.length > 0 && (
                <div>
                  <dt>Flowering</dt>
                  <dd>
                    {formatMonths(months)}
                  </dd>
                </div>
              )}
            </dl>

            <Link
              href="/plants"
              className="plant-facts-back"
            >
              ← Find more pond plants
            </Link>
          </aside>
        </div>
      </section>
    </>
  );
}
