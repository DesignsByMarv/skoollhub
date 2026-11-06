'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'Is SkoollHub free for university students?',
    a: 'Yes! Joining SkoollHub, creating your student profile, browsing the campus feed, setting up your lecture timetable, and messaging course peers is 100% free. Paid options exist only for premium features like direct landlord contact unlocks and extended Gemini AI research credits.',
  },
  {
    q: 'How does SkoollHub prevent housing and hostel agent scams?',
    a: 'Every hostel and private lodge listed on SkoollHub is reviewed by our campus ambassadors or trusted university partners. We confirm physical gate locations, check basic amenities (power, borehole, perimeter security), and verify landlord identities before any property is activated.',
  },
  {
    q: 'How does roommate compatibility matching work?',
    a: 'During onboarding or in your profile settings, you answer key lifestyle questions: your sleep rhythm (early riser vs night owl), study environment preference (quiet library focus vs group study), cleanliness standard, budget range, and academic level. Our algorithm matches you with fellow students in your university with high compatibility scores.',
  },
  {
    q: 'What can the Gemini-powered Skooll AI Assistant do?',
    a: 'Skooll AI is designed specifically for academic success. You can ask it to break down complex lecture notes, explain tough mathematical formulas step-by-step, generate revision flashcards, quiz you with simulated past questions, or create a personalized 2-week exam revision timetable.',
  },
  {
    q: 'How do I install the app on my phone (iOS or Android)?',
    a: 'SkoollHub is a Progressive Web App (PWA). On Android, tap the "Install App" button in our header or select "Install SkoollHub" from Chrome’s menu. On iPhone, open the site in Safari, tap the Share icon (box with up arrow), and select "Add to Home Screen". It installs without taking up gigabytes of phone storage and works offline!',
  },
  {
    q: 'Are my location and personal details private?',
    a: 'Absolutely. We do not store or broadcast your precise GPS coordinates. Approximate location discovery is completely opt-in and rounded to ~1km to protect your privacy while helping you discover coursemates and lodges in your campus zone.',
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/40 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/70 dark:border-indigo-800/70">
            <HelpCircle className="w-3.5 h-3.5" />
            Got Questions? We’ve Got Answers
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Everything you need to know about navigating your campus life with SkoollHub.
          </p>
        </div>

        {/* Accordion Cards */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-white dark:bg-slate-900 border-indigo-300 dark:border-indigo-800 shadow-md'
                    : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'bg-indigo-600 text-white rotate-180'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
