'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Users,
  Heart,
  MessageCircle,
  Share2,
  Clock,
  Star,
  CheckCircle2,
  MapPin,
  Bot,
  Compass,
} from 'lucide-react';

export default function HeroSection() {
  const [likesCount, setLikesCount] = useState(142);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = () => {
    if (hasLiked) {
      setLikesCount((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikesCount((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Ambient Glow Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[900px] md:h-[700px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-pink-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-glow" />
      <div className="absolute top-12 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-2xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-2xl pointer-events-none -z-10" />

      {/* Decorative Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none -z-10"
        style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 shadow-sm backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              The All-in-One Campus Super-App
            </span>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">|</span>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Active across 30+ Nigerian Campuses
            </span>
          </div>
        </div>

        {/* Hero Title & Subheading */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.12]">
            University Life, Solved.{' '}
            <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              From Dream Hostels to A+ Grades.
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Eliminate hostel agent scams, match with your ideal compatibility-verified roommate, sync your lectures,
            and supercharge exam prep with your dedicated Gemini AI study copilot.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <Link
              href="/signup"
              className="px-7 py-3.5 rounded-2xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:via-indigo-600 hover:to-purple-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/45 transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2 group"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/feed"
              className="px-6 py-3.5 rounded-2xl font-semibold text-sm sm:text-base text-slate-700 dark:text-slate-200 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 backdrop-blur-md flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-indigo-500" />
              <span>Explore Campus Feed</span>
            </Link>

            <Link
              href="/login"
              className="px-5 py-3.5 rounded-2xl font-semibold text-sm sm:text-base text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
            >
              Sign In
            </Link>
          </div>

          {/* Social Proof Metric Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1.5 overflow-hidden">
                <span className="inline-block h-6 w-6 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  OA
                </span>
                <span className="inline-block h-6 w-6 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  TC
                </span>
                <span className="inline-block h-6 w-6 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  FK
                </span>
                <span className="inline-block h-6 w-6 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  +3k
                </span>
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-200">15,000+ Students</span>
            </div>

            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>

            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="ml-1 font-semibold text-slate-700 dark:text-slate-200">4.9 / 5.0 Rating</span>
            </div>

            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>

            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Zero-Scam Hostels Verified</span>
            </div>
          </div>
        </div>

        {/* ----------------- HERO FLOATING CARDS SHOWCASE ----------------- */}
        <div className="mt-14 relative max-w-5xl mx-auto">
          {/* Central Main Showcase Device / Feed Card */}
          <div className="relative mx-auto max-w-2xl bg-white/90 dark:bg-slate-900/90 rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-indigo-500/10">
            {/* Top Bar of Card */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    CO
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">Chinedu Okafor</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                      UNILAG
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Mechanical Engineering • 400L</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Hostel Secured
                </span>
              </div>
            </div>

            {/* Post Content */}
            <div className="pt-4 space-y-3">
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-normal">
                Just signed my lease for a room at <span className="font-semibold text-indigo-600 dark:text-indigo-400">Greenwood Court</span> right outside the main gate! 🔑
                Verified landlord, zero agent cut, and matched with my roommate <span className="font-semibold text-purple-600 dark:text-purple-400">@tobi_dev</span> on SkoollHub with a 96% study-sync score.
                Semester is off to a flying start! 🚀
              </p>

              {/* Mini embedded hostel snippet */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 dark:from-slate-800/60 dark:to-indigo-950/30 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg">
                    🏠
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Greenwood Luxury Lodge • Akoka</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-red-500" /> 4 mins to gate • ⚡ 24/7 Solar Light • Borehole
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">₦350k</span>
                  <span className="text-[10px] text-slate-400 block">/session</span>
                </div>
              </div>

              {/* Engagement Row */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                      hasLiked
                        ? 'text-pink-600 bg-pink-50 dark:bg-pink-950/40'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${hasLiked ? 'fill-pink-600 text-pink-600' : ''}`} />
                    <span>{likesCount}</span>
                  </button>

                  <button className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1 rounded-lg transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>28 comments</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- FLOATING CARD 1: TOP RIGHT (Verified Hostel) ---------------- */}
          <div className="hidden lg:block absolute -top-10 -right-8 w-72 rounded-2xl p-4 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl animate-float">
            <div className="flex items-center justify-between mb-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                Top Rated Lodge
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> Inspected
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white">Crown Villa Hostels</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-indigo-500" /> Unilag Gate 2 (300m away)
              </p>
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-sm font-black text-slate-900 dark:text-white">₦420,000</span>
                  <span className="text-[10px] text-slate-400"> /year</span>
                </div>
                <Link
                  href="/houses"
                  className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>

          {/* ---------------- FLOATING CARD 2: BOTTOM LEFT (Roommate Match) ---------------- */}
          <div className="hidden lg:block absolute -bottom-8 -left-10 w-76 rounded-2xl p-4 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl animate-float-reverse">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Roommate Match
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                98% Sync
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold text-xs">
                AB
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Amina Bello</p>
                <p className="text-[10px] text-slate-500">Pharmacy 300L • Early Riser</p>
              </div>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1">
              <span className="text-[9px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Quiet Hours 🌙
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Clean & Tidy 🧼
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Non-Smoker 🚭
              </span>
            </div>
          </div>

          {/* ---------------- FLOATING CARD 3: BOTTOM RIGHT (Gemini AI Assistant) ---------------- */}
          <div className="hidden lg:block absolute -bottom-10 -right-6 w-80 rounded-2xl p-4 bg-white/95 dark:bg-slate-900/95 border border-indigo-200/80 dark:border-indigo-900/80 shadow-2xl backdrop-blur-xl animate-float-slow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                Skooll AI <span className="text-[9px] font-medium text-indigo-500">Powered by Gemini</span>
              </span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-slate-700 dark:text-slate-300 font-medium">
                &ldquo;Can you generate a 3-day revision timetable for CSC 301?&rdquo;
              </div>
              <div className="bg-indigo-50/70 dark:bg-indigo-950/50 p-2 rounded-xl text-indigo-900 dark:text-indigo-200 border border-indigo-100 dark:border-indigo-900/50">
                ✨ Day 1: Neural Networks basics & Activation Functions. Day 2: Backpropagation math...
              </div>
            </div>
          </div>

          {/* ---------------- FLOATING CARD 4: TOP LEFT (Timetable Alert) ---------------- */}
          <div className="hidden lg:block absolute -top-8 -left-8 w-68 rounded-2xl p-3.5 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-xl animate-float">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Next Class in 15m</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            </div>
            <p className="text-xs font-extrabold text-slate-900 dark:text-white">MTH 211: Differential Equations</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Faculty of Science LT2 • Prof. Adeleke</p>
          </div>
        </div>
      </div>
    </section>
  );
}
