'use client';

const universities = [
  { name: 'University of Lagos', code: 'UNILAG', state: 'Lagos', students: '3.4k+' },
  { name: 'University of Ibadan', code: 'UI', state: 'Oyo', students: '2.8k+' },
  { name: 'Obafemi Awolowo University', code: 'OAU', state: 'Osun', students: '3.1k+' },
  { name: 'Covenant University', code: 'CU', state: 'Ogun', students: '1.9k+' },
  { name: 'Federal Univ. of Tech Akure', code: 'FUTA', state: 'Ondo', students: '2.5k+' },
  { name: 'University of Benin', code: 'UNIBEN', state: 'Edo', students: '2.7k+' },
  { name: 'Ahmadu Bello University', code: 'ABU', state: 'Kaduna', students: '2.2k+' },
  { name: 'University of Nigeria, Nsukka', code: 'UNN', state: 'Enugu', students: '2.9k+' },
  { name: 'Lagos State University', code: 'LASU', state: 'Lagos', students: '2.4k+' },
  { name: 'Babcock University', code: 'BU', state: 'Ogun', students: '1.6k+' },
  { name: 'University of Ilorin', code: 'UNILORIN', state: 'Kwara', students: '3.0k+' },
  { name: 'Landmark University', code: 'LU', state: 'Kwara', students: '1.2k+' },
];

export default function CampusMarquee() {
  return (
    <div className="py-10 border-y border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 relative overflow-hidden backdrop-blur-sm">
      {/* Subtle Side Fade Gradients for clean marquee infinite effect */}
      <div className="absolute top-0 left-0 bottom-0 w-24 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Active Campus Communities & Housing Hubs
          </p>
        </div>
        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hidden sm:inline">
          Instant Discovery • Verified Students
        </span>
      </div>

      <div className="flex overflow-hidden select-none">
        <div className="animate-marquee flex items-center gap-4">
          {/* First set */}
          {universities.map((uni, idx) => (
            <div
              key={`uni-1-${idx}`}
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:scale-105 group"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black text-xs flex items-center justify-center border border-indigo-100 dark:border-indigo-900">
                {uni.code.slice(0, 3)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {uni.name}
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {uni.code}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>{uni.state} State</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{uni.students} on Hub</span>
                </div>
              </div>
            </div>
          ))}

          {/* Duplicated set for seamless loop */}
          {universities.map((uni, idx) => (
            <div
              key={`uni-2-${idx}`}
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition-all hover:scale-105 group"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-black text-xs flex items-center justify-center border border-indigo-100 dark:border-indigo-900">
                {uni.code.slice(0, 3)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {uni.name}
                  </span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                    {uni.code}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>{uni.state} State</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{uni.students} on Hub</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
