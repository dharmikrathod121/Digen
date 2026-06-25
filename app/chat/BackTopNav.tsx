'use client';

import Link from 'next/link';

export default function BackTopNav() {
  return (
    <div className="shrink-0 px-6 py-4 border-b border-white/[0.05]">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        <span className="text-sm font-medium">Go back</span>
      </Link>
    </div>
  );
}

