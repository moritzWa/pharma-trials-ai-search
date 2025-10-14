import { ClinicalTrial, SearchQuery, SearchResult } from '../types/trial';
import { getTrialsData } from '../data/dataLoader';

/**
 * Calculate relevance score for a trial based on keywords
 *
 * Scoring weights (per keyword match):
 * - Conditions: 10 (most specific indicator)
 * - Title: 8 (directly describes study)
 * - Official Title: 7 (alternative title)
 * - Interventions: 5 (drug/treatment names)
 * - Sponsor: 4 (organization conducting trial)
 * - Summary: 2 (verbose, more noise)
 */
function calculateRelevance(trial: ClinicalTrial, keywords: string[]): number {
  const ps = trial.protocolSection;

  // Extract searchable fields
  const conditions = ps.conditionsModule?.conditions || [];
  const title = ps.identificationModule?.briefTitle?.toLowerCase() || '';
  const officialTitle = ps.identificationModule?.officialTitle?.toLowerCase() || '';
  const interventions = ps.armsInterventionsModule?.interventions || [];
  const summary = ps.descriptionModule?.briefSummary?.toLowerCase() || '';
  const sponsor = ps.sponsorCollaboratorsModule?.leadSponsor?.name?.toLowerCase() || '';

  let totalScore = 0;

  // Score each keyword across all fields
  for (const keyword of keywords) {
    const kw = keyword.toLowerCase();
    let keywordScore = 0;

    // Check each field (only count once per field)
    if (conditions.some(c => c.toLowerCase().includes(kw))) {
      keywordScore += 10;
    }
    if (title.includes(kw)) {
      keywordScore += 8;
    }
    if (officialTitle.includes(kw)) {
      keywordScore += 7;
    }
    if (interventions.some(i => i.name?.toLowerCase().includes(kw))) {
      keywordScore += 5;
    }
    if (sponsor.includes(kw)) {
      keywordScore += 4;
    }
    if (summary.includes(kw)) {
      keywordScore += 2;
    }

    totalScore += keywordScore;
  }

  return totalScore;
}

/**
 * Apply structured filters to trials
 */
function applyFilters(trials: ClinicalTrial[], filters?: SearchQuery['filters']): ClinicalTrial[] {
  if (!filters) return trials;

  return trials.filter(trial => {
    const ps = trial.protocolSection;

    // Status filter
    if (filters.status && filters.status.length > 0) {
      const trialStatus = ps.statusModule?.overallStatus;
      if (!trialStatus || !filters.status.includes(trialStatus)) {
        return false;
      }
    }

    // Phase filter
    if (filters.phase && filters.phase.length > 0) {
      const trialPhases = ps.designModule?.phases || [];
      if (!filters.phase.some(p => trialPhases.includes(p))) {
        return false;
      }
    }

    // Intervention type filter
    if (filters.interventionType && filters.interventionType.length > 0) {
      const interventions = ps.armsInterventionsModule?.interventions || [];
      const hasMatchingType = interventions.some(i =>
        i.type && filters.interventionType?.includes(i.type)
      );
      if (!hasMatchingType) {
        return false;
      }
    }

    // Sponsor filter (partial match)
    if (filters.sponsor) {
      const sponsor = ps.sponsorCollaboratorsModule?.leadSponsor?.name?.toLowerCase() || '';
      if (!sponsor.includes(filters.sponsor.toLowerCase())) {
        return false;
      }
    }

    // Country filter
    if (filters.country) {
      const locations = ps.contactsLocationsModule?.locations || [];
      const hasMatchingCountry = locations.some(loc =>
        loc.country?.toLowerCase() === filters.country?.toLowerCase()
      );
      if (!hasMatchingCountry) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Main search function - hybrid keyword + structured filters
 */
export function searchTrials(query: SearchQuery): SearchResult {
  const allTrials = getTrialsData();

  // Step 1: Apply hard filters (phase, status, etc.)
  const filteredTrials = applyFilters(allTrials, query.filters);

  // Step 2: Apply keyword search and calculate relevance scores
  let resultsWithScores: Array<{ trial: ClinicalTrial; score: number }>;

  if (query.keywords && query.keywords.length > 0) {
    // Calculate relevance score for each trial
    const scoredTrials = filteredTrials.map(trial => ({
      trial,
      score: calculateRelevance(trial, query.keywords!)
    }));

    // Filter out trials with no keyword matches
    const matchingTrials = scoredTrials.filter(result => result.score > 0);

    // Sort by relevance (highest score first)
    const sortedTrials = matchingTrials.sort((a, b) => b.score - a.score);

    resultsWithScores = sortedTrials;
  } else {
    // No keywords - return all filtered trials (unsorted)
    resultsWithScores = filteredTrials.map(trial => ({ trial, score: 0 }));
  }

  // Step 3: Apply limit (default 50)
  const limit = query.limit || 50;
  const limitedResults = resultsWithScores.slice(0, limit);

  // Step 4: Extract trials and build score map
  const trials = limitedResults.map(r => r.trial);
  const relevanceScores = new Map(
    limitedResults.map(r => [r.trial.protocolSection.identificationModule.nctId, r.score])
  );

  return {
    trials,
    totalResults: resultsWithScores.length,
    query,
    relevanceScores
  };
}
