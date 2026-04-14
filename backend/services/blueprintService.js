import PDFDocument from "pdfkit";
import PptxGenJS from "pptxgenjs";
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";
import { retrieveChunks } from "./ragService.js";

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
    swot: {
      strengths: asArray(parsed.swot?.strengths),
      weaknesses: asArray(parsed.swot?.weaknesses),
      opportunities: asArray(parsed.swot?.opportunities),
      threats: asArray(parsed.swot?.threats),
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
    fundingStrategy: {
      fundingSources: asArray(parsed.fundingStrategy?.fundingSources),
      grantsAndSchemes: asArray(parsed.fundingStrategy?.grantsAndSchemes),
      capitalPlan: parsed.fundingStrategy?.capitalPlan || "",
      useOfFunds: parsed.fundingStrategy?.useOfFunds || "",
    },
    goToMarketStrategy: {
      positioning: parsed.goToMarketStrategy?.positioning || "",
      channels: asArray(parsed.goToMarketStrategy?.channels),
      acquisitionPlan: parsed.goToMarketStrategy?.acquisitionPlan || "",
      partnerships: asArray(parsed.goToMarketStrategy?.partnerships),
    },
    risksAndMitigation: asArray(parsed.risksAndMitigation),
    roadmap: {
      phase0to3Months: asArray(parsed.roadmap?.phase0to3Months),
      phase3to6Months: asArray(parsed.roadmap?.phase3to6Months),
      phase6to12Months: asArray(parsed.roadmap?.phase6to12Months),
    },
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
    "SWOT",
    "Strengths:",
    ...blueprint.swot.strengths.map((x) => `- ${x}`),
    "Weaknesses:",
    ...blueprint.swot.weaknesses.map((x) => `- ${x}`),
    "Opportunities:",
    ...blueprint.swot.opportunities.map((x) => `- ${x}`),
    "Threats:",
    ...blueprint.swot.threats.map((x) => `- ${x}`),
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
    "FUNDING STRATEGY",
    "Funding Sources:",
    ...blueprint.fundingStrategy.fundingSources.map((x) => `- ${x}`),
    "Grants and Schemes:",
    ...blueprint.fundingStrategy.grantsAndSchemes.map((x) => `- ${x}`),
    `Capital Plan: ${blueprint.fundingStrategy.capitalPlan}`,
    `Use of Funds: ${blueprint.fundingStrategy.useOfFunds}`,
    "",
    "GO TO MARKET",
    `Positioning: ${blueprint.goToMarketStrategy.positioning}`,
    "Channels:",
    ...blueprint.goToMarketStrategy.channels.map((x) => `- ${x}`),
    `Acquisition Plan: ${blueprint.goToMarketStrategy.acquisitionPlan}`,
    "Partnerships:",
    ...blueprint.goToMarketStrategy.partnerships.map((x) => `- ${x}`),
    "",
    "RISKS AND MITIGATION",
    ...blueprint.risksAndMitigation.map((x) => `- ${x}`),
    "",
    "ROADMAP",
    "0-3 Months:",
    ...blueprint.roadmap.phase0to3Months.map((x) => `- ${x}`),
    "3-6 Months:",
    ...blueprint.roadmap.phase3to6Months.map((x) => `- ${x}`),
    "6-12 Months:",
    ...blueprint.roadmap.phase6to12Months.map((x) => `- ${x}`),
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

  const extraContext = String(meta.extraContext || "").trim();
  const queryText = `${meta.idea} | ${meta.location} | ${meta.category} | ${meta.budget} ${meta.unit}${extraContext ? ` | ${extraContext}` : ""}`;
  const ranked = await retrieveChunks({
    openai,
    embeddingModel,
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
${extraContext ? `\nExtra context from user Q&A:\n${extraContext}\n` : ""}

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
  "swot": {"strengths":["..."],"weaknesses":["..."],"opportunities":["..."],"threats":["..."]},
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
  "fundingStrategy": {
    "fundingSources":["..."],
    "grantsAndSchemes":["..."],
    "capitalPlan":"...",
    "useOfFunds":"..."
  },
  "goToMarketStrategy": {
    "positioning":"...",
    "channels":["..."],
    "acquisitionPlan":"...",
    "partnerships":["..."]
  },
  "risksAndMitigation":["..."],
  "roadmap": {
    "phase0to3Months":["..."],
    "phase3to6Months":["..."],
    "phase6to12Months":["..."]
  },
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
- Use the provided vector snippets for policy, scheme, legal, funding, and compliance references; if uncertain, explicitly state verification is required.
- Include realistic India-specific funding, state-policy, and compliance references when the retrieved snippets support them.
- Ensure the blueprint can support PDF and PPT exports with crisp section-ready content.
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
    retrievedKnowledge: ranked.map((x) => ({ id: x.id, title: x.title, score: Number((x.score || 0).toFixed(4)) })),
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

  const COLORS = {
    bg: "0B1220",
    panel: "0F172A",
    text: "E6EEF8",
    muted: "AAB6C5",
    accent: "22D3EE",
    accent2: "3B82F6",
    darkText: "111827",
    line: "223047",
  };

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

  const clampLines = (text, maxLen = 140) => {
    const s = safeText(text).replace(/\s+/g, " ").trim();
    if (!s) return "";
    return s.length > maxLen ? `${s.slice(0, maxLen - 1)}…` : s;
  };

  const addHeader = (slide, title, subtitle = "") => {
    slide.background = { color: COLORS.bg };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.9, fill: { color: COLORS.panel } });
    slide.addText(title, { x: 0.6, y: 0.2, w: 12.2, h: 0.6, fontSize: 28, bold: true, color: COLORS.text });
    if (subtitle) {
      slide.addText(subtitle, { x: 0.6, y: 0.82, w: 12.2, h: 0.3, fontSize: 12, color: COLORS.muted });
    }
    slide.addShape(pptx.ShapeType.line, { x: 0.6, y: 1.05, w: 12.2, h: 0, line: { color: COLORS.line, width: 1 } });
  };

  const addBullets = (slide, bullets) => {
    const items = (bullets || []).map((item) => clampLines(item)).filter(Boolean).slice(0, 10);
    const rich = items.map((t) => ({ text: t, options: { bullet: { indent: 18 }, hanging: 6 } }));
    slide.addText(rich.length ? rich : [{ text: "—", options: {} }], {
      x: 0.9,
      y: 1.25,
      w: 11.9,
      h: 5.75,
      fontSize: 18,
      color: COLORS.text,
    });
  };

  const addSlide = (title, bullets, subtitle = "") => {
    const slide = pptx.addSlide();
    addHeader(slide, title, subtitle);
    addBullets(slide, bullets);
  };

  // Title slide
  {
    const slide = pptx.addSlide();
    slide.background = { color: COLORS.bg };
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 7.5, fill: { color: COLORS.bg } });
    slide.addText("STARTUP BLUEPRINT", { x: 0.85, y: 1.6, w: 11.6, h: 0.6, fontSize: 44, bold: true, color: COLORS.accent });
    slide.addText(clampLines(data.title, 80), { x: 0.85, y: 2.35, w: 11.6, h: 0.7, fontSize: 30, bold: true, color: COLORS.text });
    slide.addShape(pptx.ShapeType.line, { x: 0.85, y: 3.2, w: 11.6, h: 0, line: { color: COLORS.line, width: 2 } });
    slide.addText(
      [
        `Idea: ${blueprintRecord.idea}`,
        `Location: ${blueprintRecord.location}`,
        `Category: ${blueprintRecord.category}`,
        `Budget: ${blueprintRecord.budget} ${blueprintRecord.unit}`,
      ].join(" • "),
      { x: 0.85, y: 3.35, w: 11.6, h: 0.5, fontSize: 14, color: COLORS.muted }
    );
    slide.addShape(pptx.ShapeType.rect, { x: 0.85, y: 4.15, w: 11.6, h: 2.6, fill: { color: COLORS.panel }, line: { color: COLORS.line } });
    slide.addText("Executive Summary", { x: 1.15, y: 4.35, w: 11.0, h: 0.4, fontSize: 18, bold: true, color: COLORS.text });
    slide.addText(clampLines(data.executiveSummary, 520) || "—", { x: 1.15, y: 4.8, w: 11.0, h: 1.8, fontSize: 16, color: COLORS.text });
    slide.addText("Generated by StartGenie AI", { x: 0.85, y: 7.1, w: 11.6, h: 0.3, fontSize: 10, color: COLORS.muted });
  }

  addSlide("Problem", [data.problemStatement], "What users struggle with today");
  addSlide("Solution", [data.solutionDesign], "How we solve it (MVP-first)");
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
  addSlide("SWOT", [
    ...data.swot.strengths.map((x) => `Strength: ${x}`),
    ...data.swot.weaknesses.map((x) => `Weakness: ${x}`),
    ...data.swot.opportunities.map((x) => `Opportunity: ${x}`),
    ...data.swot.threats.map((x) => `Threat: ${x}`),
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
  addSlide("Funding Strategy", [
    ...data.fundingStrategy.fundingSources.map((x) => `Source: ${x}`),
    ...data.fundingStrategy.grantsAndSchemes.map((x) => `Scheme: ${x}`),
    `Capital plan: ${data.fundingStrategy.capitalPlan}`,
    `Use of funds: ${data.fundingStrategy.useOfFunds}`,
  ]);
  addSlide("Go To Market", [
    `Positioning: ${data.goToMarketStrategy.positioning}`,
    ...data.goToMarketStrategy.channels.map((x) => `Channel: ${x}`),
    `Acquisition plan: ${data.goToMarketStrategy.acquisitionPlan}`,
    ...data.goToMarketStrategy.partnerships.map((x) => `Partnership: ${x}`),
  ]);
  addSlide("Risks", data.risksAndMitigation);
  addSlide("Roadmap", [
    ...data.roadmap.phase0to3Months.map((x) => `0-3M: ${x}`),
    ...data.roadmap.phase3to6Months.map((x) => `3-6M: ${x}`),
    ...data.roadmap.phase6to12Months.map((x) => `6-12M: ${x}`),
  ]);
  addSlide("Next 90 Days", data.milestones90Days);
  addSlide("Pitch Deck Outline", data.investorPitchSlides.length ? data.investorPitchSlides : [data.callToAction]);
  addSlide("Next Step", [data.callToAction], "What to do after this deck");

  return pptx.write({ outputType: "nodebuffer" });
}
