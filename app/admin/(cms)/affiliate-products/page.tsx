import Link from "next/link";
import {
  syncPartnerBoostProducts,
  toggleAffiliateProductActive,
  toggleAffiliateProductFeatured,
} from "./actions";
import { createAdminClient } from "@/lib/supabase/admin";

type AffiliateProduct = {
  id: string;
  provider: string;
  merchant: string;
  brand_id: string | null;
  asin: string | null;
  name: string;
  image_url: string | null;
  category: string | null;
  price: string | null;
  currency: string | null;
  commission: string | null;
  rating: number | null;
  reviews: number | null;
  availability: string | null;
  affiliate_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  last_synced_at: string | null;
};

function normaliseProductName(name: string) {
  return name
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatSyncDate(value: string | null) {
  if (!value) return "Never";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function AdminAffiliateProductsPage() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("affiliate_products")
    .select(`
      id,
      provider,
      merchant,
      brand_id,
      asin,
      name,
      image_url,
      category,
      price,
      currency,
      commission,
      rating,
      reviews,
      availability,
      affiliate_url,
      is_active,
      is_featured,
      last_synced_at
    `)
    .order("name", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Could not load affiliate products: ${error.message}`,
    );
  }

  const products = (data ?? []) as AffiliateProduct[];

  const { data: assignments } = await supabase
    .from("article_affiliate_products")
    .select("affiliate_product_id");

  const assignmentCounts = new Map<string, number>();

  for (const assignment of assignments ?? []) {
    const id = assignment.affiliate_product_id;

    assignmentCounts.set(
      id,
      (assignmentCounts.get(id) ?? 0) + 1,
    );
  }

  const nameCounts = new Map<string, number>();

  for (const product of products) {
    const key = normaliseProductName(product.name);

    nameCounts.set(
      key,
      (nameCounts.get(key) ?? 0) + 1,
    );
  }

  const activeCount = products.filter(
    (product) => product.is_active,
  ).length;

  const featuredCount = products.filter(
    (product) => product.is_featured,
  ).length;

  const duplicateCount = products.filter(
    (product) =>
      (nameCounts.get(
        normaliseProductName(product.name),
      ) ?? 0) > 1,
  ).length;

  return (
    <main className="admin-content">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">
            MONETISATION
          </p>

          <h1>Affiliate Products</h1>

          <p>
            Manage PondStuff&apos;s curated affiliate
            catalogue and PartnerBoost products.
          </p>
        </div>

        <form action={syncPartnerBoostProducts}>
          <button
            type="submit"
            className="admin-primary-button"
          >
            ↻ Sync POPOSOAP
          </button>
        </form>
      </div>

      <div className="affiliate-summary">
        <div>
          <strong>{products.length}</strong>
          <span>Products</span>
        </div>

        <div>
          <strong>{activeCount}</strong>
          <span>Active</span>
        </div>

        <div>
          <strong>{featuredCount}</strong>
          <span>Featured</span>
        </div>

        <div>
          <strong>{duplicateCount}</strong>
          <span>Duplicate variants</span>
        </div>
      </div>

      <section className="admin-panel">
        {products.length === 0 ? (
          <div className="admin-empty-state">
            <span>💷</span>

            <h2>No affiliate products yet.</h2>

            <p>
              Sync the POPOSOAP catalogue to get
              started.
            </p>

            <form action={syncPartnerBoostProducts}>
              <button
                type="submit"
                className="admin-primary-button"
              >
                Sync POPOSOAP
              </button>
            </form>
          </div>
        ) : (
          <div className="affiliate-product-grid">
            {products.map((product) => {
              const duplicate =
                (nameCounts.get(
                  normaliseProductName(product.name),
                ) ?? 0) > 1;

              const articleCount =
                assignmentCounts.get(product.id) ?? 0;

              return (
                <article
                  key={product.id}
                  className={`affiliate-product-card ${
                    product.is_active
                      ? ""
                      : "affiliate-product-card-inactive"
                  }`}
                >
                  <div className="affiliate-product-image">
                    {product.image_url ? (
                      // Amazon/PartnerBoost supplied product image.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.image_url}
                        alt=""
                      />
                    ) : (
                      <span>No image</span>
                    )}

                    {duplicate ? (
                      <span className="affiliate-duplicate-badge">
                        Duplicate variant
                      </span>
                    ) : null}
                  </div>

                  <div className="affiliate-product-body">
                    <div className="affiliate-product-meta">
                      <span>
                        {product.merchant}
                      </span>

                      <span>
                        {product.asin ?? "No ASIN"}
                      </span>
                    </div>

                    <h2>{product.name}</h2>

                    <div className="affiliate-product-stats">
                      <div>
                        <span>Price</span>
                        <strong>
                          {product.price ?? "—"}
                        </strong>
                      </div>

                      <div>
                        <span>Commission</span>
                        <strong>
                          {product.commission ?? "—"}
                        </strong>
                      </div>

                      <div>
                        <span>Rating</span>
                        <strong>
                          {product.rating
                            ? `${product.rating} ★`
                            : "—"}
                        </strong>
                      </div>

                      <div>
                        <span>Reviews</span>
                        <strong>
                          {product.reviews ?? "—"}
                        </strong>
                      </div>
                    </div>

                    <div className="affiliate-product-status-row">
                      <span
                        className={`affiliate-stock ${
                          product.availability ===
                          "IN_STOCK"
                            ? "affiliate-stock-in"
                            : ""
                        }`}
                      >
                        {product.availability ===
                        "IN_STOCK"
                          ? "In stock"
                          : product.availability ??
                            "Unknown"}
                      </span>

                      <span>
                        {articleCount}{" "}
                        {articleCount === 1
                          ? "article"
                          : "articles"}
                      </span>

                      {product.is_featured ? (
                        <span className="affiliate-featured">
                          Featured
                        </span>
                      ) : null}
                    </div>

                    <small className="affiliate-sync-time">
                      Last synced:{" "}
                      {formatSyncDate(
                        product.last_synced_at,
                      )}
                    </small>

                    <div className="affiliate-product-actions">
                      <form
                        action={
                          toggleAffiliateProductActive
                        }
                      >
                        <input
                          type="hidden"
                          name="id"
                          value={product.id}
                        />

                        <input
                          type="hidden"
                          name="current"
                          value={String(
                            product.is_active,
                          )}
                        />

                        <button type="submit">
                          {product.is_active
                            ? "Disable"
                            : "Enable"}
                        </button>
                      </form>

                      <form
                        action={
                          toggleAffiliateProductFeatured
                        }
                      >
                        <input
                          type="hidden"
                          name="id"
                          value={product.id}
                        />

                        <input
                          type="hidden"
                          name="current"
                          value={String(
                            product.is_featured,
                          )}
                        />

                        <button type="submit">
                          {product.is_featured
                            ? "Unfeature"
                            : "Feature"}
                        </button>
                      </form>

                      <Link
                        href={`/admin/affiliate-products/${product.id}/articles`}
                      >
                        Manage articles →
                      </Link>

                      {product.affiliate_url ? (
                        <a
                          href={product.affiliate_url}
                          target="_blank"
                          rel="nofollow sponsored noopener noreferrer"
                        >
                          View product ↗
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
