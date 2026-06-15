import { useEffect, useMemo, useState } from 'react'
import { Badge, Button, Card, Input, TransactionReceiptModal } from '../components'
import { transactionApi, type ApiTransaction } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import type { TransactionStatus, TransactionType } from '../types'

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
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

const statusVariant: Record<TransactionStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  completed: 'success',
  pending: 'warning',
  processing: 'info',
  failed: 'danger',
}

type TypeFilter = 'all' | TransactionType

const typeFilters: { label: string; value: TypeFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Income', value: 'credit' },
  { label: 'Expenses', value: 'debit' },
]

const Transactions = () => {
  const { token } = useAuth()
  const [transactions, setTransactions] = useState<ApiTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [receiptTxn, setReceiptTxn] = useState<ApiTransaction | null>(null)

  useEffect(() => {
    if (!token) return
    transactionApi
      .list(token, { limit: 50 })
      .then(({ transactions }) => setTransactions(transactions))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return transactions.filter((txn) => {
      if (typeFilter !== 'all' && txn.type !== typeFilter) return false
      if (q && !txn.name.toLowerCase().includes(q) && !txn.category.toLowerCase().includes(q))
        return false
      return true
    })
  }, [transactions, search, typeFilter])

  const groups = useMemo(() => {
    const map = new Map<string, ApiTransaction[]>()
    for (const txn of filtered) {
      const key = dateLabel(txn.date)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(txn)
    }
    return Array.from(map.entries())
  }, [filtered])

  const totalIn = filtered.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0)
  const totalOut = filtered.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-medium text-text-primary">Transactions</h1>
          <p className="text-sm text-text-secondary mt-1">
            {loading ? 'Loading…' : `${filtered.length} transactions · ${currency(totalIn)} in · ${currency(totalOut)} out`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" icon="ti-download">Export</Button>
          <Button variant="primary" icon="ti-filter">Filter</Button>
        </div>
      </div>

      {/* Search & filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by name or category..."
            icon="ti-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          {typeFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={`text-xs font-medium px-4 py-2 rounded-md border transition-colors duration-150 ${
                typeFilter === f.value
                  ? 'bg-gold/[0.12] border-gold/40 text-gold'
                  : 'bg-bg-elevated border-border text-text-secondary hover:text-text-primary hover:border-border-strong'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction groups */}
      <Card padding="lg">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <i className="ti ti-loader-2 animate-spin text-gold text-2xl" aria-hidden="true" />
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <i className="ti ti-receipt-off text-3xl text-text-muted" aria-hidden="true" />
            <p className="text-sm text-text-secondary">
              {transactions.length === 0 ? 'No transactions yet' : 'No transactions match your search.'}
            </p>
          </div>
        ) : (
          groups.map(([label, txns]) => (
            <div key={label} className="mb-2 last:mb-0">
              <p className="text-[11px] uppercase tracking-[0.14em] text-text-muted font-medium pt-4 pb-2 first:pt-0">
                {label}
              </p>
              <div className="flex flex-col">
                {txns.map((txn) => (
                  <div
                    key={txn._id}
                    onClick={() => setReceiptTxn(txn)}
                    className="flex items-center justify-between py-3 border-b border-border last:border-b-0 gap-4 cursor-pointer hover:bg-bg-elevated/50 rounded-md transition-colors duration-150 px-2 -mx-2"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          background: txn.iconBg ?? 'rgba(201,168,76,0.12)',
                          color: txn.iconColor ?? '#C9A84C',
                        }}
                      >
                        <i
                          className={`ti ${txn.icon ?? 'ti-circle'}`}
                          style={{ fontSize: 18 }}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-text-primary font-medium truncate">{txn.name}</p>
                        <p className="text-xs text-text-muted">
                          {txn.category} · {timeLabel(txn.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <Badge variant={statusVariant[txn.status]} className="hidden sm:inline-flex">
                        {txn.status}
                      </Badge>
                      <span
                        className={`text-sm font-medium font-mono w-28 text-right ${
                          txn.type === 'credit' ? 'text-success' : 'text-text-primary'
                        }`}
                      >
                        {txn.type === 'credit' ? '+' : '−'}
                        {currency(txn.amount)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setReceiptTxn(txn)
                        }}
                        className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-gold hover:bg-bg-elevated transition-colors duration-150"
                        aria-label="View receipt"
                      >
                        <i className="ti ti-receipt" style={{ fontSize: 16 }} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </Card>

      <TransactionReceiptModal transaction={receiptTxn} onClose={() => setReceiptTxn(null)} />
    </div>
  )
}

export default Transactions
