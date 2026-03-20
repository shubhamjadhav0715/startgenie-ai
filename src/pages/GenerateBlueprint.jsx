import React, { useState } from "react";
import { api, API_BASE_URL } from "../lib/api";

const budgetRanges = {
  INR: ["INR 0 - 2 Lakhs", "INR 2 - 5 Lakhs", "INR 5 - 10 Lakhs", "INR 10 - 25 Lakhs", "INR 25 Lakhs+"],
  USD: ["USD 0 - 2K", "USD 2K - 6K", "USD 6K - 12K", "USD 12K - 30K", "USD 30K+"],
};

function GenerateBlueprint() {
  const [idea, setIdea] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [unit, setUnit] = useState("INR");
  const [result, setResult] = useState(null);
  const [statusLines, setStatusLines] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  const qa = questions.map((q) => ({ q, a: answers[q] || "" })).filter((x) => x.a.trim());
  const hasInputs = Boolean(idea.trim() && location && category);

  const steps = [
    { id: "inputs", label: "Inputs" },
    { id: "questions", label: "Questions" },
    { id: "generate", label: "Generate" },
    { id: "preview", label: "Preview" },
    { id: "export", label: "Export" },
  ];

  const currentStepId = (() => {
    if (isExporting) return "export";
    if (result?.status === "ready") return "export";
    if (result?.preview) return "preview";
    if (isGenerating) return "generate";
    if (isAsking || questions.length > 0) return "questions";
    return "inputs";
  })();

  const completedSteps = new Set(
    [
      hasInputs ? "inputs" : null,
      questions.length > 0 ? "questions" : null,
      result ? "generate" : null,
      result?.preview ? "preview" : null,
      result?.status === "ready" ? "export" : null,
    ].filter(Boolean)
  );

  const currentIndex = Math.max(0, steps.findIndex((s) => s.id === currentStepId));

  const handleAskQuestions = async () => {
    if (!idea.trim()) return alert("Please enter your idea or keyword.");
    if (!location) return alert("Please select a location.");
    if (!category) return alert("Please select a category.");

    try {
      setIsAsking(true);
      setQuestions([]);
      setAnswers({});
      setStatusLines(["Generating a few clarifying questions to improve your blueprint..."]);
      const data = await api("/blueprints/questions", {
        method: "POST",
        body: JSON.stringify({ idea, location, category, budget: budget || "Not specified", unit }),
      });
      setQuestions(data.questions || []);
      setStatusLines((prev) => [...prev, "Answer the questions (optional), then click Generate."]);
    } catch (error) {
      alert(error.message);
      setStatusLines([]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleGenerate = async () => {
    if (!idea.trim()) return alert("Please enter your idea or keyword.");
    if (!location) return alert("Please select a location.");
    if (!category) return alert("Please select a category.");

    try {
      setIsGenerating(true);
      setResult(null);
      setStatusLines(["Analyzing your startup inputs..."]);
      const data = await api("/blueprints/generate", {
        method: "POST",
        body: JSON.stringify({ idea, location, category, budget: budget || "Not specified", unit, qa }),
      });
      setResult(data.blueprint);
      setStatusLines(data.progress || []);
    } catch (error) {
      alert(error.message);
      setStatusLines([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (format) => {
    if (!result) return alert("Generate blueprint first");
    if (!format) return alert("Select export format");

    try {
      setIsExporting(true);
      setStatusLines((prev) => [...prev, "Preparing export file..."]);
      if (format === "email") {
        const data = await api(`/blueprints/${result.id}/export`, {
          method: "POST",
          body: JSON.stringify({ format: "email" }),
        });
        alert(data.message || "Blueprint sent to your email.");
      } else {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/blueprints/${result.id}/export`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ format }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error || "Export failed");
        }

        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Startup_Blueprint.${format === "text" ? "txt" : format === "word" ? "docx" : format === "ppt" ? "pptx" : format}`;
        link.click();
        URL.revokeObjectURL(link.href);

        alert("Blueprint exported successfully. File is ready for presentation.");
      }
      setStatusLines((prev) => [...prev, "Export ready. Download completed."]);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="text-white w-full">
      <h2 className="text-3xl font-bold mb-6 text-center">Quick Blueprint Generator</h2>

      <div className="mb-6 bg-white/5 p-5 rounded-2xl border border-white/10">
        <div className="grid md:grid-cols-5 gap-3">
          {steps.map((step, idx) => {
            const isActive = idx === currentIndex;
            const isCompleted = completedSteps.has(step.id);
            return (
              <div
                key={step.id}
                className={`rounded-2xl border p-4 flex items-center gap-3 ${
                  isCompleted
                    ? "border-emerald-300/40 bg-emerald-500/10"
                    : isActive
                      ? "border-cyan-300/40 bg-cyan-500/10"
                      : "border-white/10 bg-white/5"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border ${
                    isCompleted
                      ? "bg-emerald-400 text-black border-emerald-300"
                      : isActive
                        ? "bg-cyan-400 text-black border-cyan-300"
                        : "bg-white/5 text-slate-200 border-white/10"
                  }`}
                >
                  {isCompleted ? "✓" : idx + 1}
                </div>
                <div className="min-w-0">
                  <div className={`text-sm font-semibold ${isActive ? "text-cyan-200" : "text-slate-200"}`}>{step.label}</div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {step.id === "inputs" && (hasInputs ? "Ready" : "Required")}
                    {step.id === "questions" && (isAsking ? "Generating…" : questions.length ? "Optional" : "Skip OK")}
                    {step.id === "generate" && (isGenerating ? "Working…" : result ? "Done" : "Pending")}
                    {step.id === "preview" && (result?.preview ? "Available" : "After generate")}
                    {step.id === "export" && (isExporting ? "Preparing…" : result?.status === "ready" ? "Ready" : "After preview")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {statusLines.length > 0 && (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="text-xs text-slate-300">{statusLines[statusLines.length - 1]}</div>
          </div>
        )}
      </div>

      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
        <input
          type="text"
          placeholder="Enter your startup idea..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          className="w-full p-3 rounded-xl text-black mb-4"
        />

        <div className="grid md:grid-cols-4 gap-4 mb-4">
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="p-3 rounded-xl text-black">
            <option value="">Location</option>
            <option>Pune</option>
            <option>Mumbai</option>
            <option>Bengaluru</option>
            <option>Delhi</option>
            <option>Chennai</option>
            <option>Hyderabad</option>
            <option>Kolkata</option>
            <option>Goa</option>
            <option>Ahmedabad</option>
          </select>

          <select value={category} onChange={(e) => setCategory(e.target.value)} className="p-3 rounded-xl text-black">
            <option value="">Category</option>
            <option>Education</option>
            <option>Healthcare</option>
            <option>Fintech</option>
            <option>E-commerce</option>
            <option>Food & Delivery</option>
            <option>SaaS</option>
            <option>Logistics</option>
            <option>D2C / Retail</option>
          </select>

          <select value={budget} onChange={(e) => setBudget(e.target.value)} className="p-3 rounded-xl text-black">
            <option value="">Budget Range</option>
            {budgetRanges[unit].map((range) => (
              <option key={range}>{range}</option>
            ))}
          </select>

          <select
            value={unit}
            onChange={(e) => {
              setUnit(e.target.value);
              setBudget("");
            }}
            className="p-3 rounded-xl text-black"
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
          </select>
        </div>

        <div className="flex justify-center gap-4 mt-4 flex-wrap">
          <button
            onClick={handleAskQuestions}
            disabled={isAsking || isGenerating}
            className="bg-slate-200 hover:bg-slate-100 transition text-black px-6 py-3 rounded-xl font-semibold disabled:opacity-70"
          >
            {isAsking ? "Asking..." : "Ask AI Questions"}
          </button>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-cyan-400 hover:bg-cyan-300 transition text-black px-8 py-3 rounded-xl font-semibold disabled:opacity-70"
          >
            {isGenerating ? "Analyzing..." : "Generate"}
          </button>
        </div>
        {(isAsking || isGenerating || isExporting) && (
          <p className="text-xs text-cyan-200 text-center mt-3">
            {isAsking
              ? "Generating questions..."
              : isGenerating
                ? "Processing blueprint... analyzing, collecting vector context, and generating structure."
                : "Processing export... preparing your selected format file."}
          </p>
        )}
      </div>

      {result?.preview && (
        <div className="bg-white/5 mt-6 p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-bold text-cyan-300 mb-4">Blueprint Preview</h3>
          <div className="grid md:grid-cols-2 gap-5 text-sm text-slate-200">
            <div className="space-y-3">
              <div>
                <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Title</div>
                <div className="font-semibold">{result.preview.title}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Executive Summary</div>
                <div className="text-slate-200 leading-6">{result.preview.executiveSummary || "—"}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Problem</div>
                <div className="text-slate-200 leading-6">{result.preview.problemStatement || "—"}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Solution</div>
                <div className="text-slate-200 leading-6">{result.preview.solutionDesign || "—"}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Target Users</div>
                <ul className="list-disc ml-5 space-y-1">
                  {(result.preview.targetUsers || []).length ? result.preview.targetUsers.map((x) => <li key={x}>{x}</li>) : <li>—</li>}
                </ul>
              </div>
              <div>
                <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Market Snapshot</div>
                <div className="text-slate-200 leading-6">{result.preview.marketAnalysis?.marketSize || "—"}</div>
                <ul className="mt-2 list-disc ml-5 space-y-1">
                  {(result.preview.marketAnalysis?.competitors || []).slice(0, 4).map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Business Model</div>
                <ul className="list-disc ml-5 space-y-1">
                  {(result.preview.businessModel?.revenueStreams || []).slice(0, 5).map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                <div className="mt-2 text-slate-200">{result.preview.businessModel?.pricingStrategy || ""}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs uppercase tracking-wide mb-1">Next 90 Days</div>
                <ul className="list-disc ml-5 space-y-1">
                  {(result.preview.milestones90Days || []).slice(0, 6).map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {result?.status === "ready" && (
        <div className="bg-white/5 mt-6 p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-bold text-cyan-300 mb-4">Export</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { id: "pdf", label: "PDF", hint: "Shareable" },
              { id: "ppt", label: "PPT", hint: "Presentation" },
              { id: "word", label: "Word", hint: "Editable" },
              { id: "text", label: "Text", hint: "Quick copy" },
              { id: "email", label: "Email", hint: "Send PDF" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleExport(opt.id)}
                disabled={isExporting || isGenerating}
                className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-4 text-left disabled:opacity-60"
              >
                <div className="text-white font-semibold">{opt.label}</div>
                <div className="text-xs text-slate-400 mt-1">{opt.hint}</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-300 mt-4">Tip: PPT is styled for presentation. Word/Text are best for editing.</p>
        </div>
      )}

      {questions.length > 0 && (
        <div className="bg-white/5 mt-6 p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-bold text-cyan-300 mb-4">Quick Questions (Optional)</h3>
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q}>
                <p className="text-sm text-slate-200 mb-2">{q}</p>
                <input
                  value={answers[q] || ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [q]: e.target.value }))}
                  placeholder="Type your answer..."
                  className="w-full p-3 rounded-xl text-black"
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-300 mt-4">Tip: Better answers = better pitch deck and compliance checklist.</p>
        </div>
      )}

    </div>
  );
}

export default GenerateBlueprint;
