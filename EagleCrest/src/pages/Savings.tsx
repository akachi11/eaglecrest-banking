import React, { useEffect, useState } from 'react'
import { Badge, Button, Card, CardHeader, Input, StatCard } from '../components'
import { savingsApi, type ApiSavingsGoal } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })

const GOAL_ICONS = ['ti-shield-check', 'ti-beach', 'ti-device-laptop', 'ti-home', 'ti-car', 'ti-plane', 'ti-pig', 'ti-star']
const GOAL_COLORS = ['#5B9BD5', '#C9A84C', '#4CAF82', '#E05555', '#9A9590']

// ── New Goal modal ────────────────────────────────────────────────────────────
interface NewGoalModalProps {
  token: string
  onClose: () => void
  onCreated: (goal: ApiSavingsGoal) => void
}

const NewGoalModal: React.FC<NewGoalModalProps> = ({ token, onClose, onCreated }) => {
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [deadline, setDeadline] = useState('')
  const [icon, setIcon] = useState(GOAL_ICONS[0])
  const [color, setColor] = useState(GOAL_COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !target) { setError('Name and target amount are required'); return }
    if (Number(target) <= 0) { setError('Target must be greater than zero'); return }
    setLoading(true)
    try {
      const { goal } = await savingsApi.create(token, {
        name: name.trim(),
        target: Number(target),
        icon,
        color,
        deadline: deadline || undefined,
      })
      onCreated(goal)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-sm bg-bg-card border border-border rounded-xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg text-text-primary">New Savings Goal</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-elevated transition-colors duration-150">
            <i className="ti ti-x" style={{ fontSize: 16 }} aria-hidden="true" />
          </button>
        </div>

        {error && (
          <p className="text-xs text-danger mb-4 p-3 bg-danger/[0.08] rounded-md border border-danger/20">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Goal Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Dream Vacation" icon="ti-target-arrow" required />
          <Input label="Target Amount" prefix="$" value={target} onChange={(e) => setTarget(e.target.value.replace(/[^0-9.]/g, ''))} placeholder="5,000" inputMode="numeric" required />
          <Input label="Target Date (optional)" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />

          {/* Icon picker */}
          <div>
            <label className="text-[11px] tracking-[0.1em] uppercase text-text-muted font-medium mb-2 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-9 h-9 rounded-md flex items-center justify-center border transition-colors duration-150 ${icon === ic ? 'border-gold/40 bg-gold/[0.12] text-gold' : 'border-border bg-bg-elevated text-text-secondary hover:border-border-strong'}`}
                >
                  <i className={`ti ${ic}`} style={{ fontSize: 16 }} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="text-[11px] tracking-[0.1em] uppercase text-text-muted font-medium mb-2 block">Color</label>
            <div className="flex gap-2">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all duration-150 ${color === c ? 'scale-110 border-white' : 'border-transparent'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-1">
            <Button type="button" variant="ghost" fullWidth onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" fullWidth loading={loading} icon="ti-plus">Create Goal</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
const Savings = () => {
  const { token } = useAuth()
  const [goals, setGoals] = useState<ApiSavingsGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [roundUp, setRoundUp] = useState(true)
  const [justAdded, setJustAdded] = useState<string | null>(null)
  const [depositLoading, setDepositLoading] = useState<string | null>(null)
  const [showNewGoal, setShowNewGoal] = useState(false)

  useEffect(() => {
    if (!token) return
    savingsApi
      .list(token)
      .then(({ goals }) => setGoals(goals))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  const totalSaved = goals.reduce((s, g) => s + g.saved, 0)
  const activeGoals = goals.filter((g) => !g.isCompleted).length

  const handleAddFunds = async (id: string) => {
    if (!token) return
    setDepositLoading(id)
    try {
      const { goal } = await savingsApi.deposit(token, id, 100)
      setGoals((prev) => prev.map((g) => (g._id === goal._id ? goal : g)))
      setJustAdded(id)
      setTimeout(() => setJustAdded((cur) => (cur === id ? null : cur)), 1600)
    } catch {}
    setDepositLoading(null)
  }

  const deadlineLabel = (iso?: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    return `Target: ${d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-medium text-text-primary">Savings</h1>
          <p className="text-sm text-text-secondary mt-1">Grow your money with goals, vaults, and round-ups</p>
        </div>
        <Button variant="primary" icon="ti-plus" onClick={() => setShowNewGoal(true)}>New Goal</Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Saved" value={currency(totalSaved)} delta="Across all goals" deltaUp icon="ti-pig" />
        <StatCard label="Active Goals" value={`${activeGoals} of ${goals.length}`} delta={goals.length === 0 ? 'No goals yet' : 'In progress'} deltaUp={activeGoals > 0} icon="ti-target-arrow" />
        <StatCard label="Goals Completed" value={String(goals.filter((g) => g.isCompleted).length)} delta="Well done!" deltaUp icon="ti-circle-check" />
        <StatCard label="Round-Ups" value={roundUp ? 'Active' : 'Off'} delta="Spare change saved" deltaUp={roundUp} icon="ti-arrow-big-up-lines" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <i className="ti ti-loader-2 animate-spin text-gold text-2xl" aria-hidden="true" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="xl:col-span-2 flex flex-col gap-4">
            {goals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4 bg-bg-card border border-border rounded-lg">
                <span className="w-16 h-16 rounded-full bg-bg-elevated border border-border flex items-center justify-center">
                  <i className="ti ti-pig text-text-muted text-3xl" aria-hidden="true" />
                </span>
                <div className="text-center">
                  <p className="text-sm text-text-primary font-medium">No savings goals yet</p>
                  <p className="text-xs text-text-muted mt-1">Create your first goal to start saving</p>
                </div>
                <Button variant="primary" icon="ti-plus" onClick={() => setShowNewGoal(true)}>Create a Goal</Button>
              </div>
            ) : (
              goals.map((g) => {
                const pct = Math.min(100, Math.round((g.saved / g.target) * 100))
                return (
                  <Card key={g._id} padding="lg">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span
                          className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: `${g.color ?? '#C9A84C'}1F`, color: g.color ?? '#C9A84C' }}
                        >
                          <i className={`ti ${g.icon ?? 'ti-pig'}`} style={{ fontSize: 19 }} aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm text-text-primary font-medium truncate">{g.name}</p>
                          <p className="text-xs text-text-muted mt-0.5">
                            {g.isCompleted ? 'Goal reached 🎉' : deadlineLabel(g.deadline)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {justAdded === g._id && <Badge variant="warning" dot>$100 deposit pending</Badge>}
                        {g.isCompleted ? (
                          <Badge variant="success">Complete</Badge>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon="ti-plus"
                            loading={depositLoading === g._id}
                            onClick={() => handleAddFunds(g._id)}
                          >
                            Add Funds
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-text-secondary font-mono">
                          {currency(g.saved)}{' '}
                          <span className="text-text-muted">of {currency(g.target)}</span>
                        </span>
                        <span className="text-sm font-medium text-text-primary">{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-bg-elevated overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%`, background: g.color ?? '#C9A84C' }}
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
            {/* High-yield vault */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#11161c] via-[#161616] to-[#0f0f0f] border border-border p-6 flex flex-col justify-between gap-6">
              <div
                className="pointer-events-none absolute -right-14 -top-14 w-56 h-56 rounded-full opacity-[0.12]"
                style={{ background: 'radial-gradient(circle, var(--color-info) 0%, transparent 70%)' }}
              />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">High-Yield Vault</p>
                  <p className="font-display text-lg text-text-primary mt-1">EverestSave Growth Account</p>
                </div>
                <i className="ti ti-building-bank text-info text-2xl" aria-hidden="true" />
              </div>
              <div className="relative">
                <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted mb-1">Vault Balance</p>
                <p className="font-display text-3xl font-medium text-text-primary">{currency(0)}</p>
              </div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-text-muted">Annual Yield</p>
                  <p className="font-mono text-sm text-success mt-1">4.20% APY</p>
                </div>
                <Button variant="ghost" size="sm" icon="ti-arrow-right" iconPosition="right">Manage</Button>
              </div>
            </div>

            {/* Round-up savings */}
            <Card padding="lg">
              <CardHeader title="Round-Up Savings" />
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-9 h-9 rounded-md bg-bg-elevated border border-border flex items-center justify-center text-text-secondary shrink-0">
                    <i className="ti ti-arrow-big-up-lines" style={{ fontSize: 16 }} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-text-primary font-medium truncate">Round up purchases</p>
                    <p className="text-xs text-text-muted truncate">
                      {roundUp ? 'Spare change goes to your top goal' : 'Currently turned off'}
                    </p>
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={roundUp}
                  onClick={() => setRoundUp((v) => !v)}
                  className={`relative w-11 h-6 rounded-full shrink-0 border transition-colors duration-150 ${roundUp ? 'bg-gold border-gold' : 'bg-bg-elevated border-border'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-bg-base transition-transform duration-150 ${roundUp ? 'translate-x-[20px]' : 'translate-x-0'}`}
                  />
                </button>
              </div>
            </Card>

            {/* Insight */}
            <Card padding="lg" className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-md bg-gold/10 text-gold flex items-center justify-center shrink-0">
                <i className="ti ti-bulb" style={{ fontSize: 17 }} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm text-text-primary font-medium">Smart Insight</p>
                <p className="text-xs text-text-muted mt-1">
                  {goals.length === 0
                    ? 'Create a savings goal to start building your financial future.'
                    : `You have ${activeGoals} active goal${activeGoals !== 1 ? 's' : ''}. Keep going!`}
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {showNewGoal && token && (
        <NewGoalModal
          token={token}
          onClose={() => setShowNewGoal(false)}
          onCreated={(goal) => {
            setGoals((prev) => [goal, ...prev])
            setShowNewGoal(false)
          }}
        />
      )}
    </div>
  )
}

export default Savings
