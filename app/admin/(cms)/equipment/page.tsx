import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Equipment = {
  id: string;
  name: string;
  brand: string | null;
  model: string | null;
  slug: string;
  equipment_type: string;
  status: string;
  is_featured: boolean;
};

export default async function AdminEquipmentPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("equipment")
    .select(
      "id, name, brand, model, slug, equipment_type, status, is_featured",
    )
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Could not load equipment: ${error.message}`,
    );
  }

  const equipment =
    (data ?? []) as Equipment[];

  return (
    <main className="admin-content">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">
            DATABASE
          </p>

          <h1>Equipment</h1>

          <p>
            Manage PondStuff&apos;s structured pond
            equipment database.
          </p>
        </div>

        <Link
          href="/admin/equipment/new"
          className="admin-primary-button"
        >
          + New equipment
        </Link>
      </div>

      <section className="admin-panel">
        {equipment.length === 0 ? (
          <div className="admin-empty-state">
            <span>⚙️</span>

            <h2>No equipment yet.</h2>

            <p>
              Start building the PondStuff
              equipment database.
            </p>

            <Link
              href="/admin/equipment/new"
              className="admin-primary-button"
            >
              Add the first item
            </Link>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Equipment</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Featured</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {equipment.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>

                      <small>
                        {[item.brand, item.model]
                          .filter(Boolean)
                          .join(" · ") ||
                          `/${item.slug}`}
                      </small>
                    </td>

                    <td>
                      <span className="admin-type">
                        {item.equipment_type}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`admin-status admin-status-${item.status}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td>
                      {item.is_featured
                        ? "Yes"
                        : "—"}
                    </td>

                    <td className="admin-table-action">
                      <Link
                        href={`/admin/equipment/${item.id}/edit`}
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
