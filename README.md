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

## Limitations

### Data Coverage

- **Subset of fields**: Only key fields indexed (conditions, interventions, title, status, phase, sponsor)
- **Missing fields**: Detailed outcomes, eligibility criteria, and study locations not fully searchable
- **Dataset size**: Limited to top 1,000 trials from ClinicalTrials.gov

### Search Capabilities

- **No vector search**: Relies on keyword matching, not semantic similarity
- **No fuzzy matching**: Exact substring matching only (e.g., "NSCLC" won't match "non-small cell lung cancer" unless LLM expands it)
- **Limited synonym handling**: LLM attempts to expand acronyms, but may miss edge cases
- **No ranking by relevance**: Basic scoring system, not ML-based ranking

### Technical

- **In-memory storage**: All data loaded into RAM (works for 1,000 trials, won't scale to millions)
- **No pagination on backend**: Returns all results (limited to 50 by default)
- **Client-side persistence**: Chat history stored in localStorage (browser-dependent limits)
- **No authentication**: Open access, no user accounts

### Future Improvements

- Add vector embeddings for semantic search
- Implement fuzzy matching and advanced NLP
- Support full dataset (400K+ trials) with database
- Add more sophisticated result ranking
- Build data table UI (currently shows raw JSON)
- Export results to CSV
