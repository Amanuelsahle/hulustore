"use client"

import { LOGO_SRC } from '@/lib/constants'

export default function Footer() {
    return (
        <footer className="px-6 md:px-12 py-8" style={{ borderTop: '1px solid #EFECE6' }}>
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 font-semibold text-sm" style={{ color: '#1E1B18' }}>
                    <img src={LOGO_SRC} alt="Hulu Store logo" className="w-8 h-8 object-contain rounded-full" />
                    Hulu Store
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href="https://t.me/huluustore"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                        style={{ color: '#7A746E', background: '#F5F3EF', border: '1px solid #EFECE6' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#1E1B18'
                            e.currentTarget.style.borderColor = '#E8B8A2'
                            e.currentTarget.style.background = '#F5DDD1'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#7A746E'
                            e.currentTarget.style.borderColor = '#EFECE6'
                            e.currentTarget.style.background = '#F5F3EF'
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.96 1.25-5.54 3.69-.52.36-1 .54-1.43.53-.47-.01-1.37-.27-2.04-.49-.82-.27-1.47-.42-1.42-.88.03-.24.38-.49 1.04-.75 4.09-1.78 6.82-2.95 8.19-3.52 3.9-1.63 4.71-1.91 5.24-1.92.12 0 .37.03.54.17.14.12.18.29.2.46-.01.07-.01.16-.02.26z" />
                        </svg>
                        Telegram
                    </a>

                    <a
                        href="https://www.tiktok.com/@hulu_store"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all"
                        style={{ color: '#7A746E', background: '#F5F3EF', border: '1px solid #EFECE6' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#1E1B18'
                            e.currentTarget.style.borderColor = '#E8B8A2'
                            e.currentTarget.style.background = '#F5DDD1'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#7A746E'
                            e.currentTarget.style.borderColor = '#EFECE6'
                            e.currentTarget.style.background = '#F5F3EF'
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-2.82V7.64a6.35 6.35 0 0 0-5.11 6.2 6.34 6.34 0 0 0 10.78 4.54 6.3 6.3 0 0 0 1.68-4.42V8.83a8.31 8.31 0 0 0 4.76 1.48V6.86a4.83 4.83 0 0 1-1.99-.17z" />
                        </svg>
                        TikTok
                    </a>
                </div>

                <p className="text-xs" style={{ color: '#7A746E' }}>© 2024 Hulu Store. Addis Ababa, Ethiopia.</p>
            </div>
        </footer>
    )
}
