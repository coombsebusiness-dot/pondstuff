import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Pond Problems",
  description:
    "Practical help for common pond problems including green water, algae, poor water quality, fish health, maintenance and equipment issues.",
};

export default async function ProblemsPage() {
  const supabase = await createClient();

  const { data: problems, error } = await supabase
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
    .eq("content_type", "problem")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "Could not load pond problems:",
      error.message,
    );
  }

  return (
    <div className="shell">
      <section className="section-heading">
        <p className="eyebrow">POND PROBLEMS</p>

        <h1>Fix Common Pond Problems</h1>

        <p>
          Practical help for diagnosing and solving
          common pond problems, from water quality
          and algae to fish and equipment issues.
        </p>
      </section>

      {!problems || problems.length === 0 ? (
        <section className="content-card">
          <h2>Problem guides are coming soon</h2>

          <p>
            We're building a growing library of
            practical solutions for common pond
            problems.
          </p>
        </section>
      ) : (
        <section className="card-grid">
          {problems.map((problem) => (
            <article
              key={problem.id}
              className="content-card"
            >
              {problem.hero_image_url ? (
                <img
                  src={problem.hero_image_url}
                  alt={
                    problem.hero_image_alt ||
                    problem.title
                  }
                  className="content-card-image"
                />
              ) : null}

              <div className="content-card-body">
                <p className="eyebrow">
                  POND PROBLEM
                </p>

                <h2>
                  <Link
                    href={`/problems/${problem.slug}`}
                  >
                    {problem.title}
                  </Link>
                </h2>

                {problem.excerpt ? (
                  <p>{problem.excerpt}</p>
                ) : null}

                <Link
                  href={`/problems/${problem.slug}`}
                  className="text-link"
                >
                  Find the solution →
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
