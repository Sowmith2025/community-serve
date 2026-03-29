import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    api.get('/events').then((res) => {
      setEvents(res.data.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="text-center mb-8" style={{ padding: '4rem 0' }}>
        <h1 className="text-4xl" style={{ marginBottom: '1rem' }}>Make a Difference <span className="text-primary">Today</span></h1>
        <p className="text-muted text-xl" style={{ maxWidth: 600, margin: '0 auto' }}>Join thousands of students volunteering for meaningful community service events.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2>Upcoming Events</h2>
        
        <div className="flex gap-4 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search events..." 
            className="form-input flex-1 md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="form-input w-auto bg-gray-800"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="education">Education</option>
            <option value="environment">Environment</option>
            <option value="health">Health</option>
            <option value="general">General</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-muted">Loading events...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events
            .filter(evt => (categoryFilter === 'all' || evt.category === categoryFilter))
            .filter(evt => evt.title?.toLowerCase().includes(searchTerm.toLowerCase()) || evt.location?.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((evt) => (
            <div key={evt.id} className="glass-panel event-card flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <span className="badge">{evt.category}</span>
                <span className="text-sm text-muted">{evt.registeredCount}/{evt.maxVolunteers} filled</span>
              </div>
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>{evt.title}</h3>
              <p className="text-muted text-sm mb-4" style={{ flex: 1 }}>{evt.description.substring(0, 100)}...</p>
              
              <div className="text-sm text-muted mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} /> {evt.date} at {evt.time}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} /> {evt.location}
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} /> By {evt.organizer}
                </div>
              </div>

              <Link to={`/events/${evt.id}`} className="btn-secondary text-center w-full" style={{ marginTop: 'auto' }}>
                View Details <ArrowRight size={16} style={{ display: 'inline', marginLeft: 8 }}/>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
