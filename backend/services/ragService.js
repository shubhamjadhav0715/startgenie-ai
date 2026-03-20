import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { ensureVectorIndex, queryVectorIndex } from "./vectorStoreService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KB_PATH = path.join(__dirname, "..", "data", "knowledge-base.json");
const PUBLIC_KB_PATH = path.join(__dirname, "..", "data", "public-knowledge-base.json");

let kbPromise = null;
const indexPromiseByModel = new Map();

export async function loadKnowledgeBase() {
  if (!kbPromise) {
    kbPromise = (async () => {
      const internalRaw = await fs.readFile(KB_PATH, "utf8");
      const internal = JSON.parse(internalRaw);
      let publicKb = [];
      try {
        const publicRaw = await fs.readFile(PUBLIC_KB_PATH, "utf8");
        publicKb = JSON.parse(publicRaw);
      } catch {
        publicKb = [];
      }
      return [...(Array.isArray(internal) ? internal : []), ...(Array.isArray(publicKb) ? publicKb : [])];
    })();
  }
  return kbPromise;
}

async function getVectorIndex(openai, embeddingModel) {
  if (!openai) return null;
  const cacheKey = `${embeddingModel}`;
  if (!indexPromiseByModel.has(cacheKey)) {
    indexPromiseByModel.set(
      cacheKey,
      (async () => {
        const chunks = await loadKnowledgeBase();
        return ensureVectorIndex({ openai, embeddingModel, chunks });
      })()
    );
  }
  return indexPromiseByModel.get(cacheKey);
}

export async function retrieveChunks({ openai, embeddingModel, query, topK = 5 }) {
  if (!openai) return [];
  const kbIndex = await getVectorIndex(openai, embeddingModel);
  if (!kbIndex) return [];
  const ranked = await queryVectorIndex({
    openai,
    embeddingModel,
    index: kbIndex,
    query,
    topK,
  });
  return ranked.map((x) => ({
    id: x.id,
    title: x.title,
    content: x.content,
    score: Number((x.score || 0).toFixed(4)),
    tags: x.tags || [],
  }));
}
