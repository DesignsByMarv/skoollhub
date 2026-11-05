'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { BookOpen, CalendarClock, Check, CheckCircle2, Clock3, Download, FileText, LoaderCircle, Plus, Trash2 } from 'lucide-react';

type ClassItem = {
  id: string;
  timetable_id: string;
  course_code: string;
  course_title: string;
  venue: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  lecturer_name: string | null;
};
type Task = {
  id: string;
  title: string;
  description: string | null;
  course_code: string | null;
  due_at: string | null;
  priority: 'low' | 'normal' | 'high';
  is_completed: boolean;
};
type Material = {
  id: string;
  uploader_id: string;
  course_code: string;
  course_title: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_type: string;
  created_at: string;
  uploader: { username: string; full_name: string; avatar_url: string | null } | null;
};
type Section = 'timetable' | 'planner' | 'materials';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white';
const tabs: Array<{ id: Section; label: string; icon: typeof BookOpen }> = [
  { id: 'timetable', label: 'Timetable', icon: CalendarClock },
  { id: 'planner', label: 'Study planner', icon: CheckCircle2 },
  { id: 'materials', label: 'Course materials', icon: FileText },
];

async function responseError(response: Response) {
  const data = await response.json().catch(() => null) as { error?: string } | null;
  return data?.error ?? 'Something went wrong. Please try again.';
}

function prettyDate(date: string | null) {
  if (!date) return 'No due date';
  return new Date(date).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default function ClassesPage() {
  const [section, setSection] = useState<Section>('timetable');
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showClassForm, setShowClassForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadAcademicData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/academics', { cache: 'no-store' });
      if (!response.ok) throw new Error(await responseError(response));
      const data = await response.json() as { classes: ClassItem[]; tasks: Task[]; materials: Material[] };
      setClasses(data.classes ?? []);
      setTasks(data.tasks ?? []);
      setMaterials(data.materials ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load your academic hub.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadAcademicData(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadAcademicData]);

  const classesByDay = useMemo(() => days.map((name, index) => ({
    name,
    classes: classes.filter((item) => item.day_of_week === index + 1)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
  })), [classes]);

  const submitRecord = async (
    event: FormEvent<HTMLFormElement>,
    type: 'class' | 'task' | 'material',
    close: (value: boolean) => void,
  ) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    const formData = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(formData.entries());
    if (type === 'material') {
      const file = formData.get('file');
      if (!(file instanceof File) || !file.size) {
        setError('Choose a file to share.');
        setSaving(false);
        return;
      }
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('type', 'material');
      try {
        const uploadResponse = await fetch('/api/upload', { method: 'POST', body: uploadData });
        if (!uploadResponse.ok) throw new Error(await responseError(uploadResponse));
        const upload = await uploadResponse.json() as { url: string; filename: string };
        payload.file_url = upload.url;
        payload.file_name = upload.filename;
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : 'Could not upload the course material.');
        setSaving(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/academics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, type }),
      });
      if (!response.ok) throw new Error(await responseError(response));
      close(false);
      setNotice(type === 'class' ? 'Class added to your timetable.' : type === 'task' ? 'Study task added to your planner.' : 'Course material shared with your university.');
      await loadAcademicData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your academic update.');
    } finally {
      setSaving(false);
    }
  };

  const toggleTask = async (task: Task) => {
    setError('');
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, is_completed: !task.is_completed } : item));
    try {
      const response = await fetch('/api/academics', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, is_completed: !task.is_completed }),
      });
      if (!response.ok) throw new Error(await responseError(response));
    } catch (updateError) {
      setTasks((current) => current.map((item) => item.id === task.id ? { ...item, is_completed: task.is_completed } : item));
      setError(updateError instanceof Error ? updateError.message : 'Could not update the task.');
    }
  };

  const deleteItem = async (type: 'task' | 'class' | 'material', id: string) => {
    try {
      const response = await fetch(`/api/academics?type=${type}&id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(await responseError(response));
      if (type === 'task') setTasks((current) => current.filter((item) => item.id !== id));
      if (type === 'class') setClasses((current) => current.filter((item) => item.id !== id));
      if (type === 'material') setMaterials((current) => current.filter((item) => item.id !== id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete the item.');
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Nivora study tools</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Your academic hub</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-zinc-400">Organize classes, deadlines and course resources alongside your campus community.</p>

      <div role="tablist" aria-label="Academic hub sections" className="mt-6 grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" role="tab" aria-selected={section === id} onClick={() => setSection(id)} className={`flex items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-bold transition sm:text-sm ${section === id ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800'}`}><Icon size={16} /><span className="hidden sm:inline">{label}</span><span className="sm:hidden">{id === 'timetable' ? 'Classes' : id === 'planner' ? 'Planner' : 'Materials'}</span></button>
        ))}
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      {notice && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">{notice}</p>}

      {loading ? <div className="flex min-h-56 items-center justify-center"><LoaderCircle className="animate-spin text-indigo-600" /></div> : (
        <>
          {section === 'timetable' && (
            <section className="mt-5">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Weekly timetable</h2><p className="text-xs text-slate-500 dark:text-zinc-400">Plan lectures and study sessions.</p></div><button type="button" onClick={() => setShowClassForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white"><Plus size={16} />Add class</button></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {classesByDay.map(({ name, classes: dayClasses }) => <article key={name} className="min-h-32 rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><h3 className="text-xs font-black uppercase tracking-wide text-indigo-700 dark:text-indigo-300">{name}</h3>{dayClasses.length ? <div className="mt-3 space-y-2">{dayClasses.map((item) => <div key={item.id} className="rounded-xl bg-slate-50 p-3 dark:bg-zinc-800"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-bold text-slate-900 dark:text-white">{item.course_code} · {item.course_title}</p><p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{item.venue}{item.lecturer_name ? ` · ${item.lecturer_name}` : ''}</p></div><button type="button" aria-label={`Remove ${item.course_code}`} onClick={() => void deleteItem('class', item.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"><Trash2 size={14} /></button></div><p className="mt-2 flex items-center gap-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300"><Clock3 size={12} />{item.start_time.slice(0, 5)}–{item.end_time.slice(0, 5)}</p></div>)}</div> : <p className="mt-4 text-xs text-slate-400">No classes planned.</p>}</article>)}
              </div>
            </section>
          )}

          {section === 'planner' && (
            <section className="mt-5">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Study planner</h2><p className="text-xs text-slate-500 dark:text-zinc-400">Keep assignments and revision tasks in one place.</p></div><button type="button" onClick={() => setShowTaskForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white"><Plus size={16} />Add task</button></div>
              <div className="mt-4 space-y-2">{tasks.length ? tasks.map((task) => <article key={task.id} className={`flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 ${task.is_completed ? 'opacity-65' : ''}`}><button type="button" onClick={() => void toggleTask(task)} aria-label={task.is_completed ? 'Mark task incomplete' : 'Mark task complete'} className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border ${task.is_completed ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-transparent dark:border-zinc-600'}`}><Check size={14} /></button><div className="min-w-0 flex-1"><h3 className={`text-sm font-bold text-slate-900 dark:text-white ${task.is_completed ? 'line-through' : ''}`}>{task.title}</h3>{task.description && <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400">{task.description}</p>}<p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-zinc-400"><span>{prettyDate(task.due_at)}</span>{task.course_code && <span>· {task.course_code}</span>}<span className={`rounded-full px-2 py-0.5 ${task.priority === 'high' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' : 'bg-slate-100 dark:bg-zinc-800'}`}>{task.priority}</span></p></div><button type="button" onClick={() => void deleteItem('task', task.id)} aria-label="Delete task" className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"><Trash2 size={15} /></button></article>) : <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-zinc-700"><CheckCircle2 className="mx-auto text-slate-400" size={30} /><p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">Your planner is clear</p><p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Add your next assignment or study goal.</p></div>}</div>
            </section>
          )}

          {section === 'materials' && (
            <section className="mt-5">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900 dark:text-white">Course materials</h2><p className="text-xs text-slate-500 dark:text-zinc-400">Share notes and past questions with students at your university.</p></div><button type="button" onClick={() => setShowMaterialForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white"><Plus size={16} />Share material</button></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">{materials.length ? materials.map((material) => <article key={material.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"><FileText size={19} /></span><div className="min-w-0 flex-1"><p className="text-[10px] font-black uppercase tracking-wide text-indigo-700 dark:text-indigo-300">{material.course_code} · {material.course_title}</p><h3 className="mt-1 truncate text-sm font-bold text-slate-900 dark:text-white">{material.title}</h3><p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{material.file_name} · {material.file_type.replaceAll('_', ' ')}</p></div></div>{material.description && <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-zinc-400">{material.description}</p>}<div className="mt-4 flex items-center justify-between gap-2"><span className="truncate text-[11px] text-slate-500 dark:text-zinc-400">Shared by {material.uploader?.full_name ?? 'a student'} · {new Date(material.created_at).toLocaleDateString()}</span><div className="flex shrink-0 gap-1"><a href={material.file_url} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950" aria-label="Download course material"><Download size={16} /></a><button type="button" onClick={() => void deleteItem('material', material.id)} aria-label="Delete material" className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950"><Trash2 size={15} /></button></div></div></article>) : <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-zinc-700 sm:col-span-2"><BookOpen className="mx-auto text-slate-400" size={30} /><p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">No course materials shared yet</p><p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Be the first to share notes with your course mates.</p></div>}</div>
            </section>
          )}
        </>
      )}

      {showClassForm && <Dialog title="Add a class" onClose={() => setShowClassForm(false)}><form onSubmit={(event) => void submitRecord(event, 'class', setShowClassForm)} className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold">Course code<input name="course_code" required maxLength={32} placeholder="CSC 301" className={`${fieldClass} mt-1.5`} /></label><label className="text-xs font-semibold">Course title<input name="course_title" required maxLength={120} className={`${fieldClass} mt-1.5`} /></label><label className="text-xs font-semibold">Venue<input name="venue" required maxLength={120} className={`${fieldClass} mt-1.5`} /></label><label className="text-xs font-semibold">Day<select name="day_of_week" className={`${fieldClass} mt-1.5`}>{days.map((day, index) => <option key={day} value={index + 1}>{day}</option>)}</select></label><label className="text-xs font-semibold">Start time<input name="start_time" type="time" required className={`${fieldClass} mt-1.5`} /></label><label className="text-xs font-semibold">End time<input name="end_time" type="time" required className={`${fieldClass} mt-1.5`} /></label><label className="text-xs font-semibold sm:col-span-2">Lecturer (optional)<input name="lecturer_name" maxLength={120} className={`${fieldClass} mt-1.5`} /></label><SubmitButton saving={saving}>Add to timetable</SubmitButton></form></Dialog>}
      {showTaskForm && <Dialog title="Add a planner task" onClose={() => setShowTaskForm(false)}><form onSubmit={(event) => void submitRecord(event, 'task', setShowTaskForm)} className="grid gap-3"><label className="text-xs font-semibold">Task title<input name="title" required maxLength={160} className={`${fieldClass} mt-1.5`} /></label><label className="text-xs font-semibold">Description<textarea name="description" rows={3} maxLength={2000} className={`${fieldClass} mt-1.5`} /></label><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold">Course code (optional)<input name="course_code" maxLength={32} className={`${fieldClass} mt-1.5`} /></label><label className="text-xs font-semibold">Due date<input name="due_at" type="datetime-local" className={`${fieldClass} mt-1.5`} /></label></div><label className="text-xs font-semibold">Priority<select name="priority" className={`${fieldClass} mt-1.5`}><option value="normal">Normal</option><option value="high">High</option><option value="low">Low</option></select></label><SubmitButton saving={saving}>Save task</SubmitButton></form></Dialog>}
      {showMaterialForm && <Dialog title="Share course material" onClose={() => setShowMaterialForm(false)}><form onSubmit={(event) => void submitRecord(event, 'material', setShowMaterialForm)} className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold">Course code<input name="course_code" required maxLength={32} className={`${fieldClass} mt-1.5`} /></label><label className="text-xs font-semibold">Course title<input name="course_title" required maxLength={120} className={`${fieldClass} mt-1.5`} /></label><label className="text-xs font-semibold sm:col-span-2">Material title<input name="title" required maxLength={160} className={`${fieldClass} mt-1.5`} /></label><label className="text-xs font-semibold">Type<select name="file_type" className={`${fieldClass} mt-1.5`}><option value="lecture_notes">Lecture notes</option><option value="past_question">Past question</option><option value="study_guide">Study guide</option><option value="presentation">Presentation</option><option value="pdf">PDF</option><option value="other">Other</option></select></label><label className="text-xs font-semibold">File (up to 25 MB)<input name="file" type="file" required accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,image/*" className={`${fieldClass} mt-1.5 file:mr-2 file:rounded-md file:border-0 file:bg-indigo-50 file:px-2 file:py-1 file:text-xs dark:file:bg-indigo-950`} /></label><label className="text-xs font-semibold sm:col-span-2">Description (optional)<textarea name="description" rows={2} maxLength={2000} className={`${fieldClass} mt-1.5`} /></label><SubmitButton saving={saving}>Upload &amp; share</SubmitButton></form></Dialog>}
    </section>
  );
}

function SubmitButton({ saving, children }: { saving: boolean; children: React.ReactNode }) {
  return <button disabled={saving} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60 sm:col-span-2">{saving && <LoaderCircle size={16} className="animate-spin" />}{children}</button>;
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div role="presentation" onClick={onClose} className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 p-3 sm:items-center"><section role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()} className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl dark:bg-zinc-900 sm:p-7"><div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-xl font-black text-slate-900 dark:text-white">{title}</h2><button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800">×</button></div>{children}</section></div>;
}
