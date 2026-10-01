"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  generatePlantBatch,
  getPlantQueue,
  queueCataloguePlants,
  type PlantBatchResult,
  type PlantQueueItem,
} from "./actions";

import {
  pondPlantCatalogue,
} from "./catalogue";

export default function PlantBatchBuilder() {
  const [names, setNames] = useState([
    "",
    "",
    "",
  ]);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [results, setResults] =
    useState<PlantBatchResult[]>([]);

  const [queue, setQueue] = useState<
    PlantQueueItem[]
  >([]);

  const [selected, setSelected] = useState<
    string[]
  >([]);

  const [queueMessage, setQueueMessage] =
    useState("");

  const [isQueueing, setIsQueueing] =
    useState(false);

  const [isLoadingQueue, setIsLoadingQueue] =
    useState(true);

  async function refreshQueue() {
    try {
      const items = await getPlantQueue();
      setQueue(items);
    } catch (error) {
      setQueueMessage(
        error instanceof Error
          ? error.message
          : "Could not load queue.",
      );
    } finally {
      setIsLoadingQueue(false);
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
            item.plant_name.toLowerCase(),
          ),
      ),
    [queue],
  );

  const availableCatalogue =
    useMemo(
      () =>
        pondPlantCatalogue.filter(
          (plant) =>
            !queuedNames.has(
              plant.name.toLowerCase(),
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

  function updateName(
    index: number,
    value: string,
  ) {
    setNames((current) =>
      current.map((name, itemIndex) =>
        itemIndex === index
          ? value
          : name,
      ),
    );
  }

  async function generate() {
    const requested = names
      .map((name) => name.trim())
      .filter(Boolean);

    if (requested.length === 0) {
      setMessage(
        "Enter at least one plant.",
      );
      return;
    }

    setIsGenerating(true);
    setResults([]);

    setMessage(
      "Researching plants. This may take a little while...",
    );

    try {
      const generated =
        await generatePlantBatch(
          requested,
        );

      setResults(generated);

      setMessage(
        "Batch finished. Review every created draft before publishing.",
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Batch generation failed.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function togglePlant(name: string) {
    setSelected((current) =>
      current.includes(name)
        ? current.filter(
            (item) => item !== name,
          )
        : [...current, name],
    );
  }

  function selectAllAvailable() {
    setSelected(
      availableCatalogue.map(
        (plant) => plant.name,
      ),
    );
  }

  async function addToQueue() {
    if (selected.length === 0) {
      setQueueMessage(
        "Select at least one plant.",
      );
      return;
    }

    setIsQueueing(true);
    setQueueMessage(
      "Adding plants to the overnight queue...",
    );

    try {
      const result =
        await queueCataloguePlants(
          selected,
        );

      setQueueMessage(
        `${result.added} queued · ${result.skippedExisting} already in plant database · ${result.skippedQueued} already queued`,
      );

      setSelected([]);
      await refreshQueue();
    } catch (error) {
      setQueueMessage(
        error instanceof Error
          ? error.message
          : "Could not add plants to queue.",
      );
    } finally {
      setIsQueueing(false);
    }
  }

  return (
    <>
      <section className="admin-panel admin-form-section">
        <p className="admin-eyebrow">
          OVERNIGHT DATABASE BUILD
        </p>

        <h2>Plant research queue</h2>

        <p>
          Select plants from the curated
          catalogue. Adding them here does not
          publish anything — every completed
          plant will become a draft for review.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "0.75rem",
            marginTop: "1.5rem",
          }}
        >
          {[
            ["Pending", counts.pending],
            ["Processing", counts.processing],
            ["Completed", counts.completed],
            ["Failed", counts.failed],
            ["Skipped", counts.skipped],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              style={{
                padding: "1rem",
                border:
                  "1px solid rgba(13,41,34,.12)",
                borderRadius: "12px",
              }}
            >
              <strong
                style={{
                  display: "block",
                  fontSize: "1.5rem",
                }}
              >
                {value}
              </strong>

              <span>{label}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            marginTop: "1.5rem",
          }}
        >
          <button
            type="button"
            className="admin-secondary-button"
            onClick={selectAllAvailable}
            disabled={
              isQueueing ||
              availableCatalogue.length ===
                0
            }
          >
            Select all available
          </button>

          <button
            type="button"
            className="admin-primary-button"
            onClick={addToQueue}
            disabled={
              isQueueing ||
              selected.length === 0
            }
          >
            {isQueueing
              ? "Adding..."
              : `Add ${selected.length} to queue`}
          </button>

          <button
            type="button"
            className="admin-secondary-button"
            onClick={() =>
              void refreshQueue()
            }
            disabled={isLoadingQueue}
          >
            Refresh queue
          </button>
        </div>

        {queueMessage && (
          <p
            style={{
              marginTop: "1rem",
            }}
          >
            {queueMessage}
          </p>
        )}

        <div
          style={{
            marginTop: "1.5rem",
            display: "grid",
            gap: "0.65rem",
          }}
        >
          {pondPlantCatalogue.map(
            (plant) => {
              const unavailable =
                queuedNames.has(
                  plant.name.toLowerCase(),
                );

              return (
                <label
                  key={plant.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.8rem 1rem",
                    border:
                      "1px solid rgba(13,41,34,.1)",
                    borderRadius: "10px",
                    opacity: unavailable
                      ? 0.5
                      : 1,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(
                      plant.name,
                    )}
                    disabled={
                      unavailable ||
                      isQueueing
                    }
                    onChange={() =>
                      togglePlant(
                        plant.name,
                      )
                    }
                  />

                  <span
                    style={{
                      flex: 1,
                    }}
                  >
                    <strong>
                      {plant.name}
                    </strong>
                  </span>

                  <small>
                    {unavailable
                      ? "Already queued"
                      : plant.category}
                  </small>
                </label>
              );
            },
          )}
        </div>
      </section>

      <section
        className="admin-panel admin-form-section"
        style={{
          marginTop: "1.5rem",
        }}
      >
        <p className="admin-eyebrow">
          QUICK BUILDER
        </p>

        <h2>
          Generate up to three now
        </h2>

        <p>
          Keep the original manual batch
          builder for small immediate jobs.
        </p>

        <div
          style={{
            marginTop: "1.5rem",
            display: "grid",
            gap: "1rem",
          }}
        >
          {names.map((name, index) => (
            <label
              className="admin-field"
              key={index}
            >
              <span>
                Plant {index + 1}
              </span>

              <input
                value={name}
                disabled={isGenerating}
                onChange={(event) =>
                  updateName(
                    index,
                    event.target.value,
                  )
                }
                placeholder={
                  index === 0
                    ? "e.g. Water forget-me-not"
                    : index === 1
                      ? "e.g. Marsh marigold"
                      : "e.g. Water mint"
                }
              />
            </label>
          ))}

          <button
            type="button"
            className="admin-primary-button"
            disabled={isGenerating}
            onClick={generate}
            style={{
              justifySelf: "start",
            }}
          >
            {isGenerating
              ? "Researching..."
              : "Generate draft batch"}
          </button>
        </div>

        {message && (
          <p
            style={{
              marginTop: "1rem",
            }}
          >
            {message}
          </p>
        )}
      </section>

      {results.length > 0 && (
        <section
          className="admin-panel"
          style={{
            marginTop: "1.5rem",
          }}
        >
          <p className="admin-eyebrow">
            QUICK BUILDER RESULTS
          </p>

          <h2>Batch results</h2>

          <div
            style={{
              display: "grid",
              gap: "0.75rem",
              marginTop: "1rem",
            }}
          >
            {results.map(
              (result, index) => (
                <div
                  key={`${result.inputName}-${index}`}
                  style={{
                    border:
                      "1px solid rgba(13,41,34,.12)",
                    borderRadius: "12px",
                    padding: "1rem",
                  }}
                >
                  <strong>
                    {result.plantName ??
                      result.inputName}
                  </strong>

                  <p>
                    {result.status.toUpperCase()}
                    {" — "}
                    {result.message}
                  </p>

                  {result.plantId && (
                    <Link
                      href={`/admin/plants/${result.plantId}/edit`}
                    >
                      Review plant →
                    </Link>
                  )}
                </div>
              ),
            )}
          </div>
        </section>
      )}

      {queue.length > 0 && (
        <section
          className="admin-panel"
          style={{
            marginTop: "1.5rem",
          }}
        >
          <p className="admin-eyebrow">
            QUEUE
          </p>

          <h2>Generation jobs</h2>

          <div
            style={{
              display: "grid",
              gap: "0.65rem",
              marginTop: "1rem",
            }}
          >
            {queue.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "0.8rem 1rem",
                  border:
                    "1px solid rgba(13,41,34,.1)",
                  borderRadius: "10px",
                }}
              >
                <div>
                  <strong>
                    {item.plant_name}
                  </strong>

                  {item.error_message && (
                    <div>
                      <small>
                        {item.error_message}
                      </small>
                    </div>
                  )}
                </div>

                <div
                  style={{
                    textAlign: "right",
                  }}
                >
                  <strong>
                    {item.status.toUpperCase()}
                  </strong>

                  {item.plant_id && (
                    <div>
                      <Link
                        href={`/admin/plants/${item.plant_id}/edit`}
                      >
                        Review →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
