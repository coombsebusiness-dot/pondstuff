import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Pond Equipment",
  description:
    "Explore pond pumps, pond filters, UV clarifiers, air pumps and pond vacuums for UK ponds.",
};

type Equipment = {
  id: string;
  name: string;
  brand: string | null;
  slug: string;
  equipment_type: string | null;
  summary: string | null;
  image_url: string | null;
  image_alt: string | null;
  status: string | null;
};

const typeLabels: Record<string, string> = {
  "pond-pump": "Pond Pumps",
  "pond-filter": "Pond Filters",
  "uv-clarifier": "UV Clarifiers",
  "air-pump": "Air Pumps",
  "pond-vacuum": "Pond Vacuums",
  liner: "Pond Liners",
  underlay: "Pond Underlay",
  "water-test-kit": "Water Test Kits",
  maintenance: "Pond Maintenance",
  other: "Other Equipment",
};

function labelForType(type: string | null) {
  return type
    ? typeLabels[type] ??
        type.replaceAll("-", " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "Equipment";
}

export default async function EquipmentPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("equipment")
    .select(
      `
        id,
        name,
        brand,
        slug,
        equipment_type,
        summary,
        image_url,
        image_alt,
        status
      `,
    )
    .eq("status", "published")
    .order("brand", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(
      `Could not load equipment: ${error.message}`,
    );
  }

  const equipment = (data ?? []) as Equipment[];

  const grouped = equipment.reduce<
    Record<string, Equipment[]>
  >((groups, item) => {
    const key = item.equipment_type ?? "other";

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(item);

    return groups;
  }, {});

  const groupOrder = [
    "pond-pump",
    "pond-filter",
    "uv-clarifier",
    "air-pump",
    "pond-vacuum",
    "water-test-kit",
    "maintenance",
    "liner",
    "underlay",
    "other",
  ];

  return (
    <div className="equipment-directory">
      <section className="equipment-hero">
        <div className="shell">
          <p className="eyebrow">Pond equipment</p>

          <h1>
            Equipment for a
            <br />
            better pond.
          </h1>

          <p className="equipment-intro">
            Explore our growing directory of pond
            pumps, filters, UV clarifiers, air pumps
            and other essential pond equipment. Each
            equipment page brings together practical
            information to help you understand what
            the equipment does and where it fits into
            your pond setup.
          </p>

          <div className="equipment-stats">
            <div>
              <strong>{equipment.length}</strong>
              <span>equipment guides</span>
            </div>

            <div>
              <strong>
                {Object.keys(grouped).length}
              </strong>
              <span>equipment categories</span>
            </div>
          </div>
        </div>
      </section>

      <section className="equipment-content">
        <div className="shell">
          {groupOrder.map((type) => {
            const items = grouped[type];

            if (!items?.length) {
              return null;
            }

            return (
              <section
                key={type}
                className="equipment-category"
              >
                <div className="equipment-category-heading">
                  <div>
                    <p className="eyebrow">
                      Equipment
                    </p>

                    <h2>
                      {labelForType(type)}
                    </h2>
                  </div>

                  <span>
                    {items.length}{" "}
                    {items.length === 1
                      ? "product"
                      : "products"}
                  </span>
                </div>

                <div className="equipment-grid">
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      href={`/equipment/${item.slug}`}
                      className="equipment-card"
                    >
                      <div className="equipment-card-image">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={
                              item.image_alt ??
                              `${item.brand ?? ""} ${item.name}`.trim()
                            }
                          />
                        ) : (
                          <div className="equipment-placeholder">
                            Pond equipment
                          </div>
                        )}
                      </div>

                      <div className="equipment-card-body">
                        <p className="equipment-brand">
                          {item.brand ?? "Equipment"}
                        </p>

                        <h3>{item.name}</h3>

                        {item.summary ? (
                          <p>
                            {item.summary}
                          </p>
                        ) : null}

                        <span className="equipment-card-link">
                          View equipment →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}

          {equipment.length === 0 ? (
            <div className="equipment-empty">
              <h2>Equipment coming soon</h2>
              <p>
                We're building the PondStuff equipment
                directory now. Check back soon.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
