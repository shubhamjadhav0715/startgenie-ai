import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import OpenAI from "openai";
import { fileURLToPath } from "url";
import { OAuth2Client } from "google-auth-library";
import { retrieveChunks } from "./services/ragService.js";
import { summarizeKnowledgeBase } from "./services/publicIngestService.js";
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
const APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:5173";
const EMAIL_VERIFICATION_REQUIRED = String(process.env.EMAIL_VERIFICATION_REQUIRED || "false").toLowerCase() === "true";
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = Number(process.env.SMTP_PORT || "587");
const SMTP_SECURE = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || "no-reply@startgenie.local";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;
const RAG_CHAT_TOP_K = Number(process.env.RAG_CHAT_TOP_K || "4");
const RAG_MIN_SCORE = Number(process.env.RAG_MIN_SCORE || "0.2");

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
    emailVerified: user.emailVerified !== false,
    hasPassword: Boolean(user.passwordHash),
    about: user.about || "",
    allowAnalytics: Boolean(user.allowAnalytics),
    avatarUrl: user.avatarUrl || "",
    createdAt: user.createdAt,
  };
}

function sha256(input) {
  return crypto.createHash("sha256").update(String(input)).digest("hex");
}

function createEmailVerificationToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(); // 24h
  return { token, tokenHash, expiresAt };
}

let mailTransport = null;
async function getMailTransport() {
  if (mailTransport) return mailTransport;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  // Lazy-load to keep dev setups working without mail deps configured.
  const nodemailer = await import("nodemailer");
  mailTransport = nodemailer.default.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return mailTransport;
}

async function sendVerificationEmail(toEmail, token) {
  const verifyUrl = `${APP_BASE_URL.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(token)}`;
  const subject = "Verify your StartGenie AI email";
  const text = `Verify your email to activate your StartGenie AI account:\n\n${verifyUrl}\n\nThis link expires in 24 hours.`;

  const transport = await getMailTransport();
  if (!transport) {
    console.log(`[email] Verification link for ${toEmail}: ${verifyUrl}`);
    return { mode: "console" };
  }

  await transport.sendMail({
    from: SMTP_FROM,
    to: toEmail,
    subject,
    text,
  });
  return { mode: "smtp" };
}

async function sendBlueprintEmail({ toEmail, subject, text, pdfBuffer }) {
  const transport = await getMailTransport();
  if (!transport) {
    throw new Error("Email is not configured on the server (SMTP_HOST/SMTP_USER/SMTP_PASS).");
  }

  await transport.sendMail({
    from: SMTP_FROM,
    to: toEmail,
    subject,
    text,
    attachments: [
      {
        filename: "Startup_Blueprint.pdf",
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
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

  const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
  const rag = await retrieveChunks({
    openai,
    embeddingModel,
    query: userText,
    topK: Number.isFinite(RAG_CHAT_TOP_K) ? RAG_CHAT_TOP_K : 4,
  });

  const ragRelevant = (rag || []).filter((x) => (x.score || 0) >= (Number.isFinite(RAG_MIN_SCORE) ? RAG_MIN_SCORE : 0.2));
  const contextBlock = ragRelevant.length
    ? ragRelevant
        .map((x) => `- (${x.id}) ${x.title}: ${x.content}`)
        .join("\n")
    : "";

  const recentMessages = (chatMessages || [])
    .filter((m) => m?.sender === "user" || m?.sender === "ai")
    .slice(-8)
    .map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));

  const completion = await openai.chat.completions.create({
    model: OPENAI_CHAT_MODEL,
    temperature: 0.4,
    messages: [
      {
        role: "system",
        content:
          [
            "You are StartGenie AI, a helpful startup advisor that chats like ChatGPT.",
            "Goals: answer normal questions, ask smart follow-up questions, and help the user clarify their startup idea.",
            "",
            "Rules:",
            "- Use the provided RAG context snippets when they are relevant.",
            "- If the user asks for legal/tax/compliance advice, give general guidance and clearly recommend consulting a certified professional.",
            "- Keep replies concise and conversational (no long blueprint-style reports).",
            "- If the user asks for a detailed startup blueprint/pitch deck, DO NOT output a full blueprint. Give a short summary + tell them to use the Blueprint Generator for the full blueprint.",
            "- Always ask 2-4 relevant clarifying questions when missing key info (target user, problem, distribution, pricing, region, constraints).",
            "- Prefer bullets. Avoid emojis.",
            "",
            "Output format:",
            "1) Brief answer (3-7 bullets max)",
            "2) Clarifying questions (2-4 bullets)",
            "3) If relevant: Next action (1 bullet)",
          ].join("\n"),
      },
      ...(contextBlock
        ? [
            {
              role: "system",
              content: `RAG context snippets (use only if relevant; if not relevant, ignore):\n${contextBlock}`,
            },
          ]
        : []),
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

async function generateBlueprintQuestionsWithOpenAI(meta) {
  if (!openai) {
    return [
      "Who is the primary target customer (job role/segment) and what painful problem are you solving?",
      "What is your differentiator vs existing alternatives?",
      "How will you acquire your first 100 customers/users (channels)?",
      "What is your pricing model and expected monthly price point?",
      "Any constraints (timeline, team size, compliance, partnerships, must-have features)?",
    ];
  }

  const blueprintModel = process.env.OPENAI_BLUEPRINT_MODEL || "gpt-4.1-mini";
  const completion = await openai.chat.completions.create({
    model: blueprintModel,
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content:
          "You generate short, practical clarifying questions for a startup blueprint. Return valid JSON only: {\"questions\":[\"...\"]} with 5 items.",
      },
      {
        role: "user",
        content: `Startup details:\n- Idea: ${meta.idea}\n- Location: ${meta.location}\n- Category: ${meta.category}\n- Budget: ${meta.budget} ${meta.unit}\n\nReturn 5 clarifying questions that will improve the blueprint and pitch deck.`,
      },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content || "{}";
  try {
    const parsed = JSON.parse(String(raw).trim().replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim());
    const questions = Array.isArray(parsed.questions) ? parsed.questions.filter((q) => String(q || "").trim()).slice(0, 5) : [];
    if (questions.length) return questions;
  } catch {
    // fall through
  }

  return [
    "Who is the primary target customer (job role/segment) and what painful problem are you solving?",
    "What is your differentiator vs existing alternatives?",
    "How will you acquire your first 100 customers/users (channels)?",
    "What is your pricing model and expected monthly price point?",
    "Any constraints (timeline, team size, compliance, partnerships, must-have features)?",
  ];
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "startgenie-backend" });
});

app.get("/api/rag/validation-report", auth, safe(async (_req, res) => {
  const summary = await summarizeKnowledgeBase();
  res.json({
    generatedAt: new Date().toISOString(),
    knowledgeBase: summary,
    note: "Run backend/scripts/ingest_official_sources.js to ingest official public sources and rebuild the vector index.",
  });
}));

app.post("/api/rag/query", auth, safe(async (req, res) => {
  const { query, topK } = req.body;
  if (!query?.trim()) return res.status(400).json({ error: "Query is required." });
  if (!openai) return res.status(500).json({ error: "OPENAI_API_KEY is missing on backend server." });

  const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
  const results = await retrieveChunks({
    openai,
    embeddingModel,
    query: query.trim(),
    topK: Number.isFinite(Number(topK)) ? Number(topK) : 5,
  });

  return res.json({
    embeddingModel,
    topK: Number.isFinite(Number(topK)) ? Number(topK) : 5,
    minScore: Number.isFinite(RAG_MIN_SCORE) ? RAG_MIN_SCORE : 0.2,
    results,
  });
}));

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

  const { token, tokenHash, expiresAt } = createEmailVerificationToken();
  const emailVerified = EMAIL_VERIFICATION_REQUIRED ? false : true;
  const user = {
    id: Date.now().toString(),
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash: await bcrypt.hash(password, 10),
    emailVerified,
    emailVerificationTokenHash: emailVerified ? "" : tokenHash,
    emailVerificationExpiresAt: emailVerified ? "" : expiresAt,
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

  const delivery = EMAIL_VERIFICATION_REQUIRED ? await sendVerificationEmail(user.email, token) : null;
  return res.status(201).json({
    message:
      !EMAIL_VERIFICATION_REQUIRED
        ? "Account created. Email verification is currently disabled on the server."
        : delivery?.mode === "smtp"
        ? "Account created. Please verify your email to continue."
        : "Account created. Email is not configured on the server, so the verification link was printed in the backend console.",
  });
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

  if (EMAIL_VERIFICATION_REQUIRED && user.emailVerified === false) {
    return res.status(403).json({ error: "Please verify your email before logging in." });
  }

  if (!user.passwordHash) {
    return res.status(401).json({ error: "This account uses Google login. Please sign in with Google." });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = signToken(user.id);
  return res.json({ token, user: sanitizeUser(user) });
});

app.post("/api/auth/google", safe(async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: "Missing Google credential." });
  if (!googleClient) return res.status(500).json({ error: "Google login is not configured on the server." });

  const ticket = await googleClient.verifyIdToken({
    idToken: String(credential),
    audience: GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const email = String(payload?.email || "").trim().toLowerCase();
  if (!email) return res.status(400).json({ error: "Google account email is missing." });

  const name = String(payload?.name || payload?.given_name || "User").trim();
  const picture = String(payload?.picture || "").trim();
  const sub = String(payload?.sub || "").trim();
  const emailVerified = payload?.email_verified !== false;

  const db = await readDb();
  let user = db.users.find((u) => u.email === email);

  if (!user) {
    user = {
      id: Date.now().toString(),
      name,
      email,
      passwordHash: "",
      emailVerified: true,
      googleSub: sub,
      about: "",
      allowAnalytics: false,
      avatarUrl: picture,
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
  } else {
    if (!user.googleSub && sub) user.googleSub = sub;
    if (emailVerified && user.emailVerified === false) user.emailVerified = true;
    if (!user.avatarUrl && picture) user.avatarUrl = picture;
    if (!user.name && name) user.name = name;
  }

  await writeDb(db);

  const token = signToken(user.id);
  return res.json({
    token,
    user: sanitizeUser(user),
    needsPasswordSetup: !user.passwordHash,
  });
}));

app.post("/api/auth/request-email-verification", async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    return res.status(400).json({ error: "Email is required." });
  }

  const db = await readDb();
  const user = db.users.find((u) => u.email === normalizedEmail);

  if (user && user.emailVerified === false) {
    const { token, tokenHash, expiresAt } = createEmailVerificationToken();
    user.emailVerificationTokenHash = tokenHash;
    user.emailVerificationExpiresAt = expiresAt;
    await writeDb(db);
    const delivery = await sendVerificationEmail(user.email, token);
    return res.json({
      message:
        delivery?.mode === "smtp"
          ? "Verification email sent."
          : "Email is not configured on the server, so the verification link was printed in the backend console.",
    });
  }

  return res.json({ message: "If the account exists, a verification email has been sent." });
});

app.get("/api/auth/verify-email", async (req, res) => {
  const token = String(req.query.token || "").trim();
  if (!token) return res.status(400).json({ error: "Missing token." });

  const tokenHash = sha256(token);
  const db = await readDb();
  const user = db.users.find((u) => u.emailVerificationTokenHash === tokenHash);

  if (!user) return res.status(400).json({ error: "Invalid verification token." });

  const expiresAt = user.emailVerificationExpiresAt ? new Date(user.emailVerificationExpiresAt) : null;
  if (expiresAt && Number.isFinite(expiresAt.getTime()) && expiresAt.getTime() < Date.now()) {
    return res.status(400).json({ error: "Verification token expired. Please request a new one." });
  }

  user.emailVerified = true;
  user.emailVerificationTokenHash = "";
  user.emailVerificationExpiresAt = "";
  await writeDb(db);

  return res.json({ message: "Email verified successfully. You can now log in." });
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
  if (!newPassword) return res.status(400).json({ error: "New password is required." });

  const db = await readDb();
  const user = db.users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (user.passwordHash) {
    if (!oldPassword) return res.status(400).json({ error: "Old password is required." });
    const ok = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Old password is incorrect." });
  }

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

app.post("/api/chats/:chatId/regenerate", auth, safe(async (req, res) => {
  const { chatId } = req.params;
  const db = await readDb();
  const chat = db.chats.find((c) => c.id === chatId && c.userId === req.userId);
  if (!chat) return res.status(404).json({ error: "Chat not found" });

  const lastUserIndex = [...(chat.messages || [])].map((m, idx) => ({ m, idx })).reverse().find((x) => x.m?.sender === "user" && x.m?.text?.trim());
  if (!lastUserIndex) return res.status(400).json({ error: "No user message found to regenerate." });

  // Only allow regenerating the most recent response (remove trailing AI messages after the last user message).
  chat.messages = chat.messages.slice(0, lastUserIndex.idx + 1);

  const lastUserText = String(chat.messages[lastUserIndex.idx].text || "").trim();
  const aiText = await generateAdvisorReplyWithOpenAI(chat.messages, lastUserText);
  const aiMsg = {
    id: Date.now() + 1,
    sender: "ai",
    type: "text",
    text: aiText,
    createdAt: new Date().toISOString(),
    regenerated: true,
  };

  chat.messages.push(aiMsg);
  chat.updatedAt = new Date().toISOString();
  await writeDb(db);

  return res.status(201).json({ aiMessage: aiMsg, chat });
}));

app.patch("/api/chats/:chatId/messages/:messageId/feedback", auth, safe(async (req, res) => {
  const { chatId, messageId } = req.params;
  const { rating } = req.body;

  const value = rating === "up" || rating === "down" ? rating : null;

  const db = await readDb();
  const chat = db.chats.find((c) => c.id === chatId && c.userId === req.userId);
  if (!chat) return res.status(404).json({ error: "Chat not found" });

  const msg = (chat.messages || []).find((m) => String(m.id) === String(messageId));
  if (!msg) return res.status(404).json({ error: "Message not found" });
  if (msg.sender !== "ai") return res.status(400).json({ error: "Feedback is only supported for AI messages." });

  msg.feedback = { rating: value, updatedAt: new Date().toISOString() };
  chat.updatedAt = new Date().toISOString();
  await writeDb(db);

  return res.json({ message: msg });
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
  const { idea, location, category, budget = "Not specified", unit = "INR", qa = [] } = req.body;

  if (!idea?.trim() || !location?.trim() || !category?.trim()) {
    return res.status(400).json({ error: "Idea, location, and category are required." });
  }

  const qaPairs = Array.isArray(qa) ? qa.slice(0, 8) : [];
  const extraContext = qaPairs
    .map((item) => {
      const q = String(item?.q || "").trim();
      const a = String(item?.a || "").trim();
      if (!q || !a) return "";
      return `Q: ${q}\nA: ${a}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const meta = {
    idea: idea.trim(),
    location: location.trim(),
    category: category.trim(),
    budget: String(budget),
    unit,
    extraContext,
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
    qa: qaPairs,
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
      preview: {
        title: structured.title,
        executiveSummary: structured.executiveSummary,
        problemStatement: structured.problemStatement,
        solutionDesign: structured.solutionDesign,
        targetUsers: (structured.targetUsers || []).slice(0, 6),
        marketAnalysis: {
          marketSize: structured.marketAnalysis?.marketSize || "",
          competitors: (structured.marketAnalysis?.competitors || []).slice(0, 6),
          trends: (structured.marketAnalysis?.trends || []).slice(0, 6),
        },
        businessModel: {
          revenueStreams: (structured.businessModel?.revenueStreams || []).slice(0, 6),
          pricingStrategy: structured.businessModel?.pricingStrategy || "",
        },
        milestones90Days: (structured.milestones90Days || []).slice(0, 8),
      },
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

app.post("/api/blueprints/questions", auth, safe(async (req, res) => {
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

  const questions = await generateBlueprintQuestionsWithOpenAI(meta);
  return res.json({ questions });
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

  if (format === "email") {
    const db2 = await readDb();
    const user = db2.users.find((u) => u.id === req.userId);
    if (!user?.email) return res.status(400).json({ error: "User email is missing." });

    const pdfBuffer = await buildPdfExport(blueprint);
    const emailText = buildTextExport(blueprint);
    const subject = `Your Startup Blueprint: ${blueprint.structured?.title || baseName}`;

    await sendBlueprintEmail({
      toEmail: user.email,
      subject,
      text: `${emailText}\n\n---\nThis PDF was generated by StartGenie AI.`,
      pdfBuffer,
    });

    return res.json({ message: `Blueprint sent to ${user.email}.` });
  }

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
