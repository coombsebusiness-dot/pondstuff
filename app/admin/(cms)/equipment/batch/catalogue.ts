export type EquipmentCatalogueItem = {
  name: string;
  brand: string;
  model?: string;
  equipmentType:
    | "pond-pump"
    | "pond-filter"
    | "uv-clarifier"
    | "air-pump"
    | "pond-vacuum"
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
    
    /*
     * OASE filtration, UV and maintenance range.
     */
    {
      name: "BioPress 4000",
      brand: "OASE",
      model: "BioPress 4000",
      equipmentType: "pond-filter",
      manufacturerSku: "50445",
    },
    {
      name: "BioPress 6000",
      brand: "OASE",
      model: "BioPress 6000",
      equipmentType: "pond-filter",
      manufacturerSku: "50446",
    },
    {
      name: "BioPress 10000",
      brand: "OASE",
      model: "BioPress 10000",
      equipmentType: "pond-filter",
      manufacturerSku: "50447",
    },
    {
      name: "BioSmart 5000",
      brand: "OASE",
      model: "BioSmart 5000",
      equipmentType: "pond-filter",
    },
    {
      name: "BioSmart 10000",
      brand: "OASE",
      model: "BioSmart 10000",
      equipmentType: "pond-filter",
    },
    {
      name: "BioSmart 16000",
      brand: "OASE",
      model: "BioSmart 16000",
      equipmentType: "pond-filter",
    },
    {
      name: "BioSmart 36000",
      brand: "OASE",
      model: "BioSmart 36000",
      equipmentType: "pond-filter",
    },
    {
      name: "BioTec ScreenMatic² 40000",
      brand: "OASE",
      model: "BioTec ScreenMatic² 40000",
      equipmentType: "pond-filter",
    },
    {
      name: "BioTec ScreenMatic² 60000",
      brand: "OASE",
      model: "BioTec ScreenMatic² 60000",
      equipmentType: "pond-filter",
    },

    {
      name: "Bitron C 24 W",
      brand: "OASE",
      model: "Bitron C 24 W",
      equipmentType: "uv-clarifier",
      manufacturerSku: "56804",
    },
    {
      name: "Bitron C 36 W",
      brand: "OASE",
      model: "Bitron C 36 W",
      equipmentType: "uv-clarifier",
      manufacturerSku: "56799",
    },
    {
      name: "Bitron C 55 W",
      brand: "OASE",
      model: "Bitron C 55 W",
      equipmentType: "uv-clarifier",
      manufacturerSku: "56823",
    },
    {
      name: "Bitron C 72 W",
      brand: "OASE",
      model: "Bitron C 72 W",
      equipmentType: "uv-clarifier",
      manufacturerSku: "56901",
    },
    {
      name: "Bitron Eco 120 W",
      brand: "OASE",
      model: "Bitron Eco 120 W",
      equipmentType: "uv-clarifier",
      manufacturerSku: "56769",
    },
    {
      name: "Bitron Eco 180 W",
      brand: "OASE",
      model: "Bitron Eco 180 W",
      equipmentType: "uv-clarifier",
      manufacturerSku: "56405",
    },

    {
      name: "AquaOxy 250",
      brand: "OASE",
      model: "AquaOxy 250",
      equipmentType: "air-pump",
      manufacturerSku: "34064",
    },
    {
      name: "AquaOxy 500",
      brand: "OASE",
      model: "AquaOxy 500",
      equipmentType: "air-pump",
      manufacturerSku: "57567",
    },
    {
      name: "AquaOxy 1000",
      brand: "OASE",
      model: "AquaOxy 1000",
      equipmentType: "air-pump",
      manufacturerSku: "37125",
    },

    
    /*
     * Evolution Aqua equipment range.
     */
    {
      name: "EazyPod",
      brand: "Evolution Aqua",
      model: "EazyPod",
      equipmentType: "pond-filter",
    },
    {
      name: "EazyPod Air",
      brand: "Evolution Aqua",
      model: "EazyPod Air",
      equipmentType: "pond-filter",
    },
    {
      name: "Nexus 220+",
      brand: "Evolution Aqua",
      model: "Nexus 220+",
      equipmentType: "pond-filter",
    },
    {
      name: "Nexus 320+",
      brand: "Evolution Aqua",
      model: "Nexus 320+",
      equipmentType: "pond-filter",
    },
    {
      name: "Nexus Auto 220+",
      brand: "Evolution Aqua",
      model: "Nexus Auto 220+",
      equipmentType: "pond-filter",
    },
    {
      name: "Nexus Auto 320+",
      brand: "Evolution Aqua",
      model: "Nexus Auto 320+",
      equipmentType: "pond-filter",
    },
    {
      name: "Varipump 10000",
      brand: "Evolution Aqua",
      model: "Varipump 10000",
      equipmentType: "pond-pump",
    },
    {
      name: "Varipump 20000",
      brand: "Evolution Aqua",
      model: "Varipump 20000",
      equipmentType: "pond-pump",
    },
    {
      name: "Varipump 30000",
      brand: "Evolution Aqua",
      model: "Varipump 30000",
      equipmentType: "pond-pump",
    },
    {
      name: "AirPump 70",
      brand: "Evolution Aqua",
      model: "AirPump 70",
      equipmentType: "air-pump",
    },
    {
      name: "AirPump 95",
      brand: "Evolution Aqua",
      model: "AirPump 95",
      equipmentType: "air-pump",
    },
    {
      name: "AirPump 150",
      brand: "Evolution Aqua",
      model: "AirPump 150",
      equipmentType: "air-pump",
    },

    /*
     * Blagdon equipment range.
     */
    {
      name: "Green Machine 10000",
      brand: "Blagdon",
      model: "Green Machine 10000",
      equipmentType: "pond-filter",
    },
    {
      name: "Green Machine 15000",
      brand: "Blagdon",
      model: "Green Machine 15000",
      equipmentType: "pond-filter",
    },
    {
      name: "Green Machine 20000",
      brand: "Blagdon",
      model: "Green Machine 20000",
      equipmentType: "pond-filter",
    },
    {
      name: "Inpond 5 in 1 2000",
      brand: "Blagdon",
      model: "Inpond 5 in 1 2000",
      equipmentType: "pond-filter",
    },
    {
      name: "Inpond 5 in 1 3000",
      brand: "Blagdon",
      model: "Inpond 5 in 1 3000",
      equipmentType: "pond-filter",
    },
    {
      name: "Inpond 5 in 1 6000",
      brand: "Blagdon",
      model: "Inpond 5 in 1 6000",
      equipmentType: "pond-filter",
    },

    
    /*
     * Hozelock equipment range.
     */
    {
      name: "Bioforce Revolution 6000",
      brand: "Hozelock",
      model: "Bioforce Revolution 6000",
      equipmentType: "pond-filter",
    },
    {
      name: "Bioforce Revolution 9000",
      brand: "Hozelock",
      model: "Bioforce Revolution 9000",
      equipmentType: "pond-filter",
    },
    {
      name: "Bioforce Revolution 12000",
      brand: "Hozelock",
      model: "Bioforce Revolution 12000",
      equipmentType: "pond-filter",
    },
    {
      name: "Bioforce Revolution 18000",
      brand: "Hozelock",
      model: "Bioforce Revolution 18000",
      equipmentType: "pond-filter",
    },
    {
      name: "Aquaforce 4000",
      brand: "Hozelock",
      model: "Aquaforce 4000",
      equipmentType: "pond-pump",
    },
    {
      name: "Aquaforce 8000",
      brand: "Hozelock",
      model: "Aquaforce 8000",
      equipmentType: "pond-pump",
    },
    {
      name: "Aquaforce 12000",
      brand: "Hozelock",
      model: "Aquaforce 12000",
      equipmentType: "pond-pump",
    },
    {
      name: "Aquaforce 15000",
      brand: "Hozelock",
      model: "Aquaforce 15000",
      equipmentType: "pond-pump",
    },
    {
      name: "Aquaforce 20000",
      brand: "Hozelock",
      model: "Aquaforce 20000",
      equipmentType: "pond-pump",
    },

    /*
     * Aquaforte equipment range.
     */
    {
      name: "DM Vario 10000",
      brand: "Aquaforte",
      model: "DM Vario 10000",
      equipmentType: "pond-pump",
    },
    {
      name: "DM Vario 20000",
      brand: "Aquaforte",
      model: "DM Vario 20000",
      equipmentType: "pond-pump",
    },
    {
      name: "DM Vario 30000",
      brand: "Aquaforte",
      model: "DM Vario 30000",
      equipmentType: "pond-pump",
    },
    {
      name: "O-Plus 10000",
      brand: "Aquaforte",
      model: "O-Plus 10000",
      equipmentType: "pond-pump",
    },
    {
      name: "O-Plus 20000",
      brand: "Aquaforte",
      model: "O-Plus 20000",
      equipmentType: "pond-pump",
    },
    {
      name: "O-Plus 30000",
      brand: "Aquaforte",
      model: "O-Plus 30000",
      equipmentType: "pond-pump",
    },
    {
      name: "Air Pump AP-45",
      brand: "Aquaforte",
      model: "AP-45",
      equipmentType: "air-pump",
    },
    {
      name: "Air Pump AP-60",
      brand: "Aquaforte",
      model: "AP-60",
      equipmentType: "air-pump",
    },
    {
      name: "Air Pump AP-80",
      brand: "Aquaforte",
      model: "AP-80",
      equipmentType: "air-pump",
    },

    /*
     * Pontec equipment range.
     */
    {
      name: "PondoMax Eco 1500",
      brand: "Pontec",
      model: "PondoMax Eco 1500",
      equipmentType: "pond-pump",
    },
    {
      name: "PondoMax Eco 2500",
      brand: "Pontec",
      model: "PondoMax Eco 2500",
      equipmentType: "pond-pump",
    },
    {
      name: "PondoMax Eco 3500",
      brand: "Pontec",
      model: "PondoMax Eco 3500",
      equipmentType: "pond-pump",
    },
    {
      name: "PondoMax Eco 5000",
      brand: "Pontec",
      model: "PondoMax Eco 5000",
      equipmentType: "pond-pump",
    },
    {
      name: "PondoMax Eco 8500",
      brand: "Pontec",
      model: "PondoMax Eco 8500",
      equipmentType: "pond-pump",
    },
    {
      name: "PondoMax Eco 12000",
      brand: "Pontec",
      model: "PondoMax Eco 12000",
      equipmentType: "pond-pump",
    },

  ];
