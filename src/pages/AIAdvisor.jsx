import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Settings from "./Settings";
import GenerateBlueprint from "./GenerateBlueprint";
import { api, API_BASE_URL, clearSession } from "../lib/api";

const AIAdvisor = () => {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [libraryFiles, setLibraryFiles] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const DEFAULT_GREETING = "Hello! I'm your startup AI Advisor. Ask me anything.";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadInitialData = useCallback(async () => {
    try {
      const [me, chats, library] = await Promise.all([
        api("/auth/me"),
        api("/chats"),
        api("/library"),
      ]);

      setUser(me.user);
      localStorage.setItem("user", JSON.stringify(me.user));

      const allChats = chats.chats || [];
      setChatHistory(allChats);

      if (allChats.length > 0) {
        const chat = allChats[0];
        setCurrentChatId(chat.id);
        setMessages(chat.messages || []);
      } else {
        const created = await api("/chats", { method: "POST", body: JSON.stringify({}) });
        setChatHistory([created.chat]);
        setCurrentChatId(created.chat.id);
        setMessages(created.chat.messages || []);
      }

      const aiGeneratedFiles = (library.files || []).filter((f) => f.type === "ai-generated");
      setLibraryFiles(aiGeneratedFiles);
    } catch (error) {
      clearSession();
      alert(error.message || "Session expired. Please log in again.");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    loadInitialData();
  }, [loadInitialData, navigate]);

  const updateChatInHistory = (chat) => {
    setChatHistory((prev) => {
      const next = prev.map((item) => (item.id === chat.id ? chat : item));
      return next.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });
  };

  const hasMeaningfulUserMessage = (chat) =>
    (chat?.messages || []).some((msg) => msg.sender === "user" && msg.text?.trim());

  const isOnlyDefaultGreeting = (chat) => {
    const msgs = chat?.messages || [];
    return msgs.length === 1 && msgs[0]?.sender === "ai" && msgs[0]?.text === DEFAULT_GREETING;
  };

  const visibleChats = chatHistory.filter((chat) => hasMeaningfulUserMessage(chat) || !isOnlyDefaultGreeting(chat));

  const handleSend = async () => {
    if (!input.trim() || !currentChatId || isSending) return;

    const text = input.trim();
    const tempId = `temp-${Date.now()}`;
    try {
      setIsSending(true);
      setInput("");
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          sender: "user",
          type: "text",
          text,
          pending: true,
        },
      ]);

      const data = await api(`/chats/${currentChatId}/messages`, {
        method: "POST",
        body: JSON.stringify({ text, sender: "user" }),
      });

      setMessages(data.chat.messages || []);
      updateChatInHistory(data.chat);

      if (data.aiGenerated) {
        setLibraryFiles((prev) => [data.aiGenerated, ...prev]);
        alert("AI diagram generated and added to Library.");
      }
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setInput(text);
      alert(error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !currentChatId || isUploading) return;

    try {
      setIsUploading(true);
      await api(`/chats/${currentChatId}/messages`, {
        method: "POST",
        body: JSON.stringify({ text: `Uploaded file: ${file.name}`, sender: "user", type: "user-file" }),
      });

      const formData = new FormData();
      formData.append("file", file);
      const libraryData = await api("/library/upload", {
        method: "POST",
        body: formData,
      });

      await api(`/chats/${currentChatId}/messages`, {
        method: "POST",
        body: JSON.stringify({ text: libraryData.aiMessage, sender: "ai" }),
      });

      if (libraryData.aiGenerated?.url) {
        await api(`/chats/${currentChatId}/messages`, {
          method: "POST",
          body: JSON.stringify({
            text: `Generated diagram: ${libraryData.aiGenerated.name}`,
            sender: "ai",
            type: "ai-image",
            imageUrl: libraryData.aiGenerated.url,
          }),
        });
      }

      const chats = await api("/chats");
      const current = chats.chats.find((c) => c.id === currentChatId) || chats.chats[0];
      setChatHistory(chats.chats);
      if (current) {
        setCurrentChatId(current.id);
        setMessages(current.messages || []);
      }

      const library = await api("/library");
      setLibraryFiles((library.files || []).filter((f) => f.type === "ai-generated"));
    } catch (error) {
      alert(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = (file) => {
    alert(`Download started for: ${file.name}`);
  };

  const handleLogout = () => {
    clearSession();
    navigate("/login");
  };

  const handleNewChat = async () => {
    try {
      const data = await api("/chats", {
        method: "POST",
        body: JSON.stringify({}),
      });
      setChatHistory((prev) => [data.chat, ...prev]);
      setCurrentChatId(data.chat.id);
      setMessages(data.chat.messages || []);
      setActiveTab("chat");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteChat = async (id) => {
    try {
      await api(`/chats/${id}`, { method: "DELETE" });
      const updated = chatHistory.filter((chat) => chat.id !== id);
      setChatHistory(updated);

      if (currentChatId === id) {
        if (updated.length > 0) {
          setCurrentChatId(updated[0].id);
          setMessages(updated[0].messages || []);
        } else {
          await handleNewChat();
        }
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRenameChat = async (id) => {
    const newName = prompt("Enter new chat name:");
    if (!newName?.trim()) return;

    try {
      const data = await api(`/chats/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: newName.trim() }),
      });
      updateChatInHistory(data.chat);
      if (currentChatId === id) {
        setMessages(data.chat.messages || []);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleOpenHistoryChat = (chat) => {
    setMessages(chat.messages || []);
    setCurrentChatId(chat.id);
    setActiveTab("chat");
  };

  const getFirstUserMessage = (chat) => {
    const firstUser = (chat?.messages || []).find((msg) => msg.sender === "user" && msg.text?.trim());
    return firstUser?.text || "No user message yet";
  };

  const getChatDisplayName = (chat) => {
    const firstMsg = getFirstUserMessage(chat);
    const rawName = String(chat?.name || "").trim();
    if (!rawName || /^Chat\s+\d+$/i.test(rawName)) {
      return firstMsg === "No user message yet" ? "New Chat" : firstMsg.slice(0, 40);
    }
    return rawName;
  };

  const renderMessageText = (message) => {
    if (message.type === "ai-image" && message.imageUrl) {
      const src = message.imageUrl.startsWith("http")
        ? message.imageUrl
        : `${API_BASE_URL.replace("/api", "")}${message.imageUrl}`;

      return (
        <div className="space-y-2">
          <p className="text-slate-800 font-medium">{message.text || "AI Generated Image"}</p>
          <img
            src={src}
            alt={message.text || "AI generated visual"}
            className="rounded-lg w-full max-w-md border border-slate-300 shadow-sm"
          />
        </div>
      );
    }

    if (message.sender === "user") {
      return <span className="whitespace-pre-wrap">{message.text}</span>;
    }

    const lines = String(message.text || "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return (
      <div className="space-y-1.5 leading-relaxed text-[15px]">
        {lines.map((line, idx) => {
          if (line.startsWith("### ")) {
            return (
              <p key={`${line}-${idx}`} className="font-semibold text-slate-900">
                {line.replace("### ", "")}
              </p>
            );
          }

          if (/^[-*]\s+/.test(line)) {
            return (
              <p key={`${line}-${idx}`} className="flex gap-2">
                <span>•</span>
                <span>{line.replace(/^[-*]\s+/, "")}</span>
              </p>
            );
          }

          if (/^\d+\.\s+/.test(line)) {
            return (
              <p key={`${line}-${idx}`} className="font-medium text-slate-800">
                {line}
              </p>
            );
          }

          return (
            <p key={`${line}-${idx}`} className="text-slate-800">
              {line}
            </p>
          );
        })}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "chat":
        return (
          <div className="flex-1 flex flex-col h-full">
            <div className="bg-white rounded-xl flex-1 p-6 text-black flex flex-col gap-4 overflow-y-auto h-0">
              {messages.map((msg, index) => (
                <div key={`${msg.id || "msg"}-${index}`} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`px-4 py-3 rounded-xl max-w-2xl break-words ${
                      msg.sender === "user" ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-200 text-black rounded-bl-none"
                    }`}
                  >
                    {renderMessageText(msg)}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="pt-3 pb-1 text-xs text-slate-300">
              For a full blueprint/pitch deck export, use the <span className="text-cyan-300 font-semibold">Generate Blueprint</span> tab.
            </div>
            <div className="flex gap-2 items-center pt-4 bg-[#0b1220]">
              <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 px-4 py-3 rounded-full text-white">
                Attach
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
              <button className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600" onClick={handleSend}>
                {isSending ? "Sending..." : "Send"}
              </button>
            </div>
            {(isSending || isUploading) && (
              <p className="text-xs text-cyan-300 mt-2">
                {isUploading
                  ? "Processing upload... analyzing file and generating AI output."
                  : "Processing request... generating AI response."}
              </p>
            )}
          </div>
        );

      case "library":
        return (
          <div className="flex-1 overflow-y-auto p-6">
            {libraryFiles.length === 0 && <p className="text-slate-400">No AI generated visuals yet.</p>}

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {libraryFiles.map((file) => (
                <div key={file.id} className="bg-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition flex flex-col">
                  <div className="w-full h-44 bg-black flex items-center justify-center cursor-pointer" onClick={() => setPreviewImage(file)}>
                    <img
                      src={file.url.startsWith("http") ? file.url : `${API_BASE_URL.replace("/api", "")}${file.url}`}
                      alt={file.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border-t border-white/5">
                    <p className="text-xs text-slate-300 truncate">{file.name}</p>
                    <a
                      href={file.url.startsWith("http") ? file.url : `${API_BASE_URL.replace("/api", "")}${file.url}`}
                      download={file.name}
                      onClick={() => handleDownload(file)}
                      className="bg-slate-700 hover:bg-slate-600 p-2 rounded-lg text-white text-xs"
                      title="Download"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {previewImage && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setPreviewImage(null)}>
                <img
                  src={previewImage.url.startsWith("http") ? previewImage.url : `${API_BASE_URL.replace("/api", "")}${previewImage.url}`}
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
            {visibleChats.length === 0 && <p className="text-slate-300">No chat history yet.</p>}
            {visibleChats.map((chat) => (
              <div key={chat.id} className="flex justify-between items-center bg-slate-700 rounded-lg p-3 mb-2">
                <span className="cursor-pointer hover:underline" onClick={() => handleOpenHistoryChat(chat)}>
                  {getChatDisplayName(chat)}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => handleRenameChat(chat.id)} className="bg-cyan-500 px-2 py-1 rounded text-sm hover:opacity-90">
                    Rename
                  </button>
                  <button onClick={() => handleDeleteChat(chat.id)} className="bg-red-500 px-2 py-1 rounded text-sm hover:opacity-90">
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
            <Settings embedded onLogout={handleLogout} />
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
      <aside className="w-72 hidden md:flex flex-col p-4 gap-4 bg-[#0f1724] border-r border-white/5 h-full">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">AI</div>
          <div>
            <div className="text-lg font-bold">StartGenie AI</div>
            <div className="text-xs text-slate-400">Startup Advisor</div>
          </div>
        </div>

        <nav className="flex-1 py-2">
          <ul className="space-y-1">
            <li>
              <button onClick={handleNewChat} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition">
                New Chat
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab("library")} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition">
                Library
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab("blueprint")} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition">
                Generate Blueprint
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab("history")} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition">
                History
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab("settings")} className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-700 transition">
                Settings
              </button>
            </li>
          </ul>

          <div className="mt-4 border-t border-white/10 pt-3">
            <div className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Recent Chats</div>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {visibleChats.length === 0 && (
                <p className="px-3 text-xs text-slate-500">No recent chats</p>
              )}
              {visibleChats.map((chat) => (
                <button
                  key={`recent-${chat.id}`}
                  onClick={() => handleOpenHistoryChat(chat)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 transition"
                >
                  <p className="text-xs font-medium text-slate-200 truncate">{getChatDisplayName(chat)}</p>
                  <p className="text-[11px] text-slate-400 truncate mt-1">{getFirstUserMessage(chat)}</p>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="text-sm text-slate-400 border-t border-white/5 pt-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">{user?.name || "Guest"}</div>
            <button onClick={handleLogout} className="text-red-400 hover:text-red-300 text-xs font-medium mr-3" title="Logout">
              Logout
            </button>
          </div>
          <div className="text-xs text-slate-500">{user?.email || "guest@email.com"}</div>
        </div>
      </aside>

      <main className="flex-1 p-6 flex flex-col h-full overflow-hidden">{renderContent()}</main>
    </div>
  );
};

export default AIAdvisor;
