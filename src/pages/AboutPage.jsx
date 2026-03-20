import React from "react";
import { Link } from "react-router-dom";

const Section = ({ title, children }) => (
  <section className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
    <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
    <div className="mt-3 text-slate-300 leading-7">{children}</div>
  </section>
);

export default function AboutPage() {
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
            <Link to="/contact" className="hover:text-white">
              Contact
            </Link>
            <Link to="/login" className="hover:text-white">
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-10">
          <p className="text-cyan-300 text-sm font-semibold">About</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-white">What is StartGenie AI?</h1>
          <p className="mt-4 text-slate-300 leading-7 max-w-3xl">
            StartGenie AI is an AI-powered startup advisor that helps founders validate ideas, clarify positioning, and
            generate structured, presentation-ready blueprints—fast.
          </p>
        </div>

        <Section title="Purpose of the Project">
          <p>
            Founders often get stuck at the same points: choosing a target customer, defining the real problem, finding
            a distribution channel, and turning the concept into an execution plan. StartGenie AI is built to guide you
            through that journey using a chat-style experience and a blueprint generator.
          </p>
        </Section>

        <Section title="Key Features">
          <ul className="mt-3 grid md:grid-cols-2 gap-4">
            <li className="rounded-xl border border-white/10 bg-[#0b1220]/40 p-4">
              <div className="text-white font-semibold">AI Advisor</div>
              <div className="text-slate-300 mt-1 text-sm">Ask normal questions and get concise answers + follow-ups.</div>
            </li>
            <li className="rounded-xl border border-white/10 bg-[#0b1220]/40 p-4">
              <div className="text-white font-semibold">Blueprint Generator</div>
              <div className="text-slate-300 mt-1 text-sm">Generate a full blueprint with market + execution sections.</div>
            </li>
            <li className="rounded-xl border border-white/10 bg-[#0b1220]/40 p-4">
              <div className="text-white font-semibold">Market Insights</div>
              <div className="text-slate-300 mt-1 text-sm">Competitive and trend prompts to ground the strategy.</div>
            </li>
            <li className="rounded-xl border border-white/10 bg-[#0b1220]/40 p-4">
              <div className="text-white font-semibold">Export Options</div>
              <div className="text-slate-300 mt-1 text-sm">Export as PDF, Word, PPT, or Text for easy sharing.</div>
            </li>
          </ul>
        </Section>

        <Section title="Get Started">
          <p>
            Try the AI Advisor for quick questions, then switch to Blueprint Generator when you want a full plan and
            pitch deck outline.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/signup" className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold">
              Create Account
            </Link>
            <Link to="/docs" className="px-5 py-3 rounded-xl border border-white/10 text-slate-200 hover:bg-white/5 transition">
              Read Docs
            </Link>
          </div>
        </Section>
      </main>
    </div>
  );
}

