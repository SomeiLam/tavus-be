import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import { analyzeTranscript } from './analyzeTranscript.js';
import { saveConversationSummary } from './saveConversationSummary.js';

const app = express();

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// GET route for testing
app.get('/', (req, res) => {
  res.send('Hello World! Express server is working.');
});

// POST route to handle incoming webhook data
app.post('/webhookListener', async (req, res) => {
  try {
    // Log the full received data for inspection
    console.log('Received callback data:', JSON.stringify(req.body, null, 2));
    if (req.body.event_type === 'application.transcription_ready') {
      const filteredTranscript = req.body.transcript
        .filter(entry => entry.role === 'user' || entry.role === 'assistant') // Keep only assistant and user roles
        .map(entry => `${entry.role}: ${entry.content}`) // Flatten with role and content
        .join(' ');
      console.log('Flattened transcript:', filteredTranscript);
      const analysis = await analyzeTranscript(filteredTranscript)
      console.log('Analysis result:', analysis);
      await saveConversationSummary(req.body.conversation_id, analysis.score, analysis.summary)
      res.status(200).json({ message: "Transcript recieved successfully" });
    }
  } catch (error) {
    console.error('Error processing callback:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

// Set the port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
