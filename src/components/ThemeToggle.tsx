'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Only runs ONCE when component mounts
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';

    if (isDark) {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }
    setMounted(true);
  }, []); // 👈 MUST BE AN EMPTY ARRAY []

  const handleToggle = () => {
    const nextState = !darkMode;
    setDarkMode(nextState);

    if (nextState) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  if (!mounted) {
    return <div className="w-[51px] h-7 bg-gray-200 rounded-full" />;
  }

  return (
    <div className="flex items-center gap-3 select-none">
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
        {darkMode ? 'Dark' : 'Light'}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={darkMode}
        onClick={handleToggle}
        style={{
          backgroundColor: darkMode ? '#34C759' : '#E9E9EA',
        }}
        className="relative inline-flex h-7 w-[51px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-300 ease-in-out focus:outline-none"
      >
        <span
          style={{
            transform: darkMode ? 'translateX(24px)' : 'translateX(0px)',
          }}
          className="pointer-events-none inline-block h-[24px] w-[24px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15),0_3px_1px_rgba(0,0,0,0.06)] transition-transform duration-300 cubic-bezier(0.4,0,0.2,1)"
        />
      </button>
    </div>
  );
}