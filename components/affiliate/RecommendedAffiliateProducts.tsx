import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

type AffiliateProduct = {
  id: string;
  name: string;
  image_url: string | null;
  price: string | null;
  rating: number | null;
  reviews: number | null;
  availability: string | null;
  affiliate_url: string | null;
  merchant: string;
  provider: string;
};

export default async function RecommendedAffiliateProducts({
  articleId,
}: {
  articleId: string;
}) {
  const supabase = createAdminClient();

  const { data: assignments, error: assignmentError } =
    await supabase
      .from("article_affiliate_products")
      .select(
        `
          affiliate_product_id,
          sort_order
        `,
      )
      .eq("article_id", articleId)
      .order("sort_order", {
        ascending: true,
      });

  if (assignmentError) {
    throw new Error(
      `Could not load affiliate assignments: ${assignmentError.message}`,
    );
  }

  const productIds = (assignments ?? []).map(
    (assignment) =>
      assignment.affiliate_product_id,
  );

  if (productIds.length === 0) {
    return null;
  }

  const { data, error } = await supabase
    .from("affiliate_products")
    .select(
      `
        id,
        name,
        image_url,
        price,
        rating,
        reviews,
        availability,
        affiliate_url,
        merchant,
        provider
      `,
    )
    .in("id", productIds)
    .eq("is_active", true);

  if (error) {
    throw new Error(
      `Could not load affiliate products: ${error.message}`,
    );
  }

  const products = (data ?? []) as AffiliateProduct[];

  const productMap = new Map(
    products.map((product) => [
      product.id,
      product,
    ]),
  );

  const orderedProducts = productIds
    .map((id) => productMap.get(id))
    .filter(
      (
        product,
      ): product is AffiliateProduct =>
        Boolean(product?.affiliate_url),
    );

  if (orderedProducts.length === 0) {
    return null;
  }

  return (
    <section
      className="article-affiliate-products"
      aria-labelledby="recommended-products-heading"
    >
      <div className="article-affiliate-heading">
        <p className="article-section-eyebrow">
          PONDSTUFF PICKS
        </p>

        <h2 id="recommended-products-heading">
          Recommended Pond Products
        </h2>

        <p>
          Products relevant to this guide that
          may help with the job.
        </p>
      </div>

      <div className="article-affiliate-grid">
        {orderedProducts.map((product) => (
          <article
            key={product.id}
            className="article-affiliate-card"
          >
            <a
              href={product.affiliate_url!}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="article-affiliate-image"
              aria-label={`View ${product.name}`}
            >
              {product.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image_url}
                  alt={product.name}
                />
              ) : (
                <span>Product image unavailable</span>
              )}
            </a>

            <div className="article-affiliate-card-body">
              <span className="article-affiliate-merchant">
                {product.merchant} · Paid link
              </span>

              <h3>{product.name}</h3>

              <div className="article-affiliate-details">
                {product.price ? (
                  <strong className="article-affiliate-price">
                    {product.price}
                  </strong>
                ) : null}

                {product.rating ? (
                  <span>
                    ★ {product.rating}
                    {product.reviews !== null
                      ? ` (${product.reviews} reviews)`
                      : ""}
                  </span>
                ) : null}
              </div>

              {product.availability ===
              "IN_STOCK" ? (
                <span className="article-affiliate-stock">
                  In stock
                </span>
              ) : null}

              <a
                href={product.affiliate_url!}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                className="article-affiliate-button"
              >
                View product
                <span aria-hidden="true"> →</span>
              </a>
            </div>
          </article>
        ))}
      </div>

      <p className="article-affiliate-disclosure">
        {orderedProducts.some((product) => product.provider === "amazon") ? (
          <>
            As an Amazon Associate I earn from qualifying purchases.{" "}
          </>
        ) : null}
        PondStuff may earn a commission from
        qualifying purchases at no additional cost
        to you. Prices and availability can change.
        {" "}
        <Link href="/affiliate-disclosure">
          Read our affiliate disclosure.
        </Link>
      </p>
    </section>
  );
}
