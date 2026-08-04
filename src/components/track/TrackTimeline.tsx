"use client"

import type { Order } from '@/types'
import { STAGE_LABELS } from '@/lib/constants'
import StageIcon from './StageIcon'

const STAGE_SUBTEXT = [
  'Your order is confirmed and being prepared for international shipping.',
  'Your order has been received at our HULU USA Branch.',
  'Great news! Your order is ready for shipment to Ethiopia.',
  'Your order is in transit on its way to Ethiopia.',
  'Package has cleared customs and is at our Addis Ababa warehouse.',
  'Our local courier is on the way to your delivery address.',
  'Your order has been successfully delivered. Thank you for shopping with us!',
]

interface TrackTimelineProps {
  found: Order
  animated: boolean
}

export default function TrackTimeline({ found, animated }: TrackTimelineProps) {
  const stageColor = (idx: number, current: number) => {
    if (idx <= current) return '#E8B8A2'
    return '#EFECE6'
  }

  const stageFg = (idx: number, current: number) => {
    if (idx <= current) return '#1E1B18'
    return '#B8B3AE'
  }

  return (
    <div className="px-6 py-8">
      <div className="relative">
        <div
          className="absolute left-5 top-5 bottom-5 w-px"
          style={{ background: '#EFECE6' }}
        />
        {found.stage > 0 && (
          <div
            className="absolute left-5 top-5 w-px"
            style={{
              background: '#E8B8A2',
              height: `${(found.stage / (STAGE_LABELS.length - 1)) * 100}%`,
              transition: 'height 0.8s ease-out',
            }}
          />
        )}

        <div className="space-y-8">
          {STAGE_LABELS.map((label, i) => {
            const isCompleted = i < found.stage
            const isActive = i === found.stage
            const delay = i * 0.1

            return (
              <div
                key={i}
                className={`step-node flex items-start gap-5 ${animated ? 'animate' : ''}`}
                style={{ animationDelay: `${delay}s` }}
              >
                <div className="relative flex-shrink-0">
                  {isActive && <span className="pulse-ring" />}

                  <div
                    className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300"
                    style={{
                      background: isCompleted || isActive ? '#E8B8A2' : '#FFFFFF',
                      border: `2px solid ${stageColor(i, found.stage)}`,
                      color: stageFg(i, found.stage),
                    }}
                  >
                    {isCompleted ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E1B18" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <span style={{ color: isActive ? '#1E1B18' : '#B8B3AE' }}>
                        <StageIcon index={i} size={17} />
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-1.5 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                    <p
                      className="font-semibold text-sm"
                      style={{ color: isActive || isCompleted ? '#1E1B18' : '#B8B3AE' }}
                    >
                      {label}
                    </p>
                    {isActive && found.updatedAt && (
                      <span
                        className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                        style={{ background: '#F5DDD1', color: '#8A4B2A' }}
                      >
                        Updated: {found.updatedAt}
                      </span>
                    )}
                  </div>
                  {(isActive || isCompleted) && (
                    <p className="text-xs leading-relaxed" style={{ color: '#7A746E' }}>
                      {STAGE_SUBTEXT[i]}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
