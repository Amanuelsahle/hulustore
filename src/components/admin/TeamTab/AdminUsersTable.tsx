"use client"

import type { AdminUser, AdminRole } from '@/types'

interface AdminUsersTableProps {
  adminUsers: AdminUser[]
  isSuperAdmin: boolean
  currentUserId: string
  currentUserEmail: string
  updatingRoleUserId: string | null
  handleRoleChange: (targetUserId: string, newRole: AdminRole) => void
  deleteAdminConfirm: AdminUser | null
  setDeleteAdminConfirm: (user: AdminUser | null) => void
  deletingAdminUserId: string | null
  handleDeleteAdmin: (targetUserId: string) => void
}

export default function AdminUsersTable({
  adminUsers,
  isSuperAdmin,
  currentUserId,
  currentUserEmail,
  updatingRoleUserId,
  handleRoleChange,
  deleteAdminConfirm,
  setDeleteAdminConfirm,
  deletingAdminUserId,
  handleDeleteAdmin,
}: AdminUsersTableProps) {
  return (
    <div
      className="lg:col-span-2 rounded-2xl p-6"
      style={{ background: '#FFFFFF', border: '1.5px solid #EFECE6' }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-lg" style={{ color: '#1E1B18' }}>Registered Admin Accounts</h3>
          <p className="text-xs mt-0.5" style={{ color: '#7A746E' }}>{adminUsers.length} total user(s) in system</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ borderBottom: '1.5px solid #EFECE6' }}>
              <th className="pb-3 text-xs font-semibold" style={{ color: '#7A746E' }}>User Email</th>
              <th className="pb-3 text-xs font-semibold" style={{ color: '#7A746E' }}>Role</th>
              <th className="pb-3 text-xs font-semibold" style={{ color: '#7A746E' }}>Created</th>
              <th className="pb-3 text-xs font-semibold text-right" style={{ color: '#7A746E' }}>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: '#EFECE6' }}>
            {adminUsers.map((user) => {
              const isSelf = user.user_id === currentUserId || user.email.toLowerCase() === currentUserEmail.toLowerCase()

              return (
                <tr key={user.user_id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 text-xs font-medium" style={{ color: '#1E1B18' }}>
                    <div className="flex items-center gap-2">
                      <span>{user.email}</span>
                      {isSelf && (
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">You</span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 text-xs">
                    {isSuperAdmin ? (
                      <select
                        value={user.role}
                        disabled={updatingRoleUserId === user.user_id || (isSelf && user.role === 'SUPER_ADMIN')}
                        onChange={(e) => handleRoleChange(user.user_id, e.target.value as AdminRole)}
                        className="px-2.5 py-1.5 rounded-lg text-xs outline-none cursor-pointer font-bold border-none"
                        style={{
                          background: user.role === 'SUPER_ADMIN' ? '#FFF8E7' : '#EFF6FF',
                          color: user.role === 'SUPER_ADMIN' ? '#B45309' : '#1D4ED8',
                          opacity: updatingRoleUserId === user.user_id ? 0.5 : 1,
                        }}
                      >
                        <option value="ADMIN">🛡️ Admin</option>
                        <option value="SUPER_ADMIN">👑 Super Admin</option>
                      </select>
                    ) : (
                      <span
                        className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                        style={{
                          background: user.role === 'SUPER_ADMIN' ? '#FFF8E7' : '#EFF6FF',
                          color: user.role === 'SUPER_ADMIN' ? '#B45309' : '#1D4ED8',
                        }}
                      >
                        {user.role === 'SUPER_ADMIN' ? '👑 Super Admin' : '🛡️ Admin'}
                      </span>
                    )}
                  </td>

                  <td className="py-4 text-xs font-mono" style={{ color: '#7A746E' }}>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                  </td>

                  <td className="py-4 text-xs text-right">
                    {isSuperAdmin ? (
                      deleteAdminConfirm?.user_id === user.user_id ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleDeleteAdmin(user.user_id)}
                            disabled={deletingAdminUserId === user.user_id}
                            className="px-2.5 py-1 bg-red-600 text-white rounded text-[11px] font-semibold"
                          >
                            {deletingAdminUserId === user.user_id ? 'Deleting…' : 'Confirm Delete'}
                          </button>
                          <button
                            onClick={() => setDeleteAdminConfirm(null)}
                            className="px-2.5 py-1 bg-gray-200 text-gray-700 rounded text-[11px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteAdminConfirm(user)}
                          disabled={isSelf}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={isSelf ? 'Cannot delete your own account' : 'Delete User Account'}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )
                    ) : (
                      <span className="text-[11px]" style={{ color: '#B8B3AE' }}>Read Only</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
