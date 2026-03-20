import React from "react";
import { Link } from "react-router-dom";

const Section = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-24">
    <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
    <div className="mt-3 text-slate-300 leading-7">{children}</div>
  </section>
);

const Callout = ({ title, children }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
    <div className="text-white font-semibold">{title}</div>
    <div className="mt-2 text-slate-300 leading-7">{children}</div>
  </div>
);

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#071029] text-[#e6eef8]">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1220]/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-white font-bold">
            StartGenie AI
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-300">
            <Link to="/api" className="hover:text-white">
              API
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
            <div className="text-xs uppercase tracking-wide text-slate-400 mb-3">Contents</div>
            <ul className="space-y-2 text-sm">
              <li>
                <a className="text-slate-200 hover:text-cyan-300" href="#getting-started">
                  Getting Started
                </a>
              </li>
              <li>
                <a className="text-slate-200 hover:text-cyan-300" href="#features">
                  Platform Features
                </a>
              </li>
              <li>
                <a className="text-slate-200 hover:text-cyan-300" href="#blueprint-guide">
                  Blueprint Generator
                </a>
              </li>
              <li>
                <a className="text-slate-200 hover:text-cyan-300" href="#exports">
                  Export Options
                </a>
              </li>
            </ul>
          </div>
        </aside>

        <main className="space-y-10">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white">Documentation</h1>
            <p className="mt-3 text-slate-300 leading-7">
              Learn how to use StartGenie AI like a real startup SaaS platform—from chatting with the AI Advisor to
              generating a pitch-ready blueprint.
            </p>
          </div>

          <Section id="getting-started" title="Getting Started">
            <ol className="mt-3 list-decimal ml-5 space-y-2">
              <li>
                Create an account on the <Link className="text-cyan-300 underline underline-offset-2" to="/signup">Signup</Link> page.
              </li>
              <li>Log in and open the AI Advisor dashboard.</li>
              <li>Start with your idea and answer follow-up questions for better output.</li>
              <li>When you want a full business blueprint, switch to Generate Blueprint.</li>
            </ol>

            <Callout title="Tip">
              The best results come from concrete inputs: customer type, problem severity, pricing, and distribution channel.
            </Callout>
          </Section>

          <Section id="features" title="Platform Features">
            <ul className="mt-3 grid md:grid-cols-2 gap-4">
              <li className="rounded-xl border border-white/10 bg-[#0b1220]/40 p-4">
                <div className="text-white font-semibold">AI Advisor</div>
                <div className="text-slate-300 mt-1 text-sm">Ask normal startup questions. Get concise answers + follow-ups.</div>
              </li>
              <li className="rounded-xl border border-white/10 bg-[#0b1220]/40 p-4">
                <div className="text-white font-semibold">Blueprint Generator</div>
                <div className="text-slate-300 mt-1 text-sm">Generate a structured blueprint and export it for sharing.</div>
              </li>
              <li className="rounded-xl border border-white/10 bg-[#0b1220]/40 p-4">
                <div className="text-white font-semibold">Library</div>
                <div className="text-slate-300 mt-1 text-sm">Saved AI-generated visuals/diagrams live here.</div>
              </li>
              <li className="rounded-xl border border-white/10 bg-[#0b1220]/40 p-4">
                <div className="text-white font-semibold">History</div>
                <div className="text-slate-300 mt-1 text-sm">Access previous chats and continue where you left off.</div>
              </li>
            </ul>
          </Section>

          <Section id="blueprint-guide" title="Guide: Using the Blueprint Generator">
            <ol className="mt-3 list-decimal ml-5 space-y-2">
              <li>Open the dashboard and click the Generate Blueprint tab.</li>
              <li>Enter your startup idea, location, category, and budget range.</li>
              <li>
                (Optional) Click <span className="text-slate-100 font-semibold">Ask AI Questions</span> and answer the
                quick questions for a more accurate blueprint.
              </li>
              <li>Click Generate to produce the blueprint and enable export.</li>
            </ol>

            <Callout title="What the AI uses">
              Blueprint generation uses structured prompts + internal knowledge snippets to produce a practical, investor-ready output.
            </Callout>
          </Section>

          <Section id="exports" title="Export Functionality">
            <p>Export the generated blueprint in one of these formats:</p>
            <ul className="mt-3 list-disc ml-5 space-y-1">
              <li>PDF (shareable document)</li>
              <li>Word / DOCX (editable)</li>
              <li>PPT / PPTX (presentation-ready deck)</li>
              <li>Text / TXT (quick copy-paste)</li>
              <li>Email (PDF) (send to your logged-in email)</li>
            </ul>
          </Section>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-slate-300">
              Need API reference? Go to{" "}
              <Link className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2" to="/api">
                StartGenie AI Developer API
              </Link>
              .
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

