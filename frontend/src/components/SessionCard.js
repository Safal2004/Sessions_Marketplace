import React from 'react';
import Link from 'next/link';

export default function SessionCard({ session }) {
  const {
    id,
    creator,
    title,
    thumbnail_url,
    price,
    duration_minutes,
    max_participants,
    tags = []
  } = session;

  return (
    <Link 
      href={`/sessions/${id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all duration-200 hover:border-zinc-400 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:border-zinc-700 no-underline text-zinc-950 dark:text-zinc-50"
    >
      {/* Thumbnail / Image Area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        {thumbnail_url ? (
          <img 
            src={thumbnail_url} 
            alt={title}
            className="h-full w-full object-cover grayscale opacity-90 transition-all duration-300 group-hover:scale-[1.02] group-hover:grayscale-0 group-hover:opacity-100"
            loading="lazy"
          />
        ) : (
          /* Subtle minimalistic fallback gradient (not too colorful, very clean) */
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-200 dark:from-zinc-950 dark:to-zinc-850">
            <span className="text-2xl font-bold tracking-widest text-zinc-300 dark:text-zinc-800">
              SESSIONS
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex flex-1 flex-col p-5">
        {/* Creator Identity */}
        <div className="flex items-center gap-2.5 mb-3">
          {creator?.avatar_url ? (
            <img 
              src={creator.avatar_url} 
              alt={creator.username}
              className="h-5 w-5 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
            />
          ) : (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-bold text-zinc-600 dark:bg-zinc-850 dark:text-zinc-450">
              {creator?.username?.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {creator?.username || 'Unknown Creator'}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors line-clamp-1 mb-2">
          {title}
        </h3>

        {/* Metadata Details */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500 dark:text-zinc-450 mt-1 mb-4">
          <div className="flex items-center gap-1">
            <span>⏱️</span>
            <span>{duration_minutes}m</span>
          </div>
          <div className="flex items-center gap-1">
            <span>👥</span>
            <span>Up to {max_participants} {max_participants === 1 ? 'person' : 'people'}</span>
          </div>
        </div>

        {/* Footer info: tags & price */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80">
          {/* Tags Pills */}
          <div className="flex flex-wrap gap-1.5 max-w-[65%] overflow-hidden">
            {tags.slice(0, 2).map((tag, idx) => (
              <span 
                key={idx} 
                className="inline-flex items-center rounded-md bg-zinc-50 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase text-zinc-600 border border-zinc-200/50 dark:bg-zinc-800/50 dark:text-zinc-400 dark:border-zinc-700/50"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Pricing */}
          <div className="text-right">
            <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 block leading-none">
              Price
            </span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              {parseFloat(price) === 0 ? 'Free' : `$${price}`}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
