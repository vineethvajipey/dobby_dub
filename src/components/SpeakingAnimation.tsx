'use client';

import { motion } from "framer-motion";
import { useSettings } from '@/lib/settings-context';

interface SpeakingAnimationProps {
  isSpeaking: boolean;
}

export default function SpeakingAnimation({ isSpeaking }: SpeakingAnimationProps) {
  const { settings } = useSettings();

  return (
    <div className="flex gap-0.5 h-5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`w-1 rounded-full ${settings.darkMode ? 'bg-gray-100' : 'bg-gray-900'}`}
          initial={{ height: "4px" }}
          animate={isSpeaking ? {
            height: ["4px", "16px", "4px"]
          } : {
            height: "4px"
          }}
          transition={{
            duration: 0.75,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
} 