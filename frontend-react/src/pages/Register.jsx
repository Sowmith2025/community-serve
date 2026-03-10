import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../components/AuthContext';
import { Lock, Mail, User } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    }
  };

  return (
    <div className="flex justify-center items-center" style={{ minHeight: '70vh' }}>
      <div className="glass-panel w-full" style={{ maxWidth: 450, padding: '3rem 2rem' }}>
        <div className="text-center mb-8">
          <h2 className="text-4xl mb-2">Create Account</h2>
          <p className="text-muted">Start making an impact in your community.</p>
        </div>

        {error && <div style={{ color: '#ef4444', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User className="text-muted" size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '3rem' }}
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail className="text-muted" size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                className="input-field"
                style={{ paddingLeft: '3rem' }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group mb-8">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock className="text-muted" size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                className="input-field"
                style={{ paddingLeft: '3rem' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
          </div>

          <div className="form-group mb-8">
            <label className="input-label">Role</label>
            <div style={{ position: 'relative' }}>
              <User className="text-muted" size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }} />
              <select
                className="input-field"
                style={{ paddingLeft: '3rem', appearance: 'none' }}
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                <option value="student">Student</option>
                <option value="organizer">Organizer</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full justify-center text-xl mb-4" style={{ padding: '0.875rem' }}>
            Sign Up
          </button>
        </form>

        <p className="text-center text-muted">
          Already have an account? <Link to="/login" className="text-primary" style={{ textDecoration: 'none' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
