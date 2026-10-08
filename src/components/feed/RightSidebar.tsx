'use client';

const suggestions = [
  { name: 'OAU Student Union', handle: '@oau_sec', avatar: '🏛️' },
  { name: 'Hostel Matcher', handle: '@campus_rooms', avatar: '🏡' },
  { name: 'Unilorin Tech', handle: '@unilorin_devs', avatar: '💻' },
];

export default function RightSidebar() {
  return (
    <div className="hidden lg:block w-80 space-y-6 pt-2 pl-4">
      {/* Current User Profile Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-lg">
            🎓
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 dark:text-white">
              skoollhub_user
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Campus Student
            </div>
          </div>
        </div>
        <button className="text-xs font-semibold text-blue-500 hover:text-blue-700">
          Switch
        </button>
      </div>

      {/* Suggested For You Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
          Suggested for you
        </span>
        <button className="text-xs font-semibold text-gray-900 dark:text-white">
          See All
        </button>
      </div>

      {/* Suggestions List */}
      <div className="space-y-3">
        {suggestions.map((item) => (
          <div key={item.handle} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm">
                {item.avatar}
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-900 dark:text-white">
                  {item.handle}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">
                  {item.name}
                </div>
              </div>
            </div>
            <button className="text-xs font-semibold text-blue-500 hover:text-blue-700">
              Follow
            </button>
          </div>
        ))}
      </div>

      {/* Footer Links */}
      <div className="text-[11px] text-gray-400 space-y-2 pt-4">
        <p>About • Help • Press • API • Jobs • Privacy • Terms</p>
        <p>© 2026 SKOOLLHUB FROM MARV</p>
      </div>
    </div>
  );
}