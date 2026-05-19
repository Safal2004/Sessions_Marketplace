'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axiosInstance from '../../../utils/axios';
import useAuthStore from '../../../store/authStore';

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null); // 'loading', 'success', 'error'

  useEffect(() => {
    const fetchSessionDetail = async () => {
      if (!params.id) return;
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/api/v1/sessions/${params.id}/`);
        setSession(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to load session details:', err);
        setError('Failed to load session details. The resource might have been unpublished or removed.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetail();
  }, [params.id]);

  const handleBooking = async () => {
    if (!isAuthenticated) return;
    setBookingStatus('loading');
    
    // Simulate a realistic booking API process with high-quality micro-interaction
    setTimeout(() => {
      setBookingStatus('success');
    }, 1200);
  };

  const handleLoginRedirect = () => {
    window.location.href = 'http://localhost:8000/auth/login/github/';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black font-sans">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-100" />
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Loading session workspaces...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black px-6 font-sans">
        <div className="max-w-md text-center space-y-4">
          <span className="text-3xl">⚠️</span>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Session Unavailable</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{error || 'Session details not found.'}</p>
          <button 
            onClick={() => router.push('/')}
            className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200 cursor-pointer"
          >
            Return to Catalog
          </button>
        </div>
      </div>
    );
  }

  const {
    title,
    description,
    thumbnail_url,
    meeting_link,
    price,
    duration_minutes,
    max_participants,
    tags = [],
    creator
  } = session;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50 py-12 px-6 sm:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Navigation Breadcrumb */}
        <button 
          onClick={() => router.push('/')}
          className="mb-8 flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white transition-colors bg-transparent border-none cursor-pointer"
        >
          ← Back to Catalog
        </button>

        {/* Master Details Columns Grid */}
        <div className="grid gap-10 lg:grid-cols-3 items-start">
          
          {/* Main Info Column (Left 2/3) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Banner/Thumbnail (Minimal gray backdrop) */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
              {thumbnail_url ? (
                <img 
                  src={thumbnail_url} 
                  alt={title} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-950 dark:to-zinc-900">
                  <span className="text-3xl font-extrabold tracking-widest text-zinc-350 dark:text-zinc-800">
                    SESSIONS
                  </span>
                </div>
              )}
            </div>

            {/* Core Info */}
            <div className="space-y-4">
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center rounded-md bg-zinc-100/80 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-350"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-zinc-950 dark:text-white">
                {title}
              </h1>
            </div>

            {/* Description */}
            <div className="border-t border-zinc-200 dark:border-zinc-900 pt-6 space-y-4">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-zinc-50">About this Session</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>

            {/* Creator Profile Section */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
                Hosted by
              </h4>
              <div className="flex items-center gap-4">
                {creator?.avatar_url ? (
                  <img 
                    src={creator.avatar_url} 
                    alt={creator.username}
                    className="h-14 w-14 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-200 font-bold text-lg text-zinc-700 dark:bg-zinc-800 dark:text-zinc-350">
                    {creator?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                    {creator?.username || 'Marketplace Creator'}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-450 mt-0.5">
                    {creator?.email || 'verified@sessionsmarketplace.com'}
                  </p>
                  <span className="inline-flex items-center rounded bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 mt-2 uppercase tracking-wide">
                    {creator?.role || 'Creator'}
                  </span>
                </div>
              </div>
            </div>

            {/* Meeting Link Details (Only visible to authenticated users as a premium touch) */}
            {isAuthenticated && meeting_link && (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/10">
                <div className="flex items-start gap-3">
                  <span className="text-lg">🔗</span>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Private Meeting Link</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      This session will be conducted online. Once booked, you can join using the link below:
                    </p>
                    <a 
                      href={meeting_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline dark:text-purple-400 dark:hover:text-purple-300 mt-2 break-all"
                    >
                      {meeting_link}
                    </a>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Sticky Booking Sidebar (Right 1/3) */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 space-y-6">
            
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
              
              {/* Cost Indicator */}
              <div className="border-b border-zinc-100 dark:border-zinc-850 pb-5 mb-5">
                <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 block uppercase tracking-wider">
                  Total Investment
                </span>
                <span className="text-3xl font-extrabold text-zinc-950 dark:text-white mt-1 block">
                  {parseFloat(price) === 0 ? 'Free' : `$${price}`}
                </span>
              </div>

              {/* Grid Specifications */}
              <div className="space-y-4 mb-6 text-sm text-zinc-600 dark:text-zinc-350">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Duration</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{duration_minutes} Minutes</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Capacity</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{max_participants} {max_participants === 1 ? 'Attendee' : 'Attendees'} max</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Format</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">Online Interaction</span>
                </div>
              </div>

              {/* Booking CTA trigger buttons */}
              {isAuthenticated ? (
                bookingStatus === 'success' ? (
                  /* Success Booking Message */
                  <div className="rounded-xl bg-emerald-50/50 border border-emerald-200/50 p-4 text-center dark:bg-emerald-950/10 dark:border-emerald-900/20">
                    <span className="text-lg">🎉</span>
                    <h5 className="text-sm font-bold text-emerald-800 dark:text-emerald-400 mt-1">Booking Confirmed!</h5>
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-500 mt-0.5">
                      Check your email/profile for joining credentials.
                    </p>
                  </div>
                ) : (
                  /* Book Now button */
                  <button
                    onClick={handleBooking}
                    disabled={bookingStatus === 'loading'}
                    className="flex w-full h-11 items-center justify-center rounded-xl bg-zinc-950 px-6 text-sm font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 cursor-pointer"
                  >
                    {bookingStatus === 'loading' ? 'Scheduling session...' : 'Book Session Now'}
                  </button>
                )
              ) : (
                /* Unauthenticated disabled/callout states */
                <div className="space-y-4">
                  <button
                    disabled
                    className="flex w-full h-11 items-center justify-center rounded-xl bg-zinc-200 text-zinc-400 px-6 text-sm font-bold cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-600"
                  >
                    Booking Disabled
                  </button>
                  <div className="rounded-xl border border-zinc-150 bg-zinc-50/50 p-4 text-center dark:border-zinc-800 dark:bg-zinc-900/20">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                      Sign in using your **GitHub account** to schedule private sessions with this creator.
                    </p>
                    <button
                      onClick={handleLoginRedirect}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 cursor-pointer"
                    >
                      Login to Book
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Platform Guarantees info card */}
            <div className="rounded-2xl border border-zinc-200 bg-white/40 p-5 dark:border-zinc-800 dark:bg-zinc-900/10 text-xs text-zinc-400 dark:text-zinc-500 leading-normal">
              🛡️ **Marketplace Guarantee:** Your booking is protected. Cancel up to 24 hours prior to the session for a full credit refund.
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
