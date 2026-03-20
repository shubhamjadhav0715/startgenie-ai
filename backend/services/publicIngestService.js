import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const INTERNAL_KB_PATH = path.join(__dirname, "..", "data", "knowledge-base.json");
const PUBLIC_KB_PATH = path.join(__dirname, "..", "data", "public-knowledge-base.json");

function normalizeWhitespace(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function decodeHtmlEntities(text) {
  return String(text || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function stripHtmlToText(html) {
  const raw = String(html || "");
  const withoutNoise = raw
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  const withNewlines = withoutNoise
    .replace(/<\/(p|div|section|article|li|h1|h2|h3|h4|h5|h6|br)\s*>/gi, "\n")
    .replace(/<(p|div|section|article|li|h1|h2|h3|h4|h5|h6|br)\b[^>]*>/gi, "\n");
  const text = withNewlines.replace(/<[^>]+>/g, " ");
  return normalizeWhitespace(decodeHtmlEntities(text));
}

function getHtmlTitle(html) {
  const m = String(html || "").match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const raw = m?.[1] ? m[1].replace(/\s+/g, " ").trim() : "";
  return decodeHtmlEntities(raw).trim();
}

function extractLinks(html, baseUrl) {
  const links = new Set();
  const re = /href\s*=\s*["']([^"']+)["']/gi;
  let match = null;
  while ((match = re.exec(String(html || "")))) {
    const href = String(match[1] || "").trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    try {
      const url = new URL(href, baseUrl);
      url.hash = "";
      links.add(url.toString());
    } catch {
      // ignore
    }
  }
  return Array.from(links);
}

function shouldSkipUrl(urlString) {
  const url = new URL(urlString);
  const ext = url.pathname.split(".").pop()?.toLowerCase();
  const blocked = new Set([
    "jpg",
    "jpeg",
    "png",
    "gif",
    "svg",
    "webp",
    "mp4",
    "mov",
    "avi",
    "mp3",
    "pdf",
    "zip",
    "rar",
    "7z",
    "doc",
    "docx",
    "ppt",
    "pptx",
    "xls",
    "xlsx",
  ]);
  if (blocked.has(ext)) return true;
  if (url.pathname.length > 170) return true;
  return false;
}

function isRelevantPath(pathname) {
  const p = String(pathname || "").toLowerCase();
  return [
    "scheme",
    "policy",
    "recognition",
    "startup",
    "benefit",
    "support",
    "fund",
    "incubat",
    "report",
    "publication",
    "guideline",
    "program",
    "initiative",
    "msme",
  ].some((k) => p.includes(k));
}

async function fetchHtml(url, { timeoutMs = 12000 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "StartGenieAI-RAG-Ingest/1.0 (+local-development)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    const contentType = String(res.headers.get("content-type") || "");
    if (!res.ok) return { ok: false, status: res.status, contentType, html: "" };
    if (!contentType.toLowerCase().includes("text/html")) return { ok: false, status: res.status, contentType, html: "" };
    const html = await res.text();
    return { ok: true, status: res.status, contentType, html };
  } catch (error) {
    return { ok: false, status: 0, contentType: "", html: "", error: String(error?.message || error) };
  } finally {
    clearTimeout(timeout);
  }
}

function chunkText(text, { maxChars = 1200, overlap = 120 } = {}) {
  const t = normalizeWhitespace(text);
  if (!t) return [];
  const chunks = [];
  let start = 0;
  while (start < t.length) {
    const end = Math.min(t.length, start + maxChars);
    const slice = t.slice(start, end);
    chunks.push(slice);
    if (end >= t.length) break;
    start = Math.max(0, end - overlap);
  }
  return chunks;
}

function safeIdPart(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

async function readJsonArray(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJson(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export async function ingestPublicSources({
  sources,
  maxPagesPerHost = 10,
  maxDepth = 2,
  minTextChars = 700,
} = {}) {
  if (!Array.isArray(sources) || sources.length === 0) {
    throw new Error("sources must be a non-empty array of { name, url } objects.");
  }

  const normalizedSources = sources.map((s) => ({
    name: String(s?.name || "").trim() || new URL(String(s?.url)).hostname,
    url: String(s?.url || "").trim(),
  }));

  const results = {
    startedAt: new Date().toISOString(),
    sources: [],
    pagesFetched: 0,
    pagesIndexed: 0,
    chunksAdded: 0,
    skipped: [],
    errors: [],
  };

  const existingKb = await readJsonArray(PUBLIC_KB_PATH);
  const existingIds = new Set(existingKb.map((x) => x?.id).filter(Boolean));
  const newEntries = [];

  for (const source of normalizedSources) {
    const seedUrl = new URL(source.url);
    const host = seedUrl.hostname;

    const hostState = {
      name: source.name,
      host,
      seedUrl: seedUrl.toString(),
      fetched: 0,
      indexed: 0,
      chunks: 0,
      urls: [],
    };

    const visited = new Set();
    const queue = [{ url: seedUrl.toString(), depth: 0, priority: 0 }];

    while (queue.length && hostState.fetched < maxPagesPerHost) {
      queue.sort((a, b) => (a.priority - b.priority) || (a.depth - b.depth));
      const next = queue.shift();
      if (!next) break;
      if (visited.has(next.url)) continue;
      visited.add(next.url);

      let urlObj = null;
      try {
        urlObj = new URL(next.url);
      } catch {
        continue;
      }
      if (urlObj.hostname !== host) continue;
      if (shouldSkipUrl(urlObj.toString())) continue;

      const fetched = await fetchHtml(urlObj.toString());
      hostState.fetched += 1;
      results.pagesFetched += 1;

      if (!fetched.ok) {
        results.skipped.push({
          url: urlObj.toString(),
          reason: fetched.error ? `fetch_error:${fetched.error}` : `fetch_status:${fetched.status}`,
        });
        continue;
      }

      const title = getHtmlTitle(fetched.html) || `${source.name} - ${urlObj.pathname || "/"}`;
      const text = stripHtmlToText(fetched.html);
      if (text.length < minTextChars) {
        results.skipped.push({ url: urlObj.toString(), reason: `too_short:${text.length}` });
      } else {
        const chunks = chunkText(text, { maxChars: 1200, overlap: 140 });
        chunks.forEach((content, idx) => {
          const idBase = `public_${safeIdPart(host)}_${safeIdPart(urlObj.pathname || "home")}_${idx + 1}`;
          if (existingIds.has(idBase)) {
            return;
          }
          const id = idBase;

          existingIds.add(id);
          newEntries.push({
            id,
            title,
            tags: ["public", "rag", `source:${host}`, `site:${source.name}`],
            content,
            sourceUrl: urlObj.toString(),
            sourceHost: host,
            updatedAt: new Date().toISOString(),
          });
          hostState.chunks += 1;
          results.chunksAdded += 1;
        });
        hostState.indexed += 1;
        results.pagesIndexed += 1;
        hostState.urls.push(urlObj.toString());
      }

      if (next.depth >= maxDepth) continue;
      const links = extractLinks(fetched.html, urlObj.toString());
      links.forEach((link) => {
        try {
          const child = new URL(link);
          if (child.hostname !== host) return;
          if (shouldSkipUrl(child.toString())) return;
          const rel = isRelevantPath(child.pathname) ? 0 : 1;
          queue.push({ url: child.toString(), depth: next.depth + 1, priority: rel });
        } catch {
          // ignore
        }
      });
    }

    results.sources.push(hostState);
  }

  const merged = [...existingKb, ...newEntries];
  await writeJson(PUBLIC_KB_PATH, merged);

  results.finishedAt = new Date().toISOString();
  results.publicKnowledgeBasePath = PUBLIC_KB_PATH;
  results.totalKbEntries = merged.length;

  return results;
}

export async function summarizeKnowledgeBase() {
  const internalKb = await readJsonArray(INTERNAL_KB_PATH);
  const publicKb = await readJsonArray(PUBLIC_KB_PATH);
  const kb = [...internalKb, ...publicKb];

  const byHost = {};
  kb.forEach((entry) => {
    const host = entry?.sourceHost || "local";
    byHost[host] = (byHost[host] || 0) + 1;
  });
  return {
    internalKnowledgeBasePath: INTERNAL_KB_PATH,
    publicKnowledgeBasePath: PUBLIC_KB_PATH,
    totalEntries: kb.length,
    internalEntries: internalKb.length,
    publicEntries: publicKb.length,
    sources: Object.entries(byHost)
      .map(([host, count]) => ({ host, count }))
      .sort((a, b) => b.count - a.count),
  };
}
