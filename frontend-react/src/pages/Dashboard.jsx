import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../components/AuthContext';
import { Award, Clock, Star, Sparkles, Loader, TrendingUp, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { generateOrganizerInsights } from '../services/gemini';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  // AI Insights state (organizer only)
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState('');
  const [statsLoaded, setStatsLoaded] = useState(false);

  // Student state
  const [studentEvents, setStudentEvents] = useState([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);

  useEffect(() => {
    if (user?.role === 'organizer') {
      fetchStats();
    } else if (user?.role === 'student') {
      fetchStudentEvents();
    }
  }, [user]);

  const fetchStudentEvents = async () => {
    try {
      // Fetch fresh user data to get updated eventsAttended
      const userRes = await api.get(`/users/${user.id}`);
      const freshUser = userRes.data?.data || user;
      
      const res = await api.get('/events');
      if (res.data?.data) {
        const attendedIds = freshUser.eventsAttended || [];
        const attended = res.data.data.filter(ev => attendedIds.includes(ev.id));
        setStudentEvents(attended);
      }
      setEventsLoaded(true);
    } catch (err) {
      console.error('Failed to fetch student events', err);
      setEventsLoaded(true);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get(`/organizer/stats?organizerId=${user.id}`);
      setStats(res.data);
      setStatsLoaded(true);
    } catch (err) {
      console.error('Failed to fetch organizer stats', err);
    }
  };

  const handleGenerateInsights = async () => {
    if (!stats) return;
    setInsightsLoading(true);
    setInsightsError('');
    setInsights([]);
    try {
      const result = await generateOrganizerInsights(stats);
      setInsights(result);
    } catch (err) {
      setInsightsError(err.message || 'Failed to generate insights.');
    } finally {
      setInsightsLoading(false);
    }
  };

  if (!user) return <div className="text-center mt-4">Please log in to view dashboard.</div>;

  const isOrganizer = user.role === 'organizer';

  return (
    <div>
      <h1 className="text-4xl mb-2">Welcome back, {user.name}!</h1>
      <p className="text-muted mb-8">Role: {user.role.toUpperCase()}</p>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 mb-8 gap-6">
        <div className="glass-panel event-card flex items-center gap-4">
          <div className="p-4 rounded-full" style={{ background: 'rgba(79, 70, 229, 0.2)' }}>
            <Clock className="text-primary" size={32} />
          </div>
          <div>
            <div className="text-3xl font-bold">
              {isOrganizer ? (stats?.totalEvents ?? '—') : (user.hoursCompleted || 0)}
            </div>
            <div className="text-muted">{isOrganizer ? 'Events Created' : 'Hours Completed'}</div>
          </div>
        </div>

        <div className="glass-panel event-card flex items-center gap-4">
          <div className="p-4 rounded-full" style={{ background: 'rgba(16, 185, 129, 0.2)' }}>
            <Star className="text-secondary" size={32} />
          </div>
          <div>
            <div className="text-3xl font-bold">
              {isOrganizer ? (stats?.totalRegistrations ?? '—') : (user.eventsAttended?.length || 0)}
            </div>
            <div className="text-muted">{isOrganizer ? 'Total Registrations' : 'Events Registered'}</div>
          </div>
        </div>

        <div className="glass-panel event-card flex items-center gap-4">
          <div className="p-4 rounded-full" style={{ background: 'rgba(245, 158, 11, 0.2)' }}>
            <Award style={{ color: '#f59e0b' }} size={32} />
          </div>
          <div>
            <div className="text-3xl font-bold">
              {isOrganizer ? `${stats?.avgFillRate ?? '—'}%` : (user.hoursCompleted >= 50 ? 'Gold' : user.hoursCompleted >= 20 ? 'Silver' : 'Bronze')}
            </div>
            <div className="text-muted">{isOrganizer ? 'Avg Fill Rate' : 'Current Rank'}</div>
          </div>
        </div>
      </div>

      {/* ── AI Insights Panel (Organizer Only) ── */}
      {isOrganizer && (
        <div
          className="glass-panel mb-8"
          style={{
            padding: '1.75rem 2rem',
            background: 'linear-gradient(135deg, rgba(79,70,229,0.1), rgba(124,58,237,0.08))',
            border: '1px solid rgba(124,58,237,0.35)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background glow */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 200, height: 200,
            background: 'radial-gradient(circle, rgba(124,58,237,0.15), transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div className="flex items-center justify-between mb-4" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
            <div className="flex items-center gap-2">
              <TrendingUp size={20} style={{ color: '#a5b4fc' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', margin: 0 }}>
                AI Dashboard Insights
              </h2>
              <span style={{
                background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                color: 'white', fontSize: '0.65rem', fontWeight: 700,
                padding: '0.15rem 0.5rem', borderRadius: 999,
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>Powered by Gemini</span>
            </div>

            <button
              id="ai-insights-btn"
              onClick={handleGenerateInsights}
              disabled={insightsLoading || !statsLoaded}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                padding: '0.55rem 1.1rem', borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                color: 'white', fontWeight: 600, fontSize: '0.88rem',
                cursor: (insightsLoading || !statsLoaded) ? 'not-allowed' : 'pointer',
                opacity: (insightsLoading || !statsLoaded) ? 0.65 : 1,
                transition: 'all 0.3s ease',
                boxShadow: '0 0 14px rgba(124,58,237,0.4)',
              }}
            >
              {insightsLoading
                ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Analysing…</>
                : insights.length > 0
                  ? <><RefreshCw size={14} /> Refresh Insights</>
                  : <><Sparkles size={14} /> Generate Insights</>}
            </button>
          </div>

          {/* Insights body */}
          {insightsError && (
            <div style={{ color: '#ef4444', fontSize: '0.875rem' }}>{insightsError}</div>
          )}

          {!insightsError && insights.length === 0 && !insightsLoading && (
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              Click <strong style={{ color: '#a5b4fc' }}>Generate Insights</strong> and Gemini AI will analyse your event statistics and surface actionable recommendations.
            </p>
          )}

          {insightsLoading && (
            <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  height: 16, borderRadius: 8,
                  background: 'rgba(165,180,252,0.12)',
                  width: `${60 + i * 12}%`,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              ))}
            </div>
          )}

          {insights.length > 0 && !insightsLoading && (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {insights.map((insight, idx) => (
                <li key={idx} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(165,180,252,0.15)',
                  fontSize: '0.92rem',
                  lineHeight: 1.5,
                  animation: `fadeSlide 0.4s ease ${idx * 0.1}s both`,
                }}>
                  <span style={{
                    minWidth: 24, height: 24, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 700, color: 'white', flexShrink: 0,
                  }}>{idx + 1}</span>
                  <span style={{ color: '#e2e8f0' }}>{insight}</span>
                </li>
              ))}
            </ul>
          )}

          {statsLoaded && stats && (
            <div style={{
              marginTop: '1rem', paddingTop: '1rem',
              borderTop: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
            }}>
              {Object.entries(stats.categories || {}).map(([cat, count]) => (
                <div key={cat} style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span style={{ color: '#a5b4fc', fontWeight: 600, textTransform: 'capitalize' }}>{cat}</span>
                  {' '}&mdash; {count} event{count !== 1 ? 's' : ''}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Activity Panel ── */}
      {isOrganizer ? (
        <div className="glass-panel p-6" style={{ padding: '2rem' }}>
          <h2 className="mb-4">Organizer Activity</h2>
          <p className="text-muted">No recent activity found. Create events to see them here!</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 className="mb-6 font-bold text-2xl" style={{ color: '#a5b4fc' }}>My Participation Tracker</h2>
          
          {/* Progress Section */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm text-gray-400">Hours Goal: 50h</span>
              <span className="text-lg font-bold text-primary">{user.hoursCompleted || 0} / 50</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div 
                className="bg-primary h-4 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${Math.min(100, ((user.hoursCompleted || 0) / 50) * 100)}%`, background: 'linear-gradient(90deg, #4F46E5, #7C3AED)' }}
              ></div>
            </div>
          </div>

          <h3 className="mb-4 text-xl">My Registered Events</h3>
          {!eventsLoaded ? (
            <div className="flex justify-center my-8"><Loader className="animate-spin text-primary" /></div>
          ) : studentEvents.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {studentEvents.map((ev, idx) => (
                <li key={idx} className="p-4 rounded-lg flex justify-between items-center transition-all hover:translate-x-1" style={{ background: 'rgba(255,255,255,0.05)', borderLeft: '4px solid #4F46E5' }}>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{ev.title}</h4>
                    <p className="text-sm text-gray-400">{new Date(ev.date).toLocaleDateString()} at {ev.time} • {ev.location}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase" style={{ background: 'rgba(79, 70, 229, 0.2)', color: '#a5b4fc' }}>Registered</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted p-4 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)' }}>
              You haven't registered for any events yet. <a href="/" className="text-primary hover:underline font-bold">Browse events</a> to get started!
            </p>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .md\\:grid-cols-3 { grid-template-columns: repeat(3,1fr); }
        .font-bold { font-weight: 700; }
        .rounded-full { border-radius: 9999px; }
        .p-4 { padding: 1rem; }
        .p-6 { padding: 1.5rem; }
        .mb-2 { margin-bottom: 0.5rem; }
      `}</style>
    </div>
  );
}
