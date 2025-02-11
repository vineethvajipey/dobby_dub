import { textToSpeech } from '@/lib/services';
import { characters } from '@/lib/characters';

export async function POST(req: Request) {
  try {
    const { text, characterId } = await req.json();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }), 
        { status: 400 }
      );
    }

    if (!characterId) {
      return new Response(
        JSON.stringify({ error: 'Character ID is required' }), 
        { status: 400 }
      );
    }

    const character = characters.find(c => c.id === characterId);
    if (!character) {
      return new Response(
        JSON.stringify({ error: 'Invalid character ID' }), 
        { status: 400 }
      );
    }

    const stream = await textToSpeech(text, character);
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked'
      }
    });
  } catch (error) {
    console.error('TTS Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate speech' }), 
      { status: 500 }
    );
  }
} 