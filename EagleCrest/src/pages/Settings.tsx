import React, { useEffect, useState } from 'react'
import { Avatar, Badge, Button, Card, CardHeader, Input } from '../components'
import { authApi } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useBanking } from '../context/BankingContext'

const Toggle: React.FC<{
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description: string
  icon: string
}> = ({ checked, onChange, label, description, icon }) => (
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
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full shrink-0 border transition-colors duration-150 ${
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

const currencies = ['USD', 'EUR', 'GBP', 'JPY']

const Settings = () => {
  const { user, token, setUser } = useAuth()
  const { account } = useBanking()

  // Profile
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState('')

  // Password
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState('')

  // Preferences
  const [twoFactor, setTwoFactor] = useState(false)
  const [biometric, setBiometric] = useState(false)
  const [txnAlerts, setTxnAlerts] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [securityAlerts, setSecurityAlerts] = useState(true)
  const [prefCurrency, setPrefCurrency] = useState('USD')
  const [prefSaving, setPrefSaving] = useState(false)

  const [confirmingClose, setConfirmingClose] = useState(false)

  // Sync from user
  useEffect(() => {
    if (!user) return
    setName(user.name ?? '')
    setEmail(user.email ?? '')
    setPhone(user.phone ?? '')
    setTwoFactor(user.preferences?.twoFactor ?? false)
    setBiometric(user.preferences?.biometric ?? false)
    setTxnAlerts(user.preferences?.txnAlerts ?? true)
    setMarketingEmails(user.preferences?.marketingEmails ?? false)
    setSecurityAlerts(user.preferences?.securityAlerts ?? true)
    setPrefCurrency(user.preferences?.currency ?? 'USD')
  }, [user])

  const handleProfileSave = async () => {
    if (!token) return
    setProfileError('')
    setProfileSaving(true)
    try {
      const { user: updated } = await authApi.updateProfile(token, { name, email, phone })
      setUser(updated)
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2200)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!token || !currentPassword || !newPassword) return
    if (newPassword.length < 8) { setPwError('New password must be at least 8 characters'); return }
    setPwError('')
    setPwSaving(true)
    try {
      await authApi.changePassword(token, currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setPwSaved(true)
      setTimeout(() => setPwSaved(false), 2200)
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Failed to change password')
    } finally {
      setPwSaving(false)
    }
  }

  const savePreference = async (key: string, value: boolean | string) => {
    if (!token) return
    setPrefSaving(true)
    try {
      const { user: updated } = await authApi.updatePreferences(token, { [key]: value })
      setUser(updated)
    } catch {}
    setPrefSaving(false)
  }

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'ES'

  const memberSince = user?.memberSince
    ? new Date(user.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—'

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-medium text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary mt-1">Manage your profile, security, and preferences</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Profile */}
          <Card padding="lg">
            <CardHeader title="Profile" />
            <div className="flex items-center gap-4 mb-5">
              <Avatar initials={initials} size="xl" status="online" />
              <div>
                <p className="text-sm font-medium text-text-primary">{user?.name ?? '—'}</p>
                <p className="text-xs text-text-muted mt-0.5">
                  EverestSave Private Account · •••• {account?.number ?? '——'}
                </p>
                <button className="text-xs text-gold hover:text-gold-light transition-colors duration-150 mt-1.5 inline-flex items-center gap-1.5">
                  <i className="ti ti-camera" style={{ fontSize: 13 }} aria-hidden="true" />
                  Change photo
                </button>
              </div>
            </div>
            {profileError && (
              <p className="text-xs text-danger mb-4 p-3 bg-danger/[0.08] rounded-md border border-danger/20">{profileError}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Email Address" type="email" icon="ti-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Phone Number" icon="ti-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 000-0000" />
              <Input
                label="Account Number"
                icon="ti-credit-card"
                value={account ? `•••• •••• •••• ${account.number}` : '——'}
                disabled
              />
            </div>
            <div className="flex items-center gap-3 mt-5">
              <Button variant="primary" icon="ti-device-floppy" loading={profileSaving} onClick={handleProfileSave}>
                Save Changes
              </Button>
              {profileSaved && <Badge variant="success" dot>Saved</Badge>}
            </div>
          </Card>

          {/* Security */}
          <Card padding="lg">
            <CardHeader
              title="Security"
              action={
                <Button variant="ghost" size="sm" icon="ti-key" onClick={() => {}}>
                  Change Password
                </Button>
              }
            />
            <div className="flex flex-col">
              <Toggle
                checked={twoFactor}
                onChange={(v) => { setTwoFactor(v); savePreference('twoFactor', v) }}
                label="Two-Factor Authentication"
                description={twoFactor ? 'Extra verification required at sign-in' : 'Your account has reduced protection'}
                icon="ti-shield-lock"
              />
              <Toggle
                checked={biometric}
                onChange={(v) => { setBiometric(v); savePreference('biometric', v) }}
                label="Biometric Login"
                description="Use Face ID or fingerprint to sign in"
                icon="ti-fingerprint"
              />
            </div>

            {/* Change password inline */}
            <div className="mt-5 pt-5 border-t border-border">
              <p className="text-[13px] font-medium text-text-primary mb-4">Change Password</p>
              {pwError && (
                <p className="text-xs text-danger mb-3 p-3 bg-danger/[0.08] rounded-md border border-danger/20">{pwError}</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Current Password"
                  type="password"
                  icon="ti-lock"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <Input
                  label="New Password"
                  type="password"
                  icon="ti-lock-check"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                />
              </div>
              <div className="flex items-center gap-3 mt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  icon="ti-refresh"
                  loading={pwSaving}
                  disabled={!currentPassword || !newPassword}
                  onClick={handlePasswordChange}
                >
                  Update Password
                </Button>
                {pwSaved && <Badge variant="success" dot>Password updated</Badge>}
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card padding="lg">
            <CardHeader title="Notifications" />
            <div className="flex flex-col">
              <Toggle
                checked={txnAlerts}
                onChange={(v) => { setTxnAlerts(v); savePreference('txnAlerts', v) }}
                label="Transaction Alerts"
                description="Get notified for every card transaction"
                icon="ti-bell-ringing"
              />
              <Toggle
                checked={securityAlerts}
                onChange={(v) => { setSecurityAlerts(v); savePreference('securityAlerts', v) }}
                label="Security Alerts"
                description="Sign-ins from new devices and locations"
                icon="ti-alert-triangle"
              />
              <Toggle
                checked={marketingEmails}
                onChange={(v) => { setMarketingEmails(v); savePreference('marketingEmails', v) }}
                label="Marketing Emails"
                description="Offers, news, and product updates"
                icon="ti-mail-opened"
              />
              {prefSaving && (
                <p className="text-[11px] text-text-muted mt-2">Saving preferences…</p>
              )}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          {/* Account summary */}
          <Card padding="lg">
            <CardHeader title="Account" />
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Account Holder</span>
                <span className="text-sm text-text-primary font-medium">{user?.name ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Account Type</span>
                <span className="text-sm text-text-primary font-medium">EverestSave Private</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Member Since</span>
                <span className="text-sm text-text-primary font-medium font-mono">{memberSince}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Status</span>
                <Badge variant={user?.status === 'active' ? 'success' : 'warning'} dot>
                  {user?.status === 'active' ? 'Verified' : user?.status ?? '—'}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Preferences */}
          <Card padding="lg">
            <CardHeader title="Preferences" />
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[11px] tracking-[0.1em] uppercase text-text-muted font-medium mb-2 block">
                  Display Currency
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {currencies.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setPrefCurrency(c); savePreference('currency', c) }}
                      className={`text-xs font-medium px-3.5 py-1.5 rounded-md border transition-colors duration-150 ${
                        prefCurrency === c
                          ? 'bg-gold/[0.12] border-gold/40 text-gold'
                          : 'bg-bg-elevated border-border text-text-secondary hover:text-text-primary hover:border-border-strong'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-bg-elevated border border-border">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-md bg-bg-card border border-border flex items-center justify-center text-gold shrink-0">
                    <i className="ti ti-moon-stars" style={{ fontSize: 16 }} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm text-text-primary font-medium">Appearance</p>
                    <p className="text-xs text-text-muted">Dark · Gold accent</p>
                  </div>
                </div>
                <Badge variant="neutral">Default</Badge>
              </div>
            </div>
          </Card>

          {/* Danger zone */}
          <Card padding="lg">
            <CardHeader title="Danger Zone" />
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-md bg-danger/10 text-danger flex items-center justify-center shrink-0">
                <i className="ti ti-alert-octagon" style={{ fontSize: 17 }} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm text-text-primary font-medium">Close account</p>
                <p className="text-xs text-text-muted mt-1">
                  {confirmingClose
                    ? 'Are you sure? This action cannot be undone and requires contacting support to reverse.'
                    : 'Permanently close your EverestSave account and all linked cards.'}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="danger"
                    size="sm"
                    icon="ti-trash"
                    onClick={() => setConfirmingClose((v) => !v)}
                  >
                    {confirmingClose ? 'Cancel' : 'Close Account'}
                  </Button>
                  {confirmingClose && (
                    <Button variant="ghost" size="sm">I understand, proceed</Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Settings
