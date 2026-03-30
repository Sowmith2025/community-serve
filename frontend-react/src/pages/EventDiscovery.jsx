import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Filter, MapPin, Search } from 'lucide-react';
import api from '../services/api';
import { EmptyState, EventCard, Input, PageIntro, SectionHeader, Select, Shell } from '../components/ui';

const fallbackEvents = [
  {
    id: 'sample-1',
    title: 'Riverside Cleanup Sprint',
    description: 'Join students and local partners for a high-energy cleanup focused on restoring a neighborhood waterfront.',
    date: 'Apr 12',
    location: 'Riverfront Park',
    category: 'environment',
    registeredCount: 18,
    maxVolunteers: 30,
    organizer: 'Green Future Club',
  },
  {
    id: 'sample-2',
    title: 'Weekend Reading Buddies',
    description: 'Support elementary students with guided reading, conversation practice, and confidence-building activities.',
    date: 'Apr 16',
    location: 'Brighton Public Library',
    category: 'education',
    registeredCount: 24,
    maxVolunteers: 28,
    organizer: 'Literacy Forward',
  },
  {
    id: 'sample-3',
    title: 'Community Wellness Fair',
    description: 'Help run check-in, wayfinding, and family activity zones for a health outreach event.',
    date: 'Apr 20',
    location: 'East Hall Plaza',
    category: 'health',
    registeredCount: 41,
    maxVolunteers: 60,
    organizer: 'Care Collective',
  },
];

export default function EventDiscovery() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  useEffect(() => {
    let mounted = true;

    api
      .get('/events')
      .then((res) => {
        if (!mounted) return;
        setEvents(res.data?.data?.length ? res.data.data : fallbackEvents);
      })
      .catch(() => {
        if (!mounted) return;
        setEvents(fallbackEvents);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const locations = useMemo(() => {
    const items = [...new Set(events.map((event) => event.location).filter(Boolean))];
    return ['all', ...items];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        event.title?.toLowerCase().includes(term) ||
        event.description?.toLowerCase().includes(term) ||
        event.location?.toLowerCase().includes(term);
      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
      const matchesLocation = locationFilter === 'all' || event.location === locationFilter;
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }, [events, searchTerm, categoryFilter, locationFilter]);

  return (
    <Shell>
      <PageIntro
        eyebrow="Discover opportunities"
        title="Find the right event for your schedule, interests, and impact goals."
        description="A fast, card-based discovery flow with clear filters, social proof, and previews that help students commit with confidence."
        actions={
          <>
            <Link to="/register" className="btn-primary">
              Join the community
            </Link>
            <Link to="/dashboard" className="btn-secondary">
              View my progress
            </Link>
          </>
        }
      />

      <section className="discovery-toolbar surface">
        <SectionHeader
          eyebrow="Event browser"
          title="Explore upcoming service opportunities"
          description="Search by cause area, date, and place to quickly find a volunteer experience that feels relevant."
        />
        <div className="filter-grid">
          <Input
            label="Search"
            icon={Search}
            placeholder="Try tutoring, cleanup, health fair..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <Select
            label="Category"
            icon={Filter}
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">All categories</option>
            <option value="education">Education</option>
            <option value="environment">Environment</option>
            <option value="health">Health</option>
            <option value="community">Community</option>
            <option value="general">General</option>
          </Select>
          <Select
            label="Location"
            icon={MapPin}
            value={locationFilter}
            onChange={(event) => setLocationFilter(event.target.value)}
          >
            {locations.map((location) => (
              <option key={location} value={location}>
                {location === 'all' ? 'All locations' : location}
              </option>
            ))}
          </Select>
          <div className="surface compact-insight">
            <CalendarDays size={18} />
            <div>
              <strong>{filteredEvents.length}</strong>
              <span>events match your filters</span>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="loading-panel surface">Loading event opportunities...</div>
      ) : filteredEvents.length ? (
        <section className="event-grid">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} to={`/events/${event.id}`} />
          ))}
        </section>
      ) : (
        <EmptyState
          title="No events match those filters yet"
          description="Try widening your search or switching to another category to uncover more service opportunities."
          action={<button className="btn-secondary" onClick={() => { setSearchTerm(''); setCategoryFilter('all'); setLocationFilter('all'); }}>Reset filters</button>}
        />
      )}
    </Shell>
  );
}
