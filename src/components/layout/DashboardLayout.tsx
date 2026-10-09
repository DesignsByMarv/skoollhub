'use client';

import { useState } from 'react';
import AIChatModal from '@/components/ai/AIChatModal';

export default function Dashboard() {
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      {/* Dashboard Main Content */}
      
      {/* Floating AI Action Button (Positioned safely above bottom nav) */}
      <button
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-20 right-5 z-40 flex items-center gap-2 rounded-full bg-purple-600 px-4 py-3 text-white shadow-lg transition hover:bg-purple-700 active:scale-95"
      >
        <span className="text-xs font-bold">🤖 AI</span>
      </button>

      {/* AI Assistant Modal */}
      <AIChatModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}