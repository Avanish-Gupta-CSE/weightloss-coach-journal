import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Card from '../common/Card';
import { Beef, AlertTriangle } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { formatShortDate } from '../../utils/formatters';
import { getProteinColor } from '../../utils/calculations';

const ranges = [
  { key: 7, label: '7 Days' },
  { key: 14, label: '14 Days' },
  { key: 30, label: '30 Days' },
];

export default function NutritionPage() {
  const { daily, macroTargets } = useDashboard();
  const [range, setRange] = useState(14);
  const proteinTarget = macroTargets?.protein?.grams ?? 180;
  const calorieTarget = 1900;
  
  const periodData = useMemo(() => {
    return daily.slice(-range).map(d => ({
      date: d.date,
      displayDate: formatShortDate(d.date),
      protein: d.protein || 0,
      calories: d.calories || 0,
      workout: Boolean(d.workout),
      day: d.day,
    }));
  }, [daily, range]);
  
  const avgProtein = useMemo(() => {
    const sum = periodData.reduce((acc, d) => acc + d.protein, 0);
    return Math.round(sum / periodData.length) || 0;
  }, [periodData]);
  
  const avgCalories = useMemo(() => {
    const sum = periodData.reduce((acc, d) => acc + d.calories, 0);
    return Math.round(sum / periodData.length) || 0;
  }, [periodData]);
  
  // 7-day rolling average for protein
  const proteinWithAvg = useMemo(() => {
    return periodData.map((item, index) => {
      const start = Math.max(0, index - 6);
      const slice = periodData.slice(start, index + 1);
      const avg = slice.reduce((s, d) => s + d.protein, 0) / slice.length;
      return { ...item, avg: Math.round(avg) };
    });
  }, [periodData]);
  
  // Problem days
  const problemDays = useMemo(() => {
    return daily.filter(d => (d.protein || 0) < 120 && d.protein !== null).reverse();
  }, [daily]);
  
  return (
    <div className="space-y-6">
      {/* Range selector */}
      <div className="flex gap-2">
        {ranges.map(r => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              range === r.key ? 'bg-accent-blue/10 text-accent-blue' : 'bg-bg-secondary text-text-secondary'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-bg-secondary rounded-lg border border-bg-tertiary/50 p-4">
          <div className="text-text-muted text-xs mb-1">Avg Protein</div>
          <div className={`text-2xl font-bold ${avgProtein >= 150 ? 'text-accent-green' : 'text-accent-yellow'}`}>{avgProtein}g</div>
          <div className="text-text-muted text-xs">Target: {proteinTarget}g</div>
        </div>
        <div className="bg-bg-secondary rounded-lg border border-bg-tertiary/50 p-4">
          <div className="text-text-muted text-xs mb-1">Avg Calories</div>
          <div className="text-2xl font-bold text-text-primary">{avgCalories}</div>
          <div className="text-text-muted text-xs">Target: {calorieTarget}</div>
        </div>
        <div className="bg-bg-secondary rounded-lg border border-bg-tertiary/50 p-4">
          <div className="text-text-muted text-xs mb-1">Protein Hit Days</div>
          <div className="text-2xl font-bold text-accent-green">
            {periodData.filter(d => d.protein >= 150).length}/{periodData.length}
          </div>
        </div>
        <div className="bg-bg-secondary rounded-lg border border-bg-tertiary/50 p-4">
          <div className="text-text-muted text-xs mb-1">Workout Days</div>
          <div className="text-2xl font-bold text-accent-purple">
            {periodData.filter(d => d.workout).length}/{periodData.length}
          </div>
        </div>
      </div>
      
      {/* Protein Trend */}
      <Card title="Protein Trend" icon={Beef}>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={proteinWithAvg} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="displayDate" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 220]} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <ReferenceLine y={proteinTarget} stroke="#22c55e" strokeDasharray="5 5" label={{ value: `${proteinTarget}g`, fill: '#22c55e', fontSize: 11 }} />
              <Line type="monotone" dataKey="protein" stroke="#64748b" strokeWidth={1} dot={false} />
              <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
          <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-accent-blue" /><span>7-day avg</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-0.5 bg-text-muted" /><span>Daily</span></div>
        </div>
      </Card>
      
      {/* Calorie Chart */}
      <Card title="Calorie Intake">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={periodData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="displayDate" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[1000, 2500]} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <ReferenceLine y={calorieTarget} stroke="#22c55e" strokeDasharray="5 5" label={{ value: 'Target', fill: '#22c55e', fontSize: 11 }} />
              <Line type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Problem Days */}
      <Card title="Protein Problem Days (<120g)" icon={AlertTriangle}>
        <div className="space-y-2">
          {problemDays.slice(0, 10).map(day => (
            <div key={day.day} className="flex items-center justify-between p-3 bg-bg-tertiary/20 rounded-lg">
              <div>
                <span className="text-text-primary font-medium text-sm">Day {day.day}</span>
                <span className="text-text-muted text-xs ml-2">{formatShortDate(day.date)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold" style={{ color: getProteinColor(day.protein || 0) }}>{day.protein}g</span>
                {day.calories && <span className="text-text-muted text-xs">{day.calories} kcal</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
