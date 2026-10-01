import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Fish = {
  id: string;
  common_name: string;
  scientific_name: string | null;
  slug: string;
  care_level: string | null;
  status: string;
  is_featured: boolean;
  image_url: string | null;
};

export default async function AdminFishPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fish")
    .select(
      "id, common_name, scientific_name, slug, care_level, status, is_featured, image_url",
    )
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Could not load fish: ${error.message}`,
    );
  }

  const fish = (data ?? []) as Fish[];

  return (
    <main className="admin-content">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">DATABASE</p>
          <h1>Fish</h1>
          <p>
            Manage PondStuff&apos;s structured pond fish
            reference database.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/admin/fish/batch"
            className="admin-secondary-button"
          >
            Batch builder
          </Link>

          <Link
            href="/admin/fish/new"
            className="admin-primary-button"
          >
            + New fish
          </Link>
        </div>
      </div>

      <section className="admin-panel">
        {fish.length === 0 ? (
          <div className="admin-empty-state">
            <span>🐟</span>
            <h2>No fish yet.</h2>
            <p>
              Time to start stocking the PondStuff fish
              database.
            </p>

            <Link
              href="/admin/fish/new"
              className="admin-primary-button"
            >
              Add the first fish
            </Link>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Fish</th>
                  <th>Care</th>
                  <th>Image</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {fish.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>
                        {item.common_name}
                      </strong>

                      <small>
                        {item.scientific_name ??
                          `/${item.slug}`}
                      </small>
                    </td>

                    <td>
                      <span className="admin-type">
                        {item.care_level ?? "—"}
                      </span>
                    </td>

                    <td>
                      {item.image_url ? "Yes" : "Missing"}
                    </td>

                    <td>
                      <span
                        className={`admin-status admin-status-${item.status}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td>
                      {item.is_featured ? "Yes" : "—"}
                    </td>

                    <td className="admin-table-action">
                      <Link
                        href={`/admin/fish/${item.id}/edit`}
                      >
                        Edit →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
