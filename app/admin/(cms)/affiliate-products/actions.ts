"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  syncPartnerBoostProducts as runPartnerBoostSync,
} from "@/lib/affiliate/syncPartnerBoostProducts";

async function requireAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated.");
  }

  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminUser) {
    throw new Error("Admin access required.");
  }
}

export async function syncPartnerBoostProducts() {
  await requireAdmin();

  await runPartnerBoostSync();

  revalidatePath("/admin/affiliate-products");
}

export async function toggleAffiliateProductActive(
  formData: FormData,
) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const current =
    String(formData.get("current") ?? "") === "true";

  if (!id) {
    throw new Error("Missing affiliate product ID.");
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("affiliate_products")
    .update({
      is_active: !current,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(
      `Could not update affiliate product: ${error.message}`,
    );
  }

  revalidatePath("/admin/affiliate-products");
}

export async function toggleAffiliateProductFeatured(
  formData: FormData,
) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const current =
    String(formData.get("current") ?? "") === "true";

  if (!id) {
    throw new Error("Missing affiliate product ID.");
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("affiliate_products")
    .update({
      is_featured: !current,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(
      `Could not update affiliate product: ${error.message}`,
    );
  }

  revalidatePath("/admin/affiliate-products");
}
