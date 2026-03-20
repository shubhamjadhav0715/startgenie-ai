import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INTERNAL_KB_PATH = path.join(__dirname, "..", "data", "knowledge-base.json");
const PUBLIC_KB_PATH = path.join(__dirname, "..", "data", "public-knowledge-base.json");

function isPublicEntry(entry) {
  if (!entry || typeof entry !== "object") return false;
  if (entry.sourceUrl || entry.sourceHost) return true;
  if (Array.isArray(entry.tags) && entry.tags.some((t) => String(t).toLowerCase().startsWith("source:") || String(t).toLowerCase() === "public")) {
    return true;
  }
  if (String(entry.id || "").startsWith("public_")) return true;
  return false;
}

async function readArray(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

async function main() {
  const internal = await readArray(INTERNAL_KB_PATH);
  const publicEntries = [];
  const keptInternal = [];

  internal.forEach((e) => {
    if (isPublicEntry(e)) publicEntries.push(e);
    else keptInternal.push(e);
  });

  await fs.writeFile(INTERNAL_KB_PATH, JSON.stringify(keptInternal, null, 2), "utf8");

  let existingPublic = [];
  try {
    existingPublic = await readArray(PUBLIC_KB_PATH);
  } catch {
    existingPublic = [];
  }

  const merged = [...existingPublic, ...publicEntries];
  const seen = new Set();
  const deduped = merged.filter((e) => {
    const id = String(e?.id || "");
    if (!id) return false;
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  await fs.writeFile(PUBLIC_KB_PATH, JSON.stringify(deduped, null, 2), "utf8");

  process.stdout.write(`Internal KB kept: ${keptInternal.length}\n`);
  process.stdout.write(`Public KB written: ${deduped.length}\n`);
  process.stdout.write(`Paths:\n- ${INTERNAL_KB_PATH}\n- ${PUBLIC_KB_PATH}\n`);
}

main().catch((err) => {
  process.stderr.write(`${err?.stack || err}\n`);
  process.exit(1);
});

