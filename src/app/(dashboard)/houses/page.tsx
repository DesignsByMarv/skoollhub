'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface HostelListing {
  id: string;
  title: string;
  location: string;
  price: string;
  type: string;
  image: string;
  rating: number;
  availableRooms: number;
  verified: boolean;
}

export default function HousesPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const hostels: HostelListing[] = [
    {
      id: '1',
      title: 'Grace Villa Hostels',
      location: 'Asherifa, OAU Ile-Ife',
      price: '₦250,000 / yr',
      type: 'Single Room',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=1000&auto=format&fit=crop',
      rating: 4.8,
      availableRooms: 3,
      verified: true,
    },
    {
      id: '2',
      title: 'Royal Palm Heights',
      location: 'Gate 1, UNILORIN',
      price: '₦350,000 / yr',
      type: 'Self Contain',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop',
      rating: 4.6,
      availableRooms: 2,
      verified: true,
    },
    {
      id: '3',
      title: 'Apex Student Apartments',
      location: 'Campus Road, OAU',
      price: '₦400,000 / yr',
      type: '2 Bedroom Flat',
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop',
      rating: 4.9,
      availableRooms: 1,
      verified: true,
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

  const filteredHostels = hostels.filter((h) => {
    const matchesSearch =
      h.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || h.type === selectedType;
    return matchesSearch && matchesType;
  });

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

      {/* MAIN HOSTEL CONTENT */}
      <main className="max-w-5xl mx-auto py-6 px-4">
        
        {/* Title & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Hostels & Apartments</h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              Find verified off-campus student accommodation around your university.
            </p>
          </div>

          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search hostel or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 text-xs rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {['All', 'Single Room', 'Self Contain', '2 Bedroom Flat'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                selectedType === type
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Hostel Cards Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
          {filteredHostels.map((hostel) => (
            <div
              key={hostel.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-48 w-full">
                <img
                  src={hostel.image}
                  alt={hostel.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                  {hostel.type}
                </span>
                {hostel.verified && (
                  <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                    ✓ Verified
                  </span>
                )}
              </div>

              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm tracking-tight">{hostel.title}</h3>
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-1">
                    ★ {hostel.rating}
                  </span>
                </div>

                <p className="text-xs text-gray-500 dark:text-zinc-400 flex items-center gap-1">
                  📍 {hostel.location}
                </p>

                <div className="mt-2 pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400">Price</span>
                    <p className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                      {hostel.price}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="px-3.5 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all"
                  >
                    View Details
                  </button>
                </div>
              </div>
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
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none"
        >
          <span className="text-lg">🏢</span>
          <span>Hostels</span>
        </button>

        {/* ➕ CENTER CREATE LISTING / POST BUTTON */}
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