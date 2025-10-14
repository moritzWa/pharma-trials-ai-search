import { readFileSync } from 'fs';
import { join } from 'path';
import { ClinicalTrial } from '../types/trial';

let trialsData: ClinicalTrial[] = [];

export function loadTrialsData(): ClinicalTrial[] {
  if (trialsData.length > 0) {
    return trialsData;
  }

  try {
    const dataPath = join(__dirname, 'ctg-studies-top-1000.json');
    const rawData = readFileSync(dataPath, 'utf-8');
    const parsedData = JSON.parse(rawData);

    // Handle both array and object formats
    trialsData = Array.isArray(parsedData) ? parsedData : [parsedData];

    console.log(`✅ Loaded ${trialsData.length} clinical trials into memory`);
    return trialsData;
  } catch (error) {
    console.error('❌ Error loading clinical trials data:', error);
    throw error;
  }
}

export function getTrialsData(): ClinicalTrial[] {
  if (trialsData.length === 0) {
    return loadTrialsData();
  }
  return trialsData;
}
