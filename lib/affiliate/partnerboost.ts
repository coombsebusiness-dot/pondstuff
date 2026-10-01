const PARTNERBOOST_BASE_URL = "https://app.partnerboost.com";

export const POPOSOAP_UK_BRAND_ID = "137825";

export type PartnerBoostAmazonProduct = {
  product_id: string;
  product_name: string;
  image: string | null;
  asin: string;
  discount: string | null;
  discount_code: string | null;
  coupon: string | null;
  commission: string | null;
  category: string | null;
  subcategory: string | null;
  parent_asin: string | null;
  variant_asin: string | null;
  availability: string | null;
  rating: string | null;
  reviews: string | null;
  url: string | null;
  brand_id: string;
  brand_name: string;
  update_time: string | null;
  country_code: string;
  relationship: number;
  original_price: string | null;
  discount_price: string | null;
  currency: string | null;
  link: string | null;
  partnerboost_link: string | null;
  link_id: string | null;
  monthly_purchase_volume?: string | null;
};

type PartnerBoostStatus = {
  code: number;
  msg: string;
};

type PartnerBoostProductsResponse = {
  status: PartnerBoostStatus;
  data?: {
    list?: PartnerBoostAmazonProduct[];
    has_more?: boolean;
  };
};

function getToken() {
  const token = process.env.PARTNERBOOST_API_TOKEN?.trim();

  if (!token) {
    throw new Error(
      "PARTNERBOOST_API_TOKEN is not configured.",
    );
  }

  return token;
}

async function partnerBoostPost<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(
    `${PARTNERBOOST_BASE_URL}${path}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: getToken(),
        ...body,
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `PartnerBoost request failed with HTTP ${response.status}.`,
    );
  }

  return (await response.json()) as T;
}

export async function getPoposoapUkProducts() {
  const result =
    await partnerBoostPost<PartnerBoostProductsResponse>(
      "/api/datafeed/get_fba_products",
      {
        page_size: 50,
        page: 1,
        default_filter: 1,
        country_code: "UK",
        brand_id: Number(POPOSOAP_UK_BRAND_ID),
        relationship: 1,
        is_original_currency: 1,
        has_acc: 0,
        filter_sexual_wellness: 1,
        return_link: 1,
        return_performance_bonus: 0,
      },
    );

  if (result.status?.code !== 0) {
    throw new Error(
      `PartnerBoost API error ${result.status?.code}: ${
        result.status?.msg ?? "Unknown error"
      }`,
    );
  }

  return result.data?.list ?? [];
}
