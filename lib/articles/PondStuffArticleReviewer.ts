import { getOpenAIClient } from "@/lib/ai/openai";
import type {
  GeneratedPondStuffArticle,
} from "@/lib/articles/PondStuffArticleWriter";
import type {
  PondStuffInternalLink,
} from "@/lib/articles/PondStuffInternalLinks";

type ReviewInput = {
  article: GeneratedPondStuffArticle;
  researchNotes: string;
  internalLinks: PondStuffInternalLink[];
};

function stripCodeFence(value: string) {
  return value
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function trimMeta(
  value: string,
  maxLength: number,
) {
  const clean = value.trim();

  if (clean.length <= maxLength) {
    return clean;
  }

  const shortened =
    clean.slice(0, maxLength + 1);

  const lastSpace =
    shortened.lastIndexOf(" ");

  const result =
    lastSpace > 0
      ? shortened.slice(0, lastSpace)
      : shortened.slice(0, maxLength);

  return result
    .replace(/[,:;–—-]+$/g, "")
    .trim();
}

function sanitiseInternalLinks(
  html: string,
  allowedUrls: Set<string>,
) {
  return html.replace(
    /<a\b([^>]*?)href=(["'])(\/[^"']*)\2([^>]*)>([\s\S]*?)<\/a>/gi,
    (
      _match,
      before: string,
      _quote: string,
      href: string,
      after: string,
      content: string,
    ) => {
      if (!allowedUrls.has(href)) {
        return content;
      }

      return `<a${before}href="${href}"${after}>${content}</a>`;
    },
  );
}

function validateReviewedArticle(
  value: unknown,
  original: GeneratedPondStuffArticle,
  internalLinks: PondStuffInternalLink[],
): GeneratedPondStuffArticle {
  const allowedUrls = new Set(
    internalLinks.map(
      (link) => link.url,
    ),
  );
  if (
    !value ||
    typeof value !== "object"
  ) {
    throw new Error(
      "Article reviewer returned invalid JSON.",
    );
  }

  const data =
    value as Record<string, unknown>;

  const rawSections =
    Array.isArray(data.sections)
      ? data.sections
      : [];

  const sections =
    rawSections
      .map((section, index) => {
        if (
          !section ||
          typeof section !== "object"
        ) {
          return null;
        }

        const item =
          section as Record<
            string,
            unknown
          >;

        const originalSection =
          original.sections[index];

        const body =
          typeof item.body === "string"
            ? sanitiseInternalLinks(
                item.body.trim(),
                allowedUrls,
              )
            : "";

        if (!body) {
          return null;
        }

        return {
          id:
            originalSection?.id ??
            crypto.randomUUID(),

          eyebrow:
            typeof item.eyebrow ===
            "string"
              ? item.eyebrow.trim()
              : originalSection
                  ?.eyebrow ?? "",

          headline:
            typeof item.headline ===
            "string"
              ? item.headline.trim()
              : originalSection
                  ?.headline ?? "",

          body,
        };
      })
      .filter(
        (
          section,
        ): section is NonNullable<
          typeof section
        > => Boolean(section),
      );

  if (sections.length < 4) {
    throw new Error(
      "Article reviewer returned too few valid sections.",
    );
  }

  const title =
    typeof data.title === "string" &&
    data.title.trim()
      ? data.title.trim()
      : original.title;

  const excerpt =
    typeof data.excerpt === "string" &&
    data.excerpt.trim()
      ? data.excerpt.trim()
      : original.excerpt;

  const intro =
    typeof data.intro === "string" &&
    data.intro.trim()
      ? data.intro.trim()
      : original.intro;

  const seoTitle =
    typeof data.seoTitle === "string" &&
    data.seoTitle.trim()
      ? data.seoTitle.trim()
      : original.seoTitle;

  const metaDescription =
    typeof data.metaDescription ===
      "string" &&
    data.metaDescription.trim()
      ? data.metaDescription.trim()
      : original.metaDescription;

  return {
    ...original,
    title,
    excerpt,
    intro,
    sections,

    seoTitle: trimMeta(
      seoTitle,
      60,
    ),

    metaDescription: trimMeta(
      metaDescription,
      160,
    ),
  };
}

export async function reviewPondStuffArticle({
  article,
  researchNotes,
  internalLinks,
}: ReviewInput): Promise<GeneratedPondStuffArticle> {
  const openai = getOpenAIClient();

  const internalLinkAllowlist =
    internalLinks
      .map(
        (link) =>
          `- ${link.title}: ${link.url}`,
      )
      .join("\n");

  const response =
    await openai.chat.completions.create({
      model:
        process.env
          .OPENAI_PONDSTUFF_REVIEW_MODEL ??
        "gpt-5-mini",

      response_format: {
        type: "json_object",
      },

      messages: [
        {
          role: "system",
          content: `
You are PondStuff's factual evidence reviewer.

PondStuff is an independent UK resource for
garden pond owners.

You will receive:
1. research notes gathered from approved sources
2. a drafted article based on those notes

Your job is to fact-check and conservatively
edit the draft.

Do NOT write a new article from scratch.

Rules:

- Preserve the article's useful structure,
  tone and intent wherever possible.

- Every concrete factual claim must be
  supportable from the supplied research notes.

- If a claim is more specific than the
  research supports, soften it or remove it.

- Never add facts from your own memory.

- Never invent scientific claims, studies,
  statistics, timings, dosages, water
  parameters, treatment rates, stocking
  levels, equipment capacities or product
  specifications.

- Be particularly strict with claims about:
  fish health,
  chemicals,
  treatments,
  water chemistry,
  oxygen,
  UV equipment,
  electrical equipment,
  filtration,
  wildlife,
  koi.

- Do not diagnose fish disease.

- Do not turn correlation or general advice
  into certainty.

- Preserve distinctions between wildlife,
  ornamental, fish and koi ponds where the
  evidence supports them.

- Clear water does not automatically mean
  healthy water.

- Avoid recommending complete pond draining
  unless the supplied evidence specifically
  supports it for the stated situation.

- Internal PondStuff links may only use URLs
  from the supplied internal-link allowlist.
- Every internal href must exactly match an
  allowlisted URL.
- Never invent, alter or guess a PondStuff URL.
- Remove an internal link if it is not relevant
  to the surrounding text.
- Do not invent source URLs.
- Treat precise numerical claims as high-risk factual claims.
- This includes treatment dosages, product quantities, stocking levels,
  pond capacities, flow rates, turnover rates, electrical specifications,
  water parameters, temperatures, depths, timings and maintenance intervals.
- Keep a precise number only when the supplied research notes clearly
  support that exact figure in the same practical context.
- If the research does not clearly support the exact figure, remove it
  or rewrite the advice without unsupported precision.
- Never turn a manufacturer-specific recommendation into a universal rule.
- Preserve important qualifiers, pond-type distinctions and safety
  conditions attached to any supported numerical recommendation.
- Do not present treatment or dosing quantities as universal instructions
  when they depend on a particular product, pond type or manufacturer.
- Prefer cautious descriptive guidance over false numerical precision.

- Keep existing HTML in section bodies.
  Valid body HTML may contain paragraphs,
  lists and links.

- Do not include citations or a public
  Sources section in the article.

SEO rules:

- seoTitle must be no more than 60 characters.
- metaDescription must be no more than
  160 characters.
- Keep both natural and useful to humans.

Return JSON only using exactly this shape:

{
  "title": "string",
  "excerpt": "string",
  "intro": "string",
  "sections": [
    {
      "eyebrow": "string",
      "headline": "string",
      "body": "HTML string"
    }
  ],
  "seoTitle": "string",
  "metaDescription": "string"
}
          `.trim(),
        },
        {
          role: "user",
          content: `
RESEARCH NOTES:

${researchNotes}

APPROVED PONDSTUFF INTERNAL LINKS:

${
  internalLinkAllowlist ||
  "No internal links are available."
}

ARTICLE TO REVIEW:

${JSON.stringify(article)}
          `.trim(),
        },
      ],
    });

  const raw =
    response.choices[0]?.message
      ?.content;

  if (!raw) {
    throw new Error(
      "Article reviewer returned no content.",
    );
  }

  const parsed =
    JSON.parse(
      stripCodeFence(raw),
    );

  return validateReviewedArticle(
    parsed,
    article,
    internalLinks,
  );
}
