import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseMetrics } from './parsers/parseMetrics.js';
import { parseBrainState } from './parsers/parseBrainState.js';
import { parseProtocol } from './parsers/parseProtocol.js';
import { parseProgress } from './parsers/parseProgress.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_COACH_DIR = path.resolve(__dirname, '../../.coach');
const COACH_DIR = process.env.COACH_DIR ? path.resolve(process.env.COACH_DIR) : DEFAULT_COACH_DIR;
const OUTPUT_DIR = path.join(__dirname, '../src/data/generated');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeJSON(filename, data) {
  const filepath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`✓ Generated: ${filename} (${Array.isArray(data) ? data.length + ' items' : Object.keys(data).length + ' keys'})`);
}

function hasCoachFiles(dir) {
  return ['Metrics.md', 'BrainState.md', 'Protocol.md', 'Progress.md'].every(file =>
    fs.existsSync(path.join(dir, file))
  );
}

function mergeDailyEntries(entries) {
  const byDay = new Map();

  entries.forEach(entry => {
    if (entry.day === null || entry.day === undefined) return;

    const previous = byDay.get(entry.day) || {};
    byDay.set(entry.day, {
      ...previous,
      date: entry.date || previous.date || null,
      day: entry.day,
      dayType: entry.dayType || previous.dayType || '',
      meals: {
        ...(previous.meals || {}),
        ...(entry.meals || {}),
      },
      protein: entry.protein ?? previous.protein ?? null,
      calories: entry.calories ?? previous.calories ?? null,
      workout: Boolean(previous.workout || entry.workout),
      workoutType: entry.workoutType || entry.workoutDetails || previous.workoutType || previous.workoutDetails || '',
      workoutDetails: entry.workoutDetails || previous.workoutDetails || '',
      walkingPad: Boolean(previous.walkingPad || entry.walkingPad),
      walkingPadMinutes: Math.max(previous.walkingPadMinutes || 0, entry.walkingPadMinutes || 0),
      water: entry.water ?? previous.water ?? null,
      sleep: entry.sleep || previous.sleep || null,
      cravings: Boolean(previous.cravings || entry.cravings),
      mood: entry.mood ?? previous.mood ?? null,
      notes: entry.notes || previous.notes || '',
    });
  });

  return Array.from(byDay.values()).sort((left, right) => left.day - right.day);
}

function main() {
  console.log(`Parsing .coach files from ${COACH_DIR}...\n`);
  ensureDir(OUTPUT_DIR);

  if (!hasCoachFiles(COACH_DIR)) {
    console.warn(`! No .coach brain found at ${COACH_DIR}. Keeping the existing generated JSON.`);
    return;
  }
  
  // Parse Metrics
  try {
    const metrics = parseMetrics(path.join(COACH_DIR, 'Metrics.md'));
    writeJSON('metrics.json', metrics);
  } catch (err) {
    console.error('✗ Failed to parse Metrics.md:', err.message);
  }
  
  // Parse BrainState
  try {
    const brainstate = parseBrainState(path.join(COACH_DIR, 'BrainState.md'));
    writeJSON('brainstate.json', brainstate);
  } catch (err) {
    console.error('✗ Failed to parse BrainState.md:', err.message);
  }
  
  // Parse Protocol
  try {
    const protocol = parseProtocol(path.join(COACH_DIR, 'Protocol.md'));
    writeJSON('protocol.json', protocol);
  } catch (err) {
    console.error('✗ Failed to parse Protocol.md:', err.message);
  }
  
  // Parse Progress
  try {
    const progress = parseProgress(path.join(COACH_DIR, 'Progress.md'));
    writeJSON('progress.json', progress);
    
    // Also generate sessions from progress
    const sessions = extractSessions(progress);
    writeJSON('sessions.json', sessions);
    
    // Generate daily summary from progress
    const daily = mergeDailyEntries(progress).map(p => ({
      date: p.date,
      day: p.day,
      dayType: p.dayType,
      meals: p.meals || {},
      protein: p.protein,
      calories: p.calories,
      workout: p.workout,
      workoutType: p.workoutType || p.workoutDetails || '',
      walkingPad: p.walkingPad,
      walkingPadMinutes: p.walkingPadMinutes,
      water: p.water,
      sleep: p.sleep,
      cravings: p.cravings,
      mood: p.mood,
      notes: p.notes,
    }));
    writeJSON('daily.json', daily);
    
  } catch (err) {
    console.error('✗ Failed to parse Progress.md:', err.message);
  }
  
  console.log('\nDone! Output written to src/data/generated/');
}

function extractSessions(progress) {
  const sessions = [];
  let sessionNum = 0;
  
  progress.forEach(day => {
    if (day.workout && day.workoutDetails) {
      sessionNum++;
      sessions.push({
        sessionNumber: sessionNum,
        date: day.date,
        day: day.day,
        type: day.workoutDetails.includes('Upper') ? 'Upper Body' :
              day.workoutDetails.includes('Lower') ? 'Lower Body' :
              day.workoutDetails.includes('Full') ? 'Full Body' : 'Workout',
        details: day.workoutDetails,
        exercises: [],
        notes: day.notes,
      });
    }
  });
  
  return sessions;
}

main();
