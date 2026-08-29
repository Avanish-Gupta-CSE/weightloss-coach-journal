import { motion } from 'framer-motion';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { FileText, Target, Flag, CheckCircle2 } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function ProtocolPage() {
  const { protocol, currentDay } = useDashboard();
  const identity = protocol.identity || {};
  const targets = protocol.targets || {};
  const phases = protocol.phases || [];
  const rules = protocol.rules || [];
  
  // Calculate current phase
  const weeks = Math.floor(currentDay / 7) + 1;
  const currentPhaseIndex = phases.findIndex(p => {
    const [startW, endW] = (p.weeks || '').split('-').map(w => parseInt(w?.replace('+', '')));
    if ((p.weeks || '').includes('+')) return weeks >= startW;
    return weeks >= startW && weeks <= endW;
  });
  
  return (
    <div className="space-y-6">
      {/* Identity */}
      <Card title="Protocol Identity" icon={FileText}>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent-blue/10 flex items-center justify-center text-xl font-bold text-accent-blue">
              P200
            </div>
            <div>
              <div className="text-text-primary font-bold text-lg">{identity.name}</div>
              <div className="text-text-secondary text-sm">{identity.mission}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 bg-bg-tertiary/20 rounded-lg">
              <div className="text-text-muted text-xs">Start Date</div>
              <div className="text-text-primary text-sm">{identity.startDate}</div>
            </div>
            <div className="p-3 bg-bg-tertiary/20 rounded-lg">
              <div className="text-text-muted text-xs">Target Date</div>
              <div className="text-text-primary text-sm">{identity.targetDate}</div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Targets */}
      <Card title="Daily Targets" icon={Target}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Object.entries(targets).map(([key, value]) => (
            <div key={key} className="text-center p-4 bg-bg-tertiary/20 rounded-lg">
              <div className="text-text-muted text-xs mb-1">{key}</div>
              <div className="text-xl font-bold text-text-primary">{value}</div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Phase Timeline */}
      <Card title="Phase Timeline" icon={Flag}>
        <div className="space-y-4">
          {phases.map((phase, index) => (
            <div key={index} className={`relative pl-6 pb-4 ${index < phases.length - 1 ? 'border-l-2 border-bg-tertiary/50' : ''}`}>
              <div className={`absolute left-0 top-0 w-4 h-4 rounded-full -translate-x-[9px] ${
                index === currentPhaseIndex ? 'bg-accent-blue ring-4 ring-accent-blue/20' : 
                index < currentPhaseIndex ? 'bg-accent-green' : 'bg-bg-tertiary'
              }`} />
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-text-primary font-medium">{phase.phase}</span>
                    {index === currentPhaseIndex && <Badge variant="blue">Current</Badge>}
                    {index < currentPhaseIndex && <Badge variant="green">Complete</Badge>}
                  </div>
                  <div className="text-text-muted text-sm mt-1">Weeks {phase.weeks}</div>
                  <div className="text-text-secondary text-sm mt-1">{phase.focus}</div>
                </div>
                <div className="text-text-muted text-xs">{phase.calorieTarget}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Non-Negotiable Rules */}
      <Card title="Non-Negotiable Rules" icon={CheckCircle2}>
        <div className="space-y-3">
          {rules.map((rule, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 bg-bg-tertiary/20 rounded-lg"
            >
              <div className="w-6 h-6 rounded-full bg-accent-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-accent-blue">{i + 1}</span>
              </div>
              <div>
                <div className="text-text-primary font-medium text-sm">{rule.title}</div>
                <div className="text-text-secondary text-xs mt-1">{rule.description?.slice(0, 150)}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}
