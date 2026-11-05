'use client';

const NIGERIAN_INSTITUTIONS = [
  "Ahmadu Bello University (ABU)",
  "Bayero University Kano (BUK)",
  "Covenant University",
  "Federal University of Technology Akure (FUTA)",
  "Federal University of Technology Minna (FUTMINNA)",
  "Obafemi Awolowo University (OAU)",
  "University of Benin (UNIBEN)",
  "University of Calabar (UNICAL)",
  "University of Ibadan (UI)",
  "University of Ilorin (UNILORIN)",
  "University of Jos (UNIJOS)",
  "University of Lagos (UNILAG)",
  "University of Nigeria, Nsukka (UNN)",
  "University of Port Harcourt (UNIPORT)",
  "Yaba College of Technology (YABATECH)"
];

interface UniversitySelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function UniversitySelect({ value, onChange }: UniversitySelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="university" className="text-xs font-medium text-slate-700 dark:text-zinc-300">
        University / College
      </label>
      <select
        id="university"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
      >
        <option value="">Select University / Institution</option>
        {NIGERIAN_INSTITUTIONS.map((institution) => (
          <option key={institution} value={institution}>
            {institution}
          </option>
        ))}
      </select>
    </div>
  );
}