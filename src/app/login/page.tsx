'use client';

import { useState, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LoaderCircle, Quote, Star, Sparkles, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import InstallAppButton from '@/components/pwa/InstallAppButton';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Adebayo Tobi',
    role: 'Computer Science, OAU',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    quote: 'SkoollHub helped me find off-campus housing within 2 days of my arrival. The roommate matching is a lifesaver!',
    rating: 5,
  },
  {
    id: 2,
    name: 'Fatima Bello',
    role: 'Microbiology, UNILORIN',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150',
    quote: 'Sharing course materials and lecture notes with my course mates has never been this seamless. Best campus app!',
    rating: 5,
  },
  {
    id: 3,
    name: 'Chidi Okonkwo',
    role: 'Economics, UNILAG',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    quote: 'The real-time campus chat and study group features keep our entire department connected seamlessly.',
    rating: 5,
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: emailOrUsername.trim(),
        password: password,
      });

      if (authError) throw authError;

      router.push('/feed');
      router.refresh();
    } catch (err) {
      if (err instanceof TypeError && /fetch/i.test(err.message)) {
        setError('Could not reach SkoollHub sign-in. Check your internet connection and confirm the Supabase URL and anon key are set in Netlify, then redeploy. If they are set, check that your Supabase project is active.');
      } else {
        setError(err instanceof Error ? err.message : 'Could not sign in. Check your details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const current = TESTIMONIALS[activeTestimonial];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100">
      <InstallAppButton className="fixed right-4 top-4 z-50 bg-white shadow-sm dark:bg-zinc-900" />
      {/* Main Container */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className="flex w-full max-w-[850px] items-center justify-center gap-12 py-8">
          
          {/* Left Side: Testimonial Showcase */}
          <div className="hidden md:flex flex-col items-center justify-center w-[380px] shrink-0">
            <div className="relative w-full rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 h-28 w-28 rounded-full bg-indigo-500/10 blur-xl" />
              <div className="absolute bottom-0 left-0 -ml-6 -mb-6 h-28 w-28 rounded-full bg-emerald-500/10 blur-xl" />

              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Student Testimonial</h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">What students say about SkoollHub</p>
                </div>
              </div>

              <Quote size={32} className="text-indigo-500/30 mb-2" />

              <div className="min-h-[110px]">
                <p className="text-sm italic text-slate-700 dark:text-zinc-300 leading-relaxed transition-all duration-500">
                  "{current.quote}"
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <img
                    src={current.avatar}
                    alt={current.name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-600/30"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{current.name}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">{current.role}</p>
                  </div>
                </div>

                <div className="flex gap-0.5 text-amber-400">
                  {[...Array(current.rating)].map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" />
                  ))}
                </div>
              </div>

              {/* Slide Indicators */}
              <div className="mt-6 flex justify-center gap-1.5">
                {TESTIMONIALS.map((t, idx) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTestimonial(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === activeTestimonial ? 'w-6 bg-indigo-600' : 'w-1.5 bg-slate-200 dark:bg-zinc-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="w-full max-w-[350px] space-y-3">
            <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 text-center">
              
              {/* Brand Logo Header */}
              <div className="mb-6 flex items-center gap-2">
                <Image src="/icons/skoollhub-192.png" alt="" width={40} height={40} className="rounded-xl shadow-md" />
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">SkoollHub</span>
              </div>

              {error && (
                <p className="mb-4 w-full rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                  {error}
                </p>
              )}

              <form onSubmit={handleLogin} className="w-full space-y-2.5">
                <input
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="Email address"
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-indigo-600 focus:bg-white dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />

                <button
                  type="submit"
                  disabled={loading || !emailOrUsername || !password}
                  className="mt-2 flex w-full items-center justify-center rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? <LoaderCircle size={16} className="animate-spin" /> : 'Log in'}
                </button>
              </form>

              {/* OR Separator */}
              <div className="my-5 flex w-full items-center gap-3">
                <div className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />
                <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500">OR</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />
              </div>

              {/* Social Login */}
              <button
                type="button"
                className="flex items-center justify-center gap-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                <ShieldCheck size={16} />
                <span>Log in with Campus SSO</span>
              </button>

              <Link
                href="/forgot-password"
                className="mt-4 text-xs font-medium text-slate-600 hover:underline dark:text-zinc-400"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign up Card */}
            <div className="rounded-2xl border border-slate-200 bg-white py-4 text-center text-xs text-slate-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              Don't have an account?{' '}
              <Link href="/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="py-6 text-center text-[11px] text-slate-400 dark:text-zinc-500 space-y-2">
        <div className="flex flex-wrap justify-center gap-4">
          <a href="#" className="hover:underline">About</a>
          <a href="#" className="hover:underline">Housing</a>
          <a href="#" className="hover:underline">Roommates</a>
          <a href="#" className="hover:underline">Classes</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Campus Leads</a>
        </div>
        <p>© 2026 SkoollHub from MARV</p>
      </footer>
    </div>
  );
}