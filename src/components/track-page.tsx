"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { Order } from '@/types'
import { LOGO_SRC, STAGE_LABELS } from '@/lib/constants'
import { supabase, mapDbToOrder } from '@/lib/supabase'
import Footer from './footer'

const STAGE_SUBTEXT = [
  'Your order is confirmed and being prepared for international shipping.',
  'Your package is in transit from our overseas procurement hub.',
  'Package has cleared customs and is at our Addis Ababa warehouse.',
  'Our local courier is on the way to your delivery address.',
  'Your order has been successfully delivered. Thank you for shopping with us!',
]

function StageIcon({ index, size = 24 }: { index: number; size?: number }) {
  const s = size
  const sw = '1.8'
  switch (index) {
    case 0:
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    case 1:
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 21 4s-2 0-3.5 1.5L14 9 5.8 7.2" />
          <path d="m9 3-2 2.5-3 .5 2 2 .5 3 2.5-2 3 2-.5-3 2-2.5-3-.5z" />
          <path d="M4.5 16.5 3 18" /><path d="m5 21 4-4" /><path d="m9 16.5-1.5 1.5" />
        </svg>
      )
    case 2:
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    case 3:
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" rx="1" />
          <path d="M16 8h4l3 5v3h-7V8z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      )
    case 4:
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      )
    default:
      return null
  }
}

function maskName(name: string): string {
  const parts = name.split(' ')
  return parts
    .map((p, i) => (i === 0 ? p[0] + '*'.repeat(Math.max(p.length - 1, 4)) : p[0] + '.'))
    .join(' ')
}

export default function TrackPage() {
  const searchParams = useSearchParams()
  const initialId = searchParams.get('id') || ''

  const [query, setQuery] = useState(initialId)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [found, setFound] = useState<Order | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [animated, setAnimated] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function doSearch(id: string) {
    const trimmed = id.trim().toUpperCase()
    if (!trimmed) return

    setSubmitted(true)
    setLoading(true)
    setFound(null)
    setNotFound(false)
    setAnimated(false)

    try {
      // Sync pending Telegram bot updates automatically
      await fetch('/api/telegram-webhook?sync=true').catch(() => { })

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('tracking_id', trimmed)
        .single()

      if (error || !data) {
        setNotFound(true)
      } else {
        const order = mapDbToOrder(data)
        setFound(order)
        setTimeout(() => setAnimated(true), 80)
      }
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialId) {
      doSearch(initialId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialId])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    doSearch(query)
  }

  const stageColor = (idx: number, current: number) => {
    if (idx < current) return '#E8B8A2'
    if (idx === current) return '#E8B8A2'
    return '#EFECE6'
  }
  const stageFg = (idx: number, current: number) => {
    if (idx <= current) return '#1E1B18'
    return '#B8B3AE'
  }

  return (
    <div className="min-h-screen flex flex-col justify-between" style={{ background: '#FAFAFA' }}>
      <div>
        <nav
          className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
          style={{ background: 'rgba(250,250,250,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #EFECE6' }}
        >
          <Link href="/" className="flex items-center gap-2">
            <img src={LOGO_SRC} alt="Hulu Store logo" className="w-11 h-11 object-contain rounded-full" />
            <span className="font-bold text-lg tracking-tight" style={{ color: '#1E1B18' }}>Hulu Store</span>
          </Link>
          <Link
            href="/admin"
            className="text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            style={{ color: '#7A746E', border: '1px solid #EFECE6' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#E8B8A2')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#EFECE6')}
          >
            Admin
          </Link>
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#E8B8A2' }}>Package Tracker</p>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1E1B18' }}>Track Your Order</h1>
            <p className="text-sm" style={{ color: '#7A746E' }}>Enter your Hulu Store tracking ID to see your package status.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex gap-3 mb-10">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. HULU-8F2b9c"
              className="flex-1 px-4 py-3.5 rounded-xl text-sm outline-none"
              style={{
                background: '#FFFFFF',
                border: '1.5px solid #EFECE6',
                fontFamily: 'var(--font-mono)',
                color: '#1E1B18',
                fontSize: '13.5px',
                letterSpacing: '0.04em',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#E8B8A2')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#EFECE6')}
            />
            <button type="submit" className="cta-btn px-6 py-3.5 rounded-xl text-sm font-semibold whitespace-nowrap">
              Track
            </button>
          </form>

          {loading && (
            <div className="rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '1.5px solid #EFECE6' }}>
              <div className="p-6 pb-5" style={{ borderBottom: '1px solid #EFECE6' }}>
                <div className="shimmer h-4 w-36 rounded-lg mb-3" />
                <div className="shimmer h-6 w-48 rounded-lg mb-2" />
                <div className="shimmer h-3.5 w-64 rounded-md" />
              </div>
              <div className="p-6 space-y-6">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="shimmer w-10 h-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 pt-1">
                      <div className="shimmer h-4 w-44 rounded-md mb-2" />
                      <div className="shimmer h-3 w-64 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && notFound && (
            <div
              className="rounded-2xl p-10 text-center"
              style={{ background: '#FFFFFF', border: '1.5px solid #EFECE6' }}
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-full mx-auto mb-5" style={{ background: '#F5DDD1' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#E8B8A2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" /><line x1="11" y1="16" x2="11.01" y2="16" />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: '#1E1B18' }}>Order Not Found</h3>
              <p className="text-sm" style={{ color: '#7A746E' }}>
                No order matched <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{query.toUpperCase()}</span>. Double-check your tracking ID.
              </p>
            </div>
          )}

          {!loading && found && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: '#FFFFFF', border: '1.5px solid #EFECE6' }}
            >
              <div className="px-6 pt-6 pb-5" style={{ borderBottom: '1px solid #EFECE6' }}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#7A746E' }}>Tracking ID</p>
                    <p
                      className="text-xl font-semibold"
                      style={{ fontFamily: 'var(--font-mono)', color: '#1E1B18', letterSpacing: '0.06em' }}
                    >
                      {found.id}
                    </p>
                  </div>
                  <span
                    className="px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0"
                    style={{
                      background: found.stage === 4 ? '#C3D9C7' : '#F5DDD1',
                      color: found.stage === 4 ? '#2D5A36' : '#1E1B18',
                    }}
                  >
                    {STAGE_LABELS[found.stage]}
                  </span>
                </div>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span style={{ color: '#7A746E' }}>Customer: </span>
                    <span className="font-medium" style={{ color: '#1E1B18' }}>{maskName(found.customer)}</span>
                  </div>
                  <div>
                    <span style={{ color: '#7A746E' }}>Items: </span>
                    <span className="font-medium" style={{ color: '#1E1B18' }}>{found.title}</span>
                  </div>
                </div>
              </div>

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
                        height: `${(found.stage / 4) * 100}%`,
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

              {/* Telegram Notification Subscription Banner */}
              <div
                className="mx-6 mb-6 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                style={{
                  background: found.telegram_chat_id ? '#F0F7F4' : '#F4F8FA',
                  border: `1.5px solid ${found.telegram_chat_id ? '#C3D9C7' : '#D2E3FC'}`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: found.telegram_chat_id ? '#2D5A36' : '#2481CC',
                      color: '#FFFFFF',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2L2 11.5l6 2.5 11-8-8.5 9.5v5l3.5-3.5 5.5 4z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold" style={{ color: '#1E1B18' }}>
                      {found.telegram_chat_id ? 'Telegram Updates Active' : 'Get Live Delivery Updates via Telegram'}
                    </h4>
                    <p className="text-xs leading-relaxed mt-0.5" style={{ color: '#5F6368' }}>
                      {found.telegram_chat_id
                        ? `Your order ${found.id} is connected to Telegram. You'll receive instant alerts when out for delivery!`
                        : `Click below to start our Telegram bot and receive instant notification when your package is Out for Delivery.`}
                    </p>
                  </div>
                </div>

                <a
                  href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'hulustore_bot'}?start=${found.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 shadow-sm hover:opacity-90"
                  style={{
                    background: found.telegram_chat_id ? '#FFFFFF' : '#2481CC',
                    color: found.telegram_chat_id ? '#2D5A36' : '#FFFFFF',
                    border: found.telegram_chat_id ? '1px solid #C3D9C7' : 'none',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.96 1.25-5.54 3.69-.52.36-1 .54-1.43.53-.47-.01-1.37-.27-2.04-.49-.82-.27-1.47-.42-1.42-.88.03-.24.38-.49 1.04-.75 4.09-1.78 6.82-2.95 8.19-3.52 3.9-1.63 4.71-1.91 5.24-1.92.12 0 .37.03.54.17.14.12.18.29.2.46-.01.07-.01.16-.02.26z" />
                  </svg>
                  {found.telegram_chat_id ? 'Reconnect Bot' : 'Subscribe on Telegram'}
                </a>
              </div>

              <div
                className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                style={{ borderTop: '1px solid #EFECE6', color: '#7A746E' }}
              >
                <span>Order placed: {found.createdAt}</span>
                {found.updatedAt && (
                  <span className="font-medium" style={{ color: '#1E1B18' }}>
                    Last updated: <span style={{ color: '#E8B8A2', fontWeight: 600 }}>{found.updatedAt}</span>
                  </span>
                )}
                <span style={{ fontFamily: 'var(--font-mono)' }}>Stage {found.stage + 1} of 5</span>
              </div>
            </div>
          )}

          {!submitted && (
            <div
              className="mt-8 rounded-2xl p-5 flex items-start gap-4"
              style={{ background: '#FFFFFF', border: '1.5px solid #EFECE6' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#F5DDD1' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C47C52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1" style={{ color: '#1E1B18' }}>Need help with your order?</p>
                <p className="text-xs leading-relaxed mb-3" style={{ color: '#7A746E' }}>
                  If you can&apos;t find your tracking ID or have questions about your shipment, our support team is ready to assist you.
                </p>
                <a
                  href="https://t.me/huluustoree"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-75"
                  style={{ color: '#C47C52' }}
                >
                  Contact Support
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
