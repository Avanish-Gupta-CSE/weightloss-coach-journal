import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { Dumbbell, Trophy } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function WorkoutsPage() {
  const { sessions, daily } = useDashboard();
  const [selectedExercise, setSelectedExercise] = useState(null);
  
  // Extract all unique exercises
  const exercises = useMemo(() => {
    const map = new Map();
    sessions.forEach(session => {
      session.exercises?.forEach(ex => {
        if (!map.has(ex.name)) {
          map.set(ex.name, []);
        }
        const weightNum = parseFloat(ex.weight?.replace(/[^\d.]/g, '')) || 0;
        map.get(ex.name).push({
          session: session.sessionNumber,
          date: session.date,
          weight: weightNum,
          sets: ex.sets,
          reps: ex.reps,
        });
      });
    });
    return Array.from(map.entries()).map(([name, history]) => ({ name, history }));
  }, [sessions]);
  
  // Find PRs
  const prs = useMemo(() => {
    return exercises.map(ex => {
      const max = ex.history.reduce((m, h) => h.weight > m.weight ? h : m, ex.history[0]);
      return { name: ex.name, weight: max.weight, session: max.session };
    });
  }, [exercises]);
  
  return (
    <div className="space-y-6">
      {/* PRs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {prs.slice(0, 8).map(pr => (
          <div key={pr.name} className="bg-bg-secondary rounded-lg border border-bg-tertiary/50 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Trophy className="w-3.5 h-3.5 text-accent-yellow" />
              <span className="text-[10px] text-text-muted uppercase">PR</span>
            </div>
            <div className="text-lg font-bold text-text-primary">{pr.weight}</div>
            <div className="text-xs text-text-muted truncate">{pr.name}</div>
          </div>
        ))}
      </div>
      
      {/* Exercise Progression */}
      {selectedExercise && (
        <Card title={`${selectedExercise.name} Progression`} icon={Dumbbell}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedExercise.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="session" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <button onClick={() => setSelectedExercise(null)} className="mt-3 text-sm text-accent-blue hover:underline">Close chart</button>
        </Card>
      )}
      
      {/* Session Table */}
      <Card title="All Sessions" icon={Dumbbell}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-tertiary/50">
                <th className="text-left py-2 px-3 text-text-muted font-medium">#</th>
                <th className="text-left py-2 px-3 text-text-muted font-medium">Date</th>
                <th className="text-left py-2 px-3 text-text-muted font-medium">Type</th>
                <th className="text-left py-2 px-3 text-text-muted font-medium">Exercises</th>
                <th className="text-left py-2 px-3 text-text-muted font-medium">Day</th>
              </tr>
            </thead>
            <tbody>
              {[...sessions].reverse().map(session => (
                <tr key={session.sessionNumber} className="border-b border-bg-tertiary/30 hover:bg-bg-tertiary/20">
                  <td className="py-2.5 px-3 font-medium text-text-primary">{session.sessionNumber}</td>
                  <td className="py-2.5 px-3 text-text-secondary">{session.date}</td>
                  <td className="py-2.5 px-3"><Badge variant={session.type === 'Upper Body' ? 'blue' : session.type === 'Lower Body' ? 'green' : 'purple'}>{session.type}</Badge></td>
                  <td className="py-2.5 px-3 text-text-secondary">{session.exercises?.length || 0} exercises</td>
                  <td className="py-2.5 px-3 text-text-muted">Day {session.day}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Exercise List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {exercises.map(ex => (
          <button
            key={ex.name}
            onClick={() => setSelectedExercise(ex)}
            className="text-left p-4 bg-bg-secondary rounded-lg border border-bg-tertiary/50 hover:border-accent-blue/50 transition-colors"
          >
            <div className="font-medium text-text-primary text-sm mb-1">{ex.name}</div>
            <div className="text-xs text-text-muted">{ex.history.length} sessions tracked</div>
            <div className="text-xs text-accent-blue mt-1">Current: {ex.history[ex.history.length - 1]?.weight || 0}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
