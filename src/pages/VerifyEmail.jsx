import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [status, setStatus] = useState({ state: "loading", message: "Verifying your email..." });

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setStatus({ state: "error", message: "Missing verification token." });
        return;
      }
      try {
        const data = await api(`/auth/verify-email?token=${encodeURIComponent(token)}`);
        setStatus({ state: "ok", message: data.message || "Email verified successfully." });
      } catch (error) {
        setStatus({ state: "error", message: error.message });
      }
    };
    run();
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-b from-[#0f172a] to-[#071029]">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/10 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Email Verification</h1>
        <p className={`text-sm ${status.state === "ok" ? "text-emerald-300" : status.state === "error" ? "text-rose-300" : "text-slate-300"}`}>
          {status.message}
        </p>

        <div className="mt-6">
          <Link
            to="/login"
            className="inline-block w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition shadow-lg"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

