import React, { useEffect, useMemo, useRef, useState } from "react";
import { api, API_BASE_URL, setSession } from "../lib/api";

function resolveClientId() {
  const fromEnv = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const fromWindow = typeof window !== "undefined" ? window.__GOOGLE_CLIENT_ID__ : "";
  const id = (fromEnv || fromWindow || "").trim();
  if (!id || id.startsWith("%VITE_")) return "";
  return id;
}

export default function GoogleSignInButton({ onDone }) {
  const containerRef = useRef(null);
  const [clientId, setClientId] = useState(() => resolveClientId());
  const [gsiReady, setGsiReady] = useState(() => Boolean(typeof window !== "undefined" && window.google?.accounts?.id));
  const [configChecked, setConfigChecked] = useState(false);

  useEffect(() => {
    if (gsiReady) return undefined;
    if (typeof window === "undefined") return undefined;

    const existing = Array.from(document.querySelectorAll("script")).find((s) =>
      String(s.src || "").includes("accounts.google.com/gsi/client")
    );

    if (!existing) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => setGsiReady(true);
      script.onerror = () => setGsiReady(false);
      document.head.appendChild(script);
      return undefined;
    }

    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (window.google?.accounts?.id) {
        setGsiReady(true);
        clearInterval(timer);
      } else if (tries >= 40) {
        clearInterval(timer);
      }
    }, 200);

    return () => clearInterval(timer);
  }, [gsiReady]);

  useEffect(() => {
    if (clientId) return;
    if (configChecked) return;

    const run = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/config`, { headers: { "Content-Type": "application/json" } });
        if (!response.ok) return;
        const data = await response.json().catch(() => null);
        const fromServer = String(data?.googleClientId || "").trim();
        if (fromServer) {
          window.__GOOGLE_CLIENT_ID__ = fromServer;
          setClientId(fromServer);
        }
      } finally {
        setConfigChecked(true);
      }
    };

    run();
  }, [clientId, configChecked]);

  useEffect(() => {
    if (!clientId) return;
    if (!gsiReady) return;
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
  }, [clientId, gsiReady, onDone]);

  const helperText = useMemo(() => {
    if (clientId) return "";
    return "Google sign-in is not configured. Set GOOGLE_CLIENT_ID on backend (.env) or VITE_GOOGLE_CLIENT_ID on frontend (.env), then restart.";
  }, [clientId]);

  if (!clientId) {
    return (
      <div className="w-full flex flex-col items-center gap-2">
        <button
          type="button"
          disabled
          className="w-[320px] max-w-full px-4 py-3 rounded-full border border-white/15 bg-white/5 text-slate-200 opacity-70"
          title={helperText}
        >
          Continue with Google
        </button>
        <div className="text-xs text-slate-400 text-center max-w-[360px]">{helperText}</div>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full flex justify-center" />;
}
