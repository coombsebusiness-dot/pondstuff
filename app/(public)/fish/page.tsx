import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Pond Fish | UK Pond Fish Guide",
  description:
    "Explore pond fish suitable for UK garden ponds, with practical information on size, pond requirements, temperature, diet, temperament and care.",
};

type Fish = {
  id: string;
  common_name: string;
  scientific_name: string | null;
  slug: string;
  summary: string | null;
  max_length_cm: number | null;
  minimum_pond_volume_litres: number | null;
  care_level: string | null;
  suitable_for_small_ponds: boolean;
  suitable_for_wildlife_ponds: boolean;
  image_url: string | null;
  image_alt: string | null;
};

export default async function FishPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fish")
    .select(
      `
        id,
        common_name,
        scientific_name,
        slug,
        summary,
        max_length_cm,
        minimum_pond_volume_litres,
        care_level,
        suitable_for_small_ponds,
        suitable_for_wildlife_ponds,
        image_url,
        image_alt
      `,
    )
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("common_name", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Could not load fish: ${error.message}`,
    );
  }

  const fish = (data ?? []) as Fish[];

  return (
    <>
      <section className="page-hero">
        <div className="shell narrow-shell">
          <p className="eyebrow">POND FISH GUIDE</p>

          <h1>Find the right fish for your pond.</h1>

          <p className="page-intro">
            Explore our growing UK pond fish database,
            with practical information about pond size,
            adult size, temperature, diet, temperament
            and care requirements.
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="shell">
          <div className="equipment-grid">
            {fish.map((item) => (
              <Link
                key={item.id}
                href={`/fish/${item.slug}`}
                className="equipment-card"
              >
                <div className="equipment-card-image">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={
                        item.image_alt ??
                        `${item.common_name} pond fish`
                      }
                    />
                  ) : (
                    <div className="equipment-placeholder">
                      Pond fish
                    </div>
                  )}
                </div>

                <div className="equipment-card-body">
                  <p className="equipment-brand">
                    {item.scientific_name ??
                      "Pond fish"}
                  </p>

                  <h2>{item.common_name}</h2>

                  {item.summary ? (
                    <p>{item.summary}</p>
                  ) : null}

                  <div className="fish-card-meta">
                    {item.max_length_cm ? (
                      <span>
                        Up to {item.max_length_cm} cm
                      </span>
                    ) : null}

                    {item.care_level ? (
                      <span>
                        Care: {item.care_level}
                      </span>
                    ) : null}
                  </div>

                  <span className="equipment-card-link">
                    View fish guide →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {fish.length === 0 ? (
            <div className="equipment-empty">
              <h2>Fish guides coming soon</h2>

              <p>
                We're building the PondStuff fish
                database now. Check back soon.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
