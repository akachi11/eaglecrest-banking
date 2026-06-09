import { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Card, CardHeader, StatCard } from '../components'
import { loanApi, type ApiLoan } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { LoanApplicationModal } from '../components/LoanApplicationModal/LoanApplicationModal'
import { useNotifications } from '../context/NotificationContext'

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })

const dueDateLabel = (iso?: string) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const Loans = () => {
  const { token } = useAuth()
  const { refreshNotifications } = useNotifications()
  const [loans, setLoans] = useState<ApiLoan[]>([])
  const [loading, setLoading] = useState(true)
  const [paidId, setPaidId] = useState<string | null>(null)
  const [payLoading, setPayLoading] = useState<string | null>(null)
  const [applyOpen, setApplyOpen] = useState(false)
  const [applyAmount, setApplyAmount] = useState(10000)
  const [calcAmount, setCalcAmount] = useState(20000)
  const [calcRate, setCalcRate] = useState(6.5)
  const [calcTerm, setCalcTerm] = useState(36)

  useEffect(() => {
    if (!token) return
    loanApi
      .list(token)
      .then(({ loans }) => setLoans(loans))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  const activeLoans = loans.filter((l) => l.status === 'active')
  const totalBalance = activeLoans.reduce((s, l) => s + l.balance, 0)
  const totalMonthly = activeLoans.reduce((s, l) => s + l.monthlyPayment, 0)
  const avgRate =
    activeLoans.length > 0
      ? (activeLoans.reduce((s, l) => s + l.rate, 0) / activeLoans.length).toFixed(1)
      : '—'

  const upcoming = useMemo(
    () =>
      [...activeLoans].sort(
        (a, b) =>
          new Date(a.nextDue ?? '').getTime() - new Date(b.nextDue ?? '').getTime(),
      ),
    [activeLoans],
  )

  const estimatedPayment = useMemo(() => {
    const r = calcRate / 100 / 12
    const n = calcTerm
    if (r === 0) return calcAmount / n
    return (calcAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  }, [calcAmount, calcRate, calcTerm])

  const handlePay = async (id: string) => {
    if (!token) return
    setPayLoading(id)
    try {
      const { loan } = await loanApi.pay(token, id)
      setLoans((prev) => prev.map((l) => (l._id === loan._id ? loan : l)))
      setPaidId(id)
      setTimeout(() => setPaidId((cur) => (cur === id ? null : cur)), 1800)
    } catch {}
    setPayLoading(null)
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-medium text-text-primary">Loans</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage active loans, payments, and financing offers
          </p>
        </div>
        <Button
          variant="primary"
          icon="ti-plus"
          onClick={() => { setApplyAmount(10000); setApplyOpen(true) }}
        >
          Apply for a Loan
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Loans"
          value={String(activeLoans.length)}
          delta={activeLoans.length === 0 ? 'No active loans' : 'All in good standing'}
          deltaUp
          icon="ti-report-money"
        />
        <StatCard
          label="Total Balance"
          value={totalBalance > 0 ? currency(totalBalance) : '—'}
          delta="Remaining balance"
          deltaUp
          icon="ti-receipt-2"
        />
        <StatCard
          label="Monthly Payments"
          value={totalMonthly > 0 ? currency(totalMonthly) : '—'}
          delta="Auto-pay enabled"
          deltaUp
          icon="ti-calendar-stats"
        />
        <StatCard
          label="Avg. Interest Rate"
          value={avgRate !== '—' ? `${avgRate}%` : '—'}
          delta="Across active loans"
          deltaUp
          icon="ti-percentage"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <i className="ti ti-loader-2 animate-spin text-gold text-2xl" aria-hidden="true" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="xl:col-span-2 flex flex-col gap-4">
            {loans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 bg-bg-card border border-border rounded-lg">
                <span className="w-16 h-16 rounded-full bg-bg-elevated border border-border flex items-center justify-center">
                  <i className="ti ti-report-money text-text-muted text-3xl" aria-hidden="true" />
                </span>
                <div className="text-center">
                  <p className="text-sm text-text-primary font-medium">No active loans</p>
                  <p className="text-xs text-text-muted mt-1">Apply for a loan to get started</p>
                </div>
                <Button variant="primary" icon="ti-plus" onClick={() => setApplyOpen(true)}>
                  Apply for a Loan
                </Button>
              </div>
            ) : (
              loans.map((l) => {
                const pct = Math.round(((l.principal - l.balance) / l.principal) * 100)
                const loanPending = l.status === 'pending'
                return (
                  <Card key={l._id} padding="lg" className={loanPending ? 'opacity-90' : ''}>
                    {loanPending && (
                      <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-amber-500/[0.06] border border-amber-500/20">
                        <i className="ti ti-clock text-amber-400" style={{ fontSize: 15 }} aria-hidden="true" />
                        <span className="text-xs text-amber-300 font-medium">Under Review · 1–2 business days</span>
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span
                          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            background: loanPending ? 'rgba(245,158,11,0.12)' : `${l.color ?? '#C9A84C'}1F`,
                            color: loanPending ? '#f59e0b' : (l.color ?? '#C9A84C'),
                          }}
                        >
                          <i
                            className={`ti ${l.icon ?? 'ti-report-money'}`}
                            style={{ fontSize: 19 }}
                            aria-hidden="true"
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm text-text-primary font-medium truncate">{l.name}</p>
                          <p className="text-xs text-text-muted mt-0.5 truncate">
                            {l.lender ?? l.type} · {l.rate}% APR
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {paidId === l._id && <Badge variant="success" dot>Payment made</Badge>}
                        {l.status === 'paid_off' && <Badge variant="success">Paid Off</Badge>}
                        {loanPending && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Pending
                          </span>
                        )}
                        <span className="text-right">
                          <span className="block text-sm font-medium text-text-primary font-mono">
                            {currency(l.monthlyPayment)}/mo
                          </span>
                          <span className="block text-[11px] text-text-muted mt-0.5">
                            {loanPending ? 'Estimated' : `Due ${dueDateLabel(l.nextDue)}`}
                          </span>
                        </span>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon="ti-credit-card-pay"
                          loading={payLoading === l._id}
                          onClick={() => handlePay(l._id)}
                          disabled={l.balance <= 0 || l.status === 'paid_off' || loanPending}
                        >
                          {loanPending ? 'Pending' : l.balance <= 0 ? 'Paid Off' : 'Pay Now'}
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-text-secondary font-mono">
                          {currency(l.balance)}{' '}
                          <span className="text-text-muted">of {currency(l.principal)}</span>
                        </span>
                        <span className="text-sm font-medium text-text-primary">{loanPending ? 'Pending' : `${pct}% paid off`}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: loanPending ? '100%' : `${pct}%`, background: loanPending ? '#f59e0b' : (l.color ?? '#C9A84C') }}
                        />
                      </div>
                    </div>
                  </Card>
                )
              })
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            {/* Loan calculator */}
            <Card padding="lg">
              <CardHeader title="Loan Calculator" />
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] tracking-[0.1em] uppercase text-text-muted font-medium">
                      Loan Amount
                    </label>
                    <span className="text-sm font-mono text-text-primary">{currency(calcAmount)}</span>
                  </div>
                  <input type="range" min={1000} max={100000} step={500} value={calcAmount} onChange={(e) => setCalcAmount(Number(e.target.value))} className="w-full accent-[#c9a84c]" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] tracking-[0.1em] uppercase text-text-muted font-medium">
                      Interest Rate (APR)
                    </label>
                    <span className="text-sm font-mono text-text-primary">{calcRate.toFixed(1)}%</span>
                  </div>
                  <input type="range" min={1} max={15} step={0.1} value={calcRate} onChange={(e) => setCalcRate(Number(e.target.value))} className="w-full accent-[#c9a84c]" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] tracking-[0.1em] uppercase text-text-muted font-medium">
                      Term (months)
                    </label>
                    <span className="text-sm font-mono text-text-primary">{calcTerm}</span>
                  </div>
                  <input type="range" min={6} max={84} step={6} value={calcTerm} onChange={(e) => setCalcTerm(Number(e.target.value))} className="w-full accent-[#c9a84c]" />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-bg-elevated border border-border mt-1">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted">Estimated Payment</p>
                    <p className="font-display text-2xl text-text-primary mt-1">
                      {currency(estimatedPayment)}
                      <span className="text-sm text-text-muted font-body">/mo</span>
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon="ti-arrow-right"
                    iconPosition="right"
                    onClick={() => { setApplyAmount(calcAmount); setApplyOpen(true) }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </Card>

            {/* Upcoming payments */}
            {upcoming.length > 0 && (
              <Card padding="lg">
                <CardHeader title="Upcoming Payments" />
                <div className="flex flex-col">
                  {upcoming.map((l) => (
                    <div
                      key={l._id}
                      className="flex items-center justify-between py-3 border-b border-border last:border-b-0 gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                          style={{
                            background: `${l.color ?? '#C9A84C'}1F`,
                            color: l.color ?? '#C9A84C',
                          }}
                        >
                          <i
                            className={`ti ${l.icon ?? 'ti-report-money'}`}
                            style={{ fontSize: 16 }}
                            aria-hidden="true"
                          />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm text-text-primary font-medium truncate">{l.name}</p>
                          <p className="text-xs text-text-muted truncate">Due {dueDateLabel(l.nextDue)}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium font-mono text-text-primary shrink-0">
                        {currency(l.monthlyPayment)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Offer */}
            <Card padding="lg" className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-md bg-gold/10 text-gold flex items-center justify-center shrink-0">
                <i className="ti ti-sparkles" style={{ fontSize: 17 }} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm text-text-primary font-medium">Pre-approved offer</p>
                <p className="text-xs text-text-muted mt-1">
                  You&apos;re pre-approved for a {currency(50000)} personal loan at 4.9% APR — no impact to your credit score.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-3"
                  onClick={() => { setApplyAmount(50000); setApplyOpen(true) }}
                >
                  View Offer
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      <LoanApplicationModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        initialAmount={applyAmount}
        onLoanCreated={(loan) => {
          setLoans((prev) => [loan, ...prev])
          refreshNotifications()
          setApplyOpen(false)
        }}
      />
    </div>
  )
}

export default Loans
