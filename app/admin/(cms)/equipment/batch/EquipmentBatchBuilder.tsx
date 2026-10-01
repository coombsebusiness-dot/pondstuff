"use client";

import {
  useMemo,
  useState,
  useTransition,
} from "react";

import {
  queueCatalogueEquipment,
  type EquipmentQueueItem,
} from "./actions";

import {
  equipmentCatalogue,
} from "./catalogue";

type Props = {
  initialQueue: EquipmentQueueItem[];
};

export default function EquipmentBatchBuilder({
  initialQueue,
}: Props) {
  const [selected, setSelected] =
    useState<string[]>([]);

  const [message, setMessage] =
    useState("");

  const [isPending, startTransition] =
    useTransition();

  const grouped = useMemo(() => {
    const groups = new Map<
      string,
      typeof equipmentCatalogue
    >();

    for (const item of equipmentCatalogue) {
      const existing =
        groups.get(
          item.equipmentType,
        ) ?? [];

      existing.push(item);

      groups.set(
        item.equipmentType,
        existing,
      );
    }

    return Array.from(
      groups.entries(),
    );
  }, []);

  function toggleProduct(
    name: string,
  ) {
    setSelected((current) =>
      current.includes(name)
        ? current.filter(
            (value) =>
              value !== name,
          )
        : [
            ...current,
            name,
          ],
    );
  }

  function selectAll() {
    setSelected(
      equipmentCatalogue.map(
        (item) => item.name,
      ),
    );
  }

  function clearSelection() {
    setSelected([]);
  }

  function queueSelected() {
    setMessage("");

    startTransition(async () => {
      try {
        const result =
          await queueCatalogueEquipment(
            selected,
          );

        setMessage(
          `Queued ${result.added}. ` +
            `Skipped existing ${result.skippedExisting}. ` +
            `Already queued ${result.skippedQueued}.`,
        );

        setSelected([]);

        window.location.reload();
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Could not queue equipment.",
        );
      }
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-950">
            Equipment catalogue
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Select exact products to add to the
            research queue. Catalogue values are
            identity hints only. The research
            pipeline must verify the manufacturer,
            exact model, product code and technical
            specifications before creating a draft.
          </p>
        </div>

        <div className="space-y-6">
          {grouped.map(
            ([type, items]) => (
              <div key={type}>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {type.replaceAll(
                    "-",
                    " ",
                  )}
                </h3>

                <div className="grid gap-3 lg:grid-cols-2">
                  {items.map(
                    (item) => {
                      const checked =
                        selected.includes(
                          item.name,
                        );

                      return (
                        <label
                          key={`${item.brand}-${item.name}`}
                          className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-4"
                        >
                          <input
                            type="checkbox"
                            checked={
                              checked
                            }
                            onChange={() =>
                              toggleProduct(
                                item.name,
                              )
                            }
                            className="mt-1"
                          />

                          <span>
                            <span className="block font-medium text-slate-950">
                              {
                                item.brand
                              }{" "}
                              {
                                item.name
                              }
                            </span>

                            <span className="mt-1 block text-xs text-slate-500">
                              {item.manufacturerSku
                                ? `Product code hint: ${item.manufacturerSku}`
                                : "Product code will be established by manufacturer research"}
                            </span>
                          </span>
                        </label>
                      );
                    },
                  )}
                </div>
              </div>
            ),
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={selectAll}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
          >
            Select all
          </button>

          <button
            type="button"
            onClick={clearSelection}
            className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
          >
            Clear selection
          </button>
          <button
            type="button"
            disabled={
              isPending ||
              selected.length === 0
            }
            onClick={
              queueSelected
            }
            className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending
              ? "Adding to queue..."
              : `Queue selected (${selected.length})`}
          </button>

          {message ? (
            <p className="text-sm text-slate-600">
              {message}
            </p>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">
            Generation queue
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            The worker will research these
            sequentially and create draft records.
            Nothing in this queue can publish
            equipment automatically.
          </p>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 pr-4">
                  Product
                </th>

                <th className="pb-3 pr-4">
                  Type
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
              {initialQueue.map(
                (item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 align-top"
                  >
                    <td className="py-4 pr-4">
                      <div className="font-medium text-slate-950">
                        {item.brand_hint
                          ? `${item.brand_hint} `
                          : ""}
                        {
                          item.product_name
                        }
                      </div>

                      {item.manufacturer_sku_hint ? (
                        <div className="mt-1 text-xs text-slate-500">
                          Product code
                          hint:{" "}
                          {
                            item.manufacturer_sku_hint
                          }
                        </div>
                      ) : null}
                    </td>

                    <td className="py-4 pr-4 text-slate-600">
                      {item.equipment_type_hint
                        ?.replaceAll(
                          "-",
                          " ",
                        ) ??
                        "—"}
                    </td>

                    <td className="py-4 pr-4">
                      {
                        item.status
                      }
                    </td>

                    <td className="py-4 pr-4">
                      {
                        item.attempts
                      }
                    </td>

                    <td className="py-4">
                      {item.equipment_id ? (
                        <a
                          href={`/admin/equipment/${item.equipment_id}/edit`}
                          className="font-medium underline"
                        >
                          Open draft
                        </a>
                      ) : item.error_message ? (
                        <span className="text-red-700">
                          {
                            item.error_message
                          }
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ),
              )}

              {initialQueue.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-slate-500"
                  >
                    The equipment
                    queue is empty.
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
