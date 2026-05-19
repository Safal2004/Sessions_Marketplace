import React from 'react';

export default function LoadingSkeleton({ type = 'card', count = 3 }) {
  if (type === 'stats') {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="h-28 rounded-xl border border-zinc-200 bg-white p-5 animate-pulse dark:border-zinc-800 dark:bg-zinc-900/10" />
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="border border-zinc-200 rounded-xl overflow-hidden dark:border-zinc-800 animate-pulse">
        <div className="h-10 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800" />
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="h-12 bg-white dark:bg-zinc-950/20 border-b border-zinc-100 dark:border-zinc-900/40" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="h-36 rounded-xl border border-zinc-200 bg-white p-5 animate-pulse dark:border-zinc-800 dark:bg-zinc-900/10" />
      ))}
    </div>
  );
}
