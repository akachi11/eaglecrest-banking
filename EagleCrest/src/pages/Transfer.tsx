import { useEffect, useMemo, useState } from 'react'
import { Avatar, Badge, Button, Card, CardHeader, Input } from '../components'
import { transferApi, type ApiRecipient } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useBanking } from '../context/BankingContext'
import { useNotifications } from '../context/NotificationContext'

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })

const quickAmounts = [50, 100, 250, 500]

// ── Add Recipient modal ───────────────────────────────────────────────────────
interface AddRecipientModalProps {
  onClose: () => void
  onAdded: (r: ApiRecipient) => void
  token: string
}

const AddRecipientModal: React.FC<AddRecipientModalProps> = ({ onClose, onAdded, token }) => {
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [bank, setBank] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Name is required'); return }
    setLoading(true)
    try {
      const { recipient } = await transferApi.addRecipient(token, {
        name: name.trim(),
        handle: handle.trim() || undefined,
        bank: bank.trim() || undefined,
        accountNumber: accountNumber.trim() || undefined,
      })
      onAdded(recipient)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add recipient')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-sm bg-bg-card border border-border rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg text-text-primary">Add Recipient</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors duration-150"
          >
            <i className="ti ti-x" style={{ fontSize: 16 }} aria-hidden="true" />
          </button>
        </div>
        {error && (
          <p className="text-xs text-danger mb-4 p-3 bg-danger/[0.08] rounded-md border border-danger/20">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" required icon="ti-user" />
          <Input label="Handle (optional)" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@janesmith" icon="ti-at" />
          <Input label="Bank (optional)" value={bank} onChange={(e) => setBank(e.target.value)} placeholder="Chase •••• 1234" icon="ti-building-bank" />
          <Input label="Account Number (optional)" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="•••• •••• 5678" icon="ti-credit-card" />
          <div className="flex gap-3 mt-1">
            <Button type="button" variant="ghost" fullWidth onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" fullWidth loading={loading} icon="ti-check">Add</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
const Transfer = () => {
  const { token } = useAuth()
  const { account, refreshAccount } = useBanking()
  const { refreshNotifications } = useNotifications()

  const [recipients, setRecipients] = useState<ApiRecipient[]>([])
  const [recipientsLoading, setRecipientsLoading] = useState(true)
  const [selected, setSelected] = useState<ApiRecipient | null>(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const [sendError, setSendError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    if (!token) return
    transferApi
      .getRecipients(token)
      .then(({ recipients }) => {
        setRecipients(recipients)
        if (recipients.length > 0) setSelected(recipients[0])
      })
      .catch(() => {})
      .finally(() => setRecipientsLoading(false))
  }, [token])

  const numericAmount = useMemo(() => Number(amount.replace(/[^0-9.]/g, '')) || 0, [amount])
  const balance = account?.balance ?? 0
  const insufficient = numericAmount > balance
  const canSend = !!selected && numericAmount > 0 && !insufficient && !sendLoading

  const handleSend = async () => {
    if (!canSend || !token || !selected) return
    setSendError('')
    setSendLoading(true)
    try {
      await transferApi.send(token, selected._id, numericAmount, note || undefined)
      await refreshAccount()
      refreshNotifications()
      setSent(true)
      setAmount('')
      setNote('')
      setTimeout(() => setSent(false), 2400)
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Transfer failed')
    } finally {
      setSendLoading(false)
    }
  }

  const handleRecipientAdded = (r: ApiRecipient) => {
    setRecipients((prev) => [...prev, r])
    setSelected(r)
    setShowAddModal(false)
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-medium text-text-primary">Transfer Money</h1>
        <p className="text-sm text-text-secondary mt-1">Send funds to a saved recipient or a new account</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: form */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <Card padding="lg">
            <CardHeader title="Choose Recipient" />
            {recipientsLoading ? (
              <div className="flex items-center justify-center py-8">
                <i className="ti ti-loader-2 animate-spin text-gold text-xl" aria-hidden="true" />
              </div>
            ) : recipients.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">No saved recipients yet</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                {recipients.map((r) => (
                  <button
                    key={r._id}
                    onClick={() => setSelected(r)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors duration-150 ${
                      selected?._id === r._id
                        ? 'border-gold/40 bg-gold/[0.07]'
                        : 'border-border bg-bg-elevated hover:border-border-strong'
                    }`}
                  >
                    <Avatar initials={r.initials} size="md" />
                    <div className="text-center min-w-0">
                      <p className="text-xs font-medium text-text-primary truncate w-full">{r.name}</p>
                      <p className="text-[11px] text-text-muted truncate w-full">{r.handle ?? ''}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button
              className="flex items-center gap-2 text-xs text-text-secondary hover:text-gold transition-colors duration-150 mt-2"
              onClick={() => setShowAddModal(true)}
            >
              <i className="ti ti-plus" style={{ fontSize: 14 }} aria-hidden="true" />
              Add a new recipient
            </button>
          </Card>

          <Card padding="lg">
            <CardHeader title="Transfer Details" />
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-[11px] tracking-[0.1em] uppercase text-text-muted font-medium mb-1.5 block">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-2xl font-display text-text-muted">
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-bg-card border border-border rounded-md text-text-primary font-display text-2xl pl-9 pr-4 py-3.5 outline-none transition-colors duration-150 placeholder:text-text-muted hover:border-border-strong focus:border-gold-dim focus:shadow-[0_0_0_3px_rgba(201,168,76,0.08)]"
                  />
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(String(amt))}
                      className="text-xs font-medium px-3.5 py-1.5 rounded-md border border-border bg-bg-elevated text-text-secondary hover:border-border-strong hover:text-text-primary transition-colors duration-150"
                    >
                      {currency(amt)}
                    </button>
                  ))}
                </div>
                {insufficient && (
                  <p className="text-[11px] text-danger mt-2">
                    Amount exceeds your available balance of {currency(balance)}.
                  </p>
                )}
                {sendError && (
                  <p className="text-[11px] text-danger mt-2">{sendError}</p>
                )}
              </div>

              <Input
                label="Note (optional)"
                placeholder="What's this for?"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              <div className="flex items-center justify-between p-4 rounded-lg bg-bg-elevated border border-border">
                <div className="flex items-center gap-3 min-w-0">
                  {selected ? (
                    <>
                      <Avatar initials={selected.initials} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm text-text-primary font-medium truncate">{selected.name}</p>
                        <p className="text-xs text-text-muted truncate">{selected.bank ?? ''}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-text-muted">Select a recipient to continue</p>
                  )}
                </div>
                <span className="font-display text-lg text-text-primary shrink-0">
                  {currency(numericAmount)}
                </span>
              </div>

              <Button
                variant="primary"
                size="lg"
                icon={sent ? 'ti-check' : 'ti-send'}
                fullWidth
                disabled={!canSend}
                loading={sendLoading}
                onClick={handleSend}
              >
                {sent ? 'Transfer Sent' : 'Send Transfer'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: account + recent */}
        <div className="flex flex-col gap-6">
          <Card padding="lg">
            <CardHeader title="From Account" />
            <div className="flex items-center justify-between p-4 rounded-lg bg-bg-elevated border border-border">
              <div>
                <p className="text-xs text-text-muted">Crestmark Private Account</p>
                <p className="font-mono text-sm text-text-secondary mt-1">
                  •••• {account?.number ?? '——'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted">Available</p>
                <p className="font-display text-lg text-text-primary mt-1">{currency(balance)}</p>
              </div>
            </div>
          </Card>

          {recipients.length > 0 && (
            <Card padding="lg">
              <CardHeader title="Recent Recipients" />
              <div className="flex flex-col">
                {recipients.map((r) => (
                  <button
                    key={r._id}
                    onClick={() => setSelected(r)}
                    className="flex items-center gap-3 py-2.5 border-b border-border last:border-b-0 text-left hover:bg-bg-elevated -mx-1 px-1 rounded-md transition-colors duration-150"
                  >
                    <Avatar initials={r.initials} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-text-primary font-medium truncate">{r.name}</p>
                      <p className="text-xs text-text-muted truncate">{r.bank ?? ''}</p>
                    </div>
                    <i className="ti ti-chevron-right text-text-muted" style={{ fontSize: 16 }} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </Card>
          )}

          <Card padding="lg" className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-md bg-info/10 text-info flex items-center justify-center shrink-0">
              <i className="ti ti-shield-check" style={{ fontSize: 17 }} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm text-text-primary font-medium">Transfers are protected</p>
              <p className="text-xs text-text-muted mt-1">
                Every transfer is encrypted and monitored for fraud in real time.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {sent && (
        <div className="fixed bottom-6 right-6 z-[300]">
          <Card padding="md" className="flex items-center gap-3 shadow-lg">
            <Badge variant="success" dot>Sent</Badge>
            <span className="text-sm text-text-primary">
              {currency(numericAmount)} sent to {selected?.name}
            </span>
          </Card>
        </div>
      )}

      {showAddModal && token && (
        <AddRecipientModal
          token={token}
          onClose={() => setShowAddModal(false)}
          onAdded={handleRecipientAdded}
        />
      )}
    </div>
  )
}

export default Transfer
