import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock chat endpoint
app.post('/api/chat', (req, res) => {
  const { message } = req.body;

  // Mock response
  res.json({
    response: 'Hello! This is a mock response.',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
