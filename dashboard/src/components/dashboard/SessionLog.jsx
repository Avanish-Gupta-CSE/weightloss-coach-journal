import Card from '../common/Card';
import Badge from '../common/Badge';
import { Dumbbell, ChevronRight } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function SessionLog() {
  const { sessions } = useDashboard();
  const recentSessions = [...sessions].reverse().slice(0, 5);
  
  const getSessionColor = (type) => {
    const colors = {
      'Upper Body': 'blue',
      'Lower Body': 'green',
      'Full Body': 'purple',
    };
    return colors[type] || 'gray';
  };
  
  return (
    <Card title="Recent Sessions" icon={Dumbbell} className="mb-6">
      <div className="space-y-3">
        {recentSessions.map((session) => (
          <div key={session.sessionNumber}
            className="group flex items-start gap-3 p-3 rounded-lg bg-bg-tertiary/20 hover:bg-bg-tertiary/40 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-lg bg-bg-tertiary/50 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-text-primary">{session.sessionNumber}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={getSessionColor(session.type)}>{session.type}</Badge>
                <span className="text-text-muted text-xs">Day {session.day}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {session.exercises?.slice(0, 4).map((ex, i) => (
                  <span key={i} className="text-xs text-text-secondary bg-bg-tertiary/50 px-2 py-0.5 rounded">{ex.name}</span>
                ))}
                {session.exercises?.length > 4 && (
                  <span className="text-xs text-text-muted">+{session.exercises.length - 4} more</span>
                )}
              </div>
              {session.notes && <p className="text-text-muted text-xs mt-1.5 line-clamp-1">{session.notes}</p>}
            </div>
            <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-2" />
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-bg-tertiary/50 text-center">
        <span className="text-text-muted text-sm">{sessions.length} total sessions</span>
      </div>
    </Card>
  );
}
