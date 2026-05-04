import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../lib/api';
import type { Application } from '../types/application';

interface ApplyModalProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  onClose: () => void;
  onApplied: (application: Application) => void;
}

export function ApplyModal({
  jobId,
  jobTitle,
  companyName,
  onClose,
  onApplied,
}: ApplyModalProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { data } = await api.post<{ application: Application }>(
        `/applications/jobs/${jobId}`,
        { coverLetter: coverLetter || undefined },
      );
      onApplied(data.application);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Application failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Apply for {jobTitle}</h2>
        <p className="modal-subtitle">at {companyName}</p>

        <form className="form" onSubmit={handleSubmit}>
          {error && (
            <div className="alert-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-field">
            <label htmlFor="coverLetter">Cover Letter (optional)</label>
            <textarea
              id="coverLetter"
              rows={6}
              placeholder="Tell the employer why you're a great fit..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={onClose}
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
