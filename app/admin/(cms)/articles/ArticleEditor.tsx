"use client";

import {
  useRef,
  useState,
} from "react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { createClient } from "@/lib/supabase/client";
import { createArticle, updateArticle } from "./actions";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type ArticleSection = {
  id: string;
  eyebrow: string;
  headline: string;
  body: string;
};

type InitialArticle = {
  id: string;
  title: string;
  slug: string;
  content_type: string;
  category_id: string | null;
  excerpt: string | null;
  intro: string | null;
  sections: {
    eyebrow?: string;
    headline?: string;
    body?: string;
  }[] | null;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  hero_image_credit: string | null;
  seo_title: string | null;
  meta_description: string | null;
  status: string;
  is_featured: boolean;
};

type ArticleEditorProps = {
  categories: Category[];
  initialArticle?: InitialArticle;
};

function makeSection(): ArticleSection {
  return {
    id: crypto.randomUUID(),
    eyebrow: "",
    headline: "",
    body: "",
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function safeFileName(name: string) {
  const extension =
    name.split(".").pop()?.toLowerCase() ||
    "jpg";

  const base = name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

  return `${base || "hero"}-${Date.now()}.${extension}`;
}

export default function ArticleEditor({
  categories,
  initialArticle,
}: ArticleEditorProps) {
  const heroInputRef =
    useRef<HTMLInputElement>(null);

  const [title, setTitle] =
    useState(initialArticle?.title ?? "");

  const [slug, setSlug] =
    useState(initialArticle?.slug ?? "");

  const [slugEdited, setSlugEdited] =
    useState(Boolean(initialArticle));

  const [sections, setSections] =
    useState<ArticleSection[]>(
      initialArticle?.sections?.length
        ? initialArticle.sections.map((section) => ({
            id: crypto.randomUUID(),
            eyebrow: section.eyebrow ?? "",
            headline: section.headline ?? "",
            body: section.body ?? "",
          }))
        : [makeSection()],
    );

  const [heroImageUrl, setHeroImageUrl] =
    useState(initialArticle?.hero_image_url ?? "");

  const [heroUploading, setHeroUploading] =
    useState(false);

  const [heroMessage, setHeroMessage] =
    useState("");

  const [seoTitle, setSeoTitle] =
    useState(initialArticle?.seo_title ?? "");

  const [
    metaDescription,
    setMetaDescription,
  ] = useState(initialArticle?.meta_description ?? "");

  function updateTitle(value: string) {
    setTitle(value);

    if (!slugEdited) {
      setSlug(slugify(value));
    }
  }

  function updateSlug(value: string) {
    setSlugEdited(true);
    setSlug(slugify(value));
  }

  function updateSection(
    id: string,
    key:
      | "eyebrow"
      | "headline"
      | "body",
    value: string,
  ) {
    setSections((current) =>
      current.map((section) =>
        section.id === id
          ? {
              ...section,
              [key]: value,
            }
          : section,
      ),
    );
  }

  function addSection() {
    setSections((current) => [
      ...current,
      makeSection(),
    ]);
  }

  function removeSection(id: string) {
    setSections((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter(
        (section) =>
          section.id !== id,
      );
    });
  }

  function moveSection(
    index: number,
    direction: -1 | 1,
  ) {
    const target =
      index + direction;

    if (
      target < 0 ||
      target >= sections.length
    ) {
      return;
    }

    setSections((current) => {
      const next = [...current];

      const [moved] =
        next.splice(index, 1);

      next.splice(
        target,
        0,
        moved,
      );

      return next;
    });
  }

  async function uploadHero(
    file: File,
  ) {
    if (
      !file.type.startsWith("image/")
    ) {
      setHeroMessage(
        "Please choose an image file.",
      );
      return;
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      setHeroMessage(
        "Please use an image smaller than 10 MB.",
      );
      return;
    }

    setHeroUploading(true);
    setHeroMessage("");

    try {
      const supabase =
        createClient();

      const path =
        `heroes/${safeFileName(file.name)}`;

      const { error } =
        await supabase.storage
          .from("article-images")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
          });

      if (error) {
        throw error;
      }

      const {
        data: publicUrlData,
      } = supabase.storage
        .from("article-images")
        .getPublicUrl(path);

      setHeroImageUrl(
        publicUrlData.publicUrl,
      );
    } catch (error) {
      setHeroMessage(
        error instanceof Error
          ? error.message
          : "Hero image upload failed.",
      );
    } finally {
      setHeroUploading(false);

      if (heroInputRef.current) {
        heroInputRef.current.value =
          "";
      }
    }
  }

  return (
    <form
      action={
        initialArticle
          ? updateArticle.bind(null, initialArticle.id)
          : createArticle
      }
      className="article-editor-form"
    >
      <input
        type="hidden"
        name="sections"
        value={JSON.stringify(
          sections.map(
            ({
              eyebrow,
              headline,
              body,
            }) => ({
              eyebrow,
              headline,
              body,
            }),
          ),
        )}
      />

      <input
        type="hidden"
        name="hero_image_url"
        value={heroImageUrl}
      />

      <div className="article-editor-layout">
        <div className="article-editor-main">
          <section className="admin-editor-card">
            <div className="admin-editor-card-heading">
              <div>
                <p className="admin-eyebrow">
                  ARTICLE
                </p>
                <h2>
                  Main details
                </h2>
              </div>
            </div>

            <div className="admin-form-grid">
              <label className="admin-field admin-field-full">
                <span>Title</span>

                <input
                  type="text"
                  name="title"
                  value={title}
                  onChange={(event) =>
                    updateTitle(
                      event.target.value,
                    )
                  }
                  placeholder="How to keep pond water clear"
                  required
                />
              </label>

              <label className="admin-field admin-field-full">
                <span>Slug</span>

                <div className="admin-slug-field">
                  <span>
                    pondstuff.co.uk/
                  </span>

                  <input
                    type="text"
                    name="slug"
                    value={slug}
                    onChange={(event) =>
                      updateSlug(
                        event.target.value,
                      )
                    }
                    placeholder="how-to-keep-pond-water-clear"
                  />
                </div>

                <small>
                  Generated from the title,
                  but you can edit it.
                </small>
              </label>

              <label className="admin-field">
                <span>
                  Content type
                </span>

                <select
                  name="content_type"
                  defaultValue={
                    initialArticle?.content_type ?? "guide"
                  }
                >
                  <option value="guide">
                    Guide
                  </option>
                  <option value="problem">
                    Pond Problem
                  </option>
                  <option value="equipment">
                    Equipment
                  </option>
                  <option value="feature">
                    Feature
                  </option>
                </select>
              </label>

              <label className="admin-field">
                <span>Category</span>

                <select
                  name="category_id"
                  defaultValue={
                    initialArticle?.category_id ?? ""
                  }
                >
                  <option value="">
                    No category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="admin-field admin-field-full">
                <span>
                  Excerpt
                </span>

                <textarea
                  name="excerpt"
                  rows={3}
                  defaultValue={initialArticle?.excerpt ?? ""}
                  placeholder="A short summary used on cards, category pages and search previews."
                />
              </label>

              <label className="admin-field admin-field-full">
                <span>
                  Introduction
                </span>

                <textarea
                  name="intro"
                  rows={6}
                  defaultValue={initialArticle?.intro ?? ""}
                  placeholder="Opening paragraphs for the article..."
                />
              </label>
            </div>
          </section>

          <section className="admin-editor-card">
            <div className="admin-editor-card-heading">
              <div>
                <p className="admin-eyebrow">
                  CONTENT
                </p>
                <h2>
                  Article sections
                </h2>
                <p>
                  Build the article in
                  structured sections.
                  Each body has the full
                  rich editor.
                </p>
              </div>

              <button
                type="button"
                className="admin-secondary-button"
                onClick={addSection}
              >
                + Add section
              </button>
            </div>

            <div className="article-sections">
              {sections.map(
                (section, index) => (
                  <div
                    key={section.id}
                    className="article-section-card"
                  >
                    <div className="article-section-top">
                      <strong>
                        Section{" "}
                        {index + 1}
                      </strong>

                      <div className="article-section-actions">
                        <button
                          type="button"
                          title="Move section up"
                          disabled={
                            index === 0
                          }
                          onClick={() =>
                            moveSection(
                              index,
                              -1,
                            )
                          }
                        >
                          ↑
                        </button>

                        <button
                          type="button"
                          title="Move section down"
                          disabled={
                            index ===
                            sections.length -
                              1
                          }
                          onClick={() =>
                            moveSection(
                              index,
                              1,
                            )
                          }
                        >
                          ↓
                        </button>

                        <button
                          type="button"
                          title="Remove section"
                          disabled={
                            sections.length ===
                            1
                          }
                          onClick={() =>
                            removeSection(
                              section.id,
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="admin-form-grid">
                      <label className="admin-field">
                        <span>
                          Eyebrow
                        </span>

                        <input
                          type="text"
                          value={
                            section.eyebrow
                          }
                          onChange={(
                            event,
                          ) =>
                            updateSection(
                              section.id,
                              "eyebrow",
                              event
                                .target
                                .value,
                            )
                          }
                          placeholder="POND WATER"
                        />
                      </label>

                      <label className="admin-field">
                        <span>
                          Headline
                        </span>

                        <input
                          type="text"
                          value={
                            section.headline
                          }
                          onChange={(
                            event,
                          ) =>
                            updateSection(
                              section.id,
                              "headline",
                              event
                                .target
                                .value,
                            )
                          }
                          placeholder="Why does pond water turn green?"
                        />
                      </label>

                      <div className="admin-field admin-field-full">
                        <span>
                          Body
                        </span>

                        <RichTextEditor
                          value={
                            section.body
                          }
                          onChange={(
                            value,
                          ) =>
                            updateSection(
                              section.id,
                              "body",
                              value,
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>

            <button
              type="button"
              className="admin-add-section-button"
              onClick={addSection}
            >
              + Add another section
            </button>
          </section>

          <section className="admin-editor-card">
            <div className="admin-editor-card-heading">
              <div>
                <p className="admin-eyebrow">
                  SEARCH
                </p>
                <h2>SEO</h2>
              </div>
            </div>

            <div className="admin-form-grid">
              <label className="admin-field admin-field-full">
                <span>
                  SEO title
                </span>

                <input
                  type="text"
                  name="seo_title"
                  value={seoTitle}
                  onChange={(event) =>
                    setSeoTitle(
                      event.target.value,
                    )
                  }
                  placeholder="Search engine title"
                />

                <small>
                  {seoTitle.length}{" "}
                  characters
                </small>
              </label>

              <label className="admin-field admin-field-full">
                <span>
                  Meta description
                </span>

                <textarea
                  name="meta_description"
                  rows={4}
                  value={
                    metaDescription
                  }
                  onChange={(event) =>
                    setMetaDescription(
                      event.target.value,
                    )
                  }
                  placeholder="Describe the article for search results..."
                />

                <small>
                  {
                    metaDescription.length
                  }{" "}
                  characters
                </small>
              </label>
            </div>
          </section>
        </div>

        <aside className="article-editor-sidebar">
          <section className="admin-editor-card article-publish-card">
            <p className="admin-eyebrow">
              PUBLISHING
            </p>

            <h2>Publish</h2>

            <label className="admin-checkbox-field">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={initialArticle?.is_featured ?? false}
              />

              <span>
                <strong>
                  Featured article
                </strong>

                <small>
                  Give this article
                  priority in featured
                  areas.
                </small>
              </span>
            </label>

            <div className="article-publish-actions">
              {initialArticle?.status === "published" ? (
                <>
                  <button
                    type="submit"
                    name="publish_intent"
                    value="unpublish"
                    className="admin-secondary-button"
                  >
                    Unpublish
                  </button>

                  <button
                    type="submit"
                    name="publish_intent"
                    value="publish"
                    className="admin-primary-button admin-publish-button"
                  >
                    Save changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="submit"
                    name="publish_intent"
                    value="draft"
                    className="admin-secondary-button"
                  >
                    Save draft
                  </button>

                  <button
                    type="submit"
                    name="publish_intent"
                    value="publish"
                    className="admin-primary-button admin-publish-button"
                  >
                    Publish
                  </button>
                </>
              )}
            </div>
          </section>

          <section className="admin-editor-card">
            <p className="admin-eyebrow">
              MEDIA
            </p>

            <h2>Hero image</h2>

            {heroImageUrl ? (
              <div className="admin-hero-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroImageUrl}
                  alt=""
                />

                <button
                  type="button"
                  onClick={() =>
                    setHeroImageUrl(
                      "",
                    )
                  }
                >
                  Remove image
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="admin-image-upload"
                disabled={
                  heroUploading
                }
                onClick={() =>
                  heroInputRef.current?.click()
                }
              >
                <strong>
                  {heroUploading
                    ? "Uploading…"
                    : "+ Upload hero image"}
                </strong>

                <small>
                  JPG, PNG or WebP.
                  Maximum 10 MB.
                </small>
              </button>
            )}

            <input
              ref={heroInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => {
                const file =
                  event.target.files?.[0];

                if (file) {
                  void uploadHero(
                    file,
                  );
                }
              }}
            />

            {heroMessage && (
              <p className="admin-upload-error">
                {heroMessage}
              </p>
            )}

            <div className="admin-form-grid admin-media-fields">
              <label className="admin-field admin-field-full">
                <span>
                  Image alt text
                </span>

                <input
                  type="text"
                  name="hero_image_alt"
                  defaultValue={initialArticle?.hero_image_alt ?? ""}
                  placeholder="Describe the image"
                />
              </label>

              <label className="admin-field admin-field-full">
                <span>
                  Image credit
                </span>

                <input
                  type="text"
                  name="hero_image_credit"
                  defaultValue={initialArticle?.hero_image_credit ?? ""}
                  placeholder="Photographer / source"
                />
              </label>
            </div>
          </section>
        </aside>
      </div>
    </form>
  );
}
