'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Smartphone, ShieldCheck, Star } from 'lucide-react';

export default function CtaSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-50/50 to-indigo-100/30 dark:via-indigo-950/20 dark:to-slate-950 -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-indigo-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-14 lg:p-20 shadow-2xl border border-indigo-800/60">
          {/* Animated decorative glow blobs */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-soft" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-soft" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-indigo-200 border border-white/20 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Join 15,000+ Students Already On Campus
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Ready to Upgrade Your Entire Campus Experience?
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-indigo-200 max-w-xl mx-auto font-normal leading-relaxed">
              Lock down safe off-campus hostels, connect with your dream roommate, and dominate your exams with
              Gemini AI. It only takes 60 seconds to get started.
            </p>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/signup"
                className="px-8 py-4 rounded-2xl font-bold text-base text-slate-950 bg-white hover:bg-slate-100 shadow-xl shadow-white/10 hover:shadow-white/20 transition-all hover:-translate-y-0.5 flex items-center gap-2 group"
              >
                <span>Create Free Student Account</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/feed"
                className="px-7 py-4 rounded-2xl font-semibold text-base text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all backdrop-blur-md flex items-center gap-2"
              >
                <span>Explore Live Feed</span>
              </Link>
            </div>

            {/* Trust and install pill */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-indigo-200/80">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                100% Free Signup
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                4.9/5 Student Rating
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-300" />
                Installable on iOS & Android
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
