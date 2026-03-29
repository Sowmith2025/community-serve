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

  const [feedbackMode, setFeedbackMode] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

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

  const handleAwardCertificate = async (userId) => {
    if (!window.confirm("Award certificate and 5 hours to this volunteer?")) return;
    try {
      await api.post(`/events/${id}/award/${userId}`);
      setSuccess('Certificate awarded successfully!');
      fetchEvent();
    } catch (err) {
      setError(err.response?.data?.message || 'Error awarding certificate.');
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

  const handleSubmitFeedback = async () => {
    if (!user) return;
    setSubmittingFeedback(true);
    setError('');
    try {
      await api.post(`/events/${id}/feedback`, { userId: user.id, rating, feedback });
      setSuccess('Feedback submitted successfully!');
      setFeedbackMode(false);
      fetchEvent();
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) return <div className="text-center text-muted mt-4">Loading...</div>;
  if (!event) return <div className="text-center text-muted mt-4">{error}</div>;

  const myRegistration = event.registeredUsers?.find(u => u.id === user?.id);
  const isRegistered = !!myRegistration;
  const isAwarded = myRegistration?.status === 'awarded';
  const isOwnEvent = user?.id === event.organizer?.id;

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
          {isOwnEvent ? (
            <button className="btn-secondary w-full justify-center opacity-50 cursor-not-allowed text-xl py-3" disabled style={{ padding: '1rem' }}>
              You are the Event Organizer
            </button>
          ) : isRegistered ? (
            <div className="flex gap-4 w-full">
              {isAwarded ? (
                <button className="btn-primary flex-1 justify-center" onClick={() => setShowCertificate(true)} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', color: 'white' }}>
                  🏆 View Certificate
                </button>
              ) : (
                <button className="btn-secondary flex-1 justify-center cursor-default" disabled>
                  Registered
                </button>
              )}
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

        {isRegistered && !feedbackMode && (
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button className="btn-secondary w-full justify-center py-2" onClick={() => setFeedbackMode(true)}>
              Leave Feedback
            </button>
          </div>
        )}

        {feedbackMode && (
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 className="text-xl mb-4">Leave Feedback</h3>
            <div className="mb-4">
              <label className="block text-sm text-muted mb-2">Rating ({rating}/5)</label>
              <input type="range" min="1" max="5" value={rating} onChange={(e) => setRating(parseInt(e.target.value))} className="w-full" />
            </div>
            <div className="mb-4">
              <label className="block text-sm text-muted mb-2">Comments</label>
              <textarea className="form-input" rows="3" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What did you think of the event?"></textarea>
            </div>
            <div className="flex gap-4">
              <button className="btn-primary flex-1 justify-center" disabled={submittingFeedback} onClick={handleSubmitFeedback}>{submittingFeedback ? 'Submitting...' : 'Submit Feedback'}</button>
              <button className="btn-secondary flex-1 justify-center" onClick={() => setFeedbackMode(false)}>Cancel</button>
            </div>
          </div>
        )}

        {isOwnEvent && (
          <>
            <div className="flex gap-4 mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
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
            
            {/* Volunteers List */}
            {event.registeredUsers?.length > 0 && (
              <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 className="text-2xl mb-4">Manage Volunteers</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th className="p-2 text-muted font-normal">Name</th>
                        <th className="p-2 text-muted font-normal">Email</th>
                        <th className="p-2 text-muted font-normal">Date Registered</th>
                        <th className="p-2 text-muted font-normal text-right">Certificate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.registeredUsers.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td className="p-2 font-bold">{u.name}</td>
                          <td className="p-2 text-sm">{u.email}</td>
                          <td className="p-2 text-sm text-muted">{new Date(u.registeredAt).toLocaleDateString()}</td>
                          <td className="p-2 text-right">
                            {u.status === 'awarded' ? (
                              <span className="badge" style={{ background: '#10b981', color: 'white' }}>Awarded</span>
                            ) : (
                              <button 
                                className="btn-secondary" 
                                style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                                onClick={() => handleAwardCertificate(u.id)}
                              >
                                Award
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {event.registeredUsers?.filter(u => u.feedback).length > 0 && (
              <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 className="text-2xl mb-4">Student Feedback</h3>
                <div className="grid gap-4">
                  {event.registeredUsers.filter(u => u.feedback).map(u => (
                    <div key={u.id} className="p-4 rounded-lg bg-gray-800" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="flex justify-between mb-2">
                        <span className="font-bold">{u.name}</span>
                        <span className="text-yellow-400">{'★'.repeat(u.rating)}{'☆'.repeat(5 - u.rating)}</span>
                      </div>
                      <p className="text-muted text-sm m-0">{u.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
          <div className="bg-white text-gray-900 rounded-lg shadow-2xl overflow-hidden" style={{ width: '100%', maxWidth: '800px', position: 'relative' }}>
            <button onClick={() => setShowCertificate(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-900">
              ✕
            </button>
            
            <div className="p-12 text-center" style={{ border: '15px solid #f59e0b', margin: '15px', background: 'linear-gradient(to bottom right, #ffffff, #fef3c7)' }}>
              <h1 className="text-4xl font-serif text-yellow-600 mb-2">CERTIFICATE</h1>
              <h3 className="text-xl font-serif text-gray-500 tracking-widest mb-8">OF ACHIEVEMENT</h3>
              
              <p className="text-gray-600 italic mb-4">This uniquely acknowledges that</p>
              <h2 className="text-5xl font-bold font-serif text-gray-900 mb-6 border-b-2 border-yellow-500 pb-2 inline-block px-8">{user?.name}</h2>
              
              <p className="text-gray-600 text-lg mx-auto max-w-lg mb-8">
                has successfully dedicated their time and valuable efforts to the community by actively participating in the event:
                <br /><strong className="text-gray-900 text-xl mt-2 block">{event.title}</strong>
              </p>
              
              <div className="flex justify-between items-end px-12 mt-12">
                <div className="text-center">
                  <div className="border-b border-gray-400 w-32 mb-2 font-bold">{event.organizer?.name}</div>
                  <div className="text-sm text-gray-500">Event Organizer</div>
                </div>
                
                <div className="w-24 h-24 rounded-full bg-yellow-500 text-white flex items-center justify-center text-center font-bold font-serif transform -rotate-12 border-4 border-yellow-200">
                  <span className="text-sm leading-tight">OFFICIAL<br/>AWARD</span>
                </div>
                
                <div className="text-center">
                  <div className="border-b border-gray-400 w-32 mb-2 font-bold">{new Date().toLocaleDateString()}</div>
                  <div className="text-sm text-gray-500">Date Issued</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
