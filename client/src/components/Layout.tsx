import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Footer } from './Footer';

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return <span className="nav-avatar">{initials}</span>;
}

export function Layout() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <nav className="nav">
        <Link to="/" className="nav-brand">
          <span className="nav-brand-icon">◈</span>
          Job Board
        </Link>
        <div className="nav-links">
          {isLoading ? null : user ? (
            <>
              <Link to="/jobs/new" className="btn-nav-primary">
                Post a Job
              </Link>
              <Link to="/applications" className="nav-link">
                My Applications
              </Link>
              <Link to="/profile" className="nav-profile">
                <Avatar name={user.name} />
                <span className="nav-user">{user.name}</span>
              </Link>
              <button className="btn-nav-ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="btn-nav-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
