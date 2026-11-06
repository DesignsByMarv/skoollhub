'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Lightbulb } from 'lucide-react';

const quotes = [
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch" },
  { text: "Success is no accident. It is hard work, perseverance, learning, studying, and sacrifice.", author: "Pelé" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
  { text: "Invest in your mind; it pays the best interest.", author: "Benjamin Franklin" },
  { text: "Today a reader, tomorrow a leader.", author: "Margaret Fuller" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Anonymous" },
  { text: "Dream big, work hard, stay focused, and surround yourself with good people.", author: "Anonymous" },
];

export default function MotivationalQuote() {
  const [index, setIndex] = useState(0);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const currentQuote = quotes[index];

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        title="View Daily Motivation"
        className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-white dark:bg-slate-900 text-amber-500 border border-slate-200 dark:border-slate-800 shadow-xl hover:scale-110 transition-transform"
      >
        <Lightbulb className="w-5 h-5 fill-amber-400" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 max-w-xs sm:max-w-sm bg-white/95 dark:bg-slate-900/95 text-gray-900 dark:text-white border border-slate-200/90 dark:border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md transition-all duration-300 ease-in-out z-40">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <span>Campus Motivation</span>
            </p>
            <p className="text-xs font-medium italic leading-relaxed text-slate-700 dark:text-slate-200">
              "{currentQuote.text}"
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 text-right font-medium">
              — {currentQuote.author}
            </p>
          </div>
        </div>

        <button
          onClick={() => setMinimized(true)}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 -mr-1 -mt-1 rounded-lg"
          title="Minimize motivation"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
