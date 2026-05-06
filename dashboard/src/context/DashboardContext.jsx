import { createContext, useContext, useMemo } from 'react';

// Try to load generated data, fall back to manual data if not available
function loadData(filename, fallbackFilename = null) {
  try {
    return import(/* @vite-ignore */ `../data/generated/${filename}`);
  } catch {
    if (fallbackFilename) {
      try {
        return import(/* @vite-ignore */ `../data/${fallbackFilename}`);
      } catch {
        return Promise.resolve({ default: null });
      }
    }
    return Promise.resolve({ default: null });
  }
}

// Import all data
import metrics from '../data/generated/metrics.json';
import brainstate from '../data/generated/brainstate.json';
import protocol from '../data/generated/protocol.json';
import progress from '../data/generated/progress.json';
import dailyGenerated from '../data/generated/daily.json';
import dailyFallback from '../data/daily.json';
import sessionsFallback from '../data/sessions.json';
import weighinsFallback from '../data/weighins.json';

function mergeDailyEntry(existing = {}, incoming = {}) {
  return {
    ...existing,
    ...incoming,
    date: incoming.date || existing.date || null,
    day: incoming.day ?? existing.day ?? null,
    dayType: incoming.dayType || existing.dayType || '',
    meals: {
      ...(existing.meals || {}),
      ...(incoming.meals || {}),
    },
    protein: incoming.protein ?? existing.protein ?? null,
    calories: incoming.calories ?? existing.calories ?? null,
    workout: Boolean(existing.workout || incoming.workout),
    workoutType: incoming.workoutType || existing.workoutType || '',
    walkingPad: Boolean(existing.walkingPad || incoming.walkingPad),
    walkingPadMinutes: Math.max(existing.walkingPadMinutes || 0, incoming.walkingPadMinutes || 0),
    water: incoming.water ?? existing.water ?? null,
    sleep: incoming.sleep || existing.sleep || null,
    cravings: Boolean(existing.cravings || incoming.cravings),
    mood: incoming.mood ?? existing.mood ?? null,
    notes: incoming.notes || existing.notes || '',
  };
}

function buildDaily(primaryEntries = [], fallbackEntries = []) {
  const byDay = new Map();

  [...fallbackEntries, ...primaryEntries].forEach(entry => {
    if (entry.day === null || entry.day === undefined) return;
    const current = byDay.get(entry.day);
    byDay.set(entry.day, mergeDailyEntry(current, entry));
  });

  return Array.from(byDay.values()).sort((left, right) => left.day - right.day);
}

const daily = buildDaily(dailyGenerated, dailyFallback);

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const value = useMemo(() => {
    const currentDay = daily.length > 0 ? daily[daily.length - 1].day : 0;
    const weighins = metrics.weighins?.length ? metrics.weighins : weighinsFallback;
    const currentWeight = weighins.filter(w => w.weight).slice(-1)[0]?.weight || metrics.baseline?.weight || 91.45;
    const sessions = sessionsFallback; // Use manual sessions for now (parsed only has 3)
    
    // Get current phase
    const weeks = Math.floor(currentDay / 7) + 1;
    const currentPhase = protocol.phases?.find(p => {
      const [startW, endW] = (p.weeks || '').split('-').map(w => parseInt(w?.replace('+', '')));
      if ((p.weeks || '').includes('+')) return weeks >= startW;
      return weeks >= startW && weeks <= endW;
    });
    
    return {
      // Core data
      metrics,
      brainstate,
      protocol,
      progress,
      daily,
      weighins,
      sessions,
      
      // Computed values
      currentDay,
      currentWeight,
      currentPhase,
      
      // Helpers
      baseline: metrics.baseline,
      macroTargets: metrics.macros,
      phases: protocol.phases,
      milestones: metrics.timeline,
    };
  }, []);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
}
