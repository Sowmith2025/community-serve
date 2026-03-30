import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export function Shell({ children, className = '' }) {
  return <div className={`shell ${className}`.trim()}>{children}</div>;
}

export function PageIntro({ eyebrow, title, description, actions, align = 'left' }) {
  return (
    <div className={`page-intro ${align === 'center' ? 'page-intro-center' : ''}`}>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
      {actions ? <div className="page-intro-actions">{actions}</div> : null}
    </div>
  );
}

export function Surface({ children, className = '', glow = false }) {
  return (
    <section className={`surface ${glow ? 'surface-glow' : ''} ${className}`.trim()}>
      {children}
    </section>
  );
}

export function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="section-header">
      <div>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, helper, tone = 'blue' }) {
  return (
    <Surface className={`stat-card tone-${tone}`}>
      <div className="stat-icon">{Icon ? <Icon size={20} /> : null}</div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        {helper ? <small>{helper}</small> : null}
      </div>
    </Surface>
  );
}

export function ProgressRing({ value, label, detail }) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <Surface className="progress-ring-card">
      <div
        className="progress-ring"
        style={{ background: `conic-gradient(var(--brand) ${clamped * 3.6}deg, rgba(148, 163, 184, 0.16) 0deg)` }}
      >
        <div className="progress-ring-inner">
          <strong>{clamped}%</strong>
          <span>{label}</span>
        </div>
      </div>
      {detail ? <p>{detail}</p> : null}
    </Surface>
  );
}

export function ProgressBar({ label, value, helper }) {
  return (
    <div className="progress-block">
      <div className="progress-meta">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
      {helper ? <small>{helper}</small> : null}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <Surface className="empty-state">
      <div className="empty-state-icon">
        <Sparkles size={18} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </Surface>
  );
}

export function EventCard({ event, to, cta = 'View Details' }) {
  const category = event.category || 'community';
  const fillPercent = event.maxVolunteers
    ? Math.min(100, Math.round(((event.registeredCount || 0) / event.maxVolunteers) * 100))
    : 0;

  return (
    <Link to={to} className="event-card-link">
      <Surface className="event-card">
        <div className={`event-card-cover category-${category.toLowerCase()}`}>
          <span className="badge">{category}</span>
          <div className="event-card-availability">
            <strong>{event.registeredCount || 0}</strong>
            <span>joined</span>
          </div>
        </div>
        <div className="event-card-body">
          <div className="event-card-topline">
            <span>{event.date || 'Flexible date'}</span>
            <span>{event.location || 'Community location'}</span>
          </div>
          <h3>{event.title}</h3>
          <p>{event.description}</p>
          <div className="mini-progress">
            <div className="mini-progress-track">
              <div className="mini-progress-fill" style={{ width: `${fillPercent}%` }} />
            </div>
            <small>{fillPercent}% of spots filled</small>
          </div>
          <div className="event-card-footer">
            <span>{event.organizer?.name || event.organizer || 'Community partner'}</span>
            <span className="inline-link">
              {cta}
              <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </Surface>
    </Link>
  );
}

export const Input = forwardRef(function Input(
  { label, icon: Icon, hint, className = '', ...props },
  ref,
) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className={`field-control ${className}`.trim()}>
        {Icon ? <Icon size={18} className="field-icon" /> : null}
        <input ref={ref} {...props} />
      </div>
      {hint ? <small>{hint}</small> : null}
    </label>
  );
});

export const Select = forwardRef(function Select(
  { label, icon: Icon, hint, children, className = '', ...props },
  ref,
) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className={`field-control ${className}`.trim()}>
        {Icon ? <Icon size={18} className="field-icon" /> : null}
        <select ref={ref} {...props}>
          {children}
        </select>
      </div>
      {hint ? <small>{hint}</small> : null}
    </label>
  );
});

export const Textarea = forwardRef(function Textarea(
  { label, hint, className = '', ...props },
  ref,
) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className={`field-control ${className}`.trim()}>
        <textarea ref={ref} {...props} />
      </div>
      {hint ? <small>{hint}</small> : null}
    </label>
  );
});
