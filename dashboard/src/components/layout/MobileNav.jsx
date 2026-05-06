import { Link, useLocation } from 'react-router-dom';
import { Activity, CalendarDays, Dumbbell, Beef, Brain, FileText } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dash', icon: Activity },
  { path: '/daily', label: 'Daily', icon: CalendarDays },
  { path: '/workouts', label: 'Gym', icon: Dumbbell },
  { path: '/nutrition', label: 'Nutri', icon: Beef },
  { path: '/brain', label: 'Brain', icon: Brain },
  { path: '/protocol', label: 'Proto', icon: FileText },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-secondary/95 backdrop-blur-md border-t border-bg-tertiary/50 z-50 safe-area-pb">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-all ${
                isActive ? 'text-accent-blue' : 'text-text-muted'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-accent-blue' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
