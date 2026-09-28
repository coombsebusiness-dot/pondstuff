"use client";

import {
  useRef,
  useState,
} from "react";
import {
  EditorContent,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { createClient } from "@/lib/supabase/client";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

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

  return `${base || "image"}-${Date.now()}.${extension}`;
}

export default function RichTextEditor({
  value,
  onChange,
}: RichTextEditorProps) {
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [uploading, setUploading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit,

      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
        },
      }),

      Image.configure({
        allowBase64: false,
        HTMLAttributes: {
          class: "article-inline-image",
        },
      }),

      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          class: "article-youtube",
        },
      }),
    ],

    content: value,

    editorProps: {
      attributes: {
        class: "rich-editor-content",
      },
    },

    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  function setLink() {
    if (!editor) return;

    const previousUrl =
      editor.getAttributes("link").href ??
      "";

    const url = window.prompt(
      "Enter the link URL",
      previousUrl,
    );

    if (url === null) return;

    if (!url.trim()) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .unsetLink()
        .run();

      return;
    }

    let safeUrl = url.trim();

    if (
      !/^https?:\/\//i.test(safeUrl) &&
      !safeUrl.startsWith("/") &&
      !safeUrl.startsWith("#") &&
      !safeUrl.startsWith("mailto:") &&
      !safeUrl.startsWith("tel:")
    ) {
      safeUrl = `https://${safeUrl}`;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: safeUrl,
      })
      .run();
  }

  function addYouTube() {
    if (!editor) return;

    const url = window.prompt(
      "Paste the YouTube video URL",
    );

    if (!url?.trim()) return;

    const added = editor
      .chain()
      .focus()
      .setYoutubeVideo({
        src: url.trim(),
        width: 640,
        height: 360,
      })
      .run();

    if (!added) {
      setMessage(
        "That YouTube URL could not be added.",
      );
    } else {
      setMessage("");
    }
  }

  async function uploadImage(
    file: File,
  ) {
    if (!editor) return;

    if (!file.type.startsWith("image/")) {
      setMessage(
        "Please choose an image file.",
      );
      return;
    }

    const maxBytes =
      10 * 1024 * 1024;

    if (file.size > maxBytes) {
      setMessage(
        "Please use an image smaller than 10 MB.",
      );
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const supabase =
        createClient();

      const path =
        `articles/${safeFileName(file.name)}`;

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

      const alt =
        window.prompt(
          "Describe this image for accessibility and SEO",
          "",
        )?.trim() ?? "";

      editor
        .chain()
        .focus()
        .setImage({
          src: publicUrlData.publicUrl,
          alt,
        })
        .run();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Image upload failed.",
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value =
          "";
      }
    }
  }

  if (!editor) {
    return (
      <div className="rich-editor-loading">
        Loading editor…
      </div>
    );
  }

  return (
    <div className="rich-editor">
      <div className="rich-editor-toolbar">
        <div className="rich-editor-tool-group">
          <button
            type="button"
            title="Paragraph"
            className={
              editor.isActive(
                "paragraph",
              )
                ? "is-active"
                : ""
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .setParagraph()
                .run()
            }
          >
            P
          </button>

          <button
            type="button"
            title="Heading 2"
            className={
              editor.isActive(
                "heading",
                { level: 2 },
              )
                ? "is-active"
                : ""
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({
                  level: 2,
                })
                .run()
            }
          >
            H2
          </button>

          <button
            type="button"
            title="Heading 3"
            className={
              editor.isActive(
                "heading",
                { level: 3 },
              )
                ? "is-active"
                : ""
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({
                  level: 3,
                })
                .run()
            }
          >
            H3
          </button>
        </div>

        <div className="rich-editor-tool-group">
          <button
            type="button"
            title="Bold"
            className={
              editor.isActive("bold")
                ? "is-active"
                : ""
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleBold()
                .run()
            }
          >
            <strong>B</strong>
          </button>

          <button
            type="button"
            title="Italic"
            className={
              editor.isActive("italic")
                ? "is-active"
                : ""
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleItalic()
                .run()
            }
          >
            <em>I</em>
          </button>

          <button
            type="button"
            title="Strikethrough"
            className={
              editor.isActive("strike")
                ? "is-active"
                : ""
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleStrike()
                .run()
            }
          >
            S
          </button>

          <button
            type="button"
            title="Inline code"
            className={
              editor.isActive("code")
                ? "is-active"
                : ""
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleCode()
                .run()
            }
          >
            &lt;/&gt;
          </button>
        </div>

        <div className="rich-editor-tool-group">
          <button
            type="button"
            title="Bullet list"
            className={
              editor.isActive(
                "bulletList",
              )
                ? "is-active"
                : ""
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleBulletList()
                .run()
            }
          >
            • List
          </button>

          <button
            type="button"
            title="Numbered list"
            className={
              editor.isActive(
                "orderedList",
              )
                ? "is-active"
                : ""
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleOrderedList()
                .run()
            }
          >
            1. List
          </button>

          <button
            type="button"
            title="Pull quote / blockquote"
            className={
              editor.isActive(
                "blockquote",
              )
                ? "is-active"
                : ""
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleBlockquote()
                .run()
            }
          >
            ❝ Quote
          </button>
        </div>

        <div className="rich-editor-tool-group">
          <button
            type="button"
            title="Add or edit hyperlink"
            className={
              editor.isActive("link")
                ? "is-active"
                : ""
            }
            onClick={setLink}
          >
            🔗 Link
          </button>

          {editor.isActive("link") && (
            <button
              type="button"
              title="Remove hyperlink"
              onClick={() =>
                editor
                  .chain()
                  .focus()
                  .unsetLink()
                  .run()
              }
            >
              Unlink
            </button>
          )}

          <button
            type="button"
            title="Upload image"
            disabled={uploading}
            onClick={() =>
              fileInputRef.current?.click()
            }
          >
            {uploading
              ? "Uploading…"
              : "▧ Image"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const file =
                event.target.files?.[0];

              if (file) {
                void uploadImage(file);
              }
            }}
          />

          <button
            type="button"
            title="Embed YouTube video"
            onClick={addYouTube}
          >
            ▶ YouTube
          </button>
        </div>

        <div className="rich-editor-tool-group">
          <button
            type="button"
            title="Horizontal rule"
            onClick={() =>
              editor
                .chain()
                .focus()
                .setHorizontalRule()
                .run()
            }
          >
            ―
          </button>

          <button
            type="button"
            title="Undo"
            disabled={
              !editor.can().undo()
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .undo()
                .run()
            }
          >
            ↶
          </button>

          <button
            type="button"
            title="Redo"
            disabled={
              !editor.can().redo()
            }
            onClick={() =>
              editor
                .chain()
                .focus()
                .redo()
                .run()
            }
          >
            ↷
          </button>
        </div>
      </div>

      {message && (
        <div className="rich-editor-message">
          {message}
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
