'use client';

import { Users, House, Sparkles, Star, ShieldCheck, TrendingUp } from 'lucide-react';

const stats = [
  {
    id: 'students',
    number: '15,000+',
    label: 'Verified Students',
    desc: 'Connecting across 30+ top universities and higher institutions.',
    icon: Users,
    gradient: 'from-blue-500 to-indigo-600',
    lightBg: 'bg-blue-50/70 dark:bg-blue-950/40',
    border: 'border-blue-200/60 dark:border-blue-900/60',
  },
  {
    id: 'lodges',
    number: '3,500+',
    label: 'Inspected Lodges & Hostels',
    desc: 'Direct landlord contacts with zero arbitrary agent finder fees.',
    icon: House,
    gradient: 'from-indigo-500 to-purple-600',
    lightBg: 'bg-indigo-50/70 dark:bg-indigo-950/40',
    border: 'border-indigo-200/60 dark:border-indigo-900/60',
  },
  {
    id: 'compatibility',
    number: '98.4%',
    label: 'Roommate Compatibility',
    desc: 'Students report smooth semester living through lifestyle habit filters.',
    icon: Star,
    gradient: 'from-purple-500 to-pink-600',
    lightBg: 'bg-purple-50/70 dark:bg-purple-950/40',
    border: 'border-purple-200/60 dark:border-purple-900/60',
  },
  {
    id: 'ai-sessions',
    number: '50k+',
    label: 'Gemini AI Study Queries',
    desc: 'Exam revisions, past question explanations, and schedule breakdowns.',
    icon: Sparkles,
    gradient: 'from-pink-500 to-rose-600',
    lightBg: 'bg-pink-50/70 dark:bg-pink-950/40',
    border: 'border-pink-200/60 dark:border-pink-900/60',
  },
];

export default function StatsSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/70 dark:border-indigo-800/70">
            <TrendingUp className="w-3.5 h-3.5" />
            Impact by the Numbers
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Trusted by the Smartest Students on Campus
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Designed from day one to replace fragmented WhatsApp groups and dangerous street agent deals with a secure,
            verified academic ecosystem.
          </p>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.id}
                className={`relative group rounded-3xl p-6 bg-white dark:bg-slate-900 border ${stat.border} shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden`}
              >
                {/* Subtle hover gradient wash */}
                <div
                  className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 rounded-full blur-2xl transition-opacity`}
                />

                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-tr ${stat.gradient} text-white shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                    {stat.number}
                  </h3>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{stat.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">{stat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
