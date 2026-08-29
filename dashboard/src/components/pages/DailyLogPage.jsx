import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { useDashboard } from '../../context/DashboardContext';
import { formatShortDate } from '../../utils/formatters';
import { getProteinColor } from '../../utils/calculations';

const filters = [
  { key: 'all', label: 'All' },
  { key: 'workout', label: 'Workout' },
  { key: 'rest', label: 'Rest' },
  { key: 'protein-hit', label: 'Protein Hit' },
  { key: 'protein-miss', label: 'Protein Miss' },
];

export default function DailyLogPage() {
  const { daily } = useDashboard();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredDays = useMemo(() => {
    let result = [...daily].reverse();
    
    if (activeFilter === 'workout') result = result.filter(d => d.workout);
    else if (activeFilter === 'rest') result = result.filter(d => !d.workout);
    else if (activeFilter === 'protein-hit') result = result.filter(d => (d.protein || 0) >= 150);
    else if (activeFilter === 'protein-miss') result = result.filter(d => (d.protein || 0) < 120);
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(d => 
        (d.notes || '').toLowerCase().includes(q) ||
        (d.dayType || '').toLowerCase().includes(q) ||
        Object.values(d.meals || {}).some(m => m.toLowerCase().includes(q))
      );
    }
    
    return result;
  }, [daily, activeFilter, searchQuery]);
  
  return (
    <div className="space-y-6">
      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search days..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary border border-bg-tertiary/50 rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeFilter === f.key
                  ? 'bg-accent-blue/10 text-accent-blue'
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Day Cards */}
      <div className="space-y-3">
        {filteredDays.map(day => (
          <DayCard key={day.day} day={day} />
        ))}
      </div>
      
      {filteredDays.length === 0 && (
        <div className="text-center py-12 text-text-muted">
          <p>No days match your filters.</p>
        </div>
      )}
    </div>
  );
}

function DayCard({ day }) {
  const [expanded, setExpanded] = useState(false);
  const proteinColor = getProteinColor(day.protein || 0);
  
  return (
    <Card className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-text-primary font-semibold">Day {day.day}</span>
            <span className="text-text-muted text-sm">{formatShortDate(day.date)}</span>
            {day.workout && <Badge variant="green">Workout</Badge>}
            {day.walkingPad && <Badge variant="orange">Walking</Badge>}
          </div>
          <p className="text-text-secondary text-sm line-clamp-1">{day.dayType}</p>
        </div>
        <div className="text-right">
          {day.protein !== null && (
            <div className={`text-lg font-bold`} style={{ color: proteinColor }}>{day.protein}g</div>
          )}
          {day.calories !== null && (
            <div className="text-xs text-text-muted">{day.calories} kcal</div>
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="mt-4 pt-4 border-t border-bg-tertiary/50 space-y-3">
          {Object.entries(day.meals || {}).length > 0 && (
            <div>
              <h4 className="text-text-secondary text-xs font-medium mb-2">Meals</h4>
              <div className="space-y-1">
                {Object.entries(day.meals).map(([meal, desc]) => (
                  <div key={meal} className="text-sm">
                    <span className="text-text-muted capitalize">{meal.replace(/_/g, ' ')}:</span>
                    <span className="text-text-secondary ml-2">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {day.water && <div className="text-sm"><span className="text-text-muted">Water:</span> <span className="text-text-secondary">{day.water}L</span></div>}
            {day.sleep && <div className="text-sm"><span className="text-text-muted">Sleep:</span> <span className="text-text-secondary">{day.sleep} hrs</span></div>}
            {day.mood && <div className="text-sm"><span className="text-text-muted">Mood:</span> <span className="text-text-secondary">{day.mood}/5</span></div>}
            {day.walkingPadMinutes > 0 && <div className="text-sm"><span className="text-text-muted">Walking:</span> <span className="text-text-secondary">{day.walkingPadMinutes} min</span></div>}
          </div>
          
          {day.notes && (
            <div className="text-sm text-text-secondary bg-bg-tertiary/20 p-3 rounded-lg">
              {day.notes}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
