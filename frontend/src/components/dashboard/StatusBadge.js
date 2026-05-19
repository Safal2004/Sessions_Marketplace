import React from 'react';

export default function StatusBadge({ status }) {
  const getStyles = () => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'published':
      case 'active':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
      case 'pending':
      case 'draft':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
      case 'cancelled':
      case 'inactive':
        return 'bg-zinc-100 text-zinc-550 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700';
      default:
        return 'bg-zinc-50 text-zinc-600 dark:bg-zinc-800/40 dark:text-zinc-350 border-zinc-200 dark:border-zinc-800';
    }
  };

  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStyles()}`}>
      {status}
    </span>
  );
}
