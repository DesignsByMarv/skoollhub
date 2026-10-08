'use client';

interface ScheduleProps {
  item: {
    id: string;
    courseCode: string;
    courseTitle: string;
    time: string;
    venue: string;
    lecturer: string;
    day: string;
  };
}

export default function ScheduleCard({ item }: ScheduleProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
          📚
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {item.courseCode}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {item.day}
            </span>
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
            {item.courseTitle}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            👨‍🏫 {item.lecturer}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-700">
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-medium">Time</p>
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
            ⏰ {item.time}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase font-medium">Venue</p>
          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
            📍 {item.venue}
          </p>
        </div>
      </div>
    </div>
  );
}