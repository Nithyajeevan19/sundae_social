import { motion } from "framer-motion";
import { useState } from "react";
import { AnimatedButton } from "./AnimatedButton";

const CHIPS = ["Taste", "Service", "Wait time", "Cleanliness", "Pricing", "Other"];

export function FeedbackForm({ onSubmit }: { onSubmit: () => void }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [text, setText] = useState("");

  const toggle = (c: string) =>
    setPicked((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-card p-6 shadow-soft"
    >
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-soft-beige text-3xl">
          💛
        </div>
        <h3 className="mt-3 font-display text-2xl text-chocolate">We'd love to improve</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us what went wrong — this stays private.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {CHIPS.map((c) => {
          const active = picked.includes(c);
          return (
            <button
              key={c}
              onClick={() => toggle(c)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-primary text-primary-foreground shadow-pop"
                  : "bg-soft-beige text-chocolate"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Anything else you'd like us to know?"
        className="mt-4 w-full resize-none rounded-2xl border border-border bg-cream p-4 text-sm text-chocolate placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <div className="mt-4">
        <AnimatedButton variant="primary" fullWidth onClick={onSubmit}>
          Send feedback privately
        </AnimatedButton>
      </div>
    </motion.div>
  );
}
