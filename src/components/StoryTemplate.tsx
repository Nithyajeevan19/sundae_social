import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { AnimatedButton } from "./AnimatedButton";
import { Share2, Instagram, Loader2 } from "lucide-react";
import { INSTAGRAM_URL, shareStory } from "@/lib/social";

export function StoryTemplate({
  caption = "I just tried Sundae Social 🍨",
  subtitle = "@sundaesocial.in — your treat place",
}: {
  caption?: string;
  subtitle?: string;
}) {
  const storyRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const handleShare = async () => {
    if (!storyRef.current || busy) return;
    setBusy(true);
    setHint(null);
    const result = await shareStory(storyRef.current, caption);
    setBusy(false);
    if (result === "downloaded")
      setHint("Story image saved. Open Instagram → Story → upload it ✨");
    else if (result === "error") setHint("Couldn't share — opened Instagram instead.");
  };

  return (
    <div className="rounded-3xl bg-card p-5 shadow-soft">
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Your story · ready to share
      </p>

      <motion.div
        ref={storyRef}
        initial={{ rotate: -2, scale: 0.95, opacity: 0 }}
        whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="relative mx-auto aspect-[9/16] w-full max-w-[260px] overflow-hidden rounded-[2rem] bg-gradient-warm shadow-pop"
      >
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{ background: "radial-gradient(circle at 20% 20%, #fff, transparent 60%)" }}
        />
        {["🍨", "✨", "🍒", "🧁", "🌸", "🍫", "✨"].map((e, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl"
            style={{
              left: `${((i * 37) % 80) + 5}%`,
              top: `${((i * 53) % 75) + 5}%`,
            }}
            animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 3 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
          >
            {e}
          </motion.span>
        ))}
        <div className="relative z-10 flex h-full flex-col items-center justify-center p-6 text-center">
          <span className="rounded-full bg-white/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-cream backdrop-blur">
            Sundae Social
          </span>
          <h4 className="mt-4 font-display text-3xl leading-tight text-cream drop-shadow-sm">
            {caption}
          </h4>
          <p className="mt-3 text-xs text-cream/90">{subtitle}</p>
          <div className="mt-6 grid h-16 w-16 place-items-center rounded-full bg-white/20 text-3xl backdrop-blur">
            🍦
          </div>
          <p className="mt-4 text-[11px] uppercase tracking-widest text-cream/80">
            tag @sundaesocial.in
          </p>
        </div>
      </motion.div>

      <div className="mt-5 space-y-2">
        <AnimatedButton variant="primary" fullWidth onClick={handleShare}>
          {busy ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
          {busy ? "Preparing…" : "Share to Story"}
        </AnimatedButton>
        <AnimatedButton
          variant="cream"
          fullWidth
          onClick={() => window.open(INSTAGRAM_URL, "_blank")}
        >
          <Instagram size={18} /> Tag @sundaesocial.in
        </AnimatedButton>
        {hint && <p className="pt-1 text-center text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}
