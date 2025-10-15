# Pharma Trials AI Search

AI-powered search interface for clinical trials data from ClinicalTrials.gov.

## Setup

### Prerequisites

- Node.js 20.19+ (for client)
- Bun (for server)
- Groq API key

### Installation

1. **Install dependencies**

   ```bash
   # Client
   cd client
   npm install

   # Server
   cd server
   bun install
   ```

2. **Configure environment variables**

   ```bash
   # server/.env
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Run the application**

   ```bash
   # Terminal 1 - Server
   cd server
   bun run dev

   # Terminal 2 - Client
   cd client
   npm run dev
   ```

4. **Access the app**
   - Frontend: http://localhost:5174
   - Backend: http://localhost:3001

## Features

- **Hybrid search**: Keyword matching + structured filters (phase, status, intervention type)
- **AI-powered query extraction**: Natural language structured search parameters
- **AI summaries**: LLM-generated explanations of search results
- **Chat interface**: Conversational UI with persistent chat history (localStorage)
- **Real-time results**: Displays clinical trial data as JSON

## Example Queries

- "Find NSCLC trials"
- "Show me active phase 3 diabetes drug trials"
- "Immunotherapy trials"
- "Completed cancer trials"

## Questions

### a. Extending Filter Functionality

The application already supports filtering by **phase, status, sponsor, intervention type, and country** (see [`search.ts`](server/src/services/search.ts)). To add new criteria:

1. Add filter field to `SearchQuery` interface [`trial.ts`](server/src/types/trial.ts)
2. Update LLM prompt to extract new parameter [`llm.ts`](server/src/services/llm.ts)
3. Add filter logic to `applyFilters()` function [`search.ts`](server/src/services/search.ts)

### b. Compromises

**Limited field coverage**: The ClinicalTrial interface only includes ~10 key properties out of 100+ available fields. This compromise prioritizes search quality for core fields (conditions, interventions, title, phase, sponsor) over comprehensive coverage. Indexing all fields would add complexity without clear value for the primary use case.

**In-memory storage**: Loading data into RAM rather than using a database simplifies deployment and reduces infrastructure requirements. This works for 1,000 trials but won't scale to the full 550K+ dataset.

**Basic keyword matching**: Simple substring matching instead of vector embeddings or fuzzy search keeps the implementation straightforward while relying on the LLM to handle synonyms and acronym expansion.

### c. UX Improvement Priorities

**User feedback-driven approach**: I would interview the ICP to understand their workflow pain points. Key questions: What data do they export? How do they share findings? What integrations do they need?

**Top priorities based on competitive research workflows**:

1. **CSV export** - Enable users to export filtered results for further analysis
2. **AI-generated custom columns** - Let users define column titles (e.g., "Target molecule") and auto-populate values using LLM extraction
3. **File upload integration** - Allow users to upload existing analysis files and find related trials
4. **Saved searches** - Persist complex queries for repeated use
