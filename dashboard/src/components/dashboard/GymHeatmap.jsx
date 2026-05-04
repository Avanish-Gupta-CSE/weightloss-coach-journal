import { useMemo } from 'react';
import { format, parseISO, startOfWeek, addDays, isSameDay } from 'date-fns';
import Card from '../common/Card';
import { CalendarDays } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function GymHeatmap() {
  const { daily } = useDashboard();
  
  const heatmapData = useMemo(() => {
    const last49Days = daily.slice(-49);
    const weeks = [];
    
    if (last49Days.length === 0) return [];
    
    const firstDate = last49Days[0].date ? parseISO(last49Days[0].date) : new Date();
    const startOfFirstWeek = startOfWeek(firstDate, { weekStartsOn: 1 });
    
    for (let w = 0; w < 7; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date = addDays(startOfFirstWeek, w * 7 + d);
        const dayData = last49Days.find(ld => ld.date && isSameDay(parseISO(ld.date), date));
        
        week.push({
          date,
          day: dayData?.day || null,
          workout: dayData?.workout || false,
          walkingPad: dayData?.walkingPad || false,
          protein: dayData?.protein || null,
          hasData: !!dayData,
        });
      }
      weeks.push(week);
    }
    
    return weeks;
  }, [daily]);
  
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const totalWorkouts = daily.slice(-49).filter(d => d.workout).length;
  const totalDays = daily.slice(-49).length;
  
  return (
    <Card title="Gym Consistency (Last 7 Weeks)" icon={CalendarDays} className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-text-secondary">
          <span className="font-bold text-accent-green">{totalWorkouts}</span> workouts in <span className="font-bold text-text-primary">{totalDays}</span> days
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-accent-green" /><span className="text-text-muted">Workout</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-accent-red/40" /><span className="text-text-muted">Rest/Missed</span></div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          <div className="flex">
            <div className="flex flex-col justify-around mr-2 py-1">
              {dayLabels.map(day => (
                <div key={day} className="text-xs text-text-muted w-8 text-right h-8 flex items-center justify-end">{day}</div>
              ))}
            </div>
            
            <div className="flex gap-1.5">
              {heatmapData.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1.5">
                  {week.map((cell, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`w-8 h-8 rounded-md ${cell.hasData ? (cell.workout ? 'bg-accent-green' : 'bg-accent-red/40') : 'bg-bg-tertiary/30'} ${cell.hasData ? (cell.workout && cell.walkingPad ? 'opacity-100' : cell.workout ? 'opacity-85' : 'opacity-50') : 'opacity-30'} transition-all hover:scale-110 hover:ring-2 hover:ring-accent-blue/50 cursor-pointer relative group`}
                      title={cell.hasData ? `Day ${cell.day}: ${cell.workout ? 'Workout' : 'Rest'}${cell.walkingPad ? ' + Walking' : ''}` : 'No data'}
                    >
                      {cell.hasData && cell.day && (
                        <span className="absolute inset-0 flex items-center justify-center text-[9px] font-medium text-text-primary/70">{cell.day % 10}</span>
                      )}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div className="bg-bg-secondary border border-bg-tertiary rounded-lg px-2 py-1.5 shadow-lg whitespace-nowrap">
                          <p className="text-text-secondary text-xs">{format(cell.date, 'MMM d, yyyy')}</p>
                          {cell.hasData && (
                            <>
                              <p className="text-text-primary text-xs font-medium">Day {cell.day}</p>
                              <p className="text-xs mt-0.5">{cell.workout ? <span className="text-accent-green">Workout</span> : <span className="text-accent-red">Rest</span>}</p>
                              {cell.protein && <p className="text-text-muted text-xs">{cell.protein}g protein</p>}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
