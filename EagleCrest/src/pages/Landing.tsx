import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

// ─── Unsplash photo helper ────────────────────────────────────────────────────
const img = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

// ─── data ─────────────────────────────────────────────────────────────────────

const features = [
  { icon: 'ti-chart-pie',    title: 'Spending Insights',    desc: 'See exactly where your money goes with automatic categorisation and monthly trend charts.' },
  { icon: 'ti-credit-card',  title: 'Cards You Control',    desc: 'Freeze, set limits, or issue a virtual card in seconds — all from your phone.' },
  { icon: 'ti-pig',          title: 'Save Smarter',         desc: 'Set a goal, link it to a savings account, and watch round-ups fill it automatically.' },
  { icon: 'ti-send',         title: 'Easy Transfers',       desc: 'Send money to friends and family instantly with no transfer fees.' },
  { icon: 'ti-receipt',      title: 'Simple Payments',      desc: 'Pay bills, schedule payments, and track due dates from one clean dashboard.' },
  { icon: 'ti-shield-check', title: 'Always Protected',     desc: 'Two-factor auth, real-time fraud alerts, and 256-bit encryption on every transaction.' },
]

const loanStories = [
  {
    type: 'Education',
    rate: '3.6% APR',
    max: 'Up to $100K',
    headline: 'Fund your future',
    desc: 'Affordable student loans with flexible repayment — deferred until after graduation.',
    photo: img('1523050854058-8df90110c9f1', 600),
    photoBg: '#1a1610',
    tag: 'Student Loans',
    tagColor: '#f59e0b',
    cta: 'Learn more',
  },
  {
    type: 'Mortgage',
    rate: '5.4% APR',
    max: 'Up to $2M',
    headline: 'Open the front door',
    desc: "Low down-payment options and competitive rates to help your family find its place.",
    photo: img('1570129477492-45c003edd2be', 600),
    photoBg: '#101a10',
    tag: 'Home Loans',
    tagColor: '#22c55e',
    cta: 'Learn more',
  },
  {
    type: 'Auto',
    rate: '4.1% APR',
    max: 'Up to $75K',
    headline: 'Get behind the wheel',
    desc: 'New or used — get pre-approved in minutes and drive away the same day.',
    photo: img('1449965408869-eaa3f722e40d', 600),
    photoBg: '#101318',
    tag: 'Auto Loans',
    tagColor: '#5B9BD5',
    cta: 'Learn more',
  },
  {
    type: 'Personal',
    rate: '7.8% APR',
    max: 'Up to $150K',
    headline: 'Whatever life needs',
    desc: 'Consolidate debt, cover an emergency, or fund a big purchase — no collateral required.',
    photo: img('1529156069898-49953e39b3ac', 600),
    photoBg: '#181010',
    tag: 'Personal Loans',
    tagColor: '#C9A84C',
    cta: 'Learn more',
  },
  {
    type: 'Business',
    rate: '6.2% APR',
    max: 'Up to $500K',
    headline: 'Build something real',
    desc: 'From startup capital to expansion funding, we back small business owners every step.',
    photo: img('1556742049-0cfed4f6a45d', 600),
    photoBg: '#140f1a',
    tag: 'Business Loans',
    tagColor: '#a855f7',
    cta: 'Learn more',
  },
]

const accountTypes = [
  {
    icon: 'ti-building-bank',
    label: 'Everyday Checking',
    color: '#5B9BD5',
    desc: 'For daily life — groceries, gas, subscriptions. No minimum balance, no monthly fees.',
    features: ['No monthly fees', 'Unlimited transfers', 'Free debit card', 'Mobile check deposit'],
  },
  {
    icon: 'ti-pig',
    label: 'High-Yield Savings',
    color: '#22c55e',
    desc: 'Your emergency fund or vacation savings growing at 4.25% APY every single day.',
    features: ['4.25% APY', 'Automatic round-ups', 'Savings goals', 'No withdrawal limits'],
  },
  {
    icon: 'ti-diamond',
    label: 'Premium Account',
    color: '#C9A84C',
    desc: 'Priority service, better rates, and a dedicated advisor for when your finances get serious.',
    features: ['Personal advisor', 'Premium metal card', 'Priority transfers', 'Better loan rates'],
  },
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

const testimonials = [
  {
    name: 'Sarah Mitchell',
    role: 'Nursing student, Ohio',
    photo: img('1438761681033-6461ffad8d80', 200),
    quote: "EagleCrest gave me a student loan with no origination fee and deferred payments until I graduate. Honestly the easiest financial decision I've made.",
  },
  {
    name: 'James Harrington',
    role: 'Homeowner, Texas',
    photo: img('1507003211169-0a1dd7228f2d', 200),
    quote: "We closed on our first home with an EagleCrest mortgage. The rate was better than anything my credit union offered and the process was completely online.",
  },
  {
    name: 'Brianna Cole',
    role: 'Small business owner, Georgia',
    photo: img('1573496359142-b8d87734a5a2', 200),
    quote: "I got a $40,000 business loan in under a week. My boutique would not exist without EagleCrest. Straightforward, fast, and zero surprises.",
  },
]

const trust = [
  { icon: 'ti-shield-check', label: 'FDIC Insured',  sub: 'Up to $250,000'          },
  { icon: 'ti-lock',         label: '256-bit SSL',   sub: 'End-to-end encrypted'     },
  { icon: 'ti-clock-24',     label: '24 / 7 Support',sub: 'Real humans, always'      },
  { icon: 'ti-users',        label: '50,000+',       sub: 'Members nationwide'       },
]

// ─── mini card component ──────────────────────────────────────────────────────

const MiniCard = ({ label, color, accentColor, network }: {
  label: string; color: string; accentColor: string; network: string
}) => (
  <div
    className="w-full aspect-[1.586/1] rounded-xl flex flex-col justify-between p-5 relative overflow-hidden shadow-xl"
    style={{ background: color }}
  >
    <div className="pointer-events-none absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-[0.15]"
      style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }} />
    <div className="flex items-center justify-between relative">
      <div className="flex flex-col gap-0.5">
        <span className="text-white/40 text-[10px] uppercase tracking-widest">EagleCrest</span>
        <span className="text-white font-medium text-sm">{label}</span>
      </div>
      <div className="w-8 h-8 rounded-full border-2 opacity-70" style={{ borderColor: accentColor }} />
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

// ─── section label component ──────────────────────────────────────────────────

const SectionLabel = ({ children, light = false }: { children: React.ReactNode; light?: boolean }) => (
  <p className={`text-[11px] uppercase tracking-[0.2em] font-medium mb-3 ${light ? 'text-[#C9A84C]' : 'text-[#b8883a]'}`}>
    {children}
  </p>
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
    <div className="min-h-screen bg-[#0c0c0c] text-white overflow-x-hidden">

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <header className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${
        scrolled ? 'bg-[#0c0c0c]/95 backdrop-blur-sm border-b border-white/[0.07]' : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <span className="font-display text-base sm:text-xl font-semibold tracking-[0.12em] text-[#C9A84C] select-none shrink-0">
            EAGLECREST
          </span>
          <nav className="hidden md:flex items-center gap-7 text-sm text-white/60">
            <a href="#features" className="hover:text-white transition-colors duration-150">Features</a>
            <a href="#loans" className="hover:text-white transition-colors duration-150">Loans</a>
            <a href="#accounts" className="hover:text-white transition-colors duration-150">Accounts</a>
            <a href="#cards" className="hover:text-white transition-colors duration-150">Cards</a>
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/sign-in"
              className="text-xs sm:text-sm font-medium text-white/70 hover:text-white transition-colors duration-150 px-3 sm:px-4 py-1.5 rounded-md hover:bg-white/[0.06] whitespace-nowrap">
              Sign In
            </Link>
            <Link to="/sign-up"
              className="text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-md bg-[#C9A84C] text-black hover:bg-[#d4b55c] transition-colors duration-150 whitespace-nowrap">
              <span className="hidden sm:inline">Open Account</span>
              <span className="sm:hidden">Get Started</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center px-6 pt-16 pb-10">
        {/* bg glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-[0.06]"
            style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 65%)' }} />
          <div className="absolute top-1/2 right-0 w-[400px] h-[600px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle, #5B9BD5 0%, transparent 65%)' }} />
        </div>

        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* left — text */}
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/[0.07] mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
              <span className="text-[11px] text-[#C9A84C] tracking-[0.1em] uppercase font-medium">
                FDIC Insured · No Monthly Fees
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium text-white leading-[1.08] tracking-[-0.02em]">
              Banking that<br />
              works for your<br />
              <span className="text-[#C9A84C]">whole life.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-white/55 leading-relaxed max-w-md">
              Checking, savings, loans, and cards — all in one place.
              Built for students, families, and everyone in between.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link to="/sign-up"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#C9A84C] text-black font-semibold rounded-lg hover:bg-[#d4b55c] transition-all duration-150 text-sm shadow-[0_4px_24px_rgba(201,168,76,0.3)]">
                Open Your Account
                <i className="ti ti-arrow-right" style={{ fontSize: 15 }} aria-hidden="true" />
              </Link>
              <Link to="/sign-in"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-white/15 text-white/70 hover:text-white hover:border-white/30 rounded-lg transition-colors duration-150 text-sm">
                Already a member? Sign in
              </Link>
            </div>

            {/* trust row */}
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3">
              {trust.map((t) => (
                <div key={t.label} className="flex items-center gap-2">
                  <i className={`ti ${t.icon} text-[#C9A84C]`} style={{ fontSize: 15 }} aria-hidden="true" />
                  <span className="text-xs text-white/50">{t.label} <span className="text-white/30">·</span> {t.sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* right — hero photo */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5] max-h-[580px] shadow-2xl">
              <img
                src={img('1529156069898-49953e39b3ac', 900)}
                alt="Happy family banking together"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              {/* overlay tint */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c]/60 via-transparent to-transparent" />

              {/* floating stat card */}
              <div className="absolute bottom-5 left-5 right-5 flex gap-3">
                <div className="flex-1 bg-[#0c0c0c]/80 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-white/40 mb-1">Average APY earned</p>
                  <p className="font-display text-2xl text-[#C9A84C] font-medium">4.25%</p>
                </div>
                <div className="flex-1 bg-[#0c0c0c]/80 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-white/40 mb-1">Members served</p>
                  <p className="font-display text-2xl text-white font-medium">50k+</p>
                </div>
              </div>
            </div>

            {/* decorative ring */}
            <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full border border-[#C9A84C]/15 pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-56 h-56 rounded-full border border-white/[0.04] pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ── Features ── LIGHT section ──────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 bg-[#f7f4ef]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>Everything You Need</SectionLabel>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#1a1a1a]">
              Simple tools, powerful results
            </h2>
            <p className="text-[#555] mt-3 max-w-lg mx-auto text-sm sm:text-base">
              Whether you're sending money to a friend or planning for retirement — EagleCrest has you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title}
                className="p-6 rounded-xl bg-white border border-[#e8e3da] hover:border-[#C9A84C]/40 hover:shadow-md transition-all duration-200">
                <span className="w-11 h-11 rounded-lg bg-[#C9A84C]/10 text-[#b8883a] flex items-center justify-center mb-4">
                  <i className={`ti ${f.icon}`} style={{ fontSize: 20 }} aria-hidden="true" />
                </span>
                <h3 className="text-base font-semibold text-[#1a1a1a] mb-2">{f.title}</h3>
                <p className="text-sm text-[#666] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Loans ── DARK section with photos ──────────────────────────────── */}
      <section id="loans" className="py-24 px-6 bg-[#0c0c0c]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel light>Loan Products</SectionLabel>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-white">
              A loan for life's big moments
            </h2>
            <p className="text-white/50 mt-3 max-w-lg mx-auto text-sm sm:text-base">
              Competitive rates, no hidden fees, and decisions in minutes — not weeks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loanStories.map((l) => (
              <div key={l.type}
                className="rounded-xl overflow-hidden border border-white/[0.07] hover:border-white/[0.15] transition-all duration-200 flex flex-col"
                style={{ background: l.photoBg }}>
                {/* photo */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={l.photo}
                    alt={l.headline}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span
                    className="absolute top-3 left-3 text-[10px] font-semibold px-2 py-1 rounded-full"
                    style={{ background: `${l.tagColor}22`, color: l.tagColor, border: `1px solid ${l.tagColor}40` }}>
                    {l.tag}
                  </span>
                </div>

                {/* content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display text-base font-medium text-white">{l.headline}</h3>
                  <p className="text-xs text-white/50 mt-1.5 leading-relaxed flex-1">{l.desc}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.07]">
                    <div>
                      <p className="font-display text-xl font-medium" style={{ color: l.tagColor }}>{l.rate}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{l.max}</p>
                    </div>
                    <Link to="/sign-up"
                      className="text-xs font-semibold px-4 py-2 rounded-lg transition-colors duration-150"
                      style={{ background: `${l.tagColor}18`, color: l.tagColor, border: `1px solid ${l.tagColor}30` }}>
                      Apply now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Account Types ── LIGHT section ─────────────────────────────────── */}
      <section id="accounts" className="py-24 px-6 bg-[#f7f4ef]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>Account Types</SectionLabel>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#1a1a1a]">
              Pick the account that fits your life
            </h2>
            <p className="text-[#555] mt-3 max-w-md mx-auto text-sm sm:text-base">
              From your first job to your first home — there's an EagleCrest account that grows with you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {accountTypes.map((a) => (
              <div key={a.label}
                className="p-7 rounded-xl bg-white border border-[#e8e3da] hover:shadow-lg transition-all duration-200">
                <span className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${a.color}15`, color: a.color }}>
                  <i className={`ti ${a.icon}`} style={{ fontSize: 22 }} aria-hidden="true" />
                </span>
                <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">{a.label}</h3>
                <p className="text-sm text-[#666] leading-relaxed mb-5">{a.desc}</p>
                <ul className="flex flex-col gap-2 mb-6">
                  {a.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm text-[#444]">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: a.color }} />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link to="/sign-up"
                  className="block text-center text-sm font-semibold py-2.5 rounded-lg border transition-colors duration-150"
                  style={{ borderColor: `${a.color}60`, color: a.color, background: `${a.color}08` }}>
                  Open {a.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cards ── DARK section ───────────────────────────────────────────── */}
      <section id="cards" className="py-24 px-6 bg-[#0e0e0e]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel light>Card Products</SectionLabel>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-white">
              A card for every occasion
            </h2>
            <p className="text-white/50 mt-3 max-w-md mx-auto text-sm sm:text-base">
              Tap, swipe, or shop online. You're always in control — freeze it, limit it, or go virtual in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cardProducts.map((card) => (
              <div key={card.id} className="flex flex-col gap-5 p-6 rounded-xl bg-[#141414] border border-white/[0.07]">
                <MiniCard label={card.label} color={card.color} accentColor={card.accentColor} network={card.network} />
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-white">{card.label}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${card.accentColor}20`, color: card.accentColor, border: `1px solid ${card.accentColor}30` }}>
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
            <Link to="/sign-up"
              className="inline-flex items-center gap-2 text-sm text-[#C9A84C] hover:text-[#d4b55c] transition-colors duration-150 font-medium">
              Apply for your card when you open an account
              <i className="ti ti-arrow-right" style={{ fontSize: 15 }} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── LIGHT section ──────────────────────────────────── */}
      <section className="py-24 px-6 bg-[#f7f4ef]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <SectionLabel>Real Members</SectionLabel>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#1a1a1a]">
              People just like you
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-7 rounded-xl bg-white border border-[#e8e3da] flex flex-col gap-5">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="ti ti-star-filled text-[#C9A84C]" style={{ fontSize: 13 }} aria-hidden="true" />
                  ))}
                </div>
                <p className="text-sm text-[#444] leading-relaxed flex-1 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#f0ebe3]">
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover bg-[#e8e3da]"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement
                      el.style.display = 'none'
                      const fb = el.nextElementSibling as HTMLElement
                      if (fb) fb.style.display = 'flex'
                    }}
                  />
                  <div className="w-11 h-11 rounded-full bg-[#C9A84C]/20 text-[#b8883a] font-semibold text-sm items-center justify-center hidden">
                    {t.name.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a1a]">{t.name}</p>
                    <p className="text-xs text-[#888]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── DARK with warm glow ──────────────────────────────────────── */}
      <section className="py-28 sm:py-36 px-6 bg-[#0c0c0c] relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ background: 'radial-gradient(ellipse at center, #C9A84C 0%, transparent 60%)' }} />
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-medium text-white leading-snug">
            Ready to feel at home<br />
            <span className="text-[#C9A84C]">with your bank?</span>
          </h2>
          <p className="mt-5 text-white/50 text-base sm:text-lg max-w-xl mx-auto">
            Open your account in minutes. No branch visit, no paperwork, no surprises.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/sign-up"
              className="inline-flex items-center gap-2 px-10 py-4 bg-[#C9A84C] text-black font-bold rounded-xl hover:bg-[#d4b55c] transition-all duration-150 text-base shadow-[0_0_50px_rgba(201,168,76,0.3)]">
              Open Your Account
              <i className="ti ti-arrow-right" style={{ fontSize: 18 }} aria-hidden="true" />
            </Link>
            <Link to="/sign-in"
              className="inline-flex items-center gap-2 px-10 py-4 border border-white/15 text-white/70 hover:text-white hover:border-white/30 rounded-xl transition-colors duration-150 text-base">
              Already a member? Sign In
            </Link>
          </div>
          <p className="mt-8 text-xs text-white/25">
            FDIC insured up to $250,000 · No monthly fees · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-[#080808] border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-display text-lg font-semibold tracking-[0.12em] text-[#C9A84C] select-none">
              EAGLECREST
            </span>
            <p className="text-[11px] text-white/25 mt-1">Member FDIC · Equal Housing Lender</p>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <span className="hover:text-white/60 cursor-pointer transition-colors duration-150">Privacy Policy</span>
            <span className="hover:text-white/60 cursor-pointer transition-colors duration-150">Terms of Service</span>
            <span className="hover:text-white/60 cursor-pointer transition-colors duration-150">Contact Us</span>
          </div>
          <p className="text-[11px] text-white/20">© {new Date().getFullYear()} EagleCrest Banking</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
