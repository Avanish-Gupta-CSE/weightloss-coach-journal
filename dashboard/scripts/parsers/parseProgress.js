import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseMacroNumber(value) {
  return parseInt(value.replace(/,/g, ''), 10);
}

function toMacroTotals(match) {
  return {
    calories: parseMacroNumber(match[1]),
    protein: parseInt(match[2], 10),
  };
}

function findBestMacroMatch(text, day) {
  const matches = Array.from(text.matchAll(/~?([\d,]+)\s*kcal\s*\/\s*~?(\d+)g\s*protein/gi));

  if (matches.length === 0) {
    return null;
  }

  let bestMatch = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  matches.forEach(match => {
    const index = match.index ?? 0;
    const context = text
      .slice(Math.max(0, index - 180), Math.min(text.length, index + match[0].length + 120))
      .toLowerCase();

    let score = 0;

    if (context.includes(`day ${day}`)) score += 20;
    if (context.includes('closing verdict')) score += 60;
    if (context.includes('closeout')) score += 55;
    if (context.includes('closed around')) score += 45;
    if (context.includes('final day estimate')) score += 40;
    if (context.includes('current day')) score += 25;
    if (context.includes('verdict')) score += 20;

    if (context.includes('projected')) score -= 35;
    if (context.includes('projected day-end')) score -= 35;
    if (context.includes('day-end')) score -= 30;
    if (context.includes('best close')) score -= 25;
    if (context.includes('acceptable:')) score -= 20;
    if (context.includes('wrong move')) score -= 25;
    if (context.includes('option |')) score -= 20;
    if (context.includes('practical serving')) score -= 30;
    if (context.includes('exam timing')) score -= 30;

    score += index / Math.max(text.length, 1);

    if (score >= bestScore) {
      bestScore = score;
      bestMatch = match;
    }
  });

  return bestMatch ? toMacroTotals(bestMatch) : null;
}

function extractMacroTotalsFromCumulativeTable(text) {
  const hasCumulativeHeader = /cumulative\s+kcal\s+vs/i.test(text) && /cum\.?\s*protein/i.test(text);
  if (!hasCumulativeHeader) return null;

  const matches = Array.from(text.matchAll(/\|\s*\*\*([\d,]+)\*\*\s*\|\s*\*\*([\d.]+)g\*\*\s*\|/g));
  if (matches.length === 0) return null;

  const last = matches[matches.length - 1];
  return {
    calories: parseMacroNumber(last[1]),
    protein: Math.round(parseFloat(last[2])),
  };
}

function extractMacroTotals(text, day) {
  const closeoutPatterns = [
    new RegExp(`Confirmed\\s+Day\\s+${day}\\s+closeout[^\\n]*?~?([\\d,]+)\\s*kcal\\s*\\/\\s*~?(\\d+)g\\s*protein`, 'i'),
    new RegExp(`True\\s+Day\\s+${day}\\s+closeout[^\\n]*?~?([\\d,]+)\\s*kcal\\s*\\/\\s*~?(\\d+)g\\s*protein`, 'i'),
    new RegExp(`(?:Revised\\s+)?Day\\s+${day}\\s+closing\\s+verdict[^\\n]*?~?([\\d,]+)\\s*kcal\\s*\\/\\s*~?(\\d+)g\\s*protein`, 'i'),
    new RegExp(`Current\\s+Day\\s+${day}\\s+read[^\\n]*?~?([\\d,]+)\\s*kcal\\s*\\/\\s*~?(\\d+)g\\s*protein`, 'i'),
    new RegExp(`Day\\s+${day}\\s+(?:current\\s+verdict|early\\s+verdict|updated\\s+estimate|estimated\\s+closeout|final\\s+estimate)[^\\n]*?~?([\\d,]+)\\s*kcal\\s*\\/\\s*~?(\\d+)g\\s*protein`, 'i'),
  ];

  for (const pattern of closeoutPatterns) {
    const match = text.match(pattern);
    if (match) {
      return toMacroTotals(match);
    }
  }

  const bestMatch = findBestMacroMatch(text, day);
  if (bestMatch) return bestMatch;

  const hasDayCloseKeyword = new RegExp(`Day\\s+${day}\\s+close`, 'i').test(text);
  if (!hasDayCloseKeyword) return null;

  return extractMacroTotalsFromCumulativeTable(text);
}

export function parseProgress(filePath) {
  const text = fs.readFileSync(filePath, 'utf-8');
  
  // Split by --- separators
  const blocks = text.split(/\n---\s*\n/);
  const entries = [];
  
  blocks.forEach(block => {
    const entry = parseBlock(block);
    if (entry && entry.day !== null) {
      entries.push(entry);
    }
  });
  
  // Sort by day number
  entries.sort((a, b) => a.day - b.day);
  
  return entries;
}

function parseBlock(text) {
  // Try to find date and day from header
  const headerMatch = text.match(/###\s+(\d{4}-\d{2}-\d{2})(?:\s*[-—]\s*Day\s+(\d+)|\s*\(Day\s+(\d+)\))(?:\s*[-—]\s*(.+))?/);
  
  if (!headerMatch) {
    // Try alternate format: "Day X" without date
    const altMatch = text.match(/###\s+(?:\d{4}-\d{2}-\d{2}\s*—\s*)?Day\s+(\d+)/);
    if (!altMatch) return null;
    
    return {
      date: null,
      day: parseInt(altMatch[1]),
      dayType: '',
      raw: text.slice(0, 300),
    };
  }
  
  const date = headerMatch[1];
  const day = parseInt(headerMatch[2] || headerMatch[3]);
  const dayType = (headerMatch[4] || '').trim();
  
  const entry = {
    date,
    day,
    dayType,
    weight: null,
    meals: {},
    workout: false,
    workoutType: '',
    workoutDetails: '',
    walkingPad: false,
    walkingPadMinutes: 0,
    water: null,
    sleep: null,
    cravings: false,
    cravingsDetails: '',
    mood: null,
    protein: null,
    calories: null,
    notes: '',
    raw: text.slice(0, 400),
  };
  
  // Extract weight
  const weightMatch = text.match(/\*\*Weight:\*\*\s*([\d\.]+)\s*kg/);
  if (weightMatch) entry.weight = parseFloat(weightMatch[1]);
  
  // Extract meals
  const mealPattern = /\*\*(?:Breakfast|Lunch|Dinner|Snack|Evening snack|Post-exam snack):\*\*\s*([^\n]+)/gi;
  let mealMatch;
  while ((mealMatch = mealPattern.exec(text)) !== null) {
    const mealLine = mealMatch[0];
    const mealType = mealLine.match(/\*\*(.+?)\*\*/)[1].toLowerCase().replace(/\s+/g, '_');
    const mealDesc = mealMatch[1].trim();
    entry.meals[mealType] = mealDesc;
  }
  
  // Extract workout
  const workoutMatch = text.match(/\*\*Workout:\*\*\s*([YN])/);
  if (workoutMatch) {
    entry.workout = workoutMatch[1] === 'Y';
  }
  
  // Extract workout details
  const workoutDetailMatch = text.match(/\*\*Workout:\*\*\s*[YN]\s*—?\s*(.+)/);
  if (workoutDetailMatch) {
    entry.workoutDetails = workoutDetailMatch[1].trim();
  }
  
  // Check for gym/session mentions if workout not explicitly set
  if (!entry.workout) {
    entry.workout = /\*\*Workout:\*\*\s*Y/.test(text) || 
                    /session\s+\d+/i.test(text) ||
                    /gym\s+(?:session|day|completed)/i.test(text);
  }
  
  // Extract walking pad
  const wpMatch = text.match(/\*\*Walking pad:\*\*\s*(\d+)\s*min/);
  if (wpMatch) {
    entry.walkingPad = parseInt(wpMatch[1]) > 0;
    entry.walkingPadMinutes = parseInt(wpMatch[1]);
  }
  
  // Extract water
  const waterMatch = text.match(/\*\*Water:\*\*\s*([\d\.]+)\s*L/);
  if (waterMatch) entry.water = parseFloat(waterMatch[1]);
  
  // Extract sleep
  const sleepMatch = text.match(/\*\*Sleep:\*\*\s*([\d\.–-]+)\s*hrs?/);
  if (sleepMatch) entry.sleep = sleepMatch[1];
  
  // Extract cravings
  const cravingMatch = text.match(/\*\*Cravings:\*\*\s*([YN])/);
  if (cravingMatch) {
    entry.cravings = cravingMatch[1] === 'Y';
  }
  
  // Extract mood
  const moodMatch = text.match(/\*\*Mood\/energy:\*\*\s*([\d\.]+)/);
  if (moodMatch) entry.mood = parseFloat(moodMatch[1]);
  
  const macroTotals = extractMacroTotals(text, day);
  if (macroTotals) {
    entry.calories = macroTotals.calories;
    entry.protein = macroTotals.protein;
  }
  
  // Extract notes
  const notesMatch = text.match(/\*\*Notes:\*\*\s*([^]+?)(?=\n\n|$)/);
  if (notesMatch) {
    entry.notes = notesMatch[1].trim().slice(0, 300);
  }
  
  return entry;
}

// Test
if (import.meta.url === `file://${process.argv[1]}`) {
  const entries = parseProgress(path.join(__dirname, '../../../.coach/Progress.md'));
  console.log('Parsed Progress:');
  console.log('Total entries:', entries.length);
  
  // Count entries with protein data
  const withProtein = entries.filter(e => e.protein !== null);
  console.log('Entries with protein:', withProtein.length);
  
  if (entries.length > 0) {
    console.log('\nFirst entry:', {
      date: entries[0].date,
      day: entries[0].day,
      dayType: entries[0].dayType.slice(0, 50),
      workout: entries[0].workout,
    });
    console.log('Last entry:', {
      date: entries[entries.length - 1].date,
      day: entries[entries.length - 1].day,
      protein: entries[entries.length - 1].protein,
      calories: entries[entries.length - 1].calories,
    });
  }
  
  // Show entries with protein
  if (withProtein.length > 0) {
    console.log('\nSample protein entry:', {
      day: withProtein[0].day,
      protein: withProtein[0].protein,
      calories: withProtein[0].calories,
    });
  }
}
