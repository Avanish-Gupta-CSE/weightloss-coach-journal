import { motion } from 'framer-motion';
import { Scale, TrendingDown, Dumbbell, Activity } from 'lucide-react';
import { calculateBMI } from '../../utils/calculations';
import { formatWeight } from '../../utils/formatters';
import { formatShortDate } from '../../utils/formatters';
import { useDashboard } from '../../context/DashboardContext';

export default function StatsRow() {
  const { metrics, currentWeight, sessions, daily } = useDashboard();
  const baseline = metrics.baseline || { weight: 91.45, height: 168 };
  const weighins = metrics.weighins || [];
  
  const totalLost = (baseline.weight - currentWeight).toFixed(2);
  const bmi = calculateBMI(currentWeight, baseline.height);
  const pctToGoal = Math.min(100, ((baseline.weight - currentWeight) / (baseline.weight - 70) * 100)).toFixed(1);
  
  const stats = [
    {
      label: 'Current Weight',
      value: formatWeight(currentWeight),
      subtext: `Last: ${formatShortDate(weighins.filter(w => w.weight).pop()?.date)}`,
      icon: Scale,
      color: 'text-accent-blue',
      bgColor: 'bg-accent-blue/10',
    },
    {
      label: 'Total Lost',
      value: `${totalLost} kg`,
      subtext: `${pctToGoal}% to goal`,
      icon: TrendingDown,
      color: 'text-accent-green',
      bgColor: 'bg-accent-green/10',
    },
    {
      label: 'Gym Sessions',
      value: sessions.length,
      subtext: `${daily.filter(d => d.workout).length} days with workout`,
      icon: Dumbbell,
      color: 'text-accent-purple',
      bgColor: 'bg-accent-purple/10',
    },
    {
      label: 'Current BMI',
      value: bmi,
      subtext: bmi >= 30 ? 'Obese I' : bmi >= 25 ? 'Overweight' : 'Normal',
      icon: Activity,
      color: 'text-accent-orange',
      bgColor: 'bg-accent-orange/10',
    },
  ];
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          className="bg-bg-secondary rounded-xl border border-bg-tertiary/50 p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <span className="text-text-muted text-sm">{stat.label}</span>
          </div>
          <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
          <div className="text-text-muted text-xs">{stat.subtext}</div>
        </motion.div>
      ))}
    </div>
  );
}
