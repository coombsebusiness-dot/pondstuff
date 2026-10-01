import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type Fish = {
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
  seo_title: string | null;
  meta_description: string | null;
};

async function getFish(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fish")
    .select(
      `
        common_name,
        scientific_name,
        slug,
        summary,
        description,
        max_length_cm,
        minimum_pond_volume_litres,
        minimum_pond_depth_cm,
        min_temperature_c,
        max_temperature_c,
        diet,
        temperament,
        care_level,
        suitable_for_small_ponds,
        suitable_for_wildlife_ponds,
        compatibility_notes,
        care_notes,
        image_url,
        image_alt,
        seo_title,
        meta_description
      `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    throw new Error(
      `Could not load fish: ${error.message}`,
    );
  }

  return data as Fish | null;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const fish = await getFish(slug);

  if (!fish) {
    return {
      title: "Fish Not Found",
    };
  }

  return {
    title:
      fish.seo_title ??
      `${fish.common_name} Pond Fish Guide`,
    description:
      fish.meta_description ??
      fish.summary ??
      `Pond fish guide for ${fish.common_name}.`,
    alternates: {
      canonical: `/fish/${fish.slug}`,
    },
    openGraph: {
      title:
        fish.seo_title ??
        `${fish.common_name} Pond Fish Guide`,
      description:
        fish.meta_description ??
        fish.summary ??
        `Pond fish guide for ${fish.common_name}.`,
      type: "article",
      images: fish.image_url
        ? [
            {
              url: fish.image_url,
              alt:
                fish.image_alt ??
                `${fish.common_name} pond fish`,
            },
          ]
        : undefined,
    },
  };
}

export default async function FishDetailPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const fish = await getFish(slug);

  if (!fish) {
    notFound();
  }

  return (
    <>
      <article className="page-section">
        <div className="shell narrow-shell">
          <Link
            href="/fish"
            className="text-link"
          >
            ← All pond fish
          </Link>

          <p className="eyebrow">
            POND FISH GUIDE
          </p>

          <h1>{fish.common_name}</h1>

          {fish.scientific_name ? (
            <p>
              <em>{fish.scientific_name}</em>
            </p>
          ) : null}

          {fish.image_url ? (
            <img
              src={fish.image_url}
              alt={
                fish.image_alt ??
                `${fish.common_name} pond fish`
              }
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "18px",
                margin: "2rem 0",
              }}
            />
          ) : null}

          {fish.summary ? (
            <p className="page-intro">
              {fish.summary}
            </p>
          ) : null}

          <div className="content-card">
            <h2>At a glance</h2>

            <dl>
              {fish.max_length_cm ? (
                <>
                  <dt>Maximum length</dt>
                  <dd>
                    Up to {fish.max_length_cm} cm
                  </dd>
                </>
              ) : null}

              {fish.minimum_pond_volume_litres ? (
                <>
                  <dt>Minimum pond volume</dt>
                  <dd>
                    {fish.minimum_pond_volume_litres.toLocaleString()} litres
                  </dd>
                </>
              ) : null}

              {fish.minimum_pond_depth_cm ? (
                <>
                  <dt>Minimum pond depth</dt>
                  <dd>
                    {fish.minimum_pond_depth_cm} cm
                  </dd>
                </>
              ) : null}

              {fish.min_temperature_c !== null &&
              fish.max_temperature_c !== null ? (
                <>
                  <dt>Temperature range</dt>
                  <dd>
                    {fish.min_temperature_c}–{fish.max_temperature_c}°C
                  </dd>
                </>
              ) : null}

              {fish.care_level ? (
                <>
                  <dt>Care level</dt>
                  <dd>{fish.care_level}</dd>
                </>
              ) : null}

              <dt>Suitable for small ponds</dt>
              <dd>
                {fish.suitable_for_small_ponds
                  ? "Yes"
                  : "No"}
              </dd>

              <dt>Suitable for wildlife ponds</dt>
              <dd>
                {fish.suitable_for_wildlife_ponds
                  ? "Yes"
                  : "No"}
              </dd>
            </dl>
          </div>

          {fish.description ? (
            <section>
              <h2>About {fish.common_name}</h2>
              <p>{fish.description}</p>
            </section>
          ) : null}

          {fish.diet ? (
            <section>
              <h2>Diet</h2>
              <p>{fish.diet}</p>
            </section>
          ) : null}

          {fish.temperament ? (
            <section>
              <h2>Temperament</h2>
              <p>{fish.temperament}</p>
            </section>
          ) : null}

          {fish.compatibility_notes ? (
            <section>
              <h2>Compatibility</h2>
              <p>{fish.compatibility_notes}</p>
            </section>
          ) : null}

          {fish.care_notes ? (
            <section>
              <h2>Care notes</h2>
              <p>{fish.care_notes}</p>
            </section>
          ) : null}
        </div>
      </article>
    </>
  );
}
