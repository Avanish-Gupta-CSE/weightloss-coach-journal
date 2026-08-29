import { format, parseISO, differenceInDays } from 'date-fns';

export const formatWeight = (weight) => {
  if (weight === null || weight === undefined) return '--';
  return `${weight.toFixed(2)} kg`;
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '--';
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
};

export const formatShortDate = (dateStr) => {
  if (!dateStr) return '--';
  try {
    return format(parseISO(dateStr), 'MMM d');
  } catch {
    return dateStr;
  }
};

export const formatDayNumber = (day) => {
  return `Day ${day}`;
};

export const formatDuration = (minutes) => {
  if (!minutes) return '0 min';
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};

export const formatNumber = (num, decimals = 0) => {
  if (num === null || num === undefined) return '--';
  return num.toFixed(decimals);
};

export const daysSince = (dateStr) => {
  if (!dateStr) return 0;
  try {
    return differenceInDays(new Date(), parseISO(dateStr));
  } catch {
    return 0;
  }
};

export const getCurrentPhase = (phases, startDate) => {
  const start = parseISO(startDate);
  const now = new Date();
  const daysElapsed = differenceInDays(now, start);
  const weeksElapsed = Math.floor(daysElapsed / 7) + 1;
  
  return phases.find(p => {
    const [startW, endW] = p.weeks.split('-').map(w => parseInt(w.replace('+', '')));
    if (p.weeks.includes('+')) return weeksElapsed >= startW;
    return weeksElapsed >= startW && weeksElapsed <= endW;
  }) || phases[phases.length - 1];
};
