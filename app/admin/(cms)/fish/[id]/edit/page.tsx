import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import FishEditor from "../../FishEditor";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditFishPage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: fish, error } = await supabase
    .from("fish")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Could not load fish: ${error.message}`,
    );
  }

  if (!fish) {
    notFound();
  }

  return (
    <main className="admin-content">
      <div className="admin-page-header">
        <div>
          <p className="admin-eyebrow">DATABASE</p>
          <h1>Edit {fish.common_name}</h1>
          <p>
            Update the fish profile, image and SEO
            information.
          </p>
        </div>

        <Link
          href="/admin/fish"
          className="admin-secondary-button"
        >
          ← Back to fish
        </Link>
      </div>

      <FishEditor initialFish={fish} />
    </main>
  );
}
