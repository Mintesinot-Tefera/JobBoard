import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left brand panel */}
      <aside className="auth-brand" aria-hidden="true">
        <div className="auth-brand-inner">
          <Link to="/" className="auth-brand-logo">
            <span className="auth-brand-logo-icon">◈</span>
            Job Board
          </Link>

          <h2 className="auth-brand-title">
            Your next great
            <br />
            <span className="auth-brand-title-accent">opportunity awaits</span>
          </h2>
          <p className="auth-brand-subtitle">
            Sign in to apply for open roles, track your applications,
            and connect with companies actively hiring.
          </p>

          <div className="auth-brand-features">
            <div className="auth-brand-feature">
              <div className="auth-brand-feature-icon">◎</div>
              <div className="auth-brand-feature-text">
                <strong>Browse hundreds of listings</strong>
                <span>Filtered by category, salary, and type</span>
              </div>
            </div>
            <div className="auth-brand-feature">
              <div className="auth-brand-feature-icon">◈</div>
              <div className="auth-brand-feature-text">
                <strong>One-click applications</strong>
                <span>Apply with an optional cover letter</span>
              </div>
            </div>
            <div className="auth-brand-feature">
              <div className="auth-brand-feature-icon">▦</div>
              <div className="auth-brand-feature-text">
                <strong>Track your progress</strong>
                <span>Real-time status updates from employers</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <span className="auth-badge">Welcome back</span>
          <h1 className="auth-heading">Log in to your account</h1>
          <p className="auth-subheading">
            Don't have an account?{' '}
            <Link to="/register">Create one for free</Link>
          </p>

          <div className="auth-card">
            <form className="form" onSubmit={handleSubmit}>
              {error && (
                <div className="alert-error" role="alert">
                  {error}
                </div>
              )}

              <div className="form-field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Logging in…' : 'Log in'}
              </button>
            </form>
          </div>

          <p className="auth-footer-link">
            New here? <Link to="/register">Create a free account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
