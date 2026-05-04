import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/useAuth';
import { ApplyModal } from '../components/ApplyModal';
import type { Job, JobCategory } from '../types/job';

const CATEGORIES: { value: JobCategory | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Jobs' },
  { value: 'ENGINEERING', label: 'Engineering' },
  { value: 'DESIGN', label: 'Design' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'SALES', label: 'Sales' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'HR', label: 'HR' },
  { value: 'OPERATIONS', label: 'Operations' },
  { value: 'PRODUCT', label: 'Product' },
  { value: 'DATA', label: 'Data' },
  { value: 'OTHER', label: 'Other' },
];

const CATEGORY_ICONS: Partial<Record<JobCategory | 'ALL', string>> = {
  ALL: '✦',
  ENGINEERING: '⚙',
  DESIGN: '✦',
  MARKETING: '◎',
  SALES: '◈',
  FINANCE: '◇',
  HR: '◉',
  OPERATIONS: '▣',
  PRODUCT: '◑',
  DATA: '▦',
  OTHER: '◌',
};

function formatEmploymentType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatSalary(min: number | null, max: number | null): string {
  if (min === null && max === null) return '';
  const fmt = (n: number) => {
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
    return `$${n.toLocaleString()}`;
  };
  if (min !== null && max !== null) return `${fmt(min)} – ${fmt(max)}`;
  if (min !== null) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

function formatDeadline(dateStr: string): string {
  const deadline = new Date(dateStr);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Expired';
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return '1 day left';
  if (diffDays <= 30) return `${diffDays} days left`;
  return deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatPostedDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isDeadlineSoon(dateStr: string): boolean {
  const deadline = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diffDays >= 0 && diffDays <= 7;
}

type FetchState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; jobs: Job[] };

export function HomePage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<
    JobCategory | 'ALL'
  >('ALL');
  const [state, setState] = useState<FetchState>({ status: 'loading' });
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);

  const fetchAppliedJobIds = useCallback(() => {
    if (!user) {
      setAppliedJobIds(new Set());
      return;
    }
    api
      .get<{ jobIds: string[] }>('/applications/me/job-ids')
      .then((res) => setAppliedJobIds(new Set(res.data.jobIds)))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    fetchAppliedJobIds();
  }, [fetchAppliedJobIds]);

  useEffect(() => {
    let cancelled = false;

    const params =
      selectedCategory !== 'ALL' ? { category: selectedCategory } : {};

    setState({ status: 'loading' });
    api
      .get<{ jobs: Job[] }>('/jobs', { params })
      .then((res) => {
        if (!cancelled) setState({ status: 'success', jobs: res.data.jobs });
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            status: 'error',
            message:
              err instanceof Error ? err.message : 'Failed to load jobs',
          });
      });

    return () => {
      cancelled = true;
    };
  }, [selectedCategory]);

  const isLoading = state.status === 'loading';
  const error = state.status === 'error' ? state.message : null;
  const jobs = state.status === 'success' ? state.jobs : [];

  const handleCategoryChange = (value: JobCategory | 'ALL') => {
    setSelectedCategory(value);
  };

  return (
    <div className="home-page">
      {/* Hero */}
      <div className="hero">
        <div className="hero-inner">
          <div className="hero-badge">Now hiring</div>
          <h1 className="hero-title">
            Find Your Next
            <br />
            <span className="hero-title-accent">Opportunity</span>
          </h1>
          <p className="hero-subtitle">
            Browse open positions from companies actively looking for talent
            like yours.
          </p>
          {!user && (
            <div className="hero-cta">
              <Link to="/register" className="btn-hero-primary">
                Create an account
              </Link>
              <Link to="/login" className="btn-hero-secondary">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container-wide">
        {/* Filters */}
        <div className="filters-bar">
          <div className="category-filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                className={`category-btn${selectedCategory === cat.value ? ' active' : ''}`}
                onClick={() => handleCategoryChange(cat.value)}
              >
                <span className="category-btn-icon">
                  {CATEGORY_ICONS[cat.value]}
                </span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {isLoading ? (
          <div className="loading">
            <div className="loading-spinner" />
            Loading jobs…
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">◎</div>
            <p className="empty-state-title">No jobs found</p>
            <p className="empty-state-sub">
              {selectedCategory !== 'ALL'
                ? `There are no open positions in ${selectedCategory.toLowerCase()} right now.`
                : 'No jobs have been posted yet. Check back soon.'}
            </p>
          </div>
        ) : (
          <>
            <p className="results-count">
              {jobs.length} {jobs.length === 1 ? 'position' : 'positions'} open
            </p>
            <div className="job-grid">
              {jobs.map((job) => {
                const salary = formatSalary(job.salaryMin, job.salaryMax);
                const soon = isDeadlineSoon(job.deadline);

                return (
                  <div key={job.id} className="job-card">
                    {/* Card header */}
                    <div className="job-card-header">
                      {job.companyLogo ? (
                        <img
                          src={job.companyLogo}
                          alt={job.companyName}
                          className="job-card-logo"
                        />
                      ) : (
                        <div className="job-card-logo-placeholder">
                          {job.companyName.charAt(0)}
                        </div>
                      )}
                      <div className="job-card-header-text">
                        <h3 className="job-card-title">{job.title}</h3>
                        <p className="job-card-company">{job.companyName}</p>
                      </div>
                      <span className="job-card-badge">
                        {formatEmploymentType(job.employmentType)}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="job-card-description">{job.description}</p>

                    {/* Meta chips */}
                    <div className="job-card-chips">
                      <span className="chip chip-location">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 1a5 5 0 0 0-5 5c0 3.5 5 9 5 9s5-5.5 5-9a5 5 0 0 0-5-5zm0 7a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
                        </svg>
                        {job.location}
                      </span>
                      <span className="chip chip-category">{job.category}</span>
                      {salary && (
                        <span className="chip chip-salary">{salary}</span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="job-card-footer">
                      <div className="job-card-footer-left">
                        <span className="job-card-posted">
                          {formatPostedDate(job.createdAt)}
                        </span>
                        <span className={`job-card-deadline${soon ? ' deadline-soon' : ''}`}>
                          {formatDeadline(job.deadline)}
                        </span>
                      </div>

                      <div className="job-card-action">
                        {!user ? (
                          <Link to="/login" className="apply-btn apply-btn--ghost">
                            Login to apply
                          </Link>
                        ) : appliedJobIds.has(job.id) ? (
                          <span className="job-card-applied">
                            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M13.5 2.5L6 10 2.5 6.5l-1 1L6 12l8.5-8.5z"/>
                            </svg>
                            Applied
                          </span>
                        ) : (
                          <button
                            className="apply-btn"
                            onClick={() => setApplyingJob(job)}
                          >
                            Apply now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {applyingJob && (
        <ApplyModal
          jobId={applyingJob.id}
          jobTitle={applyingJob.title}
          companyName={applyingJob.companyName}
          onClose={() => setApplyingJob(null)}
          onApplied={() => {
            setAppliedJobIds((prev) => new Set(prev).add(applyingJob.id));
            setApplyingJob(null);
          }}
        />
      )}
    </div>
  );
}
