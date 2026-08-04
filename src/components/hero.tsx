"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface HeroProps {
    setPage?: (page: string, trackId?: string) => void
}

const CAROUSEL_IMAGES = [
    '/image/carousel/photo_2026-08-04_23-38-34.jpg',
    '/image/carousel/photo_2026-08-04_23-38-36.jpg',
    '/image/carousel/photo_2026-08-04_23-38-37 (2).jpg',
    '/image/carousel/photo_2026-08-04_23-38-37.jpg',
    '/image/carousel/photo_2026-08-04_23-38-38.jpg',
    '/image/carousel/photo_2026-08-04_23-38-39.jpg',
    '/image/carousel/photo_2026-08-04_23-38-40.jpg',
    '/image/carousel/photo_2026-08-04_23-38-41.jpg',
    '/image/carousel/photo_2026-08-04_23-38-42.jpg',
    '/image/carousel/photo_2026-08-04_23-38-47.jpg',
]

export default function Hero({ setPage }: HeroProps) {
    const [searchId, setSearchId] = useState('')
    const [carouselIndex, setCarouselIndex] = useState(0)
    const router = useRouter()

    useEffect(() => {
        const timer = setInterval(() => {
            setCarouselIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)
        }, 4000)
        return () => clearInterval(timer)
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchId.trim()) {
            const id = searchId.trim().toUpperCase()
            if (setPage) {
                setPage('track', id)
            } else {
                router.push(`/track?id=${encodeURIComponent(id)}`)
            }
        }
    }

    return (
        <section className="relative overflow-hidden" style={{ minHeight: '88vh' }}>
            {/* Split layout: left text, right image */}
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ minHeight: '88vh' }}>

                {/* LEFT — text content */}
                <div
                    className="relative flex flex-col justify-center px-8 md:px-14 py-20 z-10"
                    style={{
                        background: 'linear-gradient(135deg, #FAFAFA 70%, rgba(245,221,209,0.4) 100%)',
                    }}
                >
                    {/* Subtle warm blob */}
                    <div
                        className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none"
                        style={{
                            background: 'radial-gradient(ellipse at bottom left, rgba(232,184,162,0.22) 0%, transparent 70%)',
                        }}
                    />

                    <div className="relative">
                        {/* Badge */}
                        <div
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-8"
                            style={{ background: '#F5DDD1', color: '#1E1B18' }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#E8B8A2' }} />
                            Addis Ababa
                        </div>

                        <h1
                            className="font-extrabold leading-[1.06] tracking-tight mb-6"
                            style={{ color: '#1E1B18', fontSize: 'clamp(2.4rem, 4vw, 3.6rem)' }}
                        >
                            Shop Shein.{' '}
                            <span style={{ color: '#E8B8A2' }}>Delivered Direct</span>{' '}
                            to Your Door in Addis Ababa.
                        </h1>

                        <p className="text-base mb-10 max-w-md" style={{ color: '#7A746E', lineHeight: '1.75' }}>
                            We source, ship, and deliver your Shein orders from our international
                            hub straight to your doorstep — no middlemen, no hassle, fully tracked.
                        </p>

                        {/* Hero search */}
                        <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
                            <input
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                placeholder="e.g. HULU-8F2b9c"
                                className="flex-1 px-4 py-3.5 rounded-xl text-base md:text-sm outline-none"
                                style={{
                                    background: '#FFFFFF',
                                    border: '1.5px solid #EFECE6',
                                    fontFamily: 'var(--font-mono)',
                                    color: '#1E1B18',
                                    boxShadow: '0 2px 8px rgba(30,27,24,0.06)',
                                }}
                                onFocus={(e) => (e.currentTarget.style.borderColor = '#E8B8A2')}
                                onBlur={(e) => (e.currentTarget.style.borderColor = '#EFECE6')}
                            />
                            <button type="submit" className="cta-btn px-5 py-3.5 rounded-xl text-sm font-semibold whitespace-nowrap">
                                Track
                            </button>
                        </form>

                        {/* Trust badges */}
                        <div className="flex flex-wrap gap-8 mt-10 pt-8" style={{ borderTop: '1px solid #EFECE6' }}>
                            {[
                                { n: '2,400+', label: 'Orders Delivered' },
                                { n: '4.9★', label: 'Customer Rating' },
                                { n: '14 days', label: 'Avg. Delivery' },
                            ].map((b) => (
                                <div key={b.label} className="flex flex-col">
                                    <span className="text-2xl font-bold" style={{ color: '#1E1B18' }}>{b.n}</span>
                                    <span className="text-xs mt-0.5" style={{ color: '#7A746E' }}>{b.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT — auto-advancing carousel + overlays */}
                <div className="relative overflow-hidden" style={{ minHeight: '420px' }}>
                    {/* Carousel images — crossfade */}
                    {CAROUSEL_IMAGES.map((src, idx) => (
                        <img
                            key={src}
                            src={src}
                            alt={`Hulu Store showcase image ${idx + 1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{
                                opacity: idx === carouselIndex ? 1 : 0,
                                transition: 'opacity 1s ease-in-out',
                                animation: idx === carouselIndex ? 'hero-kenburns 18s ease-in-out infinite alternate' : 'none',
                            }}
                        />
                    ))}

                    {/* Warm gradient overlay */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(to right, rgba(250,250,250,0.35) 0%, transparent 30%), linear-gradient(to top, rgba(30,27,24,0.55) 0%, transparent 55%)',
                        }}
                    />

                    {/* Peach tonal wash */}
                    <div
                        className="absolute inset-0"
                        style={{ background: 'rgba(232,184,162,0.08)', mixBlendMode: 'multiply' }}
                    />

                    {/* Floating order card */}
                    <div
                        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64 rounded-2xl px-5 py-4"
                        style={{
                            background: 'rgba(255,255,255,0.92)',
                            backdropFilter: 'blur(16px)',
                            boxShadow: '0 16px 48px rgba(30,27,24,0.18)',
                            border: '1px solid rgba(239,236,230,0.8)',
                            animation: 'card-float 4s ease-in-out infinite',
                        }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: '#F5DDD1' }}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E8B8A2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="1" y="3" width="15" height="13" rx="1" />
                                    <path d="M16 8h4l3 5v3h-7V8z" />
                                    <circle cx="5.5" cy="18.5" r="2.5" />
                                    <circle cx="18.5" cy="18.5" r="2.5" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-semibold" style={{ color: '#1E1B18' }}>Out for Delivery</p>
                                <p className="text-xs" style={{ color: '#7A746E', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>HULU-8F2A9K</p>
                            </div>
                            <span
                                className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{ background: '#F5DDD1', color: '#1E1B18' }}
                            >
                                Live
                            </span>
                        </div>
                        {/* Mini progress bar */}
                        <div className="w-full rounded-full h-1.5" style={{ background: '#EFECE6' }}>
                            <div
                                className="h-1.5 rounded-full"
                                style={{ width: '75%', background: '#E8B8A2', transition: 'width 1s ease' }}
                            />
                        </div>
                        <div className="flex justify-between mt-1.5 text-xs" style={{ color: '#B8B3AE' }}>
                            <span>Ordered</span>
                            <span style={{ color: '#E8B8A2', fontWeight: 600 }}>En route</span>
                            <span>Delivered</span>
                        </div>
                    </div>

                    {/* Second floating badge — top right */}
                    <div
                        className="absolute top-8 right-6 rounded-xl px-4 py-3 flex items-center gap-2.5"
                        style={{
                            background: 'rgba(255,255,255,0.88)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 8px 24px rgba(30,27,24,0.12)',
                            border: '1px solid rgba(239,236,230,0.8)',
                            animation: 'badge-float 4s ease-in-out 1.5s infinite',
                        }}
                    >
                        <div
                            className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: '#C3D9C7' }}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2D5A36" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-semibold" style={{ color: '#1E1B18' }}>Delivered!</p>
                            <p className="text-xs" style={{ color: '#7A746E' }}>Tigist H. · Bole</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
