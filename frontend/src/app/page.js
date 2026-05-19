'use client';

import React from 'react';
import useAuthStore from '../store/authStore';

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  const handleLogin = () => {
    window.location.href = 'http://localhost:8000/auth/login/github/';
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 sm:px-8 font-sans bg-zinc-50 dark:bg-black">
      {/* Background gradients for premium glassmorphism effect */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)]">
          <div 
            className="aspect-[1155/678] w-[36rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 dark:opacity-10"
            style={{
              clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'
            }}
          />
        </div>
      </div>

      <div className="mx-auto max-w-2xl text-center">
        {isLoading ? (
          /* Premium skeleton loading container */
          <div className="space-y-6">
            <div className="mx-auto h-4 w-32 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
            <div className="mx-auto h-12 w-96 animate-pulse rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="mx-auto h-6 w-80 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          </div>
        ) : isAuthenticated && user ? (
          /* Authenticated Experience */
          <div className="space-y-8 animate-fade-in">
            {/* Header info */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-200/80 bg-purple-50/50 px-3.5 py-1.5 text-xs font-semibold text-purple-700 dark:border-purple-900/30 dark:bg-purple-950/20 dark:text-purple-400">
                <span className="flex h-1.5 w-1.5 rounded-full bg-purple-600 dark:bg-purple-400 animate-pulse" />
                Active Session
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-5xl">
                Welcome back, <span className="text-purple-600 dark:text-purple-400">{user.username}</span>!
              </h1>
              <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                You are successfully authenticated using GitHub OAuth and simple JWT!
              </p>
            </div>

            {/* Profile Detail Card */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white p-8 text-left shadow-sm backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/50 sm:p-10">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">Profile Metadata</h3>
              <dl className="mt-6 space-y-4 divide-y divide-zinc-100 border-t border-zinc-100 text-sm dark:divide-zinc-800 dark:border-zinc-800">
                <div className="flex justify-between py-3">
                  <dt className="font-medium text-zinc-500">User ID</dt>
                  <dd className="font-mono text-zinc-900 dark:text-zinc-300 break-all select-all">{user.id}</dd>
                </div>
                <div className="flex justify-between py-3">
                  <dt className="font-medium text-zinc-500">Email Address</dt>
                  <dd className="text-zinc-900 dark:text-zinc-300">{user.email}</dd>
                </div>
                <div className="flex justify-between py-3">
                  <dt className="font-medium text-zinc-500">Assigned Role</dt>
                  <dd className="capitalize text-zinc-900 dark:text-zinc-300">{user.role}</dd>
                </div>
                <div className="flex justify-between py-3">
                  <dt className="font-medium text-zinc-500">Auth Provider</dt>
                  <dd className="capitalize text-zinc-900 dark:text-zinc-300">{user.provider || 'GitHub'}</dd>
                </div>
              </dl>
            </div>

            {/* Next Steps tips */}
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Authentication tokens are securely stored in your browser's local storage and will refresh automatically.
            </p>
          </div>
        ) : (
          /* Unauthenticated Landing Experience */
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                🚀 Welcome to the Marketplace
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-6xl sm:leading-[1.1]">
                Book 1-on-1 Sessions With Your Favorite <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-indigo-400">Creators</span>
              </h1>
              <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
                Sign in securely with GitHub to start browsing exclusive bookings, scheduling private sessions, or setting up your creator profile.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                onClick={handleLogin}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-zinc-950 px-8 text-base font-bold text-white transition-all hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 sm:w-auto shadow-md hover:shadow-lg"
              >
                {/* GitHub Large Icon */}
                <svg className="h-5 w-5 fill-current" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                Get Started with GitHub
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
