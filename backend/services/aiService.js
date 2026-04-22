import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isGroq = process.env.OPENAI_API_KEY?.startsWith('gsk_');
const isGrok = process.env.OPENAI_API_KEY?.startsWith('xai-');

const getBaseURL = () => {
  if (isGroq) return 'https://api.groq.com/openai/v1';
  if (isGrok) return 'https://api.xai.com/v1';
  return undefined; 
};

const getDefaultModel = () => {
  if (isGroq) return 'llama-3.3-70b-versatile';
  if (isGrok) return 'grok-beta';
  return 'gpt-4o'; 
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: getBaseURL()
});

export const getAIResponse = async (messages, systemPrompt) => {
  try {
    const completion = await openai.chat.completions.create({
      model: getDefaultModel(),
      messages: [systemPrompt, ...messages.map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text
      }))],
      max_tokens: 1000,
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('AI API Error:', error);
    throw error;
  }
};
