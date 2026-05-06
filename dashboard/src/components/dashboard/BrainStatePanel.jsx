import Card from '../common/Card';
import Badge from '../common/Badge';
import { Brain, Pill, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function BrainStatePanel() {
  const { brainstate } = useDashboard();
  const snapshot = brainstate.snapshot || {};
  const rules = brainstate.rules || [];
  const pending = brainstate.pending || [];
  const medicalLog = brainstate.medicalLog || [];
  
  return (
    <Card title="Current State" icon={Brain} className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-text-secondary text-sm font-medium mb-3">Snapshot</h4>
          <div className="space-y-2.5">
            {Object.entries(snapshot).slice(0, 6).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-text-muted">{key}</span>
                <span className="text-text-primary font-medium truncate max-w-[60%]">{value?.toString().slice(0, 60)}</span>
              </div>
            ))}
          </div>
          
          {snapshot['Medications active'] && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-bg-tertiary/30 rounded-lg">
              <Pill className="w-4 h-4 text-accent-blue" />
              <span className="text-sm text-text-secondary">{snapshot['Medications active']}</span>
            </div>
          )}
        </div>
        
        <div>
          <h4 className="text-text-secondary text-sm font-medium mb-3">Active Rules ({rules.length})</h4>
          <div className="space-y-2 mb-5">
            {rules.slice(0, 5).map((rule) => (
              <div key={rule.code} className="flex items-start gap-2 text-sm">
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-accent-blue/10 text-accent-blue shrink-0">{rule.code}</span>
                <span className="text-text-secondary">{rule.rule}</span>
              </div>
            ))}
            {rules.length > 5 && <div className="text-xs text-text-muted">+{rules.length - 5} more rules</div>}
          </div>
          
          <h4 className="text-text-secondary text-sm font-medium mb-3">Pending ({pending.length})</h4>
          <div className="space-y-2 mb-5">
            {pending.slice(0, 3).map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-3.5 h-3.5 text-accent-yellow" />
                <span className="text-text-secondary">{p.item}</span>
                <Badge variant={p.priority?.includes('ACTIVE') ? 'green' : 'yellow'} className="ml-auto">{p.priority}</Badge>
              </div>
            ))}
          </div>
          
          <h4 className="text-text-secondary text-sm font-medium mb-3">Medical</h4>
          <div className="space-y-2">
            {medicalLog.slice(0, 4).map((m, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {m.status?.includes('Managed') ? <Pill className="w-3.5 h-3.5 text-accent-blue" /> :
                 m.status?.includes('Monitor') ? <AlertTriangle className="w-3.5 h-3.5 text-accent-yellow" /> :
                 <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" />}
                <span className={`text-text-secondary ${m.status?.includes('Resolved') ? 'line-through opacity-60' : ''}`}>{m.event?.slice(0, 60)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
