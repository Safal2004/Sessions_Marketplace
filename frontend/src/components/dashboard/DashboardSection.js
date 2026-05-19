import React from 'react';

export default function DashboardSection({ title, action, children }) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 dark:border-zinc-900 pb-5">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          {title}
        </h2>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
      <div>
        {children}
      </div>
    </section>
  );
}
