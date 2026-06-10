import React, { useMemo, useState } from 'react'
import { Button, Input } from '../index'
import { loanApi, type ApiLoan } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })

interface LoanTypeOption {
  id: string
  label: string
  icon: string
  rate: number
  apiType: string
}

const loanTypes: LoanTypeOption[] = [
  { id: 'personal',  label: 'Personal',            icon: 'ti-user-dollar', rate: 7.8, apiType: 'Personal'  },
  { id: 'auto',      label: 'Auto',                icon: 'ti-car',         rate: 4.1, apiType: 'Auto Loan' },
  { id: 'mortgage',  label: 'Mortgage',            icon: 'ti-home',        rate: 5.4, apiType: 'Mortgage'  },
  { id: 'education', label: 'Education',           icon: 'ti-school',      rate: 3.6, apiType: 'Education' },
  { id: 'business',  label: 'Business',            icon: 'ti-briefcase',   rate: 6.2, apiType: 'Business'  },
]

const employmentOptions = ['Employed', 'Self-employed', 'Retired', 'Student']
const steps = ['Loan Details', 'Your Information', 'Review & Submit']

interface LoanApplicationModalProps {
  open: boolean
  onClose: () => void
  initialAmount?: number
  onLoanCreated?: (loan: ApiLoan) => void
}

export const LoanApplicationModal: React.FC<LoanApplicationModalProps> = ({
  open,
  onClose,
  initialAmount = 10000,
  onLoanCreated,
}) => {
  const { token, user } = useAuth()
  const { refreshNotifications } = useNotifications()
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [createdLoan, setCreatedLoan] = useState<ApiLoan | null>(null)

  const [type, setType] = useState<string | null>(null)
  const [amount, setAmount] = useState(initialAmount)
  const [term, setTerm] = useState(36)
  const [fullName, setFullName] = useState(user?.name ?? '')
  const [income, setIncome] = useState('')
  const [employment, setEmployment] = useState<string | null>(null)
  const [purpose, setPurpose] = useState('')
  const [agreed, setAgreed] = useState(false)

  const selectedType = loanTypes.find((t) => t.id === type)
  const rate = selectedType?.rate ?? 7.8

  const estimatedPayment = useMemo(() => {
    const r = rate / 100 / 12
    const n = term
    if (r === 0) return amount / n
    return (amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  }, [amount, rate, term])

  const stepValid = [
    !!type && amount > 0,
    fullName.trim().length > 1 && income.trim().length > 0 && !!employment,
    agreed,
  ]

  const handleSubmit = async () => {
    if (!token || !selectedType) return
    setSubmitError('')
    setSubmitting(true)
    try {
      const { loan } = await loanApi.apply(token, {
        name: purpose.trim() || `${selectedType.label} Loan`,
        type: selectedType.apiType,
        lender: 'Crestmark Private Lending',
        principal: amount,
        rate,
        termMonths: term,
      })
      setCreatedLoan(loan)
      setSubmitted(true)
      onLoanCreated?.(loan)
      refreshNotifications()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    // Reset state on close
    setStep(0)
    setSubmitted(false)
    setCreatedLoan(null)
    setType(null)
    setAmount(initialAmount)
    setTerm(36)
    setFullName(user?.name ?? '')
    setIncome('')
    setEmployment(null)
    setPurpose('')
    setAgreed(false)
    setSubmitError('')
    onClose()
  }

  if (!open) return null

  const summaryRows: [string, string][] = [
    ['Loan Type', selectedType?.label ?? '—'],
    ['Amount', currency(amount)],
    ['Term', `${term} months`],
    ['Estimated APR', `${rate}%`],
    ['Estimated Payment', `${currency(estimatedPayment)}/mo`],
    ['Applicant', fullName || '—'],
    ['Annual Income', income ? currency(Number(income)) : '—'],
    ['Employment', employment ?? '—'],
  ]

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} aria-hidden="true" />
      <div className="relative w-full max-w-[560px] max-h-[88vh] overflow-y-auto bg-bg-card border border-border rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border sticky top-0 bg-bg-card z-10">
          <div>
            <h2 className="font-display text-lg text-text-primary">
              {submitted ? 'Application Submitted' : 'Apply for a Loan'}
            </h2>
            {!submitted && (
              <p className="text-xs text-text-muted mt-0.5">
                Step {step + 1} of {steps.length} · {steps[step]}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors duration-150"
            aria-label="Close"
          >
            <i className="ti ti-x" style={{ fontSize: 16 }} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {submitted ? (
            <div className="flex flex-col items-center text-center gap-4 py-2">
              <span className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center">
                <i className="ti ti-circle-check" style={{ fontSize: 32 }} aria-hidden="true" />
              </span>
              <div>
                <p className="text-text-primary font-medium">Your application has been received</p>
                <p className="text-sm text-text-muted mt-1.5 max-w-[380px] mx-auto">
                  We&apos;ll review your {selectedType?.label.toLowerCase()} loan request for{' '}
                  {currency(amount)} and follow up within 1–2 business days.
                </p>
              </div>
              {createdLoan && (
                <div className="w-full grid grid-cols-2 gap-3 mt-2">
                  <div className="p-4 rounded-lg bg-bg-elevated border border-border text-left">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted">Loan ID</p>
                    <p className="font-mono text-sm text-text-primary mt-1 truncate">{createdLoan._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-bg-elevated border border-border text-left">
                    <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted">Est. Monthly Payment</p>
                    <p className="font-mono text-sm text-text-primary mt-1">{currency(createdLoan.monthlyPayment)}/mo</p>
                  </div>
                </div>
              )}
              <Button variant="primary" fullWidth className="mt-2" onClick={handleClose}>
                Done
              </Button>
            </div>
          ) : (
            <>
              {step === 0 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="text-[11px] tracking-[0.1em] uppercase text-text-muted font-medium mb-2 block">
                      Loan Type
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {loanTypes.map((lt) => (
                        <button
                          key={lt.id}
                          onClick={() => setType(lt.id)}
                          className={`flex flex-col items-center gap-2 p-3.5 rounded-lg border transition-colors duration-150 ${
                            type === lt.id
                              ? 'border-gold/40 bg-gold/[0.07]'
                              : 'border-border bg-bg-elevated hover:border-border-strong'
                          }`}
                        >
                          <i
                            className={`ti ${lt.icon} text-text-secondary`}
                            style={{ fontSize: 20 }}
                            aria-hidden="true"
                          />
                          <span className="text-xs text-text-primary font-medium text-center">
                            {lt.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] tracking-[0.1em] uppercase text-text-muted font-medium">
                        Loan Amount
                      </label>
                      <span className="text-sm font-mono text-text-primary">{currency(amount)}</span>
                    </div>
                    <input type="range" min={1000} max={150000} step={500} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full accent-[#c9a84c]" />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] tracking-[0.1em] uppercase text-text-muted font-medium">
                        Term (months)
                      </label>
                      <span className="text-sm font-mono text-text-primary">{term}</span>
                    </div>
                    <input type="range" min={6} max={84} step={6} value={term} onChange={(e) => setTerm(Number(e.target.value))} className="w-full accent-[#c9a84c]" />
                  </div>

                  {type && (
                    <div className="flex items-center justify-between p-4 rounded-lg bg-bg-elevated border border-border">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted">Estimated APR</p>
                        <p className="font-mono text-sm text-text-primary mt-1">{rate}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted">Est. Monthly Payment</p>
                        <p className="font-mono text-sm text-text-primary mt-1">{currency(estimatedPayment)}/mo</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 1 && (
                <div className="flex flex-col gap-5">
                  <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
                  <Input
                    label="Annual Income"
                    prefix="$"
                    value={income}
                    onChange={(e) => setIncome(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="120,000"
                    inputMode="numeric"
                  />
                  <div>
                    <label className="text-[11px] tracking-[0.1em] uppercase text-text-muted font-medium mb-2 block">
                      Employment Status
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {employmentOptions.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setEmployment(opt)}
                          className={`text-sm font-medium px-4 py-2.5 rounded-md border transition-colors duration-150 ${
                            employment === opt
                              ? 'bg-gold/[0.12] border-gold/40 text-gold'
                              : 'bg-bg-elevated border-border text-text-secondary hover:text-text-primary hover:border-border-strong'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Input
                    label="Purpose / Loan Name (optional)"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Home renovation"
                  />
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-5">
                  {submitError && (
                    <p className="text-xs text-danger p-3 bg-danger/[0.08] rounded-md border border-danger/20">{submitError}</p>
                  )}
                  <div className="rounded-lg border border-border overflow-hidden">
                    {summaryRows.map(([k, v], i) => (
                      <div
                        key={k}
                        className={`flex items-center justify-between px-4 py-3 ${i % 2 === 0 ? 'bg-bg-elevated' : 'bg-transparent'} border-b border-border last:border-b-0`}
                      >
                        <span className="text-xs text-text-muted">{k}</span>
                        <span className="text-sm text-text-primary font-medium font-mono">{v}</span>
                      </div>
                    ))}
                  </div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 accent-[#c9a84c] w-4 h-4"
                    />
                    <span className="text-xs text-text-secondary">
                      I authorise Crestmark to review my credit and confirm that the information
                      provided is accurate to the best of my knowledge.
                    </span>
                  </label>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!submitted && (
          <div className="flex items-center justify-between px-6 py-5 border-t border-border sticky bottom-0 bg-bg-card">
            <Button
              variant="ghost"
              onClick={() => (step === 0 ? handleClose() : setStep((s) => s - 1))}
            >
              {step === 0 ? 'Cancel' : 'Back'}
            </Button>
            <Button
              variant="primary"
              icon={step === steps.length - 1 ? 'ti-send' : 'ti-arrow-right'}
              iconPosition="right"
              disabled={!stepValid[step]}
              loading={submitting}
              onClick={() => (step === steps.length - 1 ? handleSubmit() : setStep((s) => s + 1))}
            >
              {step === steps.length - 1 ? 'Submit Application' : 'Continue'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
