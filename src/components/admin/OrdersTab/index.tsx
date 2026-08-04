"use client"

import type { Order, Stage } from '@/types'
import StatsOverview from './StatsOverview'
import NewOrderPanel from './NewOrderPanel'
import OrdersTable from './OrdersTable'

interface OrdersTabProps {
  orders: Order[]
  ordersLoading: boolean
  stageCounts: number[]
  customer: string
  setCustomer: (val: string) => void
  phone: string
  setPhone: (val: string) => void
  title: string
  setTitle: (val: string) => void
  submitting: boolean
  formError: string
  handleGenerate: (e: React.FormEvent) => void
  generatedId: string
  copiedId: boolean
  copiedLink: boolean
  handleCopyId: () => void
  handleCopyTelegramLink: (id?: string) => void
  getTelegramLink: (id: string) => string
  sortedOrders: Order[]
  filterStage: string
  setFilterStage: (val: string) => void
  sortField: 'id' | 'customer' | 'stage'
  sortDir: 'asc' | 'desc'
  toggleSort: (field: 'id' | 'customer' | 'stage') => void
  updatingStage: string | null
  handleStageChange: (order: Order, newStage: Stage) => void
  copiedRowId: string | null
  sendTelegramAlert: (order: Order) => void
  sendingTelegramId: string | null
  deleteConfirm: string | null
  setDeleteConfirm: (id: string | null) => void
  handleDeleteOrder: (order: Order) => void
}

export default function OrdersTab({
  orders,
  ordersLoading,
  stageCounts,
  customer,
  setCustomer,
  phone,
  setPhone,
  title,
  setTitle,
  submitting,
  formError,
  handleGenerate,
  generatedId,
  copiedId,
  copiedLink,
  handleCopyId,
  handleCopyTelegramLink,
  getTelegramLink,
  sortedOrders,
  filterStage,
  setFilterStage,
  sortField,
  sortDir,
  toggleSort,
  updatingStage,
  handleStageChange,
  copiedRowId,
  sendTelegramAlert,
  sendingTelegramId,
  deleteConfirm,
  setDeleteConfirm,
  handleDeleteOrder,
}: OrdersTabProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <StatsOverview stageCounts={stageCounts} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <NewOrderPanel
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
          handleCopyTelegramLink={() => handleCopyTelegramLink()}
          getTelegramLink={getTelegramLink}
        />

        <OrdersTable
          orders={orders}
          sortedOrders={sortedOrders}
          ordersLoading={ordersLoading}
          filterStage={filterStage}
          setFilterStage={setFilterStage}
          sortField={sortField}
          sortDir={sortDir}
          toggleSort={toggleSort}
          updatingStage={updatingStage}
          handleStageChange={handleStageChange}
          handleCopyTelegramLink={handleCopyTelegramLink}
          copiedRowId={copiedRowId}
          sendTelegramAlert={sendTelegramAlert}
          sendingTelegramId={sendingTelegramId}
          deleteConfirm={deleteConfirm}
          setDeleteConfirm={setDeleteConfirm}
          handleDeleteOrder={handleDeleteOrder}
        />
      </div>
    </div>
  )
}
