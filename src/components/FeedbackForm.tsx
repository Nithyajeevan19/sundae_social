import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AnimatedButton } from "./AnimatedButton";
import { submitFeedback } from "@/lib/lead";

const CHIPS = ["Taste", "Service", "Wait time", "Cleanliness", "Pricing", "Other"];

interface Props {
  onSubmit: () => void;
  emotion: string | null;
  name?: string;
  phone?: string;
}

export function FeedbackForm({ onSubmit, emotion, name, phone }: Props) {
  const [picked, setPicked] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [emoji, setEmoji] = useState<string | null>(null);

  const toggle = (c: string) => {
    setPicked((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));
    if (hint) {
      setHint(null);
      setEmoji(null);
    }
  };

  const pulseError = (msg: string, e: string) => {
    setHint(msg);
    setEmoji(e);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async () => {
    if (picked.length === 0 && !text.trim()) {
      pulseError("Your feedback bowl is empty! Let us know how we can improve 🍨", "🥺");
      return;
    }

    setHint(null);
    setEmoji(null);
    setSubmitting(true);

    try {
      await submitFeedback({
        name,
        phone,
        emotion: emotion || "unknown",
        chips: picked,
        feedback: text.trim(),
      });

      toast.success("Feedback sent privately!", {
        description: "Thank you for helping us grow 💛",
      });

      onSubmit();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to save your feedback. Please try again.";
      toast.error("Couldn’t send feedback", { description: message });
      pulseError(message, "🍦");
    } finally {
      setSubmitting(false);
    }
  };

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

      <motion.div
        animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="mt-5 flex flex-wrap gap-2">
          {CHIPS.map((c) => {
            const active = picked.includes(c);
            return (
              <button
                key={c}
                disabled={submitting}
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
          disabled={submitting}
          onChange={(e) => {
            setText(e.target.value);
            if (hint) {
              setHint(null);
              setEmoji(null);
            }
          }}
          rows={4}
          placeholder="Anything else you'd like us to know?"
          className="mt-4 w-full resize-none rounded-2xl border border-border bg-cream p-4 text-sm text-chocolate placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </motion.div>

      <AnimatePresence>
        {hint && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 flex items-center justify-center gap-2 text-sm text-chocolate text-center"
          >
            <motion.span
              key={emoji ?? ""}
              initial={{ scale: 0.4, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-2xl"
            >
              {emoji}
            </motion.span>
            <span>{hint}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4">
        <AnimatedButton
          variant="primary"
          fullWidth
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Sending privately…
            </>
          ) : (
            <>Send feedback privately</>
          )}
        </AnimatedButton>
      </div>
    </motion.div>
  );
}
