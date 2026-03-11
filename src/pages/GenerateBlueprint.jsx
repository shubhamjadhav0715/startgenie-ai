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
  const [exportFormat, setExportFormat] = useState("");

  const handleGenerate = async () => {
    if (!idea.trim()) return alert("Please enter your idea or keyword.");
    if (!location) return alert("Please select a location.");
    if (!category) return alert("Please select a category.");

    try {
      setIsGenerating(true);
      setResult(null);
      setStatusLines(["Analyzing and collecting startup data from vector knowledge..."]);
      const data = await api("/blueprints/generate", {
        method: "POST",
        body: JSON.stringify({ idea, location, category, budget: budget || "Not specified", unit }),
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

  const handleExport = async () => {
    if (!result) return alert("Generate blueprint first");
    if (!exportFormat) return alert("Select export format");

    try {
      setIsExporting(true);
      setStatusLines((prev) => [...prev, "Preparing export file..."]);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/blueprints/${result.id}/export`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ format: exportFormat }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "Export failed");
      }

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Startup_Blueprint.${exportFormat === "text" ? "txt" : exportFormat === "word" ? "docx" : exportFormat === "ppt" ? "pptx" : exportFormat}`;
      link.click();
      URL.revokeObjectURL(link.href);

      alert("Blueprint exported successfully. File is ready for presentation.");
      setExportFormat("");
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
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-cyan-400 hover:bg-cyan-300 transition text-black px-8 py-3 rounded-xl font-semibold disabled:opacity-70"
          >
            {isGenerating ? "Analyzing..." : "Generate"}
          </button>

          <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} className="px-4 py-3 rounded-xl text-black">
            <option value="">Export Format</option>
            <option value="text">Text</option>
            <option value="pdf">PDF</option>
            <option value="word">Word</option>
            <option value="ppt">PPT</option>
          </select>

          <button
            onClick={handleExport}
            disabled={isExporting || isGenerating}
            className="bg-green-400 hover:bg-green-300 transition text-black px-8 py-3 rounded-xl font-semibold disabled:opacity-70"
          >
            {isExporting ? "Exporting..." : "Export"}
          </button>
        </div>
        {(isGenerating || isExporting) && (
          <p className="text-xs text-cyan-200 text-center mt-3">
            {isGenerating
              ? "Processing blueprint... analyzing, collecting vector context, and generating structure."
              : "Processing export... preparing your selected format file."}
          </p>
        )}
      </div>

      {statusLines.length > 0 && (
        <div className="bg-white/5 mt-6 p-6 rounded-2xl border border-white/10">
          <h3 className="text-xl font-bold text-cyan-300 mb-4">Blueprint Generation Status</h3>
          <div className="space-y-2 text-sm">
            {statusLines.map((line, idx) => (
              <p key={`${line}-${idx}`}>{line}</p>
            ))}
            {result?.status === "ready" && (
              <p className="text-green-300 font-semibold">
                Now it's ready. You can download or export in your selected format.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GenerateBlueprint;
