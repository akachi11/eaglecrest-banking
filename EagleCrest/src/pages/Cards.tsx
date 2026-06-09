import React, { useEffect, useState } from 'react'
import { Badge, Button, Card, CardHeader } from '../components'
import { cardApi, type ApiCard } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useBanking } from '../context/BankingContext'
import { CardApplicationModal } from '../components/CardApplicationModal/CardApplicationModal'

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })

const Toggle: React.FC<{
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description: string
  icon: string
  disabled?: boolean
}> = ({ checked, onChange, label, description, icon, disabled }) => (
  <div className="flex items-center justify-between py-3.5 border-b border-border last:border-b-0">
    <div className="flex items-center gap-3 min-w-0">
      <span className="w-9 h-9 rounded-md bg-bg-elevated border border-border flex items-center justify-center text-text-secondary shrink-0">
        <i className={`ti ${icon}`} style={{ fontSize: 16 }} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-text-primary font-medium truncate">{label}</p>
        <p className="text-xs text-text-muted truncate">{description}</p>
      </div>
    </div>
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full shrink-0 border transition-colors duration-150 disabled:opacity-40 ${
        checked ? 'bg-gold border-gold' : 'bg-bg-elevated border-border'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-bg-base transition-transform duration-150 ${
          checked ? 'translate-x-[20px]' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
)

// ── Main page ─────────────────────────────────────────────────────────────────
const Cards = () => {
  const { token } = useAuth()
  const { recentTransactions } = useBanking()

  const [cards, setCards] = useState<ApiCard[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [freezeLoading, setFreezeLoading] = useState(false)
  const [contactless, setContactless] = useState(true)
  const [onlinePayments, setOnlinePayments] = useState(true)
  const [showApplyModal, setShowApplyModal] = useState(false)

  useEffect(() => {
    if (!token) return
    cardApi
      .list(token)
      .then(({ cards }) => {
        setCards(cards)
        // prefer active cards as the default selection
        const firstActive = cards.find((c) => c.status === 'active') ?? cards[0]
        if (firstActive) setActiveId(firstActive._id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  const active = cards.find((c) => c._id === activeId)
  const isPending = active?.status === 'pending'

  const handleFreeze = async () => {
    if (!token || !activeId || isPending) return
    setFreezeLoading(true)
    try {
      const { card } = await cardApi.toggleFreeze(token, activeId)
      setCards((prev) => prev.map((c) => (c._id === card._id ? card : c)))
    } catch {}
    setFreezeLoading(false)
  }

  const spendingTotal = recentTransactions
    .filter((t) => t.type === 'debit' && t.status === 'completed')
    .reduce((s, t) => s + t.amount, 0)

  const spendingLimit = active?.spendingLimit ?? 0
  const usagePct = spendingLimit > 0 ? Math.min(100, Math.round((spendingTotal / spendingLimit) * 100)) : 0

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-medium text-text-primary">Cards</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your physical and virtual cards</p>
        </div>
        <Button variant="primary" icon="ti-plus" onClick={() => setShowApplyModal(true)}>
          Apply for a Card
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <i className="ti ti-loader-2 animate-spin text-gold text-2xl" aria-hidden="true" />
        </div>
      ) : cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <span className="w-16 h-16 rounded-full bg-bg-elevated border border-border flex items-center justify-center">
            <i className="ti ti-credit-card text-text-muted text-3xl" aria-hidden="true" />
          </span>
          <div className="text-center">
            <p className="text-sm text-text-primary font-medium">No cards yet</p>
            <p className="text-xs text-text-muted mt-1">Apply for a card to get started</p>
          </div>
          <Button variant="primary" icon="ti-plus" onClick={() => setShowApplyModal(true)}>
            Apply for a Card
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            {/* Card carousel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {cards.map((c) => {
                const cardColor = c.color ?? '#C9A84C'
                const cardPending = c.status === 'pending'
                return (
                  <button
                    key={c._id}
                    onClick={() => { setActiveId(c._id); setRevealed(false) }}
                    className={`relative overflow-hidden rounded-xl border p-5 h-[180px] flex flex-col justify-between text-left transition-colors duration-150 ${
                      activeId === c._id ? 'border-gold/40' : 'border-border hover:border-border-strong'
                    } ${cardPending ? 'opacity-80' : ''}`}
                    style={{ background: `linear-gradient(135deg, ${cardColor}22 0%, #161616 60%, #0f0f0f 100%)` }}
                  >
                    {/* glow */}
                    <div
                      className="pointer-events-none absolute -right-14 -top-14 w-48 h-48 rounded-full opacity-[0.1]"
                      style={{ background: `radial-gradient(circle, ${cardColor} 0%, transparent 70%)` }}
                    />
                    <div className="flex items-start justify-between relative">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-text-muted">
                          {c.isVirtual ? 'Virtual' : 'Physical'} Card
                        </p>
                        <p className="font-display text-base text-text-primary mt-1">{c.cardName}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {cardPending && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Pending Approval
                          </span>
                        )}
                        {!cardPending && c.isFrozen && <Badge variant="info">Frozen</Badge>}
                        {!cardPending && !c.isFrozen && activeId === c._id && <Badge variant="success" dot>Active</Badge>}
                      </div>
                    </div>
                    <div className="relative">
                      <p className="font-mono text-sm text-text-secondary tracking-[0.12em]">
                        •••• •••• •••• {cardPending ? '····' : c.lastFour}
                      </p>
                    </div>
                    <div className="flex items-end justify-between relative">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-text-muted">
                          {cardPending ? 'Status' : 'Expires'}
                        </p>
                        <p className="font-mono text-xs text-text-secondary mt-0.5">
                          {cardPending ? 'Under Review' : c.expiry}
                        </p>
                      </div>
                      <span
                        className="font-display italic text-lg capitalize"
                        style={{ color: cardColor }}
                      >
                        {c.cardType}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Card details */}
            {active && (
              <Card padding="lg">
                <CardHeader
                  title={isPending ? 'Application Details' : 'Card Details'}
                  action={
                    !isPending ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={revealed ? 'ti-eye-off' : 'ti-eye'}
                        onClick={() => setRevealed((v) => !v)}
                      >
                        {revealed ? 'Hide' : 'Reveal'}
                      </Button>
                    ) : undefined
                  }
                />
                {isPending ? (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-500/[0.06] border border-amber-500/20">
                    <i className="ti ti-clock text-amber-400 mt-0.5" style={{ fontSize: 18 }} aria-hidden="true" />
                    <div>
                      <p className="text-sm text-amber-300 font-medium">Application Under Review</p>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        Your card application is being processed. This usually takes 1–2 business days. You'll receive a notification once it's approved.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted mb-1">Card Number</p>
                      <p className="font-mono text-sm text-text-primary">•••• •••• •••• {active.lastFour}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted mb-1">Expiry</p>
                      <p className="font-mono text-sm text-text-primary">{active.expiry}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted mb-1">CVV</p>
                      <p className="font-mono text-sm text-text-primary">{revealed ? '•••' : '•••'}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted mb-1">Type</p>
                      <p className="text-sm text-text-primary capitalize">{active.isVirtual ? 'Virtual' : 'Physical'}</p>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Recent activity */}
            <Card padding="lg">
              <CardHeader
                title="Recent Activity"
                action={
                  <Button variant="ghost" size="sm" icon="ti-arrow-right" iconPosition="right">
                    View all
                  </Button>
                }
              />
              {recentTransactions.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-6">No recent activity</p>
              ) : (
                <div className="flex flex-col">
                  {recentTransactions.slice(0, 4).map((txn) => (
                    <div
                      key={txn._id}
                      className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            background: txn.iconBg ?? 'rgba(201,168,76,0.12)',
                            color: txn.iconColor ?? '#C9A84C',
                          }}
                        >
                          <i
                            className={`ti ${txn.icon ?? 'ti-circle'}`}
                            style={{ fontSize: 17 }}
                            aria-hidden="true"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-text-primary font-medium truncate">{txn.name}</p>
                          <p className="text-xs text-text-muted">{txn.category}</p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-medium font-mono ${
                          txn.type === 'credit' ? 'text-success' : 'text-text-primary'
                        }`}
                      >
                        {txn.type === 'credit' ? '+' : '−'}
                        {currency(txn.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {/* Spending limit */}
            {active && !isPending && (
              <Card padding="lg">
                <CardHeader title="Spending Limit" />
                {spendingLimit > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-text-secondary">{currency(spendingTotal)} spent</span>
                      <span className="text-sm font-medium text-text-primary font-mono">
                        {currency(spendingLimit)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                      <div
                        className={`h-full rounded-full ${usagePct > 85 ? 'bg-danger' : 'bg-gold'}`}
                        style={{ width: `${usagePct}%` }}
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-2">{usagePct}% of limit used</p>
                  </>
                ) : (
                  <p className="text-sm text-text-muted">No spending limit set</p>
                )}
              </Card>
            )}

            {/* Controls */}
            {active && (
              <Card padding="lg">
                <CardHeader title="Card Controls" />
                {isPending ? (
                  <p className="text-xs text-text-muted py-2">
                    Controls are unavailable while your card application is pending approval.
                  </p>
                ) : (
                  <div className="flex flex-col">
                    <Toggle
                      checked={active.isFrozen}
                      onChange={handleFreeze}
                      label="Freeze Card"
                      description={
                        active.isFrozen
                          ? 'Card is frozen — no transactions allowed'
                          : 'Temporarily block all transactions'
                      }
                      icon="ti-snowflake"
                      disabled={freezeLoading}
                    />
                    <Toggle
                      checked={contactless}
                      onChange={setContactless}
                      label="Contactless Payments"
                      description="Tap to pay at terminals"
                      icon="ti-wifi"
                    />
                    <Toggle
                      checked={onlinePayments}
                      onChange={setOnlinePayments}
                      label="Online Payments"
                      description="Allow purchases without the physical card"
                      icon="ti-world"
                    />
                  </div>
                )}
              </Card>
            )}

            <Card padding="lg" className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-md bg-info/10 text-info flex items-center justify-center shrink-0">
                <i className="ti ti-headset" style={{ fontSize: 17 }} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm text-text-primary font-medium">Lost or stolen card?</p>
                <p className="text-xs text-text-muted mt-1">
                  Contact our 24/7 concierge line to block and reissue instantly.
                </p>
                <Button variant="secondary" size="sm" className="mt-3">
                  Contact Support
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      <CardApplicationModal
        open={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onCardCreated={(card) => {
          setCards((prev) => [...prev, card])
          setActiveId(card._id)
          setShowApplyModal(false)
        }}
      />
    </div>
  )
}

export default Cards
