import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Plant = {
  id: string;
  common_name: string;
  scientific_name: string | null;
  slug: string;
  plant_type: string | null;
  status: string;
  is_featured: boolean;
};

export default async function AdminPlantsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("plants")
    .select(
      "id, common_name, scientific_name, slug, plant_type, status, is_featured",
    )
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Could not load plants: ${error.message}`,
    );
  }

  const plants = (data ?? []) as Plant[];

  return (
    <main className="admin-content">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">DATABASE</p>
          <h1>Plants</h1>
          <p>
            Manage PondStuff&apos;s structured pond
            plant reference database.
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
            href="/admin/plants/qa"
            className="admin-secondary-button"
          >
            QA audit
          </Link>

          <Link
            href="/admin/plants/batch"
            className="admin-secondary-button"
          >
            Batch builder
          </Link>

          <Link
            href="/admin/plants/new"
            className="admin-primary-button"
          >
            + New plant
          </Link>
        </div>
      </div>

      <section className="admin-panel">
        {plants.length === 0 ? (
          <div className="admin-empty-state">
            <span>🌿</span>
            <h2>No plants yet.</h2>
            <p>
              Time to start growing the PondStuff
              plant database.
            </p>

            <Link
              href="/admin/plants/new"
              className="admin-primary-button"
            >
              Add the first plant
            </Link>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Plant</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {plants.map((plant) => (
                  <tr key={plant.id}>
                    <td>
                      <strong>
                        {plant.common_name}
                      </strong>

                      <small>
                        {plant.scientific_name ??
                          `/${plant.slug}`}
                      </small>
                    </td>

                    <td>
                      <span className="admin-type">
                        {plant.plant_type ?? "—"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`admin-status admin-status-${plant.status}`}
                      >
                        {plant.status}
                      </span>
                    </td>

                    <td>
                      {plant.is_featured
                        ? "Yes"
                        : "—"}
                    </td>

                    <td className="admin-table-action">
                      <Link
                        href={`/admin/plants/${plant.id}/edit`}
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
