import { motion } from "framer-motion";
import { AnimatedButton } from "./AnimatedButton";
import { Share2, Copy, Check, RotateCcw, Loader2 } from "lucide-react";
import { INSTAGRAM_HANDLE, shareStory } from "@/lib/social";
import { useRef, useState } from "react";
import { toast } from "sonner";

export interface QuizResult {
  title: string;
  emoji: string;
  description: string;
  gradient: string;
  recommendations: string[];
}

// Twemoji helper to ensure emojis render perfectly inside the exported canvas on all mobile browsers
function Twemoji({
  emoji,
  className,
  style,
}: {
  emoji: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const codePoints = Array.from(emoji)
    .map((char) => char.codePointAt(0)!.toString(16))
    .join("-");
  const url = `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${codePoints}.svg`;
  return (
    <img
      src={url}
      alt={emoji}
      className={className}
      style={style}
      crossOrigin="anonymous"
      loading="eager"
    />
  );
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
    setHint("Preparing your beautiful story... 🍧");

    try {
      const res = await shareStory(
        storyRef.current,
        `I'm ${result.title}! What's your Sundae vibe? 🍨`,
      );
      setIsSharing(false);

      if (res === "shared") {
        setHint("Shared successfully! Ready to post 🍨");
        toast.success("Shared successfully! 🍒", {
          description: "Tag us to get featured on our page!",
        });
      } else if (res === "downloaded") {
        setHint("Story saved! Tap IG Story → upload 🍒");
        toast.success("Saved to gallery! ✨", {
          description: "Open Instagram, tap story and upload your card!",
        });
      } else {
        setHint("Saved to gallery! Tap IG Story → upload 🍒");
        toast.success("Image exported! 🍨", {
          description: "Saved to device. Ready to post!",
        });
      }
    } catch (err) {
      console.error(err);
      setIsSharing(false);
      setHint("Couldn't share automatically — image saved instead.");
      toast.error("Export fallback active", {
        description: "Your story card was saved to downloads.",
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(INSTAGRAM_HANDLE);
    setCopied(true);
    toast.success("Instagram handle copied! 💖", {
      description: "Paste it when tagging @sundaesocial.in",
    });
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
        Your Sundae Identity is ready
      </p>

      {/* STORY TEMPLATE PREVIEW - Canvas container */}
      <div className="mx-auto w-full max-w-[320px] rounded-[2.5rem] bg-[#f8f5f1] p-3 shadow-pop border border-[#e8dfd3]">
        <div
          ref={storyRef}
          className={`relative flex aspect-[9/16] w-full flex-col overflow-hidden rounded-[2rem] p-5 shadow-inner ${result.gradient}`}
        >
          {/* Subtle Grain / Noise Overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
          {/* Warm Vignette */}
          <div
            className="pointer-events-none absolute inset-0 mix-blend-overlay"
            style={{
              background:
                "radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.3) 120%)",
            }}
          />

          {/* Top Label - Taped */}
          <div className="relative z-10 mt-1 flex justify-between items-start">
            <div className="relative rotate-[-3deg]">
              {/* Tape */}
              <div className="absolute -top-2 left-1/2 h-4 w-12 -translate-x-1/2 rotate-3 bg-white/40 shadow-sm backdrop-blur-sm" />
              <div className="bg-[#FFF4EA] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.25em] text-[#4A2418] shadow-sm">
                Sundae Social
              </div>
            </div>

            <div className="rotate-[5deg] bg-white/20 px-2 py-1 text-[10px] backdrop-blur-md rounded border border-white/20 text-white shadow-sm font-medium">
              Vol. 1
            </div>
          </div>

          <div className="relative z-10 mt-6 flex flex-col items-center">
            {/* Polaroid Graphic */}
            <motion.div
              initial={{ rotate: -15, scale: 0.8 }}
              animate={{ rotate: 4, scale: 1 }}
              transition={{ type: "spring", stiffness: 220, delay: 0.1 }}
              className="relative w-36 rounded bg-[#FDFBF7] p-3 pb-8 shadow-lg"
              style={{ borderRadius: "2px 2px 2px 2px" }}
            >
              {/* Tape corner */}
              <div className="absolute -left-3 -top-2 h-5 w-14 rotate-[-45deg] bg-white/50 backdrop-blur-sm shadow-sm" />
              <div className="absolute -right-3 -top-2 h-5 w-14 rotate-[45deg] bg-white/50 backdrop-blur-sm shadow-sm" />

              <div className="flex aspect-square w-full items-center justify-center bg-black/5 rounded-sm shadow-inner overflow-hidden relative p-4">
                <Twemoji
                  emoji={result.emoji}
                  className="w-20 h-20 object-contain drop-shadow-md select-none pointer-events-none"
                />
              </div>
              <p
                className="mt-3 text-center text-[18px] font-bold text-[#4A2418]/80 leading-none"
                style={{ fontFamily: "'Caveat', cursive" }}
              >
                this is me!!
              </p>
            </motion.div>

            {/* Handwritten Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative z-20 -mt-5"
            >
              <h3
                className="text-center text-[44px] leading-none text-white drop-shadow-md rotate-[-2deg]"
                style={{
                  fontFamily: "'Caveat', cursive",
                  textShadow: "0 2px 10px rgba(0,0,0,0.15)",
                }}
              >
                {result.title}
              </h3>
            </motion.div>

            {/* Notebook style card for perfect match */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 w-[105%] rotate-[-1deg] rounded-sm bg-[#FFFBF4] p-4 shadow-pop relative before:absolute before:left-4 before:top-0 before:bottom-0 before:w-px before:bg-red-200"
            >
              {/* Tape on notebook */}
              <div className="absolute -top-3 left-1/2 h-5 w-16 -translate-x-1/2 rotate-1 bg-white/50 backdrop-blur-sm shadow-sm" />

              <p className="ml-4 mb-2 font-display text-[14px] text-[#4A2418] flex items-center gap-1.5">
                <span>Your perfect match</span>
                <Twemoji
                  emoji="🍒"
                  className="w-4 h-4 object-contain inline-block align-middle select-none pointer-events-none"
                />
              </p>

              <ul className="ml-4 space-y-1">
                {result.recommendations?.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 border-b border-blue-100 pb-1">
                    <Twemoji
                      emoji="✨"
                      className="w-3 h-3 object-contain select-none pointer-events-none"
                    />
                    <span className="text-[12px] font-medium leading-snug text-[#4A2418]/90 font-display">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="ml-4 mt-3 text-[12px] text-[#4A2418]/70 italic leading-snug">
                "{result.description}"
              </p>
            </motion.div>
          </div>

          {/* Floating Sticker Emojis */}
          {[
            { e: "🌸", top: "15%", left: "5%", r: -15, s: 1.2 },
            { e: "✨", top: "25%", left: "85%", r: 15, s: 1.5 },
            { e: "🍓", top: "50%", left: "-5%", r: -25, s: 1.3 },
            { e: "🧇", top: "65%", left: "88%", r: 25, s: 1.4 },
            { e: "🍨", top: "85%", left: "5%", r: -10, s: 1.5 },
          ].map((sticker, i) => (
            <motion.div
              key={i}
              className="absolute select-none drop-shadow-md rounded-full bg-white/90 p-1 flex items-center justify-center"
              style={{
                left: sticker.left,
                top: sticker.top,
                rotate: `${sticker.r}deg`,
                scale: sticker.s,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.2 }}
            >
              <Twemoji
                emoji={sticker.e}
                className="w-5 h-5 object-contain select-none pointer-events-none"
              />
            </motion.div>
          ))}

          <div className="flex-1" />

          {/* Bottom Footer */}
          <div className="relative z-10 mt-4 flex w-full flex-col items-center justify-center gap-1">
            <p className="text-[14px] font-bold uppercase tracking-[0.1em] text-white/90 drop-shadow-sm">
              Tag to share your vibe
            </p>
            <div className="mt-1 rounded-full bg-black/20 px-4 py-2 text-[13px] font-bold tracking-widest text-white shadow-sm backdrop-blur-md border border-white/20">
              {INSTAGRAM_HANDLE}
            </div>
          </div>
        </div>
      </div>

      <p className="mb-2 mt-5 h-4 text-center text-[13px] font-medium text-muted-foreground transition-all duration-300">
        {hint || "Looks stunning! Save & Share 🍒"}
      </p>

      {/* Action Buttons */}
      <div className="mt-3 w-full max-w-[320px] space-y-3">
        <AnimatedButton
          variant="primary"
          fullWidth
          onClick={handleShare}
          className="h-14 rounded-2xl border border-white/10 text-[16px] shadow-pop"
          disabled={isSharing}
        >
          {isSharing ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}
          {isSharing ? "Generating Canvas..." : "Share to IG Story"}
        </AnimatedButton>

        <div className="grid grid-cols-2 gap-3">
          <AnimatedButton
            variant="cream"
            fullWidth
            onClick={handleCopy}
            className="h-12 rounded-xl text-[14px]"
          >
            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            {copied ? "Copied!" : "Copy @Handle"}
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
