import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplyModal } from '../../components/ApplyModal';

// Mock the api module
vi.mock('../../lib/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

import { api } from '../../lib/api';

const mockOnClose = vi.fn();
const mockOnApplied = vi.fn();

const defaultProps = {
  jobId: 'job-1',
  jobTitle: 'Software Engineer',
  companyName: 'Acme Inc',
  onClose: mockOnClose,
  onApplied: mockOnApplied,
};

describe('ApplyModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the modal with job title and company', () => {
    render(<ApplyModal {...defaultProps} />);

    expect(screen.getByText(/apply for software engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/at acme inc/i)).toBeInTheDocument();
  });

  it('should render cover letter textarea and submit button', () => {
    render(<ApplyModal {...defaultProps} />);

    expect(screen.getByLabelText(/cover letter/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit application/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should call onClose when cancel button is clicked', async () => {
    render(<ApplyModal {...defaultProps} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should submit application with cover letter', async () => {
    const mockApplication = {
      id: 'app-1',
      coverLetter: 'I am interested',
      status: 'SUBMITTED',
    };
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { application: mockApplication },
    });

    render(<ApplyModal {...defaultProps} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/cover letter/i), 'I am interested');
    await user.click(screen.getByRole('button', { name: /submit application/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/applications/jobs/job-1', {
        coverLetter: 'I am interested',
      });
      expect(mockOnApplied).toHaveBeenCalledWith(mockApplication);
    });
  });

  it('should submit application without cover letter', async () => {
    const mockApplication = {
      id: 'app-1',
      coverLetter: null,
      status: 'SUBMITTED',
    };
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { application: mockApplication },
    });

    render(<ApplyModal {...defaultProps} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /submit application/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/applications/jobs/job-1', {
        coverLetter: undefined,
      });
    });
  });

  it('should show error message on submission failure', async () => {
    (api.post as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('You have already applied to this job'),
    );

    render(<ApplyModal {...defaultProps} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /submit application/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('You have already applied to this job');
    });
  });

  it('should call onClose when clicking the overlay', async () => {
    render(<ApplyModal {...defaultProps} />);
    const user = userEvent.setup();

    const overlay = document.querySelector('.modal-overlay')!;
    await user.click(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
