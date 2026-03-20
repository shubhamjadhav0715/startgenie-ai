import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";

export default function SetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirm) {
      alert("Please fill all fields.");
      return;
    }
    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await api("/users/me/password", {
        method: "PUT",
        body: JSON.stringify({ newPassword: password }),
      });
      const me = await api("/auth/me");
      localStorage.setItem("user", JSON.stringify(me.user));
      alert("Password set successfully.");
      navigate("/ai-advisor");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-b from-[#0f172a] to-[#071029]">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/10">
        <h1 className="text-3xl font-bold text-white text-center mb-1">Set Password</h1>
        <p className="text-center text-slate-400 text-sm mb-6">Create a password for email/password login</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">New Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-cyan-400 hover:text-cyan-300"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Confirm Password</label>
            <input
              type={show ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition shadow-lg disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Password"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          <Link to="/ai-advisor" className="text-cyan-400 hover:text-cyan-300 hover:underline transition">
            Skip for now
          </Link>
        </p>
      </div>
    </div>
  );
}

