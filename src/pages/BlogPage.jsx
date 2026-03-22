import React from "react";
import { Link } from "react-router-dom";

const posts = [
  {
    id: "ai-idea-validation",
    title: "How AI Can Help Validate Startup Ideas",
    date: "2026-03-20",
    summary: "A practical checklist for using AI to stress-test your idea, pricing, and distribution before you build.",
    content: [
      "Great startup ideas are rarely about the idea itself—they’re about clarity on customer, problem, and distribution.",
      "AI can help you move faster by generating hypotheses, competitor lists, and customer interview questions.",
      "Use AI to: (1) define target personas, (2) map alternatives, (3) craft a value proposition, (4) propose MVP scope, (5) draft a 90-day plan.",
      "Always validate outputs with real users. AI is a research accelerator, not a substitute for evidence.",
    ],
  },
  {
    id: "idea-to-business-plan",
    title: "Steps to Turn a Startup Idea Into a Business Plan",
    date: "2026-03-20",
    summary: "From one sentence to a blueprint: problem, solution, market, model, operations, and milestones.",
    content: [
      "Start with a single sentence: who, what problem, and why now.",
      "Define your MVP: the smallest feature set that proves value for one segment.",
      "Write a simple business model: pricing, gross margin, and what must be true to win.",
      "Add a milestone plan: customer discovery → MVP → pilot → repeatable acquisition.",
    ],
  },
  {
    id: "founder-mistakes",
    title: "Common Mistakes First-Time Founders Make",
    date: "2026-03-20",
    summary: "Avoid these traps: vague customers, unclear distribution, overbuilding, and weak feedback loops.",
    content: [
      "Building before talking to customers (and assuming the problem is real).",
      "Trying to serve everyone instead of one narrow segment.",
      "Ignoring distribution: ‘how will users find you?’ must be answered early.",
      "Not measuring: define 1–2 success metrics and review weekly.",
    ],
  },
];

const ArticleCard = ({ post }) => (
  <a
    href={`#${post.id}`}
    className="block rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition"
  >
    <div className="text-xs text-slate-400">{post.date}</div>
    <div className="mt-2 text-white font-bold text-lg">{post.title}</div>
    <div className="mt-2 text-slate-300 text-sm leading-6">{post.summary}</div>
  </a>
);

const Post = ({ post }) => (
  <article id={post.id} className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
    <div className="text-xs text-slate-400">{post.date}</div>
    <h2 className="mt-2 text-2xl font-extrabold text-white">{post.title}</h2>
    <p className="mt-3 text-slate-300 leading-7">{post.summary}</p>
    <div className="mt-5 space-y-3 text-slate-300 leading-7">
      {post.content.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </div>
  </article>
);

export default function BlogPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#0f172a] to-[#071029] text-[#e6eef8]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -left-28 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute bottom-0 right-1/2 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1220]/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-white font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">StartGenie</span>{" "}
            <span className="text-slate-200">AI</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-300">
            <Link to="/about" className="hover:text-white">
              About
            </Link>
            <Link to="/docs" className="hover:text-white">
              Docs
            </Link>
            <Link to="/contact" className="hover:text-white">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 py-10">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-10">
          <p className="text-cyan-300 text-sm font-semibold">Blog</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-white">Startup + AI Articles</h1>
          <p className="mt-4 text-slate-300 leading-7 max-w-3xl">
            A small set of static posts to make the platform feel like a real SaaS product. Content is general guidance—not legal or financial advice.
          </p>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {posts.map((p) => (
            <ArticleCard key={p.id} post={p} />
          ))}
        </div>

        <div className="mt-10 space-y-6">
          {posts.map((p) => (
            <Post key={`post-${p.id}`} post={p} />
          ))}
        </div>
      </main>
    </div>
  );
}

