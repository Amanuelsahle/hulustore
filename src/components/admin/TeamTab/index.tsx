"use client"

import type { AdminUser, AdminRole } from '@/types'
import NewAdminPanel from './NewAdminPanel'
import AdminUsersTable from './AdminUsersTable'

interface TeamTabProps {
  adminUsers: AdminUser[]
  isSuperAdmin: boolean
  currentUserId: string
  currentUserEmail: string
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
  updatingRoleUserId: string | null
  handleRoleChange: (targetUserId: string, newRole: AdminRole) => void
  deleteAdminConfirm: AdminUser | null
  setDeleteAdminConfirm: (user: AdminUser | null) => void
  deletingAdminUserId: string | null
  handleDeleteAdmin: (targetUserId: string) => void
  fetchAdminUsers: () => void
}

export default function TeamTab({
  adminUsers,
  isSuperAdmin,
  currentUserId,
  currentUserEmail,
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
  updatingRoleUserId,
  handleRoleChange,
  deleteAdminConfirm,
  setDeleteAdminConfirm,
  deletingAdminUserId,
  handleDeleteAdmin,
  fetchAdminUsers,
}: TeamTabProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header info banner */}
      <div className="rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4" style={{ background: '#FFFFFF', border: '1.5px solid #EFECE6' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-bold text-lg" style={{ color: '#1E1B18' }}>Admin Team Management</h2>
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{
                background: isSuperAdmin ? '#FFF8E7' : '#EFF6FF',
                color: isSuperAdmin ? '#B45309' : '#1D4ED8',
                border: `1px solid ${isSuperAdmin ? '#FCD34D' : '#93C5FD'}`,
              }}
            >
              {isSuperAdmin ? '👑 Super Admin Mode' : '🛡️ Standard Admin View'}
            </span>
          </div>
          <p className="text-xs" style={{ color: '#7A746E' }}>
            {isSuperAdmin
              ? 'As a Super Admin, you can add new admin accounts, promote/demote user roles, and remove team members.'
              : 'You have Admin privileges. Only Super Admins can add new accounts, edit roles, or delete users.'}
          </p>
        </div>

        <button
          onClick={fetchAdminUsers}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          style={{ background: '#FAFAFA', border: '1.5px solid #EFECE6', color: '#1E1B18' }}
        >
          🔄 Refresh Team List
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <NewAdminPanel
          isSuperAdmin={isSuperAdmin}
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
        />

        <AdminUsersTable
          adminUsers={adminUsers}
          isSuperAdmin={isSuperAdmin}
          currentUserId={currentUserId}
          currentUserEmail={currentUserEmail}
          updatingRoleUserId={updatingRoleUserId}
          handleRoleChange={handleRoleChange}
          deleteAdminConfirm={deleteAdminConfirm}
          setDeleteAdminConfirm={setDeleteAdminConfirm}
          deletingAdminUserId={deletingAdminUserId}
          handleDeleteAdmin={handleDeleteAdmin}
        />
      </div>
    </div>
  )
}
