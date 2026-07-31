"use client"

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Order } from '@/types'
import { supabase, mapDbToOrder } from '@/lib/supabase'

interface OrdersContextValue {
  orders: Order[]
  setOrders: (orders: Order[]) => void
  refreshOrders: () => Promise<void>
  ready: boolean
}

const OrdersContext = createContext<OrdersContextValue | null>(null)

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrdersState] = useState<Order[]>([])
  const [ready, setReady] = useState(false)

  const refreshOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching orders:', error)
        return
      }

      if (data) {
        setOrdersState(data.map(mapDbToOrder))
      }
    } catch (err) {
      console.error('Unexpected error fetching orders:', err)
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    refreshOrders()
  }, [refreshOrders])

  function setOrders(next: Order[]) {
    setOrdersState(next)
  }

  return (
    <OrdersContext.Provider value={{ orders, setOrders, refreshOrders, ready }}>
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider')
  return ctx
}
