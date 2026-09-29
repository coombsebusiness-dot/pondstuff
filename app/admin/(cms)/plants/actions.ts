"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim()
    ? value.trim()
    : null;
}

function numberValue(formData: FormData, key: string) {
  const value = textValue(formData, key);

  if (value === null) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function triStateBoolean(
  formData: FormData,
  key: string,
): boolean | null {
  const value = textValue(formData, key);

  if (value === "yes") return true;
  if (value === "no") return false;

  return null;
}

function checked(formData: FormData, key: string) {
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
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminUser) {
    redirect("/admin/login");
  }

  return supabase;
}

export async function createPlant(formData: FormData) {
  const supabase = await requireAdmin();

  const commonName = textValue(
    formData,
    "common_name",
  );

  if (!commonName) {
    redirect(
      "/admin/plants/new?error=Common%20name%20is%20required",
    );
  }

  const requestedSlug =
    textValue(formData, "slug") ??
    slugify(commonName);

  if (!requestedSlug) {
    redirect(
      "/admin/plants/new?error=A%20valid%20slug%20is%20required",
    );
  }

  const { data: existing } = await supabase
    .from("plants")
    .select("id")
    .eq("slug", requestedSlug)
    .maybeSingle();

  if (existing) {
    redirect(
      "/admin/plants/new?error=That%20slug%20is%20already%20in%20use",
    );
  }

  const intent =
    textValue(formData, "intent") ?? "draft";

  const status =
    intent === "publish"
      ? "published"
      : "draft";

  const nativeValue =
    textValue(formData, "is_native_uk");

  const isNativeUk =
    nativeValue === "yes"
      ? true
      : nativeValue === "no"
        ? false
        : null;

  const floweringMonths = formData
    .getAll("flowering_months")
    .filter(
      (value): value is string =>
        typeof value === "string",
    );

  const { data: plant, error } = await supabase
    .from("plants")
    .insert({
      common_name: commonName,
      scientific_name: textValue(
        formData,
        "scientific_name",
      ),
      slug: requestedSlug,
      plant_type: textValue(
        formData,
        "plant_type",
      ),
      summary: textValue(formData, "summary"),
      description: textValue(
        formData,
        "description",
      ),
      min_planting_depth_cm: numberValue(
        formData,
        "min_planting_depth_cm",
      ),
      max_planting_depth_cm: numberValue(
        formData,
        "max_planting_depth_cm",
      ),
      min_water_depth_cm: numberValue(
        formData,
        "min_water_depth_cm",
      ),
      max_water_depth_cm: numberValue(
        formData,
        "max_water_depth_cm",
      ),
      max_height_cm: numberValue(
        formData,
        "max_height_cm",
      ),
      max_spread_cm: numberValue(
        formData,
        "max_spread_cm",
      ),
      sunlight: textValue(
        formData,
        "sunlight",
      ),
      flowering_months: floweringMonths,
      is_native_uk: isNativeUk,
      is_oxygenating: triStateBoolean(
        formData,
        "is_oxygenating",
      ),
      is_wildlife_friendly: triStateBoolean(
        formData,
        "is_wildlife_friendly",
      ),
      is_small_pond_suitable: triStateBoolean(
        formData,
        "is_small_pond_suitable",
      ),
      hardiness: textValue(
        formData,
        "hardiness",
      ),
      growth_habit: textValue(
        formData,
        "growth_habit",
      ),
      planting_method: textValue(
        formData,
        "planting_method",
      ),
      winter_behaviour: textValue(
        formData,
        "winter_behaviour",
      ),
      propagation: textValue(
        formData,
        "propagation",
      ),
      maintenance_notes: textValue(
        formData,
        "maintenance_notes",
      ),
      legal_status_uk: textValue(
        formData,
        "legal_status_uk",
      ),
      legal_status_notes: textValue(
        formData,
        "legal_status_notes",
      ),
      care_level: textValue(
        formData,
        "care_level",
      ),
      image_url: textValue(
        formData,
        "image_url",
      ),
      image_alt: textValue(
        formData,
        "image_alt",
      ),
      image_credit: textValue(
        formData,
        "image_credit",
      ),
      seo_title: textValue(
        formData,
        "seo_title",
      ),
      meta_description: textValue(
        formData,
        "meta_description",
      ),
      status,
      is_featured: checked(
        formData,
        "is_featured",
      ),
      published_at:
        status === "published"
          ? new Date().toISOString()
          : null,
    })
    .select("id")
    .single();

  if (error || !plant) {
    redirect(
      `/admin/plants/new?error=${encodeURIComponent(
        error?.message ??
          "Could not create plant",
      )}`,
    );
  }

  redirect(`/admin/plants/${plant.id}/edit`);
}

export async function generatePlantDraft(
  plantName: string,
) {
  const cleanName = plantName.trim();

  if (!cleanName) {
    throw new Error(
      "Enter a plant name first.",
    );
  }

  await requireAdmin();

  const {
    generatePondStuffPlant,
  } = await import(
    "@/lib/plants/PondStuffPlantWriter"
  );

  return generatePondStuffPlant(cleanName);
}

export async function updatePlant(
  plantId: string,
  formData: FormData,
) {
  const commonName =
    textValue(formData, "common_name");

  const requestedSlug =
    textValue(formData, "slug");

  const intent =
    textValue(formData, "intent");

  if (!commonName) {
    redirect(
      `/admin/plants/${plantId}/edit?error=${encodeURIComponent(
        "A common name is required.",
      )}`,
    );
  }

  const slug =
    slugify(requestedSlug ?? "") ||
    slugify(commonName);

  if (!slug) {
    redirect(
      `/admin/plants/${plantId}/edit?error=${encodeURIComponent(
        "The plant needs a valid slug.",
      )}`,
    );
  }

  const supabase =
    await requireAdmin();

  const {
    data: existingPlant,
    error: existingError,
  } = await supabase
    .from("plants")
    .select("id, status, published_at")
    .eq("id", plantId)
    .maybeSingle();

  if (existingError) {
    redirect(
      `/admin/plants/${plantId}/edit?error=${encodeURIComponent(
        existingError.message,
      )}`,
    );
  }

  if (!existingPlant) {
    redirect("/admin/plants");
  }

  const {
    data: slugOwner,
    error: slugError,
  } = await supabase
    .from("plants")
    .select("id")
    .eq("slug", slug)
    .neq("id", plantId)
    .maybeSingle();

  if (slugError) {
    redirect(
      `/admin/plants/${plantId}/edit?error=${encodeURIComponent(
        slugError.message,
      )}`,
    );
  }

  if (slugOwner) {
    redirect(
      `/admin/plants/${plantId}/edit?error=${encodeURIComponent(
        "That slug is already being used.",
      )}`,
    );
  }

  const status =
    intent === "publish"
      ? "published"
      : "draft";

  const publishedAt =
    status === "published"
      ? existingPlant.published_at ??
        new Date().toISOString()
      : null;

  const nativeValue =
    textValue(
      formData,
      "is_native_uk",
    );

  const isNativeUk =
    nativeValue === "yes"
      ? true
      : nativeValue === "no"
        ? false
        : null;

  const floweringMonths =
    formData
      .getAll("flowering_months")
      .map(String)
      .filter(Boolean);

  const { error } =
    await supabase
      .from("plants")
      .update({
        common_name: commonName,
        scientific_name:
          textValue(
            formData,
            "scientific_name",
          ) || null,
        slug,
        plant_type:
          textValue(
            formData,
            "plant_type",
          ) || null,
        summary:
          textValue(
            formData,
            "summary",
          ) || null,
        description:
          textValue(
            formData,
            "description",
          ) || null,

        min_planting_depth_cm:
          numberValue(
            formData,
            "min_planting_depth_cm",
          ),
        max_planting_depth_cm:
          numberValue(
            formData,
            "max_planting_depth_cm",
          ),

        min_water_depth_cm:
          numberValue(
            formData,
            "min_water_depth_cm",
          ),

        max_water_depth_cm:
          numberValue(
            formData,
            "max_water_depth_cm",
          ),

        max_height_cm:
          numberValue(
            formData,
            "max_height_cm",
          ),
        max_spread_cm:
          numberValue(
            formData,
            "max_spread_cm",
          ),

        sunlight:
          textValue(
            formData,
            "sunlight",
          ) || null,

        flowering_months:
          floweringMonths,

        is_native_uk:
          isNativeUk,

        is_oxygenating:
          triStateBoolean(
            formData,
            "is_oxygenating",
          ),

        is_wildlife_friendly:
          triStateBoolean(
            formData,
            "is_wildlife_friendly",
          ),

        is_small_pond_suitable:
          triStateBoolean(
            formData,
            "is_small_pond_suitable",
          ),

        hardiness:
          textValue(
            formData,
            "hardiness",
          ) || null,

        growth_habit:
          textValue(
            formData,
            "growth_habit",
          ) || null,

        planting_method:
          textValue(
            formData,
            "planting_method",
          ) || null,

        winter_behaviour:
          textValue(
            formData,
            "winter_behaviour",
          ) || null,

        propagation:
          textValue(
            formData,
            "propagation",
          ) || null,

        maintenance_notes:
          textValue(
            formData,
            "maintenance_notes",
          ) || null,

        legal_status_uk:
          textValue(
            formData,
            "legal_status_uk",
          ) || null,

        legal_status_notes:
          textValue(
            formData,
            "legal_status_notes",
          ) || null,

        care_level:
          textValue(
            formData,
            "care_level",
          ) || null,

        image_url:
          textValue(
            formData,
            "image_url",
          ) || null,

        image_alt:
          textValue(
            formData,
            "image_alt",
          ) || null,

        image_credit:
          textValue(
            formData,
            "image_credit",
          ) || null,

        seo_title:
          textValue(
            formData,
            "seo_title",
          ) || null,

        meta_description:
          textValue(
            formData,
            "meta_description",
          ) || null,

        is_featured:
          checked(
            formData,
            "is_featured",
          ),

        status,
        published_at:
          publishedAt,
      })
      .eq("id", plantId);

  if (error) {
    redirect(
      `/admin/plants/${plantId}/edit?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/plants");
  revalidatePath(
    `/admin/plants/${plantId}/edit`,
  );
  revalidatePath("/plants");
  revalidatePath(`/plants/${slug}`);

  redirect(
    `/admin/plants/${plantId}/edit?saved=1`,
  );
}

export async function deletePlant(
  plantId: string,
) {
  const supabase =
    await requireAdmin();

  const {
    data: plant,
    error: loadError,
  } = await supabase
    .from("plants")
    .select("slug")
    .eq("id", plantId)
    .maybeSingle();

  if (loadError) {
    redirect(
      `/admin/plants/${plantId}/edit?error=${encodeURIComponent(
        loadError.message,
      )}`,
    );
  }

  if (!plant) {
    redirect("/admin/plants");
  }

  const { error } =
    await supabase
      .from("plants")
      .delete()
      .eq("id", plantId);

  if (error) {
    redirect(
      `/admin/plants/${plantId}/edit?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/plants");
  revalidatePath("/plants");
  revalidatePath(
    `/plants/${plant.slug}`,
  );

  redirect(
    "/admin/plants?deleted=1",
  );
}
