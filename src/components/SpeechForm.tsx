import { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import SpeakingAnimation from './SpeakingAnimation';
import { useSettings } from '@/lib/settings-context';

interface SpeechFormProps {
  onPlayingChange: (isPlaying: boolean) => void;
}

export default function SpeechForm({ onPlayingChange }: SpeechFormProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentary, setCommentary] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { settings } = useSettings();

  useEffect(() => {
    onPlayingChange(isSpeaking);
  }, [isSpeaking, onPlayingChange]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    setAudioUrl(null);
    setError(null);
    setCommentary('');
    setIsSpeaking(false);

    try {
      setIsLoading(true);
      setError(null);

      // First, get the streaming commentary
      const response = await fetch('/api/speak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          input: text,
          characterId: settings.selectedCharacter.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let commentaryText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        commentaryText += chunk;
        setCommentary(commentaryText);
      }

      // Then, if audio generation is enabled, generate the audio
      if (settings.generateAudio) {
        const audioResponse = await fetch('/api/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            text: commentaryText,
            characterId: settings.selectedCharacter.id
          }),
        });

        if (!audioResponse.ok) {
          const errorData = await audioResponse.json();
          throw new Error(errorData.error || 'Failed to generate speech');
        }

        const data = await audioResponse.json();
        if (!data.audioUrl) {
          throw new Error('No audio URL received');
        }

        setAudioUrl(data.audioUrl);
        
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        audioRef.current = new Audio(data.audioUrl);
        audioRef.current.addEventListener('play', () => setIsSpeaking(true));
        audioRef.current.addEventListener('pause', () => setIsSpeaking(false));
        audioRef.current.addEventListener('ended', () => {
          setIsSpeaking(false);
          setAudioUrl(null);
        });
      }

    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsSpeaking(true);
    } else {
      audioRef.current.pause();
      setIsSpeaking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${settings.selectedCharacter.name}...`}
            className="flex-1 p-4 rounded-lg border-2 border-gray-900 dark:border-gray-100 focus:outline-none focus:border-gray-700 dark:focus:border-gray-300 resize-none h-32 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div className="flex justify-between items-center">
          <button
            type="submit"
            disabled={isLoading}
            className="min-w-[480px] h-10 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? 'Generating...' : `Let ${settings.selectedCharacter.name} Cook 👨‍🍳`}
          </button>

          <div className="flex items-center gap-3">
            <SpeakingAnimation isSpeaking={isSpeaking} />
            <button
              type="button"
              onClick={handlePlayPause}
              disabled={!audioUrl}
              className="p-2 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors duration-200"
            >
              {isSpeaking ? (
                <PauseIcon className="w-6 h-6" />
              ) : (
                <PlayIcon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-500 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {commentary && (
        <div className="mt-8 p-4 bg-white dark:bg-gray-800 border border-gray-900 dark:border-gray-100 rounded-lg relative shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">{settings.selectedCharacter.name} says:</h2>
          </div>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            {commentary}
          </div>
        </div>
      )}

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsSpeaking(false)}
          onPause={() => setIsSpeaking(false)}
        />
      )}
    </div>
  );
} 