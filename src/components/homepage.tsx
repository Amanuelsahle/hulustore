"use client"

import Link from 'next/link'
import Header from './header'
import Hero from './hero'
import HowItWorks from './how-it-works'
import Footer from './footer'

interface HomeProps {
    setPage?: (page: string, trackId?: string) => void
}

export default function Home({ setPage }: HomeProps) {
    return (
        <div className="min-h-screen flex flex-col justify-between" style={{ background: '#FAFAFA' }}>
            <div>
                {/* Nav / Header */}
                <Header setPage={setPage} />

                {/* Hero Section */}
                <Hero setPage={setPage} />

                {/* Process / How It Works */}
                <HowItWorks />

                {/* CTA Banner */}
                <section className="px-6 md:px-12 pb-24">
                    <div
                        className="max-w-5xl mx-auto rounded-2xl p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8"
                        style={{ background: '#1E1B18' }}
                    >
                        <div>
                            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Ready to place an order?</h3>
                            <p className="text-sm" style={{ color: '#7A746E' }}>Send us your Shein wishlist and we handle the rest.</p>
                        </div>
                        <div className="flex gap-3 flex-shrink-0">
                            <a
                                href="https://t.me/huluustoree"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="cta-btn px-6 py-3.5 rounded-xl font-semibold text-sm inline-flex items-center gap-2"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.96 1.25-5.54 3.69-.52.36-1 .54-1.43.53-.47-.01-1.37-.27-2.04-.49-.82-.27-1.47-.42-1.42-.88.03-.24.38-.49 1.04-.75 4.09-1.78 6.82-2.95 8.19-3.52 3.9-1.63 4.71-1.91 5.24-1.92.12 0 .37.03.54.17.14.12.18.29.2.46-.01.07-.01.16-.02.26z" />
                                </svg>
                                Telegram Us
                            </a>
                            <Link
                                href="/track"
                                onClick={(e) => {
                                    if (setPage) {
                                        e.preventDefault()
                                        setPage('track')
                                    }
                                }}
                                className="px-6 py-3.5 rounded-xl font-semibold text-sm transition-all inline-block"
                                style={{ border: '1.5px solid #3A3630', color: '#FAFAFA' }}
                                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#E8B8A2')}
                                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#3A3630')}
                            >
                                Track Order
                            </Link>
                        </div>
                    </div>
                </section>
            </div>

            {/* Footer */}
            <Footer />
        </div>
    )
}
