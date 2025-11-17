import { createGroq } from '@ai-sdk/groq';

// Load environment variables
const apiKey = import.meta.env.VITE_GROQ_API_KEY;
const modelName = import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile';

// Validate API key
if (!apiKey) {
  console.error('VITE_GROQ_API_KEY is missing! Please add it to your .env file.');
  console.error('Get your API key from: https://console.groq.com/keys');
}

if (apiKey && !apiKey.startsWith('gsk_')) {
  console.warn('VITE_GROQ_API_KEY might be invalid. Groq API keys should start with "gsk_"');
}



// Initialize Groq with API key
let groq;
try {
  groq = createGroq({
    apiKey: apiKey,
  });
} catch (error) {
  console.error('Failed to initialize Groq provider:', error);
  throw new Error('Groq initialization failed. Check your API key.');
}

// Configure Groq models using environment variable
export const aiProviders = {
  // Primary model from environment variable
  primary: groq(modelName),
  
  // Available Groq models (as of January 2025)
  llama3_3_70b: groq('llama-3.3-70b-versatile'),     // Latest, best quality
  llama3_2_90b: groq('llama-3.2-90b-text-preview'),  // Very large context
  llama3_2_3b: groq('llama-3.2-3b-preview'),         // Fast and efficient
  mixtral: groq('mixtral-8x7b-32768'),                // Large context window
  gemma2_9b: groq('gemma2-9b-it'),                    // Google's Gemma 2
};

// Default providers for different use cases
export const defaultProviders = {
  interview: aiProviders.primary,     // High quality for interview prep
  matching: aiProviders.primary,      // Accurate for resume matching
  analysis: aiProviders.primary,      // General analysis
  chat: aiProviders.primary,          // Quick responses for chat
};

// Export model info for debugging
export const groqConfig = {
  modelName,
  apiKeyConfigured: !!apiKey,
  apiKeyValid: apiKey?.startsWith('gsk_'),
};