export type Stage = 0 | 1 | 2 | 3 | 4

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
