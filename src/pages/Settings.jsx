import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, clearSession } from "../lib/api";

const Settings = ({ embedded = false, onLogout }) => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [allowAnalytics, setAllowAnalytics] = useState(false);
  const [about, setAbout] = useState("");
  const [editEmail, setEditEmail] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await api("/auth/me");
        setName(data.user.name || "");
        setEmail(data.user.email || "");
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
    if (!name.trim()) {
      alert("Name cannot be empty.");
      return;
    }

    try {
      const data = await api("/users/me", {
        method: "PUT",
        body: JSON.stringify({
          name,
          email,
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
    if (!oldPass || !newPass || !confirmPass) {
      alert("Fill all password fields");
      return;
    }
    if (newPass !== confirmPass) {
      alert("New passwords do not match");
      return;
    }

    try {
      await api("/users/me/password", {
        method: "PUT",
        body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }),
      });
      alert("Password changed successfully.");
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

  const handleSaveAbout = async () => {
    try {
      const data = await api("/users/me", {
        method: "PUT",
        body: JSON.stringify({ about }),
      });
      localStorage.setItem("user", JSON.stringify(data.user));
      alert("About/Bio saved.");
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

  return (
    <div className={`${embedded ? "" : "min-h-screen"} bg-[#0b1220] text-[#e6eef8] py-6 px-4`}>
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <div className="flex justify-end items-center">
          <button onClick={handleLogout} className="text-red-500 hover:underline">
            Log out
          </button>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Profile Info</h2>
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
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <div className="flex gap-2">
              <input
                type="email"
                className={`w-full px-3 py-2 rounded-md bg-slate-700 text-white ${!editEmail ? "cursor-not-allowed" : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={!editEmail}
              />
              <button onClick={() => setEditEmail(!editEmail)} className="bg-cyan-600 px-3 py-2 rounded-md hover:opacity-90">
                {editEmail ? "Cancel" : "Edit"}
              </button>
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <button onClick={handleSaveProfile} className="bg-cyan-600 px-4 py-2 rounded-md hover:opacity-90">
              Save Profile
            </button>
            <button onClick={handleDeleteAccount} className="bg-red-500 px-4 py-2 rounded-md hover:opacity-90">
              Delete Account
            </button>
          </div>
        </div>

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
            <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
            <span className="text-slate-300">Show passwords</span>
          </label>
          <button onClick={handleSavePassword} className="bg-cyan-600 px-4 py-2 rounded-md hover:opacity-90">
            Change Password
          </button>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={allowAnalytics} onChange={(e) => setAllowAnalytics(e.target.checked)} />
            <span className="text-slate-300">Allow anonymous analytics</span>
          </label>
          <div className="mt-4">
            <button onClick={handleSavePreferences} className="bg-cyan-600 px-4 py-2 rounded-md hover:opacity-90">
              Save Preferences
            </button>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-4">About / Bio</h2>
          <textarea
            rows="4"
            className="w-full px-3 py-2 rounded-md bg-slate-700 text-white"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          />
          <div className="mt-4">
            <button onClick={handleSaveAbout} className="bg-cyan-600 px-4 py-2 rounded-md hover:opacity-90">
              Save About
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
