'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import useAuthStore from '../../store/authStore';
import axiosInstance from '../../utils/axios';

// Reusable Dashboard Elements
import StatsCard from '../../components/dashboard/StatsCard';
import DashboardSection from '../../components/dashboard/DashboardSection';
import EmptyState from '../../components/dashboard/EmptyState';
import LoadingSkeleton from '../../components/dashboard/LoadingSkeleton';
import StatusBadge from '../../components/dashboard/StatusBadge';
import SessionModal from '../../components/dashboard/SessionModal';

function DashboardContent() {
  const { user } = useAuthStore();
  const isCreator = user?.role === 'creator';
  
  // Dashboard mode state: 'attendee' or 'host'
  const [dashboardMode, setDashboardMode] = useState('attendee');

  // Attendee Mode States
  const [attendeeBookings, setAttendeeBookings] = useState([]);
  const [attendeeSummary, setAttendeeSummary] = useState(null);
  const [attendeeLoading, setAttendeeLoading] = useState(true);
  const [bookingTab, setBookingTab] = useState('all');

  // Host Mode States
  const [hostSessions, setHostSessions] = useState([]);
  const [hostReceivedBookings, setHostReceivedBookings] = useState([]);
  const [hostLoading, setHostLoading] = useState(true);
  
  // Modals & General Actions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [cancelModalId, setCancelModalId] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Default switcher configuration on load
  useEffect(() => {
    if (isCreator) {
      setDashboardMode('host');
    } else {
      setDashboardMode('attendee');
    }
  }, [isCreator]);

  // Fetch Attendee Data
  const fetchAttendeeData = async () => {
    setAttendeeLoading(true);
    try {
      const [bookingsRes, summaryRes] = await Promise.all([
        axiosInstance.get('/api/v1/bookings/'),
        axiosInstance.get('/api/v1/bookings/summary/')
      ]);
      setAttendeeBookings(bookingsRes.data.results || bookingsRes.data);
      setAttendeeSummary(summaryRes.data);
    } catch (err) {
      console.error('Failed fetching attendee dashboard:', err);
    } finally {
      setAttendeeLoading(false);
    }
  };

  // Fetch Host Data
  const fetchHostData = async () => {
    setHostLoading(true);
    try {
      const [sessionsRes, receivedRes] = await Promise.all([
        axiosInstance.get(`/api/v1/sessions/?creator=${user.id}`),
        axiosInstance.get('/api/v1/bookings/received/')
      ]);
      setHostSessions(sessionsRes.data.results || sessionsRes.data);
      setHostReceivedBookings(receivedRes.data.results || receivedRes.data);
    } catch (err) {
      console.error('Failed fetching host dashboard:', err);
    } finally {
      setHostLoading(false);
    }
  };

  useEffect(() => {
    if (dashboardMode === 'attendee') {
      fetchAttendeeData();
    } else if (dashboardMode === 'host') {
      fetchHostData();
    }
  }, [dashboardMode]);

  // Cancellation Execution
  const executeCancellation = async () => {
    if (!cancelModalId) return;
    setIsCancelling(true);
    try {
      await axiosInstance.delete(`/api/v1/bookings/${cancelModalId}/`);
      
      // Optimistic UI updates
      setAttendeeBookings(prev => 
        prev.map(b => b.id === cancelModalId ? { ...b, status: 'cancelled' } : b)
      );
      
      // Re-fetch counts
      const summaryRes = await axiosInstance.get('/api/v1/bookings/summary/');
      setAttendeeSummary(summaryRes.data);
      setCancelModalId(null);
    } catch (err) {
      console.error('Cancellation failed:', err);
      alert('Unable to process session cancellation. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Delete Hosted Session
  const handleDeleteSession = async (sessionId, sessionTitle) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${sessionTitle}"? This will cancel associated reservations.`)) return;
    try {
      await axiosInstance.delete(`/api/v1/sessions/${sessionId}/`);
      // Optimistic list update
      setHostSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (err) {
      console.error('Deletion failed:', err);
      alert('Unable to delete session at this time.');
    }
  };

  // Edit action
  const triggerEditModal = (session) => {
    setEditingSession(session);
    setIsModalOpen(true);
  };

  const triggerCreateModal = () => {
    setEditingSession(null);
    setIsModalOpen(true);
  };

  // Filter Bookings by tab
  const getFilteredBookings = () => {
    return attendeeBookings.filter(b => {
      if (bookingTab === 'all') return true;
      if (bookingTab === 'upcoming') return b.status === 'confirmed';
      if (bookingTab === 'cancelled') return b.status === 'cancelled';
      if (bookingTab === 'past') return b.status === 'confirmed' && new Date(b.session?.created_at) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Mock past boundary
      return true;
    });
  };

  // Host Revenue calculations
  const calculateHostRevenue = () => {
    return hostReceivedBookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + parseFloat(b.session?.price || 0), 0);
  };

  return (
    <div className="flex-1 min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50 py-12 px-6 sm:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Navigation & Mode Toggle Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-150 dark:border-zinc-900 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-zinc-950 dark:text-white leading-none">
              Account Dashboard
            </h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-550">
              Signed in as <span className="font-semibold text-zinc-700 dark:text-zinc-350">{user?.username}</span>
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          {isCreator && (
            <div className="inline-flex rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800">
              <button 
                onClick={() => setDashboardMode('host')}
                className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  dashboardMode === 'host' 
                    ? 'bg-white shadow-sm text-zinc-950 dark:bg-zinc-800 dark:text-white' 
                    : 'text-zinc-400 hover:text-zinc-650 dark:text-zinc-500 dark:hover:text-zinc-300'
                }`}
              >
                💼 Host Console
              </button>
              <button 
                onClick={() => setDashboardMode('attendee')}
                className={`rounded-md px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  dashboardMode === 'attendee' 
                    ? 'bg-white shadow-sm text-zinc-950 dark:bg-zinc-800 dark:text-white' 
                    : 'text-zinc-400 hover:text-zinc-650 dark:text-zinc-500 dark:hover:text-zinc-300'
                }`}
              >
                👥 Attendee Hub
              </button>
            </div>
          )}
        </div>

        {/* ==========================================
            ATTENDEE DASHBOARD WORKSPACE
            ========================================== */}
        {dashboardMode === 'attendee' && (
          <div className="space-y-10 animate-fade-in">
            
            {/* Stats Overview */}
            <DashboardSection title="Reservation Overview">
              {attendeeLoading ? (
                <LoadingSkeleton type="stats" count={3} />
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  <StatsCard 
                    label="Total Bookings" 
                    value={attendeeSummary?.total_bookings || 0} 
                    subtitle="Lifetime bookings registered" 
                  />
                  <StatsCard 
                    label="Upcoming Sessions" 
                    value={attendeeSummary?.confirmed_bookings || 0} 
                    subtitle="Confirmed future calendars"
                    trendValue="Active"
                    trendDirection="up"
                  />
                  <StatsCard 
                    label="Cancelled Sessions" 
                    value={attendeeSummary?.cancelled_bookings || 0} 
                    subtitle="Self or host-cancelled sessions"
                  />
                </div>
              )}
            </DashboardSection>

            {/* Bookings Tabs & Lists */}
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <h2 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                  Your Booking Reservations
                </h2>
                
                {/* Tabs */}
                <div className="flex gap-1.5">
                  {['all', 'upcoming', 'past', 'cancelled'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setBookingTab(tab)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all border cursor-pointer ${
                        bookingTab === tab 
                          ? 'bg-zinc-950 text-white border-zinc-950 dark:bg-zinc-100 dark:text-black dark:border-zinc-100'
                          : 'bg-transparent text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {attendeeLoading ? (
                <LoadingSkeleton type="card" count={2} />
              ) : getFilteredBookings().length === 0 ? (
                <EmptyState 
                  icon="📅"
                  title={`No ${bookingTab} bookings found`}
                  description="We couldn't locate any booked sessions fitting this filter category."
                  actionButton={
                    <button 
                      onClick={() => router.push('/')}
                      className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white dark:bg-zinc-100 dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer"
                    >
                      Browse public sessions
                    </button>
                  }
                />
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {getFilteredBookings().map((booking) => {
                    const { id, session, status, booked_at } = booking;
                    if (!session) return null;

                    const formattedDate = new Date(booked_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div 
                        key={id}
                        className="flex flex-col sm:flex-row overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
                      >
                        {/* Thumbnail Cover */}
                        <div className="relative aspect-[16/10] sm:w-36 bg-zinc-100 dark:bg-zinc-950 flex-shrink-0 border-b sm:border-b-0 sm:border-r border-zinc-100 dark:border-zinc-850">
                          {session.thumbnail_url ? (
                            <img src={session.thumbnail_url} alt={session.title} className="h-full w-full object-cover grayscale" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-zinc-300 dark:text-zinc-800">SESSIONS</div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <StatusBadge status={status} />
                              <span className="text-[10px] text-zinc-400 dark:text-zinc-550">{formattedDate}</span>
                            </div>
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 line-clamp-1">{session.title}</h4>
                            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Host: <span className="font-semibold text-zinc-650 dark:text-zinc-300">{session.creator?.username}</span></p>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-850/80">
                            <span className="text-xs font-bold text-zinc-900 dark:text-white">
                              {parseFloat(session.price) === 0 ? 'Free' : `$${session.price}`}
                            </span>
                            {status === 'confirmed' && (
                              <button 
                                onClick={() => setCancelModalId(id)}
                                className="text-[10px] font-bold text-zinc-400 hover:text-rose-500 transition-colors bg-transparent border-none cursor-pointer"
                              >
                                Cancel Session
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==========================================
            HOST CREATOR CONSOLE WORKSPACE
            ========================================== */}
        {dashboardMode === 'host' && (
          <div className="space-y-10 animate-fade-in">
            
            {/* Host Stats */}
            <DashboardSection 
              title="Host Statistics"
              action={
                <button 
                  onClick={triggerCreateModal}
                  className="inline-flex h-9 items-center rounded-xl bg-zinc-950 px-4 text-xs font-bold text-white transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200 cursor-pointer"
                >
                  + Host a Session
                </button>
              }
            >
              {hostLoading ? (
                <LoadingSkeleton type="stats" count={4} />
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <StatsCard 
                    label="Total Sessions" 
                    value={hostSessions.length} 
                    subtitle="Hosted workspaces in public catalog" 
                  />
                  <StatsCard 
                    label="Total Reservations" 
                    value={hostReceivedBookings.length} 
                    subtitle="Total client bookings registered" 
                  />
                  <StatsCard 
                    label="Estimated Revenue" 
                    value={`$${calculateHostRevenue().toFixed(2)}`} 
                    subtitle="Sum of confirmed client payments"
                    trendValue="Host Tier"
                    trendDirection="up"
                  />
                  <StatsCard 
                    label="Active Bookers" 
                    value={hostReceivedBookings.filter(b => b.status === 'confirmed').length} 
                    subtitle="Confirmed upcoming attendees" 
                  />
                </div>
              )}
            </DashboardSection>

            {/* Optional Small Clean Analytics Chart */}
            {!hostLoading && hostReceivedBookings.length > 0 && (
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/20">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-5050 mb-4">
                  Monthly Booking Sparklines (Visual Analytics)
                </h4>
                {/* Beautiful minimal SVG sparkline chart simulating professional activity */}
                <div className="flex items-end gap-3 h-20 w-full max-w-sm pt-4 border-b border-zinc-100 dark:border-zinc-850">
                  <div className="w-8 bg-zinc-200 dark:bg-zinc-800 h-[20%] rounded-t" title="March: 2 bookings" />
                  <div className="w-8 bg-zinc-200 dark:bg-zinc-800 h-[40%] rounded-t" title="April: 4 bookings" />
                  <div className="w-8 bg-purple-500/80 h-[85%] rounded-t" title="May (Current): 8 bookings" />
                  <div className="text-xs text-zinc-400 dark:text-zinc-550 ml-auto pb-1">
                    May: <span className="font-bold text-zinc-900 dark:text-white">{hostReceivedBookings.length} bookings</span>
                  </div>
                </div>
              </div>
            )}

            {/* Session Catalog Table */}
            <DashboardSection title="Manage Hosted Sessions">
              {hostLoading ? (
                <LoadingSkeleton type="table" count={3} />
              ) : hostSessions.length === 0 ? (
                <EmptyState 
                  icon="💻"
                  title="No hosted sessions found"
                  description="Start design workflows by creating your first hosted session slot."
                  actionButton={
                    <button 
                      onClick={triggerCreateModal}
                      className="rounded-xl bg-zinc-950 px-4 py-2 text-xs font-bold text-white dark:bg-zinc-100 dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer"
                    >
                      Create first session
                    </button>
                  }
                />
              ) : (
                <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/10">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-250 dark:bg-zinc-950 dark:border-zinc-850 text-xs font-bold uppercase text-zinc-400">
                        <th className="p-4">Session Title</th>
                        <th className="p-4">Capacity status</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">State</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                      {hostSessions.map((session) => {
                        const { id, title, price, max_participants, is_published, remaining_seats, is_full } = session;
                        return (
                          <tr key={id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                            <td className="p-4 font-bold text-zinc-900 dark:text-zinc-50">{title}</td>
                            <td className="p-4">
                              {is_full ? (
                                <span className="text-xs font-semibold text-rose-500">Fully Booked</span>
                              ) : (
                                <span className="text-xs text-zinc-500 dark:text-zinc-400">{remaining_seats} of {max_participants} seats remaining</span>
                              )}
                            </td>
                            <td className="p-4 font-semibold text-zinc-900 dark:text-zinc-200">
                              {parseFloat(price) === 0 ? 'Free' : `$${price}`}
                            </td>
                            <td className="p-4">
                              <StatusBadge status={is_published ? 'published' : 'draft'} />
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button 
                                onClick={() => triggerEditModal(session)}
                                className="text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 bg-transparent border-none cursor-pointer"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteSession(id, title)}
                                className="text-xs font-bold text-zinc-400 hover:text-rose-500 bg-transparent border-none cursor-pointer"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </DashboardSection>

            {/* Bookings Received Feed */}
            <DashboardSection title="Reservations Received From Clients">
              {hostLoading ? (
                <LoadingSkeleton type="card" count={2} />
              ) : hostReceivedBookings.length === 0 ? (
                <EmptyState 
                  icon="👥"
                  title="No client reservations received"
                  description="Once attendees start reserving seats on your published sessions, bookings will populate here."
                />
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {hostReceivedBookings.map((booking) => {
                    const { id, session, user: bookedUser, status, booked_at } = booking;
                    const formattedDate = new Date(booked_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    return (
                      <div 
                        key={id}
                        className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4 dark:border-zinc-800 dark:bg-zinc-900/40"
                      >
                        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-3">
                          <StatusBadge status={status} />
                          <span className="text-[10px] text-zinc-400 dark:text-zinc-550">{formattedDate}</span>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{session?.title}</h4>
                          
                          {/* Client Avatar / Card Info */}
                          <div className="flex items-center gap-2 pt-1">
                            {bookedUser?.avatar_url ? (
                              <img src={bookedUser.avatar_url} alt={bookedUser.username} className="h-5 w-5 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-bold text-zinc-700 dark:bg-zinc-850 dark:text-zinc-350">
                                {bookedUser?.username?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              Booked by: <span className="font-semibold text-zinc-750 dark:text-zinc-300">{bookedUser?.username}</span> ({bookedUser?.email})
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </DashboardSection>

          </div>
        )}

        {/* ==========================================
            CANCELLATION VALIDATION DIALOG MODAL
            ========================================== */}
        {cancelModalId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6 font-sans">
            <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 text-center">
              <span className="text-2xl block mb-2">⚠️</span>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Cancel Your Reservation?</h3>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                This action is reversible by re-booking, but current reservations are subject to capacity limits.
              </p>
              
              <div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setCancelModalId(null)}
                  className="h-9 rounded-lg border border-zinc-200 px-4 text-xs font-bold text-zinc-650 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={executeCancellation}
                  disabled={isCancelling}
                  className="h-9 rounded-lg bg-rose-600 px-4 text-xs font-bold text-white transition-all hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
                >
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic creation and edit Session Modal */}
        <SessionModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchHostData}
          initialData={editingSession}
        />

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
