import Link from "next/link";

import EquipmentBatchBuilder from "./EquipmentBatchBuilder";

import {
  getEquipmentQueue,
} from "./actions";

export default async function EquipmentBatchPage() {
  const queue =
    await getEquipmentQueue();

  return (
    <main className="space-y-8">
      <div>
        <Link
          href="/admin/equipment"
          className="text-sm font-medium text-slate-600 underline"
        >
          ← Equipment
        </Link>

        <h1 className="mt-4 text-3xl font-bold text-slate-950">
          Equipment Batch Builder
        </h1>

        <p className="mt-2 max-w-3xl text-slate-600">
          Queue exact equipment products for
          manufacturer-first research. Every
          generated equipment record remains a
          draft until it has been manually
          reviewed and published.
        </p>
      </div>

      <EquipmentBatchBuilder
        initialQueue={queue}
      />
    </main>
  );
}
