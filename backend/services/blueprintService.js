import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";
import PptxGenJS from "pptxgenjs";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import { ensureVectorIndex, queryVectorIndex } from "./vectorStoreService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KB_PATH = path.join(__dirname, "..", "data", "knowledge-base.json");

function stripJsonCodeFence(text) {
  const raw = String(text || "").trim();
  if (raw.startsWith("```")) {
    return raw.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
  }
  return raw;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeBlueprintJson(input, fallbackMeta) {
  const parsed = typeof input === "string" ? JSON.parse(stripJsonCodeFence(input)) : input;

  return {
    title: parsed.title || `${fallbackMeta.idea} Blueprint`,
    executiveSummary: parsed.executiveSummary || "",
    problemStatement: parsed.problemStatement || "",
    solutionDesign: parsed.solutionDesign || "",
    targetUsers: asArray(parsed.targetUsers),
    marketAnalysis: {
      marketSize: parsed.marketAnalysis?.marketSize || "",
      competitors: asArray(parsed.marketAnalysis?.competitors),
      trends: asArray(parsed.marketAnalysis?.trends),
    },
    businessModel: {
      revenueStreams: asArray(parsed.businessModel?.revenueStreams),
      pricingStrategy: parsed.businessModel?.pricingStrategy || "",
      unitEconomics: parsed.businessModel?.unitEconomics || "",
    },
    operationsPlan: {
      workflow: asArray(parsed.operationsPlan?.workflow),
      teamStructure: asArray(parsed.operationsPlan?.teamStructure),
      toolsStack: asArray(parsed.operationsPlan?.toolsStack),
    },
    legalAndCompliance: {
      registrations: asArray(parsed.legalAndCompliance?.registrations),
      mandatoryPolicies: asArray(parsed.legalAndCompliance?.mandatoryPolicies),
      regulatoryChecklist: asArray(parsed.legalAndCompliance?.regulatoryChecklist),
      disclaimer: parsed.legalAndCompliance?.disclaimer || "Consult a qualified legal/tax professional before execution.",
    },
    financialPlan: {
      startupCost: parsed.financialPlan?.startupCost || "",
      monthlyBurn: parsed.financialPlan?.monthlyBurn || "",
      revenueProjection12M: parsed.financialPlan?.revenueProjection12M || "",
      breakEvenEstimate: parsed.financialPlan?.breakEvenEstimate || "",
      assumptions: asArray(parsed.financialPlan?.assumptions),
    },
    risksAndMitigation: asArray(parsed.risksAndMitigation),
    milestones90Days: asArray(parsed.milestones90Days),
    investorPitchSlides: asArray(parsed.investorPitchSlides),
    sourceReferences: asArray(parsed.sourceReferences),
    legalNotice: parsed.legalNotice || "Always validate jurisdiction-specific legal/tax obligations with a certified CA/CS/lawyer.",
    diagramPrompt: parsed.diagramPrompt || "",
    callToAction: parsed.callToAction || "",
  };
}

function sectionLines(blueprint, meta) {
  return [
    `Title: ${blueprint.title}`,
    `Idea: ${meta.idea}`,
    `Location: ${meta.location}`,
    `Category: ${meta.category}`,
    `Budget: ${meta.budget} ${meta.unit}`,
    "",
    "EXECUTIVE SUMMARY",
    blueprint.executiveSummary,
    "",
    "PROBLEM STATEMENT",
    blueprint.problemStatement,
    "",
    "SOLUTION DESIGN",
    blueprint.solutionDesign,
    "",
    "TARGET USERS",
    ...blueprint.targetUsers.map((x) => `- ${x}`),
    "",
    "MARKET ANALYSIS",
    `Market Size: ${blueprint.marketAnalysis.marketSize}`,
    "Competitors:",
    ...blueprint.marketAnalysis.competitors.map((x) => `- ${x}`),
    "Trends:",
    ...blueprint.marketAnalysis.trends.map((x) => `- ${x}`),
    "",
    "BUSINESS MODEL",
    "Revenue Streams:",
    ...blueprint.businessModel.revenueStreams.map((x) => `- ${x}`),
    `Pricing Strategy: ${blueprint.businessModel.pricingStrategy}`,
    `Unit Economics: ${blueprint.businessModel.unitEconomics}`,
    "",
    "OPERATIONS PLAN",
    "Workflow:",
    ...blueprint.operationsPlan.workflow.map((x) => `- ${x}`),
    "Team Structure:",
    ...blueprint.operationsPlan.teamStructure.map((x) => `- ${x}`),
    "Tools Stack:",
    ...blueprint.operationsPlan.toolsStack.map((x) => `- ${x}`),
    "",
    "LEGAL AND COMPLIANCE",
    "Registrations:",
    ...blueprint.legalAndCompliance.registrations.map((x) => `- ${x}`),
    "Mandatory Policies:",
    ...blueprint.legalAndCompliance.mandatoryPolicies.map((x) => `- ${x}`),
    "Regulatory Checklist:",
    ...blueprint.legalAndCompliance.regulatoryChecklist.map((x) => `- ${x}`),
    `Disclaimer: ${blueprint.legalAndCompliance.disclaimer}`,
    "",
    "FINANCIAL PLAN",
    `Startup Cost: ${blueprint.financialPlan.startupCost}`,
    `Monthly Burn: ${blueprint.financialPlan.monthlyBurn}`,
    `Revenue Projection (12M): ${blueprint.financialPlan.revenueProjection12M}`,
    `Break-even: ${blueprint.financialPlan.breakEvenEstimate}`,
    "Assumptions:",
    ...blueprint.financialPlan.assumptions.map((x) => `- ${x}`),
    "",
    "RISKS AND MITIGATION",
    ...blueprint.risksAndMitigation.map((x) => `- ${x}`),
    "",
    "MILESTONES (NEXT 90 DAYS)",
    ...blueprint.milestones90Days.map((x) => `- ${x}`),
    "",
    "PITCH SLIDE OUTLINE",
    ...blueprint.investorPitchSlides.map((x, i) => `Slide ${i + 1}: ${x}`),
    "",
    "SOURCE REFERENCES",
    ...blueprint.sourceReferences.map((x) => `- ${x}`),
    "",
    "LEGAL NOTICE",
    blueprint.legalNotice,
    "",
    "CALL TO ACTION",
    blueprint.callToAction,
  ];
}

export async function generateStructuredBlueprint({ openai, meta }) {
  if (!openai) {
    throw new Error("OPENAI_API_KEY is missing on backend server.");
  }

  const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
  const blueprintModel = process.env.OPENAI_BLUEPRINT_MODEL || "gpt-4.1-mini";

  const kbRaw = await fs.readFile(KB_PATH, "utf8");
  const kb = JSON.parse(kbRaw);
  const queryText = `${meta.idea} | ${meta.location} | ${meta.category} | ${meta.budget} ${meta.unit}`;
  const vectorIndex = await ensureVectorIndex({
    openai,
    embeddingModel,
    chunks: kb,
  });
  const ranked = await queryVectorIndex({
    openai,
    embeddingModel,
    index: vectorIndex,
    query: queryText,
    topK: 5,
  });

  const contextBlock = ranked.map((x) => `- (${x.id}) ${x.content}`).join("\n");

  const systemPrompt = `You are a startup blueprint strategist. Build practical, execution-first, investor-ready output with legal/compliance notes. Return valid JSON only.`;
  const userPrompt = `
Create a complete startup blueprint in strict JSON.

Startup details:
- Idea: ${meta.idea}
- Location: ${meta.location}
- Category: ${meta.category}
- Budget: ${meta.budget} ${meta.unit}

Relevant vector knowledge snippets:
${contextBlock}

JSON shape:
{
  "title": "...",
  "executiveSummary": "...",
  "problemStatement": "...",
  "solutionDesign": "...",
  "targetUsers": ["..."],
  "marketAnalysis": {"marketSize":"...","competitors":["..."],"trends":["..."]},
  "businessModel": {"revenueStreams":["..."],"pricingStrategy":"...","unitEconomics":"..."},
  "operationsPlan": {"workflow":["..."],"teamStructure":["..."],"toolsStack":["..."]},
  "legalAndCompliance": {
    "registrations":["..."],
    "mandatoryPolicies":["..."],
    "regulatoryChecklist":["..."],
    "disclaimer":"..."
  },
  "financialPlan": {
    "startupCost":"...",
    "monthlyBurn":"...",
    "revenueProjection12M":"...",
    "breakEvenEstimate":"...",
    "assumptions":["..."]
  },
  "risksAndMitigation":["..."],
  "milestones90Days":["..."],
  "investorPitchSlides":["Slide title + key points"],
  "sourceReferences":["kb_chunk_id: why this chunk applies"],
  "legalNotice":"...",
  "diagramPrompt":"Prompt for optional blueprint diagram/image generation",
  "callToAction":"..."
}

Rules:
- Make it realistic, legal-aware, and actionable.
- Mention that legal/tax advice needs certified professionals.
- Use only provided vector snippets for legal/compliance references; if uncertain, explicitly state verification is required.
- Investor pitch slides should be presentation-ready for a 3-4 person audience.
`;

  const completion = await openai.chat.completions.create({
    model: blueprintModel,
    temperature: 0.3,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const content = completion.choices?.[0]?.message?.content || "{}";
  const blueprint = normalizeBlueprintJson(content, meta);

  return {
    blueprint,
    retrievedKnowledge: ranked.map((x) => ({ id: x.id, title: x.title, score: Number(x.score.toFixed(4)) })),
  };
}

export function buildTextExport(blueprintRecord) {
  return sectionLines(blueprintRecord.structured, blueprintRecord).join("\n");
}

export async function buildDocxExport(blueprintRecord) {
  const lines = sectionLines(blueprintRecord.structured, blueprintRecord);
  const children = [];
  lines.forEach((line) => {
    if (!line) {
      children.push(new Paragraph({ text: "" }));
      return;
    }
    if (/^[A-Z\s()]{4,}$/.test(line)) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: line, bold: true })],
        })
      );
      return;
    }
    children.push(new Paragraph({ text: line }));
  });

  const doc = new Document({
    sections: [{ children }],
  });

  return Packer.toBuffer(doc);
}

export async function buildPdfExport(blueprintRecord) {
  const lines = sectionLines(blueprintRecord.structured, blueprintRecord);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(18).text(blueprintRecord.structured.title, { underline: true });
    doc.moveDown();

    lines.forEach((line) => {
      if (!line) {
        doc.moveDown(0.5);
      } else if (/^[A-Z\s()]{4,}$/.test(line)) {
        doc.fontSize(13).fillColor("#0b4f6c").text(line);
        doc.fillColor("black");
      } else {
        doc.fontSize(10).text(line);
      }
    });

    doc.end();
  });
}

export async function buildPptxExport(blueprintRecord) {
  const data = blueprintRecord.structured;
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "StartGenie AI";
  pptx.subject = "Startup Blueprint";
  pptx.title = data.title;

  const safeText = (value) => {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return "";
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  const addSlide = (title, bullets) => {
    const slide = pptx.addSlide();
    slide.addText(title, { x: 0.4, y: 0.2, w: 12.2, h: 0.5, fontSize: 24, bold: true, color: "0B4F6C" });
    slide.addText(
      (bullets || []).map((item) => ({ text: safeText(item), options: { bullet: { indent: 16 } } })),
      { x: 0.7, y: 1.1, w: 11.8, h: 5.8, fontSize: 18, color: "222222" }
    );
  };

  addSlide("Startup Blueprint", [
    `Idea: ${blueprintRecord.idea}`,
    `Location: ${blueprintRecord.location}`,
    `Category: ${blueprintRecord.category}`,
    `Budget: ${blueprintRecord.budget} ${blueprintRecord.unit}`,
    data.executiveSummary,
  ]);

  addSlide("Problem and Solution", [data.problemStatement, data.solutionDesign]);
  addSlide("Target Users", data.targetUsers);
  addSlide("Market Analysis", [
    `Market size: ${data.marketAnalysis.marketSize}`,
    ...data.marketAnalysis.competitors.map((x) => `Competitor: ${x}`),
    ...data.marketAnalysis.trends.map((x) => `Trend: ${x}`),
  ]);
  addSlide("Business Model", [
    ...data.businessModel.revenueStreams.map((x) => `Revenue: ${x}`),
    `Pricing: ${data.businessModel.pricingStrategy}`,
    `Unit economics: ${data.businessModel.unitEconomics}`,
  ]);
  addSlide("Operations", [
    ...data.operationsPlan.workflow,
    ...data.operationsPlan.teamStructure,
    ...data.operationsPlan.toolsStack,
  ]);
  addSlide("Legal and Compliance", [
    ...data.legalAndCompliance.registrations,
    ...data.legalAndCompliance.mandatoryPolicies,
    ...data.legalAndCompliance.regulatoryChecklist,
    `Disclaimer: ${data.legalAndCompliance.disclaimer}`,
  ]);
  addSlide("Financial Plan", [
    `Startup cost: ${data.financialPlan.startupCost}`,
    `Monthly burn: ${data.financialPlan.monthlyBurn}`,
    `12M projection: ${data.financialPlan.revenueProjection12M}`,
    `Break-even: ${data.financialPlan.breakEvenEstimate}`,
    ...data.financialPlan.assumptions,
  ]);
  addSlide("Risks and 90-Day Milestones", [...data.risksAndMitigation, ...data.milestones90Days]);
  addSlide("Investor Pitch Summary", data.investorPitchSlides.length ? data.investorPitchSlides : [data.callToAction]);

  return pptx.write({ outputType: "nodebuffer" });
}
