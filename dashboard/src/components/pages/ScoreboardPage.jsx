import { useMemo, useState } from 'react';
import { ListChecks } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { useDashboard } from '../../context/DashboardContext';
import { formatShortDate, formatDuration } from '../../utils/formatters';
import { SCOREBOARD_TARGETS } from '../../utils/calculations';

const ranges = [
  { key: 7, label: '7 Days' },
  { key: 14, label: '14 Days' },
  { key: 30, label: '30 Days' },
];

function getProteinBadge(protein, proteinFloorG) {
  if (protein === null || protein === undefined) return <Badge variant="gray">—</Badge>;
  if (protein >= proteinFloorG) return <Badge variant="green">Hit</Badge>;
  if (protein >= 120) return <Badge variant="yellow">Close</Badge>;
  return <Badge variant="red">Miss</Badge>;
}

function getCaloriesBadge(calories, caloriesMin, caloriesMax) {
  if (calories === null || calories === undefined) return <Badge variant="gray">—</Badge>;
  if (calories >= caloriesMin && calories <= caloriesMax) return <Badge variant="green">In band</Badge>;
  return <Badge variant="red">Out</Badge>;
}

function getWalkBadge(minutes, walkingMinutesMin) {
  const m = minutes ?? 0;
  if (m <= 0) return <Badge variant="red">Miss</Badge>;
  if (m >= walkingMinutesMin) return <Badge variant="green">Hit</Badge>;
  return <Badge variant="yellow">Close</Badge>;
}

function isFullHit(day, targets) {
  const proteinOk = (day.protein ?? 0) >= targets.proteinFloorG;
  const caloriesOk =
    day.calories !== null &&
    day.calories !== undefined &&
    day.calories >= targets.caloriesMin &&
    day.calories <= targets.caloriesMax;
  const walkOk = (day.walkingPadMinutes ?? 0) >= targets.walkingMinutesMin;
  return proteinOk && caloriesOk && walkOk;
}

export default function ScoreboardPage() {
  const { daily } = useDashboard();
  const [range, setRange] = useState(14);

  const targets = SCOREBOARD_TARGETS;

  const periodDays = useMemo(() => {
    return daily.slice(-range).reverse();
  }, [daily, range]);

  const summary = useMemo(() => {
    const total = periodDays.length || 1;
    const proteinHit = periodDays.filter(d => (d.protein ?? 0) >= targets.proteinFloorG).length;
    const caloriesHit = periodDays.filter(d =>
      d.calories !== null && d.calories !== undefined && d.calories >= targets.caloriesMin && d.calories <= targets.caloriesMax
    ).length;
    const walkHit = periodDays.filter(d => (d.walkingPadMinutes ?? 0) >= targets.walkingMinutesMin).length;
    const fullHit = periodDays.filter(d => isFullHit(d, targets)).length;

    const streak = (() => {
      let current = 0;
      for (let i = 0; i < daily.length; i += 1) {
        const d = daily[daily.length - 1 - i];
        if (!isFullHit(d, targets)) break;
        current += 1;
      }
      return current;
    })();

    return {
      total,
      proteinHit,
      caloriesHit,
      walkHit,
      fullHit,
      streak,
    };
  }, [daily, periodDays, targets]);

  return (
    <div className="space-y-6">
      <Card title="Scoreboard commitments" icon={ListChecks}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-bg-tertiary/20 rounded-lg">
            <div className="text-text-muted text-xs">Protein floor</div>
            <div className="text-text-primary font-semibold">{targets.proteinFloorG}g/day</div>
          </div>
          <div className="p-3 bg-bg-tertiary/20 rounded-lg">
            <div className="text-text-muted text-xs">Calories band</div>
            <div className="text-text-primary font-semibold">
              {targets.caloriesMin}–{targets.caloriesMax}
            </div>
          </div>
          <div className="p-3 bg-bg-tertiary/20 rounded-lg">
            <div className="text-text-muted text-xs">Walking</div>
            <div className="text-text-primary font-semibold">{targets.walkingMinutesMin}+ min/day</div>
            <div className="text-text-muted text-[11px] mt-0.5">30 min @ 4–5 kmph or 45 min @ 3–4 kmph</div>
          </div>
        </div>
      </Card>

      {/* Range selector */}
      <div className="flex gap-2">
        {ranges.map(r => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              range === r.key ? 'bg-accent-blue/10 text-accent-blue' : 'bg-bg-secondary text-text-secondary'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-bg-secondary rounded-lg border border-bg-tertiary/50 p-4">
          <div className="text-text-muted text-xs mb-1">Protein hit</div>
          <div className="text-2xl font-bold text-accent-green">
            {summary.proteinHit}/{summary.total}
          </div>
        </div>
        <div className="bg-bg-secondary rounded-lg border border-bg-tertiary/50 p-4">
          <div className="text-text-muted text-xs mb-1">Calories in band</div>
          <div className="text-2xl font-bold text-accent-yellow">
            {summary.caloriesHit}/{summary.total}
          </div>
        </div>
        <div className="bg-bg-secondary rounded-lg border border-bg-tertiary/50 p-4">
          <div className="text-text-muted text-xs mb-1">Walk hit</div>
          <div className="text-2xl font-bold text-accent-orange">
            {summary.walkHit}/{summary.total}
          </div>
        </div>
        <div className="bg-bg-secondary rounded-lg border border-bg-tertiary/50 p-4">
          <div className="text-text-muted text-xs mb-1">Full hit days</div>
          <div className="text-2xl font-bold text-text-primary">
            {summary.fullHit}/{summary.total}
          </div>
        </div>
        <div className="bg-bg-secondary rounded-lg border border-bg-tertiary/50 p-4">
          <div className="text-text-muted text-xs mb-1">Current streak</div>
          <div className="text-2xl font-bold text-accent-blue">{summary.streak}</div>
        </div>
      </div>

      {/* Table */}
      <Card title="Daily scorecard">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-text-muted border-b border-bg-tertiary/50">
                <th className="py-2 pr-4 font-medium">Day</th>
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium">Protein</th>
                <th className="py-2 pr-4 font-medium">Calories</th>
                <th className="py-2 pr-4 font-medium">Walk</th>
                <th className="py-2 pr-4 font-medium">All 3</th>
              </tr>
            </thead>
            <tbody>
              {periodDays.map(d => {
                const full = isFullHit(d, targets);
                return (
                  <tr key={d.day} className="border-b border-bg-tertiary/30">
                    <td className="py-2 pr-4 text-text-primary font-medium">Day {d.day}</td>
                    <td className="py-2 pr-4 text-text-secondary">{formatShortDate(d.date)}</td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-text-secondary w-14">{d.protein ?? '—'}{d.protein !== null && d.protein !== undefined ? 'g' : ''}</span>
                        {getProteinBadge(d.protein, targets.proteinFloorG)}
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-text-secondary w-16">{d.calories ?? '—'}{d.calories !== null && d.calories !== undefined ? ' kcal' : ''}</span>
                        {getCaloriesBadge(d.calories, targets.caloriesMin, targets.caloriesMax)}
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-text-secondary w-16">{formatDuration(d.walkingPadMinutes ?? 0)}</span>
                        {getWalkBadge(d.walkingPadMinutes, targets.walkingMinutesMin)}
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      {full ? <Badge variant="green">Hit</Badge> : <Badge variant="gray">—</Badge>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

