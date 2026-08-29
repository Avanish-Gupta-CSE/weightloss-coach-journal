import { Link, useLocation } from 'react-router-dom';
import { Activity, CalendarDays, Dumbbell, Beef, Brain, FileText, ListChecks } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Activity },
  { path: '/daily', label: 'Daily Log', icon: CalendarDays },
  { path: '/workouts', label: 'Workouts', icon: Dumbbell },
  { path: '/nutrition', label: 'Nutrition', icon: Beef },
  { path: '/scoreboard', label: 'Scoreboard', icon: ListChecks },
  { path: '/brain', label: 'Brain State', icon: Brain },
  { path: '/protocol', label: 'Protocol', icon: FileText },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-bg-tertiary/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-blue/10 flex items-center justify-center">
            <Activity className="w-5 h-5 text-accent-blue" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">Protocol 200</h1>
            <p className="text-[11px] text-text-muted">Body Recomposition</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-accent-blue/10 text-accent-blue'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-accent-blue' : 'text-text-muted'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-bg-tertiary/50">
        <p className="text-[11px] text-text-muted text-center">
          v2.0 — Brain Reader
        </p>
      </div>
    </div>
  );
}
