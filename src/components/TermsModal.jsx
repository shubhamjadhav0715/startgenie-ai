import React, { useMemo, useRef, useState } from "react";

const DEFAULT_TERMS = `
StartGenie AI — Terms & Conditions (Summary)

1) Account
You are responsible for keeping your login secure and for all activity under your account.

2) Acceptable use
Do not misuse the service, attempt to break security, or upload illegal content.

3) AI output
AI responses may be incorrect. You are responsible for verifying decisions you make based on suggestions.

4) Privacy
We store your profile and app data to provide the service. Do not upload sensitive information.

5) Changes
We may update these terms. Continued use means you accept the updated terms.

This is placeholder text for development. Replace with your real Terms & Privacy Policy content.
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

      <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0b1220] text-white shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-300 hover:text-white transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="max-h-[55vh] overflow-auto px-5 py-4 text-sm text-slate-200 whitespace-pre-wrap leading-6"
        >
          {text}
        </div>

        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-white/10">
          <span className="text-xs text-slate-400">Scroll to the bottom to enable Accept.</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-white/10 text-slate-200 hover:bg-white/5 transition"
            >
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
