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
import dailyFallback from '../data/daily.json';
import sessionsFallback from '../data/sessions.json';
import weighinsFallback from '../data/weighins.json';

// Merge progress with fallback daily for better protein/calorie data
const daily = progress.map(p => {
  // Find matching fallback entry by day
  const fallback = dailyFallback.find(d => d.day === p.day);
  return {
    ...p,
    // Use fallback protein/calories if parsed is null
    protein: p.protein ?? fallback?.protein ?? null,
    calories: p.calories ?? fallback?.calories ?? null,
    workout: p.workout || fallback?.workout || false,
    walkingPad: p.walkingPad || fallback?.walkingPad || false,
  };
});

// Also add fallback entries that aren't in progress
const missingDays = dailyFallback.filter(d => !daily.find(p => p.day === d.day));
missingDays.forEach(d => daily.push({
  date: d.date,
  day: d.day,
  dayType: d.dayType || '',
  protein: d.protein,
  calories: d.calories,
  workout: d.workout,
  workoutType: d.workoutType || '',
  walkingPad: d.walkingPad,
  walkingPadMinutes: d.walkingPadMinutes || 0,
  water: d.water,
  sleep: d.sleep,
  cravings: d.cravings,
  mood: d.mood,
  notes: d.notes || '',
}));

// Sort by day
daily.sort((a, b) => a.day - b.day);

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const value = useMemo(() => {
    const currentDay = daily.length > 0 ? daily[daily.length - 1].day : 0;
    const currentWeight = metrics.weighins?.filter(w => w.weight)?.pop()?.weight || metrics.baseline?.weight || 91.45;
    const weighins = metrics.weighins || weighinsFallback;
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
