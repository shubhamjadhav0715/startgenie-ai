import React, { useMemo, useRef, useState } from "react";

const DEFAULT_TERMS = `
StartGenie AI - Terms & Conditions
Last updated: 22 March 2026

1) Overview
StartGenie AI provides an AI-powered startup advisory and blueprint generation platform. By creating an account or using the service, you agree to these Terms.

2) Eligibility and Accounts
- Provide accurate information and keep your credentials secure.
- You are responsible for activity under your account.
- Do not use the service for unlawful purposes.

3) Acceptable Use
You agree not to:
- attempt to interfere with system security or availability
- upload or share illegal, harmful, or infringing content
- misuse the platform to spam, scrape, or automate abusive behavior

4) AI Outputs and Disclaimer
- AI-generated content may be incomplete or incorrect.
- Verify important business, legal, financial, or compliance decisions independently.
- The platform does not provide professional legal/tax/financial advice.

5) Data and Privacy (Summary)
We store user data (profile, chats, and generated blueprints) to provide the service.
Please do not upload highly sensitive information (passwords, government IDs, card numbers, or confidential documents) unless explicitly required and secured.

6) Intellectual Property
The platform UI, branding, and software are owned by StartGenie AI. You retain rights to your own inputs and content you submit.

7) Suspension and Termination
We may suspend or terminate accounts that violate these Terms, or that create security or abuse risk.

8) Changes to Terms
We may update these Terms from time to time. Continued use after changes means you accept the updated Terms.

9) Contact
For support, contact: zeenatstudyzone@gmail.com
`;

export default function TermsModal({ title = "Terms & Conditions", onClose, onAccept, content }) {
  const scrollRef = useRef(null);
  const [canAccept, setCanAccept] = useState(false);

  const text = useMemo(() => (content || DEFAULT_TERMS).trim(), [content]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8;
    if (atBottom) setCanAccept(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-gradient-to-b from-[#0b1220] to-[#071029] text-white shadow-2xl overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <div className="text-xs text-slate-400 mt-0.5">Please read and scroll to the bottom to accept.</div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-300 hover:text-white transition" aria-label="Close">
            X
          </button>
        </div>

        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="relative max-h-[55vh] overflow-auto px-5 py-4 text-sm text-slate-200 whitespace-pre-wrap leading-7"
        >
          {text}
        </div>

        <div className="relative flex items-center justify-between gap-3 px-5 py-4 border-t border-white/10 bg-black/10">
          <span className="text-xs text-slate-400">{canAccept ? "You can now accept the Terms." : "Scroll to the bottom to enable Accept."}</span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-white/10 text-slate-200 hover:bg-white/5 transition">
              Close
            </button>
            <button
              type="button"
              disabled={!canAccept}
              onClick={onAccept}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold disabled:opacity-50"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

