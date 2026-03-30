import { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { HeartHandshake, LogOut, UserRound } from 'lucide-react';
import { AuthContext } from './auth-context';
import Chatbot from './Chatbot';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar-wrap">
      <nav className="navbar surface">
        <Link to="/" className="brand-mark">
          <span className="brand-icon">
            <HeartHandshake size={18} />
          </span>
          <div>
            <strong>Community Serve</strong>
            <span>Serve together, grow together</span>
          </div>
        </Link>

        <div className="nav-links">
          <NavLink to="/" className="nav-link">Home</NavLink>
          <NavLink to="/events" className="nav-link">Explore Events</NavLink>
          {user ? <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink> : null}
          {user ? <NavLink to="/profile" className="nav-link">Profile</NavLink> : null}
          {user?.role === 'organizer' ? <NavLink to="/events/new" className="nav-link">Create Event</NavLink> : null}
        </div>

        <div className="nav-actions">
          <Chatbot />
          {user ? (
            <>
              <div className="nav-user">
                <UserRound size={16} />
                <span>{user.name}</span>
              </div>
              <button onClick={handleLogout} className="btn-secondary slim">
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn-primary slim">Get started</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
