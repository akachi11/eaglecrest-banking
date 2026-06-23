import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../lib/api'
import type { ApplicationData } from '../lib/api'

// ─── shared field styles ──────────────────────────────────────────────────────
const fieldBase =
  'w-full bg-[#111] border rounded-md text-sm text-white px-3.5 py-2.5 outline-none transition-colors duration-150 placeholder:text-white/25 hover:border-white/20 focus:border-[#C9A84C]/50 focus:shadow-[0_0_0_3px_rgba(201,168,76,0.08)]'
const fieldError = 'border-red-500/50'
const fieldNormal = 'border-white/10'

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[11px] tracking-[0.1em] uppercase text-white/40 font-medium mb-1.5">
    {children}
  </label>
)
const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="text-[11px] text-red-400 mt-1">{msg}</p> : null

// ─── step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Personal Info', icon: 'ti-user' },
  { label: 'Address', icon: 'ti-map-pin' },
  { label: 'Identity', icon: 'ti-id' },
  { label: 'Employment', icon: 'ti-briefcase' },
  { label: 'Account & Security', icon: 'ti-lock' },
]

// ─── data ─────────────────────────────────────────────────────────────────────
const ID_TYPES = [
  { id: 'passport', label: "Passport" },
  { id: 'driver_license', label: "Driver's License" },
  { id: 'state_id', label: "State ID" },
] as const

const EMPLOYMENT_STATUSES = ['Employed', 'Self-Employed', 'Retired', 'Student', 'Unemployed']

const INCOME_RANGES: { label: string; value: number }[] = [
  { label: 'Under $25,000', value: 20000 },
  { label: '$25,000 – $50,000', value: 37500 },
  { label: '$50,000 – $100,000', value: 75000 },
  { label: '$100,000 – $200,000', value: 150000 },
  { label: '$200,000+', value: 250000 },
]

const ACCOUNT_TYPES = [
  { id: 'checking', label: 'Everyday Checking', desc: 'Best for daily spending, no min. balance', icon: 'ti-building-bank', color: '#5B9BD5' },
  { id: 'savings', label: 'High-Yield Savings', desc: '4.25% APY, goal tracking & auto round-ups', icon: 'ti-pig', color: '#22c55e' },
  { id: 'private', label: 'Private Wealth', desc: 'Premium rates, dedicated advisor & card', icon: 'ti-diamond', color: '#C9A84C' },
] as const

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
  'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
]

// ─── types ────────────────────────────────────────────────────────────────────
type FormErrors = Partial<Record<string, string>>

interface FormState {
  firstName: string; lastName: string; email: string; phone: string; dob: string
  street: string; city: string; state: string; zip: string; country: string
  idType: 'passport' | 'driver_license' | 'state_id' | ''
  ssnLast4: string
  employmentStatus: string; employer: string; incomeRange: number
  accountType: 'checking' | 'savings' | 'private'
  password: string; confirm: string; transactionPin: string; confirmPin: string; agreed: boolean
}

const INIT: FormState = {
  firstName: '', lastName: '', email: '', phone: '', dob: '',
  street: '', city: '', state: '', zip: '', country: 'US',
  idType: '', ssnLast4: '',
  employmentStatus: '', employer: '', incomeRange: 0,
  accountType: 'private',
  password: '', confirm: '', transactionPin: '', confirmPin: '', agreed: false,
}

// ─── per-step validation ──────────────────────────────────────────────────────
function validateStep(step: number, f: FormState): FormErrors {
  const e: FormErrors = {}
  if (step === 0) {
    if (!f.firstName.trim()) e.firstName = 'Required'
    if (!f.lastName.trim()) e.lastName = 'Required'
    if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Enter a valid email'
    if (!f.phone.trim()) e.phone = 'Required'
    if (!f.dob) e.dob = 'Required'
    else {
      const age = (Date.now() - new Date(f.dob).getTime()) / (365.25 * 24 * 3600 * 1000)
      if (age < 18) e.dob = 'You must be at least 18 years old'
    }
  }
  if (step === 1) {
    if (!f.street.trim()) e.street = 'Required'
    if (!f.city.trim()) e.city = 'Required'
    if (!f.state) e.state = 'Required'
    if (!f.zip.trim()) e.zip = 'Required'
  }
  if (step === 2) {
    if (!f.idType) e.idType = 'Select an ID type'
    if (!f.ssnLast4.trim() || !/^\d{4}$/.test(f.ssnLast4)) e.ssnLast4 = 'Enter the last 4 digits of your SSN'
  }
  if (step === 3) {
    if (!f.employmentStatus) e.employmentStatus = 'Select your employment status'
    if (!f.incomeRange) e.incomeRange = 'Select an income range'
  }
  if (step === 4) {
    if (!f.password || f.password.length < 8) e.password = 'Minimum 8 characters'
    if (f.confirm !== f.password) e.confirm = 'Passwords do not match'
    if (!/^\d{4}$/.test(f.transactionPin)) e.transactionPin = 'PIN must be exactly 4 digits'
    if (f.confirmPin !== f.transactionPin) e.confirmPin = 'PINs do not match'
    if (!f.agreed) e.agreed = 'You must accept the terms to proceed'
  }
  return e
}

// ─── main component ───────────────────────────────────────────────────────────
const SignUp: React.FC = () => {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(INIT)
  const [errors, setErrors] = useState<FormErrors>({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [showPin, setShowPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)

  const set = <K extends keyof FormState>(field: K) => (val: FormState[K]) => {
    setForm((p) => ({ ...p, [field]: val }))
    setErrors((p) => ({ ...p, [field]: undefined }))
  }

  const onChange = <K extends keyof FormState>(field: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      set(field)(e.target.value as FormState[K])

  const next = () => {
    const errs = validateStep(step, form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setStep((s) => s + 1)
  }

  const back = () => { setErrors({}); setStep((s) => s - 1) }

  const handleSubmit = async () => {
    const errs = validateStep(4, form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    if (!form.idType) return

    setApiError('')
    setLoading(true)
    try {
      const payload: ApplicationData = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        transactionPin: form.transactionPin,
        dob: form.dob,
        street: form.street.trim(),
        city: form.city.trim(),
        state: form.state,
        zip: form.zip.trim(),
        country: form.country,
        idType: form.idType,
        ssnLast4: form.ssnLast4,
        employmentStatus: form.employmentStatus,
        employer: form.employer.trim() || undefined,
        annualIncome: form.incomeRange,
        accountType: form.accountType,
      }
      await authApi.register(payload)
      setSubmitted(true)
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Application failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div
            className="pointer-events-none fixed inset-0 opacity-[0.05]"
            style={{ background: 'radial-gradient(ellipse at center, #C9A84C 0%, transparent 60%)' }}
          />
          <div className="relative">
            <span className="inline-flex w-20 h-20 rounded-full bg-[#C9A84C]/10 text-[#C9A84C] items-center justify-center mb-6">
              <i className="ti ti-circle-check" style={{ fontSize: 38 }} aria-hidden="true" />
            </span>
            <h1 className="font-display text-3xl font-medium text-white mb-3">
              Application Submitted
            </h1>
            <p className="text-white/50 leading-relaxed mb-2">
              Thank you, <strong className="text-white/80">{form.firstName}</strong>. Your EverestSave account application has been received.
            </p>
            <p className="text-white/40 text-sm leading-relaxed">
              Our team will review your application and send a decision to <strong className="text-white/60">{form.email}</strong> within <strong className="text-white/60">1–2 business days</strong>. Once approved, you'll be able to sign in and access your account.
            </p>
            <div className="mt-8 p-5 rounded-xl bg-[#111] border border-white/[0.07] text-left flex flex-col gap-3">
              {[
                ['Account Type', ACCOUNT_TYPES.find(a => a.id === form.accountType)?.label ?? form.accountType],
                ['Email on file', form.email],
                ['Application for', `${form.firstName} ${form.lastName}`],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-xs text-white/30">{k}</span>
                  <span className="text-sm text-white/70 font-medium">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <p className="text-xs text-white/30">
                Already approved? Check your email for activation instructions.
              </p>
              <Link
                to="/sign-in"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C9A84C] text-black font-semibold rounded-lg hover:bg-[#d4b55c] transition-colors duration-150 text-sm"
              >
                Go to Sign In
              </Link>
              <Link to="/" className="text-sm text-white/30 hover:text-white/60 transition-colors duration-150">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">

      {/* ── Left brand panel ───────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] shrink-0 flex-col justify-between relative overflow-hidden bg-[#0d0d0d] border-r border-white/[0.07] p-10">
        <div
          className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 65%)' }}
        />

        {/* wordmark */}
        <Link to="/" className="relative block">
          <div className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="" className="w-8 h-8 rounded-lg shrink-0" aria-hidden="true" />
            <span className="font-display text-2xl font-semibold tracking-[0.12em] text-[#C9A84C] select-none">
              EVERESTSAVE BANK
            </span>
          </div>
          <p className="text-xs text-white/30 tracking-[0.08em] mt-1">Private Banking</p>
        </Link>

        {/* step indicator */}
        <div className="relative flex flex-col gap-3">
          {STEPS.map((s, i) => (
            <div
              key={s.label}
              className={`flex items-center gap-3.5 transition-all duration-200 ${i < step ? 'opacity-60' : i === step ? 'opacity-100' : 'opacity-25'
                }`}
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 transition-colors duration-200 ${i < step
                  ? 'bg-[#C9A84C]/20 text-[#C9A84C]'
                  : i === step
                    ? 'bg-[#C9A84C] text-black font-bold'
                    : 'bg-white/[0.07] text-white/40'
                  }`}
              >
                {i < step
                  ? <i className="ti ti-check" style={{ fontSize: 14 }} aria-hidden="true" />
                  : <i className={`ti ${s.icon}`} style={{ fontSize: 14 }} aria-hidden="true" />
                }
              </span>
              <span className={`text-sm font-medium ${i === step ? 'text-white' : 'text-white/50'}`}>
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div className={`absolute left-[15px] mt-8 w-px h-6 ${i < step ? 'bg-[#C9A84C]/30' : 'bg-white/[0.07]'}`}
                  style={{ top: `${i * 56 + 32}px` }}
                />
              )}
            </div>
          ))}
        </div>

        <p className="relative text-[11px] text-white/20">
          Application is reviewed within 1–2 business days &middot; FDIC insured
        </p>
      </div>

      {/* ── Right form panel ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
        {/* mobile wordmark */}
        <div className="lg:hidden mb-8 text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2.5">
            <img src="/favicon.svg" alt="" className="w-7 h-7 rounded-lg shrink-0" aria-hidden="true" />
            <span className="font-display text-xl font-semibold tracking-[0.12em] text-[#C9A84C] select-none">
              EVERESTSAVE BANK
            </span>
          </Link>
          {/* mobile step dots */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="transition-all duration-200 rounded-full"
                style={{
                  width: i === step ? 20 : 6,
                  height: 6,
                  background: i <= step ? '#C9A84C' : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>
        </div>

        <div className="w-full max-w-[480px]">
          {/* progress bar */}
          <div className="hidden lg:flex gap-1.5 mb-8">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-colors duration-300"
                style={{ background: i <= step ? '#C9A84C' : 'rgba(255,255,255,0.1)' }}
              />
            ))}
          </div>

          <h1 className="font-display text-2xl font-medium text-white mb-1">
            {STEPS[step].label}
          </h1>
          <p className="text-sm text-white/40 mb-8">
            Step {step + 1} of {STEPS.length} · Account Application
          </p>

          {apiError && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-red-500/[0.08] border border-red-500/20 mb-6">
              <i className="ti ti-alert-circle text-red-400 shrink-0 mt-0.5" style={{ fontSize: 15 }} aria-hidden="true" />
              <p className="text-sm text-red-400">{apiError}</p>
            </div>
          )}

          {/* ── step 0: personal info ── */}
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <input
                    className={`${fieldBase} ${errors.firstName ? fieldError : fieldNormal}`}
                    placeholder="Alexandra"
                    value={form.firstName}
                    onChange={onChange('firstName')}
                    autoComplete="given-name"
                  />
                  <FieldError msg={errors.firstName} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <input
                    className={`${fieldBase} ${errors.lastName ? fieldError : fieldNormal}`}
                    placeholder="Chen"
                    value={form.lastName}
                    onChange={onChange('lastName')}
                    autoComplete="family-name"
                  />
                  <FieldError msg={errors.lastName} />
                </div>
              </div>
              <div>
                <Label>Email Address</Label>
                <input
                  type="email"
                  className={`${fieldBase} ${errors.email ? fieldError : fieldNormal}`}
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={onChange('email')}
                  autoComplete="email"
                />
                <FieldError msg={errors.email} />
              </div>
              <div>
                <Label>Phone Number</Label>
                <input
                  type="tel"
                  className={`${fieldBase} ${errors.phone ? fieldError : fieldNormal}`}
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={onChange('phone')}
                  autoComplete="tel"
                />
                <FieldError msg={errors.phone} />
              </div>
              <div>
                <Label>Date of Birth</Label>
                <input
                  type="date"
                  className={`${fieldBase} ${errors.dob ? fieldError : fieldNormal}`}
                  value={form.dob}
                  onChange={onChange('dob')}
                  max={new Date(Date.now() - 18 * 365.25 * 24 * 3600 * 1000).toISOString().split('T')[0]}
                />
                <FieldError msg={errors.dob} />
              </div>
            </div>
          )}

          {/* ── step 1: address ── */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div>
                <Label>Street Address</Label>
                <input
                  className={`${fieldBase} ${errors.street ? fieldError : fieldNormal}`}
                  placeholder="123 Main Street, Apt 4B"
                  value={form.street}
                  onChange={onChange('street')}
                  autoComplete="street-address"
                />
                <FieldError msg={errors.street} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City</Label>
                  <input
                    className={`${fieldBase} ${errors.city ? fieldError : fieldNormal}`}
                    placeholder="New York"
                    value={form.city}
                    onChange={onChange('city')}
                    autoComplete="address-level2"
                  />
                  <FieldError msg={errors.city} />
                </div>
                <div>
                  <Label>State</Label>
                  <select
                    className={`${fieldBase} ${errors.state ? fieldError : fieldNormal}`}
                    value={form.state}
                    onChange={onChange('state')}
                  >
                    <option value="" disabled>Select state</option>
                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <FieldError msg={errors.state} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ZIP Code</Label>
                  <input
                    className={`${fieldBase} ${errors.zip ? fieldError : fieldNormal}`}
                    placeholder="10001"
                    value={form.zip}
                    onChange={onChange('zip')}
                    maxLength={10}
                    autoComplete="postal-code"
                  />
                  <FieldError msg={errors.zip} />
                </div>
                <div>
                  <Label>Country</Label>
                  <input
                    className={`${fieldBase} ${fieldNormal} opacity-50`}
                    value="United States"
                    readOnly
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── step 2: identity ── */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <Label>Government-Issued ID Type</Label>
                <div className="grid grid-cols-3 gap-3 mt-1">
                  {ID_TYPES.map((id) => (
                    <button
                      key={id.id}
                      type="button"
                      onClick={() => set('idType')(id.id)}
                      className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors duration-150 ${form.idType === id.id
                        ? 'border-[#C9A84C]/50 bg-[#C9A84C]/[0.08] text-[#C9A84C]'
                        : 'border-white/10 bg-[#111] text-white/50 hover:text-white/80 hover:border-white/20'
                        }`}
                    >
                      {id.label}
                    </button>
                  ))}
                </div>
                <FieldError msg={errors.idType} />
              </div>

              <div>
                <Label>Last 4 Digits of SSN</Label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={`${fieldBase} ${errors.ssnLast4 ? fieldError : fieldNormal} font-mono tracking-widest text-lg`}
                  placeholder="••••"
                  maxLength={4}
                  value={form.ssnLast4}
                  onChange={(e) => set('ssnLast4')(e.target.value.replace(/\D/g, '').slice(0, 4))}
                />
                <FieldError msg={errors.ssnLast4} />
                <p className="text-[11px] text-white/25 mt-2 leading-relaxed">
                  We only collect the last 4 digits for identity verification. This is encrypted and never shared.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#C9A84C]/[0.05] border border-[#C9A84C]/20 flex items-start gap-3">
                <i className="ti ti-shield-lock text-[#C9A84C] mt-0.5 shrink-0" style={{ fontSize: 16 }} aria-hidden="true" />
                <p className="text-xs text-white/40 leading-relaxed">
                  Your identity information is protected by bank-grade 256-bit encryption and is used solely for account verification in compliance with federal KYC requirements.
                </p>
              </div>
            </div>
          )}

          {/* ── step 3: employment ── */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <div>
                <Label>Employment Status</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1">
                  {EMPLOYMENT_STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => set('employmentStatus')(s)}
                      className={`py-2.5 px-3 rounded-lg border text-sm font-medium transition-colors duration-150 ${form.employmentStatus === s
                        ? 'border-[#C9A84C]/50 bg-[#C9A84C]/[0.08] text-[#C9A84C]'
                        : 'border-white/10 bg-[#111] text-white/50 hover:text-white/80 hover:border-white/20'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <FieldError msg={errors.employmentStatus} />
              </div>

              <div>
                <Label>Employer / School Name <span className="normal-case text-white/25">(if applicable)</span></Label>
                <input
                  className={`${fieldBase} ${fieldNormal}`}
                  placeholder="e.g. Acme Corp, NYU"
                  value={form.employer}
                  onChange={onChange('employer')}
                />
              </div>

              <div>
                <Label>Annual Income</Label>
                <div className="flex flex-col gap-2 mt-1">
                  {INCOME_RANGES.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => set('incomeRange')(r.value)}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm transition-colors duration-150 ${form.incomeRange === r.value
                        ? 'border-[#C9A84C]/50 bg-[#C9A84C]/[0.08] text-[#C9A84C]'
                        : 'border-white/10 bg-[#111] text-white/50 hover:text-white/80 hover:border-white/20'
                        }`}
                    >
                      {r.label}
                      {form.incomeRange === r.value && (
                        <i className="ti ti-check" style={{ fontSize: 14 }} aria-hidden="true" />
                      )}
                    </button>
                  ))}
                </div>
                <FieldError msg={errors.incomeRange} />
              </div>
            </div>
          )}

          {/* ── step 4: account & security ── */}
          {step === 4 && (
            <div className="flex flex-col gap-5">
              <div>
                <Label>Preferred Account Type</Label>
                <div className="flex flex-col gap-3 mt-1">
                  {ACCOUNT_TYPES.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => set('accountType')(a.id)}
                      className={`flex items-center gap-4 p-4 rounded-lg border text-left transition-colors duration-150 ${form.accountType === a.id
                        ? 'border-[#C9A84C]/40 bg-[#C9A84C]/[0.06]'
                        : 'border-white/10 bg-[#111] hover:border-white/20'
                        }`}
                    >
                      <span
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${a.color}18`, color: a.color }}
                      >
                        <i className={`ti ${a.icon}`} style={{ fontSize: 18 }} aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">{a.label}</p>
                        <p className="text-xs text-white/40 mt-0.5">{a.desc}</p>
                      </div>
                      {form.accountType === a.id && (
                        <i className="ti ti-check text-[#C9A84C] shrink-0" style={{ fontSize: 16 }} aria-hidden="true" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Create Password</Label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={onChange('password')}
                    autoComplete="new-password"
                    className={`${fieldBase} pr-10 ${errors.password ? fieldError : fieldNormal}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors duration-150"
                  >
                    <i className={`ti ${showPwd ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: 15 }} aria-hidden="true" />
                  </button>
                </div>
                <FieldError msg={errors.password} />
              </div>

              <div>
                <Label>Confirm Password</Label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    value={form.confirm}
                    onChange={onChange('confirm')}
                    autoComplete="new-password"
                    className={`${fieldBase} pr-10 ${errors.confirm ? fieldError : fieldNormal}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors duration-150"
                  >
                    <i className={`ti ${showConfirm ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: 15 }} aria-hidden="true" />
                  </button>
                </div>
                <FieldError msg={errors.confirm} />
              </div>

              <div>
                <Label>Transaction PIN</Label>
                <p className="text-[11px] text-white/35 mb-2">4-digit PIN required to authorise all transfers</p>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    placeholder="4-digit PIN"
                    value={form.transactionPin}
                    onChange={onChange('transactionPin')}
                    maxLength={4}
                    inputMode="numeric"
                    autoComplete="new-password"
                    className={`${fieldBase} pr-10 ${errors.transactionPin ? fieldError : fieldNormal}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors duration-150"
                  >
                    <i className={`ti ${showPin ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: 15 }} aria-hidden="true" />
                  </button>
                </div>
                <FieldError msg={errors.transactionPin} />
              </div>

              <div>
                <Label>Confirm Transaction PIN</Label>
                <div className="relative">
                  <input
                    type={showConfirmPin ? 'text' : 'password'}
                    placeholder="Repeat your PIN"
                    value={form.confirmPin}
                    onChange={onChange('confirmPin')}
                    maxLength={4}
                    inputMode="numeric"
                    autoComplete="new-password"
                    className={`${fieldBase} pr-10 ${errors.confirmPin ? fieldError : fieldNormal}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors duration-150"
                  >
                    <i className={`ti ${showConfirmPin ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: 15 }} aria-hidden="true" />
                  </button>
                </div>
                <FieldError msg={errors.confirmPin} />
              </div>

              <label className="flex items-start gap-3 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={form.agreed}
                  onChange={(e) => set('agreed')(e.target.checked)}
                  className="mt-0.5 accent-[#C9A84C] w-4 h-4 shrink-0"
                />
                <span className="text-xs text-white/40 leading-relaxed">
                  I confirm that all information provided is accurate. I authorise EverestSave to verify my identity and run a soft credit check as part of the account opening process. I agree to the{' '}
                  <span className="text-[#C9A84C]">Terms of Service</span> and{' '}
                  <span className="text-[#C9A84C]">Privacy Policy</span>.
                </span>
              </label>
              <FieldError msg={errors.agreed} />
            </div>
          )}

          {/* ── navigation ── */}
          <div className="flex items-center justify-between mt-8">
            {step > 0 ? (
              <button
                type="button"
                onClick={back}
                className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors duration-150"
              >
                <i className="ti ti-arrow-left" style={{ fontSize: 15 }} aria-hidden="true" />
                Back
              </button>
            ) : (
              <Link
                to="/"
                className="flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors duration-150"
              >
                <i className="ti ti-arrow-left" style={{ fontSize: 15 }} aria-hidden="true" />
                Back to Home
              </Link>
            )}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#C9A84C] text-black font-semibold rounded-lg hover:bg-[#d4b55c] transition-colors duration-150 text-sm"
              >
                Continue
                <i className="ti ti-arrow-right" style={{ fontSize: 15 }} aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#C9A84C] text-black font-semibold rounded-lg hover:bg-[#d4b55c] transition-colors duration-150 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <i className="ti ti-loader-2 animate-spin" style={{ fontSize: 15 }} aria-hidden="true" />
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit Application
                    <i className="ti ti-send" style={{ fontSize: 15 }} aria-hidden="true" />
                  </>
                )}
              </button>
            )}
          </div>

          <p className="text-sm text-white/30 text-center mt-6">
            Already have an account?{' '}
            <Link to="/sign-in" className="text-[#C9A84C] hover:text-[#d4b55c] transition-colors duration-150 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignUp
