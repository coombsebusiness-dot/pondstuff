import {
  getPoposoapUkProducts,
  POPOSOAP_UK_BRAND_ID,
} from "../lib/affiliate/partnerboost";

async function main() {
  const products = await getPoposoapUkProducts();

  console.log(
    `POPOSOAP UK (${POPOSOAP_UK_BRAND_ID}) products:`,
    products.length,
  );

  console.table(
    products.map((product) => ({
      name: product.product_name,
      asin: product.asin,
      price: product.discount_price,
      commission: product.commission,
      rating: product.rating,
      reviews: product.reviews,
      stock: product.availability,
      link: Boolean(
        product.link || product.partnerboost_link,
      ),
    })),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
