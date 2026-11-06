'use client';

import { UserPlus, House, Sparkles, Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    step: '01',
    title: 'Create Your Student ID',
    desc: 'Select your university, department, and academic level. Verify your campus email to unlock all features.',
    icon: UserPlus,
    badge: 'Quick 60s Signup',
    color: 'from-blue-600 to-indigo-600',
    light: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
  },
  {
    step: '02',
    title: 'Find Hostels or Roommates',
    desc: 'Browse verified off-campus lodges with photo tours and direct landlord contacts. Filter roommates by sleep and study rhythm.',
    icon: House,
    badge: 'Zero Agent Fraud',
    color: 'from-indigo-600 to-purple-600',
    light: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400',
  },
  {
    step: '03',
    title: 'Sync Timetable & Gemini AI',
    desc: 'Set your lectures and exam dates for auto-reminders. Use your dedicated Gemini AI copilot to dissect tough course topics.',
    icon: Sparkles,
    badge: 'A+ Grade Booster',
    color: 'from-purple-600 to-pink-600',
    light: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400',
  },
  {
    step: '04',
    title: 'Connect, Vibe & Conquer',
    desc: 'Post updates to your campus feed, trade course materials safely on the marketplace, and ace your semester with peace of mind.',
    icon: Trophy,
    badge: 'Complete Experience',
    color: 'from-pink-600 to-rose-600',
    light: 'bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/40 border-t border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/70 dark:border-indigo-800/70">
            Simple 4-Step Journey
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            How SkoollHub Works for You
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            From fresh 100L resumption to final year project defence, getting started takes less than two minutes.
          </p>
        </div>

        {/* 4 Cards in a row with progressive numbers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Step Number & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-3xl font-black text-slate-200 dark:text-slate-800 group-hover:text-indigo-500/30 transition-colors">
                      {item.step}
                    </span>
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mb-2">
                    {item.badge}
                  </span>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
                </div>

                <div className="pt-6">
                  <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${item.color}`}
                      style={{ width: `${(idx + 1) * 25}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Callout below */}
        <div className="mt-12 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all hover:-translate-y-0.5"
          >
            <span>Create Your Free Student Profile Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
