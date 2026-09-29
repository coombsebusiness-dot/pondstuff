import { getOpenAIClient } from "@/lib/ai/openai";

export type PondStuffPlantDraft = {
  commonName: string;
  scientificName: string | null;
  slug: string;
  plantType:
    | "marginal"
    | "oxygenating"
    | "floating"
    | "water-lily"
    | "deep-water"
    | "bog"
    | null;
  summary: string;
  description: string;
  minPlantingDepthCm: number | null;
  maxPlantingDepthCm: number | null;
  minWaterDepthCm: number | null;
  maxWaterDepthCm: number | null;
  maxHeightCm: number | null;
  maxSpreadCm: number | null;
  sunlight:
    | "full-sun"
    | "full-sun-partial-shade"
    | "partial-shade"
    | "shade"
    | null;
  floweringMonths: string[];
  isNativeUk: boolean | null;
  isOxygenating: boolean | null;
  isWildlifeFriendly: boolean | null;
  isSmallPondSuitable: boolean | null;
  hardiness: string | null;
  growthHabit: string | null;
  plantingMethod: string | null;
  winterBehaviour: string | null;
  propagation: string | null;
  maintenanceNotes: string | null;
  legalStatusUk: string | null;
  legalStatusNotes: string | null;
  careLevel:
    | "easy"
    | "moderate"
    | "advanced"
    | null;
  imageAlt: string;
  seoTitle: string;
  metaDescription: string;
  researchSources: {
    title: string;
    url: string;
  }[];
};

const APPROVED_DOMAINS = [
  "rhs.org.uk",
  "freshwaterhabitats.org.uk",
  "plantlife.org.uk",
  "gov.uk",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractSources(response: any) {
  const sources = new Map<
    string,
    {
      title: string;
      url: string;
    }
  >();

  for (const item of response.output ?? []) {
    if (
      item?.type === "web_search_call" &&
      Array.isArray(item?.action?.sources)
    ) {
      for (const source of item.action.sources) {
        const url =
          typeof source?.url === "string"
            ? source.url
            : "";

        if (!url) continue;

        sources.set(url, {
          title:
            typeof source?.title === "string"
              ? source.title
              : new URL(url).hostname,
          url,
        });
      }
    }

    if (item?.type === "message") {
      for (const content of item.content ?? []) {
        for (
          const annotation of
          content?.annotations ?? []
        ) {
          const url =
            annotation?.url ??
            annotation?.url_citation?.url;

          if (
            typeof url !== "string" ||
            !url
          ) {
            continue;
          }

          sources.set(url, {
            title:
              annotation?.title ??
              annotation?.url_citation?.title ??
              new URL(url).hostname,
            url,
          });
        }
      }
    }
  }

  return [...sources.values()];
}

function cleanJson(value: string) {
  return value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");
}

export async function generatePondStuffPlant(
  plantName: string,
): Promise<PondStuffPlantDraft> {
  const cleanName = plantName.trim();

  if (!cleanName) {
    throw new Error("Enter a plant name first.");
  }

  const openai = getOpenAIClient();

  const researchResponse =
    await openai.responses.create({
      model:
        process.env.OPENAI_PONDSTUFF_RESEARCH_MODEL ??
        "gpt-5-mini",
      tools: [
        {
          type: "web_search",
          filters: {
            allowed_domains: APPROVED_DOMAINS,
          },
          search_context_size: "high",
        },
      ],
      input: `
You are the specialist plant research layer for
PondStuff, an independent UK garden-pond resource.

Research this pond or aquatic plant:

"${cleanName}"

Use ONLY the approved domains supplied to the
web-search tool.

Establish, where the sources genuinely support it:

- accepted common name
- scientific/botanical name
- whether it is appropriate for a UK garden pond
- plant type
- planting depth in centimetres, where the plant is actually rooted or planted
- suitable water depth in centimetres, where the sources establish it
- mature height
- mature spread
- sunlight requirements
- flowering period
- whether it is native to the UK
- whether it is an oxygenating plant
- wildlife value
- suitability for small ponds
- hardiness
- general care difficulty
- growth habit, including whether rooted, submerged,
  free-floating, floating-leaved, marginal or emergent
- how the plant is actually planted or introduced to a pond
- winter behaviour
- propagation, but only where supported by the sources
- useful maintenance and management information
- current legal or invasive-species restrictions relevant
  to keeping, growing, transporting, selling or disposing
  of the plant in the UK, with the jurisdiction stated
  precisely where the source applies only to England,
  Wales, Scotland or Northern Ireland
- important cultivation or management information

Be particularly careful about:

- UK native status
- invasive or prohibited aquatic plants
- planting depth
- mature dimensions
- claims that a plant oxygenates water
- wildlife claims
- legal and invasive-species status

For legal or regulatory claims, prefer GOV.UK evidence.
Never describe a plant simply as "legal in the UK" unless
the supplied evidence genuinely establishes that across
all UK jurisdictions.

If no restriction is identified by the researched sources,
say exactly that. Do not turn absence of evidence into a
claim that no restriction exists.

Distinguish planting depth from suitable water depth.

Planting depth means the depth at which a rooted or container-grown
plant is actually positioned or planted.

Suitable water depth means the depth of water in which the plant can
grow or occur.

For free-floating or unrooted plants, planting-depth fields MUST be
unknown/null unless the source explicitly describes an actual planting
method involving a depth.

If a source says a free-floating or unrooted plant grows in water
"up to X cm deep", that value is a MAXIMUM SUITABLE WATER DEPTH,
not a maximum planting depth.

Do not invent a minimum water depth from a maximum. If the evidence
only establishes "up to X cm", leave the minimum suitable water depth
unknown/null.

Never infer a precise measurement just because
another similar species has one.

If reliable approved sources do not establish a
specific fact, explicitly say that the fact is
unknown from the supplied evidence.

Do not recommend an invasive, prohibited or
inappropriate aquatic plant without clearly
identifying that issue.

Return detailed factual research notes only.
      `.trim(),
    });

  const researchNotes =
    researchResponse.output_text?.trim();

  if (!researchNotes) {
    throw new Error(
      "Plant research returned no usable notes.",
    );
  }

  const sources =
    extractSources(researchResponse);

  if (!sources.length) {
    throw new Error(
      "Plant research returned no verifiable sources.",
    );
  }

  const completion =
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
You create structured plant database records for
PondStuff, a UK garden-pond resource.

You MUST use only the supplied research notes.

Never use outside knowledge.

Never invent:
- planting depths
- suitable water depths
- dimensions
- native status
- flowering months
- hardiness
- sunlight requirements
- growth habit
- planting method
- winter behaviour
- propagation
- legal or invasive-species status

Use null when the research does not establish a
nullable fact.

DEPTH FIELD RULES:
- minPlantingDepthCm and maxPlantingDepthCm are ONLY for actual
  planting/rooting/container placement depths.
- minWaterDepthCm and maxWaterDepthCm describe suitable water depth.
- For a free-floating or unrooted plant, do not put a general water
  depth into a planting-depth field.
- If research says a free-floating plant grows in water "up to 150 cm
  deep", return maxWaterDepthCm as 150 and maxPlantingDepthCm as null.
- Do not infer a minimum depth merely because a maximum is known.

Boolean evidence fields are tri-state.

For isNativeUk, isOxygenating, isWildlifeFriendly and
isSmallPondSuitable:

- return true only when the supplied research positively supports Yes
- return false only when the supplied research positively supports No
- return null when the supplied research does not establish the answer

Never convert "not mentioned", "not established" or missing evidence
into false. Unknown is null.

Allowed plantType values:
marginal
oxygenating
floating
water-lily
deep-water
bog
null

Allowed sunlight values:
full-sun
full-sun-partial-shade
partial-shade
shade
null

Allowed careLevel values:
easy
moderate
advanced
null

floweringMonths must contain only full English
month names.

summary should be approximately 1-2 sentences.

description should be useful editorial copy of
roughly 250-450 words, written for a UK pond owner.
It must remain faithful to the research.

seoTitle must be no more than 60 characters.
metaDescription must be no more than 160 characters.

Return ONLY valid JSON using exactly these keys:

{
  "commonName": "",
  "scientificName": null,
  "plantType": null,
  "summary": "",
  "description": "",
  "minPlantingDepthCm": null,
  "maxPlantingDepthCm": null,
  "minWaterDepthCm": null,
  "maxWaterDepthCm": null,
  "maxHeightCm": null,
  "maxSpreadCm": null,
  "sunlight": null,
  "floweringMonths": [],
  "isNativeUk": null,
  "isOxygenating": null,
  "isWildlifeFriendly": null,
  "isSmallPondSuitable": null,
  "hardiness": null,
  "growthHabit": null,
  "plantingMethod": null,
  "winterBehaviour": null,
  "propagation": null,
  "maintenanceNotes": null,
  "legalStatusUk": null,
  "legalStatusNotes": null,
  "careLevel": null,
  "imageAlt": "",
  "seoTitle": "",
  "metaDescription": ""
}
          `.trim(),
        },
        {
          role: "user",
          content: `
Plant requested:
${cleanName}

RESEARCH NOTES:

${researchNotes}
          `.trim(),
        },
      ],
    });

  const raw =
    completion.choices[0]?.message?.content;

  if (!raw) {
    throw new Error(
      "Plant writer returned no data.",
    );
  }

  let parsed: Omit<
    PondStuffPlantDraft,
    "slug" | "researchSources"
  >;

  try {
    parsed = JSON.parse(cleanJson(raw));
  } catch {
    throw new Error(
      "Plant writer returned invalid JSON.",
    );
  }

  const commonName =
    typeof parsed.commonName === "string" &&
    parsed.commonName.trim()
      ? parsed.commonName.trim()
      : cleanName;

  return {
    ...parsed,
    commonName,
    slug: slugify(commonName),
    researchSources: sources,
  };
}
