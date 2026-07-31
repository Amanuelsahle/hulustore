import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    const customerName = order?.customer_name || 'Customer'
    const orderTitle = order?.order_title || 'Your Shein Package'
    const customerPhone = order?.customer_phone || 'N/A'
    const tId = trackingId || order?.tracking_id || 'HULU-STORE'
    const stage = order?.stage ?? 0

    const STAGE_DETAILS: Record<number, { title: string; subtext: string; icon: string }> = {
      0: {
        title: 'Order Processing',
        subtext: 'Your order has been confirmed and is being prepared for overseas shipping.',
        icon: '📦',
      },
      1: {
        title: 'Overseas Branch Transit',
        subtext: 'Your package is in transit from our overseas procurement hub.',
        icon: '✈️',
      },
      2: {
        title: 'Arrived in Addis Ababa',
        subtext: 'Your package has cleared customs and is at our Addis Ababa warehouse.',
        icon: '🏢',
      },
      3: {
        title: 'Out For Delivery',
        subtext: 'Great news! Our local courier is on the way with your package.',
        icon: '🚚',
      },
      4: {
        title: 'Order Delivered',
        subtext: 'Your order has been successfully delivered. Thank you for shopping with Hulu Store!',
        icon: '✅',
      },
    }

    const currentStage = STAGE_DETAILS[stage] || STAGE_DETAILS[0]

    // Format rich HTML message for Telegram based on current stage
    const defaultText =
      `${currentStage.icon} <b>Hulu Store - ${currentStage.title}!</b> ${currentStage.icon}\n\n` +
      `Hello <b>${customerName}</b>!\n` +
      `${currentStage.subtext}\n\n` +
      `📦 <b>Tracking ID:</b> <code>${tId}</code>\n` +
      `🛍️ <b>Items:</b> ${orderTitle}\n` +
      `📞 <b>Contact:</b> ${customerPhone}\n\n` +
      `🔗 Track updates live: <a href="https://hulu-store.vercel.app/track?id=${tId}">View Track Status</a>`

    const messageText = customMessage || defaultText

    // Send Telegram message via Telegram Bot API
    const telegramRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: 'HTML',
          disable_web_page_preview: false,
        }),
      }
    )

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
