import { useMemo, useState } from 'react'
import { Button, Card, CardHeader, StatCard } from '../components'
import { useBanking } from '../context/BankingContext'

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })

const periods = ['1M', '3M', '6M', '1Y'] as const
type Period = (typeof periods)[number]

const periodSlice: Record<Period, number> = { '1M': 1, '3M': 3, '6M': 6, '1Y': 6 }

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

const Analytics = () => {
  const { cashFlow, spending, spendingTotal, recentTransactions, loading } = useBanking()
  const [period, setPeriod] = useState<Period>('6M')

  const slicedFlow = cashFlow.slice(-periodSlice[period])

  const totalIncome = slicedFlow.reduce((s, c) => s + c.income, 0)
  const totalExpenses = slicedFlow.reduce((s, c) => s + c.expenses, 0)
  const netSavings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0
  const maxFlow = Math.max(...slicedFlow.flatMap((c) => [c.income, c.expenses]), 1)

  const donutGradient = useMemo(() => {
    if (spending.length === 0) return 'conic-gradient(#1E1E1E 0% 100%)'
    let cumulative = 0
    const stops = spending.map((cat) => {
      const start = cumulative
      cumulative += cat.percentage
      return `${CATEGORY_COLORS[cat.name] ?? '#9A9590'} ${start}% ${cumulative}%`
    })
    return `conic-gradient(${stops.join(', ')})`
  }, [spending])

  const topMerchants = useMemo(() => {
    const map = new Map<
      string,
      { name: string; total: number; count: number; icon?: string; iconBg?: string; iconColor?: string }
    >()
    for (const txn of recentTransactions) {
      if (txn.type !== 'debit') continue
      const existing = map.get(txn.name)
      if (existing) {
        existing.total += txn.amount
        existing.count += 1
      } else {
        map.set(txn.name, {
          name: txn.name,
          total: txn.amount,
          count: 1,
          icon: txn.icon,
          iconBg: txn.iconBg,
          iconColor: txn.iconColor,
        })
      }
    }
    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [recentTransactions])

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
          <h1 className="font-display text-2xl font-medium text-text-primary">Analytics</h1>
          <p className="text-sm text-text-secondary mt-1">
            Track your spending trends and financial health
          </p>
        </div>
        <div className="flex items-center gap-2">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-xs font-medium px-4 py-2 rounded-md border transition-colors duration-150 ${
                period === p
                  ? 'bg-gold/[0.12] border-gold/40 text-gold'
                  : 'bg-bg-elevated border-border text-text-secondary hover:text-text-primary hover:border-border-strong'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Income"
          value={totalIncome > 0 ? currency(totalIncome) : '—'}
          delta="Selected period"
          deltaUp
          icon="ti-arrow-down-circle"
        />
        <StatCard
          label="Total Expenses"
          value={totalExpenses > 0 ? currency(totalExpenses) : '—'}
          delta="Selected period"
          deltaUp={false}
          icon="ti-arrow-up-circle"
        />
        <StatCard
          label="Net Savings"
          value={totalIncome > 0 ? currency(netSavings) : '—'}
          delta="Selected period"
          deltaUp={netSavings >= 0}
          icon="ti-pig"
        />
        <StatCard
          label="Savings Rate"
          value={totalIncome > 0 ? `${savingsRate}%` : '—'}
          delta="Income vs expenses"
          deltaUp={savingsRate > 0}
          icon="ti-percentage"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Cash flow */}
          <Card padding="lg">
            <CardHeader
              title="Cash Flow"
              action={<span className="text-xs text-text-muted">Last {periodSlice[period]} month{periodSlice[period] > 1 ? 's' : ''}</span>}
            />
            {slicedFlow.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-12">No cash flow data yet</p>
            ) : (
              <>
                <div className="flex items-end justify-between gap-3 h-[220px] mt-2">
                  {slicedFlow.map((entry) => (
                    <div
                      key={entry.month}
                      className="flex flex-col items-center gap-2 flex-1 h-full justify-end"
                    >
                      <div className="flex items-end gap-1.5 h-full w-full justify-center">
                        <div
                          className="w-3.5 rounded-t-sm bg-gold"
                          style={{ height: `${(entry.income / maxFlow) * 100}%` }}
                          aria-label={`${entry.month} income ${currency(entry.income)}`}
                        />
                        <div
                          className="w-3.5 rounded-t-sm bg-info/60"
                          style={{ height: `${(entry.expenses / maxFlow) * 100}%` }}
                          aria-label={`${entry.month} expenses ${currency(entry.expenses)}`}
                        />
                      </div>
                      <span className="text-[11px] text-text-muted">{entry.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-5 mt-4 pt-4 border-t border-border flex-wrap">
                  <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <span className="w-2.5 h-2.5 rounded-sm bg-gold inline-block" /> Income
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <span className="w-2.5 h-2.5 rounded-sm bg-info/60 inline-block" /> Expenses
                  </span>
                  {totalIncome > 0 && (
                    <span className="ml-auto text-xs text-text-muted">
                      Net&nbsp;
                      <span className="text-text-primary font-medium font-mono">
                        {currency(netSavings)}
                      </span>
                    </span>
                  )}
                </div>
              </>
            )}
          </Card>

          {/* Spending by category */}
          <Card padding="lg">
            <CardHeader
              title="Spending by Category"
              action={
                <Button variant="ghost" size="sm" icon="ti-arrow-right" iconPosition="right">
                  View all
                </Button>
              }
            />
            {spending.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">No spending data this month</p>
            ) : (
              <div className="flex flex-col gap-4">
                {spending.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-text-secondary">{cat.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-text-muted">{cat.percentage}%</span>
                        <span className="text-sm font-medium text-text-primary font-mono w-20 text-right">
                          {currency(cat.amount)}
                        </span>
                      </div>
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
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Donut breakdown */}
          <Card padding="lg">
            <CardHeader title="Spending Breakdown" />
            <div className="flex flex-col items-center gap-5 py-2">
              <div
                className="relative w-[160px] h-[160px] rounded-full"
                style={{ background: donutGradient }}
              >
                <div className="absolute inset-[18px] rounded-full bg-bg-card flex flex-col items-center justify-center">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted">Total Spent</p>
                  <p className="font-display text-xl text-text-primary mt-1">
                    {spendingTotal > 0 ? currency(spendingTotal) : '—'}
                  </p>
                </div>
              </div>
              {spending.length > 0 && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 w-full">
                  {spending.map((cat) => (
                    <div key={cat.name} className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ background: CATEGORY_COLORS[cat.name] ?? '#9A9590' }}
                      />
                      <span className="text-xs text-text-secondary truncate">{cat.name}</span>
                      <span className="text-xs text-text-muted ml-auto shrink-0">{cat.percentage}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Top merchants */}
          <Card padding="lg">
            <CardHeader title="Top Merchants" />
            {topMerchants.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">No merchant data yet</p>
            ) : (
              <div className="flex flex-col">
                {topMerchants.map((m) => (
                  <div
                    key={m.name}
                    className="flex items-center justify-between py-3 border-b border-border last:border-b-0 gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: m.iconBg ?? 'rgba(201,168,76,0.12)',
                          color: m.iconColor ?? '#C9A84C',
                        }}
                      >
                        <i
                          className={`ti ${m.icon ?? 'ti-circle'}`}
                          style={{ fontSize: 17 }}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-text-primary font-medium truncate">{m.name}</p>
                        <p className="text-xs text-text-muted">
                          {m.count} {m.count === 1 ? 'transaction' : 'transactions'}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-medium font-mono text-text-primary shrink-0">
                      {currency(m.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Insight */}
          <Card padding="lg" className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-md bg-gold/10 text-gold flex items-center justify-center shrink-0">
              <i className="ti ti-bulb" style={{ fontSize: 17 }} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-text-primary font-medium">Smart Insight</p>
              <p className="text-xs text-text-muted mt-1">
                {spending.length > 0
                  ? `${spending[0].name} makes up ${spending[0].percentage}% of your monthly spending.`
                  : 'Make a transaction to see spending insights.'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Analytics
