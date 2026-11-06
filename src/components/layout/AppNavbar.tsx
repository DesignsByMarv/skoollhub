'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Bell,
  BookOpen,
  CreditCard,
  CircleUserRound,
  House,
  LayoutDashboard,
  MessageCircle,
  Moon,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Users,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import InstallAppButton from '@/components/pwa/InstallAppButton';

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

type ProfileSummary = {
  username: string;
  full_name: string;
  avatar_url: string | null;
  role: string | null;
};

const items: NavItem[] = [
  { label: 'Home', href: '/feed', icon: LayoutDashboard },
  { label: 'Explore', href: '/houses', icon: House },
  { label: 'Roommates', href: '/roommates', icon: Users },
  { label: 'Classes', href: '/timetable', icon: BookOpen },
  { label: 'Messages', href: '/messages', icon: MessageCircle },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'AI Assistant', href: '/ai-assistant', icon: Sparkles },
  { label: 'Plans', href: '/subscriptions', icon: CreditCard },
];

function isCurrent(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Badge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span aria-label={`${count} unread`} className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold leading-none text-white">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default function AppNavbar() {
  const pathname = usePathname();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [profile, setProfile] = useState<ProfileSummary | null>(null);

  const refreshCounts = useCallback(async () => {
    try {
      const [messagesResponse, notificationsResponse] = await Promise.all([
        fetch('/api/messages/unread', { cache: 'no-store' }),
        fetch('/api/notifications?unread=true', { cache: 'no-store' }),
      ]);

      if (messagesResponse.ok) {
        const data = await messagesResponse.json() as { unreadCount: number };
        setUnreadMessages(data.unreadCount);
      }
      if (notificationsResponse.ok) {
        const data = await notificationsResponse.json() as { unreadCount: number };
        setUnreadNotifications(data.unreadCount);
      }
    } catch (error) {
      console.error('Could not refresh sidebar notification badges:', error);
    }
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('skoollhub-theme');
    const theme = savedTheme === 'dark' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('skoollhub-theme', theme);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    void supabase.auth.getUser().then(async ({ data: { user }, error }) => {
      if (error) {
        console.error('Could not load the signed-in account for navigation:', error.message);
        return;
      }
      if (!user || !active) return;

      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url, role')
        .eq('id', user.id)
        .maybeSingle();
      if (profileError) console.error('Could not load the profile for navigation:', profileError.message);
      if (active && data) setProfile(data as ProfileSummary);

      channel = supabase
        .channel(`skoollhub-sidebar:${user.id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (payload) => {
          setProfile(payload.new as ProfileSummary);
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          const message = payload.new as { sender_id?: string };
          if (message.sender_id !== user.id) void refreshCounts();
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
          void refreshCounts();
        })
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.error('Live sidebar notifications are unavailable.');
          }
        });

      void refreshCounts();
    });

    const poll = window.setInterval(() => void refreshCounts(), 30_000);
    return () => {
      active = false;
      window.clearInterval(poll);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [refreshCounts]);

  const navigationItems = profile?.role === 'admin' || profile?.role === 'moderator'
    ? [...items, { label: 'Admin', href: '/admin', icon: ShieldCheck }]
    : items;

  const linkClass = (href: string) => {
    const active = isCurrent(pathname, href);
    return `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
      active
        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white'
    }`;
  };

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white px-4 py-5 dark:border-zinc-800 dark:bg-zinc-950 md:flex">
        <Link href="/feed" className="mb-7 flex items-center gap-3 px-2">
          <Image src="/icons/skoollhub-192.png" alt="SkoollHub" width={42} height={42} className="rounded-xl shadow-sm" />
          <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">SkoollHub</span>
        </Link>

        <nav aria-label="Main navigation" className="flex-1 space-y-1 overflow-y-auto">
          {navigationItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isCurrent(pathname, href) ? 'page' : undefined}
              onClick={(event) => {
                if (href === '/feed' && pathname === '/feed') {
                  event.preventDefault();
                  window.location.reload();
                }
              }}
              className={linkClass(href)}
            >
              <Icon size={20} strokeWidth={isCurrent(pathname, href) ? 2.4 : 1.9} />
              <span>{label}</span>
              {href === '/messages' && <Badge count={unreadMessages} />}
              {href === '/notifications' && <Badge count={unreadNotifications} />}
            </Link>
          ))}
          <Link href="/profile" aria-current={isCurrent(pathname, '/profile') ? 'page' : undefined} className={linkClass('/profile')}>
            <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-sm dark:bg-indigo-950">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                : <span aria-hidden="true">🧑‍🎓</span>}
            </span>
            <span>Profile</span>
          </Link>
        </nav>

        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 dark:border-zinc-800">
          <div className="flex items-center gap-3 px-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-xl dark:bg-indigo-950">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                : <span aria-hidden="true">🧑‍🎓</span>}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{profile?.full_name || 'Student'}</p>
              <p className="truncate text-xs text-slate-500 dark:text-zinc-400">{profile?.username ? `@${profile.username}` : 'Your account'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-1">
            <InstallAppButton />
            <Link href="/settings" aria-label="Settings" className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
              <Settings size={18} />
            </Link>
            <button
              type="button"
              aria-label="Toggle dark mode"
              onClick={() => {
                const isDark = document.documentElement.classList.toggle('dark');
                window.localStorage.setItem('skoollhub-theme', isDark ? 'dark' : 'light');
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <Sun size={18} className="hidden dark:block" />
              <Moon size={18} className="dark:hidden" />
            </button>
          </div>
        </div>
      </aside>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-50 grid grid-cols-5 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-xl backdrop-blur-md dark:border-zinc-700 dark:bg-zinc-900/95 md:hidden"
      >
        {[
          items[0],
          items[1],
          items[4],
          items[5],
          { label: 'Profile', href: '/profile', icon: CircleUserRound },
        ].map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={isCurrent(pathname, href) ? 'page' : undefined}
            onClick={(event) => {
              if (href === '/feed' && pathname === '/feed') {
                event.preventDefault();
                window.location.reload();
              }
            }}
            className={`relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-semibold ${isCurrent(pathname, href) ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' : 'text-slate-500 dark:text-zinc-400'}`}
          >
            <Icon size={19} />
            <span className="max-w-full truncate">{label}</span>
            {href === '/messages' && unreadMessages > 0 && <span aria-label={`${unreadMessages} unread messages`} className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">{unreadMessages > 99 ? '99+' : unreadMessages}</span>}
            {href === '/notifications' && unreadNotifications > 0 && <span aria-label={`${unreadNotifications} unread notifications`} className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold text-white">{unreadNotifications > 99 ? '99+' : unreadNotifications}</span>}
          </Link>
        ))}
      </nav>
    </>
  );
}
