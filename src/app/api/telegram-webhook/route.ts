import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tjbyiodwjictieysimwc.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: Request) {
  try {
    const update = await request.json()
    const botToken = process.env.TELEGRAM_BOT_TOKEN

    if (!update || !update.message) {
      return NextResponse.json({ ok: true, note: 'No message in update' })
    }

    const { message } = update
    const chatId = message.chat?.id
    const text = (message.text || '').trim()

    if (!chatId || !text) {
      return NextResponse.json({ ok: true })
    }

    // Extract tracking ID parameter from '/start HULU-XXXXXX' or directly 'HULU-XXXXXX'
    let trackingId = ''
    if (text.startsWith('/start')) {
      const parts = text.split(' ')
      if (parts.length > 1) {
        trackingId = parts[1].trim().toUpperCase()
      }
    } else if (text.toUpperCase().startsWith('HULU-')) {
      trackingId = text.toUpperCase()
    }

    let replyText = ''

    if (trackingId) {
      // Find the order in database
      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('tracking_id', trackingId)
        .single()

      if (error || !order) {
        replyText =
          `⚠️ <b>Order Not Found</b>\n\n` +
          `We couldn't find an order with Tracking ID <code>${trackingId}</code>.\n` +
          `Please check your tracking ID and try again, or track on our website: https://hulu-store.vercel.app/track`
      } else {
        // Link Telegram Chat ID to the order via RPC function
        const { error: updateErr } = await supabase.rpc('link_telegram_chat', {
          p_tracking_id: trackingId,
          p_chat_id: String(chatId),
        })

        if (updateErr) {
          console.error('Error linking telegram_chat_id:', updateErr)
          // Fallback to table update
          await supabase
            .from('orders')
            .update({ telegram_chat_id: String(chatId) })
            .eq('tracking_id', trackingId)
        }

        if (updateErr) {
          console.error('Error linking telegram_chat_id:', updateErr)
        }

        const stageNames = [
          'Processing',
          'Overseas Hub',
          'Arrived in Addis Ababa',
          'Out for Delivery 🚚',
          'Delivered ✅',
        ]
        const currentStage = stageNames[order.stage] || 'Processing'

        replyText =
          `✅ <b>Telegram Subscription Confirmed!</b>\n\n` +
          `Hello <b>${order.customer_name}</b>!\n` +
          `Your Telegram account is now connected to order <code>${order.tracking_id}</code>.\n\n` +
          `🛍️ <b>Items:</b> ${order.order_title}\n` +
          `📍 <b>Current Status:</b> ${currentStage}\n\n` +
          `🎉 We will send you an instant notification right here as soon as your order is <b>Out for Delivery</b>!`
      }
    } else {
      replyText =
        `👋 <b>Welcome to Hulu Store Delivery Bot!</b>\n\n` +
        `To subscribe to live delivery updates for your order:\n` +
        `1️⃣ Visit our tracking page on the website\n` +
        `2️⃣ Click the <b>Get Telegram Updates</b> button for your order\n\n` +
        `Or reply directly to this message with your Tracking ID (e.g. <code>HULU-8F2A9K</code>).`
    }

    // Send reply back to customer via Telegram API
    if (botToken && replyText) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: replyText,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('Error in telegram-webhook API route:', errorMsg)
    return NextResponse.json({ ok: true, error: errorMsg })
  }
}

// GET route to check webhook status, set webhook, or sync local updates
export async function GET(request: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const { searchParams } = new URL(request.url)
  const setUrl = searchParams.get('setUrl')
  const sync = searchParams.get('sync')

  if (!botToken) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN is not configured.' }, { status: 500 })
  }

  if (setUrl) {
    const targetWebhookUrl = `${setUrl}/api/telegram-webhook`
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook?url=${encodeURIComponent(targetWebhookUrl)}`
    )
    const data = await res.json()
    return NextResponse.json({ result: data, webhookUrl: targetWebhookUrl })
  }

  // Poll pending updates (useful for local dev when webhook is not publicly reachable)
  if (sync === 'true') {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`)
    const data = await res.json()
    let linkedCount = 0
    let maxUpdateId = -1

    if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
      for (const update of data.result) {
        // Track the highest update_id so we can acknowledge all updates at the end
        if (update.update_id > maxUpdateId) maxUpdateId = update.update_id

        const text = update.message?.text || ''
        const chatId = update.message?.chat?.id
        if (!chatId || !text) continue

        let trackingId = ''
        if (text.startsWith('/start')) {
          const parts = text.split(' ')
          if (parts.length > 1) trackingId = parts[1].trim().toUpperCase()
        } else if (text.toUpperCase().startsWith('HULU-')) {
          trackingId = text.toUpperCase()
        }

        if (trackingId) {
          // Check if this chat_id is NEW for this order (avoid re-sending confirmation)
          const { data: existing } = await supabase
            .from('orders')
            .select('telegram_chat_id')
            .eq('tracking_id', trackingId)
            .single()

          const isNewLink = !existing?.telegram_chat_id || existing.telegram_chat_id !== String(chatId)

          if (isNewLink) {
            const { error } = await supabase.rpc('link_telegram_chat', {
              p_tracking_id: trackingId,
              p_chat_id: String(chatId),
            })
            if (!error) {
              linkedCount++
              // Only send confirmation for genuinely new subscriptions
              await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: `✅ <b>Telegram Updates Active!</b>\n\nYour Telegram account is now connected to order <code>${trackingId}</code>. You will receive real-time notifications here when your item is <b>Out for Delivery</b> 🚚!`,
                  parse_mode: 'HTML',
                }),
              }).catch(() => {})
            }
          }
        }
      }

      // ✅ Acknowledge all updates so Telegram removes them from the queue permanently
      // This prevents the same updates from being processed again on next sync
      if (maxUpdateId >= 0) {
        await fetch(
          `https://api.telegram.org/bot${botToken}/getUpdates?offset=${maxUpdateId + 1}&limit=1`
        )
      }
    }

    return NextResponse.json({ success: true, linkedCount })
  }

  // Get current webhook info
  const res = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`)
  const data = await res.json()
  return NextResponse.json({ webhookInfo: data })
}
