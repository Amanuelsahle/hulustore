export type Stage = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface Order {
  id: string        // tracking_id (HULU-XXXXXX)
  db_id?: string    // internal UUID from database
  customer: string
  phone: string
  title: string
  stage: Stage
  createdAt: string
  updatedAt?: string
  updatedAtRaw?: string
  telegram_chat_id?: string
}

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN'

export interface AdminUser {
  user_id: string
  email: string
  role: AdminRole
  created_at?: string
}
