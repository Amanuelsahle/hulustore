"use client"

import type { AdminRole } from '@/types'

interface NewAdminPanelProps {
  isSuperAdmin: boolean
  newAdminEmail: string
  setNewAdminEmail: (val: string) => void
  newAdminPassword: string
  setNewAdminPassword: (val: string) => void
  newAdminRole: AdminRole
  setNewAdminRole: (val: AdminRole) => void
  addingAdmin: boolean
  adminFormError: string
  adminSuccessMsg: string
  handleAddAdmin: (e: React.FormEvent) => void
}

export default function NewAdminPanel({
  isSuperAdmin,
  newAdminEmail,
  setNewAdminEmail,
  newAdminPassword,
  setNewAdminPassword,
  newAdminRole,
  setNewAdminRole,
  addingAdmin,
  adminFormError,
  adminSuccessMsg,
  handleAddAdmin,
}: NewAdminPanelProps) {
  if (!isSuperAdmin) {
    return (
      <div
        className="lg:col-span-1 rounded-2xl p-6 self-start text-center space-y-3"
        style={{ background: '#FFFFFF', border: '1.5px solid #EFECE6' }}
      >
        <span className="text-3xl">🔒</span>
        <h3 className="font-bold text-sm" style={{ color: '#1E1B18' }}>Restricted Privilege</h3>
        <p className="text-xs leading-relaxed" style={{ color: '#7A746E' }}>
          Only users with the <b>SUPER_ADMIN</b> role can create new admin accounts, edit existing roles, or remove users.
        </p>
      </div>
    )
  }

  return (
    <div
      className="lg:col-span-1 rounded-2xl p-6 self-start"
      style={{ background: '#FFFFFF', border: '1.5px solid #EFECE6' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">➕</span>
        <h3 className="font-bold text-md" style={{ color: '#1E1B18' }}>Add New Admin</h3>
      </div>
      <p className="text-xs mb-6" style={{ color: '#7A746E' }}>Insert email and assign an initial password for the new admin user.</p>

      <form onSubmit={handleAddAdmin} className="space-y-4">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A746E' }}>Admin Email</label>
          <input
            type="email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            placeholder="newadmin@hulustore.com"
            required
            className="w-full px-3.5 py-3 rounded-xl text-base md:text-sm outline-none transition-colors"
            style={{ background: '#FAFAFA', border: '1.5px solid #EFECE6', color: '#1E1B18' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#E8B8A2')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#EFECE6')}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A746E' }}>Assign Password</label>
          <input
            type="password"
            value={newAdminPassword}
            onChange={(e) => setNewAdminPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
            minLength={6}
            className="w-full px-3.5 py-3 rounded-xl text-base md:text-sm outline-none transition-colors"
            style={{ background: '#FAFAFA', border: '1.5px solid #EFECE6', color: '#1E1B18' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#E8B8A2')}
            onBlur={(e) => (e.currentTarget.style.borderColor = '#EFECE6')}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A746E' }}>Initial Role</label>
          <select
            value={newAdminRole}
            onChange={(e) => setNewAdminRole(e.target.value as AdminRole)}
            className="w-full px-3.5 py-3 rounded-xl text-sm outline-none cursor-pointer"
            style={{ background: '#FAFAFA', border: '1.5px solid #EFECE6', color: '#1E1B18' }}
          >
            <option value="ADMIN">🛡️ Admin (Standard)</option>
            <option value="SUPER_ADMIN">👑 Super Admin (Full Access)</option>
          </select>
        </div>

        {adminFormError && (
          <p className="text-xs font-medium" style={{ color: '#E87A7A' }}>{adminFormError}</p>
        )}

        {adminSuccessMsg && (
          <p className="text-xs font-medium text-green-700">{adminSuccessMsg}</p>
        )}

        <button
          type="submit"
          disabled={addingAdmin}
          className="cta-btn w-full py-3.5 rounded-xl font-semibold text-sm mt-2"
          style={{ opacity: addingAdmin ? 0.7 : 1 }}
        >
          {addingAdmin ? 'Creating User…' : 'Create Admin Account'}
        </button>
      </form>
    </div>
  )
}
