import React from 'react';

export default function EmptyState({ icon = '📅', title = 'No data found', description, actionButton }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 py-16 px-6 text-center">
      <span className="text-3xl block mb-3">{icon}</span>
      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
        {title}
      </h4>
      {description && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto leading-normal">
          {description}
        </p>
      )}
      {actionButton && (
        <div className="mt-5">
          {actionButton}
        </div>
      )}
    </div>
  );
}
