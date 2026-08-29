import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseTable, parseKeyValueTable } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseWeightValue(value = '') {
  const match = String(value).match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

function getWeighinType(...parts) {
  const haystack = parts.join(' ').toLowerCase();
  if (haystack.includes('skipped') || haystack.includes('missed')) return 'skipped';
  if (haystack.includes('spot check') || haystack.includes('spot-check') || haystack.includes('unofficial')) {
    return 'spot-check';
  }
  return 'official';
}

export function parseMetrics(filePath) {
  const text = fs.readFileSync(filePath, 'utf-8');
  
  // Parse baseline measurements
  const baselineTable = parseKeyValueTable(text, 'Baseline Measurements');
  
  // Parse BMI table
  const bmiRows = parseTable(text, 'BMI');
  const bmi = bmiRows.map(row => ({
    state: row.State || '',
    calculation: row.Calculation || '',
    bmi: row.BMI || '',
    category: row.Category || '',
  }));
  
  // Parse BMR
  let bmrStandard = 1840;
  let bmrAdjusted = 1700;
  const bmrMatch = text.match(/=\s*\*\*(\d[\d,\.]+)\s*kcal/);
  if (bmrMatch) {
    bmrStandard = parseFloat(bmrMatch[1].replace(',', ''));
  }
  const adjustedMatch = text.match(/Working estimate\s*\|\s*\*\*~?([\d,\.]+)\s*kcal/);
  if (adjustedMatch) {
    bmrAdjusted = parseFloat(adjustedMatch[1].replace(',', ''));
  }
  
  // Parse TDEE table
  const tdeeRows = parseTable(text, 'TDEE');
  const tdee = tdeeRows.map(row => ({
    activityLevel: row['Activity Level'] || '',
    multiplier: row.Multiplier || '',
    tdee: row.TDEE || '',
  }));
  
  // Parse macro targets
  const macroRows = parseTable(text, 'Macro Targets');
  const macros = {};
  macroRows.forEach(row => {
    const macro = row.Macro || '';
    if (macro && macro !== 'Total') {
      macros[macro.toLowerCase()] = {
        grams: parseInt(row.Grams) || 0,
        calories: parseInt(row.Calories) || 0,
        percentage: parseInt(row['% of Total']) || 0,
      };
    }
  });
  
  // Parse timeline projection
  const timelineRows = parseTable(text, 'Timeline Projection');
  const timeline = timelineRows.map(row => ({
    milestone: row.Milestone || '',
    weight: parseFloat(row.Weight) || 0,
    weeks: row.Weeks || '',
    approxDate: row['Approx Date'] || '',
  }));
  
  // Parse weekly weigh-in log
  const weighinRows = parseTable(text, 'Weekly Weigh-In Log');
  const weeklyWeighins = weighinRows.map(row => {
    const week = parseInt(row.Week) || 0;
    const date = row.Date || '';
    const weightStr = row['Weight (kg)'] || row.Weight || '';
    const notes = row.Notes || '';
    const weight = parseWeightValue(weightStr);
    const type = getWeighinType(weightStr, notes);
    
    return {
      week,
      date,
      weight,
      type,
      change: row['Change (kg)'] || '',
      cumulative: row['Cumulative Loss'] || '',
      notes,
    };
  });

  const spotCheckRows = parseTable(text, 'Unofficial Spot Checks');
  const unofficialSpotChecks = spotCheckRows.map(row => {
    const context = row.Context || '';
    const coachRead = row['Coach read'] || row['Coach Read'] || '';
    return {
      week: null,
      date: row.Date || '',
      weight: parseWeightValue(row['Weight (kg)'] || row.Weight || ''),
      type: 'spot-check',
      change: '',
      cumulative: '',
      notes: [context, coachRead].filter(Boolean).join(' | '),
    };
  });

  const weighins = [...weeklyWeighins, ...unofficialSpotChecks]
    .filter(entry => entry.date)
    .sort((left, right) => new Date(left.date) - new Date(right.date));
  
  return {
    baseline: {
      weight: parseFloat(baselineTable.Weight) || 91.45,
      height: parseInt(baselineTable.Height) || 168,
      age: parseInt(baselineTable.Age) || 26,
      sex: (baselineTable.Sex || 'male').toLowerCase(),
    },
    bmi,
    bmr: {
      standard: bmrStandard,
      adjusted: bmrAdjusted,
    },
    tdee,
    macros,
    timeline,
    weighins,
  };
}

// Test if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const result = parseMetrics(path.join(__dirname, '../../../.coach/Metrics.md'));
  console.log('Parsed Metrics:');
  console.log('Baseline:', result.baseline);
  console.log('Weigh-ins:', result.weighins.length, 'entries');
  console.log('First weighin:', result.weighins[0]);
  console.log('Timeline milestones:', result.timeline.length);
}
