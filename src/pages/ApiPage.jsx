import React from "react";
import { Link } from "react-router-dom";

const CodeBlock = ({ children }) => (
  <pre className="mt-3 rounded-xl bg-[#0b1220] text-slate-100 border border-white/10 p-4 overflow-auto text-sm leading-6">
    <code>{children}</code>
  </pre>
);

const Section = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-24">
    <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
    <div className="mt-3 text-slate-300 leading-7">{children}</div>
  </section>
);

export default function ApiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#071029] text-[#e6eef8]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1220]/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-white font-bold">
            StartGenie AI
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-300">
            <Link to="/docs" className="hover:text-white">
              Documentation
            </Link>
            <Link to="/login" className="hover:text-white">
              Login
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-[260px,1fr] gap-8">
        <aside className="hidden md:block">
          <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-3">On this page</div>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#intro" className="text-slate-200 hover:text-cyan-300">
                  Introduction
                </a>
              </li>
              <li>
                <a href="#base-url" className="text-slate-200 hover:text-cyan-300">
                  Base URL
                </a>
              </li>
              <li>
                <a href="#endpoint" className="text-slate-200 hover:text-cyan-300">
                  Example Endpoint
                </a>
              </li>
              <li>
                <a href="#auth" className="text-slate-200 hover:text-cyan-300">
                  Authentication
                </a>
              </li>
              <li>
                <a href="#limits" className="text-slate-200 hover:text-cyan-300">
                  Rate Limits
                </a>
              </li>
            </ul>
          </div>
        </aside>

        <main className="space-y-10">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">StartGenie AI Developer API</h1>
            <p className="mt-3 text-slate-300 leading-7">
              This is a reference-style API page to make the platform feel like a real SaaS product. The endpoints shown
              below are examples and may not be publicly available.
            </p>
          </div>

          <Section id="intro" title="Introduction">
            <p>
              The StartGenie AI API is designed for developers who want to integrate blueprint generation and startup
              advisory flows into their own applications.
            </p>
            <ul className="mt-3 list-disc ml-5 space-y-1">
              <li>JSON over HTTPS</li>
              <li>Versioned base URLs</li>
              <li>Bearer token authentication</li>
            </ul>
          </Section>

          <Section id="base-url" title="Base URL">
            <p>Example base URL:</p>
            <CodeBlock>{`https://api.startgenie.ai/v1`}</CodeBlock>
          </Section>

          <Section id="endpoint" title="Example Endpoint: Generate Blueprint">
            <p className="text-slate-200 font-semibold mt-2">POST /generate-blueprint</p>
            <p className="mt-2">
              Generates a structured startup blueprint based on a short idea and a few basic inputs.
            </p>

            <h3 className="text-white font-semibold mt-6">Example request</h3>
            <CodeBlock>{`POST https://api.startgenie.ai/v1/generate-blueprint
Authorization: Bearer <YOUR_API_KEY>
Content-Type: application/json

{
  "idea": "AI assistant for small cafes to reduce waste and improve margins",
  "location": "Pune",
  "category": "SaaS",
  "budget": "INR 2 - 5 Lakhs",
  "unit": "INR"
}`}</CodeBlock>

            <h3 className="text-white font-semibold mt-6">Example response</h3>
            <CodeBlock>{`{
  "id": "bp_9f3a2c1b",
  "status": "ready",
  "blueprint": {
    "title": "CafeOps AI Blueprint",
    "executiveSummary": "A lightweight AI ops assistant that helps cafes forecast demand, reduce wastage, and improve profitability.",
    "marketAnalysis": {
      "marketSize": "TAM/SAM/SOM summary...",
      "competitors": ["Competitor A", "Competitor B"],
      "trends": ["Trend 1", "Trend 2"]
    }
  }
}`}</CodeBlock>
          </Section>

          <Section id="auth" title="Authentication">
            <p>
              Use a bearer token in the <span className="text-slate-200 font-semibold">Authorization</span> header:
            </p>
            <CodeBlock>{`Authorization: Bearer <YOUR_API_KEY>`}</CodeBlock>
            <p className="mt-3">
              Keys should be treated as secrets. Never expose them in client-side code.
            </p>
          </Section>

          <Section id="limits" title="Rate Limits">
            <p>
              Example limits (for documentation purposes):
            </p>
            <ul className="mt-3 list-disc ml-5 space-y-1">
              <li>60 requests/minute per API key</li>
              <li>10 blueprint generations/minute per API key</li>
              <li>429 responses returned when rate limited</li>
            </ul>
          </Section>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-slate-300">
              Looking for platform usage docs? Go to{" "}
              <Link className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2" to="/docs">
                Documentation
              </Link>
              .
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

