'use client';

interface RoommateProps {
  profile: {
    id: string;
    name: string;
    department: string;
    level: string;
    budget: number;
    matchScore: number;
    preferredArea: string;
    habits: string[];
    bio: string;
  };
}

export default function RoommateCard({ profile }: RoommateProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header with Compatibility Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {profile.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {profile.department} • {profile.level} Level
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
              {profile.matchScore}% Match
            </span>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
          "{profile.bio}"
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl text-xs">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-medium">Budget</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200">
              ₦{profile.budget.toLocaleString()} / yr
            </p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-medium">Preferred Area</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
              📍 {profile.preferredArea}
            </p>
          </div>
        </div>

        {/* Lifestyle Tags */}
        <div>
          <p className="text-[11px] text-gray-400 font-medium mb-1.5">Lifestyle Habits:</p>
          <div className="flex flex-wrap gap-1.5">
            {profile.habits.map((habit, idx) => (
              <span
                key={idx}
                className="text-[11px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2.5 py-0.5 rounded-md font-medium"
              >
                {habit}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-5 pt-3 border-t border-gray-100 dark:border-gray-700">
        <button
          type="button"
          className="w-full py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
        >
          <span>💬 Connect & Message</span>
        </button>
      </div>
    </div>
  );
}