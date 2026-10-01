import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Pond Guides",
  description:
    "Practical pond guides covering pond building, maintenance, fish, plants, water quality, equipment and everyday pond care.",
};

export default async function GuidesPage() {
  const supabase = await createClient();

  const { data: guides, error } = await supabase
    .from("articles")
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        hero_image_url,
        hero_image_alt,
        published_at
      `,
    )
    .eq("content_type", "guide")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Could not load guides:",
      error.message,
    );
  }

  return (
    <div className="shell">
      <section className="section-heading">
        <p className="eyebrow">POND GUIDES</p>

        <h1>Practical Pond Guides</h1>

        <p>
          Straightforward guides to help you build,
          maintain and get more from your pond.
        </p>
      </section>

      {!guides || guides.length === 0 ? (
        <section className="content-card">
          <h2>Guides are coming soon</h2>

          <p>
            We're building a growing library of
            practical pond guides. Check back soon.
          </p>
        </section>
      ) : (
        <section className="card-grid">
          {guides.map((guide) => (
            <article
              key={guide.id}
              className="content-card"
            >
              {guide.hero_image_url ? (
                <img
                  src={guide.hero_image_url}
                  alt={
                    guide.hero_image_alt ||
                    guide.title
                  }
                  className="content-card-image"
                />
              ) : null}

              <div className="content-card-body">
                <p className="eyebrow">
                  POND GUIDE
                </p>

                <h2>
                  <Link
                    href={`/guides/${guide.slug}`}
                  >
                    {guide.title}
                  </Link>
                </h2>

                {guide.excerpt ? (
                  <p>{guide.excerpt}</p>
                ) : null}

                <Link
                  href={`/guides/${guide.slug}`}
                  className="text-link"
                >
                  Read guide →
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
