import Link from "next/link";
import PlantEditor from "../PlantEditor";

type NewPlantPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewPlantPage({
  searchParams,
}: NewPlantPageProps) {
  const params = await searchParams;

  return (
    <main className="admin-content">
      <div className="admin-editor-top">
        <div>
          <Link
            href="/admin/plants"
            className="admin-back-link"
          >
            ← Plants
          </Link>

          <p className="admin-eyebrow">
            NEW DATABASE ENTRY
          </p>

          <h1>New plant</h1>
        </div>
      </div>

      {params.error && (
        <div className="admin-editor-error">
          {params.error}
        </div>
      )}

      <PlantEditor />
    </main>
  );
}
