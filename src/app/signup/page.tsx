'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client'; // or your supabase client helper

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    // If signup succeeds, prompt the user to check their email
    if (data?.user) {
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-lg dark:bg-gray-800">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
            ✉️
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Check your email</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            We sent a verification link to <span className="font-semibold">{email}</span>. Please click the link to verify your account before logging in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      {/* Your form inputs here */}
    </form>
  );
}