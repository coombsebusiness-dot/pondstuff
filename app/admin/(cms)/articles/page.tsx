import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Article = {
  id: string;
  title: string;
  slug: string;
  content_type: string;
  status: string;
  is_featured: boolean;
  published_at: string | null;
  updated_at: string;
  categories:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
};

function getCategoryName(article: Article) {
  if (!article.categories) return "Uncategorised";

  if (Array.isArray(article.categories)) {
    return article.categories[0]?.name ?? "Uncategorised";
  }

  return article.categories.name;
}

export default async function AdminArticlesPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(`
      id,
      title,
      slug,
      content_type,
      status,
      is_featured,
      published_at,
      updated_at,
      categories (
        name
      )
    `)
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Could not load articles: ${error.message}`,
    );
  }

  const articles = (data ?? []) as Article[];

  return (
    <main className="admin-content">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">CONTENT</p>
          <h1>Articles</h1>
          <p>
            Manage PondStuff guides, problem-solving articles,
            equipment content and features.
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="admin-primary-button"
        >
          + New article
        </Link>
      </div>

      <section className="admin-panel">
        {articles.length === 0 ? (
          <div className="admin-empty-state">
            <span>✦</span>
            <h2>No articles yet.</h2>
            <p>
              PondStuff is currently suspiciously quiet.
              Let's fix that.
            </p>

            <Link
              href="/admin/articles/new"
              className="admin-primary-button"
            >
              Create the first article
            </Link>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {articles.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <strong>{article.title}</strong>
                      <small>/{article.slug}</small>
                    </td>

                    <td>
                      <span className="admin-type">
                        {article.content_type}
                      </span>
                    </td>

                    <td>{getCategoryName(article)}</td>

                    <td>
                      <span
                        className={`admin-status admin-status-${article.status}`}
                      >
                        {article.status}
                      </span>
                    </td>

                    <td>
                      {article.is_featured ? "Yes" : "—"}
                    </td>

                    <td className="admin-table-action">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                      >
                        Edit →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
