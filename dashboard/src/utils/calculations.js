export const calculateBMI = (weight, height) => {
  const heightM = height / 100;
  return (weight / (heightM * heightM)).toFixed(1);
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
  let score = 0;
  
  last7.forEach(day => {
    if (day.protein >= 150) score += 25;
    else if (day.protein >= 120) score += 15;
    else if (day.protein >= 100) score += 10;
    
    if (day.workout) score += 25;
    if (day.walkingPad) score += 15;
    if (day.calories && day.calories <= 2000) score += 10;
    else score += 5;
    
    if (day.water && day.water >= 2.5) score += 10;
    else score += 5;
  });
  
  return Math.round(score / last7.length);
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
