import { motion } from "framer-motion";

interface SpeakingAnimationProps {
  isSpeaking: boolean;
}

export default function SpeakingAnimation({ isSpeaking }: SpeakingAnimationProps) {
  return (
    <div className="flex items-center gap-1 h-4">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-blue-500 rounded-full"
          animate={{
            height: isSpeaking ? ["40%", "100%", "40%"] : "40%",
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