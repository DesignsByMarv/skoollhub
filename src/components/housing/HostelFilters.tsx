'use client';

interface FiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedType: string;
  setSelectedType: (val: string) => void;
}

export default function HostelFilters({
  searchQuery,
  setSearchQuery,
  selectedType,
  setSelectedType,
}: FiltersProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="w-full md:w-2/3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search hostels by name or area (e.g. Tanke, Gate, Oke-Odo)..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="w-full md:w-1/3 flex items-center gap-2">
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="All">All Room Types</option>
          <option value="Single Room">Single Room</option>
          <option value="Self Contain">Self Contain</option>
          <option value="2-Bedroom Flat">2-Bedroom Flat</option>
        </select>
      </div>
    </div>
  );
}