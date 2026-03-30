import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Bell,
  CalendarDays,
  Clock3,
  Loader,
  PlusCircle,
  Sparkles,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react';
import { AuthContext } from '../components/auth-context';
import api from '../services/api';
import { generateOrganizerInsights } from '../services/gemini';
import { EmptyState, EventCard, PageIntro, ProgressBar, ProgressRing, SectionHeader, Shell, StatCard, Surface } from '../components/ui';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState('');

  useEffect(() => {
    if (!user) return;

    let mounted = true;

    const loadSharedData = async () => {
      try {
        const [leaderboardRes, eventsRes] = await Promise.all([
          api.get('/users/leaderboard'),
          api.get('/events'),
        ]);

        if (!mounted) return;
        const fetchedEvents = eventsRes.data?.data || [];
        setLeaderboard(leaderboardRes.data?.data || []);
        setAllEvents(fetchedEvents);

        if (user.role === 'organizer') {
          setEvents(fetchedEvents.filter((event) => event.organizer?.id === user.id || event.organizerId === user.id));
        } else {
          const attendedIds = user.eventsAttended || [];
          const registered = fetchedEvents.filter((event) => attendedIds.includes(event.id));
          setEvents(registered);
        }
      } catch (error) {
        console.error('Dashboard data fetch failed', error);
      } finally {
        if (mounted) {
          setLoadingEvents(false);
        }
      }
    };

    const loadOrganizerStats = async () => {
      if (user.role !== 'organizer') return;
      setLoadingStats(true);
      try {
        const res = await api.get(`/organizer/stats?organizerId=${user.id}`);
        if (mounted) {
          setStats(res.data);
        }
      } catch (error) {
        console.error('Organizer stats fetch failed', error);
      } finally {
        if (mounted) {
          setLoadingStats(false);
        }
      }
    };

    loadSharedData();
    loadOrganizerStats();

    return () => {
      mounted = false;
    };
  }, [user]);

  const isOrganizer = user?.role === 'organizer';
  const hoursCompleted = user?.hoursCompleted || 0;
  const goalProgress = Math.min(100, Math.round((hoursCompleted / 50) * 100));
  const streakProgress = Math.min(100, Math.round((events.length / 8) * 100));
  const recommendedEvents = useMemo(() => {
    if (isOrganizer) {
      return [];
    }
    const attended = new Set(user?.eventsAttended || []);
    return allEvents.filter((event) => !attended.has(event.id)).slice(0, 3);
  }, [allEvents, isOrganizer, user?.eventsAttended]);

  const handleGenerateInsights = async () => {
    if (!stats) return;
    setInsightsLoading(true);
    setInsightsError('');
    try {
      const generatedInsights = await generateOrganizerInsights(stats);
      setInsights(generatedInsights);
    } catch (error) {
      setInsightsError(error.message || 'Could not generate organizer insights.');
    } finally {
      setInsightsLoading(false);
    }
  };

  if (!user) {
    return (
      <Shell>
        <EmptyState
          title="Your dashboard unlocks after sign in"
          description="Log in to see your volunteering progress, recommendations, and event insights."
          action={<Link to="/login" className="btn-primary">Sign in</Link>}
        />
      </Shell>
    );
  }

  const studentStats = [
    { icon: Clock3, label: 'Hours contributed', value: hoursCompleted, helper: 'Visible progress keeps motivation high', tone: 'blue' },
    { icon: Award, label: 'Badges earned', value: hoursCompleted >= 50 ? 6 : hoursCompleted >= 20 ? 4 : 2, helper: 'Milestones celebrate consistency', tone: 'amber' },
    { icon: Trophy, label: 'Events joined', value: events.length, helper: 'Repeat participation builds streaks', tone: 'green' },
  ];

  const organizerStats = [
    { icon: CalendarDays, label: 'Events created', value: stats?.totalEvents ?? '0', helper: 'Track your program cadence', tone: 'blue' },
    { icon: Users, label: 'Registrations', value: stats?.totalRegistrations ?? '0', helper: 'Monitor demand and reach', tone: 'green' },
    { icon: TrendingUp, label: 'Average fill rate', value: `${stats?.avgFillRate ?? 0}%`, helper: 'Spot momentum at a glance', tone: 'amber' },
  ];

  return (
    <Shell>
      <PageIntro
        eyebrow={isOrganizer ? 'Organizer dashboard' : 'Student dashboard'}
        title={`Welcome back, ${user.name}.`}
        description={
          isOrganizer
            ? 'Create opportunities, monitor signups, and keep your volunteer community energized with a guided control center.'
            : 'See upcoming commitments, your service streak, and the next best events to keep your impact growing.'
        }
        actions={
          isOrganizer ? (
            <Link to="/events/new" className="btn-primary">
              <PlusCircle size={18} />
              Create event
            </Link>
          ) : (
            <Link to="/events" className="btn-primary">
              Explore events
            </Link>
          )
        }
      />

      <section className="stats-grid">
        {(isOrganizer ? organizerStats : studentStats).map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="dashboard-main">
        <div className="dashboard-primary">
          {!isOrganizer ? (
            <>
              <Surface className="welcome-banner surface-glow">
                <div>
                  <span className="eyebrow">Personalized momentum</span>
                  <h2>You are {50 - Math.min(50, hoursCompleted)} hours away from the 50-hour impact milestone.</h2>
                  <p>Keep your streak alive with recommended events and visible progress toward your next badge tier.</p>
                </div>
                <div className="welcome-actions">
                  <Link to="/profile" className="btn-secondary">View profile</Link>
                  <Link to="/events" className="btn-primary">Join another cause</Link>
                </div>
              </Surface>

              <div className="progress-layout">
                <ProgressRing value={goalProgress} label="Goal progress" detail="Annual volunteering target: 50 hours" />
                <Surface className="progress-panel">
                  <SectionHeader
                    eyebrow="Activity tracker"
                    title="Keep your impact visible"
                    description="Progress cues, streaks, and badges make volunteering feel rewarding and repeatable."
                  />
                  <div className="progress-stack">
                    <ProgressBar label="Volunteer hours" value={goalProgress} helper={`${hoursCompleted} of 50 hours completed`} />
                    <ProgressBar label="Participation streak" value={streakProgress} helper={`${events.length} events completed this cycle`} />
                    <ProgressBar label="Leadership readiness" value={Math.min(100, hoursCompleted * 2)} helper="Earn more hours to unlock mentor badges" />
                  </div>
                </Surface>
              </div>

              <Surface>
                <SectionHeader
                  eyebrow="Recommended next"
                  title="Upcoming opportunities chosen to keep you engaged"
                  description="Recommendations can later be tuned by preferences, skills, and past event history."
                />
                {recommendedEvents.length ? (
                  <div className="event-grid compact-grid">
                    {recommendedEvents.map((event) => (
                      <EventCard key={event.id} event={event} to={`/events/${event.id}`} cta="See event" />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No recommendations yet"
                    description="Once you join more events, this space can surface more tailored volunteering opportunities."
                    action={<Link to="/events" className="btn-secondary">Browse all events</Link>}
                  />
                )}
              </Surface>
            </>
          ) : (
            <>
              <Surface className="analytics-hero surface-glow">
                <SectionHeader
                  eyebrow="Organizer workflow"
                  title="A guided creation and monitoring experience for every community event."
                  description="This dashboard is structured around the core organizer loop: create, fill, confirm attendance, and learn from outcomes."
                  action={<Link to="/events/new" className="btn-primary">New event</Link>}
                />
                <div className="analytics-cards">
                  <div className="analytics-mini-card">
                    <strong>{stats?.categories?.education ?? 0}</strong>
                    <span>Education events</span>
                  </div>
                  <div className="analytics-mini-card">
                    <strong>{stats?.categories?.environment ?? 0}</strong>
                    <span>Environment events</span>
                  </div>
                  <div className="analytics-mini-card">
                    <strong>{stats?.categories?.health ?? 0}</strong>
                    <span>Health events</span>
                  </div>
                </div>
              </Surface>

              <div className="organizer-workbench">
                <Surface>
                  <SectionHeader
                    eyebrow="Event creation flow"
                    title="A clean, guided setup that lowers organizer workload"
                    description="The event form now supports better field hierarchy, AI-assisted copy, and room for future steps like venue confirmation and team assignment."
                  />
                  <div className="flow-steps">
                    <div><strong>1</strong><span>Define the cause, date, and format.</span></div>
                    <div><strong>2</strong><span>Add a clear description and volunteer capacity.</span></div>
                    <div><strong>3</strong><span>Publish and track registrations from one place.</span></div>
                  </div>
                </Surface>

                <Surface>
                  <SectionHeader
                    eyebrow="Notifications"
                    title="What needs attention"
                    description="This panel is styled for future live alerts such as waitlist pressure, attendance drops, and volunteer messages."
                  />
                  <div className="notification-stack">
                    <div className="notification-item"><Bell size={16} /><span>2 events are nearing full capacity.</span></div>
                    <div className="notification-item"><Bell size={16} /><span>One recurring volunteer has not checked in this week.</span></div>
                    <div className="notification-item"><Bell size={16} /><span>Post-event feedback is available for your latest drive.</span></div>
                  </div>
                </Surface>
              </div>

              <Surface>
                <SectionHeader
                  eyebrow="AI guidance"
                  title="Turn event data into practical next steps"
                  description="Insights are designed to highlight demand patterns, retention opportunities, and event mix recommendations."
                  action={
                    <button className="btn-primary" onClick={handleGenerateInsights} disabled={insightsLoading || !stats}>
                      {insightsLoading ? <Loader size={18} className="spin" /> : <Sparkles size={18} />}
                      {insightsLoading ? 'Generating...' : 'Generate insights'}
                    </button>
                  }
                />
                {insightsError ? <p className="error-text">{insightsError}</p> : null}
                {loadingStats ? (
                  <div className="loading-panel">Loading analytics...</div>
                ) : insights.length ? (
                  <div className="insight-grid">
                    {insights.map((item, index) => (
                      <div key={item} className="insight-card">
                        <strong>0{index + 1}</strong>
                        <p>{item}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="muted-copy">Generate insights to populate this analytics guidance panel.</p>
                )}
              </Surface>
            </>
          )}
        </div>

        <aside className="dashboard-sidebar">
          <Surface>
            <SectionHeader
              eyebrow={isOrganizer ? 'Participants' : 'My schedule'}
              title={isOrganizer ? 'Manage active events' : 'Upcoming and completed events'}
              description={isOrganizer ? 'Use this list as the control point for participants, attendance, and event edits.' : 'Quick access to your registered activities and certificates.'}
            />
            {loadingEvents ? (
              <div className="loading-panel">Loading dashboard events...</div>
            ) : events.length ? (
              <div className="stack-list">
                {events.slice(0, 4).map((event) => (
                  <Link key={event.id} to={`/events/${event.id}`} className="stack-item">
                    <div>
                      <strong>{event.title}</strong>
                      <span>{event.date} • {event.location}</span>
                    </div>
                    <span>{isOrganizer ? `${event.registeredCount || 0} joined` : 'View'}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                title={isOrganizer ? 'No events created yet' : 'No events joined yet'}
                description={isOrganizer ? 'Create your first event to begin building participation momentum.' : 'Your registered volunteering activities will appear here.'}
                action={<Link to={isOrganizer ? '/events/new' : '/events'} className="btn-secondary">{isOrganizer ? 'Create event' : 'Explore events'}</Link>}
              />
            )}
          </Surface>

          <Surface>
            <SectionHeader
              eyebrow="Leaderboard"
              title="Top volunteers"
              description="Healthy social proof can encourage repeat engagement without turning service into a competition."
            />
            <div className="leaderboard-list">
              {leaderboard.length ? (
                leaderboard.slice(0, 5).map((student, index) => (
                  <div key={student.id || student.name} className="leaderboard-item">
                    <div className="leaderboard-rank">{index + 1}</div>
                    <div>
                      <strong>{student.name}</strong>
                      <span>{student.department || 'Student volunteer'}</span>
                    </div>
                    <div className="leaderboard-hours">{student.hoursCompleted || 0}h</div>
                  </div>
                ))
              ) : (
                <p className="muted-copy">Leaderboard data will appear here once hours are recorded.</p>
              )}
            </div>
          </Surface>
        </aside>
      </section>
    </Shell>
  );
}
