import { ref, set } from 'firebase/database';
import { database } from './firebase.js';

// Function to save conversation summary data
export async function saveConversationSummary(conversation_id, score, summary) {
  try {
    // Create a reference to the location in the database where the data will be saved
    const conversationRef = ref(database, 'conversations/' + conversation_id);

    // Write the conversation data (score and summary) to the database
    await set(conversationRef, {
      score: score,
      summary: summary,
      timestamp: new Date().toISOString() // Optional: Adds a timestamp for when the conversation was saved
    });

    console.log('Conversation summary saved successfully.');
  } catch (error) {
    console.error('Error saving conversation summary:', error);
    throw new Error('Failed to save conversation summary');
  }
}
