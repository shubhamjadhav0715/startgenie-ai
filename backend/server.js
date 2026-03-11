import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import OpenAI from "openai";
import { fileURLToPath } from "url";
import {
  generateStructuredBlueprint,
  buildTextExport,
  buildDocxExport,
  buildPdfExport,
  buildPptxExport,
} from "./services/blueprintService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "startgenie_dev_secret_change_me";
const DB_PATH = path.join(__dirname, "data", "db.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");
const OPENAI_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4.1-mini";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(UPLOADS_DIR));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}_${safeName}`);
  },
});
const upload = multer({ storage });
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const EMPTY_DB = {
  users: [],
  chats: [],
  libraryFiles: [],
  blueprints: [],
};
let writeQueue = Promise.resolve();

async function readDb() {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return {
      users: parsed.users || [],
      chats: parsed.chats || [],
      libraryFiles: parsed.libraryFiles || [],
      blueprints: parsed.blueprints || [],
    };
  } catch {
    await writeDb(EMPTY_DB);
    return { ...EMPTY_DB };
  }
}

async function writeDb(db) {
  writeQueue = writeQueue.then(async () => {
    const tempPath = `${DB_PATH}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(db, null, 2), "utf8");
    await fs.rename(tempPath, DB_PATH);
  });
  return writeQueue;
}

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    about: user.about || "",
    allowAnalytics: Boolean(user.allowAnalytics),
    avatarUrl: user.avatarUrl || "",
    createdAt: user.createdAt,
  };
}

function defaultAssistantMessage() {
  return {
    id: Date.now(),
    sender: "ai",
    text: "Hello! I'm your startup AI Advisor. Ask me anything.",
    createdAt: new Date().toISOString(),
  };
}

function shouldGenerateVisual(text = "") {
  const normalized = String(text).toLowerCase();
  const visualKeywords = [
    "diagram",
    "image",
    "visual",
    "flowchart",
    "wireframe",
    "architecture",
    "chart",
    "graph",
    "mockup",
  ];
  return visualKeywords.some((keyword) => normalized.includes(keyword));
}

async function generateAiVisualWithOpenAI(userId, sourceText, suffix = "") {
  if (!openai) {
    throw new Error("OPENAI_API_KEY is missing on backend server.");
  }

  const prompt = String(sourceText || "Business visual diagram").trim();
  const response = await openai.images.generate({
    model: OPENAI_MODEL,
    prompt,
    size: "1024x1024",
  });

  const b64 = response?.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("OpenAI image generation failed.");
  }

  const fileName = `ai_${Date.now()}_${Math.floor(Math.random() * 100000)}.png`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  await fs.writeFile(filePath, Buffer.from(b64, "base64"));

  const generatedAt = new Date().toISOString();
  const cleanText = prompt.slice(0, 70) || "Business Visual";
  const label = `AI ${suffix ? `${suffix} ` : ""}Diagram`;

  return {
    id: `${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    userId,
    name: `${label} - ${cleanText}.png`,
    type: "ai-generated",
    prompt,
    url: `/uploads/${fileName}`,
    createdAt: generatedAt,
  };
}

async function generateAdvisorReplyWithOpenAI(chatMessages, userText) {
  if (!openai) {
    return `I received your question: "${userText}". Please configure OPENAI_API_KEY to enable real AI answers.`;
  }

  const recentMessages = (chatMessages || [])
    .filter((m) => m?.sender === "user" || m?.sender === "ai")
    .slice(-8)
    .map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

  const completion = await openai.chat.completions.create({
    model: OPENAI_CHAT_MODEL,
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content:
          "You are StartGenie AI, a practical startup advisor. Reply in clear modern format with short headings, bullet points, and relevant emojis. Keep it actionable, specific, and founder-friendly. Preferred structure: 1) quick insight, 2) action steps, 3) metric/estimate, 4) next move. Avoid long dense paragraphs.",
      },
      ...recentMessages,
    ],
  });

  const text = completion.choices?.[0]?.message?.content?.trim();
  return text || "I could not generate a response right now. Please try again.";
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

const safe = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "startgenie-backend" });
});

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const db = await readDb();

  if (db.users.some((u) => u.email === normalizedEmail)) {
    return res.status(409).json({ error: "Email is already registered." });
  }

  const user = {
    id: Date.now().toString(),
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 10),
    about: "",
    allowAnalytics: false,
    avatarUrl: "",
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  db.chats.push({
    id: Date.now().toString(),
    userId: user.id,
    name: "Chat 1",
    messages: [defaultAssistantMessage()],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await writeDb(db);

  const token = signToken(user.id);
  return res.status(201).json({ token, user: sanitizeUser(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const db = await readDb();
  const user = db.users.find((u) => u.email === normalizedEmail);

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = signToken(user.id);
  return res.json({ token, user: sanitizeUser(user) });
});

app.get("/api/auth/me", auth, async (req, res) => {
  const db = await readDb();
  const user = db.users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json({ user: sanitizeUser(user) });
});

app.put("/api/users/me", auth, async (req, res) => {
  const { name, email, about, allowAnalytics, avatarUrl } = req.body;
  const db = await readDb();
  const user = db.users.find((u) => u.id === req.userId);

  if (!user) return res.status(404).json({ error: "User not found" });

  if (email) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const taken = db.users.some((u) => u.id !== user.id && u.email === normalizedEmail);
    if (taken) return res.status(409).json({ error: "Email is already in use." });
    user.email = normalizedEmail;
  }

  if (name) user.name = String(name).trim();
  if (typeof about === "string") user.about = about;
  if (typeof allowAnalytics === "boolean") user.allowAnalytics = allowAnalytics;
  if (typeof avatarUrl === "string") user.avatarUrl = avatarUrl;

  await writeDb(db);
  return res.json({ user: sanitizeUser(user) });
});

app.put("/api/users/me/password", auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: "Old and new password are required." });
  }

  const db = await readDb();
  const user = db.users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const ok = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Old password is incorrect." });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await writeDb(db);
  return res.json({ message: "Password updated successfully." });
});

app.delete("/api/users/me", auth, async (req, res) => {
  const db = await readDb();
  db.users = db.users.filter((u) => u.id !== req.userId);
  db.chats = db.chats.filter((c) => c.userId !== req.userId);
  db.libraryFiles = db.libraryFiles.filter((f) => f.userId !== req.userId);
  db.blueprints = db.blueprints.filter((b) => b.userId !== req.userId);
  await writeDb(db);
  return res.json({ message: "Account deleted." });
});

app.get("/api/chats", auth, async (req, res) => {
  const db = await readDb();
  const chats = db.chats
    .filter((c) => c.userId === req.userId)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  return res.json({ chats });
});

app.post("/api/chats", auth, async (req, res) => {
  const db = await readDb();
  const userChats = db.chats.filter((c) => c.userId === req.userId);

  const chat = {
    id: Date.now().toString(),
    userId: req.userId,
    name: req.body.name || `Chat ${userChats.length + 1}`,
    messages: [defaultAssistantMessage()],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.chats.push(chat);
  await writeDb(db);
  return res.status(201).json({ chat });
});

app.patch("/api/chats/:chatId", auth, async (req, res) => {
  const { chatId } = req.params;
  const { name } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({ error: "Chat name is required." });
  }

  const db = await readDb();
  const chat = db.chats.find((c) => c.id === chatId && c.userId === req.userId);
  if (!chat) return res.status(404).json({ error: "Chat not found" });

  chat.name = name.trim();
  chat.updatedAt = new Date().toISOString();

  await writeDb(db);
  return res.json({ chat });
});

app.delete("/api/chats/:chatId", auth, async (req, res) => {
  const { chatId } = req.params;
  const db = await readDb();
  const before = db.chats.length;
  db.chats = db.chats.filter((c) => !(c.id === chatId && c.userId === req.userId));

  if (db.chats.length === before) {
    return res.status(404).json({ error: "Chat not found" });
  }

  await writeDb(db);
  return res.json({ message: "Chat deleted" });
});

app.post("/api/chats/:chatId/messages", auth, safe(async (req, res) => {
  const { chatId } = req.params;
  const { text, sender = "user", type = "text" } = req.body;

  if (!text?.trim()) {
    return res.status(400).json({ error: "Message text is required." });
  }

  const db = await readDb();
  const chat = db.chats.find((c) => c.id === chatId && c.userId === req.userId);
  if (!chat) return res.status(404).json({ error: "Chat not found" });

  const userMsg = {
    id: Date.now(),
    sender,
    type,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };
  chat.messages.push(userMsg);

  if (sender === "user" && /^Chat\s+\d+$/i.test(String(chat.name || "").trim())) {
    // Auto-title a new chat from the first user message.
    chat.name = text.trim().slice(0, 48);
  }

  let aiMsg = null;
  let aiGenerated = null;
  let aiImageMsg = null;
  if (sender === "user") {
    const wantsVisual = shouldGenerateVisual(text.trim());

    if (wantsVisual) {
      aiGenerated = await generateAiVisualWithOpenAI(req.userId, text.trim(), "Business");
      db.libraryFiles.push(aiGenerated);
      aiImageMsg = {
        id: Date.now() + 2,
        sender: "ai",
        type: "ai-image",
        text: `Generated diagram: ${aiGenerated.name}`,
        imageUrl: aiGenerated.url,
        createdAt: new Date().toISOString(),
      };
      chat.messages.push(aiImageMsg);
    }

    const aiText = wantsVisual
      ? "I created an AI business diagram based on your request and saved it to Library. You can preview and download it there."
      : await generateAdvisorReplyWithOpenAI(chat.messages, text.trim());

    aiMsg = {
      id: Date.now() + 1,
      sender: "ai",
      type: "text",
      text: aiText,
      createdAt: new Date().toISOString(),
    };
    chat.messages.push(aiMsg);
  }

  chat.updatedAt = new Date().toISOString();
  await writeDb(db);

  return res.status(201).json({ message: userMsg, aiMessage: aiMsg, aiImageMsg, aiGenerated, chat });
}));

app.get("/api/library", auth, async (req, res) => {
  const db = await readDb();
  const files = db.libraryFiles
    .filter((f) => f.userId === req.userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return res.json({ files });
});

app.post("/api/library/upload", auth, upload.single("file"), safe(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "File is required." });
  }

  const db = await readDb();

  const aiGeneratedVisual = await generateAiVisualWithOpenAI(
    req.userId,
    `Create a startup business diagram from this uploaded file context: ${req.file.originalname}`,
    "Upload"
  );

  db.libraryFiles.push(aiGeneratedVisual);
  await writeDb(db);

  return res.status(201).json({
    aiGenerated: aiGeneratedVisual,
    aiMessage: "File analyzed. AI generated diagram saved to your Library.",
  });
}));

app.post("/api/library/generate", auth, safe(async (req, res) => {
  const { prompt } = req.body;

  if (!prompt?.trim()) {
    return res.status(400).json({ error: "Prompt is required to generate AI visual." });
  }

  const db = await readDb();
  const aiGeneratedVisual = await generateAiVisualWithOpenAI(req.userId, prompt.trim(), "Prompt");
  db.libraryFiles.push(aiGeneratedVisual);
  await writeDb(db);

  return res.status(201).json({
    aiGenerated: aiGeneratedVisual,
    aiMessage: "AI visual generated and saved to Library.",
  });
}));

app.post("/api/blueprints/generate", auth, safe(async (req, res) => {
  const { idea, location, category, budget = "Not specified", unit = "INR" } = req.body;

  if (!idea?.trim() || !location?.trim() || !category?.trim()) {
    return res.status(400).json({ error: "Idea, location, and category are required." });
  }

  const meta = {
    idea: idea.trim(),
    location: location.trim(),
    category: category.trim(),
    budget: String(budget),
    unit,
  };

  const { blueprint: structured, retrievedKnowledge } = await generateStructuredBlueprint({
    openai,
    meta,
  });

  let blueprintVisual = null;
  const shouldGenerateBlueprintVisual = String(process.env.BLUEPRINT_GENERATE_VISUAL || "true").toLowerCase() === "true";
  if (shouldGenerateBlueprintVisual) {
    const visualPrompt =
      structured.diagramPrompt ||
      `Create a professional startup blueprint diagram for: ${meta.idea} in ${meta.location}. Include problem, solution, market, revenue, operations, legal, and milestones in one clean visual.`;
    blueprintVisual = await generateAiVisualWithOpenAI(req.userId, visualPrompt, "Blueprint");
  }

  const blueprint = {
    id: Date.now().toString(),
    userId: req.userId,
    ...meta,
    structured,
    retrievedKnowledge,
    blueprintVisual,
    status: "ready",
    createdAt: new Date().toISOString(),
  };

  const db = await readDb();
  db.blueprints.push(blueprint);
  if (blueprintVisual) {
    db.libraryFiles.push(blueprintVisual);
  }
  await writeDb(db);

  return res.status(201).json({
    blueprint: {
      id: blueprint.id,
      status: blueprint.status,
      blueprintVisualUrl: blueprintVisual?.url || "",
    },
    progress: [
      "Analyzing your startup inputs...",
      "Collecting legal + business context from vector knowledge...",
      "Generating structured blueprint...",
      "Blueprint ready. You can now export/download.",
    ],
    readyMessage: "Blueprint ready. You can now export/download.",
  });
}));

app.post("/api/blueprints/:id/export", auth, safe(async (req, res) => {
  const { id } = req.params;
  const { format = "text" } = req.body;

  const db = await readDb();
  const blueprint = db.blueprints.find((b) => b.id === id && b.userId === req.userId);
  if (!blueprint) return res.status(404).json({ error: "Blueprint not found" });
  if (!blueprint.structured) {
    return res.status(400).json({ error: "Blueprint structure is unavailable. Please regenerate." });
  }

  const baseName = "Startup_Blueprint";

  if (format === "text") {
    const content = buildTextExport(blueprint);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=${baseName}.txt`);
    return res.send(content);
  }

  if (format === "pdf") {
    const pdfBuffer = await buildPdfExport(blueprint);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${baseName}.pdf`);
    return res.send(pdfBuffer);
  }

  if (format === "word") {
    const docxBuffer = await buildDocxExport(blueprint);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${baseName}.docx`);
    return res.send(docxBuffer);
  }

  if (format === "ppt") {
    const pptBuffer = await buildPptxExport(blueprint);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${baseName}.pptx`);
    return res.send(pptBuffer);
  }

  return res.status(400).json({ error: "Unsupported export format." });
}));

app.use((err, _req, res, _next) => {
  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`StartGenie backend running on http://localhost:${PORT}`);
});
