import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, clearSession } from "../lib/api";

const Settings = ({ embedded = false, onLogout }) => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [hasPassword, setHasPassword] = useState(true);

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [allowAnalytics, setAllowAnalytics] = useState(false);
  const [about, setAbout] = useState("");
  const [editEmail, setEditEmail] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // profile | security | preferences

  useEffect(() => {
    const init = async () => {
      try {
        const data = await api("/auth/me");
        setName(data.user.name || "");
        setEmail(data.user.email || "");
        setHasPassword(Boolean(data.user.hasPassword));
        setAllowAnalytics(Boolean(data.user.allowAnalytics));
        setAbout(data.user.about || "");
        setAvatar(data.user.avatarUrl || "");
      } catch (error) {
        alert(error.message);
      }
    };
    init();
  }, []);

  const handleSaveProfile = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2) return alert("Name must be at least 2 characters.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return alert("Please enter a valid email address.");

    try {
      const data = await api("/users/me", {
        method: "PUT",
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          about,
          allowAnalytics,
          avatarUrl: avatar,
        }),
      });

      localStorage.setItem("user", JSON.stringify(data.user));
      setEditEmail(false);
      alert("Profile updated.");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      return;
    }

    try {
      await api("/users/me", { method: "DELETE" });
      clearSession();
      alert("Account deleted.");
      navigate("/signup");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSavePassword = async () => {
    if (!newPass || !confirmPass) return alert("Fill all password fields");
    if (hasPassword && !oldPass) return alert("Old password is required.");
    if (newPass !== confirmPass) {
      alert("New passwords do not match");
      return;
    }
    if (newPass.length < 8) return alert("Password must be at least 8 characters.");

    try {
      await api("/users/me/password", {
        method: "PUT",
        body: JSON.stringify(hasPassword ? { oldPassword: oldPass, newPassword: newPass } : { newPassword: newPass }),
      });
      alert("Password changed successfully.");
      setHasPassword(true);
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSavePreferences = async () => {
    try {
      const data = await api("/users/me", {
        method: "PUT",
        body: JSON.stringify({ allowAnalytics }),
      });
      localStorage.setItem("user", JSON.stringify(data.user));
      alert("Preferences saved.");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result || "");
    reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    clearSession();
    if (onLogout) {
      onLogout();
      return;
    }
    navigate("/login");
  };

  const handleCreateNewAccount = () => {
    const ok = window.confirm("This will log you out and take you to Sign up. Continue?");
    if (!ok) return;
    clearSession();
    navigate("/signup");
  };

  return (
    <div className={`${embedded ? "" : "min-h-screen"} bg-[#0b1220] text-[#e6eef8] py-6 px-4`}>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 rounded-xl border ${activeTab === "profile" ? "border-cyan-400 bg-white/10" : "border-white/10 hover:bg-white/5"} transition`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`px-4 py-2 rounded-xl border ${activeTab === "security" ? "border-cyan-400 bg-white/10" : "border-white/10 hover:bg-white/5"} transition`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`px-4 py-2 rounded-xl border ${activeTab === "preferences" ? "border-cyan-400 bg-white/10" : "border-white/10 hover:bg-white/5"} transition`}
            >
              Preferences
            </button>
          </div>

          <div className="flex gap-3 justify-end">
            <button onClick={handleCreateNewAccount} className="text-slate-200 hover:underline text-sm">
              Create new account
            </button>
            <button onClick={handleLogout} className="text-red-400 hover:underline text-sm">
              Log out
            </button>
          </div>
        </div>

        {activeTab === "profile" && (
          <div className="bg-slate-800 rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-600 overflow-hidden flex items-center justify-center text-2xl">
                {avatar ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" /> : name ? name[0].toUpperCase() : "U"}
              </div>
              <label className="cursor-pointer text-cyan-400 hover:underline">
                Upload Avatar
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 rounded-md bg-slate-700 text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-slate-300 mb-1">Email</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  className={`w-full px-3 py-2 rounded-md bg-slate-700 text-white ${!editEmail ? "cursor-not-allowed opacity-80" : ""}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={!editEmail}
                />
                <button onClick={() => setEditEmail(!editEmail)} className="bg-cyan-600 px-3 py-2 rounded-md hover:opacity-90">
                  {editEmail ? "Cancel" : "Edit"}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2">Use a real email address so you can receive important updates.</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-slate-300 mb-1">About / Bio</label>
              <textarea
                rows="4"
                className="w-full px-3 py-2 rounded-md bg-slate-700 text-white"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Tell us a bit about you (optional)"
              />
            </div>

            <div className="flex justify-end mt-2">
              <button onClick={handleSaveProfile} className="bg-cyan-600 px-4 py-2 rounded-md hover:opacity-90">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="bg-slate-800 rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-1">Security</h2>
            <p className="text-sm text-slate-400 mb-4">
              {hasPassword ? "Change your password anytime." : "You signed up with Google. Set a password if you also want email/password login."}
            </p>

            {hasPassword && (
              <div className="mb-4">
                <label className="block text-sm text-slate-300 mb-1">Old Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-3 py-2 rounded-md bg-slate-700 text-white"
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  placeholder="Enter old password"
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm text-slate-300 mb-1">New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 rounded-md bg-slate-700 text-white"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-slate-300 mb-1">Confirm New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-3 py-2 rounded-md bg-slate-700 text-white"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Re-enter new password"
              />
            </div>
            <label className="flex items-center gap-2 mb-4">
              <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
              <span className="text-slate-300">Show passwords</span>
            </label>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <button onClick={handleSavePassword} className="bg-cyan-600 px-4 py-2 rounded-md hover:opacity-90">
                {hasPassword ? "Change Password" : "Set Password"}
              </button>

              <button onClick={handleDeleteAccount} className="bg-red-500 px-4 py-2 rounded-md hover:opacity-90">
                Delete Account
              </button>
            </div>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="bg-slate-800 rounded-2xl p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Preferences</h2>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={allowAnalytics} onChange={(e) => setAllowAnalytics(e.target.checked)} />
              <span className="text-slate-300">Allow anonymous analytics</span>
            </label>
            <div className="mt-4 flex justify-end">
              <button onClick={handleSavePreferences} className="bg-cyan-600 px-4 py-2 rounded-md hover:opacity-90">
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
