import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";

import {
  generatePondStuffFish,
  type PondStuffFishDraft,
} from "@/lib/fish/PondStuffFishWriter";

loadEnvConfig(process.cwd());

type QueueJob = {
  id: string;
  fish_name: string;
  scientific_name_hint: string | null;
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

async function recoverInterruptedJobs() {
  const cutoff =
    new Date(
      Date.now() - 30 * 60 * 1000,
    ).toISOString();

  const { data, error } =
    await supabase
      .from("fish_generation_queue")
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
      `Recovered ${data.length} interrupted job(s).`,
    );
  }
}

async function getNextJob(): Promise<
  QueueJob | null
> {
  const { data: candidate, error } =
    await supabase
      .from("fish_generation_queue")
      .select(`
        id,
        fish_name,
        scientific_name_hint,
        attempts
      `)
      .eq("status", "pending")
      .order("created_at", {
        ascending: true,
      })
      .limit(1)
      .maybeSingle();

  if (error) {
    throw new Error(
      `Could not load next fish queue job: ${error.message}`,
    );
  }

  if (!candidate) {
    return null;
  }

  const { data: claimed, error: claimError } =
    await supabase
      .from("fish_generation_queue")
      .update({
        status: "processing",
        attempts:
          candidate.attempts + 1,
        started_at:
          new Date().toISOString(),
        completed_at: null,
        error_message: null,
      })
      .eq("id", candidate.id)
      .eq("status", "pending")
      .select(`
        id,
        fish_name,
        scientific_name_hint,
        attempts
      `)
      .maybeSingle();

  if (claimError) {
    throw new Error(
      `Could not claim fish queue job: ${claimError.message}`,
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

  const { error: updateError } =
    await supabase
      .from("fish_generation_queue")
      .update({
        status: "failed",
        error_message:
          message.slice(0, 2000),
        completed_at:
          new Date().toISOString(),
      })
      .eq("id", jobId);

  if (updateError) {
    throw new Error(
      `Could not mark fish job failed: ${updateError.message}`,
    );
  }
}

async function markSkipped(
  jobId: string,
  fishId: string | null,
  reason: string,
) {
  const { error } = await supabase
    .from("fish_generation_queue")
    .update({
      status: "skipped",
      fish_id: fishId,
      error_message:
        reason.slice(0, 2000),
      completed_at:
        new Date().toISOString(),
    })
    .eq("id", jobId);

  if (error) {
    throw new Error(
      `Could not mark fish job skipped: ${error.message}`,
    );
  }
}

async function markCompleted(
  jobId: string,
  fishId: string,
) {
  const { error } = await supabase
    .from("fish_generation_queue")
    .update({
      status: "completed",
      fish_id: fishId,
      error_message: null,
      completed_at:
        new Date().toISOString(),
    })
    .eq("id", jobId);

  if (error) {
    throw new Error(
      `Could not mark fish job completed: ${error.message}`,
    );
  }
}

async function findExistingFish(
  fish: PondStuffFishDraft,
) {
  const { data: existingBySlug, error } =
    await supabase
      .from("fish")
      .select("id, common_name")
      .eq("slug", fish.slug)
      .maybeSingle();

  if (error) {
    throw new Error(
      `Fish duplicate check failed: ${error.message}`,
    );
  }

  return existingBySlug;
}

async function createFishDraft(
  fish: PondStuffFishDraft,
) {
  const { data: created, error } =
    await supabase
      .from("fish")
      .insert({
        common_name:
          fish.commonName,

        scientific_name:
          fish.scientificName,

        slug:
          fish.slug,

        summary:
          fish.summary,

        description:
          fish.description,

        max_length_cm:
          fish.maxLengthCm,

        minimum_pond_volume_litres:
          fish.minimumPondVolumeLitres,

        minimum_pond_depth_cm:
          fish.minimumPondDepthCm,

        min_temperature_c:
          fish.minTemperatureC,

        max_temperature_c:
          fish.maxTemperatureC,

        diet:
          fish.diet,

        temperament:
          fish.temperament,

        care_level:
          fish.careLevel,

        suitable_for_small_ponds:
          fish.suitableForSmallPonds,

        suitable_for_wildlife_ponds:
          fish.suitableForWildlifePonds,

        compatibility_notes:
          fish.compatibilityNotes,

        care_notes:
          fish.careNotes,

        image_url: null,

        image_alt:
          fish.imageAlt,

        image_credit: null,

        seo_title:
          fish.seoTitle,

        meta_description:
          fish.metaDescription,

        status: "draft",

        is_featured: false,

        published_at: null,
      })
      .select("id, common_name")
      .single();

  if (error) {
    throw new Error(
      `Could not create fish draft: ${error.message}`,
    );
  }

  return created;
}

async function processJob(job: QueueJob) {
  console.log(
    `\nResearching: ${job.fish_name}`,
  );

  const existing = await supabase
    .from("fish")
    .select("id, common_name")
    .ilike(
      "common_name",
      job.fish_name,
    )
    .limit(1)
    .maybeSingle();

  if (existing.error) {
    throw new Error(
      `Pre-research duplicate check failed: ${existing.error.message}`,
    );
  }

  if (existing.data) {
    await markSkipped(
      job.id,
      existing.data.id,
      "Fish already exists in database.",
    );

    console.log(
      `↷ Skipped existing fish: ${job.fish_name}`,
    );

    return;
  }

  const fish =
    await generatePondStuffFish(
      job.fish_name,
      job.scientific_name_hint,
    );

  console.log(
    `Verified identity: ${fish.commonName}` +
      (
        fish.scientificName
          ? ` (${fish.scientificName})`
          : ""
      ),
  );

  const existingBySlug =
    await findExistingFish(fish);

  if (existingBySlug) {
    await markSkipped(
      job.id,
      existingBySlug.id,
      "Researched fish slug already exists.",
    );

    console.log(
      `↷ Skipped duplicate slug: ${fish.slug}`,
    );

    return;
  }

  const created =
    await createFishDraft(fish);

  await markCompleted(
    job.id,
    created.id,
  );

  console.log(
    `Created draft: ${created.common_name}`,
  );

  console.log(
    `Fish ID: ${created.id}`,
  );
}

function getLimit() {
  const argument =
    process.argv.find((value) =>
      value.startsWith("--limit="),
    );

  if (!argument) {
    return Number.POSITIVE_INFINITY;
  }

  const value = Number(
    argument.split("=")[1],
  );

  if (
    !Number.isFinite(value) ||
    value < 1 ||
    value > 1000
  ) {
    throw new Error(
      "--limit must be between 1 and 1000.",
    );
  }

  return Math.floor(value);
}

async function main() {
  const limit = getLimit();

  console.log(
    "PondStuff fish queue worker",
  );

  console.log(
    Number.isFinite(limit)
      ? `Batch limit: ${limit}`
      : "Batch limit: unlimited",
  );

  await recoverInterruptedJobs();

  let processed = 0;

  while (processed < limit) {
    const job =
      await getNextJob();

    if (!job) {
      console.log(
        `Queue empty. Processed ${processed} job(s).`,
      );
      return;
    }

    try {
      await processJob(job);
    } catch (error) {
      console.error(
        `Fish job failed: ${job.fish_name}`,
        error,
      );

      await markFailed(
        job.id,
        error,
      );
    }

    processed += 1;
  }

  console.log(
    `Batch limit reached. Processed ${processed} job(s).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
