import Link from "next/link";
import EquipmentEditor from "../EquipmentEditor";

type NewEquipmentPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewEquipmentPage({
  searchParams,
}: NewEquipmentPageProps) {
  const params = await searchParams;

  return (
    <main className="admin-content">
      <div className="admin-editor-top">
        <div>
          <Link
            href="/admin/equipment"
            className="admin-back-link"
          >
            ← Equipment
          </Link>

          <p className="admin-eyebrow">
            NEW DATABASE ENTRY
          </p>

          <h1>New equipment</h1>
        </div>
      </div>

      {params.error && (
        <div className="admin-editor-error">
          {params.error}
        </div>
      )}

      <EquipmentEditor />
    </main>
  );
}
