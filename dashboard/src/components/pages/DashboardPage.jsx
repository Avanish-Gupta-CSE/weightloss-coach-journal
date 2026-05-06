import Header from '../dashboard/Header';
import StatsRow from '../dashboard/StatsRow';
import WeightChart from '../dashboard/WeightChart';
import ProteinChart from '../dashboard/ProteinChart';
import GymHeatmap from '../dashboard/GymHeatmap';
import Timeline from '../dashboard/Timeline';
import BrainStatePanel from '../dashboard/BrainStatePanel';
import SessionLog from '../dashboard/SessionLog';
import ComplianceScore from '../dashboard/ComplianceScore';
import FutureOutlook from '../dashboard/FutureOutlook';

export default function DashboardPage() {
  return (
    <>
      <Header />
      <StatsRow />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeightChart />
          <ProteinChart />
          <GymHeatmap />
        </div>
        
        <div className="lg:col-span-1">
          <Timeline />
          <ComplianceScore />
          <SessionLog />
        </div>
      </div>
      
      <FutureOutlook />

      <BrainStatePanel />
      
      <footer className="mt-8 pt-6 border-t border-bg-tertiary/50 text-center text-text-muted text-sm pb-6">
        <p>Protocol 200 Dashboard v2.0 — Brain Reader</p>
        <p className="mt-1 text-xs">Auto-parsed from .coach brain complex</p>
      </footer>
    </>
  );
}
