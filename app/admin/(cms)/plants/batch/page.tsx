import Link from "next/link";
import PlantBatchBuilder from "./PlantBatchBuilder";

export default function PlantBatchPage() {
  return (
    <main className="admin-content">
      <div className="admin-page-header">
        <div>
          <Link
            href="/admin/plants"
            className="admin-back-link"
          >
            ← Plants
          </Link>

          <p className="admin-eyebrow">
            AI DATABASE BUILDER
          </p>

          <h1>Plant Batch Builder</h1>

          <p>
            Research and prepare multiple pond
            plant records using the PondStuff
            research pipeline.
          </p>
        </div>
      </div>

      <PlantBatchBuilder />

      <section
        className="admin-panel"
        style={{
          marginTop: "1.5rem",
        }}
      >
        <p className="admin-eyebrow">
          SAFETY
        </p>

        <h2>Human review required</h2>

        <p>
          Batch-generated plants always enter
          the database as drafts. Review research
          sources, measurements, suitability and
          UK legal status before publishing.
        </p>
      </section>
    </main>
  );
}
