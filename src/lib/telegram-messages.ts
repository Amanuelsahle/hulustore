/**
 * Telegram Message Templates & Helper Utilities for Hulu Store
 * 
 * Centralizes all Telegram message formatting and template logic into clean,
 * modular, and re-usable functions.
 */

export interface OrderNotificationDetails {
  customerName?: string
  orderTitle?: string
  customerPhone?: string
  trackingId?: string
  stage?: number
}

export interface StageDetail {
  title: string
  subtext: string
  icon: string
  label: string
}

/**
 * Standard delivery stages and their messaging content for Telegram notifications.
 */
export const STAGE_DETAILS: Record<number, StageDetail> = {
  0: {
    title: 'Order Received and Processing',
    subtext: 'Your order has been confirmed and is being prepared for overseas shipping.',
    icon: '📦',
    label: 'Order Received and Processing',
  },
  1: {
    title: 'Overseas Branch Transit',
    subtext: 'Your order has been received at our <b>HULU USA Branch</b> 🇺🇸. Our team is now preparing it for international shipment. You will receive real-time notifications here as your order progresses.',
    icon: '✈️',
    label: 'Overseas Hub',
  },
  2: {
    title: 'Arrived in Addis Ababa',
    subtext: 'Your order has arrived at the <b>HULU Ethiopia Branch</b> 🇪🇹 and is being processed for final delivery. You will receive another notification once it is out for delivery.',
    icon: '🏢',
    label: 'Arrived in Addis Ababa',
  },
  3: {
    title: 'Out For Delivery',
    subtext: 'Your order is now out for delivery🚚. Our delivery team is on the way and your package will be with you soon. Please keep your phone nearby in case we need to contact you.',
    icon: '🚚',
    label: 'Out for Delivery 🚚',
  },
  4: {
    title: 'Order Delivered',
    subtext: 'Your order has been successfully delivered. Thank you for choosing HULU Store! We hope you enjoy your purchase. If you have any questions or feedback, we are always here to help. 💙',
    icon: '✅',
    label: 'Delivered ✅',
  },
}

/**
 * Get stage detail object for a given stage number, falling back to stage 0 if invalid.
 */
export function getStageDetail(stage: number = 0): StageDetail {
  return STAGE_DETAILS[stage] || STAGE_DETAILS[0]
}

/**
 * Message template sent when notifying customer of an order status update or manual alert.
 */
export function buildStageUpdateMessage(details: OrderNotificationDetails): string {
  const customerName = details.customerName || 'Customer'
  const orderTitle = details.orderTitle || 'Your Shein Package'
  const customerPhone = details.customerPhone || 'N/A'
  const tId = details.trackingId || 'HULU-STORE'
  const stageInfo = getStageDetail(details.stage ?? 0)

  return (
    `${stageInfo.icon} <b>Hulu Store - ${stageInfo.title}!</b> ${stageInfo.icon}\n\n` +
    `Hello <b>${customerName}</b>!\n` +
    `${stageInfo.subtext}\n\n` +
    `📦 <b>Tracking ID:</b> <code>${tId}</code>\n` +
    `🛍️ <b>Items:</b> ${orderTitle}\n` +
    `📞 <b>Contact:</b> ${customerPhone}\n\n` +
    `🔗 Track updates live: <a href="https://hulustore.vercel.app/track?id=${tId}">View Track Status</a>`
  )
}

/**
 * Message template sent when customer links their Telegram account to an order.
 */
export function buildSubscriptionConfirmedMessage(order: {
  customer_name?: string
  tracking_id: string
  order_title?: string
  stage?: number
}): string {
  const customerName = order.customer_name || 'Customer'
  const orderTitle = order.order_title || 'Your Shein Package'
  const stageInfo = getStageDetail(order.stage ?? 0)

  return (
    `✅ <b>Telegram Subscription Confirmed!</b>\n\n` +
    `Hello <b>${customerName}</b>!\n` +
    `Your Telegram account is now connected to order <code>${order.tracking_id}</code>.\n\n` +
    `🛍️ <b>Items:</b> ${orderTitle}\n` +
    `📍 <b>Current Status:</b> ${stageInfo.label}\n\n` +
    `🎉 We will send you an instant notification right here when your item <b>delivery status changes</b>!`
  )
}

/**
 * Message template sent when the tracking ID provided by user is not found.
 */
export function buildOrderNotFoundMessage(trackingId: string): string {
  return (
    `⚠️ <b>Order Not Found</b>\n\n` +
    `We couldn't find an order with Tracking ID <code>${trackingId}</code>.\n` +
    `Please check your tracking ID and try again, or track on our website: https://hulustore.vercel.app/track`
  )
}

/**
 * Welcome message template sent when user starts a conversation with the Telegram bot.
 */
export function buildWelcomeMessage(): string {
  return (
    `👋 <b>Welcome to Hulu Store Delivery Bot!</b>\n\n` +
    `To subscribe to live delivery updates for your order:\n` +
    `1️⃣ Visit our tracking page on the website\n` +
    `2️⃣ Click the <b>Get Telegram Updates</b> button for your order\n\n` +
    `Or reply directly to this message with your Tracking ID (e.g. <code>HULU-8F2A9K</code>).`
  )
}

/**
 * Quick confirmation message template sent when synced via background process.
 */
export function buildUpdatesActiveMessage(trackingId: string): string {
  return (
    `✅ <b>Telegram Updates Active!</b>\n\n` +
    `Your Telegram account is now connected to order <code>${trackingId}</code>. ` +
    `You will receive real-time notifications here when your item is <b>Out for Delivery</b> 🚚!`
  )
}

/**
 * Helper function to send a message via Telegram Bot API.
 */
export async function sendTelegramApiMessage(
  botToken: string,
  chatId: string | number,
  text: string,
  options: { parseMode?: 'HTML' | 'Markdown'; disableWebPagePreview?: boolean } = {}
) {
  const { parseMode = 'HTML', disableWebPagePreview = false } = options
  return fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: disableWebPagePreview,
    }),
  })
}
