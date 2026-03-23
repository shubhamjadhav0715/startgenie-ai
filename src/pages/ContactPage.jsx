import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      alert("Please fill all fields.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      setSubmitting(true);
      // Static form (no backend). This is for professional look & feel.
      await new Promise((r) => setTimeout(r, 500));
      alert("Message sent! Our team will get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#0f172a] to-[#071029] text-[#e6eef8]">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -left-28 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
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
            <Link to="/blog" className="hover:text-white">
              Blog
            </Link>
            <Link to="/docs" className="hover:text-white">
              Docs
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-10">
          <p className="text-cyan-300 text-sm font-semibold">Contact</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold text-white">Get in touch</h1>
          <p className="mt-4 text-slate-300 leading-7">
            Have a question, feature request, or want a demo? Send us a message and we’ll reply.
          </p>

          <div className="mt-6 space-y-3 text-slate-300">
            <div className="rounded-xl border border-white/10 bg-[#0b1220]/40 p-4">
              <div className="text-white font-semibold">Support email</div>
              <div className="mt-1 text-sm">
                <a className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2" href="mailto:startgenieaiteam@gmail.com">
                  startgenieaiteam@gmail.com
                </a>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0b1220]/40 p-4">
              <div className="text-white font-semibold">Social</div>
              <div className="mt-2 flex gap-4 text-sm">
                <a
                  className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
                  href="https://www.linkedin.com/in/bariya-shaikh-3952482a9/"
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>
                <a
                  className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
                  href="https://github.com/Pranjal416713"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
                <a
                  className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
                  href="https://www.instagram.com/guravsanika54?utm_source=qr&igsh=MXV0NWlpcmJrbGNtZA=="
                  target="_blank"
                  rel="noreferrer"
                >
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-10">
          <h2 className="text-xl font-bold text-white">Contact form</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Message</label>
              <textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                placeholder="How can we help?"
              />
            </div>

            <button
              disabled={submitting}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition shadow-lg disabled:opacity-60"
              type="submit"
            >
              {submitting ? "Sending..." : "Send message"}
            </button>
            <p className="text-xs text-slate-400">
              This form is a simple contact capture. It can be connected to support email or a helpdesk when needed.
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
