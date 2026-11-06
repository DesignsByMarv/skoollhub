'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowUp, ShieldCheck } from 'lucide-react';

export default function LandingFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md">
                <Image
                  src="/icons/skoollhub-192.png"
                  alt="SkoollHub"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                Skooll<span className="text-indigo-600 dark:text-indigo-400">Hub</span>
              </span>
            </Link>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              The modern campus super-app built for Nigerian & African university students.
              Connecting verified lodges, compatible roommates, intelligent timetable tracking, and Gemini AI study tools.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                All Campus Nodes Operational
              </div>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Campus Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/houses" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Hostels & Lodges Finder
                </Link>
              </li>
              <li>
                <Link href="/roommates" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Roommate Matching
                </Link>
              </li>
              <li>
                <Link href="/timetable" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Lecture Timetable & Alerts
                </Link>
              </li>
              <li>
                <Link href="/ai-assistant" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Gemini AI Study Companion
                </Link>
              </li>
              <li>
                <Link href="/feed" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Campus Social Feed
                </Link>
              </li>
              <li>
                <Link href="/subscriptions" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Subscription Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Top Campuses */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Featured Campuses
            </h4>
            <ul className="space-y-2 text-xs">
              <li>University of Lagos (UNILAG)</li>
              <li>University of Ibadan (UI)</li>
              <li>Obafemi Awolowo University (OAU)</li>
              <li>Covenant University (CU)</li>
              <li>Fed. Univ. of Tech Akure (FUTA)</li>
              <li>University of Benin (UNIBEN)</li>
              <li>Ahmadu Bello University (ABU)</li>
              <li>Univ. of Nigeria Nsukka (UNN)</li>
            </ul>
          </div>

          {/* Column 4: Trust & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Safety & Trust
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Zero-Scam Housing Policy
                </span>
              </li>
              <li>Landlord Verification Standards</li>
              <li>Campus Ambassador Program</li>
              <li>Privacy & Approximate Location</li>
              <li>Community Guidelines</li>
              <li>Report Fraud or Suspicious Lodge</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 mt-12 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <p>© 2026 SkoollHub. All rights reserved. Built with pride for African scholars.</p>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:underline">
              Sign In
            </Link>
            <Link href="/signup" className="hover:underline">
              Register
            </Link>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
