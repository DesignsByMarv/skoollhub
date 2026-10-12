import Link from 'next/link';
import { BookOpen, CalendarDays, House, Sparkles, Users } from 'lucide-react';

const shortcuts = [
  { label: 'Find a place to stay', description: 'Browse student housing', href: '/houses', icon: House },
  { label: 'Meet a roommate', description: 'Find a compatible student', href: '/roommates', icon: Users },
  { label: 'Check your timetable', description: 'Keep track of classes', href: '/timetable', icon: CalendarDays },
  { label: 'Ask SkoollHub AI', description: 'Get help with study and campus life', href: '/ai-assistant', icon: Sparkles },
];

export default function RightSidebar() {
  return (
    <aside className="hidden w-80 space-y-5 pt-2 pl-4 lg:block">
      <section className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">Campus shortcuts</h2>
        <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
          Useful places to go from your campus feed.
        </p>
        <div className="mt-3 space-y-1">
          {shortcuts.map(({ label, description, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition hover:bg-gray-50 dark:hover:bg-zinc-800"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
                <Icon size={17} />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-gray-800 dark:text-zinc-100">{label}</span>
                <span className="mt-0.5 block text-[10px] text-gray-500 dark:text-zinc-400">{description}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-950 dark:bg-indigo-950/30">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-600 dark:bg-zinc-900 dark:text-indigo-300">
          <BookOpen size={17} />
        </span>
        <h2 className="mt-3 text-sm font-bold text-gray-900 dark:text-white">Keep it helpful</h2>
        <p className="mt-1 text-xs leading-5 text-gray-600 dark:text-zinc-300">
          Share useful campus information, respect other students, and avoid posting private details.
        </p>
      </section>

      <p className="px-1 text-[10px] leading-5 text-gray-400">
        SkoollHub · A community built for campus life
      </p>
    </aside>
  );
}
