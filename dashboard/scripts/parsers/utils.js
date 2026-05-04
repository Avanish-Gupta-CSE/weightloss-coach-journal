import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Parse a markdown table into an array of objects
 */
export function parseTable(text, sectionHeader) {
  const lines = text.split('\n');
  let startIdx = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(sectionHeader)) {
      startIdx = i;
      break;
    }
  }
  
  if (startIdx === -1) return [];
  
  let tableStart = -1;
  for (let i = startIdx; i < lines.length; i++) {
    if (lines[i].trim().startsWith('|')) {
      tableStart = i;
      break;
    }
  }
  
  if (tableStart === -1) return [];
  
  const tableLines = [];
  for (let i = tableStart; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|')) {
      tableLines.push(line);
    } else if (tableLines.length > 0 && !line.startsWith('|')) {
      break;
    }
  }
  
  if (tableLines.length < 3) return [];
  
  const headerLine = tableLines[0];
  const headers = headerLine
    .split('|')
    .map(h => h.trim())
    .filter(h => h.length > 0);
  
  const rows = [];
  for (let i = 2; i < tableLines.length; i++) {
    const cells = tableLines[i]
      .split('|')
      .map(c => c.trim())
      .filter((_, idx) => idx > 0 && idx <= headers.length);
    
    if (cells.length === headers.length) {
      const row = {};
      headers.forEach((header, idx) => {
        let value = cells[idx] || '';
        value = value.replace(/\*\*/g, '').replace(/\*/g, '');
        row[header] = value;
      });
      rows.push(row);
    }
  }
  
  return rows;
}

/**
 * Parse a simple key-value table (2 columns: Field | Value)
 */
export function parseKeyValueTable(text, sectionHeader) {
  const rows = parseTable(text, sectionHeader);
  const result = {};
  rows.forEach(row => {
    const key = row.Field || row.field || row.Key || row.key;
    const value = row.Value || row.value || row.Val || row.val;
    if (key && value !== undefined) {
      result[key] = value;
    }
  });
  return result;
}

/**
 * Extract text between two headers
 */
export function extractSection(text, startHeader, endHeader) {
  const lines = text.split('\n');
  let startIdx = -1;
  let endIdx = lines.length;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith(startHeader)) {
      startIdx = i + 1;
    } else if (startIdx !== -1 && endHeader && lines[i].trim().startsWith(endHeader)) {
      endIdx = i;
      break;
    }
  }
  
  if (startIdx === -1) return '';
  return lines.slice(startIdx, endIdx).join('\n');
}
