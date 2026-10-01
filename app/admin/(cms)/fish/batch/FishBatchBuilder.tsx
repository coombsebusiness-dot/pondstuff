"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getFishQueue,
  queueCatalogueFish,
  type FishQueueItem,
} from "./actions";

import {
  pondFishCatalogue,
} from "./catalogue";

export default function FishBatchBuilder() {
  const [queue, setQueue] =
    useState<FishQueueItem[]>([]);

  const [selected, setSelected] =
    useState<string[]>([]);

  const [message, setMessage] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isQueueing, setIsQueueing] =
    useState(false);

  async function refreshQueue() {
    try {
      const items = await getFishQueue();
      setQueue(items);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not load fish queue.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refreshQueue();
  }, []);

  const queuedNames = useMemo(
    () =>
      new Set(
        queue
          .filter((item) =>
            [
              "pending",
              "processing",
              "completed",
            ].includes(item.status),
          )
          .map((item) =>
            item.fish_name.toLowerCase(),
          ),
      ),
    [queue],
  );

  const availableCatalogue =
    useMemo(
      () =>
        pondFishCatalogue.filter(
          (fish) =>
            !queuedNames.has(
              fish.name.toLowerCase(),
            ),
        ),
      [queuedNames],
    );

  const counts = useMemo(
    () => ({
      pending: queue.filter(
        (item) =>
          item.status === "pending",
      ).length,

      processing: queue.filter(
        (item) =>
          item.status === "processing",
      ).length,

      completed: queue.filter(
        (item) =>
          item.status === "completed",
      ).length,

      failed: queue.filter(
        (item) =>
          item.status === "failed",
      ).length,

      skipped: queue.filter(
        (item) =>
          item.status === "skipped",
      ).length,
    }),
    [queue],
  );

  function toggleFish(name: string) {
    setSelected((current) =>
      current.includes(name)
        ? current.filter(
            (item) => item !== name,
          )
        : [...current, name],
    );
  }

  function selectAll() {
    setSelected(
      availableCatalogue.map(
        (fish) => fish.name,
      ),
    );
  }

  function clearSelection() {
    setSelected([]);
  }

  async function addToQueue() {
    if (selected.length === 0) {
      setMessage(
        "Select at least one fish.",
      );
      return;
    }

    setIsQueueing(true);
    setMessage(
      "Adding fish to the research queue...",
    );

    try {
      const result =
        await queueCatalogueFish(
          selected,
        );

      setMessage(
        `${result.added} queued · ` +
          `${result.skippedQueued} already queued`,
      );

      setSelected([]);

      await refreshQueue();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not queue fish.",
      );
    } finally {
      setIsQueueing(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Overnight database build
          </p>

          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Fish research queue
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Select fish from the curated catalogue.
            Adding them here does not publish anything.
            Every completed fish becomes a draft for
            manual review.
          </p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["Pending", counts.pending],
            ["Processing", counts.processing],
            ["Completed", counts.completed],
            ["Failed", counts.failed],
            ["Skipped", counts.skipped],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-xl border border-slate-200 p-4"
            >
              <strong className="block text-2xl text-slate-950">
                {value}
              </strong>

              <span className="text-sm text-slate-500">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={selectAll}
            disabled={
              isLoading ||
              availableCatalogue.length === 0
            }
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 disabled:opacity-50"
          >
            Select all available ({availableCatalogue.length})
          </button>

          <button
            type="button"
            onClick={clearSelection}
            disabled={selected.length === 0}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 disabled:opacity-50"
          >
            Clear selection
          </button>

          <button
            type="button"
            onClick={addToQueue}
            disabled={
              isQueueing ||
              selected.length === 0
            }
            className="rounded-xl bg-slate-950 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isQueueing
              ? "Adding..."
              : `Queue selected (${selected.length})`}
          </button>
        </div>

        {message ? (
          <p className="mt-4 text-sm text-slate-600">
            {message}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-950">
          Fish catalogue
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          {availableCatalogue.length} fish available
          to add to the research queue.
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {availableCatalogue.map((fish) => {
            const checked =
              selected.includes(fish.name);

            return (
              <label
                key={fish.name}
                className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-4"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    toggleFish(fish.name)
                  }
                  className="mt-1"
                />

                <span>
                  <span className="block font-medium text-slate-950">
                    {fish.name}
                  </span>

                  {fish.scientificName ? (
                    <span className="mt-1 block text-xs italic text-slate-500">
                      {fish.scientificName}
                    </span>
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-950">
          Generation queue
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          The worker will research these sequentially
          and create draft fish records. Nothing in
          this queue can publish fish automatically.
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 pr-4">
                  Fish
                </th>

                <th className="pb-3 pr-4">
                  Scientific name
                </th>

                <th className="pb-3 pr-4">
                  Status
                </th>

                <th className="pb-3 pr-4">
                  Attempts
                </th>

                <th className="pb-3">
                  Result
                </th>
              </tr>
            </thead>

            <tbody>
              {queue.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 align-top"
                >
                  <td className="py-4 pr-4 font-medium text-slate-950">
                    {item.fish_name}
                  </td>

                  <td className="py-4 pr-4 italic text-slate-500">
                    {item.scientific_name_hint ??
                      "—"}
                  </td>

                  <td className="py-4 pr-4">
                    {item.status}
                  </td>

                  <td className="py-4 pr-4">
                    {item.attempts}
                  </td>

                  <td className="py-4">
                    {item.fish_id ? (
                      <span className="font-medium">
                        Draft created
                      </span>
                    ) : item.error_message ? (
                      <span className="text-red-700">
                        {item.error_message}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}

              {queue.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-slate-500"
                  >
                    The fish queue is empty.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
