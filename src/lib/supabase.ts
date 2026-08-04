import { createClient } from '@supabase/supabase-js'
import type { Order, Stage, AdminRole } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tjbyiodwjictieysimwc.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const STAGE_TO_STATUS: Record<Stage, string> = {
  0: 'PROCESSING',
  1: 'USA_BRANCH',
  2: 'READY_FOR_SHIPMENT',
  3: 'IN_TRANSIT',
  4: 'ARRIVED_ADDIS',
  5: 'OUT_FOR_DELIVERY',
  6: 'DELIVERED',
}

export function formatRelativeDate(dateString?: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  const now = new Date()
  const dStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const nStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const diffMs = nStart.getTime() - dStart.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (diffDays === 0) {
    return `Today at ${timeStr}`
  } else if (diffDays === 1) {
    return `Yesterday at ${timeStr}`
  } else if (diffDays > 1 && diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }
}

export function mapDbToOrder(dbRow: {
  id?: string
  tracking_id: string
  customer_name: string
  customer_phone: string
  order_title: string
  stage: number
  created_at: string
  updated_at?: string
  telegram_chat_id?: string
}): Order {
  const dateObj = new Date(dbRow.created_at)
  const formattedDate = isNaN(dateObj.getTime())
    ? dbRow.created_at
    : dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  const rawUpdate = dbRow.updated_at || dbRow.created_at
  const formattedUpdate = formatRelativeDate(rawUpdate)

  return {
    id: dbRow.tracking_id,
    db_id: dbRow.id,
    customer: dbRow.customer_name,
    phone: dbRow.customer_phone,
    title: dbRow.order_title,
    stage: (dbRow.stage >= 0 && dbRow.stage <= 6 ? dbRow.stage : 0) as Stage,
    createdAt: formattedDate,
    updatedAt: formattedUpdate,
    updatedAtRaw: rawUpdate,
    telegram_chat_id: dbRow.telegram_chat_id || undefined,
  }
}

export async function getAdminUserRole(userId: string): Promise<AdminRole | null> {
  const { data, error } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null
  return data.role as AdminRole
}
