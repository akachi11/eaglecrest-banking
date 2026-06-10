import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';

const SignIn: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* ── left brand panel ── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] shrink-0 flex-col justify-between relative overflow-hidden bg-bg-card border-r border-border p-10">
        {/* ambient glow */}
        <div
          className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 65%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 65%)' }}
        />

        {/* wordmark */}
        <div className="relative">
          <span className="font-display text-2xl font-semibold tracking-[0.12em] text-gold select-none">
            APEXTRUST BANK
          </span>
          <p className="text-xs text-text-muted tracking-[0.08em] mt-1">Private Banking</p>
        </div>

        {/* centre quote */}
        <div className="relative">
          <div className="w-8 h-[2px] bg-gold mb-6" />
          <p className="font-display text-2xl xl:text-3xl text-text-primary leading-snug">
            Your wealth,<br />managed with<br />precision.
          </p>
          <p className="text-sm text-text-secondary mt-5 leading-relaxed max-w-xs">
            ApexTrust gives you a complete view of your finances — accounts, cards, loans, and
            savings goals — all in one place.
          </p>
        </div>

        {/* footer note */}
        <p className="relative text-[11px] text-text-muted">
          Protected by 256-bit encryption &amp; two-factor authentication
        </p>
      </div>

      {/* ── right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* mobile wordmark */}
        <div className="lg:hidden mb-10 text-center">
          <span className="font-display text-xl font-semibold tracking-[0.12em] text-gold select-none">
            APEXTRUST BANK
          </span>
          <p className="text-xs text-text-muted tracking-[0.06em] mt-0.5">Private Banking</p>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-medium text-text-primary mb-1">Welcome back</h1>
          <p className="text-sm text-text-secondary mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-lg bg-danger/[0.08] border border-danger/20 mb-6">
              <i className="ti ti-alert-circle text-danger shrink-0" style={{ fontSize: 15 }} aria-hidden="true" />
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              label="Email address"
              type="email"
              icon="ti-mail"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] tracking-[0.1em] uppercase text-text-muted font-medium">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[11px] text-gold hover:text-gold-light transition-colors duration-150"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <i
                  className="ti ti-lock absolute left-3 text-base text-text-muted pointer-events-none"
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                  aria-hidden="true"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full bg-bg-card border border-border rounded-md text-text-primary font-body text-sm pl-[38px] pr-10 py-2.5 transition-colors duration-150 outline-none placeholder:text-text-muted hover:border-border-strong focus:border-gold-dim focus:shadow-[0_0_0_3px_rgba(201,168,76,0.08)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors duration-150"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`ti ${showPassword ? 'ti-eye-off' : 'ti-eye'}`} style={{ fontSize: 15 }} aria-hidden="true" />
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              className="mt-2"
            >
              Sign In
            </Button>
          </form>

          <p className="text-sm text-text-secondary text-center mt-6">
            Don&apos;t have an account?{' '}
            <Link
              to="/sign-up"
              className="text-gold hover:text-gold-light transition-colors duration-150 font-medium"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
