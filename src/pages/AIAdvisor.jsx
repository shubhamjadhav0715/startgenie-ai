import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Settings from "./Settings";
import GenerateBlueprint from "./GenerateBlueprint";
import { api, API_BASE_URL, clearSession } from "../lib/api";

const AIAdvisor = () => {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState("chat");
  const [theme, setTheme] = useState(() => localStorage.getItem("aiadvisor_theme") || "dark"); // dark | light
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem("aiadvisor_sidebar") === "collapsed");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [libraryFiles, setLibraryFiles] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const DEFAULT_GREETING = "Hello! I'm your startup AI Advisor. Ask me anything.";
  const isDark = theme === "dark";

  useEffect(() => {
    localStorage.setItem("aiadvisor_theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("aiadvisor_sidebar", sidebarCollapsed ? "collapsed" : "expanded");
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (text) => setToast({ id: Date.now(), text });

  const pageTitle = (() => {
    if (activeTab === "chat") return "AI Chat";
    if (activeTab === "library") return "Library";
    if (activeTab === "blueprint") return "Generate Blueprint";
    if (activeTab === "history") return "History";
    if (activeTab === "settings") return "Settings";
    return "AI Advisor";
  })();

  const formatTime = (value) => {
    if (!value) return "";
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const SUGGESTED_PROMPTS = [
    "Validate my startup idea in 5 bullets",
    "Help me define my target customer segment",
    "Suggest pricing and a simple business model",
    "Give me a go-to-market plan for the first 30 days",
  ];

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

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

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
          createdAt: new Date().toISOString(),
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

    const classifyAiLine = (rawLine) => {
      const line = String(rawLine || "").trim();
      const normalized = line.toLowerCase();
      const plain = line.replace(/^[-*]\s+/, "").trim();

      if (/(complete|generated|ready)\b/.test(normalized)) {
        return { icon: "✨", className: "text-emerald-600 font-semibold", text: plain };
      }
      if (/(analyz|research|collecting|processing)\b/.test(normalized)) {
        return { icon: "🔍", className: "text-slate-800", text: plain };
      }
      if (/(found|market|competitor|trend|insight|data)\b/.test(normalized)) {
        return { icon: "📊", className: "text-slate-800", text: plain };
      }
      if (/(investor|fund|pricing|revenue|cost|budget)\b/.test(normalized)) {
        return { icon: "💰", className: "text-slate-800", text: plain };
      }

      return { icon: "•", className: "text-slate-800", text: plain };
    };

    const rawLines = String(message.text || "").split("\n").map((line) => line.replace(/\r$/, ""));

    const renderInline = (text) => {
      const parts = [];
      let rest = String(text || "");
      let key = 0;

      const pushText = (t) => {
        if (!t) return;
        parts.push(<span key={`t-${key++}`}>{t}</span>);
      };

      while (rest.length) {
        const codeStart = rest.indexOf("`");
        const boldStart = rest.indexOf("**");
        const nextIdx = [codeStart >= 0 ? codeStart : Infinity, boldStart >= 0 ? boldStart : Infinity].reduce((a, b) => Math.min(a, b), Infinity);

        if (nextIdx === Infinity) {
          pushText(rest);
          break;
        }

        pushText(rest.slice(0, nextIdx));
        rest = rest.slice(nextIdx);

        if (rest.startsWith("`")) {
          const end = rest.indexOf("`", 1);
          if (end === -1) {
            pushText(rest);
            break;
          }
          const code = rest.slice(1, end);
          parts.push(
            <code key={`c-${key++}`} className="px-1.5 py-0.5 rounded bg-black/10 font-mono text-[13px]">
              {code}
            </code>
          );
          rest = rest.slice(end + 1);
          continue;
        }

        if (rest.startsWith("**")) {
          const end = rest.indexOf("**", 2);
          if (end === -1) {
            pushText(rest);
            break;
          }
          const bold = rest.slice(2, end);
          parts.push(
            <strong key={`b-${key++}`} className="font-semibold">
              {bold}
            </strong>
          );
          rest = rest.slice(end + 2);
        }
      }

      return parts;
    };

    const blocks = [];
    let inCode = false;
    let codeLines = [];

    const flushCode = (idx) => {
      if (!codeLines.length) return;
      blocks.push(
        <pre
          key={`code-${idx}`}
          className={`rounded-xl p-4 overflow-auto text-[13px] leading-5 font-mono ${
            isDark ? "bg-[#0b1220] text-slate-100 border border-white/10" : "bg-slate-900 text-slate-100"
          }`}
        >
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      codeLines = [];
    };

    rawLines.forEach((rawLine, idx) => {
      const trimmed = rawLine.trim();

      if (trimmed.startsWith("```")) {
        if (inCode) {
          flushCode(idx);
          inCode = false;
        } else {
          inCode = true;
        }
        return;
      }

      if (inCode) {
        codeLines.push(rawLine);
        return;
      }

      if (!trimmed) return;

      if (trimmed.startsWith("### ")) {
        blocks.push(
          <p key={`h-${idx}`} className="font-semibold text-slate-900">
            {trimmed.replace("### ", "")}
          </p>
        );
        return;
      }

      if (/^[-*]\s+/.test(trimmed)) {
        const item = classifyAiLine(trimmed);
        blocks.push(
          <p key={`li-${idx}`} className={`flex gap-2 ${item.className}`}>
            <span className="w-5 shrink-0">{item.icon}</span>
            <span>{renderInline(item.text)}</span>
          </p>
        );
        return;
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        blocks.push(
          <p key={`n-${idx}`} className="font-medium text-slate-800">
            {renderInline(trimmed)}
          </p>
        );
        return;
      }

      const item = classifyAiLine(trimmed);
      blocks.push(
        <p key={`p-${idx}`} className={`flex gap-2 ${item.className}`}>
          <span className="w-5 shrink-0">{item.icon}</span>
          <span>{renderInline(item.text)}</span>
        </p>
      );
    });

    if (inCode) flushCode(rawLines.length + 1);

    return (
      <div className="space-y-2 leading-relaxed text-[15px]">
        {blocks}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "chat":
        return (
          <div className="flex-1 flex flex-col min-h-0">
            <div
              className={`rounded-2xl border flex-1 overflow-hidden flex flex-col h-0 ${
                isDark ? "border-white/10 bg-gradient-to-b from-[#0f172a] to-[#071029]" : "border-slate-200 bg-white"
              }`}
            >
              <div
                className={`flex items-center justify-between px-5 py-3 border-b ${
                  isDark ? "border-white/10 bg-[#0b1220]/50" : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/90" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400/90" />
                    <span className="w-3 h-3 rounded-full bg-green-500/90" />
                  </div>
                  <span className={`${isDark ? "text-slate-200" : "text-slate-800"} font-medium`}>StartGenie AI Chat</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${isDark ? "text-emerald-300" : "text-emerald-600"}`}>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Online</span>
                </div>
              </div>

              <div className={`flex-1 overflow-y-auto ${isDark ? "" : "bg-slate-50"}`}>
                <div className="mx-auto w-full max-w-5xl p-4 md:p-5 flex flex-col gap-5">
                {messages.length === 1 && messages[0]?.sender === "ai" && messages[0]?.text === DEFAULT_GREETING && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-200">
                    <div className="text-sm text-cyan-300 font-semibold">Welcome</div>
                    <div className="mt-1 text-xl font-bold">Start chatting about your startup idea</div>
                    <div className="mt-2 text-sm text-slate-300 leading-6">
                      Ask a question or tap a suggestion below. When you want a full pitch-ready plan, switch to{" "}
                      <span className="text-cyan-300 font-semibold">Generate Blueprint</span>.
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {SUGGESTED_PROMPTS.map((p) => (
                        <button
                          key={`empty-${p}`}
                          type="button"
                          onClick={() => {
                            setInput(p);
                            inputRef.current?.focus();
                          }}
                          className="text-xs px-3 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition"
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setActiveTab("blueprint")}
                        className="text-xs px-3 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold transition"
                      >
                        Open Blueprint Generator
                      </button>
                    </div>
                  </div>
                )}
                {messages.map((msg, index) => {
                  const isUser = msg.sender === "user";
                  const isAi = msg.sender === "ai";

                  if (isUser) {
                    return (
                      <div key={`${msg.id || "msg"}-${index}`} className="flex justify-end">
                        <div className="relative bg-[#06b6d4] text-white px-5 py-4 rounded-[22px] rounded-tr-sm max-w-2xl break-words shadow-lg">
                          <div className="absolute -right-2 top-5 w-0 h-0 border-y-[10px] border-y-transparent border-l-[14px] border-l-[#06b6d4]" />
                          {renderMessageText(msg)}
                          {formatTime(msg.createdAt) && (
                            <div className="mt-2 text-[11px] text-white/80 text-right">{formatTime(msg.createdAt)}</div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  if (isAi) {
                    const rating = msg.feedback?.rating || null;
                    const isLastMessage = index === messages.length - 1;
                    return (
                      <div key={`${msg.id || "msg"}-${index}`} className="flex justify-start gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isDark ? "bg-cyan-500/20 border border-cyan-400/30" : "bg-cyan-600/10 border border-cyan-600/20"
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-300" />
                        </div>
                        <div
                          className={`relative px-6 py-5 rounded-[22px] rounded-tl-sm max-w-2xl break-words ${
                            isDark ? "bg-[#e8edf5] text-black shadow-xl" : "bg-white text-slate-900 shadow-md border border-slate-200"
                          }`}
                        >
                          <div
                            className={`absolute -left-2 top-6 w-0 h-0 border-y-[10px] border-y-transparent border-r-[14px] ${
                              isDark ? "border-r-[#e8edf5]" : "border-r-white"
                            }`}
                          />
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="text-cyan-700 font-semibold text-sm">StartGenie AI</div>
                            <div className="flex items-center gap-2">
                              {msg.type === "text" && msg.text?.trim() && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await navigator.clipboard.writeText(msg.text);
                                      showToast("Copied to clipboard");
                                    } catch {
                                      showToast("Copy failed");
                                    }
                                  }}
                                  className="text-[11px] px-2 py-1 rounded-lg border border-slate-300 hover:bg-white/70 transition"
                                >
                                  Copy
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={async () => {
                                  const nextRating = rating === "up" ? null : "up";
                                  try {
                                    setMessages((prev) =>
                                      prev.map((m) => (m.id === msg.id ? { ...m, feedback: { rating: nextRating } } : m))
                                    );
                                    await api(`/chats/${currentChatId}/messages/${msg.id}/feedback`, {
                                      method: "PATCH",
                                      body: JSON.stringify({ rating: nextRating }),
                                    });
                                  } catch (error) {
                                    showToast(error.message);
                                  }
                                }}
                                className={`text-[11px] px-2 py-1 rounded-lg border transition ${
                                  rating === "up" ? "border-emerald-300 bg-emerald-50" : "border-slate-300 hover:bg-white/70"
                                }`}
                                title="Helpful"
                              >
                                👍
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  const nextRating = rating === "down" ? null : "down";
                                  try {
                                    setMessages((prev) =>
                                      prev.map((m) => (m.id === msg.id ? { ...m, feedback: { rating: nextRating } } : m))
                                    );
                                    await api(`/chats/${currentChatId}/messages/${msg.id}/feedback`, {
                                      method: "PATCH",
                                      body: JSON.stringify({ rating: nextRating }),
                                    });
                                  } catch (error) {
                                    showToast(error.message);
                                  }
                                }}
                                className={`text-[11px] px-2 py-1 rounded-lg border transition ${
                                  rating === "down" ? "border-rose-300 bg-rose-50" : "border-slate-300 hover:bg-white/70"
                                }`}
                                title="Not helpful"
                              >
                                👎
                              </button>
                              {isLastMessage && (
                                <button
                                  type="button"
                                  disabled={isSending}
                                  onClick={async () => {
                                    try {
                                      setIsSending(true);
                                      const data = await api(`/chats/${currentChatId}/regenerate`, { method: "POST", body: JSON.stringify({}) });
                                      setMessages(data.chat.messages || []);
                                      updateChatInHistory(data.chat);
                                      showToast("Regenerated response");
                                    } catch (error) {
                                      showToast(error.message);
                                    } finally {
                                      setIsSending(false);
                                    }
                                  }}
                                  className="text-[11px] px-2 py-1 rounded-lg border border-slate-300 hover:bg-white/70 transition disabled:opacity-60"
                                  title="Regenerate"
                                >
                                  Regenerate
                                </button>
                              )}
                            </div>
                          </div>
                          {renderMessageText(msg)}
                          {formatTime(msg.createdAt) && (
                            <div className="mt-3 text-[11px] text-slate-500 text-right">{formatTime(msg.createdAt)}</div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={`${msg.id || "msg"}-${index}`} className="flex justify-start">
                      <div className="bg-slate-200 text-black px-4 py-3 rounded-xl max-w-2xl break-words">
                        {renderMessageText(msg)}
                      </div>
                    </div>
                  );
                })}
                {isSending && (
                  <div className="flex justify-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isDark ? "bg-cyan-500/20 border border-cyan-400/30" : "bg-cyan-600/10 border border-cyan-600/20"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-300" />
                    </div>
                    <div className={`px-6 py-5 rounded-[22px] rounded-tl-sm max-w-[420px] ${isDark ? "bg-[#e8edf5]" : "bg-white border border-slate-200"}`}>
                      <div className="text-cyan-700 font-semibold text-sm mb-2">StartGenie AI</div>
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                        <span className="w-2 h-2 rounded-full bg-cyan-500/70 animate-pulse" />
                        <span className="w-2 h-2 rounded-full bg-cyan-500/40 animate-pulse" />
                        <span className="ml-2">Typing…</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
                </div>
              </div>
            </div>
            <div className={`${isDark ? "bg-[#0b1220]" : "bg-white"} pt-3 pb-3`}>
              <div className="mx-auto w-full max-w-5xl px-4 md:px-6 flex gap-2 items-center">
                <label
                  className={`cursor-pointer px-4 py-2.5 rounded-full ${isDark ? "bg-slate-700 hover:bg-slate-600 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-800"} `}
                >
                  Attach
                  <input type="file" className="hidden" onChange={handleFileUpload} />
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask startup question or upload file..."
                  className={`flex-1 border px-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isDark ? "text-black bg-white border-white/10" : "text-slate-900 bg-white border-slate-200"
                  }`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button className="px-6 py-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600" onClick={handleSend}>
                  {isSending ? "Sending..." : "Send"}
                </button>
              </div>

              <div className="mx-auto w-full max-w-5xl px-4 md:px-6 pt-3">
                <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1">
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setInput(p);
                        inputRef.current?.focus();
                      }}
                      className={`text-xs px-3 py-2 rounded-full border transition ${
                        isDark ? "border-white/10 bg-white/5 hover:bg-white/10 text-slate-200" : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800"
                      } shrink-0`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {(isSending || isUploading) && (
                  <p className="text-xs text-cyan-300 mt-3">
                    {isUploading
                      ? "Processing upload... analyzing file and generating AI output."
                      : "Processing request... generating AI response."}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case "library":
        return (
          <div className="flex-1 min-h-0 overflow-y-auto p-6">
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
          <div className="flex-1 min-h-0 overflow-y-auto p-4">
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
          <div className="flex-1 min-h-0 overflow-y-auto p-6">
            <Settings embedded onLogout={handleLogout} />
          </div>
        );

      case "blueprint":
        return (
          <div className="flex-1 min-h-0 overflow-y-auto p-6">
            <GenerateBlueprint />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`h-[100dvh] min-h-[100dvh] flex overflow-hidden ${isDark ? "bg-[#0b1220] text-[#e6eef8]" : "bg-slate-50 text-slate-900"}`}>
      <aside
        className={`${sidebarCollapsed ? "w-20" : "w-72"} hidden md:flex flex-col p-4 gap-4 border-r h-full transition-all duration-200 ${
          isDark ? "bg-[#0f1724] border-white/5" : "bg-white border-slate-200"
        }`}
      >
        <div className={`rounded-2xl border px-3 py-3 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center font-bold text-white">
              AI
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
              <div className={`text-[15px] font-bold truncate ${isDark ? "text-white" : "text-slate-900"}`}>StartGenie AI</div>
              <div className={`text-xs truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}>Startup Advisor</div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((v) => !v)}
              className={`ml-auto w-9 h-9 rounded-xl border flex items-center justify-center transition ${
                isDark ? "border-white/10 hover:bg-white/10 text-slate-200" : "border-slate-200 hover:bg-slate-100 text-slate-800"
              }`}
              title={sidebarCollapsed ? "Expand" : "Collapse"}
            >
              {sidebarCollapsed ? "›" : "‹"}
            </button>
          </div>

          {!sidebarCollapsed && (
            <div className="mt-4 flex items-center justify-between">
              <div>
                <div className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-600"}`}>Theme</div>
                <div className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{isDark ? "Dark mode" : "Light mode"}</div>
              </div>
              <button
                type="button"
                onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                className={`relative inline-flex h-8 w-14 items-center rounded-full border transition ${
                  isDark ? "bg-white/10 border-white/10" : "bg-slate-200 border-slate-200"
                }`}
                aria-label="Toggle theme"
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full shadow transition ${
                    isDark ? "translate-x-7 bg-cyan-300" : "translate-x-1 bg-white"
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        <nav className="flex-1 py-2">
          <div className="px-1">
            <button
              onClick={handleNewChat}
              className={`w-full chat-gradient text-white px-4 py-3 rounded-2xl hover:opacity-95 transition font-semibold shadow-lg shadow-cyan-500/10 ${sidebarCollapsed ? "px-0" : ""}`}
            >
              {sidebarCollapsed ? "+" : "+ New Chat"}
            </button>
          </div>

          <ul className="space-y-1 mt-4">
            <li>
              <button
                onClick={() => setActiveTab("chat")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition border ${
                  activeTab === "chat"
                    ? isDark
                      ? "bg-white/10 border-white/10"
                      : "bg-slate-100 border-slate-200"
                    : isDark
                      ? "border-transparent hover:bg-white/5"
                      : "border-transparent hover:bg-slate-100"
                }`}
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? "bg-white/5" : "bg-white border border-slate-200"}`}>
                  💬
                </span>
                {!sidebarCollapsed && <span className="font-medium">AI Chat</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("library")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition border ${
                  activeTab === "library"
                    ? isDark
                      ? "bg-white/10 border-white/10"
                      : "bg-slate-100 border-slate-200"
                    : isDark
                      ? "border-transparent hover:bg-white/5"
                      : "border-transparent hover:bg-slate-100"
                }`}
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? "bg-white/5" : "bg-white border border-slate-200"}`}>
                  🗂️
                </span>
                {!sidebarCollapsed && <span className="font-medium">Library</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("blueprint")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition border ${
                  activeTab === "blueprint"
                    ? isDark
                      ? "bg-white/10 border-white/10"
                      : "bg-slate-100 border-slate-200"
                    : isDark
                      ? "border-transparent hover:bg-white/5"
                      : "border-transparent hover:bg-slate-100"
                }`}
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? "bg-white/5" : "bg-white border border-slate-200"}`}>
                  🧩
                </span>
                {!sidebarCollapsed && <span className="font-medium">Generate Blueprint</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("history")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition border ${
                  activeTab === "history"
                    ? isDark
                      ? "bg-white/10 border-white/10"
                      : "bg-slate-100 border-slate-200"
                    : isDark
                      ? "border-transparent hover:bg-white/5"
                      : "border-transparent hover:bg-slate-100"
                }`}
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? "bg-white/5" : "bg-white border border-slate-200"}`}>
                  🕘
                </span>
                {!sidebarCollapsed && <span className="font-medium">History</span>}
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition border ${
                  activeTab === "settings"
                    ? isDark
                      ? "bg-white/10 border-white/10"
                      : "bg-slate-100 border-slate-200"
                    : isDark
                      ? "border-transparent hover:bg-white/5"
                      : "border-transparent hover:bg-slate-100"
                }`}
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? "bg-white/5" : "bg-white border border-slate-200"}`}>
                  ⚙️
                </span>
                {!sidebarCollapsed && <span className="font-medium">Settings</span>}
              </button>
            </li>
          </ul>

          {!sidebarCollapsed && (
            <div className={`mt-4 border-t pt-3 ${isDark ? "border-white/10" : "border-slate-200"}`}>
              <div className={`px-3 text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Recent Chats
              </div>
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {visibleChats.length === 0 && (
                <p className="px-3 text-xs text-slate-500">No recent chats</p>
              )}
              {visibleChats.map((chat) => (
                <button
                  key={`recent-${chat.id}`}
                  onClick={() => handleOpenHistoryChat(chat)}
                  className={`w-full text-left px-3 py-3 rounded-2xl transition border ${
                    isDark
                      ? "bg-slate-800/60 hover:bg-slate-800/90 border-white/5"
                      : "bg-white hover:bg-slate-50 border-slate-200"
                  }`}
                >
                  <p className={`text-xs font-medium truncate ${isDark ? "text-slate-200" : "text-slate-800"}`}>{getChatDisplayName(chat)}</p>
                  <p className={`text-[11px] truncate mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>{getFirstUserMessage(chat)}</p>
                </button>
              ))}
            </div>
            </div>
          )}
        </nav>

        <div className={`border-t pt-3 ${isDark ? "border-white/5" : "border-slate-200"}`}>
          <div className={`rounded-2xl border px-3 py-3 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${isDark ? "bg-white/5 text-slate-200" : "bg-white text-slate-800 border border-slate-200"}`}>
                {(user?.name || "G").slice(0, 1).toUpperCase()}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold truncate ${isDark ? "text-slate-200" : "text-slate-900"}`}>{user?.name || "Guest"}</div>
                  <div className={`text-xs truncate ${isDark ? "text-slate-400" : "text-slate-500"}`}>{user?.email || "guest@email.com"}</div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className={`text-xs font-semibold px-3 py-2 rounded-xl border transition ${
                  isDark ? "border-white/10 hover:bg-white/10 text-rose-300" : "border-slate-200 hover:bg-slate-100 text-rose-600"
                }`}
                title="Logout"
              >
                {sidebarCollapsed ? "⎋" : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-6 flex flex-col min-h-0 overflow-hidden">
        <div className={`flex items-center justify-between gap-3 mb-4 ${activeTab === "chat" ? "" : ""}`}>
          <div>
            <div className={`text-lg font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>{pageTitle}</div>
            <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>StartGenie AI Dashboard</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                isDark ? "border-white/10 bg-white/5 text-slate-200" : "border-slate-200 bg-white text-slate-800"
              }`}
            >
              {isDark ? "Light" : "Dark"}
            </button>
          </div>
        </div>
        <div className="md:hidden flex justify-end mb-3">
          <button
            type="button"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
              isDark ? "border-white/10 bg-white/5 text-slate-200" : "border-slate-200 bg-white text-slate-800"
            }`}
          >
            {isDark ? "Switch to Light" : "Switch to Dark"}
          </button>
        </div>
        {renderContent()}
      </main>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50">
          <div className={`px-4 py-3 rounded-xl shadow-lg border ${isDark ? "bg-[#0b1220] border-white/10 text-slate-200" : "bg-white border-slate-200 text-slate-800"}`}>
            {toast.text}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAdvisor;
