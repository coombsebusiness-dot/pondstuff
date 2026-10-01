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
  const now = new Date().toISOString();

  const { data: articles, error: articlesError } =
    await supabase
      .from("articles")
      .select("slug, content_type, updated_at")
      .eq("status", "published")
      .lte("published_at", now)
      .order("published_at", {
        ascending: false,
      });

  if (articlesError) {
    console.error(
      "Could not load articles for sitemap:",
      articlesError.message,
    );
  }

  const { data: plants, error: plantsError } =
    await supabase
      .from("plants")
      .select("slug, updated_at")
      .eq("status", "published")
      .lte("published_at", now)
      .order("published_at", {
        ascending: false,
      });

  if (plantsError) {
    console.error(
      "Could not load plants for sitemap:",
      plantsError.message,
    );
  }

  const { data: fish, error: fishError } =
    await supabase
      .from("fish")
      .select("slug, updated_at")
      .eq("status", "published")
      .lte("published_at", now)
      .order("published_at", {
        ascending: false,
      });

  if (fishError) {
    console.error(
      "Could not load fish for sitemap:",
      fishError.message,
    );
  }

  const { data: equipment, error: equipmentError } =
    await supabase
      .from("equipment")
      .select("slug, updated_at")
      .eq("status", "published")
      .order("name", {
        ascending: true,
      });

  if (equipmentError) {
    console.error(
      "Could not load equipment for sitemap:",
      equipmentError.message,
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
    {
      url: `${siteUrl}/tools/pond-filter-calculator`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/tools/pond-pump-calculator`,
      changeFrequency: "monthly",
      priority: 0.9,
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

  const plantPages: MetadataRoute.Sitemap =
    (plants ?? []).map((plant) => ({
      url: `${siteUrl}/plants/${plant.slug}`,
      lastModified: plant.updated_at
        ? new Date(plant.updated_at)
        : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  const fishPages: MetadataRoute.Sitemap =
    (fish ?? []).map((item) => ({
      url: `${siteUrl}/fish/${item.slug}`,
      lastModified: item.updated_at
        ? new Date(item.updated_at)
        : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  const equipmentPages: MetadataRoute.Sitemap =
    (equipment ?? []).map((item) => ({
      url: `${siteUrl}/equipment/${item.slug}`,
      lastModified: item.updated_at
        ? new Date(item.updated_at)
        : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  return [
    ...staticPages,
    ...articlePages,
    ...plantPages,
    ...fishPages,
    ...equipmentPages,
  ];
}
