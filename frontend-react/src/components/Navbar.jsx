import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { Heart, LogOut, User } from 'lucide-react';
import Chatbot from './Chatbot';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar glass-panel">
      <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none', color: 'white', fontWeight: 700, fontSize: '1.25rem' }}>
        <Heart className="text-primary" fill="currentColor" />
        CommunityServe
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/" className="nav-link">Events</Link>
        {user?.role === 'organizer' && (
          <Link to="/events/new" className="nav-link">Create Event</Link>
        )}
        <Chatbot />
        {user ? (
          <>
            {user.role === 'student' && (
              <Link to="/dashboard" className="nav-link">My Tracker</Link>
            )}
            {user.role === 'organizer' && (
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
            )}
            <span className="flex items-center gap-2 text-muted ml-2">
              <User size={18} /> {user.name}
            </span>
            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
