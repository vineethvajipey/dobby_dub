import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { OpenAI } from 'openai';
import ffmpeg from 'fluent-ffmpeg';
import axios from 'axios';
import fs from 'fs';
import { ElevenLabsClient } from "elevenlabs";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Eleven Labs client
const elevenLabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// Fireworks API configuration
const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;
const FIREWORKS_API_URL = 'https://api.fireworks.ai/inference/v1/chat/completions';

export interface VideoData {
  filePath: string;
  summary: string;
  status: string;
  timestamp: number;
}

export interface TranscriptionResult {
  text: string;
  segments: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

// Helper function to ensure uploads directory exists
export async function ensureUploadsDirectory() {
  try {
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    return uploadsDir;
  } catch (error) {
    console.error('Error creating uploads directory:', error);
    throw error;
  }
}

// Helper function to extract audio from video
export async function extractAudioFromVideo(videoPath: string): Promise<string> {
  const audioPath = videoPath.replace(/\.[^/.]+$/, '.mp3');
  
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .toFormat('mp3')
      .on('error', (err) => {
        console.error('Error during audio extraction:', err);
        reject(err);
      })
      .on('end', () => {
        console.log('Audio extraction completed');
        resolve(audioPath);
      })
      .save(audioPath);
  });
}

export async function transcribeVideo(filePath: string): Promise<TranscriptionResult> {
  try {
    console.log('Starting transcription process...', {
      filePath,
      exists: existsSync(filePath)
    });
    
    // Ensure the video file exists
    if (!existsSync(filePath)) {
      throw new Error(`Video file not found at path: ${filePath}`);
    }
    
    // Extract audio from video
    console.log('Extracting audio from video...');
    const audioPath = await extractAudioFromVideo(filePath);
    console.log('Audio extraction completed:', {
      audioPath,
      exists: existsSync(audioPath)
    });

    // Ensure the audio file was created
    if (!existsSync(audioPath)) {
      throw new Error('Failed to extract audio from video');
    }
    
    // Transcribe the audio using Whisper
    console.log('Calling Whisper API...');
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: 'whisper-1',
      response_format: 'verbose_json',
    });
    console.log('Whisper API response received');

    // Format the response
    const result: TranscriptionResult = {
      text: transcription.text,
      segments: transcription.segments?.map(segment => ({
        start: segment.start,
        end: segment.end,
        text: segment.text
      })) || []
    };

    // Save transcription result
    const transcriptionPath = filePath.replace(/\.[^/.]+$/, '_transcription.json');
    await writeFile(transcriptionPath, JSON.stringify(result, null, 2));
    console.log('Transcription saved to file:', transcriptionPath);

    return result;

  } catch (error: unknown) {
    const err = error as Error;
    console.error('Detailed transcription error:', {
      message: err.message,
      stack: err.stack,
      type: err.constructor.name
    });
    throw err;
  }
}

interface CommentaryResult {
  commentary: string;
  timestamp: number;
}

export async function generateCommentary(input: string, _: string): Promise<CommentaryResult> {
  try {
    console.log('Generating commentary...');

    const data = {
      model: "accounts/sentientfoundation/models/dobby-mini-unhinged-llama-3-1-8b",
      max_tokens: 16384,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: `You are Dobby, a witty and engaging AI commentator. Please react to this in a natural, conversational way: ${input}`
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
  } catch (error: any) {
    console.error('Error generating commentary:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
}

interface TTSResult {
  filename: string;
  duration: number;
}

export async function textToSpeech(text: string): Promise<ReadableStream<Uint8Array>> {
  try {
    console.log('Starting text-to-speech conversion...');

    const audioStream = await elevenLabs.textToSpeech.convertAsStream(
      "52d3CDIZuiBA0XXTytxR",
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

export async function mergeAudioWithVideo(videoPath: string, audioPath: string) {
  // Implement audio-video merging
  throw new Error('Not implemented');
}

export async function* generateCommentaryStream(input: string): AsyncGenerator<string> {
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
          content: `You are Dobby, a witty and engaging AI commentator. Please react to this in a natural, conversational way: ${input}`
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