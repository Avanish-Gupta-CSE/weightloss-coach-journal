import Card from '../common/Card';
import Badge from '../common/Badge';
import { Brain, Pill, AlertTriangle, CheckCircle2, Package, ClipboardList } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export default function BrainStatePage() {
  const { brainstate } = useDashboard();
  const snapshot = brainstate.snapshot || {};
  const kitchenStock = brainstate.kitchenStock || [];
  const rules = brainstate.rules || [];
  const pending = brainstate.pending || [];
  const medicalLog = brainstate.medicalLog || [];
  
  const getStatusColor = (status) => {
    if (status?.includes('✅') || status?.includes('In stock')) return 'text-accent-green';
    if (status?.includes('⚠️') || status?.includes('Low')) return 'text-accent-yellow';
    if (status?.includes('❌') || status?.includes('Depleted')) return 'text-accent-red';
    return 'text-text-muted';
  };
  
  const getMedicalIcon = (status) => {
    if (status?.includes('Managed') || status?.includes('Resolved')) return <CheckCircle2 className="w-4 h-4 text-accent-green" />;
    if (status?.includes('Monitor')) return <AlertTriangle className="w-4 h-4 text-accent-yellow" />;
    return <Pill className="w-4 h-4 text-accent-blue" />;
  };
  
  return (
    <div className="space-y-6">
      {/* Snapshot */}
      <Card title="Snapshot" icon={Brain}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(snapshot).map(([key, value]) => (
            <div key={key} className="p-3 bg-bg-tertiary/20 rounded-lg">
              <div className="text-text-muted text-xs mb-1">{key}</div>
              <div className="text-text-primary text-sm font-medium">{value?.toString().slice(0, 100)}</div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Kitchen Stock */}
      <Card title="Kitchen Stock" icon={Package}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-tertiary/50">
                <th className="text-left py-2 px-3 text-text-muted font-medium">Item</th>
                <th className="text-left py-2 px-3 text-text-muted font-medium">Status</th>
                <th className="text-left py-2 px-3 text-text-muted font-medium">Qty</th>
              </tr>
            </thead>
            <tbody>
              {kitchenStock.map((item, i) => (
                <tr key={i} className="border-b border-bg-tertiary/30">
                  <td className="py-2 px-3 text-text-primary">{item.item?.slice(0, 40)}</td>
                  <td className="py-2 px-3">
                    <span className={getStatusColor(item.status)}>{item.status?.replace(/[✅⚠️❌]/g, '').trim()}</span>
                  </td>
                  <td className="py-2 px-3 text-text-secondary">{item.quantity?.slice(0, 20)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Rules */}
      <Card title="Standing Rules" icon={ClipboardList}>
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.code} className="p-3 bg-bg-tertiary/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Badge variant="blue">{rule.code}</Badge>
                <div>
                  <div className="text-text-primary font-medium text-sm">{rule.rule}</div>
                  <div className="text-text-secondary text-xs mt-1">{rule.details?.slice(0, 120)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Pending */}
      <Card title="Pending Decisions" icon={AlertTriangle}>
        <div className="space-y-2">
          {pending.map((p, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-bg-tertiary/20 rounded-lg">
              <div>
                <div className="text-text-primary text-sm">{p.item}</div>
                <div className="text-text-muted text-xs mt-0.5">{p.details?.slice(0, 80)}</div>
              </div>
              <Badge variant={p.priority?.includes('ACTIVE') ? 'green' : p.priority?.includes('URGENT') ? 'red' : 'yellow'}>
                {p.priority}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Medical Log */}
      <Card title="Medical Log" icon={Pill}>
        <div className="space-y-2">
          {medicalLog.map((m, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-bg-tertiary/20 rounded-lg">
              {getMedicalIcon(m.status)}
              <div className="flex-1">
                <div className="text-text-primary text-sm">{m.event?.slice(0, 100)}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-text-muted text-xs">{m.date}</span>
                  <span className={`text-xs ${m.status?.includes('Resolved') ? 'text-accent-green' : 'text-accent-yellow'}`}>{m.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
