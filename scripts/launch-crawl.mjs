import { URL } from "node:url";

const BASE = "http://localhost:3000";
const MAX_CONCURRENCY = 8;

function normalise(value) {
  try {
    const url = new URL(value, BASE);

    if (url.origin !== BASE) {
      return null;
    }

    url.hash = "";
    url.search = "";

    let path = url.pathname;

    if (path.length > 1 && path.endsWith("/")) {
      path = path.slice(0, -1);
    }

    return `${BASE}${path || "/"}`;
  } catch {
    return null;
  }
}

function extractLinks(html) {
  const links = new Set();

  const regex =
    /href\s*=\s*["']([^"']+)["']/gi;

  let match;

  while ((match = regex.exec(html))) {
    const url = normalise(match[1]);

    if (url) {
      links.add(url);
    }
  }

  return [...links];
}

async function fetchPage(url) {
  try {
    const response = await fetch(url, {
      redirect: "manual",
      headers: {
        "User-Agent":
          "PondStuff-Launch-Crawler/1.0",
      },
    });

    return {
      url,
      status: response.status,
      location:
        response.headers.get("location"),
      contentType:
        response.headers.get("content-type") || "",
      body:
        response.headers
          .get("content-type")
          ?.includes("text/html")
          ? await response.text()
          : "",
    };
  } catch (error) {
    return {
      url,
      status: 0,
      location: null,
      contentType: "",
      body: "",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    };
  }
}

async function loadSitemap() {
  const response = await fetch(
    `${BASE}/sitemap.xml`,
  );

  if (!response.ok) {
    throw new Error(
      `Sitemap returned HTTP ${response.status}`,
    );
  }

  const xml = await response.text();

  const urls = [];
  const openTag = "<loc>";
  const closeTag = "</loc>";

  let position = 0;

  while (true) {
    const startIndex = xml.indexOf(
      openTag,
      position,
    );

    if (startIndex === -1) {
      break;
    }

    const contentStart =
      startIndex + openTag.length;

    const endIndex = xml.indexOf(
      closeTag,
      contentStart,
    );

    if (endIndex === -1) {
      break;
    }

    const value = xml
      .slice(contentStart, endIndex)
      .trim();

    let localValue = value;

    try {
      const sitemapUrl = new URL(value);

      if (
        sitemapUrl.hostname ===
        "pondstuff.co.uk"
      ) {
        localValue =
          `${BASE}${sitemapUrl.pathname}${sitemapUrl.search}`;
      }
    } catch {
      // Ignore malformed sitemap URLs.
    }

    const url = normalise(localValue);

    if (url) {
      urls.push(url);
    }

    position = endIndex + closeTag.length;
  }

  return urls;
}

async function runBatch(urls) {
  const results = [];
  let index = 0;

  async function worker() {
    while (true) {
      const current = index++;

      if (current >= urls.length) {
        return;
      }

      const result =
        await fetchPage(urls[current]);

      results.push(result);

      process.stdout.write(
        result.status
          ? `${result.status} ${result.url}\n`
          : `ERR  ${result.url}\n`,
      );
    }
  }

  await Promise.all(
    Array.from(
      {
        length: Math.min(
          MAX_CONCURRENCY,
          urls.length,
        ),
      },
      worker,
    ),
  );

  return results;
}

async function main() {
  console.log("");
  console.log(
    "========================================",
  );
  console.log(
    " PondStuff Launch Crawl",
  );
  console.log(
    "========================================",
  );
  console.log("");

  const sitemapUrls =
    await loadSitemap();

  console.log(
    `Sitemap URLs found: ${sitemapUrls.length}`,
  );

  const seedUrls = new Set([
    `${BASE}/`,
    ...sitemapUrls,
  ]);

  console.log(
    `Initial URLs to check: ${seedUrls.size}`,
  );
  console.log("");

  const checked = new Map();

  const firstPass =
    await runBatch([...seedUrls]);

  for (const result of firstPass) {
    checked.set(result.url, result);
  }

  const discovered = new Set();

  for (const result of firstPass) {
    if (
      result.status >= 200 &&
      result.status < 400 &&
      result.body
    ) {
      for (const link of extractLinks(
        result.body,
      )) {
        discovered.add(link);
      }
    }
  }

  const newLinks = [...discovered].filter(
    (url) => !checked.has(url),
  );

  console.log("");
  console.log(
    "========================================",
  );
  console.log(
    " Additional Internal Links",
  );
  console.log(
    "========================================",
  );
  console.log("");

  console.log(
    `Additional URLs discovered: ${newLinks.length}`,
  );
  console.log("");

  if (newLinks.length) {
    const secondPass =
      await runBatch(newLinks);

    for (const result of secondPass) {
      checked.set(result.url, result);
    }
  }

  const broken = [
    ...checked.values(),
  ].filter(
    (result) =>
      result.status === 0 ||
      result.status >= 400,
  );

  const redirects = [
    ...checked.values(),
  ].filter(
    (result) =>
      result.status >= 300 &&
      result.status < 400,
  );

  const successful = [
    ...checked.values(),
  ].filter(
    (result) =>
      result.status >= 200 &&
      result.status < 300,
  );

  console.log("");
  console.log(
    "========================================",
  );
  console.log(
    " FINAL RESULT",
  );
  console.log(
    "========================================",
  );
  console.log("");

  console.log(
    `URLs checked: ${checked.size}`,
  );

  console.log(
    `Successful:   ${successful.length}`,
  );

  console.log(
    `Redirects:    ${redirects.length}`,
  );

  console.log(
    `Broken:       ${broken.length}`,
  );

  if (broken.length) {
    console.log("");
    console.log(
      "===== BROKEN URLS =====",
    );

    for (const result of broken) {
      console.log(
        `${result.status || "ERROR"} ${result.url}`,
      );

      if (result.error) {
        console.log(
          `  ${result.error}`,
        );
      }
    }
  }

  if (redirects.length) {
    console.log("");
    console.log(
      "===== REDIRECTS =====",
    );

    for (const result of redirects) {
      console.log(
        `${result.status} ${result.url} -> ${result.location || "unknown"}`,
      );
    }
  }

  console.log("");

  if (broken.length) {
    process.exitCode = 1;
  } else {
    console.log(
      "🎉 No broken URLs found.",
    );
  }
}

main().catch((error) => {
  console.error("");
  console.error(
    "Crawler failed:",
    error,
  );
  process.exitCode = 1;
});
