"use client"

import { useState, useEffect } from 'react'
import type { Order, Stage, AdminRole, AdminUser } from '@/types'
import { STAGE_LABELS } from '@/lib/constants'
import { supabase, mapDbToOrder, STAGE_TO_STATUS, getAdminUserRole } from '@/lib/supabase'

import AdminAuthGate from './admin/AdminAuthGate'
import AdminNav from './admin/AdminNav'
import OrdersTab from './admin/OrdersTab'
import TeamTab from './admin/TeamTab'

function generateTrackingId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let result = 'HULU-'
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

export default function AdminPage() {
  // Auth & Role state
  const [session, setSession] = useState<{ email: string; userId: string } | null>(null)
  const [userRole, setUserRole] = useState<AdminRole | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [emailInput, setEmailInput] = useState('')
  const [passInput, setPassInput] = useState('')
  const [authError, setAuthError] = useState('')
  const [signingIn, setSigningIn] = useState(false)

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'orders' | 'users'>('orders')

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

  // User Management state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>('ADMIN')
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [adminFormError, setAdminFormError] = useState('')
  const [adminSuccessMsg, setAdminSuccessMsg] = useState('')
  const [deleteAdminConfirm, setDeleteAdminConfirm] = useState<AdminUser | null>(null)
  const [updatingRoleUserId, setUpdatingRoleUserId] = useState<string | null>(null)
  const [deletingAdminUserId, setDeletingAdminUserId] = useState<string | null>(null)

  // --- Auth & Role Lifecycle ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const uId = session.user.id
        const uEmail = session.user.email || ''
        setSession({ email: uEmail, userId: uId })
        loadUserRoleAndData(uId)
      } else {
        setAuthLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const uId = session.user.id
        const uEmail = session.user.email || ''
        setSession({ email: uEmail, userId: uId })
        loadUserRoleAndData(uId)
      } else {
        setSession(null)
        setUserRole(null)
        setOrders([])
        setAdminUsers([])
      }
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadUserRoleAndData(userId: string) {
    setAuthLoading(true)
    const role = await getAdminUserRole(userId)
    setUserRole(role || 'ADMIN')
    setAuthLoading(false)
    fetchOrders()
    fetchAdminUsers()
  }

  async function fetchAdminUsers() {
    const { data } = await supabase
      .from('admin_roles')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setAdminUsers(data as AdminUser[])
    }
  }

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

    const uId = data.session.user.id
    const uEmail = data.session.user.email || emailInput.trim()
    setSession({ email: uEmail, userId: uId })
    loadUserRoleAndData(uId)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setSession(null)
    setUserRole(null)
    setOrders([])
    setAdminUsers([])
  }

  // --- User Management Handlers (Super Admin Only) ---
  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault()
    if (!newAdminEmail.trim() || !newAdminPassword) return

    setAddingAdmin(true)
    setAdminFormError('')
    setAdminSuccessMsg('')

    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: newAdminEmail.trim(),
        password: newAdminPassword,
        role: newAdminRole,
      }),
    })

    const json = await res.json()
    setAddingAdmin(false)

    if (!json.success) {
      setAdminFormError(json.error || 'Failed to create new admin user.')
      return
    }

    setAdminSuccessMsg(`✅ Successfully created admin user "${newAdminEmail.trim()}"!`)
    setNewAdminEmail('')
    setNewAdminPassword('')
    setNewAdminRole('ADMIN')
    fetchAdminUsers()
  }

  async function handleRoleChange(targetUserId: string, newRole: AdminRole) {
    setUpdatingRoleUserId(targetUserId)
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: targetUserId, newRole }),
    })

    const json = await res.json()
    setUpdatingRoleUserId(null)

    if (!json.success) {
      setToastMsg(`❌ ${json.error || 'Failed to update admin role.'}`)
      setTimeout(() => setToastMsg(null), 4000)
      return
    }

    setToastMsg('✅ Admin role updated successfully!')
    setTimeout(() => setToastMsg(null), 3000)
    fetchAdminUsers()
  }

  async function handleDeleteAdmin(targetUserId: string) {
    setDeletingAdminUserId(targetUserId)
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token

    const res = await fetch(`/api/admin/users?userId=${targetUserId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const json = await res.json()
    setDeletingAdminUserId(null)
    setDeleteAdminConfirm(null)

    if (!json.success) {
      setToastMsg(`❌ ${json.error || 'Failed to delete user.'}`)
      setTimeout(() => setToastMsg(null), 4000)
      return
    }

    setToastMsg('✅ Admin user deleted successfully!')
    setTimeout(() => setToastMsg(null), 3000)
    fetchAdminUsers()
  }

  // --- Orders CRUD ---
  async function fetchOrders() {
    setOrdersLoading(true)
    await fetch('/api/telegram-webhook?sync=true').catch(() => { })

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
      status: STAGE_TO_STATUS[0],
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
      setToastMsg(`❌ Error updating stage: ${error.message}`)
      setTimeout(() => setToastMsg(null), 4000)
      return
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, stage: newStage } : o))
    )

    if (newStage === 5) {
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

  async function handleSyncTelegram() {
    setToastMsg('Syncing Telegram bot subscriptions...')
    const res = await fetch('/api/telegram-webhook?sync=true').then(r => r.json()).catch(() => null)
    fetchOrders()
    if (res?.linkedCount) {
      setToastMsg(`✅ Linked ${res.linkedCount} Telegram subscription(s)!`)
    } else {
      setToastMsg('ℹ️ Telegram subscriptions up-to-date.')
    }
    setTimeout(() => setToastMsg(null), 4000)
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFAFA' }}>
        <div className="shimmer h-8 w-48 rounded-xl" />
      </div>
    )
  }

  // Sign In Screen
  if (!session) {
    return (
      <AdminAuthGate
        emailInput={emailInput}
        setEmailInput={setEmailInput}
        passInput={passInput}
        setPassInput={setPassInput}
        authError={authError}
        signingIn={signingIn}
        handleSignIn={handleSignIn}
      />
    )
  }

  // Authenticated Dashboard
  const filtered = orders.filter((o) => filterStage === 'all' || o.stage === Number(filterStage))
  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortField]
    const bv = b[sortField]
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const stageCounts = STAGE_LABELS.map((_, s) => orders.filter((o) => o.stage === s).length)
  const isSuperAdmin = userRole === 'SUPER_ADMIN'

  return (
    <div className="min-h-screen" style={{ background: '#FAFAFA' }}>
      <AdminNav
        sessionEmail={session.email}
        isSuperAdmin={isSuperAdmin}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        ordersCount={orders.length}
        usersCount={adminUsers.length}
        onSyncTelegram={handleSyncTelegram}
        onSignOut={handleSignOut}
      />

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

      {activeTab === 'orders' && (
        <OrdersTab
          orders={orders}
          ordersLoading={ordersLoading}
          stageCounts={stageCounts}
          customer={customer}
          setCustomer={setCustomer}
          phone={phone}
          setPhone={setPhone}
          title={title}
          setTitle={setTitle}
          submitting={submitting}
          formError={formError}
          handleGenerate={handleGenerate}
          generatedId={generatedId}
          copiedId={copiedId}
          copiedLink={copiedLink}
          handleCopyId={handleCopyId}
          handleCopyTelegramLink={handleCopyTelegramLink}
          getTelegramLink={getTelegramLink}
          sortedOrders={sorted}
          filterStage={filterStage}
          setFilterStage={setFilterStage}
          sortField={sortField}
          sortDir={sortDir}
          toggleSort={toggleSort}
          updatingStage={updatingStage}
          handleStageChange={handleStageChange}
          copiedRowId={copiedRowId}
          sendTelegramAlert={sendTelegramAlert}
          sendingTelegramId={sendingTelegramId}
          deleteConfirm={deleteConfirm}
          setDeleteConfirm={setDeleteConfirm}
          handleDeleteOrder={handleDelete}
        />
      )}

      {activeTab === 'users' && (
        <TeamTab
          adminUsers={adminUsers}
          isSuperAdmin={isSuperAdmin}
          currentUserId={session.userId}
          currentUserEmail={session.email}
          newAdminEmail={newAdminEmail}
          setNewAdminEmail={setNewAdminEmail}
          newAdminPassword={newAdminPassword}
          setNewAdminPassword={setNewAdminPassword}
          newAdminRole={newAdminRole}
          setNewAdminRole={setNewAdminRole}
          addingAdmin={addingAdmin}
          adminFormError={adminFormError}
          adminSuccessMsg={adminSuccessMsg}
          handleAddAdmin={handleAddAdmin}
          updatingRoleUserId={updatingRoleUserId}
          handleRoleChange={handleRoleChange}
          deleteAdminConfirm={deleteAdminConfirm}
          setDeleteAdminConfirm={setDeleteAdminConfirm}
          deletingAdminUserId={deletingAdminUserId}
          handleDeleteAdmin={handleDeleteAdmin}
          fetchAdminUsers={fetchAdminUsers}
        />
      )}
    </div>
  )
}
