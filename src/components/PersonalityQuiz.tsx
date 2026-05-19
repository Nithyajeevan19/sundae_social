import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { AnimatedButton } from "./AnimatedButton";
import { QuizResultCard, type QuizResult } from "./QuizResultCard";

interface Choice {
  label: string;
  emoji: string;
  tag: string;
}
interface Question {
  q: string;
  choices: Choice[];
}

const QUESTIONS: Question[] = [
  {
    q: "Choose your vibe",
    choices: [
      { label: "Chill", emoji: "😌", tag: "vanilla" },
      { label: "Party", emoji: "🎉", tag: "mix" },
      { label: "Romantic", emoji: "💕", tag: "strawberry" },
      { label: "Chaotic", emoji: "😂", tag: "chocolate" },
    ],
  },
  {
    q: "Pick a late-night activity",
    choices: [
      { label: "Movies", emoji: "🎬", tag: "vanilla" },
      { label: "Music", emoji: "🎧", tag: "mix" },
      { label: "Long drive", emoji: "🚗", tag: "strawberry" },
      { label: "Gaming", emoji: "🎮", tag: "chocolate" },
    ],
  },
  {
    q: "Choose a flavor mood",
    choices: [
      { label: "Chocolate", emoji: "🍫", tag: "chocolate" },
      { label: "Strawberry", emoji: "🍓", tag: "strawberry" },
      { label: "Vanilla", emoji: "🍦", tag: "vanilla" },
      { label: "Mix of everything", emoji: "🍨", tag: "mix" },
    ],
  },
];

const RESULTS: Record<string, QuizResult> = {
  chocolate: {
    title: "Chocolate Chaos",
    emoji: "🍫",
    description: "Fun, energetic, and impossible to ignore.",
    gradient: "bg-gradient-cocoa",
  },
  strawberry: {
    title: "Strawberry Dreamer",
    emoji: "🍓",
    description: "Soft-hearted, romantic, and effortlessly charming.",
    gradient: "bg-gradient-blush",
  },
  vanilla: {
    title: "Vanilla Classic",
    emoji: "🍦",
    description: "Calm, timeless, and quietly the favorite of everyone.",
    gradient: "bg-gradient-warm",
  },
  mix: {
    title: "Sprinkle Storm",
    emoji: "✨",
    description: "A little bit of everything — and all of it is iconic.",
    gradient: "bg-gradient-warm",
  },
};

export function PersonalityQuiz() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [tally, setTally] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);

  const pick = (tag: string) => {
    const next = { ...tally, [tag]: (tally[tag] || 0) + 1 };
    setTally(next);
    if (step + 1 >= QUESTIONS.length) setDone(true);
    else setStep(step + 1);
  };

  const restart = () => {
    setStarted(false);
    setStep(0);
    setTally({});
    setDone(false);
  };

  const result = (() => {
    const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "mix";
    return RESULTS[top] ?? RESULTS.mix;
  })();

  if (!started) {
    return (
      <div className="rounded-3xl bg-card p-6 text-center shadow-soft">
        <span className="text-4xl">🍨</span>
        <h3 className="mt-2 font-display text-2xl text-chocolate">
          Discover Your Sundae Personality
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          3 quick taps. One sweet truth about you.
        </p>
        <div className="mt-5">
          <AnimatedButton variant="primary" fullWidth onClick={() => setStarted(true)}>
            Start Quiz ✨
          </AnimatedButton>
        </div>
      </div>
    );
  }

  if (done) return <QuizResultCard result={result} onRestart={restart} />;

  const current = QUESTIONS[step];

  return (
    <div className="rounded-3xl bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>
          Question {step + 1} of {QUESTIONS.length}
        </span>
        <button onClick={restart} className="underline">
          Restart
        </button>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-soft-beige">
        <motion.div
          className="h-full bg-gradient-warm"
          animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="mt-5 font-display text-2xl text-chocolate">{current.q}</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {current.choices.map((c) => (
              <motion.button
                key={c.label}
                whileTap={{ scale: 0.95 }}
                whileHover={{ y: -2 }}
                onClick={() => pick(c.tag)}
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl bg-soft-beige p-4 text-chocolate shadow-pillow"
              >
                <span className="text-4xl">{c.emoji}</span>
                <span className="text-sm font-semibold">{c.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
