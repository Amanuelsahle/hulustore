"use client"

import Link from 'next/link'
import { LOGO_SRC } from '@/lib/constants'

interface AdminNavProps {
  sessionEmail: string
  isSuperAdmin: boolean
  activeTab: 'orders' | 'users'
  setActiveTab: (tab: 'orders' | 'users') => void
  ordersCount: number
  usersCount: number
  onSyncTelegram: () => void
  onSignOut: () => void
}

export default function AdminNav({
  sessionEmail,
  isSuperAdmin,
  activeTab,
  setActiveTab,
  ordersCount,
  usersCount,
  onSyncTelegram,
  onSignOut,
}: AdminNavProps) {
  return (
    <>
      <nav
        className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
        style={{ background: 'rgba(250,250,250,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #EFECE6' }}
      >
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <img src={LOGO_SRC} alt="Hulu Store logo" className="w-11 h-11 object-contain rounded-full" />
            <span className="font-bold text-lg tracking-tight" style={{ color: '#1E1B18' }}>Hulu Store</span>
          </Link>

          {/* Navigation Tabs (Desktop) */}
          <div className="hidden md:flex items-center p-1 rounded-xl gap-1" style={{ background: '#EFECE6' }}>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'orders' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                background: activeTab === 'orders' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'orders' ? '#1E1B18' : '#7A746E',
              }}
            >
              📦 Orders ({ordersCount})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'users' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                background: activeTab === 'users' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'users' ? '#1E1B18' : '#7A746E',
              }}
            >
              👥 Team & Admins ({usersCount})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs hidden sm:block" style={{ color: '#7A746E' }}>{sessionEmail}</span>
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1"
            style={{
              background: isSuperAdmin ? '#FFF8E7' : '#F5DDD1',
              color: isSuperAdmin ? '#B45309' : '#1E1B18',
            }}
          >
            {isSuperAdmin ? '👑 Super Admin' : 'Admin'}
          </span>
          <button
            onClick={onSyncTelegram}
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
            onClick={onSignOut}
            className="text-sm px-4 py-2 rounded-xl transition-colors font-medium"
            style={{ color: '#7A746E', border: '1px solid #EFECE6' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#E8B8A2')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#EFECE6')}
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Mobile Tab Switcher */}
      <div className="md:hidden px-6 pt-4">
        <div className="grid grid-cols-2 p-1 rounded-xl gap-1" style={{ background: '#EFECE6' }}>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 rounded-lg text-xs font-semibold ${activeTab === 'orders' ? 'shadow-sm' : 'opacity-70'}`}
            style={{
              background: activeTab === 'orders' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'orders' ? '#1E1B18' : '#7A746E',
            }}
          >
            📦 Orders ({ordersCount})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 rounded-lg text-xs font-semibold ${activeTab === 'users' ? 'shadow-sm' : 'opacity-70'}`}
            style={{
              background: activeTab === 'users' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'users' ? '#1E1B18' : '#7A746E',
            }}
          >
            👥 Team ({usersCount})
          </button>
        </div>
      </div>
    </>
  )
}
