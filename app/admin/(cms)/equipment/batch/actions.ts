"use server";

import { createClient } from "@/lib/supabase/server";

import {
  equipmentCatalogue,
  type EquipmentCatalogueItem,
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
    throw new Error(
      "Admin access required.",
    );
  }

  return supabase;
}

export type EquipmentQueueSummary = {
  added: number;
  skippedExisting: number;
  skippedQueued: number;
};

function findCatalogueItem(
  name: string,
): EquipmentCatalogueItem | undefined {
  return equipmentCatalogue.find(
    (item) =>
      item.name.toLowerCase() ===
      name.trim().toLowerCase(),
  );
}

export async function queueCatalogueEquipment(
  names: string[],
): Promise<EquipmentQueueSummary> {
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
      "Select at least one equipment product to queue.",
    );
  }

  if (cleanNames.length > 100) {
    throw new Error(
      "A maximum of 100 products can be queued at once.",
    );
  }

  let added = 0;
  let skippedExisting = 0;
  let skippedQueued = 0;

  for (const productName of cleanNames) {
    const item =
      findCatalogueItem(productName);

    if (!item) {
      throw new Error(
        `${productName} is not in the equipment catalogue.`,
      );
    }

    /*
     * Cheapest and strongest duplicate check:
     * manufacturer + known product code.
     */
    if (item.manufacturerSku) {
      const { data: existingByCode } =
        await supabase
          .from("equipment")
          .select("id")
          .ilike(
            "brand",
            item.brand,
          )
          .eq(
            "manufacturer_product_code",
            item.manufacturerSku,
          )
          .limit(1)
          .maybeSingle();

      if (existingByCode) {
        skippedExisting += 1;
        continue;
      }
    }

    /*
     * Fallback pre-flight check using the
     * catalogue identity.
     */
    const { data: existingByName } =
      await supabase
        .from("equipment")
        .select("id")
        .ilike(
          "brand",
          item.brand,
        )
        .ilike(
          "name",
          item.name,
        )
        .limit(1)
        .maybeSingle();

    if (existingByName) {
      skippedExisting += 1;
      continue;
    }

    /*
     * Avoid duplicate active queue jobs.
     */
    const { data: queuedProduct } =
      await supabase
        .from(
          "equipment_generation_queue",
        )
        .select("id")
        .ilike(
          "product_name",
          item.name,
        )
        .ilike(
          "brand_hint",
          item.brand,
        )
        .in("status", [
          "pending",
          "processing",
        ])
        .limit(1)
        .maybeSingle();

    if (queuedProduct) {
      skippedQueued += 1;
      continue;
    }

    const { error } = await supabase
      .from(
        "equipment_generation_queue",
      )
      .insert({
        product_name: item.name,
        brand_hint: item.brand,
        model_hint:
          item.model ?? null,
        equipment_type_hint:
          item.equipmentType,
        manufacturer_sku_hint:
          item.manufacturerSku ??
          null,
        status: "pending",
        attempts: 0,
      });

    if (error) {
      /*
       * Another request could beat us to
       * the partial unique index.
       */
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
    skippedExisting,
    skippedQueued,
  };
}

export type EquipmentQueueItem = {
  id: string;
  product_name: string;
  brand_hint: string | null;
  model_hint: string | null;
  equipment_type_hint:
    | string
    | null;
  manufacturer_sku_hint:
    | string
    | null;

  status:
    | "pending"
    | "processing"
    | "completed"
    | "failed"
    | "skipped";

  attempts: number;
  error_message: string | null;
  equipment_id: string | null;
  created_at: string;
};

export async function getEquipmentQueue():
  Promise<EquipmentQueueItem[]> {
  const supabase =
    await requireAdmin();

  const { data, error } =
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
        status,
        attempts,
        error_message,
        equipment_id,
        created_at
      `)
      .order(
        "created_at",
        {
          ascending: true,
        },
      )
      .limit(200);

  if (error) {
    throw new Error(
      `Could not load equipment queue: ${error.message}`,
    );
  }

  return (
    data ?? []
  ) as EquipmentQueueItem[];
}
