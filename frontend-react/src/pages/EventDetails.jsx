import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../components/AuthContext';
import { Calendar, MapPin, Users, User, Clock } from 'lucide-react';

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = () => {
    api.get(`/events/${id}`).then((res) => {
      setEvent(res.data.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setError('Event not found.');
      setLoading(false);
    });
  };

  const handleUnregister = async () => {
    if (!user) return;
    setRegistering(true);
    setError('');
    try {
      await api.delete(`/events/${id}/register/${user.id}`);
      setSuccess('Successfully unregistered!');
      fetchEvent();
    } catch (err) {
      setError(err.response?.data?.message || 'Error unregistering.');
    } finally {
      setRegistering(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.delete(`/events/${id}`);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting event.');
    }
  };

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setRegistering(true);
    setError('');
    try {
      await api.post(`/events/${id}/register`, { userId: user.id });
      setSuccess('Successfully registered!');
      fetchEvent(); // Refresh count
    } catch (err) {
      setError(err.response?.data?.message || 'Error parsing registration.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div className="text-center text-muted mt-4">Loading...</div>;
  if (!event) return <div className="text-center text-muted mt-4">{error}</div>;

  const isRegistered = event.registeredUsers?.some(u => u.id === user?.id);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '3rem' }}>
        <div className="mb-4">
          <span className="badge">{event.category}</span>
        </div>
        <h1 className="text-4xl mb-4">{event.title}</h1>
        <p className="text-muted text-xl mb-8">{event.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="flex items-center gap-4 text-muted">
            <div className="glass-panel" style={{ padding: '1rem', borderRadius: '50%' }}>
              <Calendar className="text-primary" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 600 }}>Date & Time</div>
              <div>{event.date} at {event.time}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-muted">
            <div className="glass-panel" style={{ padding: '1rem', borderRadius: '50%' }}>
              <MapPin className="text-primary" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 600 }}>Location</div>
              <div>{event.location}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-muted">
            <div className="glass-panel" style={{ padding: '1rem', borderRadius: '50%' }}>
              <User className="text-primary" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 600 }}>Organizer</div>
              <div>{event.organizer?.name || 'Unknown'}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-muted">
            <div className="glass-panel" style={{ padding: '1rem', borderRadius: '50%' }}>
              <Users className="text-primary" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 600 }}>Registration</div>
              <div>{event.registeredCount} / {event.maxVolunteers} Volunteers</div>
            </div>
          </div>
        </div>

        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8 }}>{error}</div>}
        {success && <div style={{ color: '#10b981', marginBottom: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 8 }}>{success}</div>}

        <div className="flex gap-4">
          {isRegistered ? (
            <div className="flex gap-4 w-full">
              <button className="btn-secondary flex-1 justify-center cursor-default" disabled>
                Registered
              </button>
              <button
                className="btn-primary flex-1 justify-center"
                style={{ backgroundColor: '#ef4444', border: 'none' }}
                onClick={handleUnregister}
                disabled={registering}
              >
                {registering ? 'Wait...' : 'Unregister'}
              </button>
            </div>
          ) : (
            <button
              className="btn-primary w-full justify-center text-xl py-3"
              onClick={handleRegister}
              disabled={registering || event.isFull}
              style={{ padding: '1rem' }}
            >
              {registering ? 'Registering...' : event.isFull ? 'Event Full' : 'Register Now'}
            </button>
          )}
        </div>

        {user?.role === 'organizer' && (
          <div className="flex gap-4 mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button
              className="btn-secondary flex-1 justify-center"
              onClick={() => navigate(`/events/${id}/edit`)}
            >
              Edit Event
            </button>
            <button
              className="btn-primary flex-1 justify-center"
              style={{ backgroundColor: '#ef4444', border: 'none' }}
              onClick={handleDeleteEvent}
            >
              Delete Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
