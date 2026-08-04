import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { buildStageUpdateMessage, sendTelegramApiMessage } from '@/lib/telegram-messages'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tjbyiodwjictieysimwc.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { trackingId, telegramChatId: bodyChatId, customMessage } = body

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    if (!botToken) {
      return NextResponse.json(
        { error: 'TELEGRAM_BOT_TOKEN is not configured on server.' },
        { status: 500 }
      )
    }

    if (!trackingId && !bodyChatId) {
      return NextResponse.json(
        { error: 'Missing trackingId or telegramChatId parameter.' },
        { status: 400 }
      )
    }

    let order = null
    if (trackingId) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('tracking_id', trackingId)
        .single()

      if (!error && data) {
        order = data
      }
    }

    const chatId = bodyChatId || order?.telegram_chat_id || process.env.TELEGRAM_DEFAULT_CHAT_ID

    if (!chatId) {
      return NextResponse.json({
        success: false,
        warning: 'No Telegram Chat ID linked to this order yet. The customer needs to click "Subscribe on Telegram" on the tracking page.',
        order,
      })
    }

    const messageText = customMessage || buildStageUpdateMessage({
      customerName: order?.customer_name,
      orderTitle: order?.order_title,
      customerPhone: order?.customer_phone,
      trackingId: trackingId || order?.tracking_id,
      stage: order?.stage,
    })

    // Send Telegram message via Telegram Bot API helper
    const telegramRes = await sendTelegramApiMessage(botToken, chatId, messageText)
    const telegramData = await telegramRes.json()

    if (!telegramData.ok) {
      console.warn('Telegram API response:', telegramData)
      let userFriendlyMsg = telegramData.description || 'Failed to send Telegram message.'
      if (telegramData.description?.includes('chat not found')) {
        userFriendlyMsg = `Telegram Chat ID (${chatId}) was not found. The customer must open @${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'hulustore_bot'} on Telegram and press START to enable notifications.`
      }

      return NextResponse.json({
        success: false,
        warning: userFriendlyMsg,
        telegramDetails: telegramData,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Telegram notification sent successfully!',
      chatId,
      result: telegramData.result,
    })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('Error in notify-telegram API route:', errorMsg)
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
