import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, UserRound } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../components/auth-context';
import { Input, Select, Shell, Surface } from '../components/ui';

export default function Login() {
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
      const res = await api.post('/auth/login', { email, password });
      if (res.data.user.role && res.data.user.role !== role) {
        setError(`Please sign in with your registered role: ${res.data.user.role}.`);
        return;
      }
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login.');
    }
  };

  return (
    <Shell>
      <section className="auth-layout">
        <div className="auth-copy">
          <span className="eyebrow">Welcome back</span>
          <h1>Continue your impact journey.</h1>
          <p>Sign in to discover events, track volunteer progress, and manage community programs through one polished dashboard.</p>
        </div>

        <Surface className="auth-card surface-glow">
          <h2>Sign in</h2>
          <p className="muted-copy">Choose your role to enter the right experience.</p>
          {error ? <div className="alert alert-error">{error}</div> : null}
          <form onSubmit={handleSubmit} className="styled-form">
            <Input label="Email" icon={Mail} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <Input label="Password" icon={Lock} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <Select label="Role" icon={UserRound} value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="student">Student</option>
              <option value="organizer">Organizer</option>
            </Select>
            <button type="submit" className="btn-primary full-width">Sign in</button>
          </form>
          <p className="muted-copy">
            New to Community Serve? <Link to="/register">Create an account</Link>
          </p>
        </Surface>
      </section>
    </Shell>
  );
}
