'use client';

import React from 'react';
import Link from 'next/link';
import useAuthStore from '../store/authStore';

export default function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();

  const handleLogin = () => {
    // Dynamically choose between localhost:8000 (local dev) and relative path (Docker Nginx proxy)
    const redirectUrl = (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '3000')
      ? 'http://localhost:8000/auth/login/github/'
      : '/auth/login/github/';
    window.location.href = redirectUrl;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/70 backdrop-blur-md dark:border-zinc-800/80 dark:bg-black/70 font-sans">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6 sm:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-950 font-bold text-white dark:bg-zinc-100 dark:text-black">
            S
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Sessions <span className="font-medium text-zinc-500">Marketplace</span>
          </span>
        </Link>

        {/* Auth Actions & Navigation Area */}
        <div className="flex items-center gap-6">
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50 no-underline"
            >
              Dashboard
            </Link>
          )}

          {isLoading ? (
            /* Elegant Skeleton Loader */
            <div className="flex items-center gap-3">
              <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>
          ) : isAuthenticated && user ? (
            /* Authenticated User Panel */
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {/* Custom Role Badge */}
                <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${user.role === 'creator'
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}>
                  {user.role}
                </span>

                {/* Username */}
                <span className="hidden text-sm font-semibold text-zinc-700 dark:text-zinc-300 sm:block">
                  {user.username}
                </span>

                {/* Avatar Image */}
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="h-9 w-9 rounded-full object-cover border border-zinc-200/80 dark:border-zinc-800"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="rounded-lg border border-zinc-200 px-3.5 py-1.5 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 hover:text-zinc-950 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 cursor-pointer"
              >
                Log out
              </button>
            </div>
          ) : (
            /* Unauthenticated Login Callout */
            <button
              onClick={handleLogin}
              className="flex h-10 items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 text-sm font-semibold text-white transition-all hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 cursor-pointer"
            >
              {/* GitHub SVG Icon */}
              <svg className="h-4 w-4 fill-current" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              Login with GitHub
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
