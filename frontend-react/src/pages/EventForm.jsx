import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, Loader, MapPin, Sparkles, Tag, Users } from 'lucide-react';
import api from '../services/api';
import { generateEventDescription } from '../services/gemini';
import { AuthContext } from '../components/auth-context';
import { Input, PageIntro, Select, Shell, Surface, Textarea } from '../components/ui';

export default function EventForm() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxVolunteers: 20,
    category: 'general',
  });
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [aiNotes, setAiNotes] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isEditing) {
      api
        .get(`/events/${id}`)
        .then((res) => {
          const event = res.data.data;
          setFormData({
            title: event.title || '',
            description: event.description || '',
            date: event.date || '',
            time: event.time || '',
            location: event.location || '',
            maxVolunteers: event.maxVolunteers || 20,
            category: event.category || 'general',
          });
        })
        .catch(() => {
          setError('Failed to load event details.');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing, navigate, user]);

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (isEditing) {
        await api.put(`/events/${id}`, formData);
        navigate(`/events/${id}`);
      } else {
        const payload = { ...formData, organizerId: user.id };
        const res = await api.post('/events', payload);
        navigate(`/events/${res.data.event.id}`);
      }
    } catch {
      setError('Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateDescription = async () => {
    setAiLoading(true);
    setAiMessage('');
    try {
      const generated = await generateEventDescription({
        title: formData.title,
        location: formData.location,
        date: formData.date,
        category: formData.category,
        maxVolunteers: formData.maxVolunteers,
        notes: aiNotes,
      });
      setFormData((current) => ({ ...current, description: generated }));
      setAiMessage('Description generated and added to the form.');
    } catch (err) {
      setAiMessage(err.message || 'AI generation failed.');
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <Shell>
        <div className="loading-panel surface">Loading event builder...</div>
      </Shell>
    );
  }

  return (
    <Shell>
      <section className="form-layout">
        <div className="form-copy">
          <PageIntro
            eyebrow={isEditing ? 'Edit event' : 'Create event'}
            title={isEditing ? 'Refine the event experience.' : 'Launch a community event students will want to join.'}
            description="This guided flow prioritizes clarity, strong event storytelling, and future scale for richer organizer workflows."
          />
          <Surface className="guide-panel">
            <h3>Recommended event creation flow</h3>
            <div className="flow-steps">
              <div><strong>1</strong><span>Lead with a meaningful title and cause area.</span></div>
              <div><strong>2</strong><span>Describe the impact, expectations, and energy of the event.</span></div>
              <div><strong>3</strong><span>Set clear logistics so students can commit quickly.</span></div>
            </div>
          </Surface>
        </div>

        <Surface className="form-shell surface-glow">
          {error ? <div className="alert alert-error">{error}</div> : null}

          <form onSubmit={handleSubmit} className="styled-form">
            <Input
              label="Event title"
              name="title"
              placeholder="Example: Weekend Park Cleanup"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <Surface className="ai-panel">
              <div className="ai-panel-head">
                <span className="eyebrow">AI assist</span>
                <Sparkles size={18} />
              </div>
              <Textarea
                label="Brief notes for AI"
                rows="3"
                value={aiNotes}
                onChange={(event) => setAiNotes(event.target.value)}
                placeholder="Mention the community need, tone, supplies, and expected volunteer activities."
              />
              <button type="button" className="btn-secondary" onClick={handleGenerateDescription} disabled={aiLoading}>
                {aiLoading ? <Loader size={18} className="spin" /> : <Sparkles size={18} />}
                {aiLoading ? 'Generating...' : 'Generate event description'}
              </button>
              {aiMessage ? <p className="muted-copy">{aiMessage}</p> : null}
            </Surface>

            <Textarea
              label="Description"
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the cause, volunteer responsibilities, and expected impact."
              required
            />

            <div className="field-grid">
              <Input
                label="Date"
                icon={CalendarDays}
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
              <Input
                label="Time"
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>

            <Input
              label="Location"
              icon={MapPin}
              name="location"
              placeholder="Campus, community center, or public venue"
              value={formData.location}
              onChange={handleChange}
              required
            />

            <div className="field-grid">
              <Input
                label="Volunteer capacity"
                icon={Users}
                type="number"
                name="maxVolunteers"
                min="1"
                value={formData.maxVolunteers}
                onChange={handleChange}
                required
              />
              <Select
                label="Category"
                icon={Tag}
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="general">General</option>
                <option value="education">Education</option>
                <option value="environment">Environment</option>
                <option value="health">Health</option>
                <option value="community">Community</option>
              </Select>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving...' : isEditing ? 'Update event' : 'Publish event'}
              </button>
            </div>
          </form>
        </Surface>
      </section>
    </Shell>
  );
}
