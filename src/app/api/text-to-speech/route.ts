import { NextResponse } from 'next/server';
import { textToSpeech } from '@/lib/services';
import { characters } from '@/lib/characters';

export async function POST(request: Request) {
  try {
    const { text, characterId } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (!characterId) {
      return NextResponse.json(
        { error: 'Character ID is required' },
        { status: 400 }
      );
    }

    const character = characters.find(c => c.id === characterId);
    if (!character) {
      return NextResponse.json(
        { error: 'Invalid character ID' },
        { status: 400 }
      );
    }

    const audioStream = await textToSpeech(text, character);
    
    // Convert stream to base64
    const chunks = [];
    const reader = audioStream.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    const audioBuffer = Buffer.concat(chunks);
    const audioBase64 = audioBuffer.toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${audioBase64}`;

    return NextResponse.json({ audioUrl });
  } catch (error) {
    console.error('Error in text-to-speech API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate speech' },
      { status: 500 }
    );
  }
} 