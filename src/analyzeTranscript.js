import dotenv from 'dotenv';
import { z } from 'zod';

const analysisResponseSchema = z.object({
  score: z.number().min(1).max(10),  // The score should be a number between 1 and 10
  summary: z.string(),  // The summary should be a string
});

dotenv.config();

const LLAMA_API_KEY = process.env.LLAMA_API_KEY;
const url = 'https://api.llama.com/v1/chat/completions';

if (!LLAMA_API_KEY) {
  throw new Error('Llama API key is missing');
}

export async function analyzeTranscript(transcript) {
  const prompt = `
Analyze the following interview between an AI and a user. 
Provide an **overall summary** of the user’s content, highlighting the key points 
of what the user communicated throughout the conversation. The summary should 
reflect the overall quality of the user’s communication, considering the clarity, 
relevance, engagement, and depth of their responses. 

Afterward, provide an **overall score** for the quality of the user's content 
(on factors such as mission alignment, values, industry knowledge, etc.) 
on a scale of 1 to 10. The score should represent the overall effectiveness 
and quality of the conversation, where 1 represents very poor content 
(unclear, irrelevant, or lacking depth) and 10 represents excellent, 
meaningful content.

Interview Transcript::

${transcript}

---

### Output:

- Please return **only one valid JSON object** (no extra characters or markdown). The JSON should contain:
    - A **score** (integer) between 1 and 10, representing the overall quality of the user's content.
    - A **summary** (string) that provides an overall evaluation of the user's communication throughout the entire conversation.

Example Output Structure:

{
  "score": 7,
  "summary": "The user communicated well in the conversation, providing clear but brief responses. The conversation remained mostly on topic, though the user didn't elaborate much. The overall content was good but lacked depth in some areas."
}

- Do **not include any intermediate analysis, code formatting, or markdown** (such as ```json or ```) in your output.
- **Only return the final score and summary** in valid JSON format, based on your evaluation of the entire conversation.

`
  try {
    console.log('starting transcript analysis');
    // Wait for the fetch request to complete
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LLAMA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Llama-4-Maverick-17B-128E-Instruct-FP8',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 256,
      }),
    });

    // Check if the response is ok (status 200)
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    // Parse the response JSON
    const data = await response.json();
    const analysisText = data.completion_message.content.text;
    const parsedData = JSON.parse(analysisText);
    const validatedData = analysisResponseSchema.parse(parsedData);
    console.log('Response from Llama API parsed:', validatedData); // Log the response


    return validatedData; // Return the data after processing
  } catch (error) {
    console.error('Error analyzing transcript:', error);
    throw new Error('Failed to analyze transcript');
  }
}

