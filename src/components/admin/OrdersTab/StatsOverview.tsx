"use client"

import { STAGE_LABELS } from '@/lib/constants'

interface StatsOverviewProps {
  stageCounts: number[]
}

export default function StatsOverview({ stageCounts }: StatsOverviewProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
      {STAGE_LABELS.map((label, i) => (
        <div
          key={i}
          className="rounded-xl px-4 py-4 transition-all"
          style={{ background: '#FFFFFF', border: '1.5px solid #EFECE6' }}
        >
          <p className="text-2xl font-bold mb-1" style={{ color: i === STAGE_LABELS.length - 1 ? '#84A98C' : '#1E1B18' }}>
            {stageCounts[i]}
          </p>
          <p className="text-xs leading-snug font-medium" style={{ color: '#7A746E' }}>{label}</p>
        </div>
      ))}
    </div>
  )
}
