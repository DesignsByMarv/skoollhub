'use client';

import { ShieldCheck, Smartphone, Lock, ShoppingBag, Check, Zap } from 'lucide-react';
import InstallAppButton from '@/components/pwa/InstallAppButton';

export default function BentoGridSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/70 dark:border-indigo-800/70">
            <ShieldCheck className="w-3.5 h-3.5" />
            Designed for Campus Reality
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Safety, Privacy & Speed You Can Trust
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Every feature on SkoollHub was engineered around real campus challenges: extortionate housing agents,
            unreliable networks, safety concerns, and study stress.
          </p>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Card 1: Large Span 2 Columns (Zero Scams Guarantee) */}
          <div className="md:col-span-2 lg:col-span-2 rounded-3xl p-8 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden shadow-xl border border-indigo-800/50 flex flex-col justify-between group">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none -z-0" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-indigo-200 border border-white/20 backdrop-blur-md mb-6">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                The SkoollHub Trust Shield
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                Zero Middleman Fraud. Direct Landlord Verification.
              </h3>
              <p className="text-sm text-indigo-200/90 mt-3 leading-relaxed max-w-lg">
                Say goodbye to street agents who demand ₦20,000 &ldquo;registration fee&rdquo; only to show you dilapidated rooms.
                All accommodations listed on SkoollHub undergo ambassador inspection and host identity vetting.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-indigo-100">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </span>
                  <span>Physical gate & room verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </span>
                  <span>No fake landlord impersonators</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </span>
                  <span>Transparent rental price breakdowns</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    ✓
                  </span>
                  <span>Verified student reviews from past tenants</span>
                </div>
              </div>
            </div>

            <div className="pt-8 relative z-10">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                🛡️ Verified Student Housing Standard
              </span>
            </div>
          </div>

          {/* Card 2: 1-Tap PWA Install Card */}
          <div className="rounded-3xl p-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5 border border-indigo-100 dark:border-indigo-900 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Install as a Native PWA
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Add directly to your iPhone or Android home screen with zero storage bloat. Launches instantly with
                offline timetable caching.
              </p>
            </div>

            <div className="pt-6">
              <InstallAppButton className="w-full justify-center text-xs py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800" />
            </div>
          </div>

          {/* Card 3: Privacy & Location Shield */}
          <div className="rounded-3xl p-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5 border border-purple-100 dark:border-purple-900 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Approximate Privacy Shield
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Your precise GPS coordinates are never stored or exposed. Location discovery is rounded to ~1km,
                keeping you safe while discovering fellow campus students.
              </p>
            </div>

            <div className="pt-6">
              <div className="p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900 text-[11px] font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-purple-600" />
                Opt-in location discovery only
              </div>
            </div>
          </div>

          {/* Card 4: Campus Marketplace & Notes Vault (Span 2 on lg) */}
          <div className="md:col-span-2 lg:col-span-2 rounded-3xl p-7 bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-slate-800 shadow-xl flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 text-amber-400 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Student Marketplace
                </span>
              </div>

              <h3 className="text-2xl font-bold tracking-tight">
                Peer-to-Peer Campus Marketplace & Notes Vault
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Passing your courses? Sell your textbooks, mini-fridges, laptops, or rechargeable fans to junior
                students entering your hostel. Share lecture summaries and past exam questions with one click.
              </p>
            </div>

            <div className="pt-6 flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-200">📚 Course Textbooks</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-200">⚡ Rechargeable Fans</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-200">💻 Laptops & Chargers</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-200">🍳 Cooking Utensils</span>
            </div>
          </div>

          {/* Card 5: Real-time WebRTC Voice Calls (Span 2 on lg) */}
          <div className="md:col-span-1 lg:col-span-2 rounded-3xl p-7 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-900 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Real-Time TURN-Powered Voice Calling
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Connect directly with prospective roommates and verified hostel owners over crisp, authenticated
                in-app voice calls without leaking personal phone numbers.
              </p>
            </div>

            <div className="pt-6 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>WebRTC + TURN Cross-Network Stability</span>
              <span>🔒 End-to-End Secure</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
