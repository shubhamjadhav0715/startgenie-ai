// src/pages/AIAdvisor.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Settings from "./Settings";
import GenerateBlueprint from "./GenerateBlueprint";

const AIAdvisor = () => {
  const navigate = useNavigate();

  // ===== USER DATA =====
  const user = JSON.parse(localStorage.getItem("user"));

  // ===== STATE =====
  const [activeTab, setActiveTab] = useState("chat"); // chat, library, blueprint, history, settings
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello! I'm your startup AI Advisor. Ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const [libraryFiles, setLibraryFiles] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const chatEndRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ===== AUTO SAVE EDITED CHAT =====
useEffect(() => {
  if (!currentChatId) return;

  setChatHistory((prev) =>
    prev.map((chat) =>
      chat.id === currentChatId
        ? { ...chat, messages: messages }
        : chat
    )
  );
}, [messages, currentChatId]);

  // ===== FUNCTIONS =====
  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Analyzing your startup idea... AI response will appear here." },
      ]);
    }, 500);
  };

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // ===== 1. SHOW USER FILE IN CHAT ONLY =====
  setMessages((prev) => [
    ...prev,
    {
      sender: "user",
      text: `📎 Uploaded file: ${file.name}`,
      type: "user-file", // Flag (important for future backend)
    },
  ]);

  // ===== 2. FAKE AI ANALYSIS RESPONSE =====
  setTimeout(() => {
    setMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        text: "File analyzed successfully. Generating diagram/visual insights...",
      },
    ]);

    // ===== 3. SIMULATED AI GENERATED IMAGE =====
    const aiGeneratedImage = {
      name: `AI Diagram ${Date.now()}.png`,
      url: "https://via.placeholder.com/400x250.png?text=AI+Generated+Diagram",
      type: "ai-generated", // IMPORTANT FLAG
    };

    // ===== 4. STORE ONLY AI GENERATED =====
    setLibraryFiles((prev) => [
      ...prev,
      aiGeneratedImage,
    ]);
  }, 1200);
};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

 const handleNewChat = () => {

  const userChatted = messages.some(
    (msg) => msg.sender === "user"
  );

  if (userChatted) {

    if (currentChatId) {
      // ✅ UPDATE EXISTING CHAT
      setChatHistory((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? { ...chat, messages: messages }
            : chat
        )
      );
    } else {
      // ✅ CREATE NEW CHAT
      setChatHistory((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: `Chat ${prev.length + 1}`,
          messages: messages,
        },
      ]);
    }
  }

  // Reset for fresh chat
  setMessages([
    {
      sender: "ai",
      text: "Hello! I'm your startup AI Advisor. Ask me anything.",
    },
  ]);

  setCurrentChatId(null); // Important reset
  setActiveTab("chat");
};

  const handleDeleteChat = (id) => {
    setChatHistory((prev) => prev.filter((chat) => chat.id !== id));
  };

  const handleRenameChat = (id) => {
    const newName = prompt("Enter new chat name:");
    if (newName) {
      setChatHistory((prev) =>
        prev.map((chat) => (chat.id === id ? { ...chat, name: newName } : chat))
      );
    }
  };

  const handleOpenHistoryChat = (chat) => {
  setMessages(chat.messages);
  setCurrentChatId(chat.id); // Track opened chat
  setActiveTab("chat");
};

  const handleGenerateBlueprint = () => {
  setActiveTab("blueprint");
};

  // ===== RENDER MAIN CONTENT BASED ON ACTIVE TAB =====
  const renderContent = () => {
    switch (activeTab) {
      case "chat":
        return (
          <div className="flex-1 flex flex-col h-full">
            <div className="bg-white rounded-xl flex-1 p-6 text-black flex flex-col gap-4 overflow-y-auto h-0">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-2 rounded-xl max-w-xs break-words ${
                      msg.sender === "user"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-200 text-black rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2 items-center pt-4 bg-[#0b1220]">
              <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-full text-white">
                📎
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
              <input
                type="text"
                placeholder="Ask startup question or upload file..."
                className="flex-1 border px-4 py-3 rounded-full text-black bg-white"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                onClick={handleSend}
              >
                Send
              </button>
            </div>
          </div>
        );
      
        case "library":
  return (
    <div className="flex-1 overflow-y-auto p-6">

      {/* EMPTY STATE */}
      {libraryFiles.length === 0 && (
        <p className="text-slate-400">No AI generated visuals yet.</p>
      )}

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

        {libraryFiles.map((file, i) => (
          <div
            key={i}
            className="bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition flex flex-col"
          >

            {/* IMAGE PREVIEW */}
            <div
              className="w-full h-44 bg-black flex items-center justify-center cursor-pointer"
              onClick={() => setPreviewImage(file)}
            >
              <img
                src={file.url}
                alt={file.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* NAME + DOWNLOAD */}
            <div className="flex items-center justify-between p-3 border-t border-white/5">

              {/* FILE NAME */}
              <p className="text-xs text-slate-300 truncate">
                {file.name}
              </p>

              {/* DOWNLOAD BUTTON */}
              <a
                href={file.url}
                download={file.name}
                className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg text-white text-xs"
                title="Download"
              >
                ⬇️
              </a>

            </div>
          </div>
        ))}

      </div>

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage.url}
            alt={previewImage.name}
            className="max-h-[85%] max-w-[95%] rounded-xl shadow-2xl"
          />
        </div>
      )}

    </div>
  );

      case "history":
        return (
          <div className="flex-1 overflow-y-auto p-4 h-0">
            {chatHistory.length === 0 && <p className="text-slate-300">No chat history yet.</p>}
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className="flex justify-between items-center bg-slate-700 rounded-lg p-3 mb-2"
              >
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => handleOpenHistoryChat(chat)}
                >
                  {chat.name}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRenameChat(chat.id)}
                    className="bg-cyan-500 px-2 py-1 rounded text-sm hover:opacity-90"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => handleDeleteChat(chat.id)}
                    className="bg-red-500 px-2 py-1 rounded text-sm hover:opacity-90"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      
       case "settings":
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <Settings />
    </div>
  );

  case "blueprint":
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <GenerateBlueprint />
    </div>
  );

default:
  return null;
}
  };

  return (
    <div className="h-screen flex bg-[#0b1220] text-[#e6eef8] overflow-hidden">

      {/* SIDEBAR */}
      <aside className="w-72 hidden md:flex flex-col p-4 gap-4 bg-[#0f1724] border-r border-white/5 h-full">

        {/* Logo */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
            🤖
          </div>
          <div>
            <div className="text-lg font-bold">StartGenie AI</div>
            <div className="text-xs text-slate-400">Startup Advisor</div>
          </div>
        </div>

        {/* Navigation */}
<nav className="flex-1 py-2">
  <ul className="space-y-1">

    {/* New Chat */}
    <li>
      <button
        onClick={handleNewChat}
        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition"
      >
        ➕ New Chat
      </button>
    </li>

    {/* Library */}
    <li>
      <button
        onClick={() => setActiveTab("library")}
        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition"
      >
        📚 Library
      </button>
    </li>

    {/* Generate Blueprint — FIXED */}
    <li>
      <button
        onClick={handleGenerateBlueprint}
        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 flex items-center gap-2 transition"
      >
        ⚡ Generate Blueprint
      </button>
    </li>

    {/* History */}
    <li>
      <button
        onClick={() => setActiveTab("history")}
        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition"
      >
        🕘 History
      </button>
    </li>

    {/* Settings */}
    <li>
      <button
        onClick={() => setActiveTab("settings")}
        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition"
      >
        ⚙️ Settings
      </button>
    </li>

  </ul>
</nav>

        {/* User Info */}
<div className="text-sm text-slate-400 border-t border-white/5 pt-3">

  {/* Name + Logout Row */}
  <div className="flex items-center justify-between">

    <div className="font-medium">
      {user?.name || "Guest"}
    </div>

    <button
      onClick={handleLogout}
      className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs font-medium mr-3"
      title="Logout"
    >
      ⏻ Logout
    </button>

  </div>

  {/* Email */}
  <div className="text-xs text-slate-500">
    {user?.email || "guest@email.com"}
  </div>

</div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 flex flex-col h-full overflow-hidden">
{renderContent()}</main>
    </div>
  );
};

export default AIAdvisor;
