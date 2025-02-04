import { motion } from "framer-motion";

interface SpeakingAnimationProps {
  isSpeaking: boolean;
}

export default function SpeakingAnimation({ isSpeaking }: SpeakingAnimationProps) {
  return (
    <div className="flex items-center gap-0.5 h-5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1 bg-gray-900"
          initial={{ height: "4px" }}
          animate={isSpeaking ? {
            height: ["4px", "16px", "4px"]
          } : {
            height: "4px"
          }}
          transition={isSpeaking ? {
            duration: 0.75,
            repeat: Infinity,
            delay: i * 0.15,
          } : {
            duration: 0.2
          }}
        />
      ))}
    </div>
  );
} 