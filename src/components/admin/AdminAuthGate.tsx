"use client"

import Link from 'next/link'
import { LOGO_SRC } from '@/lib/constants'

interface AdminAuthGateProps {
  emailInput: string
  setEmailInput: (val: string) => void
  passInput: string
  setPassInput: (val: string) => void
  authError: string
  signingIn: boolean
  handleSignIn: (e: React.FormEvent) => void
}

export default function AdminAuthGate({
  emailInput,
  setEmailInput,
  passInput,
  setPassInput,
  authError,
  signingIn,
  handleSignIn,
}: AdminAuthGateProps) {
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
              className="w-full px-4 py-3.5 rounded-xl text-base md:text-sm outline-none transition-colors"
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
              className="w-full px-4 py-3.5 rounded-xl text-base md:text-sm outline-none transition-colors"
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
