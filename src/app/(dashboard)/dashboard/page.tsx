'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CampusFeed from '@/components/feed/CampusFeed';
import RightSidebar from '@/components/feed/RightSidebar';

export default function DashboardPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  // Restore the shared theme preference when navigating to this page.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', window.localStorage.getItem('skoollhub-theme') === 'dark');
  }, []);

  // Draggable Floating AI Assistant Position (Centered horizontally above bottom nav)
  const [aiPos, setAiPos] = useState({ x: 20, y: 90 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 20,
    initialY: 90,
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

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 bg-amber-50/20 dark:bg-zinc-950 pb-24 relative select-none">
      
      {/* HEADER */}
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

      {/* MAIN FEED CONTENT */}
      <main className="flex justify-center gap-8 max-w-5xl mx-auto py-6 px-3">
        <div className="flex-1 max-w-[470px]">
          <CampusFeed />
        </div>
        <RightSidebar />
      </main>

      {/* FLOATING DRAGGABLE AI BUTTON (Middle / Lower Center Default) */}
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
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-xl hover:scale-105 active:scale-95 transition-all border border-indigo-400/30"
        >
          <span className="text-base">🤖</span>
          <span>AI</span>
        </button>
      </div>

      {/* PERMANENT MESSAGES FLOATING BUTTON (Bottom Right) */}
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
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none"
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

        {/* ➕ CENTER CREATE POST BUTTON */}
        <button
          type="button"
          onClick={() => handleNavigate('/feed')}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-2xl shadow-md active:scale-90 transition-transform -mt-5 border-2 border-white dark:border-zinc-900 focus:outline-none"
          title="Create Post"
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