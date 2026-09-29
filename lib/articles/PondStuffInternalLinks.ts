import { createClient } from "@/lib/supabase/server";

export type PondStuffInternalLink = {
  title: string;
  url: string;
  type: "article" | "tool";
};

function getArticleUrl(
  contentType: string,
  slug: string,
) {
  const routes: Record<string, string> = {
    guide: "guides",
    problem: "problems",
    equipment: "equipment",
    feature: "features",
  };

  const directory =
    routes[contentType];

  if (!directory) {
    return null;
  }

  return `/${directory}/${slug}`;
}

const PERMANENT_TOOLS: PondStuffInternalLink[] = [
  {
    title: "Pond Volume Calculator",
    url: "/tools/pond-volume-calculator",
    type: "tool",
  },
  {
    title: "Pond Liner Calculator",
    url: "/tools/pond-liner-calculator",
    type: "tool",
  },
  {
    title: "Pond Filter Calculator",
    url: "/tools/pond-filter-calculator",
    type: "tool",
  },
];

export async function getPondStuffInternalLinks():
  Promise<PondStuffInternalLink[]> {
  const supabase =
    await createClient();

  const now =
    new Date().toISOString();

  const {
    data,
    error,
  } = await supabase
    .from("articles")
    .select(
      "title, slug, content_type, published_at",
    )
    .eq("status", "published")
    .lte("published_at", now)
    .order("published_at", {
      ascending: false,
    })
    .limit(100);

  if (error) {
    throw new Error(
      `Could not load PondStuff internal links: ${error.message}`,
    );
  }

  const articles: PondStuffInternalLink[] =
    (data ?? []).flatMap((article) => {
      const url =
        getArticleUrl(
          article.content_type,
          article.slug,
        );

      if (!url) {
        return [];
      }

      return [
        {
          title: article.title,
          url,
          type: "article" as const,
        },
      ];
    });

  return [
    ...articles,
    ...PERMANENT_TOOLS,
  ];
}
