import React, { useState } from "react";

/* ---------------- ESTIMATE COST ---------------- */
const estimateCost = (cat) => {
  switch ((cat || "").toLowerCase()) {
    case "education":
      return "₹2L - ₹6L";
    case "healthcare":
      return "₹3L - ₹8L";
    case "fintech":
      return "₹8L - ₹25L";
    case "e-commerce":
      return "₹4L - ₹12L";
    case "food & delivery":
      return "₹3L - ₹8L";
    case "saas":
      return "₹5L - ₹20L";
    default:
      return "₹3L - ₹10L";
  }
};

/* ---------------- TARGET DEMO ---------------- */
const targetDemo = (cat) => {
  switch ((cat || "").toLowerCase()) {
    case "education":
      return "Students & working professionals";
    case "healthcare":
      return "Health-conscious adults & clinics";
    case "fintech":
      return "SMBs & tech-savvy consumers";
    case "e-commerce":
      return "Urban online shoppers";
    default:
      return "Urban consumers aged 20-45";
  }
};

/* ---------------- ESCAPE HTML ---------------- */
const escapeHtml = (str) => {
  return String(str).replace(
    /[&<>"']/g,
    (s) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[s])
  );
};

/* ---------------- BUDGET RANGES ---------------- */
const budgetRanges = {
  INR: [
    "₹0 - ₹2 Lakhs",
    "₹2 - ₹5 Lakhs",
    "₹5 - ₹10 Lakhs",
    "₹10 - ₹25 Lakhs",
    "₹25 Lakhs+",
  ],
  USD: [
    "$0 - $2K",
    "$2K - $6K",
    "$6K - $12K",
    "$12K - $30K",
    "$30K+",
  ],
};

/* ================= COMPONENT ================= */
function GenerateBlueprint() {
  const [idea, setIdea] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [unit, setUnit] = useState("INR");
  const [result, setResult] = useState(null);
  const [exportFormat, setExportFormat] = useState("");

  /* ---------------- GENERATE ---------------- */
  const handleGenerate = () => {
    if (!idea.trim()) return alert("Please enter your idea or keyword.");
    if (!location) return alert("Please select a location.");
    if (!category) return alert("Please select a category.");

    setResult({
      idea: escapeHtml(idea),
      location,
      category,
      budget: budget || "Not specified",
      estimateCost: estimateCost(category),
      targetDemo: targetDemo(category),
    });
  };

  /* ---------------- EXPORT ---------------- */
  const handleExport = () => {
    if (!result) return alert("Generate blueprint first");
    if (!exportFormat) return alert("Select export format");

    const content = `
Startup Idea: ${result.idea}
Location: ${result.location}
Category: ${result.category}
Budget: ${result.budget}
Estimated Cost: ${result.estimateCost}
Target Market: ${result.targetDemo}
`;

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);

    if (exportFormat === "text")
      link.download = "Startup_Blueprint.txt";
    if (exportFormat === "pdf")
      link.download = "Startup_Blueprint.pdf";
    if (exportFormat === "word")
      link.download = "Startup_Blueprint.doc";
    if (exportFormat === "ppt")
      link.download = "Startup_Blueprint.ppt";

    link.click();

    /* ✅ Success Message */
    alert("Blueprint exported successfully ✅");

    /* Reset export format */
    setExportFormat("");
  };

  /* ================= UI ================= */
  return (
    <div className="text-white w-full">

      {/* TITLE CENTER */}
      <h2 className="text-3xl font-bold mb-6 text-center">
        ⚡ Quick Blueprint Generator
      </h2>

      {/* FORM */}
      <div className="bg-white/5 p-6 rounded-2xl border border-white/10">

        {/* IDEA */}
        <input
          type="text"
          placeholder="Enter your startup idea..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          className="w-full p-3 rounded-xl text-black mb-4"
        />

        {/* GRID */}
        <div className="grid md:grid-cols-4 gap-4 mb-4">

          {/* LOCATION */}
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="p-3 rounded-xl text-black"
          >
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

          {/* CATEGORY */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-3 rounded-xl text-black"
          >
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

          {/* BUDGET RANGE (Dynamic) */}
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="p-3 rounded-xl text-black"
          >
            <option value="">Budget Range</option>

            {budgetRanges[unit].map((range, i) => (
              <option key={i}>{range}</option>
            ))}
          </select>

          {/* CURRENCY */}
          <select
            value={unit}
            onChange={(e) => {
              setUnit(e.target.value);
              setBudget(""); // reset range on currency change
            }}
            className="p-3 rounded-xl text-black"
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
          </select>

        </div>

        {/* BUTTONS */}
        <div className="flex justify-center gap-4 mt-4 flex-wrap">

          <button
            onClick={handleGenerate}
            className="bg-cyan-400 hover:bg-cyan-300 transition text-black px-8 py-3 rounded-xl font-semibold"
          >
            Generate
          </button>

          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="px-4 py-3 rounded-xl text-black"
          >
            <option value="">Export Format</option>
            <option value="text">Text</option>
            <option value="pdf">PDF</option>
            <option value="word">Word</option>
            <option value="ppt">PPT</option>
          </select>

          <button
            onClick={handleExport}
            className="bg-green-400 hover:bg-green-300 transition text-black px-8 py-3 rounded-xl font-semibold"
          >
            Export
          </button>

        </div>
      </div>

      {/* RESULT */}
      {result && (
        <div className="bg-white/5 mt-6 p-6 rounded-2xl border border-white/10">

          <h3 className="text-xl font-bold text-cyan-300 mb-4">
            📊 Blueprint Result
          </h3>

          <div className="space-y-2 text-sm">
            <p>💡 Idea: {result.idea}</p>
            <p>📍 Location: {result.location}</p>
            <p>🏷 Category: {result.category}</p>
            <p>💰 Budget: {result.budget}</p>
            <p>💸 Estimated Cost: {result.estimateCost}</p>
            <p>🎯 Target Market: {result.targetDemo}</p>
          </div>

        </div>
      )}
    </div>
  );
}

export default GenerateBlueprint;
