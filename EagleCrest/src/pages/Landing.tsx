import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

// ─── data ─────────────────────────────────────────────────────────────────────

const features = [
  { icon: 'ti-chart-pie',      title: 'Real-Time Analytics',    desc: 'Visualise every dollar — cash flow, spending breakdowns, and trends at a glance.' },
  { icon: 'ti-credit-card',    title: 'Virtual & Physical Cards', desc: 'Issue cards instantly. Set spending limits, freeze, or unfreeze in seconds.' },
  { icon: 'ti-pig',            title: 'Smart Savings Goals',     desc: 'Create goals for anything and watch your progress grow automatically.' },
  { icon: 'ti-send',           title: 'Instant Transfers',       desc: 'Send money to anyone on your recipients list — securely and in real time.' },
  { icon: 'ti-report-money',   title: 'Loan Management',         desc: 'Apply for personal, auto, or mortgage loans and track repayments in one place.' },
  { icon: 'ti-shield-check',   title: 'Bank-Grade Security',     desc: '256-bit encryption, 2FA, biometric auth, and live transaction alerts built in.' },
]

const cardProducts = [
  {
    id: 'standard',
    label: 'Standard',
    color: '#1a1a2e',
    accentColor: '#C9A84C',
    network: 'Visa',
    tag: 'No Annual Fee',
    perks: ['Contactless payments', 'Online & in-store', '$500–$5,000 limit', 'Instant virtual card'],
  },
  {
    id: 'premium',
    label: 'Premium',
    color: '#0a1628',
    accentColor: '#C9A84C',
    network: 'Mastercard',
    tag: 'Most Popular',
    perks: ['Travel rewards 2×', 'Priority support', '$5,000–$25,000 limit', 'Metal card option'],
  },
  {
    id: 'virtual',
    label: 'Virtual',
    color: '#111',
    accentColor: '#5B9BD5',
    network: 'Visa',
    tag: 'Digital-First',
    perks: ['Instant activation', 'Online purchases', 'No physical card', 'Disposable numbers'],
  },
]

const accountTypes = [
  {
    icon: 'ti-building-bank',
    label: 'Everyday Checking',
    color: '#5B9BD5',
    desc: 'A full-featured checking account for daily spending, transfers, and bill payments with no minimum balance.',
    features: ['No monthly fees', 'Unlimited transfers', 'Debit card included', 'Mobile cheque deposit'],
  },
  {
    icon: 'ti-pig',
    label: 'High-Yield Savings',
    color: '#22c55e',
    desc: 'Earn a competitive APY on every dollar saved. Perfect for emergency funds, short-term goals, or growing wealth.',
    features: ['4.25% APY', 'Automatic round-ups', 'Goal tracking', 'No withdrawal fees'],
  },
  {
    icon: 'ti-diamond',
    label: 'Private Wealth',
    color: '#C9A84C',
    desc: 'Our flagship account for clients who demand more. Dedicated advisors, premium rates, and white-glove service.',
    features: ['Dedicated advisor', 'Premium card included', 'Priority processing', 'Exclusive loan rates'],
  },
]

const loanProducts = [
  { label: 'Personal Loan',  icon: 'ti-user-dollar', rate: '7.8%',  term: 'Up to 84 mo',  max: '$150,000', color: '#C9A84C'  },
  { label: 'Auto Loan',      icon: 'ti-car',          rate: '4.1%',  term: 'Up to 72 mo',  max: '$75,000',  color: '#5B9BD5'  },
  { label: 'Mortgage',       icon: 'ti-home',         rate: '5.4%',  term: 'Up to 360 mo', max: '$2M',      color: '#22c55e'  },
  { label: 'Business',       icon: 'ti-briefcase',    rate: '6.2%',  term: 'Up to 120 mo', max: '$500,000', color: '#a855f7'  },
  { label: 'Education',      icon: 'ti-school',       rate: '3.6%',  term: 'Up to 120 mo', max: '$100,000', color: '#f59e0b'  },
]

const trust = [
  { icon: 'ti-shield-check', label: 'FDIC Insured', sub: 'Up to $250,000' },
  { icon: 'ti-lock',         label: '256-bit SSL',  sub: 'End-to-end encrypted' },
  { icon: 'ti-clock-24',     label: '24/7 Support', sub: 'Always available' },
  { icon: 'ti-users',        label: '50,000+',      sub: 'Members served' },
]

// ─── mini card component ──────────────────────────────────────────────────────

const MiniCard = ({ label, color, accentColor, network }: { label: string; color: string; accentColor: string; network: string }) => (
  <div
    className="w-full aspect-[1.586/1] rounded-xl flex flex-col justify-between p-5 relative overflow-hidden shadow-xl"
    style={{ background: color }}
  >
    <div
      className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-[0.15]"
      style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
    />
    <div className="flex items-center justify-between relative">
      <div className="flex flex-col gap-0.5">
        <span className="text-white/40 text-[10px] uppercase tracking-widest">EagleCrest</span>
        <span className="text-white font-medium text-sm">{label}</span>
      </div>
      <div
        className="w-8 h-8 rounded-full border-2 opacity-70"
        style={{ borderColor: accentColor }}
      />
    </div>
    <div className="relative">
      <p className="font-mono text-white/40 tracking-widest text-sm">•••• •••• •••• ••••</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-white/40 text-[10px]">MM / YY</span>
        <span className="font-semibold text-sm" style={{ color: accentColor }}>{network}</span>
      </div>
    </div>
  </div>
)

// ─── main component ───────────────────────────────────────────────────────────

const Landing = () => {
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${
          scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/[0.06]' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display text-xl font-semibold tracking-[0.12em] text-[#C9A84C] select-none">
            EAGLECREST
          </span>
          <nav className="hidden md:flex items-center gap-7 text-sm text-white/60">
            <a href="#features" className="hover:text-white transition-colors duration-150">Features</a>
            <a href="#cards" className="hover:text-white transition-colors duration-150">Cards</a>
            <a href="#accounts" className="hover:text-white transition-colors duration-150">Accounts</a>
            <a href="#loans" className="hover:text-white transition-colors duration-150">Loans</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/sign-in"
              className="text-sm text-white/70 hover:text-white transition-colors duration-150 px-4 py-1.5 rounded-md hover:bg-white/[0.06]"
            >
              Sign In
            </Link>
            <Link
              to="/sign-up"
              className="text-sm font-medium px-4 py-2 rounded-md bg-[#C9A84C] text-black hover:bg-[#d4b55c] transition-colors duration-150"
            >
              Open Account
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16"
      >
        {/* ambient glows */}
        <div
          className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(ellipse, #C9A84C 0%, transparent 65%)' }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 65%)' }}
        />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/[0.07] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
            <span className="text-[11px] text-[#C9A84C] tracking-[0.1em] uppercase font-medium">
              FDIC Insured · No Monthly Fees
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-medium text-white leading-[1.06] tracking-[-0.02em]">
            Private Banking,<br />
            <span className="text-[#C9A84C]">Reimagined.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto">
            EagleCrest gives you institutional-grade banking in a modern, private account.
            Cards, savings goals, loans, and real-time analytics — all in one place.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#C9A84C] text-black font-semibold rounded-lg hover:bg-[#d4b55c] transition-all duration-150 text-sm shadow-[0_0_40px_rgba(201,168,76,0.25)]"
            >
              Open Your Account
              <i className="ti ti-arrow-right" style={{ fontSize: 16 }} aria-hidden="true" />
            </Link>
            <Link
              to="/sign-in"
              className="inline-flex items-center gap-2 px-8 py-3.5 border border-white/[0.15] text-white/70 hover:text-white hover:border-white/30 rounded-lg transition-colors duration-150 text-sm"
            >
              Sign in to your account
            </Link>
          </div>

          {/* trust strip */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {trust.map((t) => (
              <div key={t.label} className="flex flex-col items-center gap-1.5">
                <span className="w-10 h-10 rounded-xl bg-[#C9A84C]/10 text-[#C9A84C] flex items-center justify-center">
                  <i className={`ti ${t.icon}`} style={{ fontSize: 18 }} aria-hidden="true" />
                </span>
                <span className="text-sm font-medium text-white/80">{t.label}</span>
                <span className="text-[11px] text-white/40">{t.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A84C] mb-3">Everything You Need</p>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-white">
              Built for modern finances
            </h2>
            <p className="text-white/50 mt-3 max-w-lg mx-auto">
              Every feature designed to give you more control, more insight, and more peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-xl bg-[#111] border border-white/[0.07] hover:border-[#C9A84C]/30 transition-all duration-200 hover:bg-[#141414]"
              >
                <span className="w-11 h-11 rounded-lg bg-[#C9A84C]/10 text-[#C9A84C] flex items-center justify-center mb-4">
                  <i className={`ti ${f.icon}`} style={{ fontSize: 20 }} aria-hidden="true" />
                </span>
                <h3 className="text-base font-medium text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cards ──────────────────────────────────────────────────────────── */}
      <section id="cards" className="py-24 px-6 bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A84C] mb-3">Card Products</p>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-white">
              Your card, your rules
            </h2>
            <p className="text-white/50 mt-3 max-w-md mx-auto">
              Choose from three card tiers. All include real-time transaction alerts, freeze controls, and spending limits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cardProducts.map((card) => (
              <div key={card.id} className="flex flex-col gap-5 p-6 rounded-xl bg-[#111] border border-white/[0.07]">
                <MiniCard
                  label={card.label}
                  color={card.color}
                  accentColor={card.accentColor}
                  network={card.network}
                />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-white">{card.label}</h3>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: `${card.accentColor}20`,
                        color: card.accentColor,
                        border: `1px solid ${card.accentColor}30`,
                      }}
                    >
                      {card.tag}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-2 mt-3">
                    {card.perks.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-white/50">
                        <i className="ti ti-check text-[#C9A84C]" style={{ fontSize: 13 }} aria-hidden="true" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/sign-up"
              className="inline-flex items-center gap-2 text-sm text-[#C9A84C] hover:text-[#d4b55c] transition-colors duration-150 font-medium"
            >
              Apply for a card when you open your account
              <i className="ti ti-arrow-right" style={{ fontSize: 15 }} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Account Types ──────────────────────────────────────────────────── */}
      <section id="accounts" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A84C] mb-3">Account Types</p>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-white">
              Built for every stage
            </h2>
            <p className="text-white/50 mt-3 max-w-md mx-auto">
              Whether you're starting out or managing significant wealth, there's an EagleCrest account designed for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {accountTypes.map((a) => (
              <div
                key={a.label}
                className="p-7 rounded-xl bg-[#111] border border-white/[0.07] hover:border-white/[0.14] transition-all duration-200"
              >
                <span
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${a.color}18`, color: a.color }}
                >
                  <i className={`ti ${a.icon}`} style={{ fontSize: 22 }} aria-hidden="true" />
                </span>
                <h3 className="text-lg font-medium text-white mb-2">{a.label}</h3>
                <p className="text-sm text-white/50 leading-relaxed mb-5">{a.desc}</p>
                <ul className="flex flex-col gap-2">
                  {a.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-white/60">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: a.color }}
                      />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/sign-up"
                  className="mt-6 block text-center text-sm font-medium py-2.5 rounded-lg border transition-colors duration-150 hover:bg-white/[0.04]"
                  style={{ borderColor: `${a.color}50`, color: a.color }}
                >
                  Open {a.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Loan Products ──────────────────────────────────────────────────── */}
      <section id="loans" className="py-24 px-6 bg-[#0d0d0d]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A84C] mb-3">Loan Products</p>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-white">
              Financing that fits
            </h2>
            <p className="text-white/50 mt-3 max-w-md mx-auto">
              Competitive rates, flexible terms, and a fast application process. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            {loanProducts.slice(0, 3).map((l) => (
              <LoanCard key={l.label} {...l} />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {loanProducts.slice(3).map((l) => (
              <LoanCard key={l.label} {...l} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              to="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#C9A84C] text-black font-semibold rounded-lg hover:bg-[#d4b55c] transition-colors duration-150 text-sm"
            >
              Apply for a Loan
              <i className="ti ti-arrow-right" style={{ fontSize: 15 }} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{ background: 'radial-gradient(ellipse at center, #C9A84C 0%, transparent 65%)' }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-medium text-white leading-snug">
            Ready to experience<br />
            <span className="text-[#C9A84C]">private banking?</span>
          </h2>
          <p className="mt-5 text-white/50 text-lg">
            Open your account in minutes. No branch visit needed.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/sign-up"
              className="inline-flex items-center gap-2 px-10 py-4 bg-[#C9A84C] text-black font-bold rounded-xl hover:bg-[#d4b55c] transition-all duration-150 text-base shadow-[0_0_60px_rgba(201,168,76,0.3)]"
            >
              Open Your Account
              <i className="ti ti-arrow-right" style={{ fontSize: 18 }} aria-hidden="true" />
            </Link>
            <Link
              to="/sign-in"
              className="inline-flex items-center gap-2 px-10 py-4 border border-white/[0.15] text-white/70 hover:text-white hover:border-white/30 rounded-xl transition-colors duration-150 text-base"
            >
              Already a member? Sign In
            </Link>
          </div>
          <p className="mt-8 text-xs text-white/30">
            FDIC insured up to $250,000 · No monthly fees · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-display text-lg font-semibold tracking-[0.12em] text-[#C9A84C] select-none">
              EAGLECREST
            </span>
            <p className="text-[11px] text-white/30 mt-1">Private Banking · Member FDIC</p>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <span className="hover:text-white/60 cursor-pointer transition-colors duration-150">Privacy Policy</span>
            <span className="hover:text-white/60 cursor-pointer transition-colors duration-150">Terms of Service</span>
            <span className="hover:text-white/60 cursor-pointer transition-colors duration-150">Contact</span>
          </div>
          <p className="text-[11px] text-white/20">© {new Date().getFullYear()} EagleCrest Private Banking</p>
        </div>
      </footer>
    </div>
  )
}

const LoanCard = ({
  label,
  icon,
  rate,
  term,
  max,
  color,
}: {
  label: string
  icon: string
  rate: string
  term: string
  max: string
  color: string
}) => (
  <div className="p-6 rounded-xl bg-[#111] border border-white/[0.07] hover:border-white/[0.14] transition-all duration-200 flex items-center gap-5">
    <span
      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: `${color}18`, color }}
    >
      <i className={`ti ${icon}`} style={{ fontSize: 22 }} aria-hidden="true" />
    </span>
    <div className="flex-1 min-w-0">
      <p className="font-medium text-white text-sm">{label}</p>
      <p className="text-xs text-white/40 mt-0.5">Up to {max} · {term}</p>
    </div>
    <div className="text-right shrink-0">
      <p className="font-display text-2xl font-medium" style={{ color }}>{rate}</p>
      <p className="text-[10px] text-white/30 uppercase tracking-wide">APR</p>
    </div>
  </div>
)

export default Landing
