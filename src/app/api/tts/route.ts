import { textToSpeech } from '@/lib/services';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    const stream = await textToSpeech(text);
    
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