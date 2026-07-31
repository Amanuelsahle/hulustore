"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Order, Stage } from '@/types'
import { LOGO_SRC, STAGE_LABELS } from '@/lib/constants'
import { supabase, mapDbToOrder, STAGE_TO_STATUS } from '@/lib/supabase'

function generateTrackingId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = 'HULU-'
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

export default function AdminPage() {
  // Auth state
  const [session, setSession] = useState<{ email: string } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [emailInput, setEmailInput] = useState('')
  const [passInput, setPassInput] = useState('')
  const [authError, setAuthError] = useState('')
  const [signingIn, setSigningIn] = useState(false)

  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  // Form state
  const [customer, setCustomer] = useState('')
  const [phone, setPhone] = useState('')
  const [title, setTitle] = useState('')
  const [generatedId, setGeneratedId] = useState('')
  const [copiedId, setCopiedId] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  // Table controls & Telegram
  const [sortField, setSortField] = useState<'id' | 'customer' | 'stage'>('id')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filterStage, setFilterStage] = useState<string>('all')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [updatingStage, setUpdatingStage] = useState<string | null>(null)
  const [sendingTelegramId, setSendingTelegramId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  // --- Auth ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setSession({ email: session.user.email })
        setAuthLoading(false)
        fetchOrders()
      } else {
        setAuthLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setSession({ email: session.user.email })
        fetchOrders()
      } else {
        setSession(null)
        setOrders([])
      }
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setAuthError('')
    setSigningIn(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailInput.trim(),
      password: passInput,
    })

    setSigningIn(false)

    if (error || !data.session) {
      setAuthError('Invalid email or password. Please try again.')
      return
    }

    setSession({ email: data.session.user.email || emailInput.trim() })
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setSession(null)
    setOrders([])
  }

  // --- Orders CRUD ---
  async function fetchOrders() {
    setOrdersLoading(true)
    // Auto-sync any pending Telegram start commands
    await fetch('/api/telegram-webhook?sync=true').catch(() => {})

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    setOrdersLoading(false)

    if (error) {
      console.error('Failed to fetch orders:', error)
      return
    }
    if (data) {
      setOrders(data.map(mapDbToOrder))
    }
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault()
    if (!customer.trim() || !phone.trim() || !title.trim()) return

    setSubmitting(true)
    setFormError('')

    let trackingId = generateTrackingId()

    // Ensure unique tracking ID
    let attempts = 0
    while (attempts < 5) {
      const { data: existing } = await supabase
        .from('orders')
        .select('tracking_id')
        .eq('tracking_id', trackingId)
        .single()

      if (!existing) break
      trackingId = generateTrackingId()
      attempts++
    }

    const { error } = await supabase.from('orders').insert({
      tracking_id: trackingId,
      customer_name: customer.trim(),
      customer_phone: phone.trim(),
      order_title: title.trim(),
      stage: 0,
      status: 'PROCESSING',
    })

    setSubmitting(false)

    if (error) {
      setFormError('Failed to create order. Please try again.')
      console.error(error)
      return
    }

    setGeneratedId(trackingId)
    setCustomer('')
    setPhone('')
    setTitle('')
    fetchOrders()
  }

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'hulustore_bot'
  const getTelegramLink = (id: string) => `https://t.me/${botUsername}?start=${id}`

  function handleCopyId() {
    if (!generatedId) return
    navigator.clipboard.writeText(generatedId).then(() => {
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    })
  }

  function handleCopyTelegramLink(id?: string) {
    const targetId = id || generatedId
    if (!targetId) return
    const link = getTelegramLink(targetId)
    navigator.clipboard.writeText(link).then(() => {
      if (id) {
        setCopiedRowId(id)
        setTimeout(() => setCopiedRowId(null), 2000)
      } else {
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
      }
    })
  }

  async function sendTelegramAlert(order: Order) {
    setSendingTelegramId(order.id)
    try {
      const res = await fetch('/api/notify-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId: order.id }),
      })
      const data = await res.json()
      if (data.success) {
        setToastMsg(`✅ Telegram alert sent for order ${order.id}!`)
      } else if (data.warning) {
        setToastMsg(`ℹ️ ${data.warning}`)
      } else {
        setToastMsg(`❌ ${data.error || 'Failed to send Telegram alert'}`)
      }
    } catch (err) {
      console.error('Error sending Telegram alert:', err)
      setToastMsg('❌ Error connecting to Telegram API server.')
    } finally {
      setSendingTelegramId(null)
      setTimeout(() => setToastMsg(null), 5000)
    }
  }

  async function handleStageChange(order: Order, newStage: Stage) {
    setUpdatingStage(order.id)

    const { error } = await supabase
      .from('orders')
      .update({
        stage: newStage,
        status: STAGE_TO_STATUS[newStage],
      })
      .eq('tracking_id', order.id)

    setUpdatingStage(null)

    if (error) {
      console.error('Failed to update stage:', error)
      return
    }

    // Optimistic update in local state
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, stage: newStage } : o))
    )

    // Automatically trigger Telegram Notification if updated to Stage 3 (OUT_FOR_DELIVERY)
    if (newStage === 3) {
      sendTelegramAlert(order)
    }
  }

  async function handleDelete(order: Order) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('tracking_id', order.id)

    if (error) {
      console.error('Failed to delete order:', error)
      return
    }

    setOrders((prev) => prev.filter((o) => o.id !== order.id))
    setDeleteConfirm(null)
  }

  function toggleSort(field: 'id' | 'customer' | 'stage') {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  // --- Loading state ---
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFAFA' }}>
        <div className="shimmer h-8 w-48 rounded-xl" />
      </div>
    )
  }

  // --- Sign In Screen ---
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FAFAFA' }}>
        <div
          className="w-full max-w-sm p-8 rounded-2xl shadow-sm"
          style={{ background: '#FFFFFF', border: '1.5px solid #EFECE6' }}
        >
          <Link href="/" className="flex items-center gap-2 mb-8">
            <img src={LOGO_SRC} alt="Hulu Store logo" className="w-10 h-10 object-contain rounded-full" />
            <span className="font-bold text-lg tracking-tight" style={{ color: '#1E1B18' }}>Hulu Store</span>
          </Link>

          <h2 className="font-bold text-2xl mb-1" style={{ color: '#1E1B18' }}>Admin Access</h2>
          <p className="text-sm mb-7" style={{ color: '#7A746E' }}>Sign in with your admin account to continue.</p>

          <form onSubmit={handleSignIn} className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A746E' }}>Email</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@example.com"
                required
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-colors"
                style={{
                  background: '#FAFAFA',
                  border: `1.5px solid ${authError ? '#E87A7A' : '#EFECE6'}`,
                  color: '#1E1B18',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = authError ? '#E87A7A' : '#E8B8A2')}
                onBlur={(e) => (e.currentTarget.style.borderColor = authError ? '#E87A7A' : '#EFECE6')}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A746E' }}>Password</label>
              <input
                type="password"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                placeholder="Password"
                required
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-colors"
                style={{
                  background: '#FAFAFA',
                  border: `1.5px solid ${authError ? '#E87A7A' : '#EFECE6'}`,
                  color: '#1E1B18',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = authError ? '#E87A7A' : '#E8B8A2')}
                onBlur={(e) => (e.currentTarget.style.borderColor = authError ? '#E87A7A' : '#EFECE6')}
              />
            </div>

            {authError && (
              <p className="text-xs font-medium" style={{ color: '#E87A7A' }}>{authError}</p>
            )}

            <button
              type="submit"
              disabled={signingIn}
              className="cta-btn w-full py-3.5 rounded-xl font-semibold text-sm mt-1"
              style={{ opacity: signingIn ? 0.7 : 1 }}
            >
              {signingIn ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // --- Authenticated Dashboard ---
  const filtered = orders.filter((o) => filterStage === 'all' || o.stage === Number(filterStage))
  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortField]
    const bv = b[sortField]
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const stageCounts = [0, 1, 2, 3, 4].map((s) => orders.filter((o) => o.stage === s).length)

  const SortIcon = ({ field }: { field: string }) => (
    <span style={{ color: sortField === field ? '#E8B8A2' : '#B8B3AE', fontSize: 11, marginLeft: 4 }}>
      {sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  )

  return (
    <div className="min-h-screen" style={{ background: '#FAFAFA' }}>
      {/* Header Nav */}
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        style={{ background: 'rgba(250,250,250,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #EFECE6' }}
      >
        <Link href="/" className="flex items-center gap-2">
          <img src={LOGO_SRC} alt="Hulu Store logo" className="w-11 h-11 object-contain rounded-full" />
          <span className="font-bold text-lg tracking-tight" style={{ color: '#1E1B18' }}>Hulu Store</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs hidden sm:block" style={{ color: '#7A746E' }}>{session.email}</span>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: '#F5DDD1', color: '#1E1B18' }}>
            Admin
          </span>
          <button
            onClick={async () => {
              setToastMsg('Syncing Telegram bot subscriptions...')
              const res = await fetch('/api/telegram-webhook?sync=true').then(r => r.json()).catch(() => null)
              fetchOrders()
              if (res?.linkedCount) {
                setToastMsg(`✅ Linked ${res.linkedCount} Telegram subscription(s)!`)
              } else {
                setToastMsg('ℹ️ Telegram subscriptions up-to-date.')
              }
              setTimeout(() => setToastMsg(null), 4000)
            }}
            className="text-xs px-3 py-2 rounded-xl transition-colors font-semibold flex items-center gap-1.5"
            style={{ background: '#F0F4F8', color: '#2481CC', border: '1px solid #D2E3FC' }}
            title="Sync Telegram start commands"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2L2 11.5l6 2.5 11-8-8.5 9.5v5l3.5-3.5 5.5 4z" />
            </svg>
            Sync Telegram
          </button>
          <button
            onClick={handleSignOut}
            className="text-sm px-4 py-2 rounded-xl transition-colors font-medium"
            style={{ color: '#7A746E', border: '1px solid #EFECE6' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#E8B8A2')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#EFECE6')}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Toast Banner */}
      {toastMsg && (
        <div className="max-w-6xl mx-auto px-6 pt-4">
          <div
            className="px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between shadow-sm animate-fade-in"
            style={{ background: '#1E1B18', color: '#FFFFFF' }}
          >
            <span>{toastMsg}</span>
            <button onClick={() => setToastMsg(null)} className="text-xs opacity-70 hover:opacity-100 ml-4">✕</button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
          {STAGE_LABELS.map((label, i) => (
            <div
              key={i}
              className="rounded-xl px-4 py-4 transition-all"
              style={{ background: '#FFFFFF', border: '1.5px solid #EFECE6' }}
            >
              <p className="text-2xl font-bold mb-1" style={{ color: i === 4 ? '#84A98C' : '#1E1B18' }}>
                {stageCounts[i]}
              </p>
              <p className="text-xs leading-snug font-medium" style={{ color: '#7A746E' }}>{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Order Panel */}
          <div
            className="lg:col-span-1 rounded-2xl p-6 self-start"
            style={{ background: '#FFFFFF', border: '1.5px solid #EFECE6' }}
          >
            <h2 className="font-bold text-lg mb-1" style={{ color: '#1E1B18' }}>New Order</h2>
            <p className="text-xs mb-6" style={{ color: '#7A746E' }}>Fill in customer details to generate a tracking ID.</p>

            <form onSubmit={handleGenerate} className="space-y-4">
              {[
                { label: 'Customer Name', value: customer, set: setCustomer, placeholder: 'Abebe Mulata' },
                { label: 'Phone Number', value: phone, set: setPhone, placeholder: '+251911234567' },
                { label: 'Order Title', value: title, set: setTitle, placeholder: '2x Shein Summer Dresses' },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A746E' }}>
                    {field.label}
                  </label>
                  <input
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    placeholder={field.placeholder}
                    required
                    className="w-full px-3.5 py-3 rounded-xl text-sm outline-none transition-colors"
                    style={{
                      background: '#FAFAFA',
                      border: '1.5px solid #EFECE6',
                      color: '#1E1B18',
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = '#E8B8A2')}
                    onBlur={(e) => (e.currentTarget.style.borderColor = '#EFECE6')}
                  />
                </div>
              ))}

              {formError && (
                <p className="text-xs font-medium" style={{ color: '#E87A7A' }}>{formError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="cta-btn w-full py-3.5 rounded-xl font-semibold text-sm mt-2"
                style={{ opacity: submitting ? 0.7 : 1 }}
              >
                {submitting ? 'Creating…' : 'Generate Order'}
              </button>
            </form>

            {/* Generated Order Details Box */}
            {generatedId && (
              <div
                className="mt-6 rounded-2xl p-5 transition-all space-y-4 shadow-sm"
                style={{ background: '#FFFFFF', border: '1.5px solid #E8B8A2' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md" style={{ background: '#F5DDD1', color: '#8A4B2A' }}>
                    Order Created Successfully
                  </span>
                  <span className="text-[11px]" style={{ color: '#7A746E' }}>Ready to share</span>
                </div>

                {/* Tracking ID Section */}
                <div className="p-3.5 rounded-xl" style={{ background: '#FAFAFA', border: '1px solid #EFECE6' }}>
                  <p className="text-[11px] font-semibold mb-1 tracking-wider uppercase" style={{ color: '#7A746E' }}>Order Tracking ID</p>
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className="text-lg font-bold"
                      style={{ fontFamily: 'var(--font-mono)', color: '#1E1B18', letterSpacing: '0.06em' }}
                    >
                      {generatedId}
                    </p>
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0"
                      style={{
                        background: copiedId ? '#84A98C' : '#1E1B18',
                        color: '#FFFFFF',
                      }}
                    >
                      {copiedId ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                          Copy ID
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Telegram Bot Subscription Link Section */}
                <div className="p-3.5 rounded-xl" style={{ background: '#F0F4F8', border: '1px solid #D2E3FC' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#2481CC">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.96 1.25-5.54 3.69-.52.36-1 .54-1.43.53-.47-.01-1.37-.27-2.04-.49-.82-.27-1.47-.42-1.42-.88.03-.24.38-.49 1.04-.75 4.09-1.78 6.82-2.95 8.19-3.52 3.9-1.63 4.71-1.91 5.24-1.92.12 0 .37.03.54.17.14.12.18.29.2.46-.01.07-.01.16-.02.26z" />
                      </svg>
                      <p className="text-[11px] font-bold tracking-wider uppercase" style={{ color: '#2481CC' }}>Telegram Bot Link</p>
                    </div>
                    <a
                      href={getTelegramLink(generatedId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1 shrink-0"
                    >
                      Open Link
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-xs truncate font-mono select-all px-2.5 py-1.5 rounded-lg flex-1 min-w-0"
                      style={{ color: '#1E1B18', background: '#FFFFFF', border: '1px solid #D2E3FC' }}
                      title={getTelegramLink(generatedId)}
                    >
                      {getTelegramLink(generatedId)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyTelegramLink()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0"
                      style={{
                        background: copiedLink ? '#84A98C' : '#2481CC',
                        color: '#FFFFFF',
                      }}
                    >
                      {copiedLink ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Copied Link!
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                          Copy Link
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-center" style={{ color: '#7A746E' }}>
                  Share the ID or Telegram subscription link with your customer to enable live delivery updates.
                </p>
              </div>
            )}
          </div>

          {/* Orders Table */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
              <div>
                <h2 className="font-bold text-lg" style={{ color: '#1E1B18' }}>All Orders</h2>
                <p className="text-xs" style={{ color: '#7A746E' }}>Showing {sorted.length} of {orders.length} total orders</p>
              </div>
              <select
                value={filterStage}
                onChange={(e) => setFilterStage(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer font-medium"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #EFECE6',
                  color: '#1E1B18',
                  paddingRight: '2.5rem',
                }}
              >
                <option value="all">All Stages</option>
                {STAGE_LABELS.map((l, i) => (
                  <option key={i} value={i}>{l}</option>
                ))}
              </select>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: '1.5px solid #EFECE6' }}>
              {/* Table Header */}
              <div
                className="grid text-xs font-semibold uppercase tracking-wider px-5 py-3.5"
                style={{
                  gridTemplateColumns: '1.2fr 1.2fr 1fr 1.4fr auto',
                  background: '#FAFAFA',
                  borderBottom: '1px solid #EFECE6',
                  color: '#7A746E',
                }}
              >
                {[
                  { label: 'Tracking ID', field: 'id' as const },
                  { label: 'Customer', field: 'customer' as const },
                  { label: 'Phone', field: null },
                  { label: 'Status Stage', field: 'stage' as const },
                  { label: 'Actions', field: null },
                ].map((col) => (
                  <div
                    key={col.label}
                    className={col.field ? 'cursor-pointer select-none hover:opacity-70 transition-opacity flex items-center' : ''}
                    onClick={() => col.field && toggleSort(col.field)}
                  >
                    {col.label}
                    {col.field && <SortIcon field={col.field} />}
                  </div>
                ))}
              </div>

              {/* Table Rows */}
              <div style={{ background: '#FFFFFF' }}>
                {ordersLoading && (
                  <div className="px-5 py-8 space-y-4">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="grid gap-4" style={{ gridTemplateColumns: '1.2fr 1.2fr 1fr 1.4fr auto' }}>
                        <div className="shimmer h-4 rounded-md" />
                        <div className="shimmer h-4 rounded-md" />
                        <div className="shimmer h-4 rounded-md" />
                        <div className="shimmer h-4 rounded-md" />
                        <div className="shimmer h-4 w-8 rounded-md" />
                      </div>
                    ))}
                  </div>
                )}
                {!ordersLoading && sorted.length === 0 && (
                  <div className="px-5 py-12 text-center text-sm" style={{ color: '#B8B3AE' }}>
                    No orders match the current filter.
                  </div>
                )}
                {!ordersLoading && sorted.map((order, i) => (
                  <div
                    key={order.id}
                    className="grid items-center px-5 py-4 text-sm transition-colors"
                    style={{
                      gridTemplateColumns: '1.2fr 1.2fr 1fr 1.4fr auto',
                      borderBottom: i < sorted.length - 1 ? '1px solid #EFECE6' : 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#FDFCFB')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* ID */}
                    <div>
                      <span
                        className="font-semibold block"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px', color: '#1E1B18', letterSpacing: '0.04em' }}
                      >
                        {order.id}
                      </span>
                      <span className="text-[11px] block truncate max-w-[140px]" style={{ color: '#7A746E' }}>
                        {order.title}
                      </span>
                    </div>

                    {/* Customer */}
                    <div>
                      <p className="font-medium text-xs" style={{ color: '#1E1B18' }}>{order.customer}</p>
                      <p className="text-[11px]" style={{ color: '#7A746E' }}>{order.createdAt}</p>
                    </div>

                    {/* Phone */}
                    <span className="text-xs" style={{ color: '#7A746E', fontFamily: 'var(--font-mono)' }}>
                      {order.phone}
                    </span>

                    {/* Stage Select */}
                    <div>
                      <select
                        value={order.stage}
                        disabled={updatingStage === order.id}
                        onChange={(e) => handleStageChange(order, Number(e.target.value) as Stage)}
                        className="px-2.5 py-1.5 rounded-lg text-xs outline-none cursor-pointer font-semibold border-none"
                        style={{
                          background: order.stage === 4 ? '#C3D9C7' : order.stage >= 2 ? '#F5DDD1' : '#EFECE6',
                          color: order.stage === 4 ? '#2D5A36' : '#1E1B18',
                          width: '100%',
                          maxWidth: '175px',
                          opacity: updatingStage === order.id ? 0.5 : 1,
                        }}
                      >
                        {STAGE_LABELS.map((l, i) => (
                          <option key={i} value={i}>{l}</option>
                        ))}
                      </select>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1 pl-2">
                      <button
                        onClick={() => handleCopyTelegramLink(order.id)}
                        className="p-2 rounded-lg transition-all hover:bg-blue-50 relative group"
                        style={{
                          color: copiedRowId === order.id ? '#84A98C' : '#2481CC',
                        }}
                        title={copiedRowId === order.id ? 'Copied Telegram Link!' : 'Copy Telegram Subscription Link'}
                      >
                        {copiedRowId === order.id ? (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                        )}
                      </button>

                      <button
                        onClick={() => sendTelegramAlert(order)}
                        disabled={sendingTelegramId === order.id}
                        className="p-2 rounded-lg transition-all hover:bg-blue-50 hover:text-blue-600 relative group"
                        style={{
                          color: order.telegram_chat_id ? '#2481CC' : '#B8B3AE',
                          opacity: sendingTelegramId === order.id ? 0.5 : 1,
                        }}
                        title={order.telegram_chat_id ? 'Telegram Connected - Send Alert' : 'Send Telegram Notification'}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.5 2L2 11.5l6 2.5 11-8-8.5 9.5v5l3.5-3.5 5.5 4z" />
                        </svg>
                      </button>

                      {deleteConfirm === order.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(order)}
                            className="text-xs px-2.5 py-1 rounded-md font-semibold text-white transition-opacity hover:opacity-90"
                            style={{ background: '#E87A7A' }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="text-xs px-2 py-1 rounded-md transition-colors"
                            style={{ color: '#7A746E' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(order.id)}
                          className="p-2 rounded-lg transition-all hover:bg-red-50 hover:text-red-500"
                          style={{ color: '#B8B3AE' }}
                          title="Delete order"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
