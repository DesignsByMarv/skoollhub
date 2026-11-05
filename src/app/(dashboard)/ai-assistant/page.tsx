'use client';

import { useState } from 'react';
import { Bot, BookOpenCheck, Search, Sparkles } from 'lucide-react';
import AIChatModal from '@/components/ai/AIChatModal';

export default function AIAssistantPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-fuchsia-700 p-7 text-white sm:p-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15"><Bot size={25} /></div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-indigo-100">Your campus copilot</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">SkoollHub AI</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-50">Get study help, explore campus-life questions, or switch to live research modes for sourced answers. AI responses can be wrong, so verify important information.</p>
        <button type="button" onClick={() => setIsOpen(true)} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 hover:bg-indigo-50"><Sparkles size={17} />Start a conversation</button>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {[
          { title: 'Study support', description: 'Ask for explanations, summaries and study planning.', icon: BookOpenCheck },
          { title: 'Live research', description: 'Search mode brings web sources into the answer.', icon: Search },
          { title: 'Campus life', description: 'Get guidance tailored to Nigerian university life.', icon: Sparkles },
        ].map(({ title, description, icon: Icon }) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"><Icon className="text-indigo-600 dark:text-indigo-300" size={20} /><h2 className="mt-3 font-bold text-slate-900 dark:text-white">{title}</h2><p className="mt-1 text-sm leading-5 text-slate-500 dark:text-zinc-400">{description}</p></article>)}
      </div>
      <AIChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </section>
  );
}
