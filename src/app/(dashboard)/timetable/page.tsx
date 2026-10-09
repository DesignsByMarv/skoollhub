'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ClassSchedule {
  id: string;
  courseCode: string;
  courseTitle: string;
  time: string;
  venue: string;
  lecturer: string;
  day: string;
}

export default function TimetablePage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const scheduleData: ClassSchedule[] = [
    {
      id: '1',
      courseCode: 'FCS 201',
      courseTitle: 'Introduction to Family & Consumer Sciences',
      time: '08:00 AM - 10:00 AM',
      venue: 'SLT Hall 1',
      lecturer: 'Dr. Adeleke',
      day: 'Monday',
    },
    {
      id: '2',
      courseCode: 'PNT 101',
      courseTitle: 'General Plant Biology',
      time: '11:00 AM - 01:00 PM',
      venue: 'Biology Lab 2',
      lecturer: 'Prof. Ogunleye',
      day: 'Monday',
    },
    {
      id: '3',
      courseCode: 'CSC 201',
      courseTitle: 'Computer Programming I',
      time: '09:00 AM - 11:00 AM',
      venue: 'ICT Center Auditorium',
      lecturer: 'Engr. Marv',
      day: 'Tuesday',
    },
    {
      id: '4',
      courseCode: 'CHM 101',
      courseTitle: 'General Physical Chemistry',
      time: '02:00 PM - 04:00 PM',
      venue: '1000 Capacity LT',
      lecturer: 'Dr. Mrs. Ibrahim',
      day: 'Wednesday',
    },
  ];

  // Restore the shared theme preference when navigating to this page.
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

  const activeClasses = scheduleData.filter((item) => item.day === selectedDay);

  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 bg-amber-50/20 dark:bg-zinc-950 pb-24 relative select-none">
      
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

      {/* MAIN CLASSES / TIMETABLE CONTENT */}
      <main className="max-w-5xl mx-auto py-6 px-4">
        
        {/* Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Lecture Timetable</h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Organize and track your daily lectures, venues, and schedules.
          </p>
        </div>

        {/* Days Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {days.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                selectedDay === day
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Schedule List */}
        <div className="mt-4 flex flex-col gap-4 max-w-2xl">
          {activeClasses.length > 0 ? (
            activeClasses.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-200 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
                      {item.courseCode}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-zinc-400 font-medium">
                      🕒 {item.time}
                    </span>
                  </div>
                  <h3 className="font-bold text-base mt-1">{item.courseTitle}</h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400">
                    👨‍🏫 {item.lecturer}
                  </p>
                </div>

                <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 dark:border-zinc-800">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
                    📍 {item.venue}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border border-gray-200 dark:border-zinc-800 text-center">
              <span className="text-3xl">🎉</span>
              <p className="font-bold text-sm mt-2">No lectures scheduled for {selectedDay}!</p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Enjoy your study break or add a new course.</p>
            </div>
          )}
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
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none"
        >
          <span className="text-lg">📅</span>
          <span>Classes</span>
        </button>
      </nav>
    </div>
  );
}