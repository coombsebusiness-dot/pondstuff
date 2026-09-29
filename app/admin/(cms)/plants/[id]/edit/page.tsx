import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlantEditor from "../../PlantEditor";

type EditPlantPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function EditPlantPage({
  params,
  searchParams,
}: EditPlantPageProps) {
  const { id } =
    await params;

  const query =
    await searchParams;

  const supabase =
    await createClient();

  const {
    data: plant,
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
      image_credit,
      seo_title,
      meta_description,
      research_sources,
      status,
      is_featured,
      published_at
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Could not load plant: ${error.message}`,
    );
  }

  if (!plant) {
    notFound();
  }

  return (
    <main className="admin-content">
      <div className="admin-editor-top">
        <div>
          <Link
            href="/admin/plants"
            className="admin-back-link"
          >
            ← Plants
          </Link>

          <p className="admin-eyebrow">
            EDIT PLANT
          </p>

          <h1>
            {plant.common_name}
          </h1>
        </div>
      </div>

      {query.saved && (
        <div className="admin-editor-success">
          Plant saved successfully.
        </div>
      )}

      {query.error && (
        <div className="admin-editor-error">
          {query.error}
        </div>
      )}

      <PlantEditor
        initialPlant={plant}
      />
    </main>
  );
}
