'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../store/authStore';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // If auth state is fully loaded and user is unauthenticated, redirect to home
    if (!isLoading && !isAuthenticated) {
      router.replace('/?error=unauthorized');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show a professional, smooth loader while loading auth state
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] bg-zinc-50 dark:bg-black font-sans">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-100" />
          <div className="absolute h-6 w-6 rounded-full bg-zinc-50 dark:bg-black" />
        </div>
        <p className="mt-4 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          Loading protected workspace...
        </p>
      </div>
    );
  }

  // Render children only if user is successfully authenticated
  return isAuthenticated ? children : null;
}
