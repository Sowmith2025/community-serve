import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, UserRound } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../components/auth-context';
import { Input, Select, Shell, Surface } from '../components/ui';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register.');
    }
  };

  return (
    <Shell>
      <section className="auth-layout">
        <div className="auth-copy">
          <span className="eyebrow">Get started</span>
          <h1>Join a platform built to make service feel rewarding.</h1>
          <p>Choose the role that matches your journey and enter a bright, community-driven experience designed for long-term participation.</p>
        </div>

        <Surface className="auth-card surface-glow">
          <h2>Create account</h2>
          <p className="muted-copy">A smooth onboarding path for both students and organizers.</p>
          {error ? <div className="alert alert-error">{error}</div> : null}
          <form onSubmit={handleSubmit} className="styled-form">
            <Input label="Full name" value={name} onChange={(event) => setName(event.target.value)} required />
            <Input label="Email" icon={Mail} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <Input label="Password" icon={Lock} type="password" minLength="6" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <Select label="Role" icon={UserRound} value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="student">Student</option>
              <option value="organizer">Organizer</option>
            </Select>
            <button type="submit" className="btn-primary full-width">Create account</button>
          </form>
          <p className="muted-copy">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </Surface>
      </section>
    </Shell>
  );
}
