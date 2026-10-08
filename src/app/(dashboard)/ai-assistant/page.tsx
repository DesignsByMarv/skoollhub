'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Mode = 'chat' | 'web' | 'social' | 'research';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  mode?: Mode;
  sources?: { title: string; url: string }[];
  timestamp: string;
}

export default function AIAssistantPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeMode, setActiveMode] = useState<Mode>('chat');
  const [inputQuery, setInputQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I am your SkoollHub AI Assistant. I can search the web, track campus social media, or conduct deep research on academic topics and off-campus housing. How can I help you today?",
      timestamp: '12:00 PM',
    },
  ]);

  // Sync Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || isThinking) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputQuery.trim(),
      mode: activeMode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = inputQuery.trim();
    setInputQuery('');
    setIsThinking(true);

    // Simulated AI response handling (Connect your API route here)
    setTimeout(() => {
      let aiReplyText = '';
      let mockSources: { title: string; url: string }[] | undefined;

      if (activeMode === 'web') {
        aiReplyText = `🌐 **Web Search Results for:** "${currentInput}"\n\nBased on live web results, here is the latest context and overview...`;
        mockSources = [
          { title: 'OAU Student Portal Update', url: '#' },
          { title: 'Ile-Ife Campus News Brief', url: '#' },
        ];
      } else if (activeMode === 'social') {
        aiReplyText = `📱 **Social Media Trends:**\n\nRecent posts across X (Twitter) and student forums mention key discussions regarding hosteling around Asherifa and Gate 1.`;
      } else if (activeMode === 'research') {
        aiReplyText = `🔬 **Deep Research Synthesis:**\n\n### 1. Context & Overview\nAnalyzing multiple technical sources and academic documents regarding ${currentInput}...\n\n### 2. Strategic Breakdown\n- **Point A:** High impact factor noted across primary references.\n- **Point B:** Structured findings align with standard benchmarks.`;
        mockSources = [
          { title: 'Academic Database Index', url: '#' },
          { title: 'ResearchGate Reference Paper', url: '#' },
        ];
      } else {
        aiReplyText = `I analyzed your query regarding "${currentInput}". Here is a concise summary based on your prompt.`;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiReplyText,
        mode: activeMode,
        sources: mockSources,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 bg-amber-50/20 dark:bg-zinc-950 pb-24 relative select-none flex flex-col">
      
      {/* HEADER MATCHING DASHBOARD */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 
            onClick={() => handleNavigate('/dashboard')}
            className="font-extrabold text-xl tracking-tight text-indigo-600 dark:text-indigo-400 cursor-pointer flex items-center gap-2"
          >
            <span>SkoollHub AI</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              Pro
            </span>
          </h1>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/settings')}
              className="p-2 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              title="Settings"
            >
              ⚙️
            </button>

            <button
              type="button"
              onClick={() => handleNavigate('/profile')}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs border-2 border-indigo-200 dark:border-indigo-900 hover:opacity-90 transition-opacity"
              title="Profile"
            >
              M
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-3xl mx-auto w-full flex-1 flex flex-col px-4 py-6 h-[calc(100vh-140px)]">
        
        {/* MESSAGES FEED */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-sm font-bold shadow-md shrink-0">
                  🤖
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-zinc-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Sources list if available */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Sources & References
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((source, i) => (
                        <a
                          key={i}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md hover:underline font-medium"
                        >
                          🔗 {source.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <span className="text-[9px] opacity-60 block text-right mt-1.5">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center text-sm font-bold shadow-md animate-pulse">
                🤖
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-2">
                <span className="animate-spin">🌀</span>
                <span>Synthesizing response and gathering findings...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* CLAUDE-STYLE MODE SELECTOR & INPUT BOX */}
        <div className="mt-4 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-2 shadow-lg">
          
          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-50 dark:bg-zinc-950 rounded-xl mb-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveMode('chat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeMode === 'chat'
                  ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              💬 General Chat
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('web')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeMode === 'web'
                  ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              🌐 Web Search
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('social')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeMode === 'social'
                  ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              📱 Social Media
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('research')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeMode === 'research'
                  ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              🔬 Research Mode
            </button>
          </div>

          {/* Form Input Bar */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 px-2 pb-1">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                activeMode === 'web'
                  ? 'Search live web for news, portals, hostel updates...'
                  : activeMode === 'social'
                  ? 'Track campus discussions, X/Twitter posts, viral trends...'
                  : activeMode === 'research'
                  ? 'Deep research academic papers, complex queries, course outlines...'
                  : 'Ask AI anything...'
              }
              className="flex-1 text-xs bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400 px-2 py-2"
            />

            <button
              type="submit"
              disabled={!inputQuery.trim() || isThinking}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-md"
            >
              Send
            </button>
          </form>
        </div>
      </main>

      {/* PERMANENT MESSAGES BUTTON (Bottom Right) */}
      <div className="fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => handleNavigate('/messages')}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl hover:scale-105 active:scale-95 transition-all border-2 border-white dark:border-zinc-900"
          title="Direct Messages"
        >
          <span className="text-xl">💬</span>
        </button>
      </div>

      {/* BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[88%] max-w-md bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full border border-gray-200 dark:border-zinc-800 px-6 py-2.5 flex items-center justify-between shadow-xl">
        <button
          type="button"
          onClick={() => handleNavigate('/dashboard')}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none"
        >
          <span className="text-lg">🏠</span>
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavigate('/houses')}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none"
        >
          <span className="text-lg">🏢</span>
          <span>Hostels</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavigate('/dashboard')}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-2xl shadow-md active:scale-90 transition-transform -mt-5 border-2 border-white dark:border-zinc-900 focus:outline-none"
          title="Create"
        >
          +
        </button>

        <button
          type="button"
          onClick={() => handleNavigate('/roommates')}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none"
        >
          <span className="text-lg">👥</span>
          <span>Roommates</span>
        </button>

        <button
          type="button"
          onClick={() => handleNavigate('/timetable')}
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none"
        >
          <span className="text-lg">📅</span>
          <span>Classes</span>
        </button>
      </nav>
    </div>
  );
}