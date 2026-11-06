'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  BookOpen,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  LoaderCircle,
  Plus,
  Trash2,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  X,
  FileUp,
} from 'lucide-react';
import {
  ClassItem,
  Task,
  Material,
  starterClasses,
  starterTasks,
  starterMaterials,
} from '@/lib/starterAcademics';

type Section = 'timetable' | 'planner' | 'materials';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const fieldClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white';
const tabs: Array<{ id: Section; label: string; icon: typeof BookOpen }> = [
  { id: 'timetable', label: 'Class Timetable', icon: CalendarClock },
  { id: 'planner', label: 'Study Planner & Tasks', icon: CheckCircle2 },
  { id: 'materials', label: 'Notes & Materials Vault', icon: FileText },
];

function prettyDate(date: string | null) {
  if (!date) return 'No due date';
  return new Date(date).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function ClassesPage() {
  const [section, setSection] = useState<Section>('timetable');
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modals
  const [showClassForm, setShowClassForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Pomodoro Focus Timer State
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, pomodoroSeconds]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const loadAcademicData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/academics', { cache: 'no-store' });
      if (!response.ok) throw new Error('Could not load academic hub.');
      const data = (await response.json()) as {
        classes: ClassItem[];
        tasks: Task[];
        materials: Material[];
      };

      const loadedClasses = data.classes ?? [];
      const loadedTasks = data.tasks ?? [];
      const loadedMaterials = data.materials ?? [];

      setClasses(loadedClasses.length > 0 ? loadedClasses : starterClasses);
      setTasks(loadedTasks.length > 0 ? loadedTasks : starterTasks);
      setMaterials(loadedMaterials.length > 0 ? loadedMaterials : starterMaterials);
    } catch {
      // Graceful starter fallback
      setClasses(starterClasses);
      setTasks(starterTasks);
      setMaterials(starterMaterials);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAcademicData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadAcademicData]);

  const activeDayClasses = useMemo(() => {
    return classes
      .filter((item) => item.day_of_week === activeDayIndex + 1)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [classes, activeDayIndex]);

  const toggleTask = (task: Task) => {
    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, is_completed: !task.is_completed } : item))
    );
  };

  const submitClass = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newClass: ClassItem = {
      id: `cls-${Date.now()}`,
      timetable_id: 'local',
      course_code: String(form.get('course_code') || '').toUpperCase(),
      course_title: String(form.get('course_title') || ''),
      venue: String(form.get('venue') || ''),
      day_of_week: Number(form.get('day_of_week') || 1),
      start_time: String(form.get('start_time') || '08:00'),
      end_time: String(form.get('end_time') || '10:00'),
      lecturer_name: String(form.get('lecturer_name') || ''),
    };

    setClasses((prev) => [...prev, newClass]);
    setShowClassForm(false);
    setNotice('Lecture added to your timetable!');
  };

  const submitTask = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: String(form.get('title') || ''),
      description: String(form.get('description') || ''),
      course_code: String(form.get('course_code') || '').toUpperCase(),
      due_at: form.get('due_at') ? new Date(String(form.get('due_at'))).toISOString() : null,
      priority: (form.get('priority') as 'low' | 'normal' | 'high') || 'normal',
      is_completed: false,
    };

    setTasks((prev) => [newTask, ...prev]);
    setShowTaskForm(false);
    setNotice('Study task added to your planner!');
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 border border-amber-200/70 dark:border-amber-800/70">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Academic Success Hub
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Classes, Tasks &amp; Handouts
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-zinc-400">
            Organize your weekly lectures, track assignments with the Pomodoro focus timer, and access course summary notes.
          </p>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = section === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSection(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-105'
                    : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {notice && (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs sm:text-sm font-semibold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
          {notice}
        </p>
      )}

      {/* ============================================================ */}
      {/* SECTION 1: TIMETABLE */}
      {/* ============================================================ */}
      {section === 'timetable' && (
        <div className="space-y-6">
          {/* Day Selector Chips */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm flex items-center justify-between gap-1 overflow-x-auto">
            {days.map((day, idx) => {
              const isSelected = activeDayIndex === idx;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDayIndex(idx)}
                  className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-center text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="block text-[10px] uppercase tracking-wider opacity-75">Day {idx + 1}</span>
                  <span>{day}</span>
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{days[activeDayIndex]} Lectures</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {activeDayClasses.length} {activeDayClasses.length === 1 ? 'Class' : 'Classes'}
              </span>
            </h2>

            <button
              type="button"
              onClick={() => setShowClassForm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
            >
              <Plus size={15} />
              <span>Add Lecture</span>
            </button>
          </div>

          {/* Day's Classes Grid */}
          {activeDayClasses.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeDayClasses.map((cls) => (
                <article
                  key={cls.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-600" />
                  <div className="pl-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                        {cls.course_code}
                      </span>
                      <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                        <Clock size={12} />
                        {cls.start_time} – {cls.end_time}
                      </span>
                    </div>

                    <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                      {cls.course_title}
                    </h3>

                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs text-slate-500 dark:text-zinc-400 space-y-1">
                      <p className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-700 dark:text-zinc-300">Venue:</span>
                        <span>{cls.venue}</span>
                      </p>
                      {cls.lecturer_name && (
                        <p className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-700 dark:text-zinc-300">Lecturer:</span>
                          <span>{cls.lecturer_name}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-zinc-700 bg-white dark:bg-zinc-900">
              <CalendarClock className="mx-auto text-slate-400" size={36} />
              <h3 className="mt-3 font-bold text-slate-900 dark:text-white">No classes scheduled for {days[activeDayIndex]}</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Enjoy your free study day or schedule a personal revision session!</p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 2: STUDY PLANNER & POMODORO */}
      {/* ============================================================ */}
      {section === 'planner' && (
        <div className="space-y-6">
          {/* Pomodoro Focus Timer Widget */}
          <div className="rounded-3xl bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 p-6 sm:p-7 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-200 bg-white/15 px-2.5 py-0.5 rounded-full">
                Pomodoro Focus Engine
              </span>
              <h2 className="text-xl sm:text-2xl font-black">25-Minute Study Sprint</h2>
              <p className="text-xs text-indigo-100/90 max-w-md">
                Lock in with zero distraction. Boost memory retention for upcoming tests and exams.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight bg-black/20 px-5 py-2.5 rounded-2xl border border-white/20">
                {formatTimer(pomodoroSeconds)}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="px-4 py-2 rounded-xl bg-white text-indigo-700 font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-indigo-50 transition-colors"
                >
                  {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setPomodoroSeconds(25 * 60);
                  }}
                  className="px-4 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Assignments &amp; Revision Tasks</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {tasks.filter((t) => t.is_completed).length} of {tasks.length} Done
              </span>
            </h2>

            <button
              type="button"
              onClick={() => setShowTaskForm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
            >
              <Plus size={15} />
              <span>Add Task</span>
            </button>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  task.is_completed
                    ? 'bg-slate-50 dark:bg-zinc-900/40 border-slate-200/60 dark:border-zinc-800/60 opacity-60'
                    : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      task.is_completed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                    }`}
                  >
                    {task.is_completed && <Check size={14} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      {task.course_code && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                          {task.course_code}
                        </span>
                      )}
                      <h4
                        className={`font-bold text-sm text-slate-900 dark:text-white ${
                          task.is_completed ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h4>
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{task.description}</p>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock size={11} /> {prettyDate(task.due_at)}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${
                    task.priority === 'high'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      : task.priority === 'normal'
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}
                >
                  {task.priority} Priority
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SECTION 3: MATERIALS & NOTES VAULT */}
      {/* ============================================================ */}
      {section === 'materials' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Course Materials Vault</h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">Download shared lecture slides, exam handouts, and past questions.</p>
            </div>

            <button
              type="button"
              onClick={() => setShowMaterialForm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm"
            >
              <FileUp size={15} />
              <span>Share Handout</span>
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {materials.map((mat) => (
              <article
                key={mat.id}
                className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                      {mat.course_code}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">PDF / Doc</span>
                  </div>

                  <h3 className="mt-2.5 font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    {mat.title}
                  </h3>

                  {mat.description && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                      {mat.description}
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    <span>Uploaded by @{mat.uploader?.username || 'scholar'}</span>
                  </div>

                  <a
                    href={mat.file_url}
                    download
                    onClick={(e) => {
                      if (mat.file_url === '#') {
                        e.preventDefault();
                        alert('Sample handout ready for study in full version!');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors"
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add Class */}
      {showClassForm && (
        <div
          role="presentation"
          onClick={() => setShowClassForm(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div
            role="dialog"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Add Lecture to Timetable</h3>
                <p className="text-xs text-slate-500">Keep track of your classes and halls.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowClassForm(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitClass} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Course Code:
                  <input name="course_code" required placeholder="e.g. CSC 301" className={`${fieldClass} mt-1`} />
                </label>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Day of Week:
                  <select name="day_of_week" defaultValue={activeDayIndex + 1} className={`${fieldClass} mt-1`}>
                    {days.map((d, i) => (
                      <option key={d} value={i + 1}>{d}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Course Title:
                <input name="course_title" required placeholder="e.g. Data Structures &amp; Algorithms" className={`${fieldClass} mt-1`} />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Lecture Hall / Venue:
                  <input name="venue" required placeholder="e.g. Science LT 1" className={`${fieldClass} mt-1`} />
                </label>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Lecturer Name (optional):
                  <input name="lecturer_name" placeholder="e.g. Dr. Adeyemi" className={`${fieldClass} mt-1`} />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Start Time:
                  <input name="start_time" type="time" defaultValue="08:00" required className={`${fieldClass} mt-1`} />
                </label>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  End Time:
                  <input name="end_time" type="time" defaultValue="10:00" required className={`${fieldClass} mt-1`} />
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md mt-2"
              >
                Save Class to Timetable
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Task */}
      {showTaskForm && (
        <div
          role="presentation"
          onClick={() => setShowTaskForm(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div
            role="dialog"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Add Study Task / Assignment</h3>
                <p className="text-xs text-slate-500">Track deadlines and exams.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTaskForm(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitTask} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Task Title:
                <input name="title" required placeholder="e.g. Solve GST Assignment 2" className={`${fieldClass} mt-1`} />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Course Code:
                  <input name="course_code" placeholder="e.g. GST 301" className={`${fieldClass} mt-1`} />
                </label>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Priority:
                  <select name="priority" defaultValue="normal" className={`${fieldClass} mt-1`}>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </div>

              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Due Date:
                <input name="due_at" type="datetime-local" className={`${fieldClass} mt-1`} />
              </label>

              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Short Notes:
                <textarea name="description" rows={2} placeholder="Page numbers, group members..." className={`${fieldClass} mt-1`} />
              </label>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md mt-2"
              >
                Save Task
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
