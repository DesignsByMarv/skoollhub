import { randomUUID } from 'node:crypto';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const bucket = 'message-attachments';
const allowedTypes = new Set(['avatar', 'message', 'material']);
const maxFileSize = 25 * 1024 * 1024;
const allowedMimeTypes = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav',
  'video/mp4', 'video/webm', 'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'text/plain',
]);

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  try {
    const userSupabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    if (authError || !user || !user.email_confirmed_at) {
      return errorResponse('Sign in with a confirmed email to upload files.', 401);
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const uploadType = formData.get('type');
    if (!(file instanceof File)) return errorResponse('Choose a file to upload.', 400);
    if (typeof uploadType !== 'string' || !allowedTypes.has(uploadType)) {
      return errorResponse('Choose a valid upload type.', 400);
    }
    if (!file.size || file.size > maxFileSize) return errorResponse('Files must be 25 MB or smaller.', 413);
    if (!allowedMimeTypes.has(file.type)) return errorResponse('This file type is not supported.', 415);
    if (uploadType === 'avatar' && !file.type.startsWith('image/')) {
      return errorResponse('Profile photos must be an image.', 415);
    }

    const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'bin';
    const folder = uploadType === 'avatar' ? 'avatars' : uploadType === 'material' ? 'materials' : 'messages';
    const filePath = `${folder}/${user.id}/${randomUUID()}.${extension}`;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const storageClient = serviceRoleKey && supabaseUrl
      ? createSupabaseAdminClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
      : userSupabase;

    const { data, error } = await storageClient.storage.from(bucket).upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) {
      console.error('Authenticated file upload failed:', error.message);
      return errorResponse('Could not upload this file. Check the Supabase Storage bucket and upload policies.', 500);
    }

    const { data: publicUrl } = storageClient.storage.from(bucket).getPublicUrl(data.path);
    return NextResponse.json({ url: publicUrl.publicUrl, filename: file.name }, { status: 201 });
  } catch (error) {
    console.error('Authenticated upload request failed:', error);
    return errorResponse('Could not process this upload.', 500);
  }
}
