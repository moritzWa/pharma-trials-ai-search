import { ClinicalTrial, SearchQuery, SearchResult } from '../types/trial';
import { getTrialsData } from '../data/dataLoader';

/**
 * Calculate relevance score for a trial based on keywords
 */
function calculateRelevance(trial: ClinicalTrial, keywords: string[]): number {
  let score = 0;
  const ps = trial.protocolSection;

  keywords.forEach(keyword => {
    const kw = keyword.toLowerCase();

    // Conditions (highest priority - 10 points)
    const conditions = ps.conditionsModule?.conditions || [];
    if (conditions.some(c => c.toLowerCase().includes(kw))) {
      score += 10;
    }

    // Title (high priority - 8 points)
    const title = ps.identificationModule?.briefTitle?.toLowerCase() || '';
    if (title.includes(kw)) {
      score += 8;
    }

    // Official title (high priority - 7 points)
    const officialTitle = ps.identificationModule?.officialTitle?.toLowerCase() || '';
    if (officialTitle.includes(kw)) {
      score += 7;
    }

    // Interventions (medium priority - 5 points)
    const interventions = ps.armsInterventionsModule?.interventions || [];
    if (interventions.some(i => i.name?.toLowerCase().includes(kw))) {
      score += 5;
    }

    // Brief summary (low priority - 2 points)
    const summary = ps.descriptionModule?.briefSummary?.toLowerCase() || '';
    if (summary.includes(kw)) {
      score += 2;
    }

    // Sponsor (medium priority - 4 points)
    const sponsor = ps.sponsorCollaboratorsModule?.leadSponsor?.name?.toLowerCase() || '';
    if (sponsor.includes(kw)) {
      score += 4;
    }
  });

  return score;
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

  // Step 1: Apply filters
  let filteredTrials = applyFilters(allTrials, query.filters);

  // Step 2: Apply keyword search and calculate relevance
  let resultsWithScores: Array<{ trial: ClinicalTrial; score: number }> = [];

  if (query.keywords && query.keywords.length > 0) {
    resultsWithScores = filteredTrials
      .map(trial => ({
        trial,
        score: calculateRelevance(trial, query.keywords!)
      }))
      .filter(result => result.score > 0) // Only keep trials with matches
      .sort((a, b) => b.score - a.score); // Sort by relevance
  } else {
    // No keywords - just return filtered results
    resultsWithScores = filteredTrials.map(trial => ({ trial, score: 0 }));
  }

  // Step 3: Apply limit
  const limit = query.limit || 50;
  const limitedResults = resultsWithScores.slice(0, limit);

  return {
    trials: limitedResults.map(r => r.trial),
    totalResults: resultsWithScores.length,
    query,
    relevanceScores: new Map(
      limitedResults.map(r => [r.trial.protocolSection.identificationModule.nctId, r.score])
    )
  };
}
