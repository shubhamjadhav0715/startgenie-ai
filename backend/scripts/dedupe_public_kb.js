import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_KB_PATH = path.join(__dirname, "..", "data", "public-knowledge-base.json");

function baseId(id) {
  const raw = String(id || "");
  const m = raw.match(/^(public_.+?_\d+)(?:_\d+)?$/);
  return m ? m[1] : raw;
}

async function main() {
  const raw = await fs.readFile(PUBLIC_KB_PATH, "utf8");
  const parsed = JSON.parse(raw);
  const entries = Array.isArray(parsed) ? parsed : [];

  const seen = new Set();
  const deduped = [];
  entries.forEach((e) => {
    const key = baseId(e?.id);
    if (!key) return;
    if (seen.has(key)) return;
    seen.add(key);
    deduped.push(e);
  });

  await fs.writeFile(PUBLIC_KB_PATH, JSON.stringify(deduped, null, 2), "utf8");
  process.stdout.write(`Public KB deduped: ${entries.length} -> ${deduped.length}\n`);
  process.stdout.write(`Path: ${PUBLIC_KB_PATH}\n`);
}

main().catch((err) => {
  process.stderr.write(`${err?.stack || err}\n`);
  process.exit(1);
});

