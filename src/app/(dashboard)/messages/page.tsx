'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  sender: 'me' | 'them';
  text: string;
  timestamp: string;
}

interface ChatThread {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  online: boolean;
  messages: Message[];
}

export default function MessagesPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string>('1');
  const [inputText, setInputText] = useState('');

  const [threads, setThreads] = useState<ChatThread[]>([
    {
      id: '1',
      name: 'Hostel Plug OAU',
      avatar: '🏠',
      lastMessage: 'The self-contain near Asherifa is still available!',
      time: '10:42 AM',
      unreadCount: 2,
      online: true,
      messages: [
        { id: 'm1', sender: 'them', text: 'Hello! Are you still looking for accommodation near Asherifa?', timestamp: '10:40 AM' },
        { id: 'm2', sender: 'me', text: 'Yes! Is the self-contain still available?', timestamp: '10:41 AM' },
        { id: 'm3', sender: 'them', text: 'The self-contain near Asherifa is still available!', timestamp: '10:42 AM' },
      ],
    },
    {
      id: '2',
      name: 'Tobi (Roommate Match)',
      avatar: '👨‍🎓',
      lastMessage: 'I am in 200L Computer Science too. Lets link up!',
      time: 'Yesterday',
      unreadCount: 0,
      online: false,
      messages: [
        { id: 'm10', sender: 'me', text: 'Hey Tobi! Saw your roommate profile.', timestamp: 'Yesterday' },
        { id: 'm11', sender: 'them', text: 'I am in 200L Computer Science too. Lets link up!', timestamp: 'Yesterday' },
      ],
    },
    {
      id: '3',
      name: 'Class Rep FCS 201',
      avatar: '📚',
      lastMessage: 'Tomorrow lecture has been moved to 10:00 AM',
      time: 'Oct 8',
      unreadCount: 0,
      online: true,
      messages: [
        { id: 'm20', sender: 'them', text: 'Tomorrow lecture has been moved to 10:00 AM', timestamp: 'Oct 8' },
      ],
    },
  ]);

  // Sync Dark Mode Class on Root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Floating Draggable AI Button State
  const [aiPos, setAiPos] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 20,
    initialY: 100,
  });

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(false);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: aiPos.x,
      initialY: aiPos.y,
    };

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - dragRef.current.startX;
      const dy = moveEvent.clientY - dragRef.current.startY;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        setIsDragging(true);
      }

      setAiPos({
        x: Math.max(10, Math.min(window.innerWidth - 70, dragRef.current.initialX - dx)),
        y: Math.max(10, Math.min(window.innerHeight - 80, dragRef.current.initialY - dy)),
      });
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const activeThread = threads.find((t) => t.id === activeChatId) || threads[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text: inputText.trim(),
      timestamp: 'Just now',
    };

    setThreads((prev) =>
      prev.map((thread) => {
        if (thread.id === activeChatId) {
          return {
            ...thread,
            lastMessage: newMsg.text,
            time: 'Just now',
            messages: [...thread.messages, newMsg],
          };
        }
        return thread;
      })
    );

    setInputText('');
  };

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 bg-amber-50/20 dark:bg-zinc-950 pb-24 relative select-none flex flex-col">
      
      {/* HEADER MATCHING DASHBOARD */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 
            onClick={() => handleNavigate('/dashboard')}
            className="font-extrabold text-xl tracking-tight text-indigo-600 dark:text-indigo-400 cursor-pointer"
          >
            SkoollHub
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

      {/* MAIN MESSAGES CONTENT CONTAINER */}
      <main className="max-w-5xl mx-auto w-full flex-1 py-4 px-3 flex gap-4 h-[calc(100vh-130px)]">
        
        {/* THREADS LIST (LEFT SIDEBAR) */}
        <div className="w-full md:w-80 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-3 flex flex-col gap-2 overflow-y-auto">
          <h2 className="font-bold text-base px-2 py-1">Direct Messages</h2>

          <div className="flex flex-col gap-1">
            {threads.map((thread) => (
              <div
                key={thread.id}
                onClick={() => setActiveChatId(thread.id)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  activeChatId === thread.id
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/50'
                    : 'hover:bg-gray-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="relative text-2xl bg-gray-100 dark:bg-zinc-800 w-10 h-10 rounded-full flex items-center justify-center">
                  {thread.avatar}
                  {thread.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs truncate">{thread.name}</p>
                    <span className="text-[10px] text-gray-400">{thread.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400 truncate mt-0.5">
                    {thread.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACTIVE CONVERSATION BOX (RIGHT) */}
        <div className="hidden md:flex flex-1 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 flex-col overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center gap-3 bg-gray-50/50 dark:bg-zinc-900/50">
            <span className="text-2xl bg-indigo-100 dark:bg-indigo-950 p-2 rounded-full">
              {activeThread.avatar}
            </span>
            <div>
              <h3 className="font-bold text-sm">{activeThread.name}</h3>
              <p className="text-[10px] text-emerald-500 font-medium">
                {activeThread.online ? 'Active now' : 'Offline'}
              </p>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {activeThread.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'me' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs font-medium shadow-sm ${
                    msg.sender === 'me'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-gray-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}
          </div>

          {/* Message Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-gray-200 dark:border-zinc-800 flex items-center gap-2 bg-white dark:bg-zinc-900"
          >
            <input
              type="text"
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2 text-xs rounded-full bg-gray-100 dark:bg-zinc-800 border-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </main>

      {/* FLOATING DRAGGABLE AI BUTTON */}
      <div
        style={{ right: `${aiPos.x}px`, bottom: `${aiPos.y}px` }}
        onPointerDown={handlePointerDown}
        className="fixed z-50 touch-none cursor-grab active:cursor-grabbing"
      >
        <button
          type="button"
          onClick={() => {
            if (isDragging) return;
            handleNavigate('/ai-assistant');
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all border border-indigo-500/30"
        >
          <span className="text-base">🤖</span>
          <span className="font-bold">AI</span>
        </button>
      </div>

      {/* BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-md bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full border border-gray-200 dark:border-zinc-800 px-6 py-2.5 flex items-center justify-between shadow-xl">
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

        {/* ➕ CENTER CREATE BUTTON */}
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