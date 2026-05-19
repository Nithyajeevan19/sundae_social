import { motion } from "framer-motion";

const COLORS = ["#E53A1A", "#E88AA2", "#F4B23A", "#C97A3D", "#D7263D", "#4A2418"];

export function Confetti({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: 36 }).map((_, i) => {
        const x = (i * 53) % 100;
        const color = COLORS[i % COLORS.length];
        const rot = (i * 47) % 360;
        return (
          <motion.span
            key={i}
            initial={{ y: -20, x: `${x}vw`, opacity: 1, rotate: rot }}
            animate={{ y: "110vh", rotate: rot + 540, opacity: [1, 1, 0] }}
            transition={{ duration: 2 + (i % 5) * 0.3, ease: "easeIn" }}
            className="absolute h-2.5 w-2.5 rounded-sm"
            style={{ background: color, top: 0 }}
          />
        );
      })}
    </div>
  );
}
