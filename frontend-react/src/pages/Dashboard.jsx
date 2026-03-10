import { useContext } from 'react';
import { AuthContext } from '../components/AuthContext';
import { Award, Clock, Star } from 'lucide-react';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  if (!user) return <div className="text-center mt-4">Please log in to view dashboard.</div>;

  return (
    <div>
      <h1 className="text-4xl mb-2">Welcome back, {user.name}!</h1>
      <p className="text-muted mb-8">Role: {user.role.toUpperCase()}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 mb-8">
        <div className="glass-panel event-card flex items-center gap-4">
          <div className="p-4 rounded-full" style={{ background: 'rgba(79, 70, 229, 0.2)'}}>
            <Clock className="text-primary" size={32} />
          </div>
          <div>
            <div className="text-3xl font-bold">{user.hoursCompleted || 0}</div>
            <div className="text-muted">Hours Completed</div>
          </div>
        </div>
        
        <div className="glass-panel event-card flex items-center gap-4">
          <div className="p-4 rounded-full" style={{ background: 'rgba(16, 185, 129, 0.2)'}}>
            <Star className="text-secondary" size={32} />
          </div>
          <div>
            <div className="text-3xl font-bold">{user.eventsAttended?.length || 0}</div>
            <div className="text-muted">Events Attended</div>
          </div>
        </div>

        <div className="glass-panel event-card flex items-center gap-4">
          <div className="p-4 rounded-full" style={{ background: 'rgba(245, 158, 11, 0.2)'}}>
            <Award style={{ color: '#f59e0b'}} size={32} />
          </div>
          <div>
            <div className="text-3xl font-bold">Newbie</div>
            <div className="text-muted">Current Rank</div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6" style={{ padding: '2rem' }}>
         <h2 className="mb-4">My Activity</h2>
         <p className="text-muted">No recent activity found. Browse events and register to get started!</p>
      </div>
    </div>
  );
}
