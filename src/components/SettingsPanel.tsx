"use client";

import { Cog6ToothIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSettings } from '@/lib/settings-context';
import { useState } from 'react';
import { characters } from '@/lib/characters';
import Image from 'next/image';

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSettings } = useSettings();

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-900 dark:border-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        title="Settings"
      >
        <Cog6ToothIcon className="w-6 h-6 text-gray-900 dark:text-gray-100" />
      </button>

      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white dark:bg-gray-800 border-l border-gray-900 dark:border-gray-700 shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <XMarkIcon className="w-6 h-6 text-gray-900 dark:text-white" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white mb-2 block">
                Select Character
              </label>
              <div className="space-y-2">
                {characters.map((character) => (
                  <button
                    key={character.id}
                    onClick={() => updateSettings({ selectedCharacter: character })}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors duration-200 ${
                      settings.selectedCharacter.id === character.id
                        ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <div className="relative w-10 h-10">
                      <Image
                        src={settings.darkMode ? character.imageDark : character.imageLight}
                        alt={character.name}
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{character.name}</div>
                      <div className="text-xs opacity-80">{character.tagline}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Dark Mode
              </label>
              <button
                onClick={() => updateSettings({ darkMode: !settings.darkMode })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  settings.darkMode ? 'bg-gray-900 dark:bg-gray-100' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-800 transition-transform duration-200 ${
                    settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Toggle between light and dark mode.
            </p>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Generate Audio
              </label>
              <button
                onClick={() => updateSettings({ generateAudio: !settings.generateAudio })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  settings.generateAudio ? 'bg-gray-900 dark:bg-gray-100' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-800 transition-transform duration-200 ${
                    settings.generateAudio ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              When enabled, characters will generate audio for their responses using Eleven Labs API.
            </p>
          </div>
        </div>
      )}
    </>
  );
} 