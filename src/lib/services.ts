import { ElevenLabsClient } from "elevenlabs";
import axios from 'axios';
import { type Character } from './characters';

// Initialize Eleven Labs client
const elevenLabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// Fireworks API configuration
const FIREWORKS_API_URL = 'https://api.fireworks.ai/inference/v1/chat/completions';

interface CommentaryResult {
  commentary: string;
  timestamp: number;
}

export async function generateCommentary(input: string, character: Character): Promise<CommentaryResult> {
  try {
    console.log('Generating commentary...');

    const data = {
      model: "accounts/sentientfoundation/models/dobby-mini-unhinged-llama-3-1-8b",
      max_tokens: 16384,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: `${character.prompt} ${input}`
        }
      ]
    };

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.FIREWORKS_API_KEY}`
    };

    console.log('Making API request to Fireworks...');
    const response = await axios.post(FIREWORKS_API_URL, data, { headers });
    console.log('Received response from Fireworks');

    if (!response.data?.choices?.[0]?.message?.content) {
      console.error('Invalid API response:', response.data);
      throw new Error('Invalid response from Fireworks API');
    }

    const commentary = response.data.choices[0].message.content;
    const timestamp = Date.now();

    console.log('Generated commentary:', commentary);
    return { commentary, timestamp };
  } catch (error) {
    console.error('Error generating commentary:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      response: (error as { response?: { data: unknown, status: number } })?.response?.data,
      status: (error as { response?: { status: number } })?.response?.status
    });
    throw error;
  }
}

export async function textToSpeech(text: string, character: Character): Promise<ReadableStream<Uint8Array>> {
  try {
    console.log('Starting text-to-speech conversion...');

    const audioStream = await elevenLabs.textToSpeech.convertAsStream(
      character.voiceId,
      {
        text,
        model_id: "eleven_multilingual_v2",
        output_format: "mp3_44100_128",
      }
    );

    return new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of audioStream) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });

  } catch (error) {
    console.error('Error in text-to-speech conversion:', error);
    throw error;
  }
}

export async function* generateCommentaryStream(input: string, character: Character): AsyncGenerator<string> {
  try {
    console.log('Generating streaming commentary...');

    const data = {
      model: "accounts/sentientfoundation/models/dobby-mini-unhinged-llama-3-1-8b",
      max_tokens: 16384,
      temperature: 0.7,
      stream: true,
      messages: [
        {
          role: "user",
          content: `${character.prompt} ${input}`
        }
      ]
    };

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.FIREWORKS_API_KEY}`
    };

    const response = await fetch(FIREWORKS_API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to generate commentary');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader available');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          if (jsonStr === '[DONE]') continue;

          try {
            const json = JSON.parse(jsonStr);
            const content = json.choices[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error generating commentary:', error);
    throw error;
  }
} 