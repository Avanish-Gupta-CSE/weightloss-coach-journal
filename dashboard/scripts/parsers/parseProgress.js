import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const headerMatch = text.match(/###\s+(\d{4}-\d{2}-\d{2})\s*—?\s*Day\s+(\d+)(?:\s*\(([^)]+)\))?/);
  
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
  const day = parseInt(headerMatch[2]);
  const dayType = (headerMatch[3] || '').trim();
  
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
  
  // Extract protein and calories from various patterns
  // Pattern 1: "~X kcal / ~Xg protein"
  const pcMatch = text.match(/~?([\d,]+)\s*kcal\s*\/\s*~?([\d]+)g\s*protein/);
  if (pcMatch) {
    entry.calories = parseInt(pcMatch[1].replace(',', ''));
    entry.protein = parseInt(pcMatch[2]);
  }
  
  // Pattern 2: "X kcal / Xg protein" (without tildes)
  if (!entry.protein) {
    const pcMatch2 = text.match(/(\d{3,4})\s*kcal\s*\/\s*(\d{2,3})g\s*protein/);
    if (pcMatch2) {
      entry.calories = parseInt(pcMatch2[1]);
      entry.protein = parseInt(pcMatch2[2]);
    }
  }
  
  // Pattern 3: From intake tables
  if (!entry.protein) {
    const tableMatch = text.match(/verdict.*?\|\s*~?([\d,]+)\s*kcal\s*\/\s*~?([\d]+)g\s*protein/i);
    if (tableMatch) {
      entry.calories = parseInt(tableMatch[1].replace(',', ''));
      entry.protein = parseInt(tableMatch[2]);
    }
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
