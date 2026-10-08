'use client';

import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % quotes.length);
    }, 5000); // Rotates every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const currentQuote = quotes[index];

  return (
    <div className="fixed bottom-6 right-6 max-w-sm bg-white text-gray-900 border border-gray-200 p-4 rounded-2xl shadow-xl transition-all duration-500 ease-in-out z-50">
      <div className="flex items-start gap-3">
        <span className="text-xl">💡</span>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Daily Motivation
          </p>
          <p className="text-xs font-medium italic leading-relaxed text-gray-800">
            "{currentQuote.text}"
          </p>
          <p className="text-[10px] text-gray-500 text-right font-medium">
            — {currentQuote.author}
          </p>
        </div>
      </div>
    </div>
  );
}