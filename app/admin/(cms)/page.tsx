import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    articlesResult,
    plantsResult,
    fishResult,
    draftsResult,
  ] = await Promise.all([
    supabase
      .from("articles")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("plants")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("fish")
      .select("*", { count: "exact", head: true }),

    supabase
      .from("articles")
      .select("*", { count: "exact", head: true })
      .eq("status", "draft"),
  ]);

  const stats = [
    {
      label: "Articles",
      value: articlesResult.count ?? 0,
      href: "/admin/articles",
    },
    {
      label: "Plant profiles",
      value: plantsResult.count ?? 0,
      href: "/admin/plants",
    },
    {
      label: "Fish profiles",
      value: fishResult.count ?? 0,
      href: "/admin/fish",
    },
    {
      label: "Article drafts",
      value: draftsResult.count ?? 0,
      href: "/admin/articles",
    },
  ];

  return (
    <div className="admin-content">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">PONDSTUFF CMS</p>
          <h1>Dashboard</h1>
          <p>
            Manage PondStuff&apos;s guides, databases and growing pond empire.
          </p>
        </div>
      </header>

      <div className="admin-stat-grid">
        {stats.map((stat) => (
          <Link
            href={stat.href}
            className="admin-stat-card"
            key={stat.label}
          >
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>View section →</small>
          </Link>
        ))}
      </div>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <p className="admin-eyebrow">CREATE</p>
            <h2>Add something to PondStuff</h2>
          </div>
        </div>

        <div className="admin-action-grid">
          <Link href="/admin/articles/new">
            <strong>New article</strong>
            <span>
              Add a guide, pond problem or equipment article.
            </span>
          </Link>

          <Link href="/admin/plants/new">
            <strong>New plant</strong>
            <span>
              Add a structured pond plant profile.
            </span>
          </Link>

          <Link href="/admin/fish/new">
            <strong>New fish</strong>
            <span>
              Add a structured pond fish profile.
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
