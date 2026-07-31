const steps = [
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
        ),
        label: 'Send Shein Request',
        desc: 'Share your desired Shein items with us via Telegram or our order form.',
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 21 4s-2 0-3.5 1.5L14 9 5.8 7.2" />
                <path d="m9 3-2 2.5-3 .5 2 2 .5 3 2.5-2 3 2-.5-3 2-2.5-3-.5z" />
                <path d="M4.5 16.5 3 18" /><path d="m5 21 4-4" /><path d="m9 16.5-1.5 1.5" />
            </svg>
        ),
        label: 'Global Transit',
        desc: 'Items are purchased and received at our overseas hub, then shipped to Ethiopia.',
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
        label: 'Addis Hub',
        desc: 'Customs clearance and quality check upon arrival at our Addis Ababa branch.',
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="1" />
                <path d="M16 8h4l3 5v3h-7V8z" />
                <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
        ),
        label: 'Doorstep Delivery',
        desc: 'Local courier dispatches your package directly to any location across Addis.',
    },
]

export default function HowItWorks() {
    return (
        <section className="px-6 md:px-12 pb-28">
            <div className="max-w-5xl mx-auto">
                <div className="mb-12">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#E8B8A2' }}>Process</p>
                    <h2 className="text-3xl font-bold" style={{ color: '#1E1B18' }}>How It Works</h2>
                    <p className="mt-2 text-base" style={{ color: '#7A746E' }}>Four simple steps from Shein cart to your front door.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {steps.map((step, i) => (
                        <div
                            key={i}
                            className="relative p-6 rounded-2xl"
                            style={{ background: '#FFFFFF', border: '1.5px solid #EFECE6' }}
                        >
                            {/* Step number */}
                            <span
                                className="absolute top-5 right-5 text-xs font-semibold"
                                style={{ color: '#EFECE6', fontFamily: 'var(--font-mono)' }}
                            >
                                0{i + 1}
                            </span>

                            <div
                                className="flex items-center justify-center w-12 h-12 rounded-xl mb-5"
                                style={{ background: '#F5DDD1', color: '#1E1B18' }}
                            >
                                {step.icon}
                            </div>

                            <h3 className="font-bold text-base mb-2" style={{ color: '#1E1B18' }}>{step.label}</h3>
                            <p className="text-sm leading-relaxed" style={{ color: '#7A746E' }}>{step.desc}</p>

                            {/* Connector dot */}
                            {i < steps.length - 1 && (
                                <div
                                    className="hidden md:block absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full z-10"
                                    style={{ background: '#E8B8A2', border: '2px solid #FAFAFA' }}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
