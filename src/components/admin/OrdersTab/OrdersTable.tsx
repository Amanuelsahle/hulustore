"use client"

import type { Order, Stage } from '@/types'
import { STAGE_LABELS } from '@/lib/constants'

interface OrdersTableProps {
  orders: Order[]
  sortedOrders: Order[]
  ordersLoading: boolean
  filterStage: string
  setFilterStage: (val: string) => void
  sortField: 'id' | 'customer' | 'stage'
  sortDir: 'asc' | 'desc'
  toggleSort: (field: 'id' | 'customer' | 'stage') => void
  updatingStage: string | null
  handleStageChange: (order: Order, newStage: Stage) => void
  handleCopyTelegramLink: (id?: string) => void
  copiedRowId: string | null
  sendTelegramAlert: (order: Order) => void
  sendingTelegramId: string | null
  deleteConfirm: string | null
  setDeleteConfirm: (id: string | null) => void
  handleDeleteOrder: (order: Order) => void
}

export default function OrdersTable({
  orders,
  sortedOrders,
  ordersLoading,
  filterStage,
  setFilterStage,
  sortField,
  sortDir,
  toggleSort,
  updatingStage,
  handleStageChange,
  handleCopyTelegramLink,
  copiedRowId,
  sendTelegramAlert,
  sendingTelegramId,
  deleteConfirm,
  setDeleteConfirm,
  handleDeleteOrder,
}: OrdersTableProps) {
  const SortIcon = ({ field }: { field: string }) => (
    <span style={{ color: sortField === field ? '#E8B8A2' : '#B8B3AE', fontSize: 11, marginLeft: 4 }}>
      {sortField === field ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  )

  return (
    <div className="lg:col-span-2">
      <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
        <div>
          <h2 className="font-bold text-lg" style={{ color: '#1E1B18' }}>All Orders</h2>
          <p className="text-xs" style={{ color: '#7A746E' }}>Showing {sortedOrders.length} of {orders.length} total orders</p>
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
        {/* Table Header (Desktop/Tablet Only) */}
        <div className="hidden md:block overflow-x-auto">
          <div
            className="grid text-xs font-semibold uppercase tracking-wider px-5 py-3.5 min-w-[640px]"
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
        </div>

        {/* Table Content (Visible on all screen sizes) */}
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

          {!ordersLoading && sortedOrders.length === 0 && (
            <div className="px-5 py-12 text-center text-sm" style={{ color: '#B8B3AE' }}>
              No orders match the current filter.
            </div>
          )}

          {!ordersLoading && sortedOrders.map((order, i) => (
            <div
              key={order.id}
              className="transition-colors"
              style={{
                borderBottom: i < sortedOrders.length - 1 ? '1px solid #EFECE6' : 'none',
              }}
            >
              {/* Desktop Row (md+) */}
              <div className="hidden md:block overflow-x-auto">
                <div
                  className="grid items-center px-5 py-4 text-sm transition-colors min-w-[640px]"
                  style={{
                    gridTemplateColumns: '1.2fr 1.2fr 1fr 1.4fr auto',
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
                        background: order.stage === STAGE_LABELS.length - 1 ? '#C3D9C7' : order.stage >= 2 ? '#F5DDD1' : '#EFECE6',
                        color: order.stage === STAGE_LABELS.length - 1 ? '#2D5A36' : '#1E1B18',
                        width: '100%',
                        maxWidth: '175px',
                        opacity: updatingStage === order.id ? 0.5 : 1,
                      }}
                    >
                      {STAGE_LABELS.map((l, idx) => (
                        <option key={idx} value={idx}>{l}</option>
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
                          onClick={() => handleDeleteOrder(order)}
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
              </div>

              {/* Mobile Card Row (< md) */}
              <div className="block md:hidden p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className="font-semibold text-xs block"
                      style={{ fontFamily: 'var(--font-mono)', color: '#1E1B18', letterSpacing: '0.04em' }}
                    >
                      {order.id}
                    </span>
                    <span className="text-[11px] block text-gray-600 mt-0.5">
                      {order.title}
                    </span>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleCopyTelegramLink(order.id)}
                      className="p-2 rounded-lg transition-all hover:bg-blue-50"
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
                      className="p-2 rounded-lg transition-all hover:bg-blue-50"
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
                          onClick={() => handleDeleteOrder(order)}
                          className="text-xs px-2.5 py-1 rounded-md font-semibold text-white"
                          style={{ background: '#E87A7A' }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs px-2 py-1 rounded-md"
                          style={{ color: '#7A746E' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(order.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500"
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

                <div className="flex items-center justify-between text-xs pt-1">
                  <div>
                    <p className="font-medium text-gray-900">{order.customer}</p>
                    <p className="text-[11px] text-gray-500 font-mono">{order.phone}</p>
                  </div>
                  <span className="text-[11px] text-gray-400">{order.createdAt}</span>
                </div>

                <div className="pt-1">
                  <select
                    value={order.stage}
                    disabled={updatingStage === order.id}
                    onChange={(e) => handleStageChange(order, Number(e.target.value) as Stage)}
                    className="w-full px-3 py-2 rounded-lg text-xs outline-none cursor-pointer font-semibold border-none"
                    style={{
                      background: order.stage === STAGE_LABELS.length - 1 ? '#C3D9C7' : order.stage >= 2 ? '#F5DDD1' : '#EFECE6',
                      color: order.stage === STAGE_LABELS.length - 1 ? '#2D5A36' : '#1E1B18',
                      opacity: updatingStage === order.id ? 0.5 : 1,
                    }}
                  >
                    {STAGE_LABELS.map((l, idx) => (
                      <option key={idx} value={idx}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
