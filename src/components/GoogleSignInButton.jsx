import React, { useEffect, useRef } from "react";
import { api, setSession } from "../lib/api";

function resolveClientId() {
  const fromEnv = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const fromWindow = typeof window !== "undefined" ? window.__GOOGLE_CLIENT_ID__ : "";
  const id = (fromEnv || fromWindow || "").trim();
  if (!id || id.startsWith("%VITE_")) return "";
  return id;
}

export default function GoogleSignInButton({ onDone }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const clientId = resolveClientId();
    if (!clientId) return;
    if (!window.google?.accounts?.id) return;
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          const data = await api("/auth/google", {
            method: "POST",
            body: JSON.stringify({ credential: response.credential }),
          });

          setSession(data.token, data.user);
          onDone?.(data);
        } catch (error) {
          alert(error.message);
        }
      },
    });

    window.google.accounts.id.renderButton(containerRef.current, {
      theme: "outline",
      size: "large",
      width: 320,
      text: "continue_with",
      shape: "pill",
    });
  }, [onDone]);

  const clientId = resolveClientId();
  if (!clientId) {
    if (!import.meta.env.DEV) return null;
    return (
      <div className="w-full flex flex-col items-center gap-2">
        <button
          type="button"
          disabled
          className="w-[320px] max-w-full px-4 py-3 rounded-full border border-white/15 bg-white/5 text-slate-200 opacity-70"
          title="Set VITE_GOOGLE_CLIENT_ID in StartGenieAI_React/.env and restart the frontend dev server."
        >
          Continue with Google
        </button>
        <div className="text-xs text-slate-400 text-center">
          Google sign-in is disabled: set <span className="font-mono">VITE_GOOGLE_CLIENT_ID</span> in{" "}
          <span className="font-mono">StartGenieAI_React/.env</span> and restart <span className="font-mono">npm run dev</span>.
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full flex justify-center" />;
}
