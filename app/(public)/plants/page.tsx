import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import PlantFinder, {
  type PlantFinderPlant,
} from "./PlantFinder";

export const metadata: Metadata = {
  title: "Pond Plants | UK Pond Plant Finder",
  description:
    "Find pond plants for UK garden ponds. Search by plant type, sunlight, native status, oxygenating value, wildlife value and small-pond suitability.",
};

export default async function PlantsPage() {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("plants")
    .select(`
      id,
      common_name,
      scientific_name,
      slug,
      plant_type,
      summary,
      min_planting_depth_cm,
      max_planting_depth_cm,
      sunlight,
      is_native_uk,
      is_oxygenating,
      is_wildlife_friendly,
      is_small_pond_suitable,
      image_url,
      image_alt
    `)
    .eq("status", "published")
    .eq(
      "is_plant_finder_suitable",
      true,
    )
    .lte(
      "published_at",
      new Date().toISOString(),
    )
    .order("common_name", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Could not load plants: ${error.message}`,
    );
  }

  const plants =
    (data ?? []) as PlantFinderPlant[];

  return (
    <>
      <section className="page-hero">
        <div className="shell narrow-shell">
          <p className="eyebrow">
            POND PLANT FINDER
          </p>

          <h1>
            Find the right plants for
            your pond.
          </h1>

          <p className="page-intro">
            Search our UK pond plant
            database by type, sunlight
            and pond suitability. Each
            profile includes researched
            planting and care
            information.
          </p>
        </div>
      </section>

      <section className="page-section">
        <div className="shell">
          <PlantFinder
            plants={plants}
          />
        </div>
      </section>
    </>
  );
}
