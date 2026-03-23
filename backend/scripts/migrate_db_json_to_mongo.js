import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { connectMongo, User, Chat, LibraryFile, Blueprint } from "../services/mongo.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "..", "data", "db.json");

function withIdFallback(items = []) {
  return (Array.isArray(items) ? items : []).filter((x) => x && typeof x === "object" && x.id);
}

async function main() {
  await connectMongo();

  const raw = await fs.readFile(DB_PATH, "utf8");
  const parsed = JSON.parse(raw);

  const users = withIdFallback(parsed.users);
  const chats = withIdFallback(parsed.chats);
  const libraryFiles = withIdFallback(parsed.libraryFiles);
  const blueprints = withIdFallback(parsed.blueprints);

  if (users.length) {
    await User.bulkWrite(
      users.map((u) => ({
        updateOne: { filter: { id: String(u.id) }, update: { $set: u }, upsert: true },
      }))
    );
  }

  if (chats.length) {
    await Chat.bulkWrite(
      chats.map((c) => ({
        updateOne: { filter: { id: String(c.id) }, update: { $set: c }, upsert: true },
      }))
    );
  }

  if (libraryFiles.length) {
    await LibraryFile.bulkWrite(
      libraryFiles.map((f) => ({
        updateOne: { filter: { id: String(f.id) }, update: { $set: f }, upsert: true },
      }))
    );
  }

  if (blueprints.length) {
    await Blueprint.bulkWrite(
      blueprints.map((b) => ({
        updateOne: { filter: { id: String(b.id) }, update: { $set: b }, upsert: true },
      }))
    );
  }

  console.log(
    `[migrate] upserted users=${users.length} chats=${chats.length} libraryFiles=${libraryFiles.length} blueprints=${blueprints.length}`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error("[migrate] failed:", err);
  process.exit(1);
});

