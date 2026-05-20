'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useAuthStore from '../../../store/authStore';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);

  useEffect(() => {
    const access = searchParams.get('access');
    const refresh = searchParams.get('refresh');

    if (access && refresh) {
      // Store tokens and set authentication state
      setAuth(access, refresh);
      
      // Fetch user profile and redirect to home page or onboarding
      fetchCurrentUser().then((user) => {
        if (user) {
          if (!user.has_completed_onboarding) {
            router.replace('/onboarding');
          } else {
            router.replace('/');
          }
        } else {
          router.replace('/?error=profile_fetch_failed');
        }
      });
    } else {
      router.replace('/?error=invalid_callback_params');
    }
  }, [searchParams, setAuth, fetchCurrentUser, router]);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="relative flex items-center justify-center">
        {/* Modern animated loader */}
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-100" />
        <div className="absolute h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-900" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Authenticating</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
          Completing secure login with GitHub. You will be redirected shortly.
        </p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black font-sans">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-100" />
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Loading authenticating environment...</p>
        </div>
      }>
        <CallbackContent />
      </Suspense>
    </div>
  );
}
