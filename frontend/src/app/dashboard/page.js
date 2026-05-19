'use client';

import React from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import useAuthStore from '../../store/authStore';

function DashboardContent() {
  const { user } = useAuthStore();

  return (
    <div className="flex-1 px-6 py-12 sm:px-8 bg-zinc-50 dark:bg-black font-sans">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Dynamic Greeting */}
        <div className="space-y-2">
          <span className="text-sm font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Secure Workspace
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
            Welcome to your Dashboard, {user?.username}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">
            Manage your scheduled marketplace sessions, edit your profile credentials, and connect with clients.
          </p>
        </div>

        {/* Dashboard Grid Options */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* Card 1: Session Bookings */}
          <div className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black font-bold mb-4">
              📅
            </div>
            <h3 className="font-bold text-zinc-950 dark:text-zinc-50 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Upcoming Bookings
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-2 leading-relaxed">
              You currently have 0 active scheduled bookings. Check your availability settings to accept new invites.
            </p>
          </div>

          {/* Card 2: Creator Stats */}
          <div className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black font-bold mb-4">
              📈
            </div>
            <h3 className="font-bold text-zinc-950 dark:text-zinc-50 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Earnings Overview
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-2 leading-relaxed">
              Track your cumulative session earnings and payouts. Complete creator registration to unlock withdrawal features.
            </p>
          </div>

          {/* Card 3: Profile Settings */}
          <div className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-all dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-950 text-white dark:bg-zinc-50 dark:text-black font-bold mb-4">
              ⚙️
            </div>
            <h3 className="font-bold text-zinc-950 dark:text-zinc-50 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              Settings & Integrations
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-2 leading-relaxed">
              Verify linked accounts, edit email alerts, and toggle platform permissions. You are connected via **GitHub**.
            </p>
          </div>

        </div>

        {/* Detailed User Card in Dashboard */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.username} 
                  className="h-16 w-16 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-200 font-bold text-lg text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">
                  {user?.username}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                user?.role === 'creator' 
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
              }`}>
                Role: {user?.role}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
