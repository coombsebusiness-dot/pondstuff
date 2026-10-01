import Link from "next/link";

import FishBatchBuilder from "./FishBatchBuilder";

export default function FishBatchPage() {
  return (
    <main className="space-y-8">
      <div>
        <Link
          href="/admin/fish"
          className="text-sm font-medium text-slate-600 underline"
        >
          ← Fish
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-slate-950">
          Fish Batch Builder
        </h1>

        <p className="mt-2 max-w-3xl text-slate-600">
          Queue pond fish for manufacturer-free species
          research. Every generated fish record remains a
          draft until it has been manually reviewed and
          published.
        </p>
      </div>

      <FishBatchBuilder />
    </main>
  );
}
