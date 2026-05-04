import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import PageHeader from './PageHeader';

const pageTitles = {
  '/': 'Dashboard',
  '/daily': 'Daily Log',
  '/workouts': 'Workouts',
  '/nutrition': 'Nutrition',
  '/brain': 'Brain State',
  '/protocol': 'Protocol',
};

export default function Layout({ children }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Protocol 200';

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-bg-secondary border-r border-bg-tertiary/50 flex-col z-40">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="md:ml-64 pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <PageHeader title={title} />
          {children}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}
