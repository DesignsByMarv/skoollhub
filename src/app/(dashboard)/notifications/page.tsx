'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, Heart, LoaderCircle, MessageCircle, AtSign, CheckCheck } from 'lucide-react';

type Notification = {
  id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
  post_id: string | null;
  actor: { full_name: string; username: string; avatar_url: string | null } | null;
};

function notificationIcon(type: string) {
  if (type === 'like') return Heart;
  if (type === 'mention') return AtSign;
  if (type === 'comment') return MessageCircle;
  return Bell;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMarking, setIsMarking] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', { cache: 'no-store' });
      const data = await response.json() as { notifications?: Notification[]; error?: string };
      if (!response.ok) throw new Error(data.error || 'Could not load notifications.');
      setNotifications(data.notifications ?? []);
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load notifications.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadNotifications(), 0);
    return () => window.clearTimeout(timer);
  }, [loadNotifications]);

  const markAllRead = async () => {
    setIsMarking(true);
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || 'Could not mark notifications as read.');
      setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })));
      setError('');
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : 'Could not mark notifications as read.');
    } finally {
      setIsMarking(false);
    }
  };

  const markRead = (notification: Notification) => {
    if (notification.is_read) return;
    setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, is_read: true } : item));
    void fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: [notification.id] }),
    }).then(async (response) => {
      if (!response.ok) {
        const data = await response.json() as { error?: string };
        throw new Error(data.error || 'Could not update this notification.');
      }
    }).catch((markError: unknown) => {
      setError(markError instanceof Error ? markError.message : 'Could not update this notification.');
      void loadNotifications();
    });
  };

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  return (
    <section className="mx-auto w-full max-w-3xl px-3 py-6 sm:px-6 md:py-8">
      <header className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Likes, comments, and mentions on your posts.</p>
        </div>
        <button
          type="button"
          onClick={() => void markAllRead()}
          disabled={!unreadCount || isMarking}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {isMarking ? <LoaderCircle size={15} className="animate-spin" /> : <CheckCheck size={15} />}
          Mark all read
        </button>
      </header>

      {error && <p role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}

      {isLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-12 text-sm text-slate-500 dark:border-zinc-800 dark:bg-zinc-900">
          <LoaderCircle size={18} className="mr-2 animate-spin" /> Loading notifications…
        </div>
      ) : notifications.length ? (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {notifications.map((notification) => {
            const Icon = notificationIcon(notification.type);
            const target = notification.post_id ? `/feed#post-${notification.post_id}` : '/feed';
            return (
              <Link
                key={notification.id}
                href={target}
                onClick={() => markRead(notification)}
                className={`flex items-center gap-3 px-4 py-4 transition hover:bg-slate-50 dark:hover:bg-zinc-800/70 ${notification.is_read ? '' : 'bg-indigo-50/60 dark:bg-indigo-950/20'}`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {notification.actor?.avatar_url
                    ? <img src={notification.actor.avatar_url} alt="" className="h-full w-full object-cover" />
                    : <Icon size={18} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                    {notification.actor?.full_name ?? notification.title}
                  </span>
                  <span className="mt-0.5 block text-sm text-slate-600 dark:text-zinc-300">
                    {notification.type === 'like' ? 'liked your post' : notification.type === 'mention' ? 'mentioned you' : notification.type === 'comment' ? 'commented on your post' : notification.body}
                    {notification.type !== 'like' && notification.type !== 'mention' && notification.type !== 'comment' ? '' : notification.type === 'comment' && notification.body ? `: “${notification.body}”` : ''}
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">{new Date(notification.created_at).toLocaleString()}</span>
                </span>
                {!notification.is_read && <span aria-label="Unread" className="h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-600" />}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <Bell className="mx-auto text-slate-400" size={25} />
          <h2 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">You’re all caught up</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Likes, mentions, and comments on your posts will show up here.</p>
        </div>
      )}
    </section>
  );
}
