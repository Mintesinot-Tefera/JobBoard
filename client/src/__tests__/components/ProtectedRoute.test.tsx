import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ProtectedRoute } from '../../components/ProtectedRoute';

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  bio: null,
  headline: null,
  location: null,
  website: null,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

function renderWithAuth(user: typeof mockUser | null, isLoading = false) {
  return render(
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        updateProfile: vi.fn(),
      }}
    >
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('ProtectedRoute', () => {
  it('should show loading state while auth is loading', () => {
    renderWithAuth(null, true);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    renderWithAuth(null, false);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('should render child route when user is authenticated', () => {
    renderWithAuth(mockUser, false);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
