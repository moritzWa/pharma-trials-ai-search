import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { loadTrialsData } from './src/data/dataLoader';
import { searchTrials } from './src/services/search';
import { extractSearchQuery, summarizeResults } from './src/services/llm';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Load clinical trials data on startup
console.log('🚀 Loading clinical trials data...');
loadTrialsData();

// Chat endpoint with full LLM + search flow
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('📥 User query:', message);

    // Step 1: Extract structured query using LLM
    const searchQuery = await extractSearchQuery(message);
    console.log('🔍 Extracted query:', JSON.stringify(searchQuery, null, 2));

    // Step 2: Search trials
    const searchResults = searchTrials(searchQuery);
    console.log(`✅ Found ${searchResults.totalResults} trials`);

    // Step 3: Generate summary using LLM
    const summary = await summarizeResults(searchQuery, searchResults);
    console.log('📝 Summary:', summary);

    // Step 4: Return response
    res.json({
      response: summary,
      results: searchResults.trials,
      totalResults: searchResults.totalResults,
      query: searchQuery,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error processing chat:', error);
    res.status(500).json({
      error: 'Failed to process request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
