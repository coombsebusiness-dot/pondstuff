export type PondPlantCatalogueItem = {
  name: string;
  scientificName?: string;
  category:
    | "Marginal"
    | "Oxygenating"
    | "Floating"
    | "Water lily"
    | "Deep water"
    | "Bog";
};

/*
 * PondStuff launch plant catalogue.
 *
 * IMPORTANT:
 * Inclusion here means "candidate for research".
 * It does NOT mean PondStuff has verified:
 * - UK native status
 * - legal status
 * - pond suitability
 * - planting depth
 * - wildlife value
 * - small-pond suitability
 *
 * The research pipeline must establish those
 * facts before publication.
 */

export const pondPlantCatalogue:
  PondPlantCatalogueItem[] = [

  // -------------------------
  // MARGINALS
  // -------------------------

  {
    name: "Marsh marigold",
    scientificName: "Caltha palustris",
    category: "Marginal",
  },
  {
    name: "Water forget-me-not",
    scientificName: "Myosotis scorpioides",
    category: "Marginal",
  },
  {
    name: "Water mint",
    scientificName: "Mentha aquatica",
    category: "Marginal",
  },
  {
    name: "Brooklime",
    scientificName: "Veronica beccabunga",
    category: "Marginal",
  },
  {
    name: "Purple loosestrife",
    scientificName: "Lythrum salicaria",
    category: "Marginal",
  },
  {
    name: "Yellow flag iris",
    scientificName: "Iris pseudacorus",
    category: "Marginal",
  },
  {
    name: "Flowering rush",
    scientificName: "Butomus umbellatus",
    category: "Marginal",
  },
  {
    name: "Lesser spearwort",
    scientificName: "Ranunculus flammula",
    category: "Marginal",
  },
  {
    name: "Greater spearwort",
    scientificName: "Ranunculus lingua",
    category: "Marginal",
  },
  {
    name: "Water avens",
    scientificName: "Geum rivale",
    category: "Marginal",
  },
  {
    name: "Ragged robin",
    scientificName: "Silene flos-cuculi",
    category: "Marginal",
  },
  {
    name: "Meadowsweet",
    scientificName: "Filipendula ulmaria",
    category: "Marginal",
  },
  {
    name: "Marsh woundwort",
    scientificName: "Stachys palustris",
    category: "Marginal",
  },
  {
    name: "Gypsywort",
    scientificName: "Lycopus europaeus",
    category: "Marginal",
  },
  {
    name: "Water figwort",
    scientificName: "Scrophularia auriculata",
    category: "Marginal",
  },
  {
    name: "Marsh cinquefoil",
    scientificName: "Comarum palustre",
    category: "Marginal",
  },
  {
    name: "Bogbean",
    scientificName: "Menyanthes trifoliata",
    category: "Marginal",
  },
  {
    name: "Arrowhead",
    scientificName: "Sagittaria sagittifolia",
    category: "Marginal",
  },
  {
    name: "Common water-plantain",
    scientificName: "Alisma plantago-aquatica",
    category: "Marginal",
  },
  {
    name: "Branched bur-reed",
    scientificName: "Sparganium erectum",
    category: "Marginal",
  },
  {
    name: "Common spike-rush",
    scientificName: "Eleocharis palustris",
    category: "Marginal",
  },
  {
    name: "Slender tufted-sedge",
    scientificName: "Carex acuta",
    category: "Marginal",
  },
  {
    name: "Cyperus sedge",
    scientificName: "Carex pseudocyperus",
    category: "Marginal",
  },
  {
    name: "Pendulous sedge",
    scientificName: "Carex pendula",
    category: "Marginal",
  },
  {
    name: "Sweet flag",
    scientificName: "Acorus calamus",
    category: "Marginal",
  },
  {
    name: "Japanese water iris",
    scientificName: "Iris laevigata",
    category: "Marginal",
  },
  {
    name: "Blue flag iris",
    scientificName: "Iris versicolor",
    category: "Marginal",
  },
  {
    name: "Pickerel weed",
    scientificName: "Pontederia cordata",
    category: "Marginal",
  },
  {
    name: "Golden club",
    scientificName: "Orontium aquaticum",
    category: "Marginal",
  },
  {
    name: "Lizard's tail",
    scientificName: "Saururus cernuus",
    category: "Marginal",
  },
  {
    name: "Cardinal flower",
    scientificName: "Lobelia cardinalis",
    category: "Marginal",
  },
  {
    name: "Blue cardinal flower",
    scientificName: "Lobelia siphilitica",
    category: "Marginal",
  },
  {
    name: "Water dock",
    scientificName: "Rumex hydrolapathum",
    category: "Marginal",
  },
  {
    name: "Amphibious bistort",
    scientificName: "Persicaria amphibia",
    category: "Marginal",
  },
  {
    name: "Marsh arrowgrass",
    scientificName: "Triglochin palustris",
    category: "Marginal",
  },

  // -------------------------
  // OXYGENATING / SUBMERGED
  // -------------------------

  {
    name: "Hornwort",
    scientificName: "Ceratophyllum demersum",
    category: "Oxygenating",
  },
  {
    name: "Soft hornwort",
    scientificName: "Ceratophyllum submersum",
    category: "Oxygenating",
  },
  {
    name: "Water crowfoot",
    scientificName: "Ranunculus aquatilis",
    category: "Oxygenating",
  },
  {
    name: "Spiked water-milfoil",
    scientificName: "Myriophyllum spicatum",
    category: "Oxygenating",
  },
  {
    name: "Whorled water-milfoil",
    scientificName: "Myriophyllum verticillatum",
    category: "Oxygenating",
  },
  {
    name: "Curled pondweed",
    scientificName: "Potamogeton crispus",
    category: "Oxygenating",
  },
  {
    name: "Fennel pondweed",
    scientificName: "Stuckenia pectinata",
    category: "Oxygenating",
  },
  {
    name: "Broad-leaved pondweed",
    scientificName: "Potamogeton natans",
    category: "Oxygenating",
  },
  {
    name: "Willow moss",
    scientificName: "Fontinalis antipyretica",
    category: "Oxygenating",
  },
  {
    name: "Water starwort",
    scientificName: "Callitriche hermaphroditica",
    category: "Oxygenating",
  },
  {
    name: "Mare's-tail",
    scientificName: "Hippuris vulgaris",
    category: "Oxygenating",
  },
  {
    name: "Water violet",
    scientificName: "Hottonia palustris",
    category: "Oxygenating",
  },

  // -------------------------
  // FLOATING
  // -------------------------

  {
    name: "Frogbit",
    scientificName: "Hydrocharis morsus-ranae",
    category: "Floating",
  },
  {
    name: "Common duckweed",
    scientificName: "Lemna minor",
    category: "Floating",
  },

  // -------------------------
  // WATER LILIES
  // -------------------------

  {
    name: "White water lily",
    scientificName: "Nymphaea alba",
    category: "Water lily",
  },
  {
    name: "Yellow water lily",
    scientificName: "Nuphar lutea",
    category: "Water lily",
  },
  {
    name: "Pygmy water lily Helvola",
    scientificName: "Nymphaea 'Pygmaea Helvola'",
    category: "Water lily",
  },
  {
    name: "Pygmy water lily Rubra",
    scientificName: "Nymphaea 'Pygmaea Rubra'",
    category: "Water lily",
  },
  {
    name: "Water lily Aurora",
    scientificName: "Nymphaea 'Aurora'",
    category: "Water lily",
  },
  {
    name: "Water lily Attraction",
    scientificName: "Nymphaea 'Attraction'",
    category: "Water lily",
  },
  {
    name: "Water lily James Brydon",
    scientificName: "Nymphaea 'James Brydon'",
    category: "Water lily",
  },
  {
    name: "Water lily Marliacea Chromatella",
    scientificName: "Nymphaea 'Marliacea Chromatella'",
    category: "Water lily",
  },
  {
    name: "Water lily Marliacea Albida",
    scientificName: "Nymphaea 'Marliacea Albida'",
    category: "Water lily",
  },
  {
    name: "Water lily Gonnère",
    scientificName: "Nymphaea 'Gonnère'",
    category: "Water lily",
  },
  {
    name: "Water lily Escarboucle",
    scientificName: "Nymphaea 'Escarboucle'",
    category: "Water lily",
  },
  {
    name: "Water lily Charles de Meurville",
    scientificName: "Nymphaea 'Charles de Meurville'",
    category: "Water lily",
  },

  // -------------------------
  // DEEP WATER
  // -------------------------

  {
    name: "Water hawthorn",
    scientificName: "Aponogeton distachyos",
    category: "Deep water",
  },
  {
    name: "Fringed water lily",
    scientificName: "Nymphoides peltata",
    category: "Deep water",
  },

  // -------------------------
  // BOG / POND EDGE
  // -------------------------

  {
    name: "Marsh violet",
    scientificName: "Viola palustris",
    category: "Bog",
  },
  {
    name: "Marsh pennywort",
    scientificName: "Hydrocotyle vulgaris",
    category: "Bog",
  },
  {
    name: "Marsh bedstraw",
    scientificName: "Galium palustre",
    category: "Bog",
  },
  {
    name: "Sneezewort",
    scientificName: "Achillea ptarmica",
    category: "Bog",
  },
  {
    name: "Cuckooflower",
    scientificName: "Cardamine pratensis",
    category: "Bog",
  },
  {
    name: "Marsh valerian",
    scientificName: "Valeriana dioica",
    category: "Bog",
  },
  {
    name: "Devil's-bit scabious",
    scientificName: "Succisa pratensis",
    category: "Bog",
  },
  {
    name: "Marsh orchid",
    scientificName: "Dactylorhiza praetermissa",
    category: "Bog",
  },
  {
    name: "Marsh helleborine",
    scientificName: "Epipactis palustris",
    category: "Bog",
  },
  {
    name: "Yellow loosestrife",
    scientificName: "Lysimachia vulgaris",
    category: "Bog",
  },
  {
    name: "Creeping Jenny",
    scientificName: "Lysimachia nummularia",
    category: "Bog",
  },
  {
    name: "Golden creeping Jenny",
    scientificName: "Lysimachia nummularia 'Aurea'",
    category: "Bog",
  },
  {
    name: "Globe flower",
    scientificName: "Trollius europaeus",
    category: "Bog",
  },
  {
    name: "Royal fern",
    scientificName: "Osmunda regalis",
    category: "Bog",
  },
  {
    name: "Lady fern",
    scientificName: "Athyrium filix-femina",
    category: "Bog",
  },
  {
    name: "Yellow monkey flower",
    scientificName: "Erythranthe guttata",
    category: "Bog",
  },
  {
    name: "Primrose",
    scientificName: "Primula vulgaris",
    category: "Bog",
  },
  {
    name: "Candelabra primrose",
    scientificName: "Primula japonica",
    category: "Bog",
  },
  {
    name: "Japanese primrose",
    scientificName: "Primula japonica 'Miller's Crimson'",
    category: "Bog",
  },
  {
    name: "Siberian iris",
    scientificName: "Iris sibirica",
    category: "Bog",
  },
  {
    name: "Japanese iris",
    scientificName: "Iris ensata",
    category: "Bog",
  },
  {
    name: "Goat's beard",
    scientificName: "Aruncus dioicus",
    category: "Bog",
  },
  {
    name: "Masterwort",
    scientificName: "Astrantia major",
    category: "Bog",
  },
  {
    name: "Chinese astilbe",
    scientificName: "Astilbe chinensis",
    category: "Bog",
  },
  {
    name: "Astilbe Deutschland",
    scientificName: "Astilbe 'Deutschland'",
    category: "Bog",
  },
  {
    name: "Ligularia Desdemona",
    scientificName: "Ligularia dentata 'Desdemona'",
    category: "Bog",
  },
  {
    name: "Rodgersia",
    scientificName: "Rodgersia pinnata",
    category: "Bog",
  },
  {
    name: "Gunnera manicata",
    scientificName: "Gunnera manicata",
    category: "Bog",
  },
  {
    name: "Houttuynia Chameleon",
    scientificName: "Houttuynia cordata 'Chameleon'",
    category: "Bog",
  },
  {
    name: "Marsh mallow",
    scientificName: "Althaea officinalis",
    category: "Bog",
  },
  {
    name: "Great willowherb",
    scientificName: "Epilobium hirsutum",
    category: "Bog",
  },
  {
    name: "Hemp agrimony",
    scientificName: "Eupatorium cannabinum",
    category: "Bog",
  },
  {
    name: "Common fleabane",
    scientificName: "Pulicaria dysenterica",
    category: "Bog",
  },
  {
    name: "Water betony",
    scientificName: "Stachys officinalis",
    category: "Bog",
  },
  {
    name: "Marsh thistle",
    scientificName: "Cirsium palustre",
    category: "Bog",
  },
  {
    name: "Purple moor-grass",
    scientificName: "Molinia caerulea",
    category: "Bog",
  },
  {
    name: "Tufted hair-grass",
    scientificName: "Deschampsia cespitosa",
    category: "Bog",
  },
  {
    name: "Soft rush",
    scientificName: "Juncus effusus",
    category: "Bog",
  },
  {
    name: "Hard rush",
    scientificName: "Juncus inflexus",
    category: "Bog",
  },
];
