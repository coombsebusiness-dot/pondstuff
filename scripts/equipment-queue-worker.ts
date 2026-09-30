import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

loadEnvConfig(process.cwd());

type QueueJob = {
  id: string;
  product_name: string;
  brand_hint: string | null;
  model_hint: string | null;
  equipment_type_hint: string | null;
  manufacturer_sku_hint: string | null;
  attempts: number;
};

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

function productQuery(job: QueueJob) {
  /*
   * Give the identity researcher useful context,
   * without treating queue hints as verified facts.
   */
  const parts = [
    job.brand_hint,
    job.model_hint ||
      job.product_name,
  ].filter(Boolean);

  return Array.from(
    new Set(parts),
  ).join(" ");
}

async function recoverInterruptedJobs() {
  const cutoff =
    new Date(
      Date.now() -
        30 * 60 * 1000,
    ).toISOString();

  const { data, error } =
    await supabase
      .from(
        "equipment_generation_queue",
      )
      .update({
        status: "pending",
        error_message:
          "Recovered after interrupted worker.",
        started_at: null,
      })
      .eq(
        "status",
        "processing",
      )
      .lt(
        "started_at",
        cutoff,
      )
      .select("id");

  if (error) {
    throw new Error(
      `Could not recover interrupted jobs: ${error.message}`,
    );
  }

  if (data?.length) {
    console.log(
      `Recovered ${data.length} interrupted job(s).`,
    );
  }
}

async function getNextJob():
  Promise<QueueJob | null> {
  const { data: candidate, error } =
    await supabase
      .from(
        "equipment_generation_queue",
      )
      .select(`
        id,
        product_name,
        brand_hint,
        model_hint,
        equipment_type_hint,
        manufacturer_sku_hint,
        attempts
      `)
      .eq(
        "status",
        "pending",
      )
      .order(
        "created_at",
        {
          ascending: true,
        },
      )
      .limit(1)
      .maybeSingle();

  if (error) {
    throw new Error(
      `Could not load next queue job: ${error.message}`,
    );
  }

  if (!candidate) {
    return null;
  }

  /*
   * Optimistic claim.
   *
   * The status condition prevents two workers
   * from successfully claiming the same job.
   */
  const { data: claimed, error: claimError } =
    await supabase
      .from(
        "equipment_generation_queue",
      )
      .update({
        status: "processing",
        attempts:
          candidate.attempts + 1,
        started_at:
          new Date().toISOString(),
        completed_at: null,
        error_message: null,
      })
      .eq(
        "id",
        candidate.id,
      )
      .eq(
        "status",
        "pending",
      )
      .select(`
        id,
        product_name,
        brand_hint,
        model_hint,
        equipment_type_hint,
        manufacturer_sku_hint,
        attempts
      `)
      .maybeSingle();

  if (claimError) {
    throw new Error(
      `Could not claim queue job: ${claimError.message}`,
    );
  }

  if (!claimed) {
    return getNextJob();
  }

  return claimed as QueueJob;
}

async function markFailed(
  jobId: string,
  error: unknown,
) {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  await supabase
    .from(
      "equipment_generation_queue",
    )
    .update({
      status: "failed",
      error_message:
        message.slice(0, 2000),
      completed_at:
        new Date().toISOString(),
    })
    .eq("id", jobId);
}

async function markSkipped(
  jobId: string,
  equipmentId: string | null,
  reason: string,
) {
  const { error } =
    await supabase
      .from(
        "equipment_generation_queue",
      )
      .update({
        status: "skipped",
        equipment_id:
          equipmentId,
        error_message:
          reason.slice(0, 2000),
        completed_at:
          new Date().toISOString(),
      })
      .eq("id", jobId);

  if (error) {
    throw new Error(
      `Could not mark job skipped: ${error.message}`,
    );
  }
}

async function markCompleted(
  jobId: string,
  equipmentId: string,
) {
  const { error } =
    await supabase
      .from(
        "equipment_generation_queue",
      )
      .update({
        status: "completed",
        equipment_id:
          equipmentId,
        error_message: null,
        completed_at:
          new Date().toISOString(),
      })
      .eq("id", jobId);

  if (error) {
    throw new Error(
      `Could not mark job completed: ${error.message}`,
    );
  }
}

async function findPreResearchDuplicate(
  job: QueueJob,
) {
  /*
   * If the catalogue happens to know a product
   * code, use it as a cheap pre-AI duplicate
   * check. It remains a hint, not final identity.
   */
  if (
    job.brand_hint &&
    job.manufacturer_sku_hint
  ) {
    const { data, error } =
      await supabase
        .from("equipment")
        .select("id")
        .ilike(
          "brand",
          job.brand_hint,
        )
        .eq(
          "manufacturer_product_code",
          job.manufacturer_sku_hint,
        )
        .limit(1)
        .maybeSingle();

    if (error) {
      throw new Error(
        `Duplicate check failed: ${error.message}`,
      );
    }

    if (data) {
      return data.id as string;
    }
  }

  if (job.brand_hint) {
    const { data, error } =
      await supabase
        .from("equipment")
        .select("id")
        .ilike(
          "brand",
          job.brand_hint,
        )
        .ilike(
          "name",
          job.product_name,
        )
        .limit(1)
        .maybeSingle();

    if (error) {
      throw new Error(
        `Duplicate check failed: ${error.message}`,
      );
    }

    if (data) {
      return data.id as string;
    }
  }

  return null;
}

async function findResearchedDuplicate(
  draft: {
    brand: string | null;
    manufacturerProductCode:
      | string
      | null;
    slug: string;
  },
) {
  /*
   * Manufacturer + product code is the
   * strongest post-research identity check.
   */
  if (
    draft.brand &&
    draft.manufacturerProductCode
  ) {
    const { data, error } =
      await supabase
        .from("equipment")
        .select("id")
        .ilike(
          "brand",
          draft.brand,
        )
        .eq(
          "manufacturer_product_code",
          draft.manufacturerProductCode,
        )
        .limit(1)
        .maybeSingle();

    if (error) {
      throw new Error(
        `Researched product-code duplicate check failed: ${error.message}`,
      );
    }

    if (data) {
      return data.id as string;
    }
  }

  const { data, error } =
    await supabase
      .from("equipment")
      .select("id")
      .eq(
        "slug",
        draft.slug,
      )
      .limit(1)
      .maybeSingle();

  if (error) {
    throw new Error(
      `Researched slug duplicate check failed: ${error.message}`,
    );
  }

  return data?.id
    ? (data.id as string)
    : null;
}

async function processJob(
  job: QueueJob,
) {
  console.log("");
  console.log(
    `Researching: ${productQuery(job)}`,
  );

  const existingId =
    await findPreResearchDuplicate(
      job,
    );

  if (existingId) {
    await markSkipped(
      job.id,
      existingId,
      "Skipped because matching equipment already exists.",
    );

    console.log(
      "Skipped: existing equipment record.",
    );

    return;
  }

  /*
   * Dynamic import is intentional.
   * Environment variables have already been
   * loaded before the OpenAI module is evaluated.
   */
  const {
    generatePondStuffEquipment,
  } = await import(
    "../lib/equipment/PondStuffEquipmentWriter"
  );

  const draft =
    await generatePondStuffEquipment(
      productQuery(job),
      job.equipment_type_hint,
    );

  if (!draft.name.trim()) {
    throw new Error(
      "Research returned an empty equipment name.",
    );
  }

  if (!draft.slug.trim()) {
    throw new Error(
      "Research returned an empty equipment slug.",
    );
  }

  if (
    !draft.researchSources ||
    draft.researchSources.length ===
      0
  ) {
    throw new Error(
      "Research returned no first-party manufacturer sources.",
    );
  }

  const researchedDuplicateId =
    await findResearchedDuplicate(
      draft,
    );

  if (researchedDuplicateId) {
    await markSkipped(
      job.id,
      researchedDuplicateId,
      "Skipped because the researched product identity already exists.",
    );

    console.log(
      "Skipped: researched identity already exists.",
    );

    return;
  }

  const { data: equipment, error } =
    await supabase
      .from("equipment")
      .insert({
        name: draft.name,
        brand: draft.brand,
        model: draft.model,
        manufacturer_product_code:
          draft.manufacturerProductCode,
        slug: draft.slug,
        equipment_type:
          draft.equipmentType,

        summary: draft.summary,
        description:
          draft.description,

        max_flow_lph:
          draft.maxFlowLph,
        max_head_m:
          draft.maxHeadM,
        power_watts:
          draft.powerWatts,

        min_power_watts:
          draft.minPowerWatts,
        max_power_watts:
          draft.maxPowerWatts,
        max_pond_volume_litres:
          draft.maxPondVolumeLitres,
        max_fish_pond_volume_litres:
          draft.maxFishPondVolumeLitres,
        max_koi_pond_volume_litres:
          draft.maxKoiPondVolumeLitres,

        uv_watts:
          draft.uvWatts,
        cable_length_m:
          draft.cableLengthM,

        specifications:
          draft.specifications,

        best_for:
          draft.bestFor,
        limitations:
          draft.limitations,
        installation_notes:
          draft.installationNotes,
        maintenance_notes:
          draft.maintenanceNotes,
        safety_notes:
          draft.safetyNotes,

        manufacturer_url:
          draft.manufacturerUrl,
        research_sources:
          draft.researchSources,

        image_url: null,
        image_alt:
          draft.imageAlt,
        image_credit: null,

        seo_title:
          draft.seoTitle,
        meta_description:
          draft.metaDescription,

        affiliate_url: null,
        affiliate_network: null,

        status: "draft",
        is_featured: false,
        published_at: null,
      })
      .select("id")
      .single();

  if (error) {
    throw new Error(
      `Could not create equipment draft: ${error.message}`,
    );
  }

  await markCompleted(
    job.id,
    equipment.id,
  );

  console.log(
    `Created draft: ${draft.name}`,
  );

  console.log(
    `Equipment ID: ${equipment.id}`,
  );
}

function getLimit() {
  const argument =
    process.argv.find(
      (value) =>
        value.startsWith(
          "--limit=",
        ),
    );

  if (!argument) {
    return Infinity;
  }

  const value = Number(
    argument.split("=")[1],
  );

  if (
    !Number.isInteger(value) ||
    value < 1 ||
    value > 1000
  ) {
    throw new Error(
      "--limit must be between 1 and 1000.",
    );
  }

  return value;
}

async function main() {
  console.log(
    "PondStuff equipment queue worker",
  );

  await recoverInterruptedJobs();

  const limit = getLimit();

  console.log(
    Number.isFinite(limit)
      ? `Batch limit: ${limit}`
      : "Batch limit: unlimited",
  );

  let processed = 0;

  while (processed < limit) {
    const job =
      await getNextJob();

    if (!job) {
      break;
    }

    try {
      await processJob(job);
    } catch (error) {
      await markFailed(
        job.id,
        error,
      );

      console.error(
        `Failed: ${job.product_name}`,
      );

      console.error(
        error instanceof Error
          ? error.message
          : error,
      );
    }

    processed += 1;
  }

  console.log("");
  console.log(
    `Queue empty. Processed ${processed} job(s).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
