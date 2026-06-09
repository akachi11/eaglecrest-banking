import { useNavigate } from 'react-router-dom'
import { Avatar, Badge, Button, Card, CardHeader, StatCard } from '../components'
import { useBanking } from '../context/BankingContext'
import { useAuth } from '../context/AuthContext'
import type { TransactionStatus } from '../types'

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })

const dateLabel = (iso: string) => {
  const d = new Date(iso)
  const today = new Date()
  const diffDays = Math.round(
    (today.setHours(0, 0, 0, 0) - new Date(d).setHours(0, 0, 0, 0)) / 86400000,
  )
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const statusVariant: Record<TransactionStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  completed: 'success',
  pending: 'warning',
  processing: 'info',
  failed: 'danger',
}

const CATEGORY_COLORS: Record<string, string> = {
  Housing: '#C9A84C',
  Food: '#4CAF82',
  Groceries: '#4CAF82',
  Shopping: '#E05555',
  Transport: '#5B9BD5',
  Subscription: '#9A9590',
  Income: '#4CAF82',
  Transfer: '#5B9BD5',
  Other: '#9A9590',
}

const Home = () => {
  const { user } = useAuth()
  const { account, recentTransactions, cashFlow, spending, loading } = useBanking()
  const navigate = useNavigate()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const latestMonth = cashFlow[cashFlow.length - 1]
  const income = latestMonth?.income ?? 0
  const expenses = latestMonth?.expenses ?? 0
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0
  const maxFlow = Math.max(...cashFlow.flatMap((c) => [c.income, c.expenses]), 1)

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'EC'

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <i className="ti ti-loader-2 animate-spin text-gold text-2xl" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-medium text-text-primary">
            {greeting}, {firstName}
          </h1>
          <p className="text-sm text-text-secondary mt-1">{todayLabel} · Here&apos;s your financial overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="px-10" variant="ghost" icon="ti-plus" size="md" onClick={() => navigate('/transfer')}>
            Add Money
          </Button>
          <Button variant="primary" icon="ti-send" size="md" onClick={() => navigate('/transfer')}>
            Send
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Balance"
          value={account ? currency(account.balance) : '—'}
          delta="Available balance"
          deltaUp
          icon="ti-wallet"
        />
        <StatCard
          label="Income"
          value={income > 0 ? currency(income) : '—'}
          delta="This month"
          deltaUp
          icon="ti-arrow-down-circle"
        />
        <StatCard
          label="Expenses"
          value={expenses > 0 ? currency(expenses) : '—'}
          delta="This month"
          deltaUp={false}
          icon="ti-arrow-up-circle"
        />
        <StatCard
          label="Savings Rate"
          value={income > 0 ? `${savingsRate}%` : '—'}
          delta="Income vs expenses"
          deltaUp={savingsRate > 0}
          icon="ti-pig"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Card visual */}
          {account && (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1c1a14] via-[#161616] to-[#0f0f0f] border border-border p-6 h-[200px] flex flex-col justify-between">
              <div
                className="pointer-events-none absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-[0.12]"
                style={{ background: 'radial-gradient(circle, var(--color-gold) 0%, transparent 70%)' }}
              />
              <div className="flex items-start justify-between relative">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">
                    EagleCrest Private Account
                  </p>
                  <p className="font-display text-lg text-text-primary mt-1">{user?.name}</p>
                </div>
                <i className="ti ti-cards text-gold text-2xl" aria-hidden="true" />
              </div>
              <div className="relative">
                <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted mb-1">Available Balance</p>
                <p className="font-display text-3xl font-medium text-text-primary">
                  {currency(account.balance)}
                </p>
              </div>
              <div className="flex items-end justify-between relative">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">Card Number</p>
                  <p className="font-mono text-sm text-text-secondary tracking-[0.12em] mt-1">
                    •••• •••• •••• {account.number}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">Expires</p>
                  <p className="font-mono text-sm text-text-secondary mt-1">{account.cardExpiry}</p>
                </div>
                <span className="font-display italic text-xl text-gold capitalize">{account.cardType}</span>
              </div>
            </div>
          )}

          {/* Recent transactions */}
          <Card padding="lg">
            <CardHeader
              title="Recent Transactions"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  icon="ti-arrow-right"
                  iconPosition="right"
                  onClick={() => navigate('/transactions')}
                >
                  View all
                </Button>
              }
            />
            {recentTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <i className="ti ti-receipt-off text-3xl text-text-muted" aria-hidden="true" />
                <p className="text-sm text-text-secondary">No transactions yet</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {recentTransactions.slice(0, 6).map((txn) => (
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
                        <p className="text-xs text-text-muted">
                          {txn.category} · {dateLabel(txn.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={statusVariant[txn.status]}>{txn.status}</Badge>
                      <span
                        className={`text-sm font-medium font-mono ${txn.type === 'credit' ? 'text-success' : 'text-text-primary'}`}
                      >
                        {txn.type === 'credit' ? '+' : '−'}
                        {currency(txn.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Spending breakdown */}
          <Card padding="lg">
            <CardHeader title="Spending Breakdown" />
            {spending.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">No spending data this month</p>
            ) : (
              <div className="flex flex-col gap-4">
                {spending.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-text-secondary">{cat.name}</span>
                      <span className="text-sm font-medium text-text-primary font-mono">
                        {currency(cat.amount)}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${cat.percentage}%`,
                          background: CATEGORY_COLORS[cat.name] ?? '#9A9590',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Cash flow */}
          <Card padding="lg">
            <CardHeader title="Cash Flow" />
            {cashFlow.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">No cash flow data yet</p>
            ) : (
              <>
                <div className="flex items-end justify-between gap-2 h-[140px]">
                  {cashFlow.map((entry) => (
                    <div
                      key={entry.month}
                      className="flex flex-col items-center gap-2 flex-1 h-full justify-end"
                    >
                      <div className="flex items-end gap-1 h-full w-full justify-center">
                        <div
                          className="w-2.5 rounded-t-sm bg-gold"
                          style={{ height: `${(entry.income / maxFlow) * 100}%` }}
                          aria-label={`${entry.month} income ${currency(entry.income)}`}
                        />
                        <div
                          className="w-2.5 rounded-t-sm bg-info/60"
                          style={{ height: `${(entry.expenses / maxFlow) * 100}%` }}
                          aria-label={`${entry.month} expenses ${currency(entry.expenses)}`}
                        />
                      </div>
                      <span className="text-[11px] text-text-muted">{entry.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-5 mt-4 pt-4 border-t border-border">
                  <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <span className="w-2.5 h-2.5 rounded-sm bg-gold inline-block" /> Income
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <span className="w-2.5 h-2.5 rounded-sm bg-info/60 inline-block" /> Expenses
                  </span>
                </div>
              </>
            )}
          </Card>

          {/* Quick profile */}
          <Card padding="lg" className="flex items-center gap-3.5">
            <Avatar initials={initials} size="md" status="online" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
              <p className="text-xs text-text-muted truncate">
                Account •••• {account?.number ?? '——'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Home
