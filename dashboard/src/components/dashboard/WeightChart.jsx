import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Card from '../common/Card';
import { linearProjection } from '../../utils/projections';
import { formatShortDate } from '../../utils/formatters';
import { TrendingDown } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function WeightChart() {
  const { metrics, currentWeight } = useDashboard();
  const weighins = metrics.weighins || [];
  const targetWeight = 70;
  
  const data = useMemo(() => {
    const valid = weighins.filter(w => w.weight);
    const projections = linearProjection(weighins, targetWeight);
    
    return [
      ...valid.map(w => ({
        date: w.date,
        weight: w.weight,
        type: w.type,
        displayDate: formatShortDate(w.date),
      })),
      ...projections.map(p => ({
        date: p.date,
        weight: p.weight,
        type: 'projection',
        displayDate: formatShortDate(p.date),
      })),
    ];
  }, [weighins]);
  
  const milestones = (metrics.timeline || []).filter(m => m.weight >= targetWeight);
  
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const item = payload[0].payload;
    const isProjection = item.type === 'projection';
    return (
      <div className="bg-bg-secondary border border-bg-tertiary rounded-lg p-3 shadow-lg">
        <p className="text-text-secondary text-xs mb-1">{formatShortDate(item.date)}</p>
        <p className="text-text-primary font-bold text-lg">{item.weight} kg</p>
        {isProjection && <p className="text-accent-blue text-xs mt-1">Projected</p>}
        {item.type === 'spot-check' && <p className="text-accent-yellow text-xs mt-1">Unofficial</p>}
      </div>
    );
  };
  
  return (
    <Card title="Weight Trajectory" icon={TrendingDown} className="mb-6">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="displayDate" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={50} />
            <Tooltip content={<CustomTooltip />} />
            {milestones.map((m, i) => (
              <ReferenceLine key={i} y={m.weight} stroke="#a855f7" strokeDasharray="5 5" opacity={0.5} />
            ))}
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#3b82f6" 
              strokeWidth={2.5}
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (payload.type === 'projection') return null;
                const color = payload.type === 'spot-check' ? '#eab308' : '#3b82f6';
                return <circle cx={cx} cy={cy} r={5} fill={color} stroke="#0f172a" strokeWidth={2} />;
              }}
              activeDot={{ r: 7, fill: '#60a5fa', stroke: '#0f172a', strokeWidth: 2 }}
            />
            <ReferenceLine y={targetWeight} stroke="#22c55e" strokeDasharray="3 3" 
              label={{ value: 'GOAL', fill: '#22c55e', fontSize: 12, position: 'right' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center gap-4 mt-4 text-xs text-text-muted flex-wrap">
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-accent-blue" /><span>Official</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-accent-yellow" /><span>Spot Check</span></div>
        <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-accent-green" /><span>Goal</span></div>
        <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-accent-purple border-dashed" /><span>Milestones</span></div>
      </div>
    </Card>
  );
}
