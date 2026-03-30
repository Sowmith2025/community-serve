import { Link } from 'react-router-dom';
import { ArrowRight, Award, Calendar, HeartHandshake, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { PageIntro, SectionHeader, Shell, StatCard, Surface } from '../components/ui';

const impactStats = [
  { icon: HeartHandshake, label: 'Volunteer hours logged', value: '14,200+', helper: 'Fueling measurable local impact', tone: 'green' },
  { icon: Users, label: 'Students engaged', value: '3,480', helper: 'Across campuses and communities', tone: 'blue' },
  { icon: Calendar, label: 'Events hosted', value: '620', helper: 'From cleanups to tutoring drives', tone: 'amber' },
];

const testimonials = [
  {
    quote: 'Community Serve made volunteering feel as easy as signing up for a campus event, but far more meaningful.',
    name: 'Asha Raman',
    role: 'Student Volunteer',
  },
  {
    quote: 'Our team can finally track registrations, attendance, and follow-up in one clean workflow.',
    name: 'Daniel Joseph',
    role: 'Community Organizer',
  },
  {
    quote: 'The badges and streaks pushed me to keep showing up. It turned service into a habit I am proud of.',
    name: 'Mia Carter',
    role: 'Campus Ambassador',
  },
];

const productHighlights = [
  {
    icon: Sparkles,
    title: 'Guided onboarding',
    description: 'Role-specific journeys help students discover opportunities and organizers launch events with less friction.',
  },
  {
    icon: Award,
    title: 'Gamified progress',
    description: 'Badges, streaks, leaderboards, and celebration moments make impact visible and rewarding.',
  },
  {
    icon: ShieldCheck,
    title: 'Built for trust',
    description: 'Accessible interactions, clear status feedback, and structured event data keep the experience dependable.',
  },
];

export default function Home() {
  return (
    <Shell>
      <section className="hero-grid">
        <div className="hero-copy">
          <PageIntro
            eyebrow="Community-first volunteering"
            title="Help students turn good intentions into consistent community action."
            description="Community Serve connects students and organizers through a joyful, low-friction volunteering experience with progress tracking, social proof, and guided event management."
            actions={
              <>
                <Link to="/register" className="btn-primary">
                  Join a Cause
                </Link>
                <Link to="/events" className="btn-secondary">
                  Explore Events
                </Link>
              </>
            }
          />
          <div className="hero-pills" aria-label="Core product outcomes">
            <span>Personalized recommendations</span>
            <span>Role-based dashboards</span>
            <span>Accessible, mobile-first design</span>
          </div>
        </div>

        <div className="hero-showcase surface surface-glow">
          <div className="showcase-panel">
            <div className="showcase-card">
              <span className="eyebrow">Student momentum</span>
              <h3>Build your volunteering streak</h3>
              <p>See recommended events, hours contributed, and badge progress in one motivating dashboard.</p>
              <div className="showcase-meter">
                <div className="showcase-meter-fill" style={{ width: '76%' }} />
              </div>
              <small>76% toward Spring Impact Goal</small>
            </div>
            <div className="showcase-card showcase-card-alt">
              <span className="eyebrow">Organizer clarity</span>
              <h3>Launch events with confidence</h3>
              <p>Create new opportunities, monitor participation, and act on engagement insights in real time.</p>
              <ul className="showcase-list">
                <li>132 registrations this month</li>
                <li>92% average attendance rate</li>
                <li>18 high-intent returning volunteers</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        {impactStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="feature-section">
        <SectionHeader
          eyebrow="Why it works"
          title="A product experience designed to increase participation, retention, and organizer confidence."
          description="Every touchpoint is built to reduce friction, make impact tangible, and keep users moving toward the next meaningful action."
        />
        <div className="feature-grid">
          {productHighlights.map((item) => (
            <Surface key={item.title} className="feature-card">
              <div className="feature-icon">
                <item.icon size={20} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </Surface>
          ))}
        </div>
      </section>

      <section className="story-layout">
        <Surface className="story-card story-card-large">
          <SectionHeader
            eyebrow="Student journey"
            title="From discovery to recognition in a few clear steps."
            description="Students can browse opportunities, register quickly, track hours, and celebrate progress through a rewarding feedback loop."
          />
          <div className="journey-steps">
            <div>
              <strong>01</strong>
              <span>Explore events with smart filters and visual previews.</span>
            </div>
            <div>
              <strong>02</strong>
              <span>Register in seconds and receive immediate confirmation.</span>
            </div>
            <div>
              <strong>03</strong>
              <span>Track contributions, badges, and streaks in a motivating dashboard.</span>
            </div>
          </div>
        </Surface>

        <Surface className="story-card">
          <SectionHeader
            eyebrow="Organizer journey"
            title="Guided event creation with analytics that matter."
            description="Organizers get a simplified creation flow, participant management, and a live pulse on engagement."
          />
          <Link to="/events/new" className="inline-link strong-link">
            Create your next event
            <ArrowRight size={16} />
          </Link>
        </Surface>
      </section>

      <section className="testimonial-section">
        <SectionHeader
          eyebrow="Success stories"
          title="People should leave feeling impactful, connected, and eager to come back."
          description="The UI leans into trust, momentum, and positive reinforcement so volunteering feels energizing instead of administrative."
        />
        <div className="testimonial-grid">
          {testimonials.map((item) => (
            <Surface key={item.name} className="testimonial-card">
              <p>"{item.quote}"</p>
              <div>
                <strong>{item.name}</strong>
                <span>{item.role}</span>
              </div>
            </Surface>
          ))}
        </div>
      </section>
    </Shell>
  );
}
