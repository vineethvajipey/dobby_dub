import { useState, useRef, useEffect } from 'react';
import SpeakingAnimation from './SpeakingAnimation';

export default function SpeechForm() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentary, setCommentary] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const abortController = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      setError(null);
      setCommentary('');
      setIsSpeaking(false);

      // Create new AbortController for this request
      abortController.current = new AbortController();

      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
        signal: abortController.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let text = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        text += chunk;
        setCommentary(text);
      }

      // After text is generated, get the audio
      const audioResponse = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!audioResponse.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await audioResponse.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      audioRef.current = new Audio(url);
      audioRef.current.addEventListener('play', () => setIsSpeaking(true));
      audioRef.current.addEventListener('pause', () => setIsSpeaking(false));
      audioRef.current.addEventListener('ended', () => setIsSpeaking(false));

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request cancelled');
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    } finally {
      setIsLoading(false);
      abortController.current = null;
    }
  };

  const handleCancel = () => {
    if (abortController.current) {
      abortController.current.abort();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            What should Dobby react to?
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Enter any topic, thought, or situation..."
            disabled={isLoading}
            required
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating response...' : 'Let Dobby Cook 👨‍🍳'}
          </button>
          
          {(isLoading || isSpeaking) && (
            <button
              type="button"
              onClick={handleCancel}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {commentary && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Dobby says:</h2>
            <div className="flex items-center gap-2">
              {audioUrl && !isSpeaking && (
                <button
                  onClick={handlePlay}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Play
                </button>
              )}
              <SpeakingAnimation isSpeaking={isSpeaking} />
            </div>
          </div>
          <div className="prose prose-blue whitespace-pre-wrap">
            {commentary}
          </div>
        </div>
      )}
    </div>
  );
} 