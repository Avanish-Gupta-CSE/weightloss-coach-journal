import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Sparkles } from 'lucide-react';
import Card from '../common/Card';
import { calculateWeeklyRate } from '../../utils/calculations';
import { formatDate } from '../../utils/formatters';
import { useDashboard } from '../../context/DashboardContext';

const LOOK_MILESTONES = [
  {
    weight: 86,
    title: 'Tighter face, quieter rebound fear',
    description: 'This is where the face starts looking less puffy and the waist stops feeling constantly inflated.',
  },
  {
    weight: 83,
    title: 'Clear recomposition zone',
    description: 'If protein stays high, shoulders and chest hold shape better while the stomach starts shrinking faster than the scale suggests.',
  },
  {
    weight: 80,
    title: 'Noticeable cut to other people',
    description: 'Clothes loosen at the waist, the side profile flattens, and the body stops looking soft everywhere at once.',
  },
  {
    weight: 76,
    title: 'Lean from most angles',
    description: 'Jawline sharpens, upper body looks more athletic, and the waist-to-shoulder contrast becomes obvious.',
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function addDays(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date;
}

function projectDate(startDate, currentWeight, targetWeight, weeklyLoss) {
  if (!startDate || currentWeight <= targetWeight || weeklyLoss <= 0) return null;
  const weeksNeeded = Math.ceil((currentWeight - targetWeight) / weeklyLoss);
  return addDays(startDate, weeksNeeded * 7);
}

function buildScenarioSeries(startWeight, rates, horizonWeeks = 16, targetWeight = 70) {
  return Array.from({ length: horizonWeeks + 1 }, (_, week) => ({
    week,
    conservative: Number(Math.max(targetWeight, startWeight - rates.conservative * week).toFixed(2)),
    recomposition: Number(Math.max(targetWeight, startWeight - rates.recomposition * week).toFixed(2)),
    aggressive: Number(Math.max(targetWeight, startWeight - rates.aggressive * week).toFixed(2)),
  }));
}

function OutlookTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const values = Object.fromEntries(payload.map(item => [item.dataKey, item.value]));

  return (
    <div className="bg-bg-secondary border border-bg-tertiary rounded-lg p-3 shadow-lg min-w-44">
      <p className="text-text-secondary text-xs mb-2">{label === 0 ? 'Now' : `+${label} weeks`}</p>
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-text-secondary">Current trend</span>
          <span className="font-semibold text-text-primary">{values.conservative} kg</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-text-secondary">If you rectify (150g+ protein)</span>
          <span className="font-semibold text-accent-green">{values.recomposition} kg</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-text-secondary">Ideal (hard push)</span>
          <span className="font-semibold text-accent-orange">{values.aggressive} kg</span>
        </div>
      </div>
    </div>
  );
}

function LookIndexTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const values = Object.fromEntries(payload.map(item => [item.dataKey, item.value]));

  return (
    <div className="bg-bg-secondary border border-bg-tertiary rounded-lg p-3 shadow-lg min-w-52">
      <p className="text-text-secondary text-xs mb-2">{label === 0 ? 'Now' : `+${label} weeks`}</p>
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-text-secondary">Current trend</span>
          <span className="font-semibold text-text-primary">{values.conservative}/100</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-text-secondary">If you rectify (150g+)</span>
          <span className="font-semibold text-accent-green">{values.recomposition}/100</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-text-secondary">Ideal</span>
          <span className="font-semibold text-accent-orange">{values.aggressive}/100</span>
        </div>
      </div>
    </div>
  );
}

export default function FutureOutlook() {
  const { currentWeight, daily, metrics } = useDashboard();

  const summary = useMemo(() => {
    const baselineWeight = metrics.baseline?.weight || 91.45;
    const targetWeight = 70;
    const weighins = metrics.weighins || [];
    const latestWeighin = weighins.filter(entry => entry.weight).slice(-1)[0];
    const officialRate = parseFloat(calculateWeeklyRate(weighins)) || 0.55;
    const recompositionRate = clamp(officialRate, 0.45, 0.65);
    const rates = {
      conservative: clamp(recompositionRate - 0.15, 0.35, 0.55),
      recomposition: recompositionRate,
      aggressive: clamp(recompositionRate + 0.15, 0.6, 0.8),
    };

    const proteinWindow = daily.slice(-14).filter(entry => entry.protein !== null);
    const avgProtein = proteinWindow.length
      ? Math.round(proteinWindow.reduce((sum, entry) => sum + (entry.protein || 0), 0) / proteinWindow.length)
      : 0;
    const proteinHitDays = proteinWindow.filter(entry => (entry.protein || 0) >= 150).length;
    const proteinGap = Math.max(0, 150 - avgProtein);
    const startDate = latestWeighin?.date || new Date().toISOString().split('T')[0];

    const targetProtein = 180;
    const lookProteinFactor = {
      conservative: clamp(avgProtein / targetProtein, 0.55, 1),
      recomposition: clamp(150 / targetProtein, 0.55, 1),
      aggressive: 1,
    };
    const buildLookIndex = (weight, proteinFactor) => {
      if (currentWeight <= targetWeight) return 100;
      const progress = clamp((currentWeight - weight) / (currentWeight - targetWeight), 0, 1);
      return Number((progress * proteinFactor * 100).toFixed(1));
    };
    const chartData = buildScenarioSeries(currentWeight, rates, 16, targetWeight);
    const lookChartData = chartData.map(point => ({
      week: point.week,
      conservative: buildLookIndex(point.conservative, lookProteinFactor.conservative),
      recomposition: buildLookIndex(point.recomposition, lookProteinFactor.recomposition),
      aggressive: buildLookIndex(point.aggressive, lookProteinFactor.aggressive),
    }));

    return {
      latestWeighin,
      totalLost: Number((baselineWeight - currentWeight).toFixed(2)),
      avgProtein,
      proteinHitDays,
      proteinGap,
      officialRate: recompositionRate,
      rates,
      chartData,
      lookChartData,
      etaTargets: [80, 76, 70].map(weight => ({
        weight,
        date: projectDate(startDate, currentWeight, weight, recompositionRate),
      })),
    };
  }, [currentWeight, daily, metrics]);

  return (
    <Card title="Future Outlook" icon={Sparkles} className="mb-6">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="rounded-lg bg-bg-tertiary/20 p-4 border border-bg-tertiary/40">
              <div className="text-xs text-text-muted mb-1">Latest checkpoint</div>
              <div className="text-2xl font-bold text-accent-blue">{currentWeight.toFixed(2)} kg</div>
              <div className="text-xs text-text-muted mt-1">
                {summary.latestWeighin?.type === 'spot-check' ? 'Unofficial post-gym marker' : 'Latest logged weigh-in'}
              </div>
            </div>
            <div className="rounded-lg bg-accent-green/10 p-4 border border-accent-green/20">
              <div className="text-xs text-text-muted mb-1">14-day protein average</div>
              <div className="text-2xl font-bold text-accent-green">{summary.avgProtein}g</div>
              <div className="text-xs text-text-muted mt-1">
                {summary.proteinGap > 0 ? `Need +${summary.proteinGap}g/day for the 150g lane` : 'Already living in the 150g lane'}
              </div>
            </div>
            <div className="rounded-lg bg-accent-purple/10 p-4 border border-accent-purple/20">
              <div className="text-xs text-text-muted mb-1">Official weekly trend</div>
              <div className="text-2xl font-bold text-accent-purple">{summary.officialRate.toFixed(2)} kg</div>
              <div className="text-xs text-text-muted mt-1">Per week from official checkpoints</div>
            </div>
          </div>

          <div className="h-72 rounded-xl bg-bg-primary/30 border border-bg-tertiary/30 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.chartData} margin={{ top: 8, right: 18, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis
                  dataKey="week"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => (value === 0 ? 'Now' : value % 4 === 0 ? `+${value}w` : '')}
                />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={48} domain={['dataMin - 1', 'dataMax + 1']} />
                <Tooltip content={<OutlookTooltip />} />
                <ReferenceLine y={70} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Goal', fill: '#22c55e', fontSize: 11, position: 'right' }} />
                <Line type="monotone" dataKey="conservative" stroke="#94a3b8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="recomposition" stroke="#22c55e" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="aggressive" stroke="#f97316" strokeWidth={2} dot={false} strokeDasharray="6 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-text-muted">
            <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-slate-400" /><span>Current trend</span></div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-accent-green" /><span>If you rectify (150g+ protein)</span></div>
            <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 border-t-2 border-dashed border-accent-orange" /><span>Ideal (hard push)</span></div>
          </div>

          <div className="mt-6">
            <div className="text-sm font-semibold text-text-primary mb-2">Body look outlook (protein-weighted)</div>
            <div className="h-60 rounded-xl bg-bg-primary/30 border border-bg-tertiary/30 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.lookChartData} margin={{ top: 8, right: 18, left: 4, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis
                    dataKey="week"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => (value === 0 ? 'Now' : value % 4 === 0 ? `+${value}w` : '')}
                  />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={48} domain={[0, 100]} />
                  <Tooltip content={<LookIndexTooltip />} />
                  <ReferenceLine y={100} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Best case', fill: '#22c55e', fontSize: 11, position: 'right' }} />
                  <Line type="monotone" dataKey="conservative" stroke="#94a3b8" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="recomposition" stroke="#22c55e" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="aggressive" stroke="#f97316" strokeWidth={2} dot={false} strokeDasharray="6 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs text-text-muted">
              Look index (0–100) is a proxy: weight progress × protein lane. It is not a body-fat measurement.
            </p>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-4">
          <div className="rounded-xl bg-bg-tertiary/20 border border-bg-tertiary/40 p-4">
            <div className="text-sm font-semibold text-text-primary">If 150g+ protein becomes daily</div>
            <p className="text-sm text-text-secondary mt-2">
              The biggest change is not magical scale speed. It is how you look at the same bodyweight: better shoulder and chest retention, less flatness in the arms, and a smaller chance of landing at 80-82 kg but still looking soft.
            </p>
            <div className="mt-4 space-y-3">
              {LOOK_MILESTONES.map((milestone) => {
                const reached = currentWeight <= milestone.weight;
                return (
                  <div key={milestone.weight} className="rounded-lg bg-bg-primary/40 p-3 border border-bg-tertiary/30">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-text-primary">{milestone.title}</div>
                      <span className={`text-xs font-medium ${reached ? 'text-accent-green' : 'text-accent-blue'}`}>
                        {reached ? `Reached by ${milestone.weight} kg` : `Around ${milestone.weight} kg`}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1.5">{milestone.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {summary.etaTargets.map((target) => (
              <div key={target.weight} className="rounded-lg bg-bg-tertiary/20 p-3 border border-bg-tertiary/40">
                <div className="text-xs text-text-muted">{target.weight} kg ETA</div>
                <div className="text-base font-semibold text-text-primary mt-1">
                  {target.date ? formatDate(target.date.toISOString().split('T')[0]) : '--'}
                </div>
                <div className="text-[11px] text-text-muted mt-1">Using the 150g+ protein lane</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl bg-accent-blue/10 border border-accent-blue/20 p-4">
            <div className="text-sm font-semibold text-text-primary">Current read</div>
            <p className="text-sm text-text-secondary mt-2">
              The latest {summary.latestWeighin?.type === 'spot-check' ? 'unofficial' : 'official'} checkpoint says the cut is still moving. The next clean Monday weigh-in matters more than any single post-gym number, but the trend only gets stronger if the next 14 days average out at 150g+ protein.
            </p>
            <div className="mt-3 text-xs text-text-muted">
              Protein hit days in the last 14 logs: {summary.proteinHitDays}/{Math.max(1, daily.slice(-14).filter(entry => entry.protein !== null).length)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}