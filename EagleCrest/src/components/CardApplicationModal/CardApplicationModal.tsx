import React, { useState } from 'react'
import { Button } from '../index'
import { cardApi, type ApiCard } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'

// ─── step definitions ─────────────────────────────────────────────────────────

const STEPS = ['Card Type', 'Network & Design', 'Spending Limit', 'Review']

// ─── option data ─────────────────────────────────────────────────────────────

const CARD_TYPES = [
  {
    id: 'standard',
    label: 'Standard',
    description: 'Everyday purchases, no annual fee',
    icon: 'ti-credit-card',
  },
  {
    id: 'premium',
    label: 'Premium',
    description: 'Higher limits, travel rewards',
    icon: 'ti-diamond',
  },
  {
    id: 'virtual',
    label: 'Virtual',
    description: 'Online & digital payments only',
    icon: 'ti-device-mobile',
  },
] as const

const NETWORKS = [
  { id: 'visa' as const, label: 'Visa', icon: 'ti-letter-v' },
  { id: 'mastercard' as const, label: 'Mastercard', icon: 'ti-circles' },
]

const CARD_COLORS = [
  { id: '#C9A84C', label: 'Gold' },
  { id: '#1a1a2e', label: 'Midnight' },
  { id: '#0a2342', label: 'Navy' },
  { id: '#1a1a1a', label: 'Obsidian' },
  { id: '#2d4a22', label: 'Forest' },
  { id: '#4a1a2e', label: 'Burgundy' },
]

const LIMITS = [
  { value: 1000, label: '$1,000' },
  { value: 2500, label: '$2,500' },
  { value: 5000, label: '$5,000' },
  { value: 10000, label: '$10,000' },
  { value: 25000, label: '$25,000' },
  { value: 0, label: 'No Limit' },
]

// ─── mini card preview ────────────────────────────────────────────────────────

const CardPreview: React.FC<{
  network: 'visa' | 'mastercard'
  color: string
  label: string
  isVirtual: boolean
}> = ({ network, color, label, isVirtual }) => (
  <div
    className="relative w-full aspect-[1.586/1] rounded-xl overflow-hidden flex flex-col justify-between p-4 shadow-xl"
    style={{ background: color }}
  >
    <div className="flex items-center justify-between">
      <span className="text-white/60 text-[10px] uppercase tracking-widest font-mono">
        {isVirtual ? 'Virtual' : 'EagleCrest'}
      </span>
      <span className="text-white/80 text-xs font-medium">{label}</span>
    </div>
    <div className="flex flex-col gap-1">
      <span className="font-mono text-white/50 tracking-widest text-sm">•••• •••• •••• ????</span>
      <div className="flex items-center justify-between">
        <span className="text-white/50 text-[10px]">MM / YY</span>
        <span className="text-white font-semibold text-sm uppercase">{network}</span>
      </div>
    </div>
  </div>
)

// ─── main component ───────────────────────────────────────────────────────────

interface CardApplicationModalProps {
  open: boolean
  onClose: () => void
  onCardCreated?: (card: ApiCard) => void
}

export const CardApplicationModal: React.FC<CardApplicationModalProps> = ({
  open,
  onClose,
  onCardCreated,
}) => {
  const { token } = useAuth()
  const { refreshNotifications } = useNotifications()

  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [createdCard, setCreatedCard] = useState<ApiCard | null>(null)

  // step 0 — card type
  const [cardTypeId, setCardTypeId] = useState<string | null>(null)

  // step 1 — network + design
  const [network, setNetwork] = useState<'visa' | 'mastercard'>('visa')
  const [color, setColor] = useState('#C9A84C')
  const [cardName, setCardName] = useState('')

  // step 2 — spending limit
  const [limitValue, setLimitValue] = useState<number>(5000)

  const isVirtual = cardTypeId === 'virtual'
  const selectedType = CARD_TYPES.find((t) => t.id === cardTypeId)

  const stepValid = [
    !!cardTypeId,
    true, // network and color always have defaults
    true,
    true, // review just needs agreement via submit button
  ]

  const handleSubmit = async () => {
    if (!token || !selectedType) return
    setSubmitError('')
    setSubmitting(true)
    try {
      const { card } = await cardApi.apply(token, {
        cardType: network,
        cardName: cardName.trim() || `${selectedType.label} ${network.charAt(0).toUpperCase() + network.slice(1)}`,
        isVirtual,
        spendingLimit: limitValue > 0 ? limitValue : undefined,
        color,
      })
      setCreatedCard(card)
      setSubmitted(true)
      onCardCreated?.(card)
      refreshNotifications()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit application')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep(0)
    setSubmitted(false)
    setCreatedCard(null)
    setCardTypeId(null)
    setNetwork('visa')
    setColor('#C9A84C')
    setCardName('')
    setLimitValue(5000)
    setSubmitError('')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} aria-hidden="true" />
      <div className="relative w-full max-w-[520px] max-h-[88vh] overflow-y-auto bg-bg-card border border-border rounded-xl shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border sticky top-0 bg-bg-card z-10">
          <div>
            <h2 className="font-display text-lg text-text-primary">
              {submitted ? 'Application Submitted' : 'Apply for a Card'}
            </h2>
            {!submitted && (
              <p className="text-xs text-text-muted mt-0.5">
                Step {step + 1} of {STEPS.length} · {STEPS[step]}
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

        {/* Step progress */}
        {!submitted && (
          <div className="px-6 pt-5 flex gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-colors duration-300"
                style={{ background: i <= step ? '#C9A84C' : 'rgba(255,255,255,0.1)' }}
              />
            ))}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-6">
          {submitted ? (
            /* ── success ── */
            <div className="flex flex-col items-center text-center gap-4 py-2">
              <span className="w-16 h-16 rounded-full bg-gold/10 text-gold flex items-center justify-center">
                <i className="ti ti-circle-check" style={{ fontSize: 32 }} aria-hidden="true" />
              </span>
              <div>
                <p className="text-text-primary font-medium">Application under review</p>
                <p className="text-sm text-text-muted mt-1.5 max-w-[360px] mx-auto">
                  Your card application has been received. It will appear as <strong className="text-amber-400">Pending</strong> in your cards until approved — usually 1–2 business days.
                </p>
              </div>
              {createdCard && (
                <div className="w-full max-w-[260px]">
                  <CardPreview
                    network={createdCard.cardType}
                    color={createdCard.color ?? '#C9A84C'}
                    label={createdCard.cardName}
                    isVirtual={createdCard.isVirtual}
                  />
                </div>
              )}
              <Button variant="primary" fullWidth className="mt-2" onClick={handleClose}>
                Done
              </Button>
            </div>
          ) : (
            <>
              {/* ── step 0: card type ── */}
              {step === 0 && (
                <div className="flex flex-col gap-3">
                  {CARD_TYPES.map((ct) => (
                    <button
                      key={ct.id}
                      onClick={() => setCardTypeId(ct.id)}
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-colors duration-150 text-left ${
                        cardTypeId === ct.id
                          ? 'border-gold/40 bg-gold/[0.07]'
                          : 'border-border bg-bg-elevated hover:border-border-strong'
                      }`}
                    >
                      <span
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          cardTypeId === ct.id ? 'bg-gold/20 text-gold' : 'bg-bg-base text-text-secondary'
                        }`}
                      >
                        <i className={`ti ${ct.icon}`} style={{ fontSize: 20 }} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-text-primary font-medium text-sm">{ct.label}</p>
                        <p className="text-text-muted text-xs mt-0.5">{ct.description}</p>
                      </div>
                      {cardTypeId === ct.id && (
                        <i className="ti ti-check ml-auto text-gold" style={{ fontSize: 18 }} aria-hidden="true" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* ── step 1: network + design ── */}
              {step === 1 && (
                <div className="flex flex-col gap-6">
                  {/* live preview */}
                  <div className="max-w-[280px] mx-auto w-full">
                    <CardPreview
                      network={network}
                      color={color}
                      label={cardName || (selectedType?.label ?? 'Card')}
                      isVirtual={isVirtual}
                    />
                  </div>

                  {/* network */}
                  <div>
                    <label className="text-[11px] tracking-[0.1em] uppercase text-text-muted font-medium mb-2 block">
                      Card Network
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {NETWORKS.map((n) => (
                        <button
                          key={n.id}
                          onClick={() => setNetwork(n.id)}
                          className={`flex items-center justify-center gap-2 py-3 rounded-lg border transition-colors duration-150 font-medium text-sm ${
                            network === n.id
                              ? 'border-gold/40 bg-gold/[0.07] text-gold'
                              : 'border-border bg-bg-elevated text-text-secondary hover:border-border-strong hover:text-text-primary'
                          }`}
                        >
                          <i className={`ti ${n.icon}`} style={{ fontSize: 16 }} aria-hidden="true" />
                          {n.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* color */}
                  <div>
                    <label className="text-[11px] tracking-[0.1em] uppercase text-text-muted font-medium mb-2 block">
                      Card Color
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {CARD_COLORS.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setColor(c.id)}
                          title={c.label}
                          className={`w-9 h-9 rounded-full border-2 transition-transform duration-150 ${
                            color === c.id ? 'border-gold scale-110' : 'border-transparent hover:scale-105'
                          }`}
                          style={{ background: c.id }}
                          aria-label={c.label}
                        />
                      ))}
                    </div>
                  </div>

                  {/* card nickname */}
                  <div>
                    <label className="text-[11px] tracking-[0.1em] uppercase text-text-muted font-medium mb-1.5 block">
                      Card Nickname <span className="normal-case">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder={`e.g. My ${selectedType?.label ?? ''} Card`}
                      maxLength={30}
                      className="w-full bg-bg-elevated border border-border rounded-md px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-gold/50 transition-colors duration-150"
                    />
                  </div>
                </div>
              )}

              {/* ── step 2: spending limit ── */}
              {step === 2 && (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-text-secondary">
                    Set a monthly spending limit for this card. You can always change it later.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {LIMITS.map((l) => (
                      <button
                        key={l.value}
                        onClick={() => setLimitValue(l.value)}
                        className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors duration-150 ${
                          limitValue === l.value
                            ? 'border-gold/40 bg-gold/[0.07] text-gold'
                            : 'border-border bg-bg-elevated text-text-secondary hover:border-border-strong hover:text-text-primary'
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── step 3: review ── */}
              {step === 3 && (
                <div className="flex flex-col gap-5">
                  {submitError && (
                    <p className="text-xs text-danger p-3 bg-danger/[0.08] rounded-md border border-danger/20">
                      {submitError}
                    </p>
                  )}
                  <div className="max-w-[220px] mx-auto w-full">
                    <CardPreview
                      network={network}
                      color={color}
                      label={cardName || (selectedType?.label ?? 'Card')}
                      isVirtual={isVirtual}
                    />
                  </div>
                  <div className="rounded-lg border border-border overflow-hidden">
                    {[
                      ['Card Type', selectedType?.label ?? '—'],
                      ['Network', network.charAt(0).toUpperCase() + network.slice(1)],
                      ['Physical / Virtual', isVirtual ? 'Virtual' : 'Physical'],
                      ['Monthly Limit', limitValue > 0 ? `$${limitValue.toLocaleString()}` : 'No limit'],
                      ['Card Name', cardName || `${selectedType?.label ?? ''} ${network}`],
                    ].map(([k, v], i) => (
                      <div
                        key={k}
                        className={`flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0 ${i % 2 === 0 ? 'bg-bg-elevated' : 'bg-transparent'}`}
                      >
                        <span className="text-xs text-text-muted">{k}</span>
                        <span className="text-sm text-text-primary font-medium">{v}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    By submitting you authorise EagleCrest to process your card application. Subject to credit approval.
                  </p>
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
              icon={step === STEPS.length - 1 ? 'ti-send' : 'ti-arrow-right'}
              iconPosition="right"
              disabled={!stepValid[step]}
              loading={submitting}
              onClick={() => (step === STEPS.length - 1 ? handleSubmit() : setStep((s) => s + 1))}
            >
              {step === STEPS.length - 1 ? 'Submit Application' : 'Continue'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
