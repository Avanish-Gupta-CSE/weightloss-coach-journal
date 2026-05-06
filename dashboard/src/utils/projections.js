export const linearProjection = (weighins, targetWeight, targetRate = 0.65) => {
  const valid = weighins.filter(w => w.weight && (w.type === 'official' || w.type === 'spot-check'));
  if (valid.length === 0) return [];
  
  const last = valid[valid.length - 1];
  const lastDate = new Date(last.date);
  const lastWeight = last.weight;
  
  const projections = [];
  let currentWeight = lastWeight;
  let currentDate = new Date(lastDate);
  
  while (currentWeight > targetWeight) {
    currentDate.setDate(currentDate.getDate() + 7);
    currentWeight -= targetRate;
    if (currentWeight < targetWeight) currentWeight = targetWeight;
    
    projections.push({
      date: currentDate.toISOString().split('T')[0],
      weight: parseFloat(currentWeight.toFixed(2)),
      type: 'projection'
    });
  }
  
  return projections;
};

export const movingAverage = (data, window = 7) => {
  if (data.length < window) return data;
  
  return data.map((item, index) => {
    if (index < window - 1) return { ...item, avg: item.protein };
    const slice = data.slice(index - window + 1, index + 1);
    const avg = slice.reduce((sum, d) => sum + (d.protein || 0), 0) / window;
    return { ...item, avg: Math.round(avg) };
  });
};

export const calculateTrendLine = (weighins) => {
  const valid = weighins.filter(w => w.weight);
  if (valid.length < 2) return [];
  
  const n = valid.length;
  const x = valid.map((_, i) => i);
  const y = valid.map(w => w.weight);
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return valid.map((w, i) => ({
    date: w.date,
    trend: parseFloat((slope * i + intercept).toFixed(2))
  }));
};
