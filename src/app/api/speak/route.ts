import { NextResponse } from 'next/server';
import { generateCommentaryStream } from '@/lib/services';

export async function POST(request: Request) {
  try {
    const { input } = await request.json();

    if (!input) {
      return new NextResponse('Input text is required', { status: 400 });
    }

    const stream = generateCommentaryStream(input);
    const encoder = new TextEncoder();

    return new NextResponse(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      })
    );
  } catch (err) {
    console.error('Error in /api/speak:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 