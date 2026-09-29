import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://pondstuff.co.uk";

const articlePaths: Record<string, string> = {
  guide: "guides",
  problem: "problems",
  equipment: "equipment",
  feature: "features",
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data: articles, error } = await supabase
    .from("articles")
    .select(`
      slug,
      content_type,
      updated_at
    `)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Could not load articles for sitemap:",
      error.message,
    );
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/guides`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/problems`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/equipment`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/plants`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/fish`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/tools`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/tools/pond-volume-calculator`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/tools/pond-liner-calculator`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const articlePages: MetadataRoute.Sitemap =
    (articles ?? []).flatMap((article) => {
      const directory =
        articlePaths[article.content_type];

      if (!directory) {
        return [];
      }

      return [
        {
          url: `${siteUrl}/${directory}/${article.slug}`,
          lastModified: article.updated_at
            ? new Date(article.updated_at)
            : undefined,
          changeFrequency: "monthly" as const,
          priority: 0.8,
        },
      ];
    });

  return [
    ...staticPages,
    ...articlePages,
  ];
}
