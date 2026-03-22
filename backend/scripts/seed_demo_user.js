import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "..", "data", "db.json");

const DEMO_EMAIL = process.env.DEMO_EMAIL || "demo@startgenie.ai";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "StartGenie@123";
const DEMO_NAME = process.env.DEMO_NAME || "Demo User";

async function readDb() {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return { users: [], chats: [], libraryFiles: [], blueprints: [] };
  }
}

async function writeDb(db) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

function defaultAssistantMessage() {
  return {
    id: Date.now(),
    sender: "ai",
    text: "Hello! I'm your startup AI Advisor. Ask me anything.",
    createdAt: new Date().toISOString(),
  };
}

async function main() {
  const db = await readDb();
  const email = String(DEMO_EMAIL).trim().toLowerCase();

  let user = (db.users || []).find((u) => u.email === email);
  if (!user) {
    user = {
      id: Date.now().toString(),
      name: DEMO_NAME,
      email,
      passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
      emailVerified: true,
      about: "",
      allowAnalytics: false,
      avatarUrl: "",
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    db.chats = db.chats || [];
    db.chats.push({
      id: Date.now().toString(),
      userId: user.id,
      name: "Chat 1",
      messages: [defaultAssistantMessage()],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } else {
    user.passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
    user.emailVerified = true;
    if (!user.name) user.name = DEMO_NAME;
  }

  await writeDb(db);

  process.stdout.write("Demo user ready:\n");
  process.stdout.write(`- Email: ${email}\n`);
  process.stdout.write(`- Password: ${DEMO_PASSWORD}\n`);
  process.stdout.write(`DB: ${DB_PATH}\n`);
}

main().catch((err) => {
  process.stderr.write(`${err?.stack || err}\n`);
  process.exit(1);
});

