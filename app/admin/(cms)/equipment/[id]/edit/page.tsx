import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import EquipmentEditor from "../../EquipmentEditor";

type Props = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function EditEquipmentPage({
  params,
  searchParams,
}: Props) {
  const { id } =
    await params;

  const query =
    await searchParams;

  const supabase =
    await createClient();

  const {
    data: equipment,
    error,
  } = await supabase
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
      affiliate_url,
      affiliate_network,
      status,
      is_featured,
      published_at
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Could not load equipment: ${error.message}`,
    );
  }

  if (!equipment) {
    notFound();
  }

  return (
    <main className="admin-content">
      <div className="admin-editor-top">
        <div>
          <Link
            href="/admin/equipment"
            className="admin-back-link"
          >
            ← Equipment
          </Link>

          <p className="admin-eyebrow">
            EDIT EQUIPMENT
          </p>

          <h1>
            {equipment.name}
          </h1>
        </div>
      </div>

      {query.saved && (
        <div className="admin-editor-success">
          Equipment saved successfully.
        </div>
      )}

      {query.error && (
        <div className="admin-editor-error">
          {query.error}
        </div>
      )}

      <EquipmentEditor
        initialEquipment={
          equipment
        }
      />
    </main>
  );
}
