import Link from 'next/link';
import { Home, Building2, Plus, Users, BookOpen } from 'lucide-react';

export default function MobileNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-stone-200 bg-white/90 px-2 py-3 backdrop-blur-lg pb-[env(safe-area-inset-bottom)] md:hidden">
      <Link href="/dashboard" className="flex flex-col items-center gap-1 text-purple-700">
        <Home size={22} />
        <span className="text-[10px] font-medium">Home</span>
      </Link>
      <Link href="/hostels" className="flex flex-col items-center gap-1 text-stone-500">
        <Building2 size={22} />
        <span className="text-[10px] font-medium">Hostels</span>
      </Link>
      <Link href="/create" className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-600 text-white shadow-md">
        <Plus size={24} />
      </Link>
      <Link href="/roommates" className="flex flex-col items-center gap-1 text-stone-500">
        <Users size={22} />
        <span className="text-[10px] font-medium">Roommates</span>
      </Link>
      <Link href="/classes" className="flex flex-col items-center gap-1 text-stone-500">
        <BookOpen size={22} />
        <span className="text-[10px] font-medium">Classes</span>
      </Link>
    </div>
  );
}