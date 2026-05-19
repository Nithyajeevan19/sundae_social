import { motion } from "framer-motion";

export type Emotion = "loved" | "okay" | "improve";

const options: { id: Emotion; emoji: string; label: string; gradient: string }[] = [
  {
    id: "loved",
    emoji: "⭐",
    label: "Loved it",
    gradient: "bg-gradient-warm text-primary-foreground",
  },
  { id: "okay", emoji: "😐", label: "It was okay", gradient: "bg-gradient-blush text-chocolate" },
  {
    id: "improve",
    emoji: "😞",
    label: "Needs improvement",
    gradient: "bg-gradient-cocoa text-cream",
  },
];

export function EmotionButtons({ onPick }: { onPick: (e: Emotion) => void }) {
  return (
    <div className="space-y-3">
      {options.map((o, i) => (
        <motion.button
          key={o.id}
          onClick={() => onPick(o.id)}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.5 }}
          whileTap={{ scale: 0.97 }}
          whileHover={{ y: -2 }}
          className={`flex w-full items-center justify-between rounded-3xl px-5 py-5 text-left shadow-pop ${o.gradient}`}
        >
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white/25 text-2xl backdrop-blur">
              {o.emoji}
            </span>
            <span className="text-lg font-semibold tracking-tight">{o.label}</span>
          </div>
          <span className="text-xl opacity-80">→</span>
        </motion.button>
      ))}
    </div>
  );
}
