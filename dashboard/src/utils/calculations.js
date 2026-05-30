export const calculateBMI = (weight, height) => {
  const heightM = height / 100;
  return (weight / (heightM * heightM)).toFixed(1);
};

export const SCOREBOARD_TARGETS = {
  proteinFloorG: 150,
  caloriesMin: 1800,
  caloriesMax: 1900,
  walkingMinutesMin: 30,
};

export const calculateBMR = (weight, height, age, sex) => {
  // Mifflin-St Jeor
  let bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  if (sex === 'female') bmr -= 166;
  // Hypothyroid adjustment (~5%)
  return Math.round(bmr * 0.95);
};

export const calculateTDEE = (bmr, activityLevel = 'moderate') => {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.55));
};

export const calculateWeeklyRate = (weighins) => {
  const valid = weighins.filter(w => w.weight && w.type === 'official');
  if (valid.length < 2) return 0;
  const first = valid[0];
  const last = valid[valid.length - 1];
  const daysDiff = (new Date(last.date) - new Date(first.date)) / (1000 * 60 * 60 * 24);
  const weeks = daysDiff / 7;
  return weeks > 0 ? ((first.weight - last.weight) / weeks).toFixed(2) : 0;
};

export const calculateDaysRemaining = (currentWeight, targetWeight, rate) => {
  const kgRemaining = currentWeight - targetWeight;
  if (kgRemaining <= 0 || rate <= 0) return 0;
  return Math.ceil(kgRemaining / rate * 7);
};

export const calculateComplianceScore = (daily) => {
  if (!daily.length) return 0;
  const last7 = daily.slice(-7);

  const { proteinFloorG, caloriesMin, caloriesMax, walkingMinutesMin } = SCOREBOARD_TARGETS;
  const maxPoints = last7.length * 3;
  if (maxPoints === 0) return 0;

  const points = last7.reduce((acc, day) => {
    const proteinOk = (day.protein ?? 0) >= proteinFloorG;
    const caloriesOk = day.calories !== null && day.calories !== undefined && day.calories >= caloriesMin && day.calories <= caloriesMax;
    const walkingOk = (day.walkingPadMinutes ?? 0) >= walkingMinutesMin;
    return acc + (proteinOk ? 1 : 0) + (caloriesOk ? 1 : 0) + (walkingOk ? 1 : 0);
  }, 0);

  return Math.round((points / maxPoints) * 100);
};

export const getProteinColor = (protein) => {
  if (protein >= 150) return '#22c55e';
  if (protein >= 120) return '#eab308';
  return '#ef4444';
};

export const getProteinStatus = (protein) => {
  if (protein >= 150) return 'good';
  if (protein >= 120) return 'warning';
  return 'danger';
};
