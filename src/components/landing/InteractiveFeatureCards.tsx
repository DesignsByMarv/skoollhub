'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  House,
  Users,
  Sparkles,
  BookOpen,
  MessageCircle,
  Clock,
  ShieldCheck,
  MapPin,
  Play,
  Pause,
  Bot,
  Heart,
  ArrowRight,
  Zap,
  Phone,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export default function InteractiveFeatureCards() {
  const [activeTab, setActiveTab] = useState<'all' | 'hostels' | 'roommates' | 'ai' | 'timetable' | 'social' | 'chat'>('all');

  // Roommate interactive simulator state
  const [roommateTraits, setRoommateTraits] = useState({
    schedule: 'night',
    study: 'quiet',
    cleanliness: 'high',
  });

  // AI prompt simulator state
  const [selectedPrompt, setSelectedPrompt] = useState(0);

  // Timetable simulator day
  const [selectedDay, setSelectedDay] = useState<'mon' | 'tue' | 'wed' | 'thu' | 'fri'>('mon');

  // Voice note simulator
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Social like simulator
  const [postLikes, setPostLikes] = useState(89);
  const [isLiked, setIsLiked] = useState(false);

  // Calculate simulated compatibility
  const getCompatibilityScore = () => {
    let score = 82;
    if (roommateTraits.schedule === 'early') score += 6;
    if (roommateTraits.study === 'quiet') score += 7;
    if (roommateTraits.cleanliness === 'high') score += 4;
    return Math.min(score, 99);
  };

  const aiPrompts = [
    {
      q: 'Explain Backpropagation in Neural Networks simply',
      a: "Think of Backpropagation like practicing free throws in basketball 🏀. When you miss (the error), you see where you went wrong and adjust your wrist and elbow angle (the weights) backwards, step-by-step, until you score consistently!",
      tag: 'CSC 402 • Machine Learning',
    },
    {
      q: 'How should I schedule my finals revision in 2 weeks?',
      a: "Use the 2-3-2 Spaced Repetition rule: Block mornings (8AM-11AM) for high-cognition problem solving (Maths/Code), afternoons for summary retrieval, and evenings for Gemini past-question drill testing.",
      tag: 'Study Strategy • GST & Dept Finals',
    },
    {
      q: 'Give me key points for Nigerian Constitutional Law',
      a: "The 3 pillar doctrines to master: 1) Supremacy of the Constitution (Section 1), 2) Separation of Powers across Executive, Legislature, Judiciary, and 3) Rule of Law guarantees under Chapter IV.",
      tag: 'Law 201 • Constitutional Law',
    },
  ];

  const timetableData = {
    mon: [
      { code: 'CSC 301', title: 'Data Structures & Algorithms', time: '08:00 AM - 10:00 AM', hall: 'Science LT 1', lecturer: 'Dr. Adeyemi', color: 'border-l-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30' },
      { code: 'MTH 311', title: 'Numerical Analysis', time: '11:00 AM - 01:00 PM', hall: 'Faculty Block B', lecturer: 'Prof. Okon', color: 'border-l-purple-500 bg-purple-50/50 dark:bg-purple-950/30' },
      { code: 'GST 301', title: 'Entrepreneurship & Innovation', time: '02:00 PM - 04:00 PM', hall: 'Main Auditorium', lecturer: 'Mrs. Bello', color: 'border-l-pink-500 bg-pink-50/50 dark:bg-pink-950/30' },
    ],
    tue: [
      { code: 'CSC 305', title: 'Operating Systems Architecture', time: '09:00 AM - 11:00 AM', hall: 'Hardware Lab 3', lecturer: 'Engr. Danjuma', color: 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/30' },
      { code: 'PHY 303', title: 'Electromagnetism Lab', time: '01:00 PM - 03:00 PM', hall: 'Physics Lab A', lecturer: 'Dr. Fatima', color: 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30' },
    ],
    wed: [
      { code: 'CSC 309', title: 'Database Systems & SQL', time: '08:00 AM - 10:00 AM', hall: 'ICT Center Hall 2', lecturer: 'Dr. Chika', color: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/30' },
      { code: 'STA 311', title: 'Probability & Statistics', time: '10:30 AM - 12:30 PM', hall: 'Science LT 2', lecturer: 'Dr. Samuel', color: 'border-l-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30' },
    ],
    thu: [
      { code: 'CSC 313', title: 'Software Engineering Methodologies', time: '10:00 AM - 12:00 PM', hall: 'Science LT 3', lecturer: 'Prof. Alabi', color: 'border-l-rose-500 bg-rose-50/50 dark:bg-rose-950/30' },
      { code: 'GNS 301', title: 'Technical Report Writing', time: '02:00 PM - 04:00 PM', hall: 'Arts Theater 1', lecturer: 'Dr. Evelyn', color: 'border-l-violet-500 bg-violet-50/50 dark:bg-violet-950/30' },
    ],
    fri: [
      { code: 'CSC 399', title: 'Student Seminar & Project Review', time: '09:00 AM - 11:00 AM', hall: 'Seminar Room B', lecturer: 'Dept Panel', color: 'border-l-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30' },
      { code: 'LIB 301', title: 'Digital Research Archives', time: '01:00 PM - 02:30 PM', hall: 'Virtual Library', lecturer: 'Librarian Peter', color: 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30' },
    ],
  };

  return (
    <section id="features" className="py-24 relative overflow-hidden bg-slate-50/60 dark:bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/70 dark:border-indigo-800/70">
            <Zap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Supercharged Feature Cards
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Built for Every Moment of Your Campus Journey
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            No more switching between 7 different WhatsApp groups, unverified street brokers, or confusing timetable PDFs.
            Interact with our live modules below.
          </p>

          {/* Interactive Category Filter Pills */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'all', label: 'All Modules' },
              { id: 'hostels', label: '🏡 Hostels & Lodges' },
              { id: 'roommates', label: '🤝 Roommate Match' },
              { id: 'ai', label: '🤖 Gemini AI' },
              { id: 'timetable', label: '📅 Timetable' },
              { id: 'social', label: '📢 Campus Feed' },
              { id: 'chat', label: '🎙️ Voice & Chat' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ---------------- 6 INTERACTIVE ANIMATED FEATURE CARDS GRID ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* ============================================================== */}
          {/* CARD 1: HOSTEL & LODGES FINDER */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'hostels') && (
            <div
              id="hostels"
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    <House className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Direct Landlords
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Verified Lodges & Hostels
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Browse physical inspected off-campus accommodations. Zero extortionate middleman agent cuts.
                </p>

                {/* Simulated Interactive Lodge Card */}
                <div className="mt-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        Self-Contain Apartment
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                        Emerald Hall Residence
                      </h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-red-500" /> 350m from Faculty of Law gate
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900 dark:text-white">₦380k</p>
                      <p className="text-[10px] text-slate-400">/ academic session</p>
                    </div>
                  </div>

                  {/* Amenities Badges */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <span className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                      ⚡ 24/7 Solar Backup
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                      💧 Constant Water
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                      🛡️ Perimeter Guard
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                      📶 Free High-speed WiFi
                    </span>
                  </div>

                  {/* Trust check */}
                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Inspected by Campus Ambassador
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/houses"
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white border border-indigo-200 dark:border-indigo-800 transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                >
                  <span>Explore Available Lodges</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* CARD 2: COMPATIBILITY ROOMMATE MATCHING */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'roommates') && (
            <div
              id="roommates"
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    <span className="animate-pulse">●</span> {getCompatibilityScore()}% Compatibility
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Smart Roommate Matching
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Filter by sleep cycles, study focus, cooking habits, and budget. Match before paying for a lodge!
                </p>

                {/* Interactive Habit Simulator */}
                <div className="mt-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Test Live Compatibility Factors:
                  </p>

                  <div className="space-y-2">
                    {/* Schedule Selector */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Daily Rhythm:</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setRoommateTraits((p) => ({ ...p, schedule: 'early' }))}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
                            roommateTraits.schedule === 'early'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Early Bird ☀️
                        </button>
                        <button
                          onClick={() => setRoommateTraits((p) => ({ ...p, schedule: 'night' }))}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
                            roommateTraits.schedule === 'night'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Night Owl 🦉
                        </button>
                      </div>
                    </div>

                    {/* Study Style */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Study Habit:</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setRoommateTraits((p) => ({ ...p, study: 'quiet' }))}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
                            roommateTraits.study === 'quiet'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Quiet & Focused 📚
                        </button>
                        <button
                          onClick={() => setRoommateTraits((p) => ({ ...p, study: 'group' }))}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
                            roommateTraits.study === 'group'
                              ? 'bg-purple-600 text-white'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Group Discussion 👥
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Matched Profile Preview */}
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white text-xs font-bold flex items-center justify-center">
                        EK
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Emeka K. • 300L</p>
                        <p className="text-[10px] text-slate-500">Accounting • Non-smoker</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-purple-600 dark:text-purple-400">
                      {getCompatibilityScore()}% Sync
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/roommates"
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white border border-purple-200 dark:border-purple-800 transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                >
                  <span>Find Your Roommate Match</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* CARD 3: GEMINI AI STUDY COPILOT */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'ai') && (
            <div
              id="ai-study"
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                    <Bot className="w-3.5 h-3.5" /> Powered by Gemini
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Skooll AI Study Copilot
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Your 24/7 personal tutor. Understand difficult course concepts, past exam questions, and study plans.
                </p>

                {/* Interactive AI Chat Mockup */}
                <div className="mt-5 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-b from-indigo-50/40 to-white dark:from-slate-950/80 dark:to-slate-900 p-4 space-y-3">
                  {/* Prompt Chip Selectors */}
                  <div className="flex flex-wrap gap-1.5">
                    {aiPrompts.map((p, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPrompt(idx)}
                        className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition-colors ${
                          selectedPrompt === idx
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        Prompt #{idx + 1}
                      </button>
                    ))}
                  </div>

                  {/* Simulated Question */}
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    &ldquo;{aiPrompts[selectedPrompt].q}&rdquo;
                  </div>

                  {/* Simulated Answer */}
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                    {aiPrompts[selectedPrompt].a}
                    <div className="mt-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                      🔖 {aiPrompts[selectedPrompt].tag}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/ai-assistant"
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white border border-indigo-200 dark:border-indigo-800 transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                >
                  <span>Launch Skooll AI Companion</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* CARD 4: TIMETABLE & ACADEMIC PLANNER */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'timetable') && (
            <div
              id="timetable"
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Class Timetable
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Lecture Timetable & Reminders
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Never miss an 8:00 AM lecture or lab session. Smart alerts ping your phone 15 minutes prior.
                </p>

                {/* Interactive Day Switcher */}
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    {(['mon', 'tue', 'wed', 'thu', 'fri'] as const).map((day) => (
                      <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`flex-1 py-1 text-center rounded-lg text-[11px] font-bold uppercase transition-all ${
                          selectedDay === day
                            ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  {/* Day's Classes */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {timetableData[selectedDay].map((cls, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border-l-4 border border-slate-200 dark:border-slate-800 ${cls.color}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 dark:text-white">{cls.code}</span>
                          <span className="text-[10px] font-medium text-slate-500">{cls.time}</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 truncate">
                          {cls.title}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          📍 {cls.hall} • {cls.lecturer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/timetable"
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 dark:hover:text-white border border-amber-200 dark:border-amber-800 transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                >
                  <span>Set Up Your Timetable</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* CARD 5: CAMPUS SOCIAL FEED & VOICES */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'social') && (
            <div
              id="social"
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-110 transition-transform">
                    <Flame className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Campus Pulse
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Campus Social Feed
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Real student posts, departmental news, lost-and-found, and student business marketplace.
                </p>

                {/* Simulated Feed Post */}
                <div className="mt-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                      FT
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        Fatima Tijani <CheckCircle2 className="w-3 h-3 text-blue-500" />
                      </p>
                      <p className="text-[10px] text-slate-400">UI Ibadan • Medicine 400L</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                    Free mock anatomy flashcards for 200L premed students are now uploaded in my SkoollHub profile notes tab! 🩺✨
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                    <span>#UIMedicine</span>
                    <span>#AnatomyDrill</span>
                    <span>#SkoollNotes</span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setIsLiked(!isLiked);
                        setPostLikes((p) => (isLiked ? p - 1 : p + 1));
                      }}
                      className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded-lg transition-colors ${
                        isLiked ? 'text-pink-600 bg-pink-50 dark:bg-pink-950/50' : 'text-slate-500'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-pink-600' : ''}`} />
                      <span>{postLikes}</span>
                    </button>
                    <span className="text-slate-400 text-[11px]">19 replies</span>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/feed"
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-pink-50 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600 dark:hover:text-white border border-pink-200 dark:border-pink-800 transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                >
                  <span>Join The Campus Feed</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* CARD 6: VOICE NOTES & ENCRYPTED CHAT */}
          {/* ============================================================== */}
          {(activeTab === 'all' || activeTab === 'chat') && (
            <div
              id="chat"
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> 1-on-1 Voice Calls
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Direct Chats & Voice Notes
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  End-to-end realtime messaging with audio notes and peer-to-peer WebRTC voice calling.
                </p>

                {/* Interactive Audio Player Simulator */}
                <div className="mt-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-900 dark:text-white">Voice Note from Landlord</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Verified</span>
                  </div>

                  {/* Audio waveform container */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <button
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-transform hover:scale-105 shadow-sm"
                    >
                      {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>

                    {/* Equalizer Waveform */}
                    <div className="flex-1 flex items-center gap-1 h-6">
                      {[12, 20, 14, 28, 16, 24, 18, 30, 22, 10, 26, 16, 20, 14, 22, 8].map((h, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full transition-all duration-300 ${
                            isPlayingAudio
                              ? 'bg-emerald-500 animate-pulse'
                              : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                          style={{
                            height: isPlayingAudio ? `${Math.max(6, (h * (i % 2 === 0 ? 1.2 : 0.8))) % 24 + 4}px` : `${h / 2}px`,
                            animationDelay: `${i * 80}ms`,
                          }}
                        />
                      ))}
                    </div>

                    <span className="text-[10px] font-mono text-slate-400">
                      {isPlayingAudio ? '0:14' : '0:42'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 italic">
                    &ldquo;Hello! The room at Block B is ready for physical inspection this Friday afternoon.&rdquo;
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/messages"
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white border border-emerald-200 dark:border-emerald-800 transition-all flex items-center justify-center gap-2 group-hover:shadow-md"
                >
                  <span>Open Campus Messages</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
