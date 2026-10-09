'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RoommateProfile {
  id: string;
  name: string;
  dept: string;
  level: string;
  budget: string;
  location: string;
  lifestyle: string[];
  avatar: string;
  verified: boolean;
}

export default function RoommatesPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profiles: RoommateProfile[] = [
    {
      id: '1',
      name: 'Tunde Bakare',
      dept: 'Computer Science',
      level: '300L',
      budget: '₦150,000 - ₦200,000',
      location: 'Asherifa / Gate 1',
      lifestyle: ['Non-smoker', 'Quiet / Studious', 'Night Owl'],
      avatar: '👨‍💻',
      verified: true,
    },
    {
      id: '2',
      name: 'Chioma Adebayo',
      dept: 'Family Nutrition & Consumer Science',
      level: '200L',
      budget: '₦200,000 - ₦250,000',
      location: 'Campus Road / Town',
      lifestyle: ['Clean & Neat', 'Social', 'Early Riser'],
      avatar: '👩‍🔬',
      verified: true,
    },
    {
      id: '3',
      name: 'David Okonkwo',
      dept: 'Plant Biology',
      level: '100L',
      budget: '₦120,000 - ₦180,000',
      location: 'Hostel Zone A',
      lifestyle: ['Gamer', 'Non-smoker', 'Flexible'],
      avatar: '🎧',
      verified: false,
    },
  ];

  useEffect(() => {
    document.documentElement.classList.toggle('dark', window.localStorage.getItem('skoollhub-theme') === 'dark');
  }, []);

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

  const filteredProfiles = profiles.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {/* MAIN CONTENT */}
      <main className="max-w-5xl mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Roommate Finder</h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              Match with compatible students looking for roommates on campus.
            </p>
          </div>

          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search by department, area, or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 text-xs rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Roommate Cards Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.map((person) => (
            <div
              key={person.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-2xl border border-indigo-100 dark:border-indigo-900/30">
                      {person.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm tracking-tight flex items-center gap-1">
                        {person.name}
                        {person.verified && (
                          <span className="text-indigo-600 dark:text-indigo-400 text-xs" title="Verified Student">
                            ✓
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">
                        {person.dept} • {person.level}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 my-3 text-xs">
                  <div className="flex items-center justify-between text-gray-600 dark:text-zinc-400">
                    <span>Budget Range:</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                      {person.budget}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-600 dark:text-zinc-400">
                    <span>Preferred Area:</span>
                    <span className="font-medium">{person.location}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 my-3">
                  {person.lifestyle.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="w-full mt-2 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all"
              >
                Connect / Message
              </button>
            </div>
          ))}
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
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none"
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