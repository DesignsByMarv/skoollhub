'use client';

import { useState } from 'react';
import { Bot } from 'lucide-react';
import AIChatModal from '@/components/ai/AIChatModal';

export default function DashboardAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open SkoollHub AI assistant"
        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-700 active:scale-95 md:bottom-6"
      >
        <Bot size={18} />
        Ask AI
      </button>
      <AIChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
