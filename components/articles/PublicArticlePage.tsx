import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RecommendedAffiliateProducts from "@/components/affiliate/RecommendedAffiliateProducts";

type ContentType =
  | "guide"
  | "problem"
  | "equipment"
  | "feature";

type ArticleSection = {
  eyebrow?: string;
  headline?: string;
  body?: string;
};

type Article = {
  id: string;
  title: string;
  slug: string;
  content_type: ContentType;
  excerpt: string | null;
  intro: string | null;
  sections: ArticleSection[] | null;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  hero_image_credit: string | null;
  seo_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  updated_at: string;
  categories:
    | {
        name: string;
        slug: string;
      }
    | {
        name: string;
        slug: string;
      }[]
    | null;
};

const contentConfig: Record<
  ContentType,
  {
    label: string;
    path: string;
  }
> = {
  guide: {
    label: "Guides",
    path: "/guides",
  },
  problem: {
    label: "Pond Problems",
    path: "/problems",
  },
  equipment: {
    label: "Equipment",
    path: "/equipment",
  },
  feature: {
    label: "Features",
    path: "/features",
  },
};

function categoryFor(article: Article) {
  if (!article.categories) {
    return null;
  }

  if (Array.isArray(article.categories)) {
    return article.categories[0] ?? null;
  }

  return article.categories;
}

export async function getPublicArticle(
  slug: string,
  contentType: ContentType,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(`
      id,
      title,
      slug,
      content_type,
      excerpt,
      intro,
      sections,
      hero_image_url,
      hero_image_alt,
      hero_image_credit,
      seo_title,
      meta_description,
      published_at,
      updated_at,
      categories (
        name,
        slug
      )
    `)
    .eq("slug", slug)
    .eq("content_type", contentType)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (error) {
    throw new Error(
      `Could not load article: ${error.message}`,
    );
  }

  return data as Article | null;
}

export async function getArticleMetadata(
  slug: string,
  contentType: ContentType,
): Promise<Metadata> {
  const article = await getPublicArticle(
    slug,
    contentType,
  );

  if (!article) {
    return {
      title: "Article not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const config =
    contentConfig[contentType];

  const canonical =
    `https://pondstuff.co.uk${config.path}/${article.slug}`;

  const title =
    article.seo_title ||
    article.title;

  const description =
    article.meta_description ||
    article.excerpt ||
    article.intro ||
    undefined;

  return {
    title,
    description,

    alternates: {
      canonical,
    },

    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
      siteName: "PondStuff",
      publishedTime:
        article.published_at ??
        undefined,
      modifiedTime:
        article.updated_at,
      images: article.hero_image_url
        ? [
            {
              url: article.hero_image_url,
              alt:
                article.hero_image_alt ||
                article.title,
            },
          ]
        : undefined,
    },

    twitter: {
      card: article.hero_image_url
        ? "summary_large_image"
        : "summary",
      title,
      description,
      images: article.hero_image_url
        ? [article.hero_image_url]
        : undefined,
    },
  };
}

export default async function PublicArticlePage({
  slug,
  contentType,
}: {
  slug: string;
  contentType: ContentType;
}) {
  const article = await getPublicArticle(
    slug,
    contentType,
  );

  if (!article) {
    notFound();
  }

  const config =
    contentConfig[contentType];

  const category =
    categoryFor(article);

  const canonical =
    `https://pondstuff.co.uk${config.path}/${article.slug}`;

  const publishedLabel =
    article.published_at
      ? new Intl.DateTimeFormat(
          "en-GB",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          },
        ).format(
          new Date(
            article.published_at,
          ),
        )
      : null;

  const sections =
    Array.isArray(article.sections)
      ? article.sections.filter(
          (section) =>
            section.eyebrow?.trim() ||
            section.headline?.trim() ||
            section.body?.trim(),
        )
      : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description:
      article.meta_description ||
      article.excerpt ||
      article.intro ||
      undefined,
    datePublished:
      article.published_at ||
      undefined,
    dateModified:
      article.updated_at,
    mainEntityOfPage: canonical,
    image: article.hero_image_url
      ? [article.hero_image_url]
      : undefined,
    author: {
      "@type": "Organization",
      name: "PondStuff",
    },
    publisher: {
      "@type": "Organization",
      name: "PondStuff",
      url: "https://pondstuff.co.uk",
    },
  };

  return (
    <>
      <article className="public-article">
        <header className="public-article-header">
          <div className="public-article-inner">
            <nav
              className="article-breadcrumbs"
              aria-label="Breadcrumb"
            >
              <Link href="/">
                PondStuff
              </Link>

              <span>/</span>

              <Link href={config.path}>
                {config.label}
              </Link>

              {category && (
                <>
                  <span>/</span>
                  <span>
                    {category.name}
                  </span>
                </>
              )}
            </nav>

            <p className="article-kicker">
              {config.label}
            </p>

            <h1>{article.title}</h1>

            {article.excerpt && (
              <p className="article-excerpt">
                {article.excerpt}
              </p>
            )}

            {publishedLabel && (
              <p className="article-date">
                Published{" "}
                <time
                  dateTime={
                    article.published_at ??
                    undefined
                  }
                >
                  {publishedLabel}
                </time>
              </p>
            )}
          </div>
        </header>

        {article.hero_image_url && (
          <figure className="article-hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                article.hero_image_url
              }
              alt={
                article.hero_image_alt ||
                article.title
              }
            />

            {article.hero_image_credit && (
              <figcaption>
                {
                  article.hero_image_credit
                }
              </figcaption>
            )}
          </figure>
        )}

        <div className="public-article-body">
          {article.intro && (
            <div className="article-intro">
              {article.intro
                .split(/\n+/)
                .filter(Boolean)
                .map(
                  (
                    paragraph,
                    index,
                  ) => (
                    <p key={index}>
                      {paragraph}
                    </p>
                  ),
                )}
            </div>
          )}

          {sections.map(
            (section, index) => (
              <section
                className="article-content-section"
                key={index}
              >
                {section.eyebrow && (
                  <p className="article-section-eyebrow">
                    {
                      section.eyebrow
                    }
                  </p>
                )}

                {section.headline && (
                  <h2>
                    {
                      section.headline
                    }
                  </h2>
                )}

                {section.body && (
                  <div
                    className="article-rich-content"
                    dangerouslySetInnerHTML={{
                      __html:
                        section.body,
                    }}
                  />
                )}
              </section>
            ),
          )}

          <RecommendedAffiliateProducts
            articleId={article.id}
          />
        </div>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            jsonLd,
          ).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
