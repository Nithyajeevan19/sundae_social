import { motion } from "framer-motion";

const items = ["🍨", "🍦", "🍓", "🍒", "🧁", "🍫", "✨", "🌸"];

export function FloatingDesserts({ count = 10 }: { count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 97) % 100;
        const delay = (i * 0.7) % 5;
        const dur = 8 + ((i * 1.3) % 6);
        const size = 18 + ((i * 7) % 22);
        const emoji = items[i % items.length];
        return (
          <span
            key={i}
            className="absolute animate-drift will-change-transform"
            style={{
              left: `${left}%`,
              top: `-10vh`,
              animationDelay: `${delay}s`,
              animationDuration: `${dur}s`,
              fontSize: `${size}px`,
              ["--x" as never]: `${(i % 2 ? 1 : -1) * 30}px`,
              filter: "drop-shadow(0 4px 6px rgba(74,36,24,0.15))",
            }}
          >
            {emoji}
          </span>
        );
      })}
      <motion.div
        className="absolute -left-10 top-1/3 h-40 w-40 rounded-full blur-3xl will-change-transform"
        style={{ background: "rgba(232,138,162,0.45)" }}
        animate={{ x: [0, 15, 0], y: [0, -5, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute -right-10 top-2/3 h-44 w-44 rounded-full blur-3xl will-change-transform"
        style={{ background: "rgba(244,178,58,0.4)" }}
        animate={{ x: [0, -15, 0], y: [0, 5, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
