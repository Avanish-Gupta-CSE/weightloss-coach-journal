import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Card from '../common/Card';
import { Flag } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function Timeline() {
  const { currentWeight, metrics } = useDashboard();
  const startWeight = metrics.baseline?.weight || 91.45;
  const targetWeight = 70;
  const milestones = metrics.timeline || [];
  
  const { progress, remaining } = useMemo(() => {
    const totalToLose = startWeight - targetWeight;
    const lost = startWeight - currentWeight;
    const progress = Math.min(100, (lost / totalToLose) * 100);
    const remaining = totalToLose - lost;
    return { progress, remaining };
  }, [startWeight, currentWeight, targetWeight]);
  
  const ms = milestones.map(m => ({
    ...m,
    reached: currentWeight <= m.weight,
    pct: ((startWeight - m.weight) / (startWeight - targetWeight)) * 100,
  }));
  
  return (
    <Card title="Road to Goal" icon={Flag} className="mb-6">
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-text-secondary">{startWeight} kg</span>
          <span className="text-accent-green font-bold">{targetWeight} kg</span>
        </div>
        
        <div className="relative h-4 bg-bg-tertiary/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-blue to-accent-green rounded-full"
          />
          {ms.map((m, i) => (
            <div key={i} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${m.pct}%` }}>
              <div className={`w-3 h-3 rounded-full border-2 ${m.reached ? 'bg-accent-green border-accent-green' : 'bg-bg-secondary border-accent-purple'} shadow-sm`} />
            </div>
          ))}
        </div>
        
        <div className="flex justify-between mt-3">
          {ms.map((m, i) => (
            <div key={i} className="text-center" style={{ width: `${100 / ms.length}%` }}>
              <div className={`text-xs font-semibold ${m.reached ? 'text-accent-green' : 'text-accent-purple'}`}>{m.label}</div>
              <div className="text-[10px] text-text-muted">{m.weight} kg</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-3 bg-bg-tertiary/30 rounded-lg">
          <div className="text-2xl font-bold text-accent-blue">{progress.toFixed(1)}%</div>
          <div className="text-xs text-text-muted mt-1">Complete</div>
        </div>
        <div className="text-center p-3 bg-bg-tertiary/30 rounded-lg">
          <div className="text-2xl font-bold text-accent-orange">{remaining.toFixed(2)}</div>
          <div className="text-xs text-text-muted mt-1">kg to go</div>
        </div>
        <div className="text-center p-3 bg-bg-tertiary/30 rounded-lg">
          <div className="text-2xl font-bold text-accent-purple">{ms.filter(m => m.reached).length}</div>
          <div className="text-xs text-text-muted mt-1">Milestones hit</div>
        </div>
      </div>
    </Card>
  );
}
