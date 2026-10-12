import { Suspense, use } from 'react';
import ProfileView from '@/components/profile/ProfileView';

type PublicProfilePageProps = {
  params: Promise<{ username: string }>;
};

function ProfileFromParams({ params }: PublicProfilePageProps) {
  const { username } = use(params);
  return <ProfileView username={username} />;
}

export default function PublicProfilePage(props: PublicProfilePageProps) {
  return (
    <Suspense fallback={<div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center text-sm text-slate-500">Loading profile…</div>}>
      <ProfileFromParams params={props.params} />
    </Suspense>
  );
}
