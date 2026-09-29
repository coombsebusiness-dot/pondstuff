import { getOpenAIClient } from "@/lib/ai/openai";

export type PondStuffResearchSource = {
  title: string;
  url: string;
};

export type PondStuffResearch = {
  notes: string;
  sources: PondStuffResearchSource[];
};

const TRUSTED_DOMAINS = [
  "rhs.org.uk",
  "freshwaterhabitats.org.uk",
  "oase.com",
];

function extractSources(
  response: any,
): PondStuffResearchSource[] {
  const sources = new Map<
    string,
    PondStuffResearchSource
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

          const title =
            annotation?.title ??
            annotation?.url_citation?.title ??
            new URL(url).hostname;

          sources.set(url, {
            title,
            url,
          });
        }
      }
    }
  }

  return [...sources.values()];
}

export async function researchPondStuffTopic(
  topic: string,
): Promise<PondStuffResearch> {
  const cleanTopic = topic.trim();

  if (!cleanTopic) {
    throw new Error(
      "A topic is required for research.",
    );
  }

  const openai = getOpenAIClient();

  const response =
    await openai.responses.create({
      model:
        process.env.OPENAI_PONDSTUFF_RESEARCH_MODEL ??
        "gpt-5-mini",

      tools: [
        {
          type: "web_search",
          filters: {
            allowed_domains:
              TRUSTED_DOMAINS,
          },
          search_context_size: "high",
        },
      ],

      input: `
You are the research layer for PondStuff,
an independent UK pond-owner resource.

Research this topic:

"${cleanTopic}"

Use web search.

You are restricted to the approved domains
provided by the web-search tool.

Your job is NOT to write the article.

Produce concise factual research notes that
another writer can use safely.

Focus on facts directly relevant to the topic.

Where relevant, distinguish between:
- wildlife ponds
- ornamental garden ponds
- fish ponds
- koi ponds

Be especially careful with:
- fish health
- water chemistry
- chemicals and treatments
- electrical equipment
- UV clarifiers
- filtration
- stocking
- water changes

Do not invent:
- dosages
- treatment rates
- equipment sizing
- water parameters
- time-to-result claims
- scientific findings
- product specifications

If the approved sources do not support a
specific claim, leave it out.

When sources disagree or advice depends on
pond type, say so.

Return research notes only.

Organise the notes under useful plain-text
headings.

Include enough detail for a writer to create
a thorough UK article, but do not pad the
research with generic prose.
      `.trim(),
    });

  const notes =
    response.output_text?.trim();

  if (!notes) {
    throw new Error(
      "Research completed but returned no notes.",
    );
  }

  const sources =
    extractSources(response);

  if (!sources.length) {
    throw new Error(
      "Research returned no verifiable source URLs.",
    );
  }

  return {
    notes,
    sources,
  };
}
