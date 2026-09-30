"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function textValue(
  formData: FormData,
  key: string,
) {
  const value = formData.get(key);

  return typeof value === "string" &&
    value.trim()
    ? value.trim()
    : null;
}

function numberValue(
  formData: FormData,
  key: string,
) {
  const value = textValue(
    formData,
    key,
  );

  if (value === null) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function checked(
  formData: FormData,
  key: string,
) {
  return formData.get(key) === "on";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function requireAdmin() {
  const supabase =
    await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminUser } =
    await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

  if (!adminUser) {
    redirect("/admin/login");
  }

  return supabase;
}

type ResearchSource = {
  title: string;
  url: string;
};

function researchSourcesValue(
  formData: FormData,
): ResearchSource[] {
  const raw =
    formData.get("research_sources");

  if (
    typeof raw !== "string" ||
    !raw.trim()
  ) {
    return [];
  }

  try {
    const parsed: unknown =
      JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap(
      (item): ResearchSource[] => {
        if (
          typeof item !== "object" ||
          item === null
        ) {
          return [];
        }

        const record =
          item as Record<string, unknown>;

        if (
          typeof record.title !==
            "string" ||
          typeof record.url !==
            "string"
        ) {
          return [];
        }

        const title =
          record.title.trim();

        const url =
          record.url.trim();

        if (!title || !url) {
          return [];
        }

        try {
          const parsedUrl =
            new URL(url);

          if (
            parsedUrl.protocol !==
              "http:" &&
            parsedUrl.protocol !==
              "https:"
          ) {
            return [];
          }
        } catch {
          return [];
        }

        return [{ title, url }];
      },
    );
  } catch {
    return [];
  }
}

function specificationsValue(
  formData: FormData,
) {
  const raw =
    textValue(
      formData,
      "specifications",
    );

  if (!raw) {
    return {};
  }

  try {
    const parsed: unknown =
      JSON.parse(raw);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed;
  } catch {
    return {};
  }
}

function equipmentPayload(
  formData: FormData,
) {
  return {
    name:
      textValue(formData, "name"),
    brand:
      textValue(formData, "brand"),
    model:
      textValue(formData, "model"),

    equipment_type:
      textValue(
        formData,
        "equipment_type",
      ),

    summary:
      textValue(formData, "summary"),

    description:
      textValue(
        formData,
        "description",
      ),

    max_flow_lph:
      numberValue(
        formData,
        "max_flow_lph",
      ),

    max_head_m:
      numberValue(
        formData,
        "max_head_m",
      ),

    power_watts:
      numberValue(
        formData,
        "power_watts",
      ),

    max_pond_volume_litres:
      numberValue(
        formData,
        "max_pond_volume_litres",
      ),

    max_fish_pond_volume_litres:
      numberValue(
        formData,
        "max_fish_pond_volume_litres",
      ),

    max_koi_pond_volume_litres:
      numberValue(
        formData,
        "max_koi_pond_volume_litres",
      ),

    uv_watts:
      numberValue(
        formData,
        "uv_watts",
      ),

    cable_length_m:
      numberValue(
        formData,
        "cable_length_m",
      ),

    specifications:
      specificationsValue(formData),

    best_for:
      textValue(
        formData,
        "best_for",
      ),

    limitations:
      textValue(
        formData,
        "limitations",
      ),

    installation_notes:
      textValue(
        formData,
        "installation_notes",
      ),

    maintenance_notes:
      textValue(
        formData,
        "maintenance_notes",
      ),

    safety_notes:
      textValue(
        formData,
        "safety_notes",
      ),

    manufacturer_url:
      textValue(
        formData,
        "manufacturer_url",
      ),

    research_sources:
      researchSourcesValue(formData),

    image_url:
      textValue(
        formData,
        "image_url",
      ),

    image_alt:
      textValue(
        formData,
        "image_alt",
      ),

    image_credit:
      textValue(
        formData,
        "image_credit",
      ),

    seo_title:
      textValue(
        formData,
        "seo_title",
      ),

    meta_description:
      textValue(
        formData,
        "meta_description",
      ),

    affiliate_url:
      textValue(
        formData,
        "affiliate_url",
      ),

    affiliate_network:
      textValue(
        formData,
        "affiliate_network",
      ),

    is_featured:
      checked(
        formData,
        "is_featured",
      ),
  };
}

export async function createEquipment(
  formData: FormData,
) {
  const supabase =
    await requireAdmin();

  const name =
    textValue(formData, "name");

  const equipmentType =
    textValue(
      formData,
      "equipment_type",
    );

  if (!name) {
    redirect(
      "/admin/equipment/new?error=Equipment%20name%20is%20required",
    );
  }

  if (!equipmentType) {
    redirect(
      "/admin/equipment/new?error=Equipment%20type%20is%20required",
    );
  }

  const slug =
    slugify(
      textValue(
        formData,
        "slug",
      ) ?? name,
    );

  if (!slug) {
    redirect(
      "/admin/equipment/new?error=A%20valid%20slug%20is%20required",
    );
  }

  const { data: existing } =
    await supabase
      .from("equipment")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

  if (existing) {
    redirect(
      "/admin/equipment/new?error=That%20slug%20is%20already%20in%20use",
    );
  }

  const intent =
    textValue(
      formData,
      "intent",
    ) ?? "draft";

  const status =
    intent === "publish"
      ? "published"
      : "draft";

  const { data, error } =
    await supabase
      .from("equipment")
      .insert({
        ...equipmentPayload(
          formData,
        ),
        name,
        slug,
        equipment_type:
          equipmentType,
        status,
        published_at:
          status === "published"
            ? new Date().toISOString()
            : null,
      })
      .select("id")
      .single();

  if (error || !data) {
    redirect(
      `/admin/equipment/new?error=${encodeURIComponent(
        error?.message ??
          "Could not create equipment",
      )}`,
    );
  }

  revalidatePath(
    "/admin/equipment",
  );

  redirect(
    `/admin/equipment/${data.id}/edit?saved=1`,
  );
}

export async function updateEquipment(
  equipmentId: string,
  formData: FormData,
) {
  const supabase =
    await requireAdmin();

  const name =
    textValue(formData, "name");

  const equipmentType =
    textValue(
      formData,
      "equipment_type",
    );

  if (!name || !equipmentType) {
    redirect(
      `/admin/equipment/${equipmentId}/edit?error=${encodeURIComponent(
        "Name and equipment type are required.",
      )}`,
    );
  }

  const slug =
    slugify(
      textValue(
        formData,
        "slug",
      ) ?? name,
    );

  const intent =
    textValue(
      formData,
      "intent",
    ) ?? "draft";

  const { data: current } =
    await supabase
      .from("equipment")
      .select(
        "status, published_at",
      )
      .eq("id", equipmentId)
      .maybeSingle();

  if (!current) {
    redirect(
      "/admin/equipment",
    );
  }

  const status =
    intent === "publish"
      ? "published"
      : "draft";

  const publishedAt =
    status === "published"
      ? current.published_at ??
        new Date().toISOString()
      : null;

  const { error } =
    await supabase
      .from("equipment")
      .update({
        ...equipmentPayload(
          formData,
        ),
        name,
        slug,
        equipment_type:
          equipmentType,
        status,
        published_at:
          publishedAt,
      })
      .eq("id", equipmentId);

  if (error) {
    redirect(
      `/admin/equipment/${equipmentId}/edit?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath(
    "/admin/equipment",
  );

  redirect(
    `/admin/equipment/${equipmentId}/edit?saved=1`,
  );
}

export async function deleteEquipment(
  equipmentId: string,
) {
  const supabase =
    await requireAdmin();

  const { error } =
    await supabase
      .from("equipment")
      .delete()
      .eq("id", equipmentId);

  if (error) {
    redirect(
      `/admin/equipment/${equipmentId}/edit?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath(
    "/admin/equipment",
  );

  redirect("/admin/equipment");
}

export async function generateEquipmentDraft(
  productName: string,
  equipmentTypeHint?: string | null,
) {
  const cleanName =
    productName.trim();

  if (!cleanName) {
    throw new Error(
      "Enter an equipment product or model first.",
    );
  }

  await requireAdmin();

  const {
    generatePondStuffEquipment,
  } = await import(
    "@/lib/equipment/PondStuffEquipmentWriter"
  );

  return generatePondStuffEquipment(
    cleanName,
    equipmentTypeHint,
  );
}
