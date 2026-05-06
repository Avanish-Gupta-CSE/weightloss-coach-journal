import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Card from '../common/Card';
import { getProteinColor } from '../../utils/calculations';
import { formatShortDate } from '../../utils/formatters';
import { Beef } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

function getProteinState(protein) {
  if (protein >= 150) {
    return {
      label: 'Good',
      className: 'text-accent-green',
    };
  }

  if (protein >= 120) {
    return {
      label: 'Warning',
      className: 'text-accent-yellow',
    };
  }

  return {
    label: 'Low',
    className: 'text-accent-red',
  };
}

export default function ProteinChart() {
  const { daily, macroTargets } = useDashboard();
  const target = macroTargets?.protein?.grams ?? 180;
  
  const data = useMemo(() => {
    return daily.slice(-14).map(d => ({
      date: d.date,
      protein: d.protein || 0,
      displayDate: formatShortDate(d.date),
      day: d.day,
    }));
  }, [daily]);
  
  const avgProtein = useMemo(() => {
    const last7 = daily.slice(-7);
    const sum = last7.reduce((acc, d) => acc + (d.protein || 0), 0);
    return Math.round(sum / last7.length) || 0;
  }, [daily]);

  const avgProteinState = getProteinState(avgProtein);
  
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const item = payload[0].payload;
    const proteinState = getProteinState(item.protein);
    return (
      <div className="bg-bg-secondary border border-bg-tertiary rounded-lg p-3 shadow-lg">
        <p className="text-text-secondary text-xs mb-1">Day {item.day} - {item.displayDate}</p>
        <p className="text-text-primary font-bold text-lg">{item.protein}g protein</p>
        <p className={`text-xs mt-1 ${proteinState.className}`}>
          {proteinState.label}
        </p>
      </div>
    );
  };
  
  const CustomBar = (props) => {
    const { x, y, width, height, payload } = props;
    const color = getProteinColor(payload.protein);
    return <rect x={x} y={y} width={width} height={height} fill={color} rx={4} opacity={0.85} />;
  };
  
  return (
    <Card title="Protein Intake (Last 14 Days)" icon={Beef} className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-text-secondary">
          7-day avg: <span className={`font-bold ${avgProteinState.className}`}>{avgProtein}g</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-accent-green" /><span className="text-text-muted">150g+</span></div>
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-accent-yellow" /><span className="text-text-muted">120-149g</span></div>
          <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-accent-red" /><span className="text-text-muted">&lt;120g</span></div>
        </div>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
            <XAxis dataKey="displayDate" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 220]} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.2 }} />
            <ReferenceLine y={target} stroke="#22c55e" strokeDasharray="5 5"
              label={{ value: `${target}g`, fill: '#22c55e', fontSize: 11, position: 'right' }} />
            <ReferenceLine y={150} stroke="#eab308" strokeDasharray="3 3" opacity={0.5} />
            <Bar dataKey="protein" shape={<CustomBar />} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
