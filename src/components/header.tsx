"use client"

import Link from 'next/link'
import { LOGO_SRC } from '@/lib/constants'

interface HeaderProps {
    setPage?: (page: string, trackId?: string) => void
}

export default function Header({ setPage }: HeaderProps) {
    return (
        <nav
            className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4"
            style={{ background: 'rgba(250,250,250,0.88)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #EFECE6' }}
        >
            <Link
                href="/"
                onClick={(e) => {
                    if (setPage) {
                        e.preventDefault()
                        setPage('home')
                    }
                }}
                className="flex items-center gap-2"
            >
                <img src={LOGO_SRC} alt="Hulu Store logo" className="w-11 h-11 object-contain rounded-full" width={44} height={44} />
                <span className="font-bold text-lg tracking-tight" style={{ color: '#1E1B18' }}>Hulu Store</span>
            </Link>

            <div className="flex items-center gap-3">
                <Link
                    href="/track"
                    onClick={(e) => {
                        if (setPage) {
                            e.preventDefault()
                            setPage('track')
                        }
                    }}
                    className="cta-btn px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center"
                >
                    Track Order
                </Link>
                <Link
                    href="/admin"
                    onClick={(e) => {
                        if (setPage) {
                            e.preventDefault()
                            setPage('admin')
                        }
                    }}
                    className="text-sm font-medium px-4 py-2.5 rounded-xl transition-colors inline-block"
                    style={{ color: '#7A746E', border: '1px solid #EFECE6' }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#E8B8A2')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#EFECE6')}
                >
                    Admin
                </Link>
            </div>
        </nav>
    )
}
