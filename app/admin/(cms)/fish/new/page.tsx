import Link from "next/link";
import FishEditor from "../FishEditor";

export default function NewFishPage() {
  return (
    <main className="admin-content">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">DATABASE</p>
          <h1>New fish</h1>
          <p>
            Create a structured pond fish profile.
          </p>
        </div>

        <Link
          href="/admin/fish"
          className="admin-secondary-button"
        >
          ← Back to fish
        </Link>
      </div>

      <FishEditor />
    </main>
  );
}
