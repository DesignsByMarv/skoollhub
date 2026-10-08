'use client';

interface HostelProps {
  hostel: {
    id: string;
    name: string;
    location: string;
    price: number;
    roomType: string;
    distanceToGate: string;
    amenities: string[];
    isAvailable: boolean;
  };
}

export default function HostelCard({ hostel }: HostelProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-block px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              {hostel.roomType}
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-2">
              {hostel.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
              📍 {hostel.location} • {hostel.distanceToGate} to campus gate
            </p>
          </div>
          <span
            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
              hostel.isAvailable
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {hostel.isAvailable ? 'Available' : 'Taken'}
          </span>
        </div>

        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Included Perks:</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {hostel.amenities.map((item, idx) => (
              <span
                key={idx}
                className="text-[11px] bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-md"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">Rent per session</p>
          <p className="text-base font-extrabold text-blue-600 dark:text-blue-400">
            ₦{hostel.price.toLocaleString()}
          </p>
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}