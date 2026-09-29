import sanitizeHtml from "sanitize-html";

export function sanitizePondStuffArticleHtml(
  html: string,
) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "h2",
      "h3",
      "strong",
      "b",
      "em",
      "i",
      "s",
      "strike",
      "code",
      "pre",
      "ul",
      "ol",
      "li",
      "blockquote",
      "br",
      "hr",
      "a",
      "img",
      "div",
      "iframe",
    ],

    allowedAttributes: {
      a: [
        "href",
        "target",
        "rel",
      ],
      img: [
        "src",
        "alt",
        "title",
        "class",
      ],
      div: [
        "class",
        "data-youtube-video",
      ],
      iframe: [
        "src",
        "width",
        "height",
        "allowfullscreen",
        "allow",
        "frameborder",
      ],
    },

    allowedClasses: {
      img: [
        "article-inline-image",
      ],
      div: [
        "article-youtube",
      ],
      iframe: [
        "article-youtube",
      ],
    },

    allowedSchemes: [
      "http",
      "https",
    ],

    allowedSchemesByTag: {
      img: [
        "https",
      ],
      iframe: [
        "https",
      ],
    },

    allowProtocolRelative: false,

    allowedIframeHostnames: [
      "www.youtube-nocookie.com",
      "youtube-nocookie.com",
      "www.youtube.com",
      "youtube.com",
    ],

  }).trim();
}
