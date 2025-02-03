import { generateCommentaryStream } from '@/lib/services';

export async function POST(req: Request) {
  try {
    const { input } = await req.json();
    const commentaryStream = await generateCommentaryStream(input);
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of commentaryStream) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      }
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to generate response' }), 
      { status: 500 }
    );
  }
} 