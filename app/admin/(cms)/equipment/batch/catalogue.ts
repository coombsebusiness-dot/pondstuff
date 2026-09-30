export type EquipmentCatalogueItem = {
  name: string;
  brand: string;
  model?: string;
  equipmentType:
    | "pond-pump"
    | "filter"
    | "uv"
    | "air"
    | "vacuum"
    | "liner"
    | "underlay"
    | "water-test-kit"
    | "maintenance"
    | "other";
  manufacturerSku?: string;
};

/*
 * PondStuff equipment research catalogue.
 *
 * IMPORTANT:
 *
 * Entries are research candidates, not published facts.
 *
 * Names and product-code hints below should be taken
 * from current first-party UK manufacturer material
 * wherever possible.
 *
 * The AI equipment pipeline must still verify:
 * - exact UK product identity
 * - manufacturer / brand
 * - model
 * - manufacturer product code
 * - equipment type
 * - specifications
 * - regional/version differences
 *
 * Catalogue hints must never override stronger
 * manufacturer evidence found during research.
 */

export const equipmentCatalogue:
  EquipmentCatalogueItem[] = [
    /*
     * OASE AquaMax Eco Premium
     *
     * Current UK family confirmed from OASE.
     */
    {
      name: "AquaMax Eco Premium 5000",
      brand: "OASE",
      model: "AquaMax Eco Premium 5000",
      equipmentType: "pond-pump",
      manufacturerSku: "75928",
    },
    {
      name: "AquaMax Eco Premium 7000",
      brand: "OASE",
      model: "AquaMax Eco Premium 7000",
      equipmentType: "pond-pump",
      manufacturerSku: "85488",
    },
    {
      name: "AquaMax Eco Premium 9000",
      brand: "OASE",
      model: "AquaMax Eco Premium 9000",
      equipmentType: "pond-pump",
      manufacturerSku: "75929",
    },
    {
      name: "AquaMax Eco Premium 13000",
      brand: "OASE",
      model: "AquaMax Eco Premium 13000",
      equipmentType: "pond-pump",
      manufacturerSku: "75932",
    },
    {
      name: "AquaMax Eco Premium 17000",
      brand: "OASE",
      model: "AquaMax Eco Premium 17000",
      equipmentType: "pond-pump",
      manufacturerSku: "75933",
    },
    {
      name: "AquaMax Eco Premium 21000",
      brand: "OASE",
      model: "AquaMax Eco Premium 21000",
      equipmentType: "pond-pump",
      manufacturerSku: "75934",
    },

    /*
     * OASE 12 V swimming / bathing pond pumps.
     *
     * Kept distinct from the standard Premium family
     * because these are specific low-voltage products.
     */
    {
      name: "AquaMax Eco Premium 6000 / 12 V",
      brand: "OASE",
      model: "AquaMax Eco Premium 6000 / 12 V",
      equipmentType: "pond-pump",
      manufacturerSku: "50730",
    },
    {
      name: "AquaMax Eco Premium 12000 / 12 V",
      brand: "OASE",
      model: "AquaMax Eco Premium 12000 / 12 V",
      equipmentType: "pond-pump",
      manufacturerSku: "50382",
    },
    {
      name: "AquaMax Eco Expert 20000 / 12 V",
      brand: "OASE",
      model: "AquaMax Eco Expert 20000 / 12 V",
      equipmentType: "pond-pump",
      manufacturerSku: "55313",
    },
    {
      name: "AquaMax Eco Expert 27000 / 12 V",
      brand: "OASE",
      model: "AquaMax Eco Expert 27000 / 12 V",
      equipmentType: "pond-pump",
      manufacturerSku: "77918",
    },
  ];
