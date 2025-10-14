// Clinical Trial Types (simplified, key fields only)
export interface ClinicalTrial {
  protocolSection: {
    identificationModule: {
      nctId: string;
      briefTitle?: string;
      officialTitle?: string;
      organization?: {
        fullName?: string;
        class?: string;
      };
    };
    statusModule: {
      overallStatus?: string;
      startDateStruct?: {
        date?: string;
      };
    };
    sponsorCollaboratorsModule?: {
      leadSponsor?: {
        name?: string;
      };
    };
    descriptionModule?: {
      briefSummary?: string;
      detailedDescription?: string;
    };
    conditionsModule?: {
      conditions?: string[];
    };
    designModule?: {
      studyType?: string;
      phases?: string[];
      enrollmentInfo?: {
        count?: number;
      };
    };
    armsInterventionsModule?: {
      interventions?: Array<{
        type?: string;
        name?: string;
        description?: string;
      }>;
    };
    eligibilityModule?: {
      minimumAge?: string;
      maximumAge?: string;
      sex?: string;
    };
    contactsLocationsModule?: {
      locations?: Array<{
        facility?: string;
        city?: string;
        state?: string;
        country?: string;
        status?: string;
      }>;
    };
  };
  hasResults?: boolean;
}

export interface SearchQuery {
  keywords?: string[];
  filters?: {
    status?: string[];
    phase?: string[];
    conditions?: string[];
    interventionType?: string[];
    sponsor?: string;
    country?: string;
  };
  limit?: number;
}

export interface SearchResult {
  trials: ClinicalTrial[];
  totalResults: number;
  query: SearchQuery;
  relevanceScores?: Map<string, number>;
}
