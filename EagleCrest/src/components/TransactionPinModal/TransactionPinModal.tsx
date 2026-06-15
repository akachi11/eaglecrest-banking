import React, { useState } from 'react'
import { Button } from '../index'
import { authApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

interface TransactionPinModalProps {
  mode: 'create' | 'enter'
  onClose: () => void
  onSuccess: (pin: string) => void
}

const PinInput: React.FC<{ value: string; onChange: (v: string) => void; autoFocus?: boolean }> = ({
  value,
  onChange,
  autoFocus,
}) => (
  <input
    type="password"
    inputMode="numeric"
    pattern="\d*"
    maxLength={4}
    autoFocus={autoFocus}
    value={value}
    onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
    className="w-full bg-bg-card border border-border rounded-md text-text-primary text-center tracking-[0.6em] text-2xl font-mono py-3 outline-none transition-colors duration-150 placeholder:text-text-muted hover:border-border-strong focus:border-gold-dim focus:shadow-[0_0_0_3px_rgba(201,168,76,0.08)]"
    placeholder="••••"
  />
)

export const TransactionPinModal: React.FC<TransactionPinModalProps> = ({ mode, onClose, onSuccess }) => {
  const { token, setUser } = useAuth()
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    if (pin.length !== 4) {
      setError('PIN must be exactly 4 digits')
      return
    }
    if (pin !== confirmPin) {
      setError('PINs do not match')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { user } = await authApi.setTransactionPin(token, pin)
      setUser(user)
      onSuccess(pin)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set PIN')
    } finally {
      setLoading(false)
    }
  }

  const handleEnter = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin.length !== 4) {
      setError('Enter your 4-digit PIN')
      return
    }
    onSuccess(pin)
  }

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-sm bg-bg-card border border-border rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg text-text-primary">
            {mode === 'create' ? 'Create Transaction PIN' : 'Enter Transaction PIN'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors duration-150"
            aria-label="Close"
          >
            <i className="ti ti-x" style={{ fontSize: 16 }} aria-hidden="true" />
          </button>
        </div>

        <p className="text-xs text-text-muted mb-5">
          {mode === 'create'
            ? 'Set a 4-digit PIN to authorize transfers. You\'ll need it every time you send money.'
            : 'Enter your 4-digit transaction PIN to authorize this transfer.'}
        </p>

        {error && (
          <p className="text-xs text-danger mb-4 p-3 bg-danger/[0.08] rounded-md border border-danger/20">
            {error}
          </p>
        )}

        {mode === 'create' ? (
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div>
              <label className="text-[11px] tracking-[0.1em] uppercase text-text-muted font-medium mb-1.5 block">
                New PIN
              </label>
              <PinInput value={pin} onChange={setPin} autoFocus />
            </div>
            <div>
              <label className="text-[11px] tracking-[0.1em] uppercase text-text-muted font-medium mb-1.5 block">
                Confirm PIN
              </label>
              <PinInput value={confirmPin} onChange={setConfirmPin} />
            </div>
            <div className="flex gap-3 mt-1">
              <Button type="button" variant="ghost" fullWidth onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary" fullWidth loading={loading} icon="ti-lock">Save PIN</Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleEnter} className="flex flex-col gap-4">
            <PinInput value={pin} onChange={setPin} autoFocus />
            <div className="flex gap-3 mt-1">
              <Button type="button" variant="ghost" fullWidth onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary" fullWidth icon="ti-check">Confirm</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
