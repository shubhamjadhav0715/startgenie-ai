import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import { ingestPublicSources, summarizeKnowledgeBase } from "../services/publicIngestService.js";
import { ensureVectorIndex } from "../services/vectorStoreService.js";
import { loadKnowledgeBase } from "../services/ragService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPORT_PATH = path.join(__dirname, "..", "data", "rag-validation-report.json");

async function main() {
  const sources = [
    { name: "Startup India", url: "https://www.startupindia.gov.in" },
    { name: "DPIIT", url: "https://dpiit.gov.in" },
    { name: "Invest India", url: "https://www.investindia.gov.in" },
    { name: "MSME", url: "https://msme.gov.in" },
    { name: "NITI Aayog", url: "https://www.niti.gov.in" },
  ];

  const maxPagesPerHost = Number(process.env.RAG_INGEST_MAX_PAGES_PER_HOST || "10");
  const maxDepth = Number(process.env.RAG_INGEST_MAX_DEPTH || "2");
  const minTextChars = Number(process.env.RAG_INGEST_MIN_TEXT_CHARS || "700");

  const ingest = await ingestPublicSources({
    sources,
    maxPagesPerHost,
    maxDepth,
    minTextChars,
  });

  const openaiKey = process.env.OPENAI_API_KEY || "";
  const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

  let indexStatus = { rebuilt: false, reason: "OPENAI_API_KEY missing" };
  if (openaiKey) {
    const openai = new OpenAI({ apiKey: openaiKey });
    const chunks = await loadKnowledgeBase();
    await ensureVectorIndex({ openai, embeddingModel, chunks });
    indexStatus = { rebuilt: true, embeddingModel };
  }

  const kbSummary = await summarizeKnowledgeBase();
  const report = {
    type: "rag_validation_report",
    generatedAt: new Date().toISOString(),
    ingest,
    indexStatus,
    knowledgeBase: kbSummary,
    notes: [
      "This ingestion uses public HTML pages and extracts main text; PDF parsing is intentionally skipped for now.",
      "Provide specific PDF/report links if you want those ingested as well (requires a PDF text extraction step).",
    ],
  };

  await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
  process.stdout.write(`RAG validation report written: ${REPORT_PATH}\n`);
  process.stdout.write(`KB entries: ${kbSummary.totalEntries}\n`);
  process.stdout.write(`Pages indexed: ${ingest.pagesIndexed}, chunks added: ${ingest.chunksAdded}\n`);
  process.stdout.write(`Vector index rebuilt: ${indexStatus.rebuilt ? "yes" : "no"}\n`);
}

main().catch((err) => {
  process.stderr.write(`${err?.stack || err}\n`);
  process.exit(1);
});
