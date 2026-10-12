'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Mail, Lock, User, AtSign, CheckCircle2 } from 'lucide-react';
import { isValidPhoneNumber, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import { countries, courseOptions, defaultCountry } from '@/lib/countries';

type School = { id: string; name: string; short_name: string; city: string; state: string };

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [countryIso, setCountryIso] = useState<CountryCode>(defaultCountry);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);
  const [department, setDepartment] = useState('');
  const [customDepartment, setCustomDepartment] = useState('');
  const [academicLevel, setAcademicLevel] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/directory', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json() as { schools?: School[]; error?: string };
        if (!response.ok) throw new Error(data.error || 'Could not load the school directory.');
        if (active) setSchools(data.schools ?? []);
      })
      .catch((directoryError: unknown) => {
        if (active) setErrorMsg(directoryError instanceof Error ? directoryError.message : 'Could not load the school directory.');
      })
      .finally(() => {
        if (active) setSchoolsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const selectedDepartment = department === 'Other' ? customDepartment.trim() : department;
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(username.trim())) {
      setErrorMsg('Username must be 3–24 characters using letters, numbers, or underscores.');
      return;
    }
    if (!schoolId || !selectedDepartment || !academicLevel) {
      setErrorMsg('Choose your school, course or department, and academic level.');
      return;
    }
    const phone = parsePhoneNumberFromString(phoneNumber, countryIso);
    if (!phone || !isValidPhoneNumber(phone.number)) {
      setErrorMsg('Enter a valid phone number for the selected country.');
      return;
    }
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username.toLowerCase().trim(),
            phone_number: phone.number,
            country_iso: countryIso,
            school_id: schoolId,
            department: selectedDepartment,
            level: academicLevel,
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data?.user) {
        if (data.session) {
          router.replace('/dashboard');
        } else {
          setIsSubmitted(true);
        }
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(verificationCode)) {
      setVerificationError('Enter the six-digit code from your email.');
      return;
    }

    setVerifying(true);
    setVerificationError('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'signup',
      });

      if (error) {
        setVerificationError(error.message);
      } else {
        router.replace('/dashboard');
        router.refresh();
      }
    } catch (err) {
      setVerificationError(err instanceof Error ? err.message : 'Could not verify the code.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    setResendMessage('');
    setVerificationError('');

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        setResendMessage(error.message);
      } else {
        setVerificationCode('');
        setResendMessage('A new verification email has been requested. Check your inbox and spam folder.');
      }
    } catch (err) {
      setResendMessage(err instanceof Error ? err.message : 'Could not resend the verification email.');
    } finally {
      setResending(false);
    }
  };

  if (isSubmitted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-100 p-4 pb-24">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-md dark:bg-gray-800">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verify your email</h2>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
            We sent a six-digit verification code to <span className="font-semibold text-gray-900 dark:text-white">{email}</span>.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Check your inbox or spam folder, then enter the code below to activate your SkoollHub account.
          </p>
          <form onSubmit={handleVerifyEmail} className="mt-6 space-y-3">
            <label htmlFor="verification-code" className="sr-only">
              Six-digit verification code
            </label>
            <input
              id="verification-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={verificationCode}
              onChange={(event) => {
                setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                setVerificationError('');
              }}
              placeholder="000000"
              aria-describedby={verificationError ? 'verification-error' : undefined}
              className="w-full rounded-xl border border-gray-300 bg-transparent px-4 py-3 text-center font-mono text-xl tracking-[0.5em] text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-gray-600 dark:text-white"
            />
            {verificationError && (
              <p id="verification-error" role="alert" className="text-left text-sm text-red-600">
                {verificationError}
              </p>
            )}
            <button
              type="submit"
              disabled={verifying || verificationCode.length !== 6}
              className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {verifying ? 'Verifying...' : 'Verify email'}
            </button>
          </form>
          {resendMessage && (
            <p role="status" className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              {resendMessage}
            </p>
          )}
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resending}
            className="mt-3 w-full rounded-xl border border-indigo-200 px-4 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-50 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-900/20"
          >
            {resending ? 'Sending...' : 'Resend verification email'}
          </button>
          <Link
            href="/login"
            className="mt-3 inline-block w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 p-4 pb-24">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md dark:bg-gray-800">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your SkoollHub Account</h1>
          <p className="mt-1 text-sm text-gray-500">Connect with your campus community</p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Afolabi Marv"
                className="w-full rounded-xl border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Username
            </label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                required
                minLength={3}
                maxLength={24}
                pattern="[a-zA-Z0-9_]{3,24}"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder="marv_plug"
                autoComplete="username"
                className="w-full rounded-xl border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label htmlFor="country" className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Country</label>
            <select
              id="country"
              value={countryIso}
              onChange={(event) => setCountryIso(event.target.value as CountryCode)}
              className="w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:text-white dark:[color-scheme:dark]"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>{country.name} ({country.callingCode})</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="phone-number" className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Phone number</label>
            <div className="flex overflow-hidden rounded-xl border border-gray-300 focus-within:border-indigo-600 focus-within:ring-1 focus-within:ring-indigo-600 dark:border-gray-600">
              <span className="flex shrink-0 items-center border-r border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
                {countries.find((country) => country.code === countryIso)?.callingCode}
              </span>
              <input
                id="phone-number"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                required
                maxLength={24}
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder="801 234 5678"
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none dark:text-white"
              />
            </div>
            <p className="mt-1 text-[10px] text-gray-500">Your country calling code is added automatically.</p>
          </div>

          <div>
            <label htmlFor="school" className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">University, college or other tertiary school</label>
            <select
              id="school"
              required
              value={schoolId}
              onChange={(event) => setSchoolId(event.target.value)}
              disabled={schoolsLoading}
              className="w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 disabled:opacity-60 dark:text-white dark:[color-scheme:dark]"
            >
              <option value="">{schoolsLoading ? 'Loading schools…' : 'Select your school'}</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>{school.name} — {school.city}, {school.state}</option>
              ))}
            </select>
            {!schoolsLoading && schools.length === 0 && <p className="mt-1 text-[10px] text-rose-600">School list unavailable. Please refresh to try again.</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="department" className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Course / department</label>
              <select
                id="department"
                required
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:text-white dark:[color-scheme:dark]"
              >
                <option value="">Select course or department</option>
                {courseOptions.map((course) => <option key={course} value={course}>{course}</option>)}
                <option value="Other">Other / not listed</option>
              </select>
              {department === 'Other' && (
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={customDepartment}
                  onChange={(event) => setCustomDepartment(event.target.value)}
                  placeholder="Enter your course or department"
                  className="mt-2 w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:text-white"
                />
              )}
            </div>
            <div>
              <label htmlFor="academic-level" className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">Academic level</label>
              <select
                id="academic-level"
                required
                value={academicLevel}
                onChange={(event) => setAcademicLevel(event.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-transparent px-3 py-2.5 text-sm text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:text-white dark:[color-scheme:dark]"
              >
                <option value="">Select your level</option>
                {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((level) => <option key={level} value={level}>{level} Level</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@unilorin.edu.ng"
                className="w-full rounded-xl border border-gray-300 bg-transparent py-2.5 pl-10 pr-4 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-300 bg-transparent py-2.5 pl-10 pr-10 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}