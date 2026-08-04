"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { Order } from '@/types'
import { LOGO_SRC, STAGE_LABELS } from '@/lib/constants'
import { supabase, mapDbToOrder } from '@/lib/supabase'
import Footer from './footer'
import TrackSearchForm from './track/TrackSearchForm'
import TrackTimeline from './track/TrackTimeline'
import TelegramSubscribeCard from './track/TelegramSubscribeCard'

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
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#E8B8A2' }}>Package Tracker</p>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1E1B18' }}>Track Your Order</h1>
            <p className="text-sm" style={{ color: '#7A746E' }}>Enter your Hulu Store tracking ID to see your package status.</p>
          </div>

          <TrackSearchForm
            inputRef={inputRef}
            query={query}
            setQuery={setQuery}
            handleSubmit={handleSubmit}
          />

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
                      background: found.stage === STAGE_LABELS.length - 1 ? '#C3D9C7' : '#F5DDD1',
                      color: found.stage === STAGE_LABELS.length - 1 ? '#2D5A36' : '#1E1B18',
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

              <TrackTimeline found={found} animated={animated} />

              <TelegramSubscribeCard found={found} />

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
                <span style={{ fontFamily: 'var(--font-mono)' }}>Stage {found.stage + 1} of {STAGE_LABELS.length}</span>
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
