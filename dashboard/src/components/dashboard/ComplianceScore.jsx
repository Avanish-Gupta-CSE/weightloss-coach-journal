import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import { Target } from 'lucide-react';
import { calculateComplianceScore, getProteinColor } from '../../utils/calculations';
import { useDashboard } from '../../context/DashboardContext';

export default function ComplianceScore() {
  const { daily } = useDashboard();
  
  const score = useMemo(() => calculateComplianceScore(daily), [daily]);
  
  const getScoreColor = (s) => {
    if (s >= 80) return 'text-accent-green';
    if (s >= 60) return 'text-accent-yellow';
    return 'text-accent-red';
  };
  
  const getScoreBg = (s) => {
    if (s >= 80) return 'bg-accent-green/10';
    if (s >= 60) return 'bg-accent-yellow/10';
    return 'bg-accent-red/10';
  };
  
  const getScoreLabel = (s) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Needs Work';
    return 'Critical';
  };
  
  const last7 = daily.slice(-7);
  const proteinDays = last7.filter(d => (d.protein || 0) >= 150).length;
  const workoutDays = last7.filter(d => d.workout).length;
  const walkingDays = last7.filter(d => d.walkingPad).length;
  
  return (
    <Card title="Weekly Compliance" icon={Target} className="mb-6">
      <div className="flex items-center gap-6 mb-5">
        <div className={`w-20 h-20 rounded-full ${getScoreBg(score)} flex items-center justify-center`}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
            <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
          </motion.div>
        </div>
        <div>
          <div className={`text-lg font-semibold ${getScoreColor(score)}`}>{getScoreLabel(score)}</div>
          <div className="text-text-muted text-sm">Last 7 days</div>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-text-secondary">Protein ≥150g</span>
            <span className="text-text-primary font-medium">{proteinDays}/7 days</span>
          </div>
          <div className="h-2 bg-bg-tertiary/50 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(proteinDays / 7) * 100}%` }} transition={{ duration: 0.5 }}
              className="h-full bg-accent-green rounded-full" />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-text-secondary">Workouts</span>
            <span className="text-text-primary font-medium">{workoutDays}/7 days</span>
          </div>
          <div className="h-2 bg-bg-tertiary/50 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(workoutDays / 7) * 100}%` }} transition={{ duration: 0.5, delay: 0.1 }}
              className="h-full bg-accent-purple rounded-full" />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-text-secondary">Walking Pad</span>
            <span className="text-text-primary font-medium">{walkingDays}/7 days</span>
          </div>
          <div className="h-2 bg-bg-tertiary/50 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(walkingDays / 7) * 100}%` }} transition={{ duration: 0.5, delay: 0.2 }}
              className="h-full bg-accent-orange rounded-full" />
          </div>
        </div>
      </div>
    </Card>
  );
}
