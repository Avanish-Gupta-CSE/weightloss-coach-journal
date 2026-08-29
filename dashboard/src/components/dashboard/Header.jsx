import { Activity, CalendarDays, Dumbbell, TrendingDown } from 'lucide-react';
import Badge from '../common/Badge';
import { formatDayNumber, daysSince } from '../../utils/formatters';
import { useDashboard } from '../../context/DashboardContext';

export default function Header() {
  const { metrics, currentDay, currentPhase } = useDashboard();
  const daysFromStart = daysSince(metrics.baseline?.startDate || '2026-03-14');
  
  return (
    <header className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent-blue/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-accent-blue" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Protocol 200</h1>
              <p className="text-text-muted text-sm">Body Recomposition Dashboard</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="purple">{currentPhase?.name || 'Phase 2'}</Badge>
          <Badge variant="blue">{formatDayNumber(currentDay)}</Badge>
          <div className="flex items-center gap-1.5 text-text-secondary text-sm">
            <CalendarDays className="w-4 h-4" />
            <span>{daysFromStart} days in</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2 text-text-muted text-sm">
        <Dumbbell className="w-4 h-4" />
        <span>{currentPhase?.description || 'Machines + Free Weights'}</span>
        <span className="mx-2">|</span>
        <TrendingDown className="w-4 h-4" />
        <span>Target: 70 kg</span>
      </div>
    </header>
  );
}
