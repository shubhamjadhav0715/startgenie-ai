import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VECTOR_INDEX_PATH = path.join(__dirname, "..", "data", "vector-index.json");

function cosineSimilarity(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function readJsonIfExists(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function ensureVectorIndex({ openai, embeddingModel, chunks }) {
  if (!openai) {
    throw new Error("OPENAI_API_KEY is missing on backend server.");
  }

  const existing = await readJsonIfExists(VECTOR_INDEX_PATH);
  const expectedIds = chunks.map((x) => x.id).sort().join("|");
  const existingIds = (existing?.entries || []).map((x) => x.id).sort().join("|");

  if (existing && existing.model === embeddingModel && expectedIds === existingIds) {
    return existing;
  }

  const embeds = await openai.embeddings.create({
    model: embeddingModel,
    input: chunks.map((x) => `${x.title}. ${x.content}. tags:${(x.tags || []).join(",")}`),
  });

  const index = {
    model: embeddingModel,
    createdAt: new Date().toISOString(),
    entries: chunks.map((chunk, idx) => ({
      id: chunk.id,
      title: chunk.title,
      tags: chunk.tags || [],
      content: chunk.content,
      embedding: embeds.data?.[idx]?.embedding || [],
    })),
  };

  await fs.writeFile(VECTOR_INDEX_PATH, JSON.stringify(index, null, 2), "utf8");
  return index;
}

export async function queryVectorIndex({ openai, embeddingModel, index, query, topK = 5 }) {
  const queryEmbedding = await openai.embeddings.create({
    model: embeddingModel,
    input: query,
  });

  const queryVector = queryEmbedding.data?.[0]?.embedding || [];
  return (index.entries || [])
    .map((entry) => ({
      ...entry,
      score: cosineSimilarity(queryVector, entry.embedding || []),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
