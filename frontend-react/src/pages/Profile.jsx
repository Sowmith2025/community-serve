import { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Award, Clock3, Settings, UserRound } from 'lucide-react';
import { AuthContext } from '../components/auth-context';
import { EmptyState, PageIntro, ProgressBar, SectionHeader, Shell, Surface, StatCard } from '../components/ui';

export default function Profile() {
  const { user } = useContext(AuthContext);

  const badges = useMemo(() => {
    if (!user) return [];
    const earned = [];
    if ((user.hoursCompleted || 0) >= 10) earned.push('Community Starter');
    if ((user.hoursCompleted || 0) >= 25) earned.push('Impact Builder');
    if ((user.hoursCompleted || 0) >= 50) earned.push('Service Champion');
    if ((user.eventsAttended?.length || 0) >= 5) earned.push('Consistency Streak');
    return earned.length ? earned : ['First Step'];
  }, [user]);

  if (!user) {
    return (
      <Shell>
        <EmptyState
          title="Profile details appear after sign in"
          description="Sign in to see achievements, contribution history, and editable volunteering preferences."
          action={<Link to="/login" className="btn-primary">Sign in</Link>}
        />
      </Shell>
    );
  }

  return (
    <Shell>
      <PageIntro
        eyebrow="Profile"
        title={`${user.name}'s impact profile`}
        description="A contribution-centered profile that highlights volunteering history, earned recognition, and future preference controls."
      />

      <section className="profile-layout">
        <Surface className="profile-card surface-glow">
          <div className="profile-header">
            <div className="profile-avatar">
              <UserRound size={36} />
            </div>
            <div>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
              <span className="badge">{user.role}</span>
            </div>
          </div>
          <div className="stats-grid compact-stats">
            <StatCard icon={Clock3} label="Hours completed" value={user.hoursCompleted || 0} helper="Logged service hours" tone="blue" />
            <StatCard icon={Award} label="Achievements" value={badges.length} helper="Badges unlocked" tone="amber" />
          </div>
        </Surface>

        <div className="profile-stack">
          <Surface>
            <SectionHeader
              eyebrow="Contribution history"
              title="Impact summary"
              description="This section is ready for a richer timeline, verification records, and certificates."
            />
            <div className="progress-stack">
              <ProgressBar label="Annual hour goal" value={Math.min(100, Math.round(((user.hoursCompleted || 0) / 50) * 100))} helper={`${user.hoursCompleted || 0} of 50 hours`} />
              <ProgressBar label="Participation consistency" value={Math.min(100, (user.eventsAttended?.length || 0) * 20)} helper={`${user.eventsAttended?.length || 0} recorded events`} />
            </div>
          </Surface>

          <Surface>
            <SectionHeader
              eyebrow="Achievements"
              title="Badges and milestones"
              description="Gamification elements reinforce progress and make recognition visible."
            />
            <div className="badge-cloud">
              {badges.map((badge) => (
                <span key={badge} className="badge-pill">{badge}</span>
              ))}
            </div>
          </Surface>

          <Surface>
            <SectionHeader
              eyebrow="Preferences"
              title="Editable interests and communication settings"
              description="This panel demonstrates where future preference editing, category subscriptions, and notification controls can live."
              action={<button className="btn-secondary"><Settings size={16} /> Edit preferences</button>}
            />
            <div className="preference-grid">
              <div><strong>Causes</strong><span>Education, environment, health</span></div>
              <div><strong>Availability</strong><span>Weekends and evenings</span></div>
              <div><strong>Notifications</strong><span>Email and in-app reminders</span></div>
              <div><strong>Location radius</strong><span>Within 10 km of campus</span></div>
            </div>
          </Surface>
        </div>
      </section>
    </Shell>
  );
}
