'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function login(formData: FormData): Promise<{ error: string } | void> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }
  } catch (err: any) {
    return { error: err.message || 'Failed to connect to authentication server.' };
  }

  redirect('/dashboard');
}

export async function signup(formData: FormData): Promise<{ error: string } | void> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const username = formData.get('username') as string;

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username,
        },
      },
    });

    if (error) {
      return { error: error.message };
    }
  } catch (err: any) {
    return { error: err.message || 'Failed to connect to authentication server.' };
  }

  redirect('/dashboard');
}

export async function logout(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect('/login');
}