import Groq from 'groq-sdk';
import { SearchQuery } from '../types/trial';
import { SearchResult } from '../types/trial';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = 'llama-3.3-70b-versatile';

/**
 * Extract structured search query from user message using LLM
 */
export async function extractSearchQuery(userMessage: string): Promise<SearchQuery> {
  const prompt = `You are a clinical trials search assistant. Extract a structured search query from the user's message.

User message: "${userMessage}"

Return ONLY valid JSON in this format:
{
  "keywords": ["keyword1", "keyword2"],
  "filters": {
    "status": ["RECRUITING", "ACTIVE_NOT_RECRUITING"],
    "phase": ["PHASE3"],
    "interventionType": ["DRUG"]
  }
}

Rules:
1. Expand medical acronyms (NSCLC → "non small cell lung cancer", add both forms)
2. Include synonyms for diseases (e.g., "lung cancer" and "pulmonary carcinoma")
3. "Active" or "recruiting" means status: ["RECRUITING", "ACTIVE_NOT_RECRUITING"]
4. "Completed" means status: ["COMPLETED"]
5. If user mentions phase (phase 1, 2, 3, 4), add to filters.phase as ["PHASE1"], ["PHASE2"], etc.
6. If user says "drug trials", add filters.interventionType: ["DRUG"]
7. If user says "immunotherapy", include it as keyword

Available status values: RECRUITING, ACTIVE_NOT_RECRUITING, COMPLETED, TERMINATED, WITHDRAWN, SUSPENDED, NOT_YET_RECRUITING
Available phase values: EARLY_PHASE1, PHASE1, PHASE2, PHASE3, PHASE4, NA
Available interventionType values: DRUG, BIOLOGICAL, DEVICE, PROCEDURE, BEHAVIORAL, OTHER

Only include filters that are explicitly mentioned or clearly implied. Return empty filters object if none apply.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: MODEL,
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return {
      keywords: parsed.keywords || [],
      filters: parsed.filters || {},
      limit: 50,
    };
  } catch (error) {
    console.error('Error extracting search query:', error);
    // Fallback: simple keyword extraction
    return {
      keywords: [userMessage],
      filters: {},
      limit: 50,
    };
  }
}

/**
 * Generate summary of search results using LLM
 */
export async function summarizeResults(
  query: SearchQuery,
  results: SearchResult
): Promise<string> {
  if (results.totalResults === 0) {
    return "I couldn't find any clinical trials matching your search criteria. Try broadening your search terms or removing some filters.";
  }

  // Extract key info from results
  const trials = results.trials.slice(0, 10); // Summarize top 10
  const statuses = new Set<string>();
  const phases = new Set<string>();
  const conditions = new Set<string>();
  const sponsors = new Set<string>();

  trials.forEach(trial => {
    const ps = trial.protocolSection;
    if (ps.statusModule?.overallStatus) statuses.add(ps.statusModule.overallStatus);
    ps.designModule?.phases?.forEach(p => phases.add(p));
    ps.conditionsModule?.conditions?.forEach(c => conditions.add(c));
    if (ps.sponsorCollaboratorsModule?.leadSponsor?.name) {
      sponsors.add(ps.sponsorCollaboratorsModule.leadSponsor.name);
    }
  });

  const prompt = `Summarize the clinical trials search results in 2-3 sentences using markdown formatting.

Search Query: ${JSON.stringify(query)}
Total Results: ${results.totalResults}
Statuses: ${Array.from(statuses).join(', ')}
Phases: ${Array.from(phases).join(', ')}
Top Conditions: ${Array.from(conditions).slice(0, 5).join(', ')}
Sample Sponsors: ${Array.from(sponsors).slice(0, 5).join(', ')}

FORMATTING RULES:
- Use **bold** for important keywords: numbers, conditions, phases, statuses, sponsors
- Use natural, conversational language
- Keep it concise (2-3 sentences)

EXAMPLES:
- "I found **15 clinical trials** for **NSCLC**. Most are in **Phase 2/3** and actively **recruiting**. Key sponsors include **Pfizer**, **Roche**, and **Merck**."
- "There are **8 active trials** studying **Type 2 Diabetes**. The majority are **Phase 3 drug trials** with statuses of **recruiting** or **active**."

Write a helpful summary mentioning:
- How many trials found (bold the number)
- Common trial phases and statuses (bold key terms)
- Main conditions being studied (bold condition names)
- Notable sponsors if interesting (bold sponsor names)`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: MODEL,
      temperature: 0.7,
      max_tokens: 200,
    });

    return completion.choices[0]?.message?.content || 'Found clinical trials matching your search.';
  } catch (error) {
    console.error('Error summarizing results:', error);
    return `Found ${results.totalResults} clinical trials matching your search.`;
  }
}
