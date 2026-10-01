import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { saveArticleAssignments } from "./actions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    saved?: string;
  }>;
};

type Article = {
  id: string;
  title: string;
  slug: string;
  content_type: string;
  status: string;
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
  if (!article.categories) {
    return "Uncategorised";
  }

  if (Array.isArray(article.categories)) {
    return (
      article.categories[0]?.name ??
      "Uncategorised"
    );
  }

  return article.categories.name;
}

export default async function AffiliateProductArticlesPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { saved } = await searchParams;

  const supabase = createAdminClient();

  const [
    productResult,
    articleResult,
    assignmentResult,
  ] = await Promise.all([
    supabase
      .from("affiliate_products")
      .select(
        `
          id,
          name,
          asin,
          image_url,
          price,
          commission,
          merchant,
          availability
        `,
      )
      .eq("id", id)
      .maybeSingle(),

    supabase
      .from("articles")
      .select(`
        id,
        title,
        slug,
        content_type,
        status,
        categories (
          name
        )
      `)
      .order("updated_at", {
        ascending: false,
      }),

    supabase
      .from("article_affiliate_products")
      .select("article_id")
      .eq("affiliate_product_id", id),
  ]);

  if (
    productResult.error ||
    !productResult.data
  ) {
    notFound();
  }

  if (articleResult.error) {
    throw new Error(
      `Could not load articles: ${articleResult.error.message}`,
    );
  }

  if (assignmentResult.error) {
    throw new Error(
      `Could not load assignments: ${assignmentResult.error.message}`,
    );
  }

  const product = productResult.data;

  const articles =
    (articleResult.data ?? []) as Article[];

  const selectedIds = new Set(
    (assignmentResult.data ?? []).map(
      (assignment) => assignment.article_id,
    ),
  );

  return (
    <main className="admin-content">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">
            AFFILIATE PRODUCTS
          </p>

          <h1>Assign to Articles</h1>

          <p>
            Choose where this product should appear
            across PondStuff content.
          </p>
        </div>

        <Link
          href="/admin/affiliate-products"
          className="admin-primary-button"
        >
          ← Affiliate products
        </Link>
      </div>

      {saved === "1" ? (
        <div className="affiliate-save-notice">
          ✓ Article assignments saved.
        </div>
      ) : null}

      <section className="affiliate-assignment-product">
        <div className="affiliate-assignment-image">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt=""
            />
          ) : null}
        </div>

        <div>
          <span>
            {product.merchant} ·{" "}
            {product.asin}
          </span>

          <h2>{product.name}</h2>

          <p>
            {product.price ?? "Price unavailable"}
            {" · "}
            {product.commission ?? "—"} commission
            {" · "}
            {product.availability === "IN_STOCK"
              ? "In stock"
              : product.availability ?? "Unknown"}
          </p>

          <strong>
            Currently assigned to{" "}
            {selectedIds.size}{" "}
            {selectedIds.size === 1
              ? "article"
              : "articles"}
          </strong>
        </div>
      </section>

      <form action={saveArticleAssignments}>
        <input
          type="hidden"
          name="product_id"
          value={product.id}
        />

        <section className="admin-panel">
          <div className="affiliate-assignment-heading">
            <div>
              <h2>Choose articles</h2>

              <p>
                Tick every article where this product
                is genuinely relevant.
              </p>
            </div>

            <button
              type="submit"
              className="admin-primary-button"
            >
              Save assignments
            </button>
          </div>

          {articles.length === 0 ? (
            <div className="admin-empty-state">
              <h2>No articles available.</h2>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table affiliate-assignment-table">
                <thead>
                  <tr>
                    <th>Use</th>
                    <th>Article</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {articles.map((article) => (
                    <tr key={article.id}>
                      <td>
                        <input
                          type="checkbox"
                          name="article_ids"
                          value={article.id}
                          defaultChecked={selectedIds.has(
                            article.id,
                          )}
                          aria-label={`Use product in ${article.title}`}
                        />
                      </td>

                      <td>
                        <strong>
                          {article.title}
                        </strong>

                        <small>
                          /{article.slug}
                        </small>
                      </td>

                      <td>
                        <span className="admin-type">
                          {article.content_type}
                        </span>
                      </td>

                      <td>
                        {getCategoryName(article)}
                      </td>

                      <td>
                        <span
                          className={`admin-status admin-status-${article.status}`}
                        >
                          {article.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="affiliate-assignment-footer">
            <button
              type="submit"
              className="admin-primary-button"
            >
              Save assignments
            </button>
          </div>
        </section>
      </form>
    </main>
  );
}
