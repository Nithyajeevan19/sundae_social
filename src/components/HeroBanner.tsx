import { motion } from "framer-motion";
import heroImg from "@/assets/hero-sundae.webp";
import { FloatingDesserts } from "./FloatingDesserts";

export function HeroBanner({ onScrollCta }: { onScrollCta: () => void }) {
  return (
    <section className="relative overflow-hidden pb-8 pt-10">
      <FloatingDesserts count={8} />

      <div className="relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg shadow-pop">
              🍨
            </span>
            <span className="font-display text-lg font-semibold text-chocolate">Sundae Social</span>
          </div>
          <span className="rounded-full bg-card/80 px-3 py-1 text-xs font-medium text-chocolate backdrop-blur">
            Your Treat Place
          </span>
        </motion.div>

        <div className="relative mt-6">
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl will-change-transform"
            style={{
              background: "radial-gradient(circle, rgba(244,178,58,0.55), transparent 70%)",
            }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          <motion.img
            src={heroImg}
            fetchPriority="high"
            loading="eager"
            alt="Sundae Social signature sundae with three scoops, sprinkles and a cherry on top"
            className="relative mx-auto h-72 w-72 object-contain will-change-transform"
            initial={{ y: 30, opacity: 0, rotate: -6 }}
            animate={{ y: [0, -8, 0], opacity: 1, rotate: 0 }}
            transition={{
              y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 0.8 },
              rotate: { duration: 0.8 },
            }}
          />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-2 text-balance text-center text-[2rem] leading-[1.05] font-semibold text-chocolate"
        >
          Hey Sweet Tooth! <br />
          <span className="bg-gradient-warm bg-clip-text text-transparent">
            How was your Sundae
          </span>{" "}
          today?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-3 text-center text-sm text-muted-foreground"
        >
          Tap below — it takes 10 seconds and makes our day 🥹
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 flex justify-center"
        >
          <button
            onClick={onScrollCta}
            className="inline-flex animate-float items-center gap-2 rounded-full bg-card/70 px-4 py-2 text-xs font-medium text-chocolate backdrop-blur"
          >
            Scroll to share ↓
          </button>
        </motion.div>
      </div>
    </section>
  );
}
