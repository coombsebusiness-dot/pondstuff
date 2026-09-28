"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ArticleSection = {
  eyebrow: string;
  headline: string;
  body: string;
};

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function nullableText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value || null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseSections(value: string): ArticleSection[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((section) => ({
        eyebrow: String(section?.eyebrow ?? "").trim(),
        headline: String(section?.headline ?? "").trim(),
        body: String(section?.body ?? "").trim(),
      }))
      .filter(
        (section) =>
          section.eyebrow ||
          section.headline ||
          section.body,
      );
  } catch {
    return [];
  }
}

async function getUniqueSlug(
  baseSlug: string,
) {
  const supabase = await createClient();

  let candidate = baseSlug;
  let suffix = 2;

  while (true) {
    const { data, error } = await supabase
      .from("articles")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Could not check article slug: ${error.message}`,
      );
    }

    if (!data) {
      return candidate;
    }

    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function createArticle(
  formData: FormData,
) {
  const title = text(formData, "title");
  const requestedSlug = text(formData, "slug");
  const contentType = text(
    formData,
    "content_type",
  );
  const categoryId = nullableText(
    formData,
    "category_id",
  );
  const intent = text(
    formData,
    "publish_intent",
  );

  if (!title) {
    redirect(
      "/admin/articles/new?error=An%20article%20title%20is%20required",
    );
  }

  const allowedTypes = [
    "guide",
    "problem",
    "equipment",
    "feature",
  ];

  if (!allowedTypes.includes(contentType)) {
    redirect(
      "/admin/articles/new?error=Choose%20a%20valid%20content%20type",
    );
  }

  const baseSlug =
    slugify(requestedSlug) ||
    slugify(title);

  if (!baseSlug) {
    redirect(
      "/admin/articles/new?error=The%20article%20needs%20a%20valid%20slug",
    );
  }

  const slug = await getUniqueSlug(baseSlug);

  const status =
    intent === "publish"
      ? "published"
      : "draft";

  const sections = parseSections(
    text(formData, "sections"),
  );

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
    redirect(
      "/admin/login?error=You%20do%20not%20have%20admin%20access",
    );
  }

  const { data: article, error } =
    await supabase
      .from("articles")
      .insert({
        title,
        slug,
        content_type: contentType,
        category_id: categoryId,
        excerpt: nullableText(
          formData,
          "excerpt",
        ),
        intro: nullableText(
          formData,
          "intro",
        ),
        sections,
        hero_image_url: nullableText(
          formData,
          "hero_image_url",
        ),
        hero_image_alt: nullableText(
          formData,
          "hero_image_alt",
        ),
        hero_image_credit: nullableText(
          formData,
          "hero_image_credit",
        ),
        seo_title: nullableText(
          formData,
          "seo_title",
        ),
        meta_description: nullableText(
          formData,
          "meta_description",
        ),
        is_featured:
          formData.get("is_featured") ===
          "on",
        status,
        published_at:
          status === "published"
            ? new Date().toISOString()
            : null,
      })
      .select("id")
      .single();

  if (error) {
    redirect(
      `/admin/articles/new?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/articles");

  redirect(
    `/admin/articles/${article.id}/edit?saved=created`,
  );
}

export async function updateArticle(
  articleId: string,
  formData: FormData,
) {
  const title = text(formData, "title");
  const requestedSlug = text(formData, "slug");
  const contentType = text(formData, "content_type");
  const categoryId = nullableText(formData, "category_id");
  const intent = text(formData, "publish_intent");

  if (!title) {
    redirect(
      `/admin/articles/${articleId}/edit?error=An%20article%20title%20is%20required`,
    );
  }

  const allowedTypes = [
    "guide",
    "problem",
    "equipment",
    "feature",
  ];

  if (!allowedTypes.includes(contentType)) {
    redirect(
      `/admin/articles/${articleId}/edit?error=Choose%20a%20valid%20content%20type`,
    );
  }

  const slug =
    slugify(requestedSlug) ||
    slugify(title);

  if (!slug) {
    redirect(
      `/admin/articles/${articleId}/edit?error=The%20article%20needs%20a%20valid%20slug`,
    );
  }

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
    redirect(
      "/admin/login?error=You%20do%20not%20have%20admin%20access",
    );
  }

  const { data: existingArticle } = await supabase
    .from("articles")
    .select("status, published_at")
    .eq("id", articleId)
    .single();

  if (!existingArticle) {
    redirect("/admin/articles");
  }

  const { data: slugOwner } = await supabase
    .from("articles")
    .select("id")
    .eq("slug", slug)
    .neq("id", articleId)
    .maybeSingle();

  if (slugOwner) {
    redirect(
      `/admin/articles/${articleId}/edit?error=That%20slug%20is%20already%20being%20used`,
    );
  }

  const status =
    intent === "publish"
      ? "published"
      : "draft";

  const publishedAt =
    status === "published"
      ? existingArticle.published_at ??
        new Date().toISOString()
      : null;

  const sections = parseSections(
    text(formData, "sections"),
  );

  const { error } = await supabase
    .from("articles")
    .update({
      title,
      slug,
      content_type: contentType,
      category_id: categoryId,
      excerpt: nullableText(formData, "excerpt"),
      intro: nullableText(formData, "intro"),
      sections,
      hero_image_url: nullableText(
        formData,
        "hero_image_url",
      ),
      hero_image_alt: nullableText(
        formData,
        "hero_image_alt",
      ),
      hero_image_credit: nullableText(
        formData,
        "hero_image_credit",
      ),
      seo_title: nullableText(
        formData,
        "seo_title",
      ),
      meta_description: nullableText(
        formData,
        "meta_description",
      ),
      is_featured:
        formData.get("is_featured") === "on",
      status,
      published_at: publishedAt,
    })
    .eq("id", articleId);

  if (error) {
    redirect(
      `/admin/articles/${articleId}/edit?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath(
    `/admin/articles/${articleId}/edit`,
  );

  redirect(
    `/admin/articles/${articleId}/edit?saved=1`,
  );
}
