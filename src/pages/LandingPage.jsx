import React from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleSignInButton from "../components/GoogleSignInButton";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Navigation */}
  <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-cyan-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bot-icon rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"></svg>
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V7H1V9H3V15H1V17H3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V17H23V15H21V9H23ZM19 9V15H5V9H19ZM7.5 11.5C7.5 10.67 8.17 10 9 10S10.5 10.67 10.5 11.5 9.83 13 9 13 7.5 12.33 7.5 11.5ZM13.5 11.5C13.5 10.67 14.17 10 15 10S16.5 10.67 16.5 11.5 15.83 13 15 13 13.5 12.33 13.5 11.5ZM12 16C13.11 16 14.08 16.59 14.71 17.5H9.29C9.92 16.59 10.89 16 12 16Z" />
            </svg>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            StartGenie AI
          </span>
        </div>
        <div className="hidden md:flex space-x-8">
          <a href="#features" className="text-slate-700 hover:text-cyan-600 transition-colors font-medium">
            Features
          </a>
          <a href="#how-it-works" className="text-slate-700 hover:text-cyan-600 transition-colors font-medium">
            How It Works
          </a>
          <a href="#pricing" className="text-slate-700 hover:text-cyan-600 transition-colors font-medium">
            Pricing
          </a>
          <a href="#contact" className="text-slate-700 hover:text-cyan-600 transition-colors font-medium">
            Contact
          </a>
        </div>

  <div className="flex items-center space-x-3">

  {/* Login */}
  <Link
    to="/login"
    className="chat-gradient text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 font-medium hidden md:inline"
  >
    Login
  </Link>

  {/* Signup */}
  <Link
    to="/signup"
    className="chat-gradient text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
  >
    Sign Up
  </Link>

</div>


      </div>
    </div>
  </nav>

  {/* Hero Section */}
  <section className="gradient-bg text-white py-20 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10"></div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
      <div className="floating mb-8">
        <div className="w-24 h-24 chat-gradient rounded-3xl flex items-center justify-center mx-auto mb-4 pulse-glow">
          <svg className="w-14 h-14 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V7H1V9H3V15H1V17H3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V17H23V15H21V9H23ZM19 9V15H5V9H19ZM7.5 11.5C7.5 10.67 8.17 10 9 10S10.5 10.67 10.5 11.5 9.83 13 9 13 7.5 12.33 7.5 11.5ZM13.5 11.5C13.5 10.67 14.17 10 15 10S16.5 10.67 16.5 11.5 15.83 13 15 13 13.5 12.33 13.5 11.5ZM12 16C13.11 16 14.08 16.59 14.71 17.5H9.29C9.92 16.59 10.89 16 12 16Z" />
          </svg>
        </div>
      </div>
      <h1 className="text-5xl md:text-6xl font-bold mb-6 slide-in">
        StartGenie AI
      </h1>
      <p
        className="text-2xl md:text-3xl mb-4 slide-in text-cyan-200"
        style={{ animationDelay: "0.2s" }}
      >
        One Idea. One Genie. Infinite Possibilities.
      </p>
      <p
        className="text-xl mb-8 max-w-3xl mx-auto slide-in text-slate-300"
        style={{ animationDelay: "0.4s" }}
      >
        Simply chat with our AI assistant about your business idea. Get instant market research,
        financial forecasts, and investor-ready business plans through natural conversation.
      </p>
      
      <div className="space-x-4 slide-in" style={{ animationDelay: "0.6s" }}>
  <Link
    to="/login"   // <-- Changed from /ai-advisor to /login
    className="inline-block bg-white text-slate-800 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-slate-100 transition-all duration-300 genie-glow"
  >
    🤖 AI Advisor
  </Link>
  <Link
    to="/signup"
    className="inline-block border-2 border-cyan-400 text-cyan-400 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-cyan-400 hover:text-slate-800 transition-all duration-300"
  >
    🚀 Create Account
  </Link>
</div>

      <div className="mt-6 slide-in flex flex-col items-center gap-3" style={{ animationDelay: "0.7s" }}>
        <div className="text-sm text-slate-300">Or continue with</div>
        <GoogleSignInButton
          onDone={(data) => {
            navigate(data.needsPasswordSetup ? "/set-password" : "/ai-advisor");
          }}
        />
      </div>
</div>

  </section>
  
  {/* Chat Demo Section */}
<section className="py-20 bg-white">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-slate-800 mb-4">See StartGenie in Action</h2>
      <p className="text-xl text-slate-600">
        Experience the power of conversational AI for business planning
      </p>
    </div>

    <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center mb-6 pb-4 border-b border-slate-700">
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <span className="text-slate-400 ml-4 font-mono">StartGenie AI Chat</span>
        <div className="ml-auto flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-400 text-sm">Online</span>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        
        {/* Bot Message */}
<div className="flex items-start space-x-3">
  <div className="w-8 h-8 bot-icon rounded-full flex items-center justify-center flex-shrink-0">
    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" />
    </svg>
  </div>
  <div className="chat-bubble chat-bubble-left bg-slate-200 text-slate-800 max-w-xs">
    <p className="font-medium text-cyan-600 text-sm mb-1">StartGenie AI</p>
    <p>Hi! I'm your AI business assistant. What's your startup idea? 🚀</p>
  </div>
</div>

{/* User Message */}
<div className="flex items-start space-x-3 justify-end">
  <div className="chat-bubble chat-bubble-right bg-cyan-500 text-white max-w-xs">
    <p>I want to start a milk delivery app in Pune for organic milk from local farms.</p>
  </div>
  <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
    <span className="text-white text-sm font-bold">U</span>
  </div>
</div>

{/* Bot Message */}
<div className="flex items-start space-x-3">
  <div className="w-8 h-8 bot-icon rounded-full flex items-center justify-center flex-shrink-0">
    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" />
    </svg>
  </div>
  <div className="chat-bubble chat-bubble-left bg-slate-200 text-slate-800 max-w-md">
    <p className="font-medium text-cyan-600 text-sm mb-2">StartGenie AI</p>
    <div>
      <p className="mb-2">🔍 Analyzing organic milk delivery market in Pune...</p>
      <p className="mb-2">📊 Found 210+ competitors | ₹1,200 Crore Indian organic milk market | Growing 15% YoY</p>
      <p className="mb-2">💰 Identified 85 relevant investors & dairy startup funds</p>
      <p className="text-green-600 font-semibold">✨ Complete startup insight generated!</p>
    </div>
  </div>
</div>

{/* Bot Response */}
<div className="flex items-start space-x-3">
  <div className="w-8 h-8 bot-icon rounded-full flex items-center justify-center flex-shrink-0">
    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" />
    </svg>
  </div>
  <div className="chat-bubble chat-bubble-left bg-slate-200 text-slate-800 max-w-lg">
    <p className="font-medium text-cyan-600 text-sm mb-2">StartGenie AI</p>
    <p className="mb-3">
      Great idea! 🥛 The organic milk industry is rapidly growing — especially in cities like Pune where consumers prefer health-focused, chemical-free products. Here's what I found:
    </p>
    <div className="bg-white rounded-lg p-3 text-sm">
      <p><strong>💰 Market Size:</strong> ₹1,200 Crore Indian organic milk market (15% annual growth)</p>
      <p><strong>🎯 Target:</strong> Urban families & fitness-conscious customers aged 25–50 in Pune</p>
      <p><strong>💡 Startup Cost:</strong> ₹4.5L – ₹6L (app, logistics, and marketing setup)</p>
      <p><strong>📈 Break-even:</strong> 14–18 months</p>
    </div>
    <p className="mt-3 text-sm">Would you like me to generate your complete business plan? 📋</p>
  </div>
</div>

{/* Chat Input */}
<div className="mt-6 pt-4 border-t border-slate-700">
  <div className="flex items-center space-x-3">
    <input
      type="text"
      placeholder="Type your message..."
      className="flex-1 bg-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
    />
    <button className="chat-gradient p-3 rounded-xl hover:shadow-lg transition-all duration-300">
      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
      </svg>
    </button>
  </div>
</div>

      </div>
    </div>
  </div>
</section>

{/* Features Section */}
<section id="features" className="py-20 bg-slate-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold text-slate-800 mb-4">Intelligent Chat Features</h2>
      <p className="text-xl text-slate-600 max-w-3xl mx-auto">
        Advanced AI capabilities that understand your business needs through natural conversation
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-8">
      <div className="interactive-card text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl">
        <div className="w-16 h-16 chat-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,2A2,2 0 0,1 14,4C14,5.1 13.1,6 12,6C10.9,6 10,5.1 10,4A2,2 0 0,1 12,2ZM21,9V7L15,1H5C3.89,1 3,1.89 3,3V7H1V9H3V15H1V17H3V21C3,22.11 3.89,23 5,23H19C20.11,23 21,22.11 21,21V17H23V15H21V9H23ZM19,9V15H5V9H19Z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold mb-4 text-slate-800">Local Startup Trends</h3>
        <p className="text-slate-600">
          Discover how startups are evolving in your region. Explore emerging industries, innovative ideas, and local opportunities shaping the future of business.
        </p>
      </div>

      <div className="interactive-card text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold mb-4 text-slate-800">Instant Insights</h3>
        <p className="text-slate-600">
          Get real-time market data, competitor analysis, and financial projections 
          as you chat. No waiting, no complex forms.
        </p>
      </div>

      <div className="interactive-card text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold mb-4 text-slate-800">Complete Documents</h3>
        <p className="text-slate-600">
          Generate comprehensive business plans, pitch decks, and financial models 
          directly from your conversations.
        </p>
      </div>
    </div>
  </div>
</section>

{/* How It Works */}
<section id="how-it-works" className="py-20 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold text-slate-800 mb-4">How Our AI Chat Works</h2>
      <p className="text-xl text-slate-600">Three simple steps to transform your idea into a business plan</p>
    </div>

    <div className="grid md:grid-cols-3 gap-8">
      <div className="text-center">
        <div className="chat-gradient text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 pulse-glow">1</div>
        <h3 className="text-xl font-bold mb-4 text-slate-800">Start Chatting</h3>
        <p className="text-slate-600">
          Simply describe your business idea in natural language. Our AI will ask smart follow-up questions to understand your vision.
        </p>
      </div>

      <div className="text-center">
        <div className="chat-gradient text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 pulse-glow" style={{ animationDelay: "0.5s" }}>2</div>
        <h3 className="text-xl font-bold mb-4 text-slate-800">AI Analysis</h3>
        <p className="text-slate-600">
          Watch as our AI researches your market in real-time, finding competitors, opportunities, and providing instant feedback through chat.
        </p>
      </div>

      <div className="text-center">
        <div className="chat-gradient text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 pulse-glow" style={{ animationDelay: "1s" }}>3</div>
        <h3 className="text-xl font-bold mb-4 text-slate-800">Get Your Plan</h3>
        <p className="text-slate-600">
          Receive your complete business plan, financial projections, and pitch deck - all generated from your conversation.
        </p>
      </div>
    </div>
  </div>
</section>

{/* Interactive Features Grid */}
<section className="py-20 bg-slate-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold text-slate-800 mb-4">Chat-Powered Business Tools</h2>
      <p className="text-xl text-slate-600">Everything you need, accessible through conversation</p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="interactive-card bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Pitch Deck Auto-Generator</h3>
        </div>
        <p className="text-slate-600 text-sm">
          Create a PPT or PDF pitch deck based on the business plan – ready to present to investors.
        </p>
      </div>

      <div className="interactive-card bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Live Market Data</h3>
        </div>
        <p className="text-slate-600 text-sm">
          Ask about market size, competitors, or trends and get instant, up-to-date information.
        </p>
      </div>

      <div className="interactive-card bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mr-4">
            <span className="text-2xl">🤝</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Smart Recommendations</h3>
        </div>
        <p className="text-slate-600 text-sm">
          Get AI suggestions for co-founders, investors, and business strategies through chat.
        </p>
      </div>

      <div className="interactive-card bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Instant SWOT Analysis</h3>
        </div>
        <p className="text-slate-600 text-sm">
          Ask for strengths, weaknesses, opportunities, and threats analysis in seconds.
        </p>
      </div>

      <div className="interactive-card bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mr-4">
            <span className="text-2xl">🏛️</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Government Schemes</h3>
        </div>
        <p className="text-slate-600 text-sm">
          Chat to discover relevant startup grants, MSME schemes, and registration help.
        </p>
      </div>

      <div className="interactive-card bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
            <span className="text-2xl">💰</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800">Financial Planning</h3>
        </div>
        <p className="text-slate-600 text-sm">
          Discuss budgets, revenue models, and get detailed 5-year financial forecasts.
        </p>
      </div>
    </div>
  </div>
</section>

{/* Pricing Section */}
<section id="pricing" className="py-20 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-bold text-slate-800 mb-4">
        Choose Your Chat Plan
      </h2>
      <p className="text-xl text-slate-600">
        Flexible pricing for every entrepreneur
      </p>
    </div>

    <div className="grid md:grid-cols-3 gap-8">
      {/* Chat Starter */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
        <h3 className="text-2xl font-bold mb-4 text-slate-800">Chat Starter</h3>
        <div className="text-4xl font-bold text-cyan-600 mb-4">
        ₹15<span className="text-lg text-slate-600">/month</span>
        </div>
        <ul className="space-y-3 mb-8">
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> 100 chat messages/month
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> 2 Complete business plans
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> Basic market research
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> PDF export
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> Email support
          </li>
        </ul>
        <button className="w-full chat-gradient text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium">
          Start Chatting
        </button>
      </div>

      {/* Chat Pro */}
      <div className="bg-white rounded-2xl p-8 shadow-xl border-4 border-cyan-500 relative transform scale-105">
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 chat-gradient text-white px-4 py-1 rounded-full text-sm font-medium">
          Most Popular
        </div>
        <h3 className="text-2xl font-bold mb-4 text-slate-800">Chat Pro</h3>
        <div className="text-4xl font-bold text-cyan-600 mb-4">
          ₹25<span className="text-lg text-slate-600">/month</span>
        </div>
        <ul className="space-y-3 mb-8">
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> Unlimited chat messages
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> 6 Complete business plans
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> Advanced AI insights
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> Investor matching
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> Priority chat support
          </li>
        </ul>
        <button className="w-full chat-gradient text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium">
          Start Chatting
        </button>
      </div>

      {/* Enterprise Chat */}
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
        <h3 className="text-2xl font-bold mb-4 text-slate-800">Enterprise Chat</h3>
        <div className="text-4xl font-bold text-cyan-600 mb-4">
          ₹50<span className="text-lg text-slate-600">/month</span>
        </div>
        <ul className="space-y-3 mb-8">
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> Unlimited everything
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> Custom AI training
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> Team collaboration
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> API access
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> Dedicated chat support
          </li>
        </ul>
        <button className="w-full chat-gradient text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium">
          Contact Sales
        </button>
      </div>
    </div>
  </div>
</section>

{/* CTA Section */}
<section className="gradient-bg text-white py-20 relative overflow-hidden">
  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10"></div>
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
    <div className="floating mb-6">
      <div className="w-20 h-20 bg-white bg-opacity-20 rounded-3xl flex items-center justify-center mx-auto pulse-glow">
        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V7H1V9H3V15H1V17H3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V17H23V15H21V9H23ZM19 9V15H5V9H19Z"/>
        </svg>
      </div>
    </div>
    <h2 className="text-4xl font-bold mb-6">Ready to Chat Your Way to Success?</h2>
    <p className="text-xl mb-8 text-slate-300">
      Join thousands of entrepreneurs who've built successful businesses through AI-powered conversations
    </p>
    <button className="bg-white text-slate-800 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-slate-100 transition-all duration-300 genie-glow">
      💬 Start Your Free Chat Today
    </button>
    <p className="text-sm mt-4 opacity-80">No credit card required • 50 free messages • Cancel anytime</p>
  </div>
</section>

{/* Footer */}
<footer id="contact" className="bg-slate-900 text-white py-12">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
      <div className="max-w-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 chat-gradient rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"/>
            </svg>
          </div>
          <span className="text-xl font-bold">StartGenie AI</span>
        </div>
        <p className="text-slate-400">
          Transforming startup ideas into reality through intelligent conversations and AI-powered insights.
        </p>
        <p className="text-slate-300 text-sm mt-4">
          <span className="text-slate-400">Team:</span> Sanika, Pranjal, Bariya, Zeenat
        </p>
      </div>
    </div>

    <div className="grid md:grid-cols-4 gap-8">
      <div>
        <h4 className="font-bold mb-4">Product</h4>
        <ul className="space-y-2 text-slate-400">
          <li><Link to="/login" className="hover:text-cyan-400 transition-colors">AI Advisor / Chat</Link></li>
          <li><Link to="/login" className="hover:text-cyan-400 transition-colors">Blueprint Generator</Link></li>
          <li><a href="#features" className="hover:text-cyan-400 transition-colors">Features</a></li>
          <li><a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a></li>
        </ul>
      </div>

      <div>
        <h4 className="font-bold mb-4">Developers</h4>
        <ul className="space-y-2 text-slate-400">
          <li><Link to="/api" className="hover:text-cyan-400 transition-colors">API</Link></li>
          <li><Link to="/docs" className="hover:text-cyan-400 transition-colors">Documentation</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="font-bold mb-4">Platform</h4>
        <ul className="space-y-2 text-slate-400">
          <li><Link to="/about" className="hover:text-cyan-400 transition-colors">About</Link></li>
          <li><Link to="/blog" className="hover:text-cyan-400 transition-colors">Blog</Link></li>
          <li><Link to="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="font-bold mb-4">Follow Us</h4>
        <ul className="space-y-2 text-slate-400">
          <li>
            <a
              href="https://github.com/Pranjal416713"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              GitHub
            </a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/bariya-shaikh-3952482a9/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              LinkedIn
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/guravsanika54?utm_source=qr&igsh=MXV0NWlpcmJrbGNtZA=="
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              Instagram
            </a>
          </li>
          <li>
            <a href="mailto:zeenatstudyzone@gmail.com" className="hover:text-cyan-400 transition-colors">
              Gmail
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
      <p>&copy; 2026 StartGenie AI. All rights reserved. Chat Your Way to Success.</p>
    </div>
  </div>
</footer>

 <style>{`
          body {
            box-sizing: border-box;
          }
          
          .gradient-bg {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          }
          
          .chat-gradient {
            background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%);
          }
          
          .genie-glow {
            box-shadow: 0 0 30px rgba(6, 182, 212, 0.4);
          }
          
          .floating {
            animation: float 6s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          .pulse-glow {
            animation: pulseGlow 2s ease-in-out infinite;
          }
          
          @keyframes pulseGlow {
            0%, 100% { 
              box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
              transform: scale(1);
            }
            50% { 
              box-shadow: 0 0 40px rgba(6, 182, 212, 0.6);
              transform: scale(1.05);
            }
          }
          
          .typing-animation {
            animation: typing 2s steps(20) infinite;
          }
          
          @keyframes typing {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0.3; }
          }
          
          .slide-in {
            animation: slideIn 0.8s ease-out forwards;
            opacity: 0;
            transform: translateY(30px);
          }
          
          @keyframes slideIn {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .chat-bubble {
            position: relative;
            padding: 1rem 1.5rem;
            border-radius: 1.5rem;
            margin: 0.5rem 0;
          }
          
          .chat-bubble::before {
            content: '';
            position: absolute;
            width: 0;
            height: 0;
            border-style: solid;
          }
          
          .chat-bubble-left::before {
            left: -10px;
            top: 50%;
            transform: translateY(-50%);
            border-width: 10px 15px 10px 0;
            border-color: transparent #e2e8f0 transparent transparent;
          }
          
          .chat-bubble-right::before {
            right: -10px;
            top: 50%;
            transform: translateY(-50%);
            border-width: 10px 0 10px 15px;
            border-color: transparent transparent transparent #06b6d4;
          }
          
          .interactive-card {
            transition: all 0.3s ease;
            cursor: pointer;
          }
          
          .interactive-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          }
          
          .bot-icon {
            background: linear-gradient(135deg, #06b6d4, #3b82f6);
            animation: botPulse 3s ease-in-out infinite;
          }
          
          @keyframes botPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>

</div>
  );
}

export default LandingPage;
