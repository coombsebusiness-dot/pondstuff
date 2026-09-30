import { getOpenAIClient } from "@/lib/ai/openai";

export type EquipmentResearchSource = {
  title: string;
  url: string;
};

type EquipmentIdentity = {
  brand: string | null;
  productName: string;
  model: string | null;
  manufacturerProductCode: string | null;
  equipmentType: string | null;
  officialDomain: string | null;
  officialProductUrl: string | null;
};

export type PondStuffEquipmentDraft = {
  name: string;
  brand: string | null;
  model: string | null;
  manufacturerProductCode: string | null;
  slug: string;

  equipmentType:
    | "pond-pump"
    | "pond-filter"
    | "uv-clarifier"
    | "air-pump"
    | "pond-vacuum"
    | "pond-liner"
    | "underlay"
    | "water-test-kit"
    | "maintenance"
    | "other";

  summary: string;
  description: string;

  maxFlowLph: number | null;
  maxHeadM: number | null;
  powerWatts: number | null;

  minPowerWatts: number | null;
  maxPowerWatts: number | null;
  maxPondVolumeLitres: number | null;
  maxFishPondVolumeLitres: number | null;
  maxKoiPondVolumeLitres: number | null;

  uvWatts: number | null;
  cableLengthM: number | null;

  specifications: Record<
    string,
    string | number | boolean
  >;

  bestFor: string | null;
  limitations: string | null;
  installationNotes: string | null;
  maintenanceNotes: string | null;
  safetyNotes: string | null;

  manufacturerUrl: string | null;

  imageAlt: string;
  seoTitle: string;
  metaDescription: string;

  researchSources:
    EquipmentResearchSource[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanJson(value: string) {
  return value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");
}


/*
 * AI output is untrusted runtime data.
 *
 * Database scalar numeric fields must contain either
 * one finite number or null.
 *
 * We deliberately do NOT coerce ranges such as
 * "16–100", values containing units such as "95 W",
 * inequalities, approximations or other descriptive
 * text into a single number. Those belong in
 * specifications / limitations instead.
 */
function safeNullableNumber(
  value: unknown,
): number | null {
  if (
    typeof value === "number"
  ) {
    return Number.isFinite(value)
      ? value
      : null;
  }

  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const cleaned =
    value.trim();

  if (!cleaned) {
    return null;
  }

  /*
   * Accept only a plain numeric string.
   *
   * Examples accepted:
   * "9000"
   * "4.5"
   * "0.75"
   *
   * Examples rejected:
   * "16–100"
   * "16-100"
   * "95 W"
   * "~95"
   * "<100"
   * "approx. 95"
   */
  if (
    !/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(
      cleaned,
    )
  ) {
    return null;
  }

  const numeric =
    Number(cleaned);

  return Number.isFinite(
    numeric,
  )
    ? numeric
    : null;
}

function extractSources(
  response: any,
): EquipmentResearchSource[] {
  const sources =
    new Map<
      string,
      EquipmentResearchSource
    >();

  for (
    const item of
    response.output ?? []
  ) {
    if (
      item?.type ===
        "web_search_call" &&
      Array.isArray(
        item?.action?.sources,
      )
    ) {
      for (
        const source of
        item.action.sources
      ) {
        const url =
          typeof source?.url ===
          "string"
            ? source.url
            : "";

        if (!url) continue;

        try {
          sources.set(url, {
            title:
              typeof source?.title ===
              "string"
                ? source.title
                : new URL(url)
                    .hostname,
            url,
          });
        } catch {
          // Ignore malformed source URLs.
        }
      }
    }

    if (item?.type === "message") {
      for (
        const content of
        item.content ?? []
      ) {
        for (
          const annotation of
          content?.annotations ?? []
        ) {
          const url =
            annotation?.url ??
            annotation
              ?.url_citation
              ?.url;

          if (
            typeof url !== "string" ||
            !url
          ) {
            continue;
          }

          try {
            sources.set(url, {
              title:
                annotation?.title ??
                annotation
                  ?.url_citation
                  ?.title ??
                new URL(url)
                  .hostname,
              url,
            });
          } catch {
            // Ignore malformed source URLs.
          }
        }
      }
    }
  }

  return [...sources.values()];
}

export async function generatePondStuffEquipment(
  requestedProduct: string,
  equipmentTypeHint?: string | null,
): Promise<PondStuffEquipmentDraft> {
  const cleanProduct =
    requestedProduct.trim();

  const cleanTypeHint =
    equipmentTypeHint?.trim() ||
    null;

  if (!cleanProduct) {
    throw new Error(
      "Enter an equipment product or model first.",
    );
  }

  const openai =
    getOpenAIClient();

  /*
   * STAGE ONE
   *
   * Establish product identity before researching
   * technical specifications.
   *
   * This pass may search broadly because we do not yet
   * know the manufacturer's authoritative domain.
   */
  const identityResearchResponse =
    await openai.responses.create({
      model:
        process.env
          .OPENAI_PONDSTUFF_RESEARCH_MODEL ??
        "gpt-5-mini",

      tools: [
        {
          type: "web_search",
          search_context_size: "high",
        },
      ],

      input: `
You are the product-identity research layer for
PondStuff, an independent UK garden-pond resource.

Identify this exact pond-equipment product:

"${cleanProduct}"

${
  cleanTypeHint
    ? `The editor supplied this possible product type:
"${cleanTypeHint}"

Treat it only as a hint. Verify it.`
    : ""
}

IDENTITY ONLY.

Do not perform the full technical review yet.

Establish:

- manufacturer / brand
- exact product name
- exact model or model number
- exact manufacturer product code, SKU, item number,
  article number or equivalent identifier
- equipment type
- official manufacturer's domain
- official manufacturer page for this exact product

UK / REGIONAL IDENTITY IS CRITICAL.

Prefer the UK product where a UK-specific variant exists.

A manufacturer's identifier from another country,
voltage version, size, generation or related model must
NOT be applied to the UK product.

Do not silently substitute:
- another model
- another size
- another generation
- another wattage
- another flow variant
- another regional version

SOURCE PRIORITY:

1. Official manufacturer exact-product page.
2. Official manufacturer catalogue, manual, datasheet
   or product-family page where the exact model mapping
   is explicit.
3. Official manufacturer support documentation.
4. Other sources may help DISCOVER the official product,
   but must not override manufacturer evidence.

If an exact manufacturer product identifier cannot be
verified, explicitly say it is unknown.

Return concise factual identity research notes.
`.trim(),
    });

  const identityResearchNotes =
    identityResearchResponse.output_text?.trim();

  if (!identityResearchNotes) {
    throw new Error(
      "Equipment identity research returned no usable notes.",
    );
  }

  /*
   * Convert identity evidence into a strict object before
   * doing technical research.
   */
  const identityCompletion =
    await openai.chat.completions.create({
      model:
        process.env.OPENAI_PONDSTUFF_MODEL ??
        "gpt-5-mini",

      response_format: {
        type: "json_object",
      },

      messages: [
        {
          role: "system",
          content: `
You extract an exact pond-equipment identity from supplied
research notes.

Use ONLY the supplied notes.

Never guess an identifier.

manufacturerProductCode must be the exact manufacturer
SKU, product code, item number, article number or
equivalent for the exact identified regional product.

officialDomain must contain only the hostname, for example:

oase.com
blagdonwatergardening.co.uk
evolutionaqua.com

Do not include:
- https://
- paths
- query strings

officialProductUrl must be an official manufacturer URL
for the exact product.

If a nullable value is not established, return null.

Return ONLY JSON using exactly:

{
  "brand": null,
  "productName": "",
  "model": null,
  "manufacturerProductCode": null,
  "equipmentType": null,
  "officialDomain": null,
  "officialProductUrl": null
}
`.trim(),
        },
        {
          role: "user",
          content: `
Requested product:

${cleanProduct}

IDENTITY RESEARCH:

${identityResearchNotes}
`.trim(),
        },
      ],
    });

  const identityRaw =
    identityCompletion.choices[0]
      ?.message.content;

  if (!identityRaw) {
    throw new Error(
      "Equipment identity parser returned no data.",
    );
  }

  let identity: EquipmentIdentity;

  try {
    identity = JSON.parse(
      cleanJson(identityRaw),
    ) as EquipmentIdentity;
  } catch {
    throw new Error(
      "Equipment identity parser returned invalid JSON.",
    );
  }

  if (
    !identity.productName ||
    typeof identity.productName !== "string"
  ) {
    identity.productName = cleanProduct;
  }

  /*
   * Normalise the manufacturer hostname so it can be
   * used safely as a research boundary.
   */
  let officialDomain: string | null = null;

  if (
    typeof identity.officialDomain === "string" &&
    identity.officialDomain.trim()
  ) {
    officialDomain =
      identity.officialDomain
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0] ||
      null;
  }

  if (
    !officialDomain &&
    typeof identity.officialProductUrl === "string" &&
    identity.officialProductUrl
  ) {
    try {
      officialDomain =
        new URL(
          identity.officialProductUrl,
        ).hostname
          .toLowerCase()
          .replace(/^www\./, "");
    } catch {
      officialDomain = null;
    }
  }

  if (!officialDomain) {
    throw new Error(
      "Could not establish the manufacturer's official domain.",
    );
  }

  identity.officialDomain = officialDomain;

  /*
   * STAGE TWO
   *
   * Manufacturer-first technical research.
   *
   * Identity has already been established. This pass is
   * deliberately instructed to stay on the official
   * manufacturer domain.
   */
  const researchResponse =
    await openai.responses.create({
      model:
        process.env
          .OPENAI_PONDSTUFF_RESEARCH_MODEL ??
        "gpt-5-mini",

      tools: [
        {
          type: "web_search",
          search_context_size: "high",
        },
      ],

      input: `
You are the technical equipment research layer for
PondStuff, an independent UK garden-pond resource.

The product identity has already been established:

Requested product:
${cleanProduct}

Brand:
${identity.brand ?? "Unknown"}

Exact product:
${identity.productName}

Model:
${identity.model ?? "Unknown"}

Manufacturer product code:
${identity.manufacturerProductCode ?? "Unknown"}

Official manufacturer domain:
${officialDomain}

Official exact-product URL:
${identity.officialProductUrl ?? "Unknown"}

Equipment type:
${identity.equipmentType ?? cleanTypeHint ?? "Unknown"}

RESEARCH BOUNDARY:

Research technical specifications using FIRST-PARTY
manufacturer evidence from:

${officialDomain}

Search specifically for official product pages, manuals,
datasheets, catalogues and support documents on that
manufacturer domain.

Do NOT use third-party manual mirrors when manufacturer
documentation is available.

Do NOT use:
- retailers
- distributors
- forums
- Reddit
- user-generated content
- affiliate sites
- comparison sites
- third-party manual mirrors

Do not substitute another model, size, generation or
regional variant.

A product-family document may be used only where it
clearly maps a specification to this exact product.

Where official manufacturer sources conflict, report the
conflict explicitly. Do not choose whichever value seems
most plausible.

Establish ONLY where first-party evidence supports it:

TECHNICAL DATA
- maximum flow rate in litres per hour
- maximum head in metres
- electrical power consumption in watts
- UV/UVC wattage
- cable length in metres
- manufacturer-stated general pond capacity
- manufacturer-stated fish pond capacity
- manufacturer-stated koi/heavy-stock capacity

OTHER VERIFIED DATA where relevant
- inlet/outlet sizes
- hose sizes
- dimensions
- weight
- warranty
- filter type/media
- maximum permitted flow
- operating pressure
- liner material/thickness
- air output/outlets
- protection rating
- installation limits
- manufacturer-supported control features

CAPACITY RULES:

Never derive one capacity from another.
Never apply PondStuff multipliers.
Never invent fish or koi capacities from a generic rating.

FLOW / HEAD RULES:

Never calculate maximum head from flow.
Never invent flow-at-head values.
Never apply a universal head-loss percentage.

SAFETY RULES:

Do not invent electrical or installation instructions.

UNKNOWN DATA:

If first-party evidence does not establish a fact,
explicitly say it is unknown.

Return detailed factual technical research notes.
`.trim(),
    });

  const researchNotes =
    researchResponse.output_text?.trim();

  if (!researchNotes) {
    throw new Error(
      "Equipment technical research returned no usable notes.",
    );
  }

  /*
   * Only technical sources from the established official
   * manufacturer domain are eligible for permanent
   * research provenance.
   */
  const discoveredSources =
    extractSources(researchResponse);

  const sources =
    discoveredSources.filter(
      (source) => {
        try {
          const hostname =
            new URL(source.url)
              .hostname
              .toLowerCase()
              .replace(/^www\./, "");

          return (
            hostname === officialDomain ||
            hostname.endsWith(
              `.${officialDomain}`,
            )
          );
        } catch {
          return false;
        }
      },
    );

  /*
   * Ensure the exact official product page remains part
   * of provenance even when web search did not emit it as
   * a source annotation during the technical pass.
   */
  if (
    identity.officialProductUrl &&
    !sources.some(
      (source) =>
        source.url ===
        identity.officialProductUrl,
    )
  ) {
    try {
      const productUrl =
        new URL(
          identity.officialProductUrl,
        );

      const productHostname =
        productUrl.hostname
          .toLowerCase()
          .replace(/^www\./, "");

      if (
        productHostname === officialDomain ||
        productHostname.endsWith(
          `.${officialDomain}`,
        )
      ) {
        sources.unshift({
          title:
            identity.productName ||
            cleanProduct,
          url:
            identity.officialProductUrl,
        });
      }
    } catch {
      // Ignore malformed identity URL.
    }
  }

  if (!sources.length) {
    throw new Error(
      "Equipment research returned no first-party manufacturer sources.",
    );
  }

  /*
   * STAGE THREE
   * Convert verified identity + technical evidence into
   * a database draft.
   */
  const completion =
    await openai.chat.completions.create({
      model:
        process.env
          .OPENAI_PONDSTUFF_MODEL ??
        "gpt-5-mini",

      response_format: {
        type: "json_object",
      },

      messages: [
        {
          role: "system",
          content: `
You create structured pond-equipment database
records for PondStuff, a UK garden-pond resource.

You MUST use only the supplied verified identity and
technical research notes.

Never use outside knowledge.

The VERIFIED IDENTITY section is authoritative for:
- brand
- exact product name
- model
- manufacturer product code
- official manufacturer URL

Do not replace those identity values with guesses from
technical prose.

Never invent:
- model numbers
- flow rates
- maximum head
- wattages
- UV wattages
- cable lengths
- pond capacities
- fish capacities
- koi capacities
- dimensions
- connection sizes
- warranty periods
- safety requirements
- maintenance intervals
- installation requirements

If the supplied research does not establish a
nullable fact, return null.

Do not infer one specification from another.

Do not derive manufacturer capacities using
PondStuff rules or generic industry rules.

Do not copy a specification from another model
in the same product family.

If the research describes conflicting values and
does not resolve the conflict for the exact model,
return null for the affected structured field and
explain the conflict in limitations.

Allowed equipmentType values:

pond-pump
pond-filter
uv-clarifier
air-pump
pond-vacuum
pond-liner
underlay
water-test-kit
maintenance
other

FIELD RULES:

manufacturerProductCode:

Use the exact value from VERIFIED IDENTITY.
Do not invent, transform or substitute it.

maxFlowLph:
Exact supported maximum flow in litres/hour only.

maxHeadM:
Exact supported maximum head in metres only.

powerWatts:

Use only when the exact product has one fixed,
manufacturer-supported electrical consumption or
rated-power value in watts.

For variable-power equipment, powerWatts MUST be null.

minPowerWatts:

Use only for an explicitly manufacturer-supported
minimum electrical consumption for the exact
variable-power product.

Do not derive or estimate this value.

maxPowerWatts:

Use only for an explicitly manufacturer-supported
maximum electrical consumption for the exact
variable-power product.

Do not derive or estimate this value.

POWER CONSISTENCY:

Fixed-power equipment:
powerWatts = fixed supported value
minPowerWatts = null
maxPowerWatts = null

Variable-power equipment with BOTH supported endpoints:
powerWatts = null
minPowerWatts = supported minimum
maxPowerWatts = supported maximum

Never compress a range into powerWatts.
Never store only one range endpoint.
Never derive electrical consumption mathematically.
If evidence is insufficient or conflicting, use null.

maxPondVolumeLitres:
Only an explicitly stated general/no-fish pond
capacity.

maxFishPondVolumeLitres:
Only an explicitly stated fish/ornamental-fish pond
capacity.

maxKoiPondVolumeLitres:
Only an explicitly stated koi/heavily-stocked pond
capacity.

uvWatts:
Exact UVC/UV lamp wattage only.

cableLengthM:
Exact supported cable length in metres only.

specifications:
Include useful additional specifications that are
explicitly supported by the research and apply to
the exact model.

Do not duplicate the dedicated numeric fields inside
specifications unless the source presents additional
context that would otherwise be lost.

Use concise human-readable keys.

manufacturerUrl:
Use the official manufacturer product or technical
page URL only if the supplied research notes clearly
identify one. Otherwise null.

summary:
Approximately 1-2 useful sentences.

description:
Approximately 250-450 words for a UK pond owner.
Explain what the product is and what the verified
specifications mean without turning unsupported
claims into facts.

bestFor:
Use only evidence-supported suitability.

limitations:
Mention material evidence limitations or conflicts
where useful. Do not manufacture criticism.

installationNotes:
Evidence-supported information only.

maintenanceNotes:
Evidence-supported information only.

safetyNotes:
Evidence-supported information only.

imageAlt:
Describe the product plainly. Do not claim visual
details that are not established.

seoTitle:
Maximum 60 characters.

metaDescription:
Maximum 160 characters.

Return ONLY valid JSON using exactly these keys:

{
  "name": "",
  "brand": null,
  "model": null,
  "manufacturerProductCode": null,
  "equipmentType": "other",
  "summary": "",
  "description": "",
  "maxFlowLph": null,
  "maxHeadM": null,
  "powerWatts": null,
  "minPowerWatts": null,
  "maxPowerWatts": null,
  "maxPondVolumeLitres": null,
  "maxFishPondVolumeLitres": null,
  "maxKoiPondVolumeLitres": null,
  "uvWatts": null,
  "cableLengthM": null,
  "specifications": {},
  "bestFor": null,
  "limitations": null,
  "installationNotes": null,
  "maintenanceNotes": null,
  "safetyNotes": null,
  "manufacturerUrl": null,
  "imageAlt": "",
  "seoTitle": "",
  "metaDescription": ""
}
`.trim(),
        },

        {
          role: "user",
          content: `
Requested product:

${cleanProduct}

VERIFIED IDENTITY:

Brand:
${identity.brand ?? "Unknown"}

Exact product:
${identity.productName}

Model:
${identity.model ?? "Unknown"}

Manufacturer product code:
${identity.manufacturerProductCode ?? "Unknown"}

Official manufacturer URL:
${identity.officialProductUrl ?? "Unknown"}

Equipment type:
${identity.equipmentType ?? cleanTypeHint ?? "Unknown"}

TECHNICAL RESEARCH NOTES:

${researchNotes}
`.trim(),
        },
      ],
    });

  const raw =
    completion
      .choices[0]
      ?.message
      ?.content;

  if (!raw) {
    throw new Error(
      "Equipment writer returned no data.",
    );
  }

  let parsed: Omit<
    PondStuffEquipmentDraft,
    "slug" | "researchSources"
  >;

  try {
    parsed =
      JSON.parse(
        cleanJson(raw),
      );
  } catch {
    throw new Error(
      "Equipment writer returned invalid JSON.",
    );
  }

  const name =
    typeof parsed.name ===
      "string" &&
    parsed.name.trim()
      ? parsed.name.trim()
      : cleanProduct;

  const finalName =
    identity.productName?.trim() ||
    name;

  /*
   * Harden scalar numeric fields before anything
   * leaves the writer. JSON from the model is runtime
   * data and must not be trusted merely because
   * `parsed` has a TypeScript annotation.
   */
  const maxFlowLph =
    safeNullableNumber(
      parsed.maxFlowLph,
    );

  const maxHeadM =
    safeNullableNumber(
      parsed.maxHeadM,
    );

  const powerWatts =
    safeNullableNumber(
      parsed.powerWatts,
    );


  let minPowerWatts =
    safeNullableNumber(
      parsed.minPowerWatts,
    );

  let maxPowerWatts =
    safeNullableNumber(
      parsed.maxPowerWatts,
    );

  /*
   * Schema V2 power invariants.
   * Fixed power and variable ranges are mutually exclusive.
   */
  let safePowerWatts = powerWatts;

  if (
    safePowerWatts !== null &&
    (
      minPowerWatts !== null ||
      maxPowerWatts !== null
    )
  ) {
    safePowerWatts = null;
    minPowerWatts = null;
    maxPowerWatts = null;
  } else if (
    (minPowerWatts === null) !==
    (maxPowerWatts === null)
  ) {
    minPowerWatts = null;
    maxPowerWatts = null;
  } else if (
    minPowerWatts !== null &&
    maxPowerWatts !== null &&
    minPowerWatts > maxPowerWatts
  ) {
    minPowerWatts = null;
    maxPowerWatts = null;
  }
  const maxPondVolumeLitres =
    safeNullableNumber(
      parsed.maxPondVolumeLitres,
    );

  const maxFishPondVolumeLitres =
    safeNullableNumber(
      parsed.maxFishPondVolumeLitres,
    );

  const maxKoiPondVolumeLitres =
    safeNullableNumber(
      parsed.maxKoiPondVolumeLitres,
    );

  const uvWatts =
    safeNullableNumber(
      parsed.uvWatts,
    );

  const cableLengthM =
    safeNullableNumber(
      parsed.cableLengthM,
    );

  return {
    ...parsed,

    /*
     * These assignments intentionally come AFTER
     * ...parsed so unsafe AI values cannot overwrite
     * the sanitised values.
     */
    maxFlowLph,
    maxHeadM,
    powerWatts: safePowerWatts,

    minPowerWatts,

    maxPowerWatts,
    maxPondVolumeLitres,
    maxFishPondVolumeLitres,
    maxKoiPondVolumeLitres,
    uvWatts,
    cableLengthM,

    name: finalName,

    brand:
      identity.brand ??
      parsed.brand ??
      null,

    model:
      identity.model ??
      parsed.model ??
      null,

    manufacturerProductCode:
      identity.manufacturerProductCode ??
      null,

    manufacturerUrl:
      identity.officialProductUrl ??
      parsed.manufacturerUrl ??
      null,

    slug: slugify(finalName),

    researchSources:
      sources,
  };
}
