import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Job, JobCategory, EmploymentType } from '../types/job';

const CATEGORIES: { value: JobCategory; label: string }[] = [
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

const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
];

export function PostJobPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    companyName: '',
    companyLogo: '',
    location: '',
    category: 'ENGINEERING' as JobCategory,
    employmentType: 'FULL_TIME' as EmploymentType,
    salaryMin: '',
    salaryMax: '',
    deadline: '',
    description: '',
  });

  const handleChange =
    (field: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await api.post<{ job: Job }>('/jobs', {
        title: form.title,
        companyName: form.companyName,
        companyLogo: form.companyLogo || undefined,
        location: form.location,
        category: form.category,
        employmentType: form.employmentType,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        deadline: form.deadline,
        description: form.description,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to post job');
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="container">
      <div className="card">
        <h1>Post a Job</h1>
        <form className="form" onSubmit={handleSubmit}>
          {error && (
            <div className="alert-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="title">Job Title</label>
            <input
              id="title"
              type="text"
              required
              placeholder="e.g. Senior Frontend Engineer"
              value={form.title}
              onChange={handleChange('title')}
            />
          </div>

          <div className="form-field">
            <label htmlFor="companyName">Company Name</label>
            <input
              id="companyName"
              type="text"
              required
              value={form.companyName}
              onChange={handleChange('companyName')}
            />
          </div>

          <div className="form-field">
            <label htmlFor="companyLogo">Company Logo URL (optional)</label>
            <input
              id="companyLogo"
              type="url"
              placeholder="https://example.com/logo.png"
              value={form.companyLogo}
              onChange={handleChange('companyLogo')}
            />
          </div>

          <div className="form-field">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              required
              placeholder="e.g. Remote, New York, NY"
              value={form.location}
              onChange={handleChange('location')}
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                required
                value={form.category}
                onChange={handleChange('category')}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="employmentType">Employment Type</label>
              <select
                id="employmentType"
                required
                value={form.employmentType}
                onChange={handleChange('employmentType')}
              >
                {EMPLOYMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="salaryMin">Min Salary (optional)</label>
              <input
                id="salaryMin"
                type="number"
                min={0}
                placeholder="50000"
                value={form.salaryMin}
                onChange={handleChange('salaryMin')}
              />
            </div>

            <div className="form-field">
              <label htmlFor="salaryMax">Max Salary (optional)</label>
              <input
                id="salaryMax"
                type="number"
                min={0}
                placeholder="80000"
                value={form.salaryMax}
                onChange={handleChange('salaryMax')}
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="deadline">Application Deadline</label>
            <input
              id="deadline"
              type="date"
              required
              min={today}
              value={form.deadline}
              onChange={handleChange('deadline')}
            />
          </div>

          <div className="form-field">
            <label htmlFor="description">Job Description</label>
            <textarea
              id="description"
              rows={8}
              required
              placeholder="Describe the role, responsibilities, and requirements..."
              value={form.description}
              onChange={handleChange('description')}
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Posting…' : 'Post Job'}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
