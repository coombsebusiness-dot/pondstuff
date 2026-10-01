import { getOpenAIClient } from "@/lib/ai/openai";

export type PondStuffFishDraft = {
  commonName: string;
  scientificName: string | null;
  slug: string;
  summary: string;
  description: string;
  maxLengthCm: number | null;
  minimumPondVolumeLitres: number | null;
  minimumPondDepthCm: number | null;
  minTemperatureC: number | null;
  maxTemperatureC: number | null;
  diet: string | null;
  temperament: string | null;
  careLevel:
    | "easy"
    | "moderate"
    | "advanced"
    | null;
  suitableForSmallPonds: boolean;
  suitableForWildlifePonds: boolean;
  compatibilityNotes: string | null;
  careNotes: string | null;
  imageAlt: string;
  seoTitle: string;
  metaDescription: string;
  researchSources: {
    title: string;
    url: string;
  }[];
};

const APPROVED_DOMAINS = [
  "gov.uk",
  "nonnativespecies.org",
  "ornamentalfish.org",
  "fishkeeper.co.uk",
  "wildlifetrusts.org",
  "freshwaterhabitats.org.uk",
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
    { title: string; url: string }
  >();

  for (const item of response.output ?? []) {
    if (
      item?.type === "web_search_call" &&
      Array.isArray(item?.action?.sources)
    ) {
      for (const source of item.action.sources) {
        if (
          typeof source?.url !== "string" ||
          !source.url
        ) {
          continue;
        }

        sources.set(source.url, {
          title:
            typeof source.title === "string"
              ? source.title
              : new URL(source.url).hostname,
          url: source.url,
        });
      }
    }

    if (item?.type === "message") {
      for (const content of item.content ?? []) {
        for (const annotation of content?.annotations ?? []) {
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

function normaliseCareLevel(
  value: unknown,
): "easy" | "moderate" | "advanced" | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalised = value
    .trim()
    .toLowerCase();

  if (normalised === "easy") {
    return "easy";
  }

  if (normalised === "moderate") {
    return "moderate";
  }

  if (normalised === "advanced") {
    return "advanced";
  }

  if (
    [
      "beginner",
      "basic",
      "low",
      "simple",
    ].includes(normalised)
  ) {
    return "easy";
  }

  if (
    [
      "medium",
      "intermediate",
    ].includes(normalised)
  ) {
    return "moderate";
  }

  if (
    [
      "difficult",
      "hard",
      "high",
      "expert",
    ].includes(normalised)
  ) {
    return "advanced";
  }

  return null;
}

export async function generatePondStuffFish(
  fishName: string,
  scientificNameHint?: string | null,
): Promise<PondStuffFishDraft> {
  const cleanName = fishName.trim();

  const scientificHint =
    scientificNameHint?.trim() || null;

  if (!cleanName) {
    throw new Error(
      "Fish name is required.",
    );
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
            allowed_domains:
              APPROVED_DOMAINS,
          },
          search_context_size: "high",
        },
      ],

      input: `
You are the research layer for PondStuff,
an independent UK pond resource.

Research this pond fish:

"${cleanName}"

${scientificHint
  ? `Scientific-name hint: "${scientificHint}"`
  : "No scientific-name hint was supplied."}

Verify the identity rather than blindly trusting
the catalogue name.

Research factual information relevant to UK pond
owners, including:

- scientific name
- adult maximum length
- minimum pond volume if genuinely established
- minimum pond depth if genuinely established
- minimum and maximum temperature where supported
- diet
- temperament
- care difficulty
- small pond suitability
- wildlife pond suitability
- compatibility
- care requirements
- overwintering
- oxygen requirements
- stocking considerations
- relevant UK invasive-species or legal information

Use only the approved domains.

Do not invent minimum pond sizes, depths,
temperatures or legal claims.

A general recommendation must not be presented
as an authoritative minimum.

If a fact cannot be established from the sources,
say that it is unknown.

Return detailed factual research notes.
      `.trim(),
    });

  const researchNotes =
    researchResponse.output_text?.trim();

  if (!researchNotes) {
    throw new Error(
      "Fish research returned no usable notes.",
    );
  }

  const researchSources =
    extractSources(researchResponse);

  if (!researchSources.length) {
    throw new Error(
      "Fish research returned no verifiable sources.",
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
You create structured fish records for PondStuff.

Use ONLY the supplied research notes.

Never invent factual values.

Use null when a nullable value is not established.

For suitability booleans, only use true when the
research positively supports the claim.

The description should be useful UK pond-owner
content of approximately 250-450 words.

The summary should be concise.

seoTitle must be 60 characters or fewer.

metaDescription must be 160 characters or fewer.

Return ONLY valid JSON with these keys:

{
  "commonName": "",
  "scientificName": null,
  "summary": "",
  "description": "",
  "maxLengthCm": null,
  "minimumPondVolumeLitres": null,
  "minimumPondDepthCm": null,
  "minTemperatureC": null,
  "maxTemperatureC": null,
  "diet": null,
  "temperament": null,
  "careLevel": null,
  "suitableForSmallPonds": false,
  "suitableForWildlifePonds": false,
  "compatibilityNotes": null,
  "careNotes": null,
  "imageAlt": "",
  "seoTitle": "",
  "metaDescription": ""
}
          `.trim(),
        },
        {
          role: "user",
          content: `
Fish:

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
      "Fish writer returned no data.",
    );
  }

  let parsed: Omit<
    PondStuffFishDraft,
    "slug" | "researchSources"
  >;

  try {
    parsed = JSON.parse(
      cleanJson(raw),
    );
  } catch {
    throw new Error(
      "Fish writer returned invalid JSON.",
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
    careLevel: normaliseCareLevel(
      parsed.careLevel,
    ),
    slug: slugify(commonName),
    researchSources,
  };
}
