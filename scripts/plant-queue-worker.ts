import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

loadEnvConfig(process.cwd());

type QueueJob = {
  id: string;
  plant_name: string;
  scientific_name_hint: string | null;
  attempts: number;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sleep(ms: number) {
  return new Promise((resolve) =>
    setTimeout(resolve, ms),
  );
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL is missing.",
  );
}

if (!serviceRoleKey) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is missing.",
  );
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error(
    "OPENAI_API_KEY is missing.",
  );
}

const supabase = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

async function getNextJob():
  Promise<QueueJob | null> {
  const { data, error } = await supabase
    .from("plant_generation_queue")
    .select(
      "id, plant_name, scientific_name_hint, attempts",
    )
    .eq("status", "pending")
    .order("created_at", {
      ascending: true,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Could not load next job: ${error.message}`,
    );
  }

  if (!data) {
    return null;
  }

  const {
    data: claimed,
    error: claimError,
  } = await supabase
    .from("plant_generation_queue")
    .update({
      status: "processing",
      attempts: data.attempts + 1,
      started_at:
        new Date().toISOString(),
      error_message: null,
    })
    .eq("id", data.id)
    .eq("status", "pending")
    .select(
      "id, plant_name, scientific_name_hint, attempts",
    )
    .maybeSingle();

  if (claimError) {
    throw new Error(
      `Could not claim ${data.plant_name}: ${claimError.message}`,
    );
  }

  return claimed as QueueJob | null;
}

async function markFailed(
  job: QueueJob,
  error: unknown,
) {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  const { error: updateError } =
    await supabase
      .from("plant_generation_queue")
      .update({
        status: "failed",
        error_message:
          message.slice(0, 2000),
        completed_at:
          new Date().toISOString(),
      })
      .eq("id", job.id);

  if (updateError) {
    console.error(
      "Could not mark job failed:",
      updateError.message,
    );
  }
}

async function markSkipped(
  job: QueueJob,
  plantId: string,
  reason: string,
) {
  const { error } = await supabase
    .from("plant_generation_queue")
    .update({
      status: "skipped",
      plant_id: plantId,
      error_message: reason,
      completed_at:
        new Date().toISOString(),
    })
    .eq("id", job.id);

  if (error) {
    throw new Error(
      `Could not mark job skipped: ${error.message}`,
    );
  }
}

async function processJob(
  job: QueueJob,
) {
  console.log("");
  console.log(
    `🌿 Researching: ${job.plant_name}`,
  );

  /*
   * Cheap duplicate check BEFORE AI spend.
   */
  const { data: existingBefore } =
    await supabase
      .from("plants")
      .select("id, common_name")
      .ilike(
        "common_name",
        job.plant_name,
      )
      .limit(1)
      .maybeSingle();

  if (existingBefore) {
    await markSkipped(
      job,
      existingBefore.id,
      "Plant already exists in database.",
    );

    console.log(
      `↷ Skipped existing: ${job.plant_name}`,
    );

    return;
  }

  /*
   * Import after env loading so our existing
   * OpenAI client sees OPENAI_API_KEY.
   */
  const {
    generatePondStuffPlant,
  } = await import(
    "../lib/plants/PondStuffPlantWriter"
  );

  const plant =
    await generatePondStuffPlant(
      job.plant_name,
      job.scientific_name_hint,
    );

  const slug =
    slugify(plant.slug) ||
    slugify(plant.commonName);

  if (!slug) {
    throw new Error(
      "Research pipeline did not produce a valid slug.",
    );
  }

  /*
   * Check the researched canonical slug too.
   */
  const { data: existingBySlug } =
    await supabase
      .from("plants")
      .select("id, common_name")
      .eq("slug", slug)
      .maybeSingle();

  if (existingBySlug) {
    await markSkipped(
      job,
      existingBySlug.id,
      "Researched plant slug already exists.",
    );

    console.log(
      `↷ Skipped duplicate slug: ${slug}`,
    );

    return;
  }

  const { data: created, error } =
    await supabase
      .from("plants")
      .insert({
        common_name:
          plant.commonName,

        scientific_name:
          plant.scientificName,

        slug,

        plant_type:
          plant.plantType,

        summary:
          plant.summary,

        description:
          plant.description,

        min_planting_depth_cm:
          plant.minPlantingDepthCm,

        max_planting_depth_cm:
          plant.maxPlantingDepthCm,

        min_water_depth_cm:
          plant.minWaterDepthCm,

        max_water_depth_cm:
          plant.maxWaterDepthCm,

        max_height_cm:
          plant.maxHeightCm,

        max_spread_cm:
          plant.maxSpreadCm,

        sunlight:
          plant.sunlight,

        flowering_months:
          plant.floweringMonths,

        is_native_uk:
          plant.isNativeUk,

        is_oxygenating:
          plant.isOxygenating,

        is_wildlife_friendly:
          plant.isWildlifeFriendly,

        is_small_pond_suitable:
          plant.isSmallPondSuitable,

        hardiness:
          plant.hardiness,

        growth_habit:
          plant.growthHabit,

        planting_method:
          plant.plantingMethod,

        winter_behaviour:
          plant.winterBehaviour,

        propagation:
          plant.propagation,

        maintenance_notes:
          plant.maintenanceNotes,

        legal_status_uk:
          plant.legalStatusUk,

        legal_status_notes:
          plant.legalStatusNotes,

        care_level:
          plant.careLevel,

        image_url: null,

        image_alt:
          plant.imageAlt,

        image_credit: null,

        seo_title:
          plant.seoTitle,

        meta_description:
          plant.metaDescription,

        research_sources:
          plant.researchSources,

        /*
         * Unattended generation can NEVER
         * publish a plant.
         */
        status: "draft",
        is_featured: false,
        published_at: null,
      })
      .select(
        "id, common_name",
      )
      .single();

  if (error || !created) {
    throw new Error(
      error?.message ??
        "Could not save generated plant.",
    );
  }

  const { error: queueError } =
    await supabase
      .from("plant_generation_queue")
      .update({
        status: "completed",
        plant_id: created.id,
        error_message: null,
        completed_at:
          new Date().toISOString(),
      })
      .eq("id", job.id);

  if (queueError) {
    throw new Error(
      `Plant created (${created.id}) but queue completion failed: ${queueError.message}`,
    );
  }

  console.log(
    `✓ Draft created: ${created.common_name}`,
  );
}

async function recoverInterruptedJobs() {
  const cutoff =
    new Date(
      Date.now() -
        30 * 60 * 1000,
    ).toISOString();

  const { data, error } = await supabase
    .from("plant_generation_queue")
    .update({
      status: "pending",
      error_message:
        "Recovered after interrupted worker.",
      started_at: null,
    })
    .eq("status", "processing")
    .lt("started_at", cutoff)
    .select("id");

  if (error) {
    throw new Error(
      `Could not recover interrupted jobs: ${error.message}`,
    );
  }

  if (data?.length) {
    console.log(
      `↻ Recovered ${data.length} interrupted job(s)`,
    );
  }
}

async function main() {
  console.log("");
  console.log(
    "🌿 PondStuff Plant Queue Worker",
  );

  console.log(
    "Draft-only mode — nothing will be published.",
  );

  await recoverInterruptedJobs();

  let processed = 0;

  while (true) {
    const job = await getNextJob();

    if (!job) {
      console.log("");
      console.log(
        `✓ Queue empty. ${processed} job(s) processed.`,
      );
      break;
    }

    try {
      await processJob(job);
    } catch (error) {
      console.error(
        `✗ ${job.plant_name}:`,
        error instanceof Error
          ? error.message
          : error,
      );

      await markFailed(
        job,
        error,
      );
    }

    processed += 1;

    /*
     * Deliberately gentle between research
     * jobs for the overnight run.
     */
    await sleep(5000);
  }
}

main().catch((error) => {
  console.error("");
  console.error(
    "Worker stopped:",
    error,
  );

  process.exitCode = 1;
});
