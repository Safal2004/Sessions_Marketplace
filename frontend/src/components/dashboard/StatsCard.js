import React from 'react';

export default function StatsCard({ label, value, subtitle, trendValue, trendDirection }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors hover:border-zinc-350 dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-zinc-700">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          {label}
        </span>
        {trendValue && (
          <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold ${
            trendDirection === 'up' 
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
          }`}>
            {trendDirection === 'up' ? '↑' : '↓'} {trendValue}
          </span>
        )}
      </div>
      <span className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white mt-2 block">
        {value}
      </span>
      {subtitle && (
        <span className="text-[11px] text-zinc-500 dark:text-zinc-450 mt-1 block">
          {subtitle}
        </span>
      )}
    </div>
  );
}
