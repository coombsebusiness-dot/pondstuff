import { createAdminClient } from "@/lib/supabase/admin";
import {
  getPoposoapUkProducts,
  POPOSOAP_UK_BRAND_ID,
} from "@/lib/affiliate/partnerboost";

function toNumber(value: string | null | undefined) {
  if (!value) return null;

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function toInteger(value: string | null | undefined) {
  if (!value) return null;

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) ? parsed : null;
}

export async function syncPartnerBoostProducts() {
  const products = await getPoposoapUkProducts();

  if (products.length === 0) {
    throw new Error(
      "PartnerBoost returned no POPOSOAP UK products. Sync aborted.",
    );
  }

  const supabase = createAdminClient();

  const { data: existing, error: existingError } =
    await supabase
      .from("affiliate_products")
      .select(
        "asin, country_code, is_active, is_featured",
      )
      .eq("provider", "partnerboost")
      .eq("brand_id", POPOSOAP_UK_BRAND_ID);

  if (existingError) {
    throw new Error(
      `Could not load existing affiliate products: ${existingError.message}`,
    );
  }

  const existingMap = new Map(
    (existing ?? []).map((product) => [
      `${product.asin}:${product.country_code}`,
      product,
    ]),
  );

  const now = new Date().toISOString();

  const rows = products.map((product) => {
    const countryCode =
      product.country_code || "UK";

    const current = existingMap.get(
      `${product.asin}:${countryCode}`,
    );

    return {
      provider: "partnerboost",
      merchant: "POPOSOAP UK",

      brand_id: product.brand_id,
      brand_name: product.brand_name,

      external_product_id: product.product_id,
      asin: product.asin,

      name: product.product_name,
      image_url: product.image,

      category: product.category,
      subcategory: product.subcategory,

      price: product.discount_price,
      original_price: product.original_price,
      currency: product.currency,

      commission: product.commission,
      rating: toNumber(product.rating),
      reviews: toInteger(product.reviews),
      availability: product.availability,

      product_url: product.url,

      affiliate_url:
        product.partnerboost_link ||
        product.link ||
        null,

      link_id: product.link_id,

      country_code: countryCode,

      // Preserve our manual editorial choices.
      is_active:
        current?.is_active ?? true,

      is_featured:
        current?.is_featured ?? false,

      last_synced_at: now,
      updated_at: now,
    };
  });

  const { error } = await supabase
    .from("affiliate_products")
    .upsert(rows, {
      onConflict: "provider,asin,country_code",
    });

  if (error) {
    throw new Error(
      `Could not sync PartnerBoost products: ${error.message}`,
    );
  }

  return {
    brandId: POPOSOAP_UK_BRAND_ID,
    received: products.length,
    synced: rows.length,
    syncedAt: now,
  };
}
