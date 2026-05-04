import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the api module before importing components
vi.mock('../lib/api', () => ({
  api: {
    get: vi.fn().mockRejectedValue(new Error('Not authenticated')),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

import App from '../App';

describe('App', () => {
  it('should render without crashing', () => {
    render(<App />);
    // The app should render the Layout with nav brand
    expect(screen.getByText('Job Board')).toBeInTheDocument();
  });

  it('should show login and register links for unauthenticated users', async () => {
    render(<App />);

    // Wait for auth loading to finish, then check nav links
    const loginLinks = await screen.findAllByText(/login/i);
    expect(loginLinks.length).toBeGreaterThan(0);
  });
});
