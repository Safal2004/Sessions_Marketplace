'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../store/authStore';
import axiosInstance from '../../utils/axios';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, fetchCurrentUser } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Authenticated state gate
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/?error=onboarding_requires_login');
      } else if (user && user.has_completed_onboarding) {
        // Prevent manual backtracking/loops
        router.replace(user.role === 'creator' ? '/dashboard' : '/');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleRoleSelection = async (role) => {
    setSelectedRole(role);
    setIsSubmitting(true);
    setError(null);

    try {
      // POST role selection to backend onboarding endpoint
      await axiosInstance.post('/auth/complete-onboarding/', { role });
      
      // Update state store in real-time
      const updatedUser = await fetchCurrentUser();
      
      // Clean dynamic redirect based on onboarding selection
      if (updatedUser) {
        if (updatedUser.role === 'creator') {
          router.replace('/dashboard');
        } else {
          router.replace('/');
        }
      }
    } catch (err) {
      console.error('Onboarding update failed:', err);
      setError(err.response?.data?.error || 'Unable to update onboarding choices. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Render a professional loader while validating authentication state
  if (isLoading || !isAuthenticated || (user && user.has_completed_onboarding)) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-[80vh] bg-zinc-50 dark:bg-black font-sans">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-100" />
          <div className="absolute h-6 w-6 rounded-full bg-zinc-50 dark:bg-black" />
        </div>
        <p className="mt-4 text-xs font-semibold text-zinc-400 dark:text-zinc-550">
          Loading onboarding workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col justify-center bg-zinc-50 dark:bg-black py-16 px-6 font-sans text-zinc-900 dark:text-zinc-50 min-h-[90vh]">
      <div className="mx-auto max-w-2xl w-full space-y-12">
        
        {/* Header Text Section */}
        <div className="text-center space-y-4">
          <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/25 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40 uppercase tracking-wider">
            First-time Setup
          </span>
          <h1 className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-4xl leading-tight">
            How would you like to use Sessions?
          </h1>
          <p className="text-sm text-zinc-550 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Choose your path below. You can host mentoring sessions as a creator or discover and book premium coaching cohorts as an attendee.
          </p>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4 text-center dark:border-rose-900/20 dark:bg-rose-950/10 max-w-md mx-auto">
            <span className="text-sm text-rose-600 dark:text-rose-400 font-semibold">{error}</span>
          </div>
        )}

        {/* Cards Option Grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          
          {/* Creator Card */}
          <div 
            onClick={() => !isSubmitting && handleRoleSelection('creator')}
            className={`group relative flex flex-col justify-between rounded-2xl border p-6 bg-white dark:bg-zinc-900/10 cursor-pointer transition-all duration-300 ${
              isSubmitting && selectedRole === 'creator'
                ? 'border-purple-500 ring-2 ring-purple-500/20 dark:border-purple-400'
                : 'border-zinc-200 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-700 hover:shadow-md'
            } ${isSubmitting && selectedRole !== 'creator' ? 'opacity-40 cursor-default' : ''}`}
          >
            <div className="space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/40 text-lg border border-purple-100 dark:border-purple-900/40">
                💼
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                  Join as Creator
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed">
                  Share your expertise and build a thriving mentorship community.
                </p>
              </div>
              
              {/* Feature Bullets */}
              <ul className="space-y-2 text-xs text-zinc-650 dark:text-zinc-350 pt-2">
                <li className="flex items-center gap-2">
                  <span className="text-purple-500 font-semibold">✓</span> Host paid or free mentorship cohorts
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500 font-semibold">✓</span> Manage client bookings & reservations
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500 font-semibold">✓</span> Earn direct payouts and track metrics
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-850">
              <button
                type="button"
                disabled={isSubmitting}
                className="w-full h-10 rounded-xl bg-zinc-950 dark:bg-zinc-100 text-xs font-bold text-white dark:text-black group-hover:bg-purple-600 dark:group-hover:bg-purple-400 group-hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting && selectedRole === 'creator' ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Setting up profile...
                  </>
                ) : (
                  'Continue as Creator'
                )}
              </button>
            </div>
          </div>

          {/* Attendee/User Card */}
          <div 
            onClick={() => !isSubmitting && handleRoleSelection('attendee')}
            className={`group relative flex flex-col justify-between rounded-2xl border p-6 bg-white dark:bg-zinc-900/10 cursor-pointer transition-all duration-300 ${
              isSubmitting && selectedRole === 'attendee'
                ? 'border-purple-500 ring-2 ring-purple-500/20 dark:border-purple-400'
                : 'border-zinc-200 hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-700 hover:shadow-md'
            } ${isSubmitting && selectedRole !== 'attendee' ? 'opacity-40 cursor-default' : ''}`}
          >
            <div className="space-y-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800/40 text-lg border border-zinc-100 dark:border-zinc-800">
                👥
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                  Join as Attendee
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-450 leading-relaxed">
                  Book sessions with industry specialists and elevate your skills.
                </p>
              </div>
              
              {/* Feature Bullets */}
              <ul className="space-y-2 text-xs text-zinc-650 dark:text-zinc-350 pt-2">
                <li className="flex items-center gap-2">
                  <span className="text-zinc-600 dark:text-zinc-400 font-semibold">✓</span> Discover global technical sessions
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-zinc-600 dark:text-zinc-400 font-semibold">✓</span> Seamless checkout & instant scheduling
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-zinc-600 dark:text-zinc-400 font-semibold">✓</span> Keep track of active calendars
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-100 dark:border-zinc-850">
              <button
                type="button"
                disabled={isSubmitting}
                className="w-full h-10 rounded-xl bg-zinc-950 dark:bg-zinc-100 text-xs font-bold text-white dark:text-black group-hover:bg-purple-600 dark:group-hover:bg-purple-400 group-hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting && selectedRole === 'attendee' ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Setting up profile...
                  </>
                ) : (
                  'Continue as Attendee'
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Skip Link Helper Footer */}
        <div className="text-center">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => !isSubmitting && handleRoleSelection('attendee')}
            className="text-xs text-zinc-450 hover:text-zinc-950 dark:text-zinc-500 dark:hover:text-zinc-200 transition-colors bg-transparent border-none cursor-pointer underline hover:no-underline disabled:opacity-50"
          >
            Skip setup for now (defaults to Attendee)
          </button>
        </div>

      </div>
    </div>
  );
}
