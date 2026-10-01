"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type FishPayload = {
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

function validateFish(payload: FishPayload) {
  if (!payload.common_name.trim()) {
    throw new Error("A common name is required.");
  }

  if (!payload.slug.trim()) {
    throw new Error("A slug is required.");
  }

  if (
    payload.care_level &&
    !["easy", "moderate", "advanced"].includes(
      payload.care_level,
    )
  ) {
    throw new Error(
      "Care level must be easy, moderate or advanced.",
    );
  }

  if (
    payload.status &&
    !["draft", "published"].includes(payload.status)
  ) {
    throw new Error(
      "Status must be draft or published.",
    );
  }
}

export async function createFish(
  payload: FishPayload,
) {
  validateFish(payload);

  const supabase = await createClient();

  const { data: existingSlug } = await supabase
    .from("fish")
    .select("id")
    .eq("slug", payload.slug)
    .maybeSingle();

  if (existingSlug) {
    throw new Error(
      "A fish with this slug already exists.",
    );
  }

  const row = {
    ...payload,
    published_at:
      payload.status === "published"
        ? new Date().toISOString()
        : null,
  };

  const { data, error } = await supabase
    .from("fish")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    throw new Error(
      `Could not create fish: ${error.message}`,
    );
  }

  revalidatePath("/admin/fish");
  revalidatePath("/admin/fish/new");
  revalidatePath("/fish");
  revalidatePath(`/fish/${payload.slug}`);
  revalidatePath("/sitemap.xml");

  return data;
}

export async function updateFish(
  id: string,
  payload: FishPayload,
) {
  validateFish(payload);

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("fish")
    .select("id, published_at")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    throw new Error("Fish record not found.");
  }

  const publishedAt =
    payload.status === "published"
      ? existing.published_at ??
        new Date().toISOString()
      : null;

  const { error } = await supabase
    .from("fish")
    .update({
      ...payload,
      published_at: publishedAt,
    })
    .eq("id", id);

  if (error) {
    throw new Error(
      `Could not update fish: ${error.message}`,
    );
  }

  revalidatePath("/admin/fish");
  revalidatePath(`/admin/fish/${id}/edit`);
  revalidatePath("/fish");
  revalidatePath(`/fish/${payload.slug}`);
  revalidatePath("/sitemap.xml");

  return { success: true };
}
