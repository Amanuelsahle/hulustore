"use client"

interface NewOrderPanelProps {
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
  handleCopyTelegramLink: () => void
  getTelegramLink: (id: string) => string
}

export default function NewOrderPanel({
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
}: NewOrderPanelProps) {
  return (
    <div
      className="lg:col-span-1 rounded-2xl p-6 self-start"
      style={{ background: '#FFFFFF', border: '1.5px solid #EFECE6' }}
    >
      <h2 className="font-bold text-lg mb-1" style={{ color: '#1E1B18' }}>New Order</h2>
      <p className="text-xs mb-6" style={{ color: '#7A746E' }}>Fill in customer details to generate a tracking ID.</p>

      <form onSubmit={handleGenerate} className="space-y-4">
        {[
          { label: 'Customer Name', value: customer, set: setCustomer, placeholder: 'Abebe Mulata' },
          { label: 'Phone Number', value: phone, set: setPhone, placeholder: '+251911234567' },
          { label: 'Order Title', value: title, set: setTitle, placeholder: '2x Shein Summer Dresses' },
        ].map((field) => (
          <div key={field.label}>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7A746E' }}>
              {field.label}
            </label>
            <input
              value={field.value}
              onChange={(e) => field.set(e.target.value)}
              placeholder={field.placeholder}
              required
              className="w-full px-3.5 py-3 rounded-xl text-base md:text-sm outline-none transition-colors"
              style={{
                background: '#FAFAFA',
                border: '1.5px solid #EFECE6',
                color: '#1E1B18',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#E8B8A2')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#EFECE6')}
            />
          </div>
        ))}

        {formError && (
          <p className="text-xs font-medium" style={{ color: '#E87A7A' }}>{formError}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="cta-btn w-full py-3.5 rounded-xl font-semibold text-sm mt-2"
          style={{ opacity: submitting ? 0.7 : 1 }}
        >
          {submitting ? 'Creating…' : 'Generate Order'}
        </button>
      </form>

      {/* Generated Order Details Box */}
      {generatedId && (
        <div
          className="mt-6 rounded-2xl p-5 transition-all space-y-4 shadow-sm"
          style={{ background: '#FFFFFF', border: '1.5px solid #E8B8A2' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md" style={{ background: '#F5DDD1', color: '#8A4B2A' }}>
              Order Created Successfully
            </span>
            <span className="text-[11px]" style={{ color: '#7A746E' }}>Ready to share</span>
          </div>

          {/* Tracking ID Section */}
          <div className="p-3.5 rounded-xl" style={{ background: '#FAFAFA', border: '1px solid #EFECE6' }}>
            <p className="text-[11px] font-semibold mb-1 tracking-wider uppercase" style={{ color: '#7A746E' }}>Order Tracking ID</p>
            <div className="flex items-center justify-between gap-2">
              <p
                className="text-lg font-bold"
                style={{ fontFamily: 'var(--font-mono)', color: '#1E1B18', letterSpacing: '0.06em' }}
              >
                {generatedId}
              </p>
              <button
                type="button"
                onClick={handleCopyId}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0"
                style={{
                  background: copiedId ? '#84A98C' : '#1E1B18',
                  color: '#FFFFFF',
                }}
              >
                {copiedId ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy ID
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Telegram Bot Subscription Link Section */}
          <div className="p-3.5 rounded-xl" style={{ background: '#F0F4F8', border: '1px solid #D2E3FC' }}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#2481CC">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.96 1.25-5.54 3.69-.52.36-1 .54-1.43.53-.47-.01-1.37-.27-2.04-.49-.82-.27-1.47-.42-1.42-.88.03-.24.38-.49 1.04-.75 4.09-1.78 6.82-2.95 8.19-3.52 3.9-1.63 4.71-1.91 5.24-1.92.12 0 .37.03.54.17.14.12.18.29.2.46-.01.07-.01.16-.02.26z" />
                </svg>
                <p className="text-[11px] font-bold tracking-wider uppercase" style={{ color: '#2481CC' }}>Telegram Bot Link</p>
              </div>
              <a
                href={getTelegramLink(generatedId)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1 shrink-0"
              >
                Open Link
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span
                className="text-xs truncate font-mono select-all px-2.5 py-1.5 rounded-lg flex-1 min-w-0"
                style={{ color: '#1E1B18', background: '#FFFFFF', border: '1px solid #D2E3FC' }}
                title={getTelegramLink(generatedId)}
              >
                {getTelegramLink(generatedId)}
              </span>
              <button
                type="button"
                onClick={handleCopyTelegramLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0"
                style={{
                  background: copiedLink ? '#84A98C' : '#2481CC',
                  color: '#FFFFFF',
                }}
              >
                {copiedLink ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copied Link!
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-center" style={{ color: '#7A746E' }}>
            Share the ID or Telegram subscription link with your customer to enable live delivery updates.
          </p>
        </div>
      )}
    </div>
  )
}
