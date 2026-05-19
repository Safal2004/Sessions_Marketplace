'use client';

import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axios';
import useAuthStore from '../store/authStore';
import SessionCard from '../components/SessionCard';

export default function Home() {
  const { user, isAuthenticated } = useAuthStore();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch sessions from the backend
  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const url = searchQuery
          ? `/api/v1/sessions/?search=${encodeURIComponent(searchQuery)}`
          : '/api/v1/sessions/';
        const response = await axiosInstance.get(url);
        // Extract results from DRF pagination structure
        setSessions(response.data.results || response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to load sessions:', err);
        setError('Unable to load sessions. Please verify the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black font-sans text-zinc-900 dark:text-zinc-50">

      {/* Hero Header Area (Sophisticated, Minimal, Human-Made) */}
      <header className="border-b border-zinc-200 bg-white/40 dark:border-zinc-900 dark:bg-zinc-950/20 py-16 px-6 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 block">
              Platform Overview
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl leading-none text-zinc-950 dark:text-white">
              Connect & Learn via Private Sessions
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base leading-relaxed">
              Browse structured technical review blocks, customized system design consults, and masterclasses hosted directly by certified marketplace creators.
            </p>

            {/* Quick Greeting for authenticated sessions */}
            {isAuthenticated && user && (
              <div className="inline-flex items-center gap-2 pt-2 text-xs font-medium text-zinc-400 dark:text-zinc-500">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                Signed in as <span className="text-zinc-800 dark:text-zinc-300 font-semibold">{user.username}</span> ({user.role})
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Catalog Search & Grid Workspace */}
      <main className="mx-auto max-w-7xl px-6 py-12 sm:px-8 space-y-8">

        {/* Search Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 dark:border-zinc-900 pb-6">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            Available Sessions
          </h2>

          <form onSubmit={handleSearchSubmit} className="flex w-full max-w-md gap-2">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search by session title or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-xl border border-zinc-200 bg-white pl-4 pr-10 text-sm transition-all focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/60 dark:focus:border-zinc-700"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs bg-transparent cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="h-10 rounded-xl bg-zinc-950 px-4 text-xs font-bold text-white transition-all hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200 cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Catalog Grid Area */}
        {loading ? (
          /* Elegant skeleton grids for loading state */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/10 p-5 space-y-4">
                <div className="aspect-[16/10] w-full animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-6 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : error ? (
          /* Graceful error state */
          <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-6 text-center dark:border-rose-900/20 dark:bg-rose-950/10">
            <span className="text-xl">⚠️</span>
            <p className="mt-2 text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-xs font-bold text-zinc-600 hover:text-zinc-950 underline dark:text-zinc-400 dark:hover:text-white bg-transparent cursor-pointer"
            >
              Reset view
            </button>
          </div>
        ) : sessions.length === 0 ? (
          /* Clean empty state */
          <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 py-16 text-center">
            <span className="text-2xl">🔍</span>
            <h3 className="mt-3 text-sm font-bold text-zinc-900 dark:text-zinc-50">No sessions found</h3>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
              We couldn't find any published sessions matching "{searchQuery || searchTerm}". Try adjusting your keywords.
            </p>
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="mt-4 rounded-lg border border-zinc-200 px-3.5 py-1.5 text-xs font-semibold hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          /* Sessions list */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}

      </main>

    </div>
  );
}
