import { motion } from "framer-motion";
import { AnimatedButton } from "./AnimatedButton";
import { Share2, Copy, Check, RotateCcw, Loader2 } from "lucide-react";
import { INSTAGRAM_HANDLE, shareStory } from "@/lib/social";
import { useRef, useState } from "react";

export interface QuizResult {
  title: string;
  emoji: string;
  description: string;
  gradient: string;
}

export function QuizResultCard({
  result,
  onRestart,
}: {
  result: QuizResult;
  onRestart: () => void;
}) {
  const storyRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const handleShare = async () => {
    if (!storyRef.current || isSharing) return;
    setIsSharing(true);
    setHint(null);
    const res = await shareStory(
      storyRef.current,
      `I'm a ${result.title}! What's your Sundae vibe? 🍨`,
    );
    setIsSharing(false);
    if (res === "downloaded") {
      setHint("Story image saved! Open Instagram → Story to post ✨");
    } else if (res === "error") {
      setHint("Couldn't share automatically — image saved instead.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(INSTAGRAM_HANDLE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 140, damping: 16 }}
      className="flex w-full flex-col items-center"
    >
      <p className="mb-5 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Your Sundae personality is ready
      </p>

      {/* STORY TEMPLATE PREVIEW - Canvas container */}
      <div className="mx-auto w-full max-w-[300px] rounded-[2.5rem] bg-white p-2.5 shadow-pop">
        <div
          ref={storyRef}
          className={`relative flex aspect-[9/16] w-full flex-col items-center justify-between overflow-hidden rounded-[2rem] p-6 text-center shadow-inner ${result.gradient}`}
        >
          {/* Subtle center spotlight texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
            style={{
              background: "radial-gradient(circle at 50% 30%, #fff, transparent 65%)",
            }}
          />

          {/* Floating decorative emojis */}
          {["✨", "🍒", "✨", "🍨", "🌸", "🍫"].map((emoji, i) => (
            <motion.span
              key={i}
              className="absolute select-none text-3xl drop-shadow-md"
              style={{
                left: `${((i * 47) % 75) + 10}%`,
                top: `${((i * 31) % 80) + 10}%`,
              }}
              animate={{ y: [0, -12, 0], rotate: [0, 15, 0] }}
              transition={{ duration: 4 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
            >
              {emoji}
            </motion.span>
          ))}

          {/* Top Brand Pill */}
          <div className="relative z-10 mt-3">
            <span className="rounded-full border border-white/20 bg-white/30 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-cream shadow-sm backdrop-blur-md">
              Sundae Social
            </span>
          </div>

          {/* Main Result Content */}
          <div className="relative z-10 mt-2 flex w-full flex-col items-center">
            <motion.div
              initial={{ rotate: -10, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 220, delay: 0.3 }}
              className="grid h-[120px] w-[120px] place-items-center rounded-full border border-white/20 bg-white/25 text-[70px] shadow-lg backdrop-blur-md"
            >
              {result.emoji}
            </motion.div>

            <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.25em] text-cream/90 drop-shadow-sm">
              You are
            </p>
            <h3 className="mt-1 px-1 font-display text-[42px] leading-[1.05] text-cream drop-shadow-md">
              {result.title}
            </h3>

            <div className="mt-5 w-[92%] rounded-[1.25rem] border border-white/10 bg-black/10 px-5 py-4 shadow-sm backdrop-blur-md">
              <p className="text-[14px] font-medium leading-relaxed text-cream/95">
                {result.description}
              </p>
            </div>
          </div>

          {/* Bottom Footer / CTA */}
          <div className="relative z-10 mb-4 flex w-full flex-col items-center gap-3">
            <p className="font-display text-[19px] text-cream drop-shadow-sm">
              Share your Sundae vibe 🍨
            </p>
            <div className="rounded-xl border border-white/10 bg-black/15 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-cream shadow-sm backdrop-blur-md">
              tag {INSTAGRAM_HANDLE}
            </div>
          </div>
        </div>
      </div>

      <p className="mb-2 mt-6 h-4 text-center text-[13px] font-medium text-muted-foreground">
        {hint || "Looks beautiful! Ready to post 🍒"}
      </p>

      {/* Action Buttons */}
      <div className="mt-3 w-full max-w-[300px] space-y-3">
        <AnimatedButton
          variant="primary"
          fullWidth
          onClick={handleShare}
          className="h-14 rounded-2xl border border-white/10 text-[16px] shadow-pop"
        >
          {isSharing ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}
          {isSharing ? "Generating Story..." : "Share to IG Story"}
        </AnimatedButton>

        <div className="grid grid-cols-2 gap-3">
          <AnimatedButton
            variant="cream"
            fullWidth
            onClick={handleCopy}
            className="h-12 rounded-xl text-[14px]"
          >
            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy Handle"}
          </AnimatedButton>

          <AnimatedButton
            variant="ghost"
            fullWidth
            onClick={onRestart}
            className="h-12 rounded-xl border border-border/60 bg-card text-[14px] hover:bg-muted"
          >
            <RotateCcw size={16} /> Retake Quiz
          </AnimatedButton>
        </div>
      </div>
    </motion.div>
  );
}
