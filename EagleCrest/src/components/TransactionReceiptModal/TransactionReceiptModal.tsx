import React from 'react'
import { Badge, Button } from '../index'
import type { ApiTransaction } from '../../lib/api'
import type { TransactionStatus } from '../../types'

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })

const statusVariant: Record<TransactionStatus, 'success' | 'warning' | 'danger' | 'info'> = {
  completed: 'success',
  pending: 'warning',
  processing: 'info',
  failed: 'danger',
}

const fullDate = (iso: string) =>
  new Date(iso).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

interface TransactionReceiptModalProps {
  transaction: ApiTransaction | null
  onClose: () => void
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({ transaction, onClose }) => {
  if (!transaction) return null

  const rows: [string, string][] = [
    ['Reference', transaction.reference ?? '—'],
    ['Date', fullDate(transaction.date)],
    ['Category', transaction.category],
    ['Type', transaction.type === 'credit' ? 'Money In' : 'Money Out'],
    ['Status', transaction.status[0].toUpperCase() + transaction.status.slice(1)],
  ]

  if (transaction.note) rows.push(['Note', transaction.note])

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-[440px] bg-bg-card border border-border rounded-xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="font-display text-lg text-text-primary">Receipt</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors duration-150"
            aria-label="Close"
          >
            <i className="ti ti-x" style={{ fontSize: 16 }} aria-hidden="true" />
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col items-center text-center gap-1 border-b border-border">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
            style={{
              background: transaction.iconBg ?? 'rgba(201,168,76,0.12)',
              color: transaction.iconColor ?? '#C9A84C',
            }}
          >
            <i className={`ti ${transaction.icon ?? 'ti-circle'}`} style={{ fontSize: 20 }} aria-hidden="true" />
          </div>
          <p className="text-2xl font-mono font-medium text-text-primary">
            {transaction.type === 'credit' ? '+' : '−'}
            {currency(transaction.amount)}
          </p>
          <p className="text-sm text-text-secondary">{transaction.name}</p>
          <Badge variant={statusVariant[transaction.status]} className="mt-2">
            {transaction.status}
          </Badge>
        </div>

        <div className="px-6 py-5 flex flex-col gap-3">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-text-muted">{label}</span>
              <span className="text-text-primary text-right break-all">{value}</span>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6">
          <Button variant="ghost" fullWidth onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}
