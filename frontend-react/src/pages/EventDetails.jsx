import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Calendar, Clock3, MapPin, Star, Trash2, UserRound, Users } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../components/auth-context';
import { EmptyState, PageIntro, ProgressBar, SectionHeader, Shell, Surface, Textarea } from '../components/ui';

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

  const fetchEvent = useCallback(() => {
    setLoading(true);
    api
      .get(`/events/${id}`)
      .then((res) => {
        setEvent(res.data.data);
        setError('');
      })
      .catch(() => {
        setError('Event not found.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const myRegistration = event?.registeredUsers?.find((participant) => participant.id === user?.id);
  const isRegistered = Boolean(myRegistration);
  const isAwarded = myRegistration?.status === 'awarded';
  const isOwnEvent = user?.id === event?.organizer?.id;
  const fillRate = useMemo(() => {
    if (!event?.maxVolunteers) return 0;
    return Math.min(100, Math.round(((event.registeredCount || 0) / event.maxVolunteers) * 100));
  }, [event]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setRegistering(true);
    setError('');
    try {
      await api.post(`/events/${id}/register`, { userId: user.id });
      setSuccess('You are registered and ready to make an impact.');
      fetchEvent();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregister = async () => {
    if (!user) return;
    setRegistering(true);
    setError('');
    try {
      await api.delete(`/events/${id}/register/${user.id}`);
      setSuccess('Your registration has been removed.');
      fetchEvent();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel registration.');
    } finally {
      setRegistering(false);
    }
  };

  const handleAwardCertificate = async (userId) => {
    if (!window.confirm('Award certificate and 5 hours to this volunteer?')) return;
    try {
      await api.post(`/events/${id}/award/${userId}`);
      setSuccess('Certificate awarded successfully.');
      fetchEvent();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not award certificate.');
    }
  };

  const handleDeleteEvent = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete event.');
    }
  };

  const handleSubmitFeedback = async () => {
    if (!user) return;
    setSubmittingFeedback(true);
    setError('');
    try {
      await api.post(`/events/${id}/feedback`, { userId: user.id, rating, feedback });
      setSuccess('Thanks for sharing your feedback.');
      setFeedbackMode(false);
      fetchEvent();
    } catch (err) {
      setError(err.response?.data?.message || 'Feedback submission failed.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <Shell>
        <div className="loading-panel surface">Loading event details...</div>
      </Shell>
    );
  }

  if (!event) {
    return (
      <Shell>
        <EmptyState
          title="We could not find that event"
          description={error || 'The event may have been removed or the link may be outdated.'}
          action={<Link to="/events" className="btn-primary">Browse events</Link>}
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="details-hero">
        <div className={`details-cover category-${(event.category || 'community').toLowerCase()}`}>
          <span className="badge">{event.category}</span>
          <PageIntro
            eyebrow="Event details"
            title={event.title}
            description={event.description}
            actions={
              !isRegistered ? (
                <button className="btn-primary" onClick={handleRegister} disabled={registering || event.isFull}>
                  {registering ? 'Registering...' : event.isFull ? 'Event full' : 'Register now'}
                </button>
              ) : (
                <>
                  {isAwarded ? (
                    <button className="btn-primary" onClick={() => setShowCertificate(true)}>View certificate</button>
                  ) : (
                    <button className="btn-secondary" disabled>Registered</button>
                  )}
                  <button className="btn-secondary" onClick={handleUnregister} disabled={registering}>
                    {registering ? 'Updating...' : 'Cancel registration'}
                  </button>
                </>
              )
            }
          />
        </div>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}
      {success ? <div className="alert alert-success">{success}</div> : null}

      <section className="details-layout">
        <div className="details-main">
          <Surface>
            <SectionHeader
              eyebrow="At a glance"
              title="Everything a volunteer needs before saying yes"
              description="Clear logistics, social proof, and the right call to action reduce hesitation and support confident signups."
            />
            <div className="facts-grid">
              <div className="fact-card"><Calendar size={18} /><div><strong>Date</strong><span>{event.date}</span></div></div>
              <div className="fact-card"><Clock3 size={18} /><div><strong>Time</strong><span>{event.time}</span></div></div>
              <div className="fact-card"><MapPin size={18} /><div><strong>Location</strong><span>{event.location}</span></div></div>
              <div className="fact-card"><UserRound size={18} /><div><strong>Organizer</strong><span>{event.organizer?.name || 'Community partner'}</span></div></div>
            </div>
          </Surface>

          <Surface>
            <SectionHeader
              eyebrow="Why this event feels credible"
              title="Social proof and participation signals"
              description="Participant counts, fill progress, and organizer identity help students trust the opportunity quickly."
            />
            <div className="social-proof-panel">
              <div className="social-proof-stat">
                <Users size={18} />
                <div>
                  <strong>{event.registeredCount || 0} volunteers joined</strong>
                  <span>{event.maxVolunteers} total spots available</span>
                </div>
              </div>
              <ProgressBar label="Capacity filled" value={fillRate} helper={`${fillRate}% of available volunteer spots are taken`} />
              <div className="map-card">
                <div>
                  <span className="eyebrow">Location preview</span>
                  <h3>{event.location}</h3>
                  <p>Designed as a future-ready area for map embeds, transit info, and nearby landmarks.</p>
                </div>
                <div className="map-placeholder">
                  <span>Map integration ready</span>
                </div>
              </div>
            </div>
          </Surface>

          {isRegistered ? (
            <Surface>
              <SectionHeader
                eyebrow="Post-event feedback"
                title="Capture reflection while the experience is fresh"
                description="Fast feedback loops help organizers improve and help students feel heard."
              />
              {!feedbackMode ? (
                <button className="btn-secondary" onClick={() => setFeedbackMode(true)}>Leave feedback</button>
              ) : (
                <div className="feedback-form">
                  <label className="field">
                    <span>Rating</span>
                    <div className="rating-row" role="radiogroup" aria-label="Event rating">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          className={`rating-star ${value <= rating ? 'active' : ''}`}
                          onClick={() => setRating(value)}
                          aria-label={`Rate ${value} stars`}
                        >
                          <Star size={18} fill={value <= rating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </label>
                  <Textarea
                    label="Comments"
                    rows="4"
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    placeholder="Share what went well and how the experience could improve."
                  />
                  <div className="feedback-actions">
                    <button className="btn-primary" onClick={handleSubmitFeedback} disabled={submittingFeedback}>
                      {submittingFeedback ? 'Submitting...' : 'Submit feedback'}
                    </button>
                    <button className="btn-secondary" onClick={() => setFeedbackMode(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </Surface>
          ) : null}

          {isOwnEvent ? (
            <>
              <Surface>
                <SectionHeader
                  eyebrow="Organizer tools"
                  title="Manage participants and event operations"
                  description="This layout supports participant review, recognition, and future live operations features."
                />
                <div className="organizer-controls">
                  <button className="btn-secondary" onClick={() => navigate(`/events/${id}/edit`)}>Edit event</button>
                  <button className="btn-secondary destructive" onClick={handleDeleteEvent}>
                    <Trash2 size={16} />
                    Delete event
                  </button>
                </div>
                {event.registeredUsers?.length ? (
                  <div className="participant-table">
                    <div className="participant-row participant-head">
                      <span>Name</span>
                      <span>Email</span>
                      <span>Status</span>
                      <span>Action</span>
                    </div>
                    {event.registeredUsers.map((participant) => (
                      <div key={participant.id} className="participant-row">
                        <span>{participant.name}</span>
                        <span>{participant.email}</span>
                        <span>{participant.status || 'registered'}</span>
                        <span>
                          {participant.status === 'awarded' ? (
                            <span className="badge badge-success">Awarded</span>
                          ) : (
                            <button className="btn-secondary slim" onClick={() => handleAwardCertificate(participant.id)}>Award</button>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="muted-copy">Participants will appear here after registration begins.</p>
                )}
              </Surface>

              {event.registeredUsers?.some((participant) => participant.feedback) ? (
                <Surface>
                  <SectionHeader
                    eyebrow="Volunteer voice"
                    title="Recent participant feedback"
                    description="Feedback cards offer quick qualitative insight without leaving the event details view."
                  />
                  <div className="feedback-wall">
                    {event.registeredUsers.filter((participant) => participant.feedback).map((participant) => (
                      <div key={participant.id} className="feedback-card">
                        <div className="feedback-card-top">
                          <strong>{participant.name}</strong>
                          <span>{'★'.repeat(participant.rating)}{'☆'.repeat(5 - participant.rating)}</span>
                        </div>
                        <p>{participant.feedback}</p>
                      </div>
                    ))}
                  </div>
                </Surface>
              ) : null}
            </>
          ) : null}
        </div>

        <aside className="details-sidebar">
          <Surface className="side-cta surface-glow">
            <span className="eyebrow">Ready to contribute?</span>
            <h3>Make this event part of your impact journey.</h3>
            <p>Prominent actions, capacity feedback, and status messaging are placed here for fast mobile and desktop access.</p>
            {!isRegistered ? (
              <button className="btn-primary" onClick={handleRegister} disabled={registering || event.isFull}>
                {event.isFull ? 'Event full' : 'Register now'}
              </button>
            ) : (
              <Link to="/dashboard" className="btn-secondary">Go to dashboard</Link>
            )}
          </Surface>
        </aside>
      </section>

      {showCertificate ? (
        <div className="modal-backdrop">
          <div className="certificate-modal">
            <button className="modal-close" onClick={() => setShowCertificate(false)}>Close</button>
            <div className="certificate-panel">
              <span className="eyebrow">Certificate of service</span>
              <h2>{user?.name}</h2>
              <p>For contributing to <strong>{event.title}</strong> and strengthening the local community through service.</p>
              <div className="certificate-meta">
                <div><strong>{event.organizer?.name}</strong><span>Organizer</span></div>
                <div><strong>{new Date().toLocaleDateString()}</strong><span>Date awarded</span></div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Shell>
  );
}
