"use server";

import { createClient } from "@/lib/supabase/server";

import {
  pondFishCatalogue,
  type FishCatalogueItem,
} from "./catalogue";

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

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminUser) {
    throw new Error("Admin access required.");
  }

  return supabase;
}

function findCatalogueItem(
  name: string,
): FishCatalogueItem | undefined {
  return pondFishCatalogue.find(
    (item) =>
      item.name.toLowerCase() ===
      name.trim().toLowerCase(),
  );
}

export type FishQueueSummary = {
  added: number;
  skippedQueued: number;
};

export async function queueCatalogueFish(
  names: string[],
): Promise<FishQueueSummary> {
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
      "Select at least one fish to queue.",
    );
  }

  if (cleanNames.length > 100) {
    throw new Error(
      "A maximum of 100 fish can be queued at once.",
    );
  }

  let added = 0;
  let skippedQueued = 0;

  for (const fishName of cleanNames) {
    const item = findCatalogueItem(fishName);

    if (!item) {
      throw new Error(
        `${fishName} is not in the fish catalogue.`,
      );
    }

    const { data: existingFish } = await supabase
      .from("fish")
      .select("id")
      .ilike("common_name", item.name)
      .limit(1)
      .maybeSingle();

    if (existingFish) {
      continue;
    }

    const { data: queuedFish } = await supabase
      .from("fish_generation_queue")
      .select("id")
      .ilike("fish_name", item.name)
      .in("status", ["pending", "processing"])
      .limit(1)
      .maybeSingle();

    if (queuedFish) {
      skippedQueued += 1;
      continue;
    }

    const { error } = await supabase
      .from("fish_generation_queue")
      .insert({
        fish_name: item.name,
        scientific_name_hint:
          item.scientificName ?? null,
        status: "pending",
        attempts: 0,
      });

    if (error) {
      if (error.code === "23505") {
        skippedQueued += 1;
        continue;
      }

      throw new Error(
        `Could not queue ${item.name}: ${error.message}`,
      );
    }

    added += 1;
  }

  return {
    added,
    skippedQueued,
  };
}

export type FishQueueItem = {
  id: string;
  fish_name: string;
  scientific_name_hint: string | null;
  status:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "skipped";
  fish_id: string | null;
  attempts: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function getFishQueue(): Promise<
  FishQueueItem[]
> {
  const supabase = await requireAdmin();

  const { data, error } = await supabase
    .from("fish_generation_queue")
    .select(`
      id,
      fish_name,
      scientific_name_hint,
      status,
      fish_id,
      attempts,
      error_message,
      started_at,
      completed_at,
      created_at,
      updated_at
    `)
    .order("created_at", {
      ascending: true,
    })
    .limit(200);

  if (error) {
    throw new Error(
      `Could not load fish queue: ${error.message}`,
    );
  }

  return (data ?? []) as FishQueueItem[];
}
