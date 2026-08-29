import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseTable, parseKeyValueTable } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function parseBrainState(filePath) {
  const text = fs.readFileSync(filePath, 'utf-8');
  
  // Parse Snapshot table
  const snapshotRows = parseTable(text, 'Snapshot');
  const snapshot = {};
  snapshotRows.forEach(row => {
    const key = row.Field || '';
    const value = row.Value || '';
    if (key && value) {
      snapshot[key] = value;
    }
  });
  
  // Parse Kitchen Stock table
  const kitchenRows = parseTable(text, 'Kitchen Stock');
  const kitchenStock = kitchenRows.map(row => ({
    item: row.Item || '',
    status: row.Status || '',
    quantity: row['Approx Qty'] || '',
    notes: row.Notes || '',
  }));
  
  // Parse Standing Rules
  const ruleRows = parseTable(text, 'Standing Rule Overrides');
  const rules = ruleRows.map(row => ({
    code: row['#'] || row.code || '',
    rule: row.Rule || '',
    details: row.Details || '',
    added: row.Added || '',
  }));
  
  // Parse Pending Decisions
  const pendingRows = parseTable(text, 'Pending Decisions');
  const pending = pendingRows.map(row => ({
    item: row.Item || '',
    details: row.Details || '',
    priority: row.Priority || '',
  }));
  
  // Parse Medical Log
  const medicalRows = parseTable(text, 'Medical Log');
  const medicalLog = medicalRows.map(row => ({
    date: row.Date || '',
    event: row.Event || '',
    status: row['Current Status'] || '',
  }));
  
  return {
    snapshot,
    kitchenStock,
    rules,
    pending,
    medicalLog,
  };
}

// Test
if (import.meta.url === `file://${process.argv[1]}`) {
  const result = parseBrainState(path.join(__dirname, '../../../.coach/BrainState.md'));
  console.log('Parsed BrainState:');
  console.log('Snapshot keys:', Object.keys(result.snapshot));
  console.log('Kitchen items:', result.kitchenStock.length);
  console.log('Rules:', result.rules.length);
  console.log('Pending:', result.pending.length);
  console.log('Medical events:', result.medicalLog.length);
}
