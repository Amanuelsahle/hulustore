"use client"

import type { Order } from '@/types'

interface TelegramSubscribeCardProps {
  found: Order
}

export default function TelegramSubscribeCard({ found }: TelegramSubscribeCardProps) {
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'hulustore_bot'
  const telegramLink = `https://t.me/${botUsername}?start=${found.id}`

  return (
    <div
      className="mx-6 mb-6 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
      style={{
        background: found.telegram_chat_id ? '#F0F7F4' : '#F4F8FA',
        border: `1.5px solid ${found.telegram_chat_id ? '#C3D9C7' : '#D2E3FC'}`,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{
            background: found.telegram_chat_id ? '#2D5A36' : '#2481CC',
            color: '#FFFFFF',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2L2 11.5l6 2.5 11-8-8.5 9.5v5l3.5-3.5 5.5 4z" />
          </svg>
        </div>
        <div>
          <h4 className="text-xs font-bold" style={{ color: '#1E1B18' }}>
            {found.telegram_chat_id ? 'Telegram Updates Active' : 'Get Live Delivery Updates via Telegram'}
          </h4>
          <p className="text-xs leading-relaxed mt-0.5" style={{ color: '#5F6368' }}>
            {found.telegram_chat_id
              ? `Your order ${found.id} is connected to Telegram. You'll receive instant alerts when out for delivery!`
              : `Click below to start our Telegram bot and receive instant notification when your package is Out for Delivery.`}
          </p>
        </div>
      </div>

      <a
        href={telegramLink}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 shadow-sm hover:opacity-90"
        style={{
          background: found.telegram_chat_id ? '#FFFFFF' : '#2481CC',
          color: found.telegram_chat_id ? '#2D5A36' : '#FFFFFF',
          border: found.telegram_chat_id ? '1px solid #C3D9C7' : 'none',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.96 1.25-5.54 3.69-.52.36-1 .54-1.43.53-.47-.01-1.37-.27-2.04-.49-.82-.27-1.47-.42-1.42-.88.03-.24.38-.49 1.04-.75 4.09-1.78 6.82-2.95 8.19-3.52 3.9-1.63 4.71-1.91 5.24-1.92.12 0 .37.03.54.17.14.12.18.29.2.46-.01.07-.01.16-.02.26z" />
        </svg>
        {found.telegram_chat_id ? 'Reconnect Bot' : 'Subscribe on Telegram'}
      </a>
    </div>
  )
}
