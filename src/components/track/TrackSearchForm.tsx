"use client"

import { RefObject } from 'react'

interface TrackSearchFormProps {
  inputRef: RefObject<HTMLInputElement | null>
  query: string
  setQuery: (val: string) => void
  handleSubmit: (e: React.FormEvent) => void
}

export default function TrackSearchForm({
  inputRef,
  query,
  setQuery,
  handleSubmit,
}: TrackSearchFormProps) {
  return (
    <form onSubmit={handleSubmit} className="flex gap-3 mb-10">
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. HULU-8F2b9c"
        className="flex-1 px-4 py-3.5 rounded-xl text-base md:text-sm outline-none"
        style={{
          background: '#FFFFFF',
          border: '1.5px solid #EFECE6',
          fontFamily: 'var(--font-mono)',
          color: '#1E1B18',
          letterSpacing: '0.04em',
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = '#E8B8A2')}
        onBlur={(e) => (e.currentTarget.style.borderColor = '#EFECE6')}
      />
      <button type="submit" className="cta-btn px-6 py-3.5 rounded-xl text-sm font-semibold whitespace-nowrap">
        Track
      </button>
    </form>
  )
}
