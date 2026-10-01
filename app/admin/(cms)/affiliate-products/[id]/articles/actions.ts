"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

export async function saveArticleAssignments(
  formData: FormData,
) {
  await requireAdmin();

  const productId = String(
    formData.get("product_id") ?? "",
  );

  if (!productId) {
    throw new Error("Missing affiliate product ID.");
  }

  const selectedArticleIds = [
    ...new Set(
      formData
        .getAll("article_ids")
        .map((value) => String(value))
        .filter(Boolean),
    ),
  ];

  const supabase = createAdminClient();

  const { data: product, error: productError } =
    await supabase
      .from("affiliate_products")
      .select("id")
      .eq("id", productId)
      .maybeSingle();

  if (productError || !product) {
    throw new Error(
      "Affiliate product could not be found.",
    );
  }

  if (selectedArticleIds.length > 0) {
    const { data: validArticles, error: articleError } =
      await supabase
        .from("articles")
        .select("id")
        .in("id", selectedArticleIds);

    if (articleError) {
      throw new Error(
        `Could not validate articles: ${articleError.message}`,
      );
    }

    if (
      (validArticles ?? []).length !==
      selectedArticleIds.length
    ) {
      throw new Error(
        "One or more selected articles could not be found.",
      );
    }
  }

  const { data: currentAssignments, error: currentError } =
    await supabase
      .from("article_affiliate_products")
      .select("article_id")
      .eq("affiliate_product_id", productId);

  if (currentError) {
    throw new Error(
      `Could not load current assignments: ${currentError.message}`,
    );
  }

  const existingIds = new Set(
    (currentAssignments ?? []).map(
      (assignment) => assignment.article_id,
    ),
  );

  if (selectedArticleIds.length > 0) {
    const rows = selectedArticleIds.map(
      (articleId, index) => ({
        article_id: articleId,
        affiliate_product_id: productId,
        sort_order: index,
        placement: "recommended",
      }),
    );

    const { error: upsertError } = await supabase
      .from("article_affiliate_products")
      .upsert(rows, {
        onConflict:
          "article_id,affiliate_product_id",
      });

    if (upsertError) {
      throw new Error(
        `Could not save article assignments: ${upsertError.message}`,
      );
    }
  }

  const selectedSet = new Set(selectedArticleIds);

  const removedIds = [...existingIds].filter(
    (articleId) => !selectedSet.has(articleId),
  );

  if (removedIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("article_affiliate_products")
      .delete()
      .eq("affiliate_product_id", productId)
      .in("article_id", removedIds);

    if (deleteError) {
      throw new Error(
        `Could not remove article assignments: ${deleteError.message}`,
      );
    }
  }

  revalidatePath("/admin/affiliate-products");
  revalidatePath(
    `/admin/affiliate-products/${productId}/articles`,
  );

  redirect(
    `/admin/affiliate-products/${productId}/articles?saved=1`,
  );
}
