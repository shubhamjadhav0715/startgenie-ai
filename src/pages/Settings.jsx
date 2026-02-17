// src/pages/Settings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();

  // Profile Info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState(null);

  // Change Password
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Preferences
  const [allowAnalytics, setAllowAnalytics] = useState(false);

  // About/Bio
  const [about, setAbout] = useState("");

  // Email edit toggle
  const [editEmail, setEditEmail] = useState(false);

useEffect(() => {

  localStorage.removeItem("sg_name");
  localStorage.removeItem("sg_email");

  // Load from localStorage (mock for now)
  setName(localStorage.getItem("sg_name") || "Guest");
  setEmail(localStorage.getItem("sg_email") || "guest@email.com");
  setAllowAnalytics(localStorage.getItem("sg_analytics") === "1");
  setAbout(localStorage.getItem("sg_about") || "");
}, []);

  const handleSaveProfile = () => {
    if (!name) {
      alert("Name cannot be empty!");
      return;
    }
    localStorage.setItem("sg_name", name);
    localStorage.setItem("sg_email", email);
    setEditEmail(false);
    alert("Profile updated!");
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      localStorage.clear();
      alert("Account deleted!");
      navigate("/signup");
    }
  };

  const handleSavePassword = () => {
    if (!oldPass || !newPass || !confirmPass) {
      alert("Fill all password fields");
      return;
    }
    if (newPass !== confirmPass) {
      alert("New passwords do not match");
      return;
    }
    alert("Password changed successfully!");
    setOldPass(""); setNewPass(""); setConfirmPass("");
  };

  const handleSavePreferences = () => {
    localStorage.setItem("sg_analytics", allowAnalytics ? "1" : "0");
    alert("Preferences saved!");
  };

  const handleSaveAbout = () => {
    localStorage.setItem("sg_about", about);
    alert("About/Bio saved!");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sg_auth");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#e6eef8] py-6 px-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        <div className="flex justify-end items-center">
  <button
    onClick={handleLogout}
    className="text-red-500 hover:underline"
  >
    Log out
  </button>
</div>

        {/* Profile Info */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Profile Info</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-600 overflow-hidden flex items-center justify-center text-2xl">
              {avatar ? (
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                name ? name[0].toUpperCase() : "U"
              )}
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
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <div className="flex gap-2">
              <input
                type="email"
                className={`w-full px-3 py-2 rounded-md bg-slate-700 text-white ${!editEmail && "cursor-not-allowed"}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={!editEmail}
              />
              <button
                onClick={() => setEditEmail(!editEmail)}
                className="bg-cyan-600 px-3 py-2 rounded-md hover:opacity-90"
              >
                {editEmail ? "Cancel" : "Edit"}
              </button>
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <button
              onClick={handleSaveProfile}
              className="bg-cyan-600 px-4 py-2 rounded-md hover:opacity-90"
            >
              Save Profile
            </button>
            <button
              onClick={handleDeleteAccount}
              className="bg-red-500 px-4 py-2 rounded-md hover:opacity-90"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-1">Old Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-3 py-2 rounded-md bg-slate-700 text-white"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-1">New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-3 py-2 rounded-md bg-slate-700 text-white"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-1">Confirm New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-3 py-2 rounded-md bg-slate-700 text-white"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            <span className="text-slate-300">Show passwords</span>
          </label>
          <button
            onClick={handleSavePassword}
            className="bg-cyan-600 px-4 py-2 rounded-md hover:opacity-90"
          >
            Change Password
          </button>
        </div>

        {/* Preferences */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={allowAnalytics}
              onChange={(e) => setAllowAnalytics(e.target.checked)}
            />
            <span className="text-slate-300">Allow anonymous analytics</span>
          </label>
          <div className="mt-4">
            <button
              onClick={handleSavePreferences}
              className="bg-cyan-600 px-4 py-2 rounded-md hover:opacity-90"
            >
              Save Preferences
            </button>
          </div>
        </div>

        {/* About / Bio */}
        <div className="bg-slate-800 rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">About / Bio</h2>
          <textarea
            rows="4"
            className="w-full px-3 py-2 rounded-md bg-slate-700 text-white"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
          <div className="mt-4">
            <button
              onClick={handleSaveAbout}
              className="bg-cyan-600 px-4 py-2 rounded-md hover:opacity-90"
            >
              Save About
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
