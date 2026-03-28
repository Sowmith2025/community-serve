import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sparkles, Loader } from 'lucide-react';
import api from '../services/api';
import { generateEventDescription } from '../services/gemini';
import { AuthContext } from '../components/AuthContext';

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
        category: 'general'
    });
    const [loading, setLoading] = useState(isEditing);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    // AI-specific state
    const [aiNotes, setAiNotes] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');
    const [aiSuccess, setAiSuccess] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (isEditing) {
            api.get(`/events/${id}`).then(res => {
                const evt = res.data.data;
                setFormData({
                    title: evt.title || '',
                    description: evt.description || '',
                    date: evt.date || '',
                    time: evt.time || '',
                    location: evt.location || '',
                    maxVolunteers: evt.maxVolunteers || 20,
                    category: evt.category || 'general'
                });
                setLoading(false);
            }).catch(err => {
                console.error(err);
                setError('Failed to load event details.');
                setLoading(false);
            });
        }
    }, [id, user, isEditing, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
        } catch (err) {
            console.error(err);
            setError('Failed to save event.');
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateDescription = async () => {
        setAiLoading(true);
        setAiError('');
        setAiSuccess(false);
        try {
            const generated = await generateEventDescription({
                title: formData.title,
                location: formData.location,
                date: formData.date,
                category: formData.category,
                maxVolunteers: formData.maxVolunteers,
                notes: aiNotes,
            });
            setFormData(prev => ({ ...prev, description: generated }));
            setAiSuccess(true);
            setTimeout(() => setAiSuccess(false), 3000);
        } catch (err) {
            setAiError(err.message || 'AI generation failed. Check your API key.');
        } finally {
            setAiLoading(false);
        }
    };

    if (loading) return <div className="text-center text-muted mt-4">Loading...</div>;

    return (
        <div className="flex justify-center" style={{ minHeight: '70vh' }}>
            <div className="glass-panel w-full" style={{ maxWidth: 620, padding: '3rem 2rem' }}>
                <h2 className="text-4xl mb-6 text-center">{isEditing ? 'Edit Event' : 'Create New Event'}</h2>

                {error && <div style={{ color: '#ef4444', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="grid grid-cols-1">
                    <div className="form-group">
                        <label className="input-label">Event Title</label>
                        <input id="event-title" name="title" className="input-field" value={formData.title} onChange={handleChange} required />
                    </div>

                    {/* ── AI Description Generator ── */}
                    <div className="form-group" style={{ borderRadius: 12, padding: '1rem 1.25rem', background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.3)', marginBottom: '1rem' }}>
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={16} style={{ color: '#a5b4fc' }} />
                            <span style={{ color: '#a5b4fc', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                AI Description Generator
                            </span>
                        </div>
                        <label className="input-label">Brief notes for AI (optional)</label>
                        <textarea
                            id="ai-notes"
                            className="input-field"
                            rows="2"
                            placeholder="e.g. beach cleanup, need gloves, family-friendly, 3 hours..."
                            value={aiNotes}
                            onChange={e => setAiNotes(e.target.value)}
                            style={{ marginBottom: '0.75rem', resize: 'vertical' }}
                        />
                        <button
                            id="ai-generate-btn"
                            type="button"
                            onClick={handleGenerateDescription}
                            disabled={aiLoading}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.55rem 1.2rem', borderRadius: 8, border: 'none',
                                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                                color: 'white', fontWeight: 600, fontSize: '0.9rem',
                                cursor: aiLoading ? 'not-allowed' : 'pointer',
                                opacity: aiLoading ? 0.7 : 1,
                                transition: 'all 0.3s ease',
                                boxShadow: '0 0 12px rgba(124,58,237,0.35)',
                            }}
                        >
                            {aiLoading
                                ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
                                : <><Sparkles size={14} /> Generate with AI</>}
                        </button>
                        {aiSuccess && (
                            <span style={{ marginLeft: '0.75rem', color: '#10B981', fontSize: '0.85rem', fontWeight: 500 }}>
                                ✓ Description filled in!
                            </span>
                        )}
                        {aiError && (
                            <div style={{ color: '#ef4444', fontSize: '0.82rem', marginTop: '0.5rem' }}>{aiError}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="input-label">Description</label>
                        <textarea id="event-description" name="description" className="input-field" rows="4" value={formData.description} onChange={handleChange} required style={{ resize: 'vertical' }} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="input-label">Date</label>
                            <input type="date" id="event-date" name="date" className="input-field" value={formData.date} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="input-label">Time</label>
                            <input type="time" id="event-time" name="time" className="input-field" value={formData.time} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="input-label">Location</label>
                        <input id="event-location" name="location" className="input-field" value={formData.location} onChange={handleChange} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="input-label">Max Volunteers</label>
                            <input type="number" id="event-max-volunteers" name="maxVolunteers" className="input-field" value={formData.maxVolunteers} onChange={handleChange} min="1" required />
                        </div>
                        <div className="form-group">
                            <label className="input-label">Category</label>
                            <select id="event-category" name="category" className="input-field" value={formData.category} onChange={handleChange}>
                                <option value="general">General</option>
                                <option value="education">Education</option>
                                <option value="environment">Environment</option>
                                <option value="health">Health</option>
                                <option value="community">Community</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-4">
                        <button type="button" id="cancel-btn" className="btn-secondary w-full justify-center" onClick={() => navigate(-1)}>Cancel</button>
                        <button type="submit" id="submit-event-btn" className="btn-primary w-full justify-center text-xl" disabled={saving}>
                            {saving ? 'Saving...' : (isEditing ? 'Update Event' : 'Create Event')}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
