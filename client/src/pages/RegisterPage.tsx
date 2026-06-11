import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/useAuth';

export function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({ name, email, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
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
            Land your
            <br />
            <span className="auth-brand-title-accent">dream role today</span>
          </h2>
          <p className="auth-brand-subtitle">
            Join thousands of professionals already using Job Board to find
            their next opportunity and take the next step in their career.
          </p>

          <div className="auth-brand-features">
            <div className="auth-brand-feature">
              <div className="auth-brand-feature-icon">✦</div>
              <div className="auth-brand-feature-text">
                <strong>Free to join</strong>
                <span>Create your account in under a minute</span>
              </div>
            </div>
            <div className="auth-brand-feature">
              <div className="auth-brand-feature-icon">◉</div>
              <div className="auth-brand-feature-text">
                <strong>Post and discover</strong>
                <span>Browse roles or list your own openings</span>
              </div>
            </div>
            <div className="auth-brand-feature">
              <div className="auth-brand-feature-icon">◑</div>
              <div className="auth-brand-feature-text">
                <strong>Stay informed</strong>
                <span>Track every application in one place</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">
          <span className="auth-badge">Get started — it's free</span>
          <h1 className="auth-heading">Create your account</h1>
          <p className="auth-subheading">
            Already have an account?{' '}
            <Link to="/login">Log in</Link>
          </p>

          <div className="auth-card">
            <div className="auth-google-btn">
              <GoogleLogin
                onSuccess={async ({ credential }) => {
                  if (!credential) return;
                  setError(null);
                  try {
                    await loginWithGoogle(credential);
                    navigate('/', { replace: true });
                  } catch {
                    setError('Google sign-in failed. Please try again.');
                  }
                }}
                onError={() => setError('Google sign-in failed. Please try again.')}
                text="signup_with"
                shape="rectangular"
                theme="outline"
              />
            </div>

            <div className="auth-divider">or</div>

            <form className="form" onSubmit={handleSubmit}>
              {error && (
                <div className="alert-error" role="alert">
                  {error}
                </div>
              )}

              <div className="form-field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

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
                  autoComplete="new-password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account…' : 'Create account'}
              </button>
            </form>
          </div>

          <p className="auth-footer-link">
            Already a member? <Link to="/login">Log in to your account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
