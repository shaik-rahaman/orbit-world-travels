import Groq from 'groq-sdk';
// Groq types can be incomplete; cast to any when using dynamic properties
import { config } from '@/config/env';

let groqInstance: Groq;

/**
 * Singleton instance of Groq client
 */
export function getGroqClient(): Groq {
  if (!groqInstance) {
    groqInstance = new Groq({
      apiKey: config.groq.apiKey,
    });
  }
  return groqInstance;
}

/**
 * Call Groq LLM with structured response
 */
export async function callGroqAPI(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  try {
    const client = getGroqClient();

    if (!client) {
      throw new Error('Groq client not initialized');
    }

    // Use the standard Groq SDK API: chat.completions.create
    const response = await (client as any).chat.completions.create({
      model: config.groq.model,
      max_tokens: 2048,
      messages: [
        { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
    });

    // Extract text from response
    if (response.choices && Array.isArray(response.choices) && response.choices[0]?.message?.content) {
      return response.choices[0].message.content;
    }

    throw new Error('No content in Groq response');
  } catch (error) {
    // Log concise error and rethrow so callers can fallback
    console.error('Groq API Error:', (error as Error).message || error);
    throw new Error(`Groq API call failed: ${(error as Error).message}`);
  }
}

/**
 * Parse JSON response from Groq
 */
export async function callGroqAPIWithJSON<T>(
  prompt: string,
  systemPrompt?: string
): Promise<T> {
  const response = await callGroqAPI(prompt, systemPrompt);

  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return parsed as T;
  } catch (error) {
    console.error('JSON Parse Error:', error);
    console.error('Response was:', response);
    throw new Error(`Failed to parse Groq response as JSON: ${response}`);
  }
}
