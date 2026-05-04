import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseMetrics } from './parsers/parseMetrics.js';
import { parseBrainState } from './parsers/parseBrainState.js';
import { parseProtocol } from './parsers/parseProtocol.js';
import { parseProgress } from './parsers/parseProgress.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COACH_DIR = path.join(__dirname, '../../.coach');
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

function main() {
  console.log('Parsing .coach files...\n');
  ensureDir(OUTPUT_DIR);
  
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
    const daily = progress.map(p => ({
      date: p.date,
      day: p.day,
      dayType: p.dayType,
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
