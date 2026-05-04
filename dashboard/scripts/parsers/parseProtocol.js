import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseTable, parseKeyValueTable } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function parseProtocol(filePath) {
  const text = fs.readFileSync(filePath, 'utf-8');
  
  // Parse identity info from bullet points
  const identity = {};
  const nameMatch = text.match(/\*\*Name:\*\*\s*(.+)/);
  const missionMatch = text.match(/\*\*Mission:\*\*\s*(.+)/);
  const startDateMatch = text.match(/\*\*Start Date:\*\*\s*(.+)/);
  const targetDateMatch = text.match(/\*\*Target Date:\*\*\s*(.+)/);
  
  if (nameMatch) identity.name = nameMatch[1].trim();
  if (missionMatch) identity.mission = missionMatch[1].trim();
  if (startDateMatch) identity.startDate = startDateMatch[1].trim();
  if (targetDateMatch) identity.targetDate = targetDateMatch[1].trim();
  
  // Parse Targets table
  const targetRows = parseTable(text, 'Targets');
  const targets = {};
  targetRows.forEach(row => {
    const metric = row.Metric || '';
    const value = row.Value || '';
    if (metric && value) {
      targets[metric] = value;
    }
  });
  
  // Parse Phase Plan table
  const phaseRows = parseTable(text, 'Phase Plan');
  const phases = phaseRows.map(row => ({
    phase: row.Phase || '',
    weeks: row.Weeks || '',
    focus: row.Focus || '',
    calorieTarget: row['Calorie Target'] || '',
  }));
  
  // Parse Non-Negotiable Rules (numbered list)
  const rules = [];
  const rulesMatch = text.match(/## Non-Negotiable Rules([\s\S]+?)(?=##|$)/);
  if (rulesMatch) {
    const rulesText = rulesMatch[1];
    const ruleLines = rulesText.split('\n');
    ruleLines.forEach(line => {
      const match = line.match(/^\d+\.\s+\*\*(.+?)\*\*\s*\.?\s*(.*)/);
      if (match) {
        rules.push({
          title: match[1].trim(),
          description: match[2].trim(),
        });
      }
    });
  }
  
  return {
    identity,
    targets,
    phases,
    rules,
  };
}

// Test
if (import.meta.url === `file://${process.argv[1]}`) {
  const result = parseProtocol(path.join(__dirname, '../../../.coach/Protocol.md'));
  console.log('Parsed Protocol:');
  console.log('Identity:', result.identity);
  console.log('Targets:', Object.keys(result.targets));
  console.log('Phases:', result.phases.length);
  console.log('Rules:', result.rules.length);
  console.log('First rule:', result.rules[0]);
}
