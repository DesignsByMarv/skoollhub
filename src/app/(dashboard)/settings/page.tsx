'use client';

import Link from 'next/link';
import { useEffect, useState, useRef, type FormEvent } from 'react';
import Image from 'next/image';
import {
  AlertCircle,
  Bell,
  Check,
  ChevronRight,
  CircleUserRound,
  KeyRound,
  LoaderCircle,
  MapPin,
  Moon,
  Shield,
  Save,
  Settings,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isValidPhoneNumber, parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import { countries, defaultCountry } from '@/lib/countries';

type Tab = 'profile' | 'notifications' | 'privacy' | 'security' | 'appearance';
type School = { id: string; name: string; short_name: string; city: string; state: string };
type Profile = {
  id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  school_id: string | null;
  department: string | null;
  level: number | null;
  bio: string | null;
  phone_number: string | null;
  country_iso: string | null;
  location_sharing_enabled?: boolean;
  is_discoverable?: boolean;
};
type NotificationPreferences = {
  roommateMatches: boolean;
  feedActivity: boolean;
  timetableReminders: boolean;
  newMessages: boolean;
};

const defaultNotifications: NotificationPreferences = {
  roommateMatches: true,
  feedActivity: true,
  timetableReminders: true,
  newMessages: true,
};

async function readError(response: Response) {
  const data = await response.json().catch(() => null) as { error?: string } | null;
  return data?.error || 'Something went wrong. Please try again.';
}

const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-indigo-950';
const labelClass = 'mb-1.5 block text-xs font-semibold text-slate-700 dark:text-zinc-300';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [phoneCountry, setPhoneCountry] = useState<CountryCode>(defaultCountry);
  const [localPhoneNumber, setLocalPhoneNumber] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPrivacy, setUpdatingPrivacy] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    async function loadSettings() {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error(await readError(response));
        const data = await response.json() as { profile: Profile; schools: School[] };
        if (!active) return;
        setProfile(data.profile);
        setSchools(data.schools);
        setDarkMode(document.documentElement.classList.contains('dark'));
        const parsedPhone = data.profile.phone_number
          ? parsePhoneNumberFromString(data.profile.phone_number)
          : undefined;
        if (data.profile.country_iso && countries.some((country) => country.code === data.profile.country_iso)) {
          setPhoneCountry(data.profile.country_iso as CountryCode);
        } else if (parsedPhone?.country) {
          setPhoneCountry(parsedPhone.country);
        }
        setLocalPhoneNumber(parsedPhone?.nationalNumber ?? data.profile.phone_number ?? '');
        const savedNotifications = window.localStorage.getItem('skoollhub-notifications');
        if (savedNotifications) {
          try {
            setNotifications({ ...defaultNotifications, ...JSON.parse(savedNotifications) as Partial<NotificationPreferences> });
          } catch {
            window.localStorage.removeItem('skoollhub-notifications');
          }
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load your settings.');
      } finally {
        if (active) setIsLoading(false);
      }
    }
    void loadSettings();
    return () => {
      active = false;
    };
  }, []);

  const updateProfile = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setProfile((current) => current ? { ...current, [key]: value } : current);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB.');
      return;
    }

    setError('');
    setNotice('');
    setIsUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'avatar');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(await readError(response));
      const data = await response.json() as { url: string };

      // Update profile with avatar URL
      updateProfile('avatar_url', data.url);
      setNotice('Avatar uploaded successfully! Save your profile to confirm.');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload avatar.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleProfileSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;
    setError('');
    setNotice('');
    const parsedPhone = localPhoneNumber.trim()
      ? parsePhoneNumberFromString(localPhoneNumber, phoneCountry)
      : undefined;
    if (localPhoneNumber.trim() && (!parsedPhone || !isValidPhoneNumber(parsedPhone.number))) {
      setError('Enter a valid phone number for the selected country.');
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: profile.full_name,
          username: profile.username,
          avatar_url: profile.avatar_url,
          school_id: profile.school_id,
          department: profile.department ?? '',
          level: profile.level,
          phone_number: parsedPhone?.number ?? '',
          country_iso: phoneCountry,
          is_discoverable: profile.is_discoverable ?? true,
          bio: profile.bio ?? '',
        }),
      });
      if (!response.ok) throw new Error(await readError(response));
      const data = await response.json() as { profile: Profile };
      setProfile((current) => current ? { ...current, ...data.profile } : data.profile);
      setNotice('Your profile has been updated.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const saveNotifications = () => {
    window.localStorage.setItem('skoollhub-notifications', JSON.stringify(notifications));
    setError('');
    setNotice('Notification preferences saved on this device.');
  };

  const handlePasswordChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (newPassword.length < 8) {
      setError('Choose a password with at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('The new password and confirmation do not match.');
      return;
    }
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw new Error(updateError.message);
      setNewPassword('');
      setConfirmPassword('');
      setNotice('Your password has been changed.');
    } catch (passwordError) {
      setError(passwordError instanceof Error ? passwordError.message : 'Could not update your password.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateDiscoverability = async (isDiscoverable: boolean) => {
    setUpdatingPrivacy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/profile/privacy', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_discoverable: isDiscoverable }),
      });
      if (!response.ok) throw new Error(await readError(response));
      setProfile((current) => current ? { ...current, is_discoverable: isDiscoverable } : current);
      setNotice(isDiscoverable ? 'Your profile can appear in student discovery.' : 'Your profile is hidden from student discovery and new-chat search.');
    } catch (privacyError) {
      setError(privacyError instanceof Error ? privacyError.message : 'Could not update your discovery settings.');
    } finally {
      setUpdatingPrivacy(false);
    }
  };

  const updateNearbyLocation = async (enabled: boolean) => {
    setUpdatingPrivacy(true);
    setError('');
    setNotice('');
    try {
      if (!enabled) {
        const response = await fetch('/api/profile/location', { method: 'DELETE' });
        if (!response.ok) throw new Error(await readError(response));
      } else {
        if (!navigator.geolocation) throw new Error('Location sharing is not supported by this browser.');
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 12_000,
            maximumAge: 60_000,
          });
        });
        const response = await fetch('/api/profile/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        });
        if (!response.ok) throw new Error(await readError(response));
      }
      setProfile((current) => current ? { ...current, location_sharing_enabled: enabled } : current);
      setNotice(enabled ? 'Nearby discovery is on. Only an approximate location is stored.' : 'Nearby discovery is off and your saved location was removed.');
    } catch (locationError) {
      if (locationError instanceof GeolocationPositionError) {
        setError(locationError.code === locationError.PERMISSION_DENIED
          ? 'Allow location access in your browser to enable nearby discovery.'
          : 'Could not get your location. Try again.');
      } else {
        setError(locationError instanceof Error ? locationError.message : 'Could not update nearby discovery.');
      }
    } finally {
      setUpdatingPrivacy(false);
    }
  };

  const setTheme = (isDark: boolean) => {
    document.documentElement.classList.toggle('dark', isDark);
    window.localStorage.setItem('skoollhub-theme', isDark ? 'dark' : 'light');
    setDarkMode(isDark);
    setNotice(`Dark mode ${isDark ? 'enabled' : 'disabled'}.`);
  };

  const tabs: { id: Tab; label: string; icon: typeof CircleUserRound }[] = [
    { id: 'profile', label: 'Profile information', icon: CircleUserRound },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy and discovery', icon: Shield },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'appearance', label: 'Appearance', icon: Moon },
  ];

  return (
    <div className="mx-auto max-w-[1000px] space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="border-b border-slate-200 pb-5 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300"><Settings size={19} /></span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">Account center</p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
          </div>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-zinc-400">Manage how your SkoollHub profile appears to other students, your notifications, and your account security.</p>
      </header>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />{error}
        </div>
      )}
      {notice && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Check size={17} />{notice}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-[250px_1fr]">
        <nav aria-label="Settings sections" className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
          {profile && (
            <Link href="/profile" className="mb-2 flex items-center gap-3 rounded-xl border-b border-slate-100 px-3 py-4 transition hover:bg-slate-50 dark:border-zinc-800 dark:hover:bg-zinc-800">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-bold text-white">
                {profile.avatar_url
                  ? <Image src={profile.avatar_url} alt="" width={44} height={44} className="h-full w-full object-cover" />
                  : profile.full_name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-slate-900 dark:text-white">{profile.full_name}</span>
                <span className="mt-0.5 block truncate text-[11px] text-slate-500 dark:text-zinc-400">@{profile.username}</span>
              </span>
            </Link>
          )}
          <div className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                type="button"
                key={id}
                onClick={() => { setActiveTab(id); setNotice(''); setError(''); }}
                aria-current={activeTab === id ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold transition md:w-full ${activeTab === id ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800'}`}
              >
                <Icon size={17} />
                {label}
                <ChevronRight size={15} className="ml-auto hidden md:block" />
              </button>
            ))}
            <Link href="/profile" className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 dark:text-zinc-400 dark:hover:bg-zinc-800 md:w-full">
              <CircleUserRound size={17} />
              View my profile
              <ChevronRight size={15} className="ml-auto hidden md:block" />
            </Link>
          </div>
        </nav>

        <section className="min-h-[430px] rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-7">
          {isLoading ? (
            <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
              <LoaderCircle size={18} className="mr-2 animate-spin" />Loading settings…
            </div>
          ) : (
            <>
              {activeTab === 'profile' && profile && (
                <form onSubmit={handleProfileSave} className="space-y-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Profile information</h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">This information helps students recognize and connect with you.</p>
                  </div>

                  {/* Avatar Upload Section */}
                  <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                    <label className={labelClass}>Profile picture</label>
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center overflow-hidden">
                        {profile.avatar_url ? (
                          <Image
                            src={profile.avatar_url}
                            alt="Profile"
                            width={80}
                            height={80}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-white">
                            {profile.full_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-600 dark:text-zinc-300">
                          {profile.avatar_url ? 'Change your profile picture' : 'Add a profile picture'}
                        </p>
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={isUploadingAvatar}
                          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {isUploadingAvatar ? (
                            <>
                              <LoaderCircle size={14} className="animate-spin" />
                              Uploading…
                            </>
                          ) : (
                            <>
                              <Upload size={14} />
                              Choose image
                            </>
                          )}
                        </button>
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={isUploadingAvatar}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="full-name" className={labelClass}>Full name</label>
                      <input id="full-name" required maxLength={100} value={profile.full_name} onChange={(event) => updateProfile('full_name', event.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="username" className={labelClass}>Username</label>
                      <input id="username" required minLength={3} maxLength={24} pattern="[a-zA-Z0-9_]{3,24}" value={profile.username} onChange={(event) => updateProfile('username', event.target.value.toLowerCase())} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="email" className={labelClass}>Email address</label>
                      <input id="email" value={profile.email} readOnly className={`${inputClass} cursor-not-allowed opacity-70`} />
                    </div>
                    <div>
                      <label htmlFor="school" className={labelClass}>University</label>
                      <select id="school" value={profile.school_id ?? ''} onChange={(event) => updateProfile('school_id', event.target.value || null)} className={inputClass}>
                        <option value="">Choose university</option>
                        {schools.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="department" className={labelClass}>Department / course</label>
                      <input id="department" maxLength={100} value={profile.department ?? ''} onChange={(event) => updateProfile('department', event.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label htmlFor="level" className={labelClass}>Academic level</label>
                      <select id="level" value={profile.level ?? ''} onChange={(event) => updateProfile('level', event.target.value ? Number(event.target.value) : null)} className={inputClass}>
                        <option value="">Choose level</option>
                        {[100, 200, 300, 400, 500, 600, 700].map((level) => <option key={level} value={level}>{level} Level</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="phone" className={labelClass}>Phone number</label>
                      <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-950 dark:focus-within:ring-indigo-950">
                        <select
                          aria-label="Phone country"
                          value={phoneCountry}
                          onChange={(event) => setPhoneCountry(event.target.value as CountryCode)}
                          className="max-w-36 border-r border-slate-200 bg-transparent px-2 text-xs text-slate-700 outline-none dark:border-zinc-700 dark:text-zinc-200 dark:[color-scheme:dark]"
                        >
                          {countries.map((country) => <option key={country.code} value={country.code}>{country.name} ({country.callingCode})</option>)}
                        </select>
                        <input
                          id="phone"
                          type="tel"
                          inputMode="tel"
                          maxLength={24}
                          value={localPhoneNumber}
                          onChange={(event) => setLocalPhoneNumber(event.target.value)}
                          placeholder="Phone number"
                          className="min-w-0 flex-1 bg-transparent px-3.5 py-2.5 text-sm text-slate-900 outline-none dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="bio" className={labelClass}>About you</label>
                    <textarea id="bio" rows={4} maxLength={500} value={profile.bio ?? ''} onChange={(event) => updateProfile('bio', event.target.value)} placeholder="Tell your campus community a little about yourself…" className={`${inputClass} resize-y`} />
                    <p className="mt-1 text-right text-[10px] text-slate-400">{(profile.bio ?? '').length}/500</p>
                  </div>
                  <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                    <Link href="/profile" className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-300">Preview your profile</Link>
                    <button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
                      {isSaving ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />}
                      Save profile
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Notification preferences</h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Choose which campus activity you want to hear about on this device.</p>
                  </div>
                  {([
                    ['roommateMatches', 'Roommate matches', 'Hear when students looking for a roommate connect with you.'],
                    ['feedActivity', 'Feed activity', 'Stay up to date with replies and activity on your posts.'],
                    ['timetableReminders', 'Class reminders', 'Get reminders about your upcoming lectures.'],
                    ['newMessages', 'New messages', 'Show an in-app alert when someone sends you a message.'],
                  ] as const).map(([key, label, description]) => (
                    <label key={key} className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-100 p-4 dark:border-zinc-800">
                      <span>
                        <span className="block text-sm font-semibold text-slate-800 dark:text-zinc-100">{label}</span>
                        <span className="mt-1 block text-xs text-slate-500 dark:text-zinc-400">{description}</span>
                      </span>
                      <input type="checkbox" checked={notifications[key]} onChange={(event) => setNotifications((current) => ({ ...current, [key]: event.target.checked }))} className="h-4 w-4 accent-indigo-600" />
                    </label>
                  ))}
                  <p className="text-[11px] text-slate-400">Preferences are saved on this device. Email and push notification delivery are not enabled yet.</p>
                  <div className="flex justify-end border-t border-slate-100 pt-4 dark:border-zinc-800">
                    <button type="button" onClick={saveNotifications} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"><Save size={15} />Save preferences</button>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && profile && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Privacy and discovery</h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-zinc-400">Choose whether other students can discover your account. Your exact GPS coordinates are never shown to other members.</p>
                  </div>
                  <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-4 dark:border-zinc-800">
                    <span>
                      <span className="block text-sm font-semibold text-slate-800 dark:text-zinc-100">Appear in student discovery</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-zinc-400">When off, your account is left out of follow suggestions and new-chat search. Your existing profile and posts remain public.</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={profile.is_discoverable ?? true}
                      disabled={updatingPrivacy}
                      onChange={(event) => void updateDiscoverability(event.target.checked)}
                      className="h-4 w-4 shrink-0 accent-indigo-600"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-4 dark:border-zinc-800">
                    <span>
                      <span className="block text-sm font-semibold text-slate-800 dark:text-zinc-100">Nearby student suggestions</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-zinc-400">With your browser's permission, share an approximate location (rounded to about 1 km) to rank nearby students. The exact GPS reading is not saved.</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={profile.location_sharing_enabled ?? false}
                      disabled={updatingPrivacy}
                      onChange={(event) => void updateNearbyLocation(event.target.checked)}
                      className="h-4 w-4 shrink-0 accent-indigo-600"
                    />
                  </label>
                  <div className="flex items-start gap-3 rounded-xl bg-indigo-50 p-4 text-xs leading-5 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200">
                    <MapPin size={17} className="mt-0.5 shrink-0" />
                    <span>Nearby discovery prioritizes students at your university, then people with opted-in approximate locations. Location is processed by SkoollHub and is not sent to an external map provider.</span>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Appearance</h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Set how SkoollHub looks on this device.</p>
                  </div>
                  <button type="button" onClick={() => setTheme(!darkMode)} className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-100 p-4 text-left transition hover:bg-slate-50 dark:border-zinc-800 dark:hover:bg-zinc-800">
                    <span>
                      <span className="block text-sm font-semibold text-slate-800 dark:text-zinc-100">Dark mode</span>
                      <span className="mt-1 block text-xs text-slate-500 dark:text-zinc-400">Saved on this device.</span>
                    </span>
                    <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${darkMode ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-zinc-200'}`}>{darkMode ? 'On' : 'Off'}</span>
                  </button>
                </div>
              )}

              {activeTab === 'security' && (
                <form onSubmit={handlePasswordChange} className="max-w-lg space-y-5">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Account security</h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Change your password securely through your SkoollHub account.</p>
                  </div>
                  <div className="rounded-xl bg-indigo-50 p-4 text-xs leading-5 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200">
                    <KeyRound size={16} className="mb-2" />
                    Your password is handled by Supabase Authentication and is never stored in your profile.
                  </div>
                  <div>
                    <label htmlFor="new-password" className={labelClass}>New password</label>
                    <input id="new-password" type="password" required minLength={8} autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className={labelClass}>Confirm new password</label>
                    <input id="confirm-password" type="password" required minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={inputClass} />
                  </div>
                  <div className="flex justify-end border-t border-slate-100 pt-4 dark:border-zinc-800">
                    <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
                      {isSaving ? <LoaderCircle size={15} className="animate-spin" /> : <KeyRound size={15} />}
                      Update password
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
