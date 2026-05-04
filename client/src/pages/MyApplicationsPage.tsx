import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Application } from '../types/application';

function formatEmploymentType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatStatus(status: string): string {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusClass(status: string): string {
  return `status-badge status-${status.toLowerCase().replace(/_/g, '-')}`;
}

type FetchState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; applications: Application[] };

export function MyApplicationsPage() {
  const [state, setState] = useState<FetchState>({ status: 'loading' });
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ applications: Application[] }>('/applications/me')
      .then((res) =>
        setState({ status: 'success', applications: res.data.applications }),
      )
      .catch((err) =>
        setState({
          status: 'error',
          message:
            err instanceof Error ? err.message : 'Failed to load applications',
        }),
      );
  }, []);

  const handleWithdraw = async (id: string) => {
    setWithdrawingId(id);
    try {
      const { data } = await api.patch<{ application: Application }>(
        `/applications/${id}/withdraw`,
      );
      setState((prev) => {
        if (prev.status !== 'success') return prev;
        return {
          ...prev,
          applications: prev.applications.map((app) =>
            app.id === id ? data.application : app,
          ),
        };
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Withdraw failed');
    } finally {
      setWithdrawingId(null);
    }
  };

  const isLoading = state.status === 'loading';
  const error = state.status === 'error' ? state.message : null;
  const applications =
    state.status === 'success' ? state.applications : [];

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>My Applications</h1>

      {error && <div className="alert-error">{error}</div>}

      {isLoading ? (
        <div className="loading">Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="empty-state">
          <p>You haven't applied to any jobs yet.</p>
        </div>
      ) : (
        <div className="application-list">
          {applications.map((app) => (
            <div key={app.id} className="application-card">
              <div className="application-card-header">
                <div>
                  <h3 className="application-card-title">
                    {app.job.title}
                  </h3>
                  <p className="application-card-company">
                    {app.job.companyName}
                  </p>
                </div>
                <span className={statusClass(app.status)}>
                  {formatStatus(app.status)}
                </span>
              </div>

              <div className="application-card-meta">
                <span>{app.job.location}</span>
                <span>{formatEmploymentType(app.job.employmentType)}</span>
                <span>
                  Applied {new Date(app.createdAt).toLocaleDateString()}
                </span>
              </div>

              {app.coverLetter && (
                <p className="application-card-cover-letter">
                  {app.coverLetter}
                </p>
              )}

              {app.status !== 'WITHDRAWN' && app.status !== 'REJECTED' && (
                <div className="application-card-actions">
                  <button
                    className="secondary"
                    style={{ fontSize: '0.8125rem', padding: '0.375rem 1rem' }}
                    disabled={withdrawingId === app.id}
                    onClick={() => handleWithdraw(app.id)}
                  >
                    {withdrawingId === app.id
                      ? 'Withdrawing...'
                      : 'Withdraw'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
