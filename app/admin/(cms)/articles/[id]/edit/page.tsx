import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ArticleEditor from "../../ArticleEditor";

type EditArticlePageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function EditArticlePage({
  params,
  searchParams,
}: EditArticlePageProps) {
  const { id } = await params;
  const query = await searchParams;

  const supabase = await createClient();

  const [
    { data: article, error: articleError },
    { data: categories, error: categoriesError },
  ] = await Promise.all([
    supabase
      .from("articles")
      .select(`
        id,
        title,
        slug,
        content_type,
        category_id,
        excerpt,
        intro,
        sections,
        hero_image_url,
        hero_image_alt,
        hero_image_credit,
        seo_title,
        meta_description,
        status,
        is_featured
      `)
      .eq("id", id)
      .maybeSingle(),

    supabase
      .from("categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("sort_order", {
        ascending: true,
      }),
  ]);

  if (articleError) {
    throw new Error(
      `Could not load article: ${articleError.message}`,
    );
  }

  if (categoriesError) {
    throw new Error(
      `Could not load categories: ${categoriesError.message}`,
    );
  }

  if (!article) {
    notFound();
  }

  return (
    <main className="admin-content">
      <div className="admin-editor-top">
        <div>
          <Link
            href="/admin/articles"
            className="admin-back-link"
          >
            ← Articles
          </Link>

          <p className="admin-eyebrow">
            EDIT CONTENT
          </p>

          <h1>Edit article</h1>
        </div>
      </div>

      {query.saved && (
        <div className="admin-editor-success">
          Article saved successfully.
        </div>
      )}

      {query.error && (
        <div className="admin-editor-error">
          {query.error}
        </div>
      )}

      <ArticleEditor
        categories={categories ?? []}
        initialArticle={article}
      />
    </main>
  );
}
