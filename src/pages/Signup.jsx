import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import TermsModal from "../components/TermsModal";
import GoogleSignInButton from "../components/GoogleSignInButton";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terms, setTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirm) {
      alert("Please fill all fields.");
      return;
    }

    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }

    if (!terms) {
      alert("Please accept the terms and conditions.");
      return;
    }

    try {
      setLoading(true);
      const data = await api("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      alert(data.message || "Account created. Please verify your email.");
      navigate("/login");
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
        <p className="text-center text-slate-400 text-sm mb-6">Create your account to start building smarter startups</p>

        <GoogleSignInButton
          onDone={(data) => {
            alert("Signup successful.");
            navigate(data.needsPasswordSetup ? "/set-password" : "/ai-advisor");
          }}
        />

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="px-3 text-xs text-slate-400">OR</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

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
                placeholder="Create password"
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

          <div>
            <label className="block text-sm text-slate-300 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-cyan-400 hover:text-cyan-300"
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex items-start text-sm">
            <input
              type="checkbox"
              checked={terms}
              readOnly
              className="mr-2 mt-1"
            />
            <label className="text-slate-300">
              I agree to the{" "}
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
              >
                Terms and Conditions
              </button>{" "}
              and Privacy Policy
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition shadow-lg"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="px-3 text-xs text-slate-400">ALREADY REGISTERED?</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <Link
          to="/login"
          className="block text-center w-full border border-cyan-400 text-cyan-300 py-3 rounded-xl hover:bg-cyan-400/10 transition font-medium"
        >
          Sign In Instead
        </Link>

        <p className="text-center text-sm text-slate-400 mt-6">
          <Link to="/" className="text-cyan-400 hover:text-cyan-300 hover:underline transition">
            Back to Homepage
          </Link>
        </p>
      </div>

      {showTerms && (
        <TermsModal
          onClose={() => setShowTerms(false)}
          onAccept={() => {
            setTerms(true);
            setShowTerms(false);
          }}
        />
      )}
    </div>
  );
};

export default Signup;
