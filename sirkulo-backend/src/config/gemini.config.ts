/**
 * Gemini AI Configuration
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Gemini AI configuration interface
 */
interface GeminiConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  topP: number;
  topK: number;
  safetySettings: {
    threshold: string;
    category: string;
  }[];
  generationConfig: {
    maxOutputTokens: number;
    temperature: number;
    topP: number;
    topK: number;
  };
}

/**
 * Gemini AI configuration
 */
export const geminiConfig: GeminiConfig = {
  apiKey: process.env.GEMINI_API_KEY || '',
  model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '8192', 10),
  temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
  topP: parseFloat(process.env.GEMINI_TOP_P || '0.8'),
  topK: parseInt(process.env.GEMINI_TOP_K || '40', 10),
  
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE'
    }
  ],

  generationConfig: {
    maxOutputTokens: parseInt(process.env.GEMINI_MAX_OUTPUT_TOKENS || '2048', 10),
    temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
    topP: parseFloat(process.env.GEMINI_TOP_P || '0.8'),
    topK: parseInt(process.env.GEMINI_TOP_K || '40', 10),
  }
};

/**
 * Validate Gemini configuration
 */
export const validateGeminiConfig = (): boolean => {
  if (!geminiConfig.apiKey) {
    console.error('❌ GEMINI_API_KEY is required but not provided');
    return false;
  }

  if (!geminiConfig.model) {
    console.error('❌ GEMINI_MODEL is required but not provided');
    return false;
  }

  console.log('✅ Gemini AI configuration validated successfully');
  return true;
};

export default geminiConfig;