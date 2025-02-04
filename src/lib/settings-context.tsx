"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface Settings {
  generateAudio: boolean;
  darkMode: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    generateAudio: false,
    darkMode: false,
  });

  // Check system preference on mount
  useEffect(() => {
    // Remove or comment out this system preference check if you want to force light mode
    // const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    // setSettings(prev => ({ ...prev, darkMode: isDarkMode }));

    // Listen for system preference changes (optional - remove if you don't want system preferences)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, darkMode: e.matches }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Update document class when dark mode changes
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 