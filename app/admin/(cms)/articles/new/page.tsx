import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ArticleEditor from "../ArticleEditor";

type NewArticlePageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewArticlePage({
  searchParams,
}: NewArticlePageProps) {
  const supabase = await createClient();

  const { data: categories, error } =
    await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("sort_order", {
        ascending: true,
      });

  if (error) {
    throw new Error(
      `Could not load categories: ${error.message}`,
    );
  }

  const params = await searchParams;

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
            NEW CONTENT
          </p>

          <h1>New article</h1>
        </div>
      </div>

      {params.error && (
        <div className="admin-editor-error">
          {params.error}
        </div>
      )}

      <ArticleEditor
        categories={categories ?? []}
      />
    </main>
  );
}
