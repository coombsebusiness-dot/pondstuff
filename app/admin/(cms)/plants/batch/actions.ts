"use server";

import { createClient } from "@/lib/supabase/server";
import {
  generatePondStuffPlant,
  type PondStuffPlantDraft,
} from "@/lib/plants/PondStuffPlantWriter";
import { pondPlantCatalogue } from "./catalogue";

export type PlantBatchResult = {
  inputName: string;
  status: "created" | "duplicate" | "failed";
  plantId?: string;
  plantName?: string;
  message: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(
      "Your admin session has expired. Please sign in again.",
    );
  }

  const { data: adminUser } =
    await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

  if (!adminUser) {
    throw new Error(
      "Admin access required.",
    );
  }

  return supabase;
}

function plantInsert(
  plant: PondStuffPlantDraft,
) {
  return {
    common_name: plant.commonName,
    scientific_name: plant.scientificName,
    slug:
      slugify(plant.slug) ||
      slugify(plant.commonName),

    plant_type: plant.plantType,
    summary: plant.summary,
    description: plant.description,

    min_planting_depth_cm:
      plant.minPlantingDepthCm,
    max_planting_depth_cm:
      plant.maxPlantingDepthCm,

    min_water_depth_cm:
      plant.minWaterDepthCm,
    max_water_depth_cm:
      plant.maxWaterDepthCm,

    max_height_cm: plant.maxHeightCm,
    max_spread_cm: plant.maxSpreadCm,

    sunlight: plant.sunlight,
    flowering_months:
      plant.floweringMonths,

    is_native_uk: plant.isNativeUk,
    is_oxygenating:
      plant.isOxygenating,
    is_wildlife_friendly:
      plant.isWildlifeFriendly,
    is_small_pond_suitable:
      plant.isSmallPondSuitable,

    hardiness: plant.hardiness,
    growth_habit: plant.growthHabit,
    planting_method:
      plant.plantingMethod,
    winter_behaviour:
      plant.winterBehaviour,
    propagation: plant.propagation,
    maintenance_notes:
      plant.maintenanceNotes,

    legal_status_uk:
      plant.legalStatusUk,
    legal_status_notes:
      plant.legalStatusNotes,

    care_level: plant.careLevel,

    image_url: null,
    image_alt: plant.imageAlt,
    image_credit: null,

    seo_title: plant.seoTitle,
    meta_description:
      plant.metaDescription,

    research_sources:
      plant.researchSources,

    // Batch generation can NEVER publish.
    status: "draft",
    is_featured: false,
    published_at: null,
  };
}

export async function generatePlantBatch(
  names: string[],
): Promise<PlantBatchResult[]> {
  const cleanedNames = names
    .map((name) => name.trim())
    .filter(Boolean);

  if (cleanedNames.length === 0) {
    throw new Error(
      "Enter at least one plant name.",
    );
  }

  if (cleanedNames.length > 3) {
    throw new Error(
      "This test batch is limited to three plants.",
    );
  }

  const supabase = await requireAdmin();

  const results: PlantBatchResult[] = [];

  // Deliberately sequential for V1.
  for (const inputName of cleanedNames) {
    try {
      const plant =
        await generatePondStuffPlant(
          inputName,
        );

      const slug =
        slugify(plant.slug) ||
        slugify(plant.commonName);

      if (!slug) {
        results.push({
          inputName,
          status: "failed",
          message:
            "AI did not produce a valid slug.",
        });

        continue;
      }

      const { data: existing } =
        await supabase
          .from("plants")
          .select(
            "id, common_name, slug",
          )
          .eq("slug", slug)
          .maybeSingle();

      if (existing) {
        results.push({
          inputName,
          status: "duplicate",
          plantId: existing.id,
          plantName:
            existing.common_name,
          message:
            "A plant with this slug already exists.",
        });

        continue;
      }

      const { data: created, error } =
        await supabase
          .from("plants")
          .insert(
            plantInsert({
              ...plant,
              slug,
            }),
          )
          .select("id, common_name")
          .single();

      if (error || !created) {
        throw new Error(
          error?.message ??
            "Could not create plant draft.",
        );
      }

      results.push({
        inputName,
        status: "created",
        plantId: created.id,
        plantName:
          created.common_name,
        message:
          "Researched draft created.",
      });
    } catch (error) {
      results.push({
        inputName,
        status: "failed",
        message:
          error instanceof Error
            ? error.message
            : "Plant generation failed.",
      });
    }
  }

  return results;
}

export type QueueSummary = {
  added: number;
  skippedExisting: number;
  skippedQueued: number;
};

export async function queueCataloguePlants(
  names: string[],
): Promise<QueueSummary> {
  const supabase = await requireAdmin();

  const cleanNames = Array.from(
    new Set(
      names
        .map((name) => name.trim())
        .filter(Boolean),
    ),
  );

  if (cleanNames.length === 0) {
    throw new Error(
      "Select at least one plant to queue.",
    );
  }

  if (cleanNames.length > 100) {
    throw new Error(
      "A maximum of 100 plants can be queued at once.",
    );
  }

  let added = 0;
  let skippedExisting = 0;
  let skippedQueued = 0;

  for (const plantName of cleanNames) {
    const cataloguePlant =
      pondPlantCatalogue.find(
        (item) =>
          item.name.toLowerCase() ===
          plantName.toLowerCase(),
      );

    const scientificNameHint =
      cataloguePlant?.scientificName?.trim() ||
      null;

    /*
     * Cheap pre-flight check. This is deliberately
     * case-insensitive and avoids spending AI money
     * on obvious existing records.
     */
    const { data: existingPlant } =
      await supabase
        .from("plants")
        .select("id")
        .ilike(
          "common_name",
          plantName,
        )
        .limit(1)
        .maybeSingle();

    if (existingPlant) {
      skippedExisting += 1;
      continue;
    }

    const { data: queuedPlant } =
      await supabase
        .from("plant_generation_queue")
        .select("id")
        .ilike(
          "plant_name",
          plantName,
        )
        .in("status", [
          "pending",
          "processing",
        ])
        .limit(1)
        .maybeSingle();

    if (queuedPlant) {
      skippedQueued += 1;
      continue;
    }

    const { error } = await supabase
      .from("plant_generation_queue")
      .insert({
        plant_name: plantName,
        scientific_name_hint:
          scientificNameHint,
        status: "pending",
        attempts: 0,
      });

    if (error) {
      /*
       * A simultaneous request may have beaten us
       * to the partial unique index. Treat that as
       * already queued rather than destroying the
       * whole batch.
       */
      if (
        error.code === "23505"
      ) {
        skippedQueued += 1;
        continue;
      }

      throw new Error(
        `Could not queue ${plantName}: ${error.message}`,
      );
    }

    added += 1;
  }

  return {
    added,
    skippedExisting,
    skippedQueued,
  };
}

export type PlantQueueItem = {
  id: string;
  plant_name: string;
  status:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "skipped";
  attempts: number;
  error_message: string | null;
  plant_id: string | null;
  created_at: string;
};

export async function getPlantQueue(): Promise<
  PlantQueueItem[]
> {
  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("plant_generation_queue")
    .select(
      "id, plant_name, status, attempts, error_message, plant_id, created_at",
    )
    .order("created_at", {
      ascending: true,
    })
    .limit(200);

  if (error) {
    throw new Error(
      `Could not load plant queue: ${error.message}`,
    );
  }

  return (data ?? []) as PlantQueueItem[];
}
