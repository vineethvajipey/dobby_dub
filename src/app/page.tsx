'use client';

import SpeechForm from '@/components/SpeechForm';
import Image from 'next/image';
import { useState } from 'react';
import { useSettings } from '@/lib/settings-context';

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const { settings } = useSettings();
  const character = settings.selectedCharacter;

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6 relative w-[150px] h-[150px] mx-auto">
            <Image
              src={isPlaying ? 
                (settings.darkMode ? character.animationDark : character.animationLight) :
                (settings.darkMode ? character.imageDark : character.imageLight)
              }
              alt={`${character.name} Animation`}
              fill
              className="object-cover transition-opacity duration-300"
            />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {character.name}
          </h1>
          <p className="text-lg text-muted-foreground">
            {character.tagline}
          </p>
        </div>
        <SpeechForm onPlayingChange={setIsPlaying} />
      </div>
    </main>
  );
}
