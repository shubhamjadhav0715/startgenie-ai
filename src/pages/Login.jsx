import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api, setSession } from "../lib/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setSession(data.token, data.user);
      alert("Login successful. Welcome to AI Advisor.");
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
        <h1 className="text-3xl font-bold text-white text-center mb-1">StartGenie AI</h1>
        <p className="text-center text-slate-400 text-sm mb-6">Sign in to access your AI Startup Advisor</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-cyan-400 hover:text-cyan-300"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition shadow-lg"
          >
            {loading ? "Signing in..." : "Login to AI Advisor"}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="px-3 text-xs text-slate-400">NEW TO STARTGENIE?</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <Link
          to="/signup"
          className="block text-center w-full border border-cyan-400 text-cyan-300 py-3 rounded-xl hover:bg-cyan-400/10 transition font-medium"
        >
          Create Your Account
        </Link>

        <p className="text-center text-sm text-slate-400 mt-6">
          <Link to="/" className="text-cyan-400 hover:text-cyan-300 hover:underline transition">
            Back to Homepage
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
