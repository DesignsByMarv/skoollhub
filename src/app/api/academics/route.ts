import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const courseCodePattern = /^[A-Za-z0-9][A-Za-z0-9 -]{0,31}$/;
const allowedMaterialTypes = new Set(['lecture_notes', 'pdf', 'presentation', 'past_question', 'study_guide', 'other']);

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function getUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Could not verify your session: ${error.message}`);
  if (!user || !user.email_confirmed_at) return { supabase, user: null };
  return { supabase, user };
}

export async function GET() {
  try {
    const { supabase, user } = await getUser();
    if (!user) return errorResponse('Sign in to open your academic hub.', 401);
    const { data: profile, error: profileError } = await supabase.from('profiles')
      .select('school_id, level, department').eq('id', user.id).maybeSingle();
    if (profileError) {
      console.error('Academic profile query failed:', profileError.message);
      return errorResponse('Could not load your academic profile.', 500);
    }

    const [timetablesResult, tasksResult, materialsResult] = await Promise.all([
      supabase.from('timetables').select('id, semester, academic_year, created_at')
        .eq('student_id', user.id).order('created_at', { ascending: false }).limit(1),
      supabase.from('planner_tasks').select('id, title, description, course_code, due_at, priority, is_completed, created_at')
        .eq('user_id', user.id).order('is_completed').order('due_at', { ascending: true, nullsFirst: false }).limit(200),
      (() => {
        let query = supabase.from('course_materials')
          .select('id, uploader_id, course_code, course_title, title, description, file_url, file_name, file_type, created_at')
          .order('created_at', { ascending: false }).limit(100);
        if (profile?.school_id) query = query.eq('school_id', profile.school_id);
        return query;
      })(),
    ]);
    const queryError = timetablesResult.error ?? tasksResult.error ?? materialsResult.error;
    if (queryError) {
      console.error('Academic hub query failed:', queryError.message);
      return errorResponse('Could not load your classes, planner or course materials. Apply the student-life Supabase migration if it has not been applied.', 500);
    }

    const timetables = timetablesResult.data ?? [];
    const { data: classes, error: classesError } = timetables.length
      ? await supabase.from('classes')
        .select('id, timetable_id, course_code, course_title, venue, day_of_week, start_time, end_time, lecturer_name')
        .eq('timetable_id', timetables[0].id)
        .order('day_of_week').order('start_time')
      : { data: [], error: null };
    if (classesError) {
      console.error('Academic timetable query failed:', classesError.message);
      return errorResponse('Could not load your timetable.', 500);
    }

    const uploaderIds = [...new Set((materialsResult.data ?? []).map((material) => material.uploader_id))];
    const { data: uploaders, error: uploadersError } = uploaderIds.length
      ? await supabase.from('profiles').select('id, username, full_name, avatar_url').in('id', uploaderIds)
      : { data: [], error: null };
    if (uploadersError) {
      console.error('Academic materials uploader query failed:', uploadersError.message);
      return errorResponse('Could not load material contributors.', 500);
    }
    const uploaderById = new Map((uploaders ?? []).map((profile) => [profile.id, profile]));

    return NextResponse.json({
      profile,
      timetable: timetables[0] ?? null,
      classes: classes ?? [],
      tasks: tasksResult.data ?? [],
      materials: (materialsResult.data ?? []).map((material) => ({
        ...material,
        uploader: uploaderById.get(material.uploader_id) ?? null,
      })),
    });
  } catch (error) {
    console.error('Academic hub request failed:', error);
    return errorResponse('Could not process your academic hub request.', 500);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getUser();
    if (!user) return errorResponse('Sign in to update your academic hub.', 401);
    let body: unknown;
    try { body = await request.json(); } catch { return errorResponse('Request body must be valid JSON.', 400); }
    if (!body || typeof body !== 'object') return errorResponse('Enter valid academic details.', 400);
    const payload = body as Record<string, unknown>;
    const type = payload.type;

    if (type === 'class') {
      const courseCode = typeof payload.course_code === 'string' ? payload.course_code.trim().toUpperCase() : '';
      const courseTitle = typeof payload.course_title === 'string' ? payload.course_title.trim() : '';
      const venue = typeof payload.venue === 'string' ? payload.venue.trim() : '';
      const lecturer = typeof payload.lecturer_name === 'string' ? payload.lecturer_name.trim() : '';
      const day = Number(payload.day_of_week);
      const start = typeof payload.start_time === 'string' ? payload.start_time : '';
      const end = typeof payload.end_time === 'string' ? payload.end_time : '';
      const semester = typeof payload.semester === 'string' ? payload.semester.trim().slice(0, 60) : 'Current semester';
      const academicYear = typeof payload.academic_year === 'string' ? payload.academic_year.trim().slice(0, 32) : `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`;
      if (!courseCodePattern.test(courseCode) || !courseTitle || courseTitle.length > 120 || !venue || venue.length > 120) {
        return errorResponse('Enter a valid course code, title and venue.', 400);
      }
      if (!Number.isInteger(day) || day < 1 || day > 7 || !/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end) || start >= end) {
        return errorResponse('Choose a valid class day and time range.', 400);
      }
      let { data: timetable, error } = await supabase.from('timetables').select('id')
        .eq('student_id', user.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (error) {
        console.error('Academic timetable lookup failed:', error.message);
        return errorResponse('Could not load your timetable.', 500);
      }
      if (!timetable) {
        const result = await supabase.from('timetables').insert({
          student_id: user.id,
          semester: semester || 'Current semester',
          academic_year: academicYear,
        }).select('id').single();
        timetable = result.data;
        error = result.error;
      }
      if (error || !timetable) {
        console.error('Academic timetable creation failed:', error?.message);
        return errorResponse('Could not create your timetable.', 500);
      }
      const { data: classItem, error: classError } = await supabase.from('classes').insert({
        timetable_id: timetable.id,
        course_code: courseCode,
        course_title: courseTitle,
        venue,
        day_of_week: day,
        start_time: start,
        end_time: end,
        lecturer_name: lecturer || null,
      }).select('id, timetable_id, course_code, course_title, venue, day_of_week, start_time, end_time, lecturer_name').single();
      if (classError) {
        console.error('Academic class creation failed:', classError.message);
        return errorResponse('Could not add this class.', 500);
      }
      return NextResponse.json({ class: classItem }, { status: 201 });
    }

    if (type === 'task') {
      const title = typeof payload.title === 'string' ? payload.title.trim() : '';
      const description = typeof payload.description === 'string' ? payload.description.trim() : '';
      const courseCode = typeof payload.course_code === 'string' ? payload.course_code.trim().toUpperCase() : '';
      const dueAt = typeof payload.due_at === 'string' && payload.due_at ? new Date(payload.due_at) : null;
      const priority = payload.priority === 'high' || payload.priority === 'low' ? payload.priority : 'normal';
      if (!title || title.length > 160 || description.length > 2000) return errorResponse('Enter a task title up to 160 characters and a description up to 2,000 characters.', 400);
      if (courseCode && !courseCodePattern.test(courseCode)) return errorResponse('Enter a valid course code.', 400);
      if (dueAt && Number.isNaN(dueAt.getTime())) return errorResponse('Enter a valid due date.', 400);
      const { data: task, error } = await supabase.from('planner_tasks').insert({
        user_id: user.id,
        title,
        description: description || null,
        course_code: courseCode || null,
        due_at: dueAt?.toISOString() ?? null,
        priority,
      }).select('id, title, description, course_code, due_at, priority, is_completed, created_at').single();
      if (error) {
        console.error('Planner task creation failed:', error.message);
        return errorResponse('Could not add this task.', 500);
      }
      return NextResponse.json({ task }, { status: 201 });
    }

    if (type === 'material') {
      const courseCode = typeof payload.course_code === 'string' ? payload.course_code.trim().toUpperCase() : '';
      const courseTitle = typeof payload.course_title === 'string' ? payload.course_title.trim() : '';
      const title = typeof payload.title === 'string' ? payload.title.trim() : '';
      const fileName = typeof payload.file_name === 'string' ? payload.file_name.trim() : '';
      const fileUrl = typeof payload.file_url === 'string' ? payload.file_url.trim() : '';
      const description = typeof payload.description === 'string' ? payload.description.trim() : '';
      const fileType = typeof payload.file_type === 'string' && allowedMaterialTypes.has(payload.file_type) ? payload.file_type : 'other';
      if (!courseCodePattern.test(courseCode) || !courseTitle || courseTitle.length > 120
        || !title || title.length > 160 || !fileName || fileName.length > 255) {
        return errorResponse('Enter a valid course code, course name, material title and file name.', 400);
      }
      if (!fileUrl || description.length > 2000) return errorResponse('Attach an uploaded file and keep its description under 2,000 characters.', 400);
      let parsedUrl: URL;
      try { parsedUrl = new URL(fileUrl); } catch { return errorResponse('The uploaded file URL is invalid.', 400); }
      const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!configuredUrl || parsedUrl.origin !== new URL(configuredUrl).origin || parsedUrl.protocol !== 'https:') {
        return errorResponse('Course materials must be uploaded to SkoollHub storage.', 400);
      }
      const { data: profile, error: profileError } = await supabase.from('profiles').select('school_id').eq('id', user.id).maybeSingle();
      if (profileError) {
        console.error('Course material profile query failed:', profileError.message);
        return errorResponse('Could not confirm your university.', 500);
      }
      if (!profile?.school_id) return errorResponse('Choose your university in your profile before sharing materials.', 400);
      const { data: material, error } = await supabase.from('course_materials').insert({
        uploader_id: user.id,
        school_id: profile.school_id,
        course_code: courseCode,
        course_title: courseTitle,
        title,
        description: description || null,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
      }).select('id, uploader_id, course_code, course_title, title, description, file_url, file_name, file_type, created_at').single();
      if (error) {
        console.error('Course material creation failed:', error.message);
        return errorResponse('Could not share this course material.', 500);
      }
      return NextResponse.json({ material }, { status: 201 });
    }

    return errorResponse('Choose whether to add a class, planner task, or course material.', 400);
  } catch (error) {
    console.error('Academic update request failed:', error);
    return errorResponse('Could not process your academic update.', 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase, user } = await getUser();
    if (!user) return errorResponse('Sign in to update your planner.', 401);
    let body: unknown;
    try { body = await request.json(); } catch { return errorResponse('Request body must be valid JSON.', 400); }
    if (!body || typeof body !== 'object') return errorResponse('Invalid planner update.', 400);
    const payload = body as Record<string, unknown>;
    const taskId = payload.id;
    const isCompleted = payload.is_completed;
    if (!isUuid(taskId) || typeof isCompleted !== 'boolean') return errorResponse('Choose a valid task and completion state.', 400);
    const { data: task, error } = await supabase.from('planner_tasks')
      .update({ is_completed: isCompleted, updated_at: new Date().toISOString() })
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select('id, is_completed')
      .maybeSingle();
    if (error) {
      console.error('Planner task update failed:', error.message);
      return errorResponse('Could not update this task.', 500);
    }
    if (!task) return errorResponse('Task not found.', 404);
    return NextResponse.json({ task });
  } catch (error) {
    console.error('Planner update request failed:', error);
    return errorResponse('Could not process your planner update.', 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const { supabase, user } = await getUser();
    if (!user) return errorResponse('Sign in to update your academic hub.', 401);
    const url = new URL(request.url);
    const kind = url.searchParams.get('type');
    const id = url.searchParams.get('id');
    if (!isUuid(id) || !['task', 'class', 'material'].includes(kind ?? '')) {
      return errorResponse('Choose a valid academic item to delete.', 400);
    }
    if (kind === 'task') {
      const { error } = await supabase.from('planner_tasks').delete().eq('id', id).eq('user_id', user.id);
      if (error) {
        console.error('Planner task deletion failed:', error.message);
        return errorResponse('Could not remove this task.', 500);
      }
    } else if (kind === 'class') {
      const { data: timetables, error: timetableError } = await supabase.from('timetables')
        .select('id').eq('student_id', user.id);
      if (timetableError) {
        console.error('Timetable ownership lookup failed:', timetableError.message);
        return errorResponse('Could not verify your timetable.', 500);
      }
      const { error } = await supabase.from('classes').delete().eq('id', id)
        .in('timetable_id', (timetables ?? []).map((item) => item.id));
      if (error) {
        console.error('Timetable class deletion failed:', error.message);
        return errorResponse('Could not remove this class.', 500);
      }
    } else {
      const { error } = await supabase.from('course_materials').delete().eq('id', id).eq('uploader_id', user.id);
      if (error) {
        console.error('Course material deletion failed:', error.message);
        return errorResponse('Could not remove this material.', 500);
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Academic item deletion request failed:', error);
    return errorResponse('Could not process your academic deletion.', 500);
  }
}
