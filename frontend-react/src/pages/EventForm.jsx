import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
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

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (isEditing) {
            api.get(`/events/${id}`).then(res => {
                const evt = res.data.data;
                if (evt.organizer?.id !== user.id && user.role !== 'admin') {
                    // You could restrict to only the organizer editing, but for now we just verify they are logged in or allow
                }
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

    if (loading) return <div className="text-center text-muted mt-4">Loading...</div>;

    return (
        <div className="flex justify-center" style={{ minHeight: '70vh' }}>
            <div className="glass-panel w-full" style={{ maxWidth: 600, padding: '3rem 2rem' }}>
                <h2 className="text-4xl mb-6 text-center">{isEditing ? 'Edit Event' : 'Create New Event'}</h2>

                {error && <div style={{ color: '#ef4444', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} className="grid grid-cols-1">
                    <div className="form-group">
                        <label className="input-label">Event Title</label>
                        <input name="title" className="input-field" value={formData.title} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label className="input-label">Description</label>
                        <textarea name="description" className="input-field" rows="4" value={formData.description} onChange={handleChange} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="input-label">Date</label>
                            <input type="date" name="date" className="input-field" value={formData.date} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label className="input-label">Time</label>
                            <input type="time" name="time" className="input-field" value={formData.time} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="input-label">Location</label>
                        <input name="location" className="input-field" value={formData.location} onChange={handleChange} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="input-label">Max Volunteers</label>
                            <input type="number" name="maxVolunteers" className="input-field" value={formData.maxVolunteers} onChange={handleChange} min="1" required />
                        </div>
                        <div className="form-group">
                            <label className="input-label">Category</label>
                            <select name="category" className="input-field" value={formData.category} onChange={handleChange}>
                                <option value="general">General</option>
                                <option value="education">Education</option>
                                <option value="environment">Environment</option>
                                <option value="health">Health</option>
                                <option value="community">Community</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-4">
                        <button type="button" className="btn-secondary w-full justify-center" onClick={() => navigate(-1)}>Cancel</button>
                        <button type="submit" className="btn-primary w-full justify-center text-xl" disabled={saving}>
                            {saving ? 'Saving...' : (isEditing ? 'Update Event' : 'Create Event')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
